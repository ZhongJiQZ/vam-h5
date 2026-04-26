<!-- 充值申请 -->
<template>
  <div class="page-recharge-apply">
    <DarkHeaderBar
      :title="currentName"
      right="rechargeOrder"
      :border_bottom="true"
    />

    <div class="page-body">
      <div v-if="!isBankRecharge && !isChannelOnlyRecharge" class="qr-section">
        <div
          class="qr-bg"
          :style="{ backgroundImage: `url(${rechargeApplyBg})` }"
          aria-hidden="true"
        />
        <div class="qr-frame">
          <QRCode :address="address"></QRCode>
        </div>
      </div>

      <div class="applyMes" :class="{ 'applyMes--noqr': isBankRecharge || isChannelOnlyRecharge }">
        <template v-if="isBankRecharge && !isChannelOnlyRecharge">
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
        <div v-else-if="!isChannelOnlyRecharge" class="address">
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
          <div v-if="!isChannelOnlyRecharge" class="info-row">
            <p class="top">
              {{ isBankRecharge ? _t18('recharge_amount_usdt') : _t18('recharge_number', ['bitmake']) }}
            </p>
            <div class="bottom ff-num">{{ submitAmountDisplay }}</div>
          </div>
          <div v-else class="num">
            <p class="top">{{ _t18('recharge_number', ['bitmake']) }}</p>
            <div class="bottom">
              <input v-model="num" type="number" class="ff-num" :placeholder="_t18('recharge_input')" />
            </div>
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
      <template v-else-if="!isChannelOnlyRecharge">
        <div class="btn-wrap">
          <div class="btn btn--primary" @click="onIRecharged">
            <p>{{ _t18('recharge_i_paid') }}</p>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="btn-wrap">
          <div class="btn btn--primary" :class="{ 'btn--loading': submitting }" @click="submit">
            <p>
              <span v-if="submitting" class="btn-loading-spinner" aria-hidden="true"></span>
              {{ submitting ? _t18('recharge_submitting') : _t18('recharge_require', ['bitmake']) }}
            </p>
          </div>
        </div>
      </template>
    </div>

    <van-popup
      v-model:show="showPendingPopup"
      round
      closeable
      :close-on-click-overlay="false"
      class="status-popup"
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
      class="status-popup status-popup--small"
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
      class="status-popup status-popup--small"
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
import { getRechargeDetail, getRechargeList, rechargeSubmit } from '@/api/account.js'
import { _t18, _getConfig } from '@/utils/public'
import { priceFormat } from '@/utils/decimal'
import QRCode from '@/components/common/QRCode/index.vue'
import Copy from '@/components/common/Copy/index.vue'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import rechargeApplyBg from '@/assets/images/recharge-apply-bg.png'
import { useToast } from '@/hook/useToast'
import { useCopy } from '@/hook/useCopy'
import { useRouter, useRoute } from 'vue-router'
import { useMainStore } from '@/store'
import { dispatchCustomEvent } from '@/utils'
import { reactive, computed, ref, watch, onUnmounted } from 'vue'
import { normalizeRechargeAddressFromApi } from '@/utils/rechargeAddress'
import { formatLocalTime } from '@/utils/time'
import { debounce } from 'lodash'

const { _toast } = useToast()
const { _copy } = useCopy()
const route = useRoute()
const router = useRouter()

const currentName = `${_t18('recharge', ['latcoin'])} ${route.query.type}`

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
const num = ref('')
const submitting = ref(false)
const isChannelOnlyRecharge = computed(() => {
  const t = String(route.query?.type || '').toUpperCase()
  if (t === 'BANK') return true
  return Boolean(rechargeObj.value?.change && !rechargeObj.value?.bankCardNo)
})

