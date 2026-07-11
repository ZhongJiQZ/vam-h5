<!-- 充值申请 -->
<template>
  <div class="page-recharge-apply">
    <DarkHeaderBar
      :title="currentName"
      right="rechargeOrder"
      :border_bottom="true"
    />

    <div class="page-body">
      <div v-if="showQrSection" class="qr-section">
        <div
          class="qr-bg"
          :style="{ backgroundImage: `url(${rechargeApplyBg})` }"
          aria-hidden="true"
        />
        <div class="qr-frame">
          <QRCode :address="qrPayContent"></QRCode>
        </div>
        <p v-if="isThirdPartyQrPay" class="qr-tip">{{ _t18('recharge_scan_qr_pay') }}</p>
      </div>

      <div class="applyMes" :class="{ 'applyMes--noqr': !showQrSection }">
        <template v-if="isBankRecharge">
          <div class="info-row">
            <p class="top">{{ _t18('bank_name') }}</p>
            <div class="bottom">
              <Copy :data="rechargeObj?.bankName || ''" :fontSize="'16px'">
                <template #copyMsg>
                  <span>{{ rechargeObj?.bankName }}</span>
                </template>
              </Copy>
            </div>
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
          <div class="info-row">
            <p class="top">{{ _t18('recharge_coin') }}</p>
            <div class="bottom">
              <Copy :data="rechargeObj?.fiatCurrency || ''" :fontSize="'16px'">
                <template #copyMsg>
                  <span class="fw-num">{{ rechargeObj?.fiatCurrency }}</span>
                </template>
              </Copy>
            </div>
          </div>
        </template>
        <div v-else-if="!isThirdPartyQrPay" class="address">
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
            isThirdPartyQrPay ||
            !['coinsexpto', 'rxce', 'gmtoin', 'aams', 'bitbyex', 'gmmoin'].includes(
              _getConfig('_APP_ENV')
            )
          "
        >
          <div class="info-row">
            <p class="top">
              {{
                isBankRecharge || isThirdPartyQrPay
                  ? _t18('recharge_amount_usdt')
                  : _t18('recharge_number', ['bitmake'])
              }}
            </p>
            <div class="bottom ff-num">{{ submitAmountDisplay }}</div>
          </div>
          <div v-if="showBankFiat" class="fiat-pay-hero">
            <p class="fiat-pay-hero__label">{{ _t18('recharge_fiat_transfer') }}</p>
            <div class="fiat-pay-hero__amount">
              <Copy :data="String(estimatedFiatAmountRaw)" :fontSize="'22px'">
                <template #copyMsg>
                  <span class="ff-num fiat-pay-hero__value">{{ estimatedFiatPayment }}</span>
                </template>
              </Copy>
            </div>
            <p v-if="showFeeHints" class="fiat-pay-hero__sub ff-num">
              {{ _t18('withdraw_commission') }}: {{ feeRatioNum }}% ·
              {{ _t18('Actual_amount_received') }}: {{ netUsdtReceived }}
            </p>
          </div>
          <div v-if="showFeeHints && !showBankFiat" class="fee-hints">
            <p class="fee-line">{{ _t18('withdraw_commission') }}: {{ feeRatioNum }}%</p>
            <p class="fee-line ff-num">100U {{ _t18('Actual_amount_received') }}: {{ hundredNetAmount }}</p>
          </div>
          <div v-if="isBankRecharge" class="upload-proof">
            <p class="top">{{ _t18('recharge_imgUpload', ['bitmake']) }}</p>
            <van-uploader
              v-model="fileList"
              :max-count="1"
              accept="image/*"
              :after-read="afterRead"
            />
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
      <template v-else>
        <div v-if="isThirdPartyQrPay" class="btn-wrap">
          <div class="btn btn--primary" @click="onIRecharged()">
            <p>{{ _t18('recharge_i_paid') }}</p>
          </div>
        </div>
        <div v-else class="btn-wrap">
          <div class="btn btn--primary" @click="isBankRecharge ? submitManualBank() : onIRecharged()">
            <p>
              {{
                isBankRecharge
                  ? _t18('recharge_require', ['bitmake'])
                  : _t18('recharge_i_paid')
              }}
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
import { uploadImg } from '@/api/common/index.js'
import { _t18, _getConfig, _numberWithCommas } from '@/utils/public'
import { priceFormat } from '@/utils/decimal'
import QRCode from '@/components/common/QRCode/index.vue'
import Copy from '@/components/common/Copy/index.vue'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import rechargeApplyBg from '@/assets/images/recharge-apply-bg.png'
import { useToast } from '@/hook/useToast'
import { useCopy } from '@/hook/useCopy'
import { useRouter, useRoute } from 'vue-router'
import { useMainStore } from '@/store'
import { useAccountStore } from '@/store/account'
import { dispatchCustomEvent } from '@/utils'
import { reactive, computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { findRechargeListItem } from '@/utils/coinNetworkType'
import { getRechargeAddressFromMap } from '@/utils/rechargeAddress'
import { formatLocalTime } from '@/utils/time'
import {
  cacheThirdPartyPayPayload,
  consumeThirdPartyPayPayload,
  getRechargePayMode,
  isManualBankRecharge,
  resolveRechargePayAction
} from '@/utils/rechargeChannel'

const { _toast } = useToast()
const { _copy } = useCopy()
const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()
const accountStore = useAccountStore()

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
const fileList = ref([])
const submitting = ref(false)
const thirdPartyPayPayload = ref(consumeThirdPartyPayPayload())
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

const rechargeList = computed(() =>
  accountStore.rechangeCoinList.length
    ? accountStore.rechangeCoinList
    : mainStore.getRechargeList
)
const rechargeObj = computed(() =>
  findRechargeListItem(rechargeList.value, route.query.type)
)

const isBankRecharge = computed(() => isManualBankRecharge(rechargeObj.value))

const isThirdPartyQrPay = computed(() => Boolean(thirdPartyPayPayload.value?.payQr))

const showQrSection = computed(() => {
  if (isThirdPartyQrPay.value) return true
  return !isBankRecharge.value && Boolean(address.value)
})

const qrPayContent = computed(() => {
  if (isThirdPartyQrPay.value) {
    return String(thirdPartyPayPayload.value?.payQr || '').trim()
  }
  return address.value
})

const afterRead = async (file) => {
  file.status = 'uploading'
  const formData = new FormData()
  formData.append('file', file.file)
  try {
    const uploadResponse = await uploadImg(formData)
    const result = uploadResponse?.data
    if (result?.code == '200' || result?.code == 200) {
      file.res = result?.data?.url || ''
      file.status = 'success'
      return
    }
    fileList.value = []
    _toast(result?.msg || 'error')
  } catch (error) {
    fileList.value = []
    _toast(error?.response?.data?.msg || error?.message || 'error')
  }
}

const submitManualBank = async () => {
  if (submitting.value) return
  if (submitAmount.value <= 0) {
    _toast('recharge_num')
    return
  }
  const proof = fileList.value[0]
  if (!proof) {
    _toast('recharge_img')
    return
  }
  if (proof.status !== 'success' || !proof.res) {
    _toast('recharge_img_load')
    return
  }

  submitting.value = true
  try {
    const res = await rechargeSubmit({
      type: route.query.type,
      coin: route.query.coin,
      amount: priceFormat(submitAmount.value),
      filePath: proof.res,
      address: ''
    })
    if (res.code != '200' && res.code != 200) {
      _toast(res.msg || 'error')
      return
    }
    const payAction = resolveRechargePayAction(res)
    if (payAction.type === 'url') {
      window.location.href = payAction.value
      return
    }
    if (payAction.type === 'qrcode') {
      const responseData = res?.data?.data ?? res?.data ?? {}
      thirdPartyPayPayload.value = {
        payQr: payAction.value,
        orderId: responseData.orderId ?? responseData.id ?? queryOrderId.value,
        payDataType: payAction.payDataType
      }
      cacheThirdPartyPayPayload(thirdPartyPayPayload.value)
      onIRecharged()
      return
    }
    if (getRechargePayMode(res) === 'MANUAL_BANK') {
      _toast('recharge_waiting')
      setTimeout(() => router.replace('/recharge-order'), 500)
      return
    }
    _toast('recharge_success')
    setTimeout(() => router.replace('/recharge-order'), 500)
  } catch (error) {
    _toast(error?.response?.data?.msg || error?.message || 'error')
  } finally {
    submitting.value = false
  }
}

function ensureUserRechargeAddresses() {
  if (isBankRecharge.value) return
  mainStore.getUserRechageNew()
}

watch(
  [() => route.query.coin, () => route.query.type, isBankRecharge],
  () => {
    accountStore.getRechangeCoinList().catch(() => {})
    ensureUserRechargeAddresses()
  },
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
const fiatRateNum = computed(() => {
  const n = Number(rechargeObj.value?.fiatPerUsdt)
  return Number.isFinite(n) && n > 0 ? n : null
})
const fiatCurrency = computed(() =>
  String(rechargeObj.value?.fiatCurrency || 'Rp').toUpperCase()
)
const showBankFiat = computed(
  () =>
    (isBankRecharge.value || isThirdPartyQrPay.value) &&
    fiatRateNum.value != null &&
    submitAmount.value > 0
)
const estimatedFiatAmountRaw = computed(() => {
  if (!showBankFiat.value) return ''
  return Math.round(submitAmount.value * fiatRateNum.value)
})
const estimatedFiatPayment = computed(() => {
  if (estimatedFiatAmountRaw.value === '' || estimatedFiatAmountRaw.value == null) return ''
  return `${fiatCurrency.value} ${_numberWithCommas(estimatedFiatAmountRaw.value)}`
})
const netUsdtReceived = computed(() => {
  if ((!isBankRecharge.value && !isThirdPartyQrPay.value) || submitAmount.value <= 0) return ''
  const net = submitAmount.value * (1 - feeRatioNum.value / 100)
  return `${priceFormat(Math.max(net, 0))} USDT`
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
  if (isThirdPartyQrPay.value && queryOrderId.value) {
    onIRecharged()
  }
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

.qr-tip {
  position: relative;
  z-index: 1;
  margin: 14px 0 0;
  text-align: center;
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
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

  .fiat-pay-hero {
    margin: 4px 0 16px;
    padding: 16px 12px;
    border-radius: 12px;
    background: #ecf9f1;
    border: 1px solid #17ac74;
    text-align: center;
  }

  .fiat-pay-hero__label {
    margin: 0 0 8px;
    font-size: 13px;
    color: #646566;
  }

  .fiat-pay-hero__amount {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .fiat-pay-hero__value {
    font-size: 28px;
    font-weight: 700;
    color: #17ac74;
    line-height: 1.2;
  }

  .fiat-pay-hero__sub {
    margin: 10px 0 0;
    font-size: 12px;
    color: #969799;
    line-height: 1.5;
  }

  .fee-line {
    margin: 0 0 8px;
    font-size: 13px;
    color: #646566;
    line-height: 1.5;
  }

  .upload-proof {
    :deep(.van-uploader__upload),
    :deep(.van-uploader__preview-image) {
      width: 92px;
      height: 92px;
      border-radius: 8px;
    }
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
