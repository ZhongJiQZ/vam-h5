<!-- 充值申请 -->
<template>
  <div class="page-recharge-apply">
    <header class="ra-header">
      <button type="button" class="ra-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="ra-header__back-icon" />
      </button>
      <h1 class="ra-header__title">{{ currentName }}</h1>
      <button type="button" class="ra-header__action" aria-label="recharge-order" @click="goRechargeOrder">
        <img :src="iconHistory" alt="" class="ra-header__action-icon" />
      </button>
    </header>

    <div class="page-body">
      <div v-if="!isBankRecharge" class="qr-section">
        <div
          class="qr-bg"
          :style="{ backgroundImage: `url(${rechargeApplyBg})` }"
          aria-hidden="true"
        />
        <div class="qr-frame">
          <QRCode :address="address"></QRCode>
        </div>
      </div>

      <div class="applyMes" :class="{ 'applyMes--noqr': isBankRecharge || isPayGatewayType }">
        <template v-if="isBankRecharge && !isPayGatewayType">
          <div class="info-row">
            <p class="top">{{ _t18('bank_name') }}</p>
            <div class="bottom">{{ rechargeObj?.bankName }}</div>
          </div>
          <div class="address">
            <p class="top">{{ _t18('Account_holder') }}</p>
            <div class="bottom">
              <Copy :data="rechargeObj?.bankUserName || ''" :fontSize="'16px'">
                <template #copyMsg>
                  <span class="fw-num">{{ rechargeObj?.bankUserName }}</span>
                </template>
              </Copy>
            </div>
          </div>
          <div class="address">
            <p class="top">{{ _t18('Bank_card_number') }}</p>
            <div class="bottom">
              <Copy :data="rechargeObj?.bankCardNo || ''" :fontSize="'16px'">
                <template #copyMsg>
                  <span class="fw-num">{{ rechargeObj?.bankCardNo }}</span>
                </template>
              </Copy>
            </div>
          </div>
        </template>
        <div v-else class="address">
          <p class="top">{{ _t18('recharge_address', ['bitmake']) }}({{ route.query.type }})</p>
          <div class="bottom">
            <Copy :data="address" :fontSize="'16px'">
              <template #copyMsg>
                <span class="fw-num">{{ address }}</span>
              </template>
            </Copy>
          </div>
        </div>
        <template
          v-if="
            isBankRecharge ||
            !['coinsexpto', 'rxce', 'gmtoin', 'aams', 'bitbyex', 'gmmoin'].includes(
              _getConfig('_APP_ENV')
            )
          "
        >
          <div class="info-row">
            <p class="top">
              {{ isBankRecharge ? _t18('recharge_amount_usdt') : _t18('recharge_number', ['bitmake']) }}
            </p>
            <div class="bottom ff-num">{{ submitAmountDisplay }}</div>
          </div>
          <div v-if="showFeeHints" class="fee-hints">
            <p class="fee-line">{{ _t18('withdraw_commission') }}: {{ feeRatioNum }}%</p>
            <p class="fee-line ff-num">100U {{ _t18('Actual_amount_received') }}: {{ hundredNetAmount }}</p>
          </div>
        </template>
      </div>

      <template
        v-if="
          !isBankRecharge &&
          ['coinsexpto', 'rxce', 'bitbyex', 'gmmoin'].includes(_getConfig('_APP_ENV'))
        "
      >
        <div class="btn-wrap">
          <div class="btn btn--primary" @click="_copy(address)">
            <p>{{ _t18('copy') }}</p>
          </div>
        </div>
        <div v-if="['bitbyex'].includes(_getConfig('_APP_ENV'))" class="tip-list">
          <div v-for="(item, index) in tipList2" :key="index" class="tip">
            {{ item.content }}
          </div>
        </div>
        <div v-else class="tip-list">
          <div v-for="(item, index) in tipList" :key="index" class="tip">
            {{ index + 1 }}.{{ item.content }}
          </div>
        </div>
      </template>
      <template v-else-if="!isBankRecharge && ['gmtoin'].includes(_getConfig('_APP_ENV'))">
        <div class="tip-list">
          <div class="tip">{{ _t18('account_balance_info') }}</div>
        </div>
      </template>
      <template
        v-else-if="!isBankRecharge && ['aams', 'gmmoin'].includes(_getConfig('_APP_ENV'))"
      ></template>
      <template v-else-if="isPayGatewayType">
        <div class="tip-list">
          <div class="tip">{{ _t18('recharge_submitting') }}</div>
        </div>
        <div class="btn-wrap">
          <div class="btn btn--primary" @click="tryRedirectPayGateway">
            <p>{{ _t18('recharge_require') }}</p>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="btn-wrap">
          <div class="btn btn--primary" @click="onIRecharged">
            <p>{{ _t18('recharge_i_paid') }}</p>
          </div>
        </div>
      </template>
    </div>

    <van-popup
      v-model:show="showPendingPopup"
      round
      closeable
      :close-on-click-overlay="false"
      class="recharge-apply-popup"
      :style="popupShellStyle"
      @close="onPendingClose"
    >
      <div class="status-panel">
        <h3 class="status-title">{{ _t18('recharge_waiting_confirm') }}</h3>
        <div class="progress-wrap">
          <div class="progress-ring" :style="{ '--rate': `${pendingPercent}%` }"></div>
          <p class="status-rate">{{ pendingPercent }}%</p>
        </div>
        <p class="status-sub">{{ _t18('recharge_usually_need') }} {{ remainMinute }} {{ _t18('minute') }}</p>
        <div class="status-tipbox">
          <p>{{ _t18('recharge_waiting_tip_1') }}</p>
          <p>{{ _t18('recharge_waiting_tip_2') }}</p>
          <p>{{ _t18('recharge_waiting_tip_3') }}</p>
        </div>
      </div>
    </van-popup>

    <van-popup
      v-model:show="showSuccessPopup"
      round
      :close-on-click-overlay="false"
      class="recharge-apply-popup recharge-apply-popup--small"
      :style="popupShellStyle"
    >
      <div class="status-panel status-panel--center">
        <div class="success-hero">
          <div class="ok-icon">✓</div>
          <h3 class="status-title success-title">{{ _t18('recharge_success') }}</h3>
          <p class="status-sub success-sub">{{ _t18('recharge_success_back_home') }}</p>
        </div>
        <div class="status-success-detail success-card">
          <p class="status-success-line">
            <span>{{ _t18('Actual_amount_received') }}</span>
            <span class="ff-num">{{ successReceivedDisplay }}</span>
          </p>
          <p class="status-success-line">
            <span>{{ _t18('Arrival_time') }}</span>
            <span class="ff-num">{{ successArriveTimeDisplay }}</span>
          </p>
        </div>
        <div class="btn btn--primary status-btn" @click="goHome">
          <p>{{ _t18('back_home') }}</p>
        </div>
      </div>
    </van-popup>

    <van-popup
      v-model:show="showTimeoutPopup"
      round
      :close-on-click-overlay="false"
      class="recharge-apply-popup recharge-apply-popup--small"
      :style="popupShellStyle"
    >
      <div class="status-panel status-panel--center">
        <h3 class="status-title">{{ _t18('recharge_timeout_title') }}</h3>
        <p class="status-sub">{{ _t18('recharge_timeout_desc') }}</p>
        <p class="status-link" @click="contactService">{{ _t18('custorm_service') }}</p>
        <div class="btn btn--primary status-btn" @click="goHome">
          <p>{{ _t18('back_home') }}</p>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { getRechargeDetail, getRechargeList } from '@/api/account.js'