const submit = debounce(() => {
  if (submitting.value) return
  const needAmount = true
  if (needAmount && num.value == '') {
    _toast('recharge_num')
    return
  }
  submitting.value = true
  const useAmount = Number(num.value)
  const params = {
    amount: priceFormat(useAmount),
    type: route.query.type,
    coin: route.query.coin,
    filePath: '',
    address: address.value || rechargeObj.value?.bankCardNo || ''
  }
  rechargeSubmit(params)
    .then((res) => {
      if (res.code == '200') {
        if (res?.data?.payUrl) {
          window.location.href = res.data.payUrl
          return
        }
        const nextQ = new URLSearchParams({
          ...route.query,
          amount: String(priceFormat(useAmount)),
          orderId: String(res?.data?.id || res?.data?.orderId || res?.data?.serialId || '')
        })
        router.replace(`/recharge-apply?${nextQ.toString()}`)
        onIRecharged()
      } else {
        _toast(res.msg || 'error')
      }
    })
    .finally(() => {
      submitting.value = false
    })
}, 500)

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
  mainStore.getRechargeList.find((elem) => elem.coinName == route.query.type)
)
const isBankRecharge = computed(() =>
  Boolean(rechargeObj.value?.bankCardNo && rechargeObj.value?.bankName)
)

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
  if (isBankRecharge.value) return rechargeObj.value?.coinAddress ?? ''
  const key = route.query.type
  const fromMap = key ? normalizeRechargeAddressFromApi(mainStore.userRechageMap[key], key) : ''
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

onUnmounted(() => {
  stopPolling()
})
</script>

<style lang="scss" scoped>
.page-recharge-apply {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.page-body {
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: #f0f2f5;
  
  padding-bottom: 28px;
  padding-top: 20px;
  box-sizing: border-box;
}

.qr-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px 100px;
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
}

.qr-frame {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding: 8px;
  border: 2px solid #17ac74;
  border-radius: 10px;
  background: #fff;
  box-sizing: content-box;
}

.page-recharge-apply :deep(.qr-frame .box .erweima) {
  border-color: transparent;
}

.applyMes {
  margin: -64px 15px 0;
  position: relative;
  z-index: 2;
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

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
    color: #969799;
    margin: 0 0 10px;
    line-height: 1.4;
  }

  .address .bottom {
    word-break: break-all;
    font-size: 15px;
    color: #323233;
  }

  .info-row .bottom {
    font-size: 15px;
    color: #323233;
    line-height: 1.45;
  }

  .fee-hints {
    margin: -4px 0 4px;
  }

  .fee-line {
    margin: 0 0 8px;
    font-size: 13px;
    color: #646566;
    line-height: 1.5;
  }
}

.btn-wrap {
  padding: 20px 15px 0;
}

.btn {
  p {
    margin: 0;
    text-align: center;
    padding: 14px 0;
    font-size: 16px;
    border-radius: 999px;
  }

  &--primary p {
    color: #fff;
    background: #05101a;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
}

.btn--loading {
  pointer-events: none;
  opacity: 0.92;
}

.btn-loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.38);
  border-top-color: #fff;
  border-radius: 50%;
  animation: btn-spin 0.7s linear infinite;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}

.tip-list {
  padding: 16px 15px 0;
  font-size: 14px;
  color: #646566;
  line-height: 1.5;

  .tip {
    margin-bottom: 12px;
  }
}

.status-popup {
  width: calc(100vw - 56px);
  max-width: 360px;
}

.status-popup--small {
  max-width: 320px;
}

.status-panel {
  padding: 18px 16px 20px;
}

.status-panel--center {
  text-align: center;
}

.status-title {
  margin: 0 0 14px;
  font-size: 20px;
  font-weight: 600;
  color: #323233;
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
  background: conic-gradient(#17ac74 var(--rate), #ececec 0);
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
  color: #323233;
}

.status-sub {
  margin: 0 0 14px;
  text-align: center;
  font-size: 14px;
  color: #646566;
}

.status-tipbox {
  margin-top: 14px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ebedf0;
  background: #fafafa;
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
}

.ok-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #17ac74 0%, #24c484 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(23, 172, 116, 0.28);
}

.status-btn {
  margin-top: 10px;
}

.status-success-detail {
  margin: 0 0 8px;
  padding: 10px 12px;
  border: 1px solid #ebedf0;
  border-radius: 10px;
  background: #fafafa;
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
  border-color: #dff3e8;
  background: linear-gradient(180deg, #f7fcf9 0%, #ffffff 100%);
}

.status-success-line {
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #646566;
  font-size: 13px;

  &:last-child {
    margin-bottom: 0;
  }

  span:last-child {
    font-weight: 600;
    color: #323233;
  }
}

.status-link {
  margin: 0 0 10px;
  text-align: center;
  color: #17ac74;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