import { _t18, _getConfig, _back } from '@/utils/public'
import { priceFormat } from '@/utils/decimal'
import QRCode from '@/components/common/QRCode/index.vue'
import Copy from '@/components/common/Copy/index.vue'
import rechargeApplyBg from '@/assets/images/recharge-apply-bg.png'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconHistory from '@/assets/images/gxpex/loan/icon-history.svg'
import { useToast } from '@/hook/useToast'
import { useCopy } from '@/hook/useCopy'
import { useRouter, useRoute } from 'vue-router'
import { useMainStore } from '@/store'
import { dispatchCustomEvent } from '@/utils'
import { reactive, computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { findRechargeListItem } from '@/utils/coinNetworkType'
import { isPayGatewayRechargeType, normalizeRechargeType } from '@/utils/rechargeType'
import { getRechargeAddressFromMap } from '@/utils/rechargeAddress'
import { formatLocalTime } from '@/utils/time'

const { _toast } = useToast()
const { _copy } = useCopy()
const route = useRoute()
const router = useRouter()

const currentName = `${_t18('recharge', ['latcoin'])} ${route.query.type}`

const popupShellStyle = {
  background: 'transparent',
  overflow: 'visible'
}

const goRechargeOrder = () => {
  router.push('/recharge-order')
}

const tipList = reactive([
  { content: _t18('recharge_tip1') },
  { content: _t18('recharge_tip2') },
  { content: _t18('recharge_tip3') },
  { content: _t18('recharge_tip4') }
])
const tipList2 = reactive([{ content: _t18('recharge_tip5') }])
const submitAmount = computed(() => {
  const n = Number(route.query.amount)
  return Number.isFinite(n) && n > 0 ? n : 0
})

const submitAmountDisplay = computed(() => {
  const suffix = route.query?.coin?.toString().toUpperCase() || ''
  return `${priceFormat(submitAmount.value)}${suffix ? ` ${suffix}` : ''}`
})

const queryOrderId = computed(() => String(route.query.orderId || '').trim())
const showPendingPopup = ref(false)
const showSuccessPopup = ref(false)
const showTimeoutPopup = ref(false)
const successReceived = ref('')
const successArriveTime = ref('')
const elapsedSeconds = ref(0)
const polling = ref(false)
let pollingTimer = null

const pendingPercent = computed(() => Math.min(100, Math.floor((elapsedSeconds.value / 180) * 100)))
const remainMinute = computed(() => Math.max(1, Math.ceil((180 - elapsedSeconds.value) / 60)))

const stopPolling = () => {
  polling.value = false
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

const resolveByListFallback = async () => {
  const res = await getRechargeList('pageNum=1&pageSize=10')
  if (res.code != '200' && res.code != 200) return null
  const rows = res.rows || []
  const wantType = String(route.query.type || '').toUpperCase()
  const wantAmount = Number(submitAmount.value)
  return (
    rows.find((item) => {
      const typeMatch = String(item?.type || '').toUpperCase() === wantType
      const amt = Number(item?.amount)
      const amountMatch = Number.isFinite(amt) && Number.isFinite(wantAmount) ? Math.abs(amt - wantAmount) < 1e-8 : true
      return typeMatch && amountMatch
    }) || rows[0] || null
  )
}

const fetchOrderStatus = async () => {
  if (queryOrderId.value) {
    const detailRes = await getRechargeDetail(queryOrderId.value)
    if (detailRes.code == '200' || detailRes.code == 200) {
      return detailRes.data || null
    }
  }
  return resolveByListFallback()
}

const onPendingClose = () => {
  stopPolling()
  showPendingPopup.value = false
}

const onPollingTimeout = () => {
  stopPolling()
  showPendingPopup.value = false
  showTimeoutPopup.value = true
}

const onIRecharged = async () => {
  if (submitAmount.value <= 0) {
    _toast('recharge_num')
    router.push(`/recharge-amount?type=${route.query.type || ''}&coin=${route.query.coin || ''}`)
    return
  }
  if (polling.value) return
  showTimeoutPopup.value = false
  showSuccessPopup.value = false
  showPendingPopup.value = true
  elapsedSeconds.value = 0
  polling.value = true

  const checkOnce = async () => {
    if (!polling.value) return
    const order = await fetchOrderStatus()
    const status = Number(order?.status)
    if (status === 1) {
      const receivedRaw = order?.realAmount ?? order?.amount ?? order?.params?.amount ?? ''
      successReceived.value = receivedRaw
      const tRaw = order?.params?.createTime ?? order?.createTime ?? order?.updateTime ?? ''
      successArriveTime.value = tRaw
      stopPolling()
      showPendingPopup.value = false
      showSuccessPopup.value = true
      return
    }
    if (status === 2) {
      onPollingTimeout()
    }
  }

  await checkOnce()
  pollingTimer = setInterval(async () => {
    if (!polling.value) return
    elapsedSeconds.value += 2
    if (elapsedSeconds.value >= 180) {
      onPollingTimeout()
      return
    }
    await checkOnce()
  }, 2000)
}

const goHome = () => {
  showSuccessPopup.value = false
  showTimeoutPopup.value = false
  router.push('/')
}

const contactService = () => {
  dispatchCustomEvent('event_serviceChange')
}

const mainStore = useMainStore()

const rechargeObj = computed(() =>
  findRechargeListItem(mainStore.getRechargeList, route.query.type)
)

const rechargeTypeUpper = computed(() => normalizeRechargeType(route.query.type))
/** 三方支付通道（BANK-GC、BANK-MAYA 等）：跳转 payUrl */
const isPayGatewayType = computed(() => isPayGatewayRechargeType(route.query.type))

const isBankRecharge = computed(
  () =>
    Boolean(rechargeObj.value?.bankCardNo && rechargeObj.value?.bankName) &&
    !isPayGatewayType.value
)

function redirectToPayUrl(url) {
  const target = String(url || '').trim()
  if (!target) return false
  window.location.href = target
  return true
}

async function tryRedirectPayGateway() {
  if (!isPayGatewayType.value) return
  if (redirectToPayUrl(route.query.payUrl)) return
  if (!queryOrderId.value) return
  try {
    const order = await fetchOrderStatus()
    redirectToPayUrl(order?.payUrl ?? order?.params?.payUrl)
  } catch {
    /* ignore */
  }
}

function ensureUserRechargeAddresses() {
  if (isBankRecharge.value) return
  mainStore.getUserRechageNew()
}

watch(
  [() => route.query.coin, () => route.query.type, isBankRecharge],
  ensureUserRechargeAddresses,
  { immediate: true }
)

watch(showPendingPopup, (visible) => {
  if (!visible) {
    stopPolling()
  }
})

const address = computed(() => {
  // let addr = ''
  // addr = rechargeObj.value?.coinAddress ?? ''
  // if(!addr){
  //    const key = rechargeObj.value?.coinName || route.query.type
  //  addr = key ? getRechargeAddressFromMap(mainStore.userRechageMap, key) : ''
  // }
  // return addr
  if (isBankRecharge.value) return rechargeObj.value?.coinAddress ?? ''

  const key = rechargeObj.value?.coinName || route.query.type
  const fromMap = key ? getRechargeAddressFromMap(mainStore.userRechageMap, key) : ''
  return fromMap || rechargeObj.value?.coinAddress || ''
})

const feeRatioNum = computed(() => {
  const n = Number(rechargeObj.value?.rechargeFeeRatio)
  return Number.isFinite(n) && n > 0 ? n : 0
})
const showFeeHints = computed(() => feeRatioNum.value > 0)
const hundredNetAmount = computed(() => {
  const net = 100 * (1 - feeRatioNum.value / 100)
  return `${priceFormat(net)} U`
})
const successReceivedDisplay = computed(() => {
  if (successReceived.value === '' || successReceived.value == null) return '--'
  const suffix = route.query?.coin?.toString().toUpperCase() || ''
  const n = Number(successReceived.value)
  let amountText = priceFormat(successReceived.value)
  if (Number.isFinite(n) && suffix === 'USDT') {
    amountText = n.toFixed(2)
  }
  return `${amountText}${suffix ? ` ${suffix}` : ''}`
})
const successArriveTimeDisplay = computed(() => {
  if (!successArriveTime.value) return '--'
  return formatLocalTime(successArriveTime.value)
})

onMounted(() => {
  tryRedirectPayGateway()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style lang="scss" scoped>
.page-recharge-apply {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

.ra-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.ra-header__back {
  position: absolute;
  left: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.ra-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.ra-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60vw;
}

.ra-header__action {
  position: absolute;
  right: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.ra-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.page-body {
  background: transparent;
  padding: 16px 14px 28px;
  box-sizing: border-box;
}

.qr-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px 88px;
  overflow: hidden;
}

.qr-bg {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(100%, 360px);
  height: 220px;
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: contain;
  pointer-events: none;
  z-index: 0;
  opacity: 0.35;
}

.qr-frame {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding: 8px;
  border: 2px solid rgba(160, 65, 237, 0.65);
  border-radius: 12px;
  background: #fff;
  box-sizing: content-box;
  box-shadow: 0 8px 24px rgba(127, 43, 218, 0.25);
}

.page-recharge-apply :deep(.qr-frame .box .erweima) {
  border-color: transparent;
}

.applyMes {
  margin: -52px 0 0;
  position: relative;
  z-index: 2;
  background: rgba(30, 21, 48, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

  &--noqr {
    margin-top: 0;
  }

  & > div {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .top {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
    margin: 0 0 10px;
    line-height: 1.4;
  }

  .address .bottom {
    word-break: break-all;
    font-size: 15px;
    color: #fff;
  }

  .info-row .bottom {
    font-size: 15px;
    color: #fff;
    line-height: 1.45;
  }

  .fee-hints {
    margin: -4px 0 4px;
  }

  .fee-line {
    margin: 0 0 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.5;
  }
}

.btn-wrap {
  padding: 20px 0 0;
}

.btn {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  p {
    margin: 0;
    text-align: center;
    padding: 14px 0;
    font-size: 15px;
    border-radius: 999px;
  }

  &--primary p {
    color: #fff;
    font-weight: 500;
    background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
    box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35);
  }
}

.tip-list {
  padding: 16px 4px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.55;

  .tip {
    margin-bottom: 12px;
  }
}

.recharge-apply-popup {
  width: calc(100vw - 56px);
  max-width: 360px;
}

.recharge-apply-popup--small {
  max-width: 320px;
}

.status-panel {
  padding: 18px 16px 20px;
  background: rgb(34, 28, 49);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  color: #f5f3f8;
}

.status-panel--center {
  text-align: center;
}

.status-title {
  margin: 0 0 14px;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.progress-wrap {
  width: 88px;
  height: 88px;
  margin: 0 auto 12px;
  position: relative;
}

.progress-ring {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: conic-gradient(rgb(160, 65, 237) var(--rate), rgba(255, 255, 255, 0.12) 0);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 8px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 8px));
}

.status-rate {
  margin: 0;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.status-sub {
  margin: 0 0 14px;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
}

.status-tipbox {
  margin-top: 14px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(160, 65, 237, 0.28);
  background: rgba(160, 65, 237, 0.08);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
}

.ok-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(127, 43, 218, 0.35);
}

.status-btn {
  margin-top: 10px;
}

.status-success-detail {
  margin: 0 0 8px;
  padding: 10px 12px;
  border: 1px solid rgba(160, 65, 237, 0.28);
  border-radius: 10px;
  background: rgba(160, 65, 237, 0.08);
}

.success-hero {
  margin-bottom: 10px;
}

.success-title {
  margin-bottom: 8px;
}

.success-sub {
  margin-bottom: 12px;
}

.success-card {
  border-color: rgba(160, 65, 237, 0.35);
  background: rgba(160, 65, 237, 0.1);
}

.status-success-line {
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;

  &:last-child {
    margin-bottom: 0;
  }

  span:last-child {
    font-weight: 600;
    color: #fff;
  }
}

.status-link {
  margin: 0 0 10px;
  text-align: center;
  color: rgb(196, 124, 255);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}
</style>

<style lang="scss">
.recharge-apply-popup.van-popup {
  background: transparent !important;
  overflow: visible;
}

.recharge-apply-popup .van-popup__close-icon {
  color: rgba(255, 255, 255, 0.75);
}
</style>
