<!-- 提现申请 -->
<template>
  <div class="page-withdraw-apply">
    <header class="wa-header">
      <button type="button" class="wa-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="wa-header__back-icon" />
      </button>
      <h1 class="wa-header__title">{{ currentName }}</h1>
      <button type="button" class="wa-header__action" aria-label="order" @click="goWithdrawOrder">
        <img :src="iconRechargeOrder" alt="" class="wa-header__action-icon" />
      </button>
    </header>

    <van-action-sheet v-model:show="showSheet" :closeable="false"
      style="max-width: var(--ex-max-width); left: 50%; translate: -50%">
      <div class="sheet-box">
        <div class="sheet-title fw-bold">{{ _t18('withdraw_select_card') }}</div>
        <div v-for="(item, index) in bankList" :key="index" class="sheet-row" @click="selectSheet(item)">
          <svg-load :name="route.query.icon" class="sheet-coin" />
          <div>
            <p class="sheet-bank-name">
              {{ item?.bankName }}
              <span v-if="item?.coin" class="sheet-coin-tag">（{{ item?.coin }}）</span>
            </p>
            <p class="sheet-card-num fw-num">{{ hideBank(item?.cardNumber) }}</p>
          </div>
        </div>
      </div>
    </van-action-sheet>

    <div class="page-body">
      <div class="card card-asset">
        <div v-if="route.query.icon != 'card'" class="currency-row">
          <svg-load :name="route.query.icon" class="coin-icon" />
          <div class="currency-main">
            <span class="coin-code">{{ route.query.type }}</span>
            <span class="coin-label">{{ _t18('withdraw_coin', ['bitmake']) }}</span>
          </div>
        </div>
        <div v-if="route.query.icon == 'card'" class="currency-row currency-row--bank" @click="showSheet = true">
          <svg-load :name="route.query.icon" class="coin-icon" />
          <div class="bank-preview">
            <p class="bank-name">{{ curBank?.bankName }}</p>
            <p class="card-line fw-num">
              {{ hideBank(curBank?.cardNumber || '') }}
              <span class="bank-chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </span>
            </p>
          </div>
        </div>
        <div class="balance-row">
          <p class="balance-val ff-num">{{ priceFormat(amount) }}</p>
          <span v-if="balanceCoinLabel" class="balance-unit-pill">{{ balanceCoinLabel }}</span>
        </div>
      </div>

      <div class="card card-form">
        <div class="field">
          <div class="field-label">{{ _t18('withdraw_num', ['bitmake']) }}</div>
          <div class="field-box field-box--split">
            <input v-model="allAmount" type="number" class="field-input ff-num" :placeholder="_t18('withdraw_input')"
              @input="onWithdrawAmountInput" />
            <span class="link-all" @click="allNum">{{ _t18('swap_all') }}</span>
          </div>
        </div>

        <div v-if="showFiatHints" class="fiat-hints">
          <p v-if="fiatFeeLineText" class="fiat-fee-line">{{ fiatFeeLineText }}</p>
          <p class="fiat-rate-line">{{ fiatRateText }}</p>
          <p v-if="fiatEstimateDisplay" class="fiat-estimate">
            <span class="fiat-est-label">{{ _t18('withdraw_fiat_estimate') }}</span>
            <span class="fiat-est-val ff-num">{{ fiatEstimateDisplay }}</span>
          </p>
        </div>

        <div v-if="route.query.icon != 'card'" class="field">
          <div class="field-label">{{ _t18('withdraw_address') }}</div>
          <div class="field-box">
            <input v-model="address" type="text" class="field-input" :placeholder="_t18('withdraw_input')" />
          </div>
        </div>

        <div class="field">
          <div class="field-label">{{ _t18('withdraw_pwd', ['rxce']) }}</div>
          <div class="field-box field-box--split">
            <input v-model="password" class="field-input" :type="showk ? 'text' : 'password'"
              :placeholder="_t18('withdraw_input')" />
            <span class="eye-icon" @click.stop="showk = !showk" aria-hidden="true">
              <svg v-if="showk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </span>
          </div>
        </div>

        <div v-if="!['aams'].includes(_getConfig('_APP_ENV'))" class="tip-block">
          <div class="tips-card">
            <div v-if="ENABLE_WITHDRAW_LIMIT_HINT && hasWithdrawLimit" class="tips-row">
              <span class="tips-label">{{ _t18('withdraw_limit_range') }}</span>
              <span class="tips-value ff-num">{{ withdrawLimitRangeText }}</span>
            </div>
            <div class="tips-row">
              <span class="tips-label">{{ _t18('withdraw_commission') }}</span>
              <span class="tips-value tips-value--warn ff-num">{{ withdrawFeeDisplay }}</span>
            </div>
          </div>
          <div class="tip-line">
            <div class="tip-text">
              {{ route.query.icon == 'card' ? _t18('withdraw_tip_card') : _t18('withdraw_tip_coin') }}
              <span class="tip-q" @click="showTipDialog()" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
            </div>
            <!-- <div class="tip-service-row">
              <span class="tip-service" @click="dispatchCustomEvent('event_serviceChange')">{{ _t18('custorm_service') }}</span>
              <van-icon @click="showTipDialog()" name="question-o" color="var(--ex-primary-color)" />
            </div> -->
          </div>
        </div>
      </div>
      <!-- <van-dialog v-model:show="showTip" title="温馨提示" confirm-button-text="确定" cancel-button-text="取消">
        <div class="tip-content">
          <div class="tip-title">{{ _t18('withdraw_tip') }}</div>
          <div class="tip-text">{{ _t18('withdraw_tip_content') }}</div>
        </div>
      </van-dialog> -->
      <div class="btn-wrap" @click="submit">
        <ButtonBar :btnValue="_t18('withdraw_require')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { dispatchCustomEvent } from '@/utils'
import { DIFF_ISFREEZE, DIFF_WITHDRAW } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'

const { _isFreeze } = useFreeze()
import {
  getBindCardList,
  getCacheStatus,
  saveCacheAddress,
  withdrawSubmit
} from '@/api/account.js'
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconRechargeOrder from '@/assets/images/gxpex/loan/icon-history.svg'
import { priceFormat } from '@/utils/decimal.js'
import { showToast, showDialog } from 'vant'
import { useUserStore } from '@/store/user/index'
import { useMainStore } from '@/store'
import { storeToRefs } from 'pinia'
import { _t18, _back, _getConfig, _numberWithCommas } from '@/utils/public'
import { useToast } from '@/hook/useToast'
import { filterCoin2 } from '@/utils/public'
import {
  COIN_ADDRESS_LENGTH_SAMPLES,
  findWithdrawChannelItem,
  getExpectedAddressLength
} from '@/utils/coinNetworkType'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const showTip = ref(false)
const { t } = useI18n()
const { _toast } = useToast()
const mainStore = useMainStore()
const userStore = useUserStore()
userStore.getUserInfo()
// 用户信息
const { userInfo } = storeToRefs(userStore)
// 用户余额信息
const { asset } = storeToRefs(userStore)
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const currentName = _t18('withdraw', ['latcoin'])
// Toggle this to true when withdrawal limit hint is needed again.
const ENABLE_WITHDRAW_LIMIT_HINT = false
const showk = ref(false)
// 银行卡数据
const curBank = ref({})
const showSheet = ref(false)
const selectSheet = (item) => {
  showSheet.value = false
  curBank.value = item
}


const showTipDialog = () => {
  showDialog({
    title: t('kind_tips'),
    message: route.query.icon == 'card' ? t('withdraw_tip_content_card') : t('withdraw_tip_content_coin'),
    className: 'wa-tip-dialog',
    confirmButtonText: t('btnConfirm', ['bitmake']) || t('utils.confirm'),
    width: '320px'
  }).then(() => {
    // on close
  })
}

const balanceCoinLabel = computed(() => {
  if (route.query.icon === 'card' && curBank.value?.coin) {
    return curBank.value.coin
  }
  return (route.query.type || '')?.toString() || ''
})
const currentWithdrawConfig = computed(() =>
  findWithdrawChannelItem(mainStore.getWithdrawList || [], route.query.type)
)

const amount = computed(() => {
  let data = 0
  //银行卡提现--> 显示对应币种资产 无则默认显示 usdt资产
  const index = route.query?.icon == 'card' && asset.value.findIndex(item => filterCoin2(item.symbol) == curBank.value.coin?.toLowerCase())

  //查询余额
  for (let i = 0; i < asset.value.length; i++) {
    // 银行卡提现
    if (route.query?.icon == 'card') {

      if (
        asset.value[i].type == 1 &&
        filterCoin2(asset.value[i].symbol) == (index != -1 ? curBank.value.coin?.toLowerCase() : 'usdt')
      ) {
        data = asset.value[i].availableAmount
        route.query.type = (index != -1 ? curBank.value.coin : 'USDT')
      }

    } else {
      // 币种提现
      if (asset.value[i].type == 1 && filterCoin2(asset.value[i].symbol) == route.query?.icon) {
        data = asset.value[i].availableAmount
      }
    }
  }
  return data
})

const hideBank = (item) => {
  if (!item || String(item).length < 8) return item || ''
  const str1 = String(item).substring(0, 4)
  const str2 = String(item).substring(String(item).length - 4)
  return str1 + ' *** *** ' + str2
}

const bankList = ref([])
const getCardList = async () => {
  const res = await getBindCardList()
  if (res.code == '200') {
    if (res.data.length > 0) {
      bankList.value = res.data
      curBank.value = bankList.value[0]
    } else {
      // showToast('请先绑定银行卡')
      _toast('Unbound_bank_card')
      setTimeout(() => {
        router.push('/bind-card')
      }, 1000)
    }
  }
}
const allAmount = ref('')
const showFiatHints = computed(
  () => route.query.icon === 'card' && route.query.fiatPerUsdt != null && route.query.fiatPerUsdt !== ''
)
const fiatPerUsdtNum = computed(() => {
  const n = Number(route.query.fiatPerUsdt)
  return Number.isFinite(n) && n > 0 ? n : null
})
const fiatCurrency = computed(() => {
  const fromConfig = currentWithdrawConfig.value?.fiatCurrency
  const fromQuery = route.query.fiatCurrency
  const val = String(fromConfig || fromQuery || '').trim()
  return val
})
const fiatRateText = computed(() => {
  if (!showFiatHints.value || fiatPerUsdtNum.value == null) return ''
  return t('withdraw_rate_line', {
    currency: fiatCurrency.value,
    rate: _numberWithCommas(fiatPerUsdtNum.value)
  })
})
const fiatEstimateDisplay = computed(() => {
  if (!showFiatHints.value || fiatPerUsdtNum.value == null) return ''
  const qty = Number(allAmount.value)
  if (!Number.isFinite(qty) || qty <= 0) return ''
  const env = _getConfig('_APP_ENV')
  let netQty = qty
  if (['coinsexpto'].includes(env)) {
    const fee = Number(route.query.fee)
    if (Number.isFinite(fee) && fee > 0) {
      netQty = Math.max(0, qty - fee)
    }
  } else {
    const ratio = Number(route.query.ratio)
    if (Number.isFinite(ratio) && ratio > 0) {
      netQty = Math.max(0, qty * (1 - ratio / 100))
    }
  }
  const fiat = Math.round(netQty * fiatPerUsdtNum.value)
  return `${fiatCurrency.value} ${_numberWithCommas(fiat)}`
})

const fiatFeeLineText = computed(() => {
  if (!showFiatHints.value || fiatPerUsdtNum.value == null) return ''
  const qty = Number(allAmount.value)
  if (!Number.isFinite(qty) || qty <= 0) return ''
  const env = _getConfig('_APP_ENV')
  let feeCrypto = 0
  if (['coinsexpto'].includes(env)) {
    const fee = Number(route.query.fee)
    if (Number.isFinite(fee) && fee > 0) feeCrypto = fee
  } else {
    const ratio = Number(route.query.ratio)
    if (Number.isFinite(ratio) && ratio > 0) feeCrypto = qty * (ratio / 100)
  }
  if (feeCrypto <= 0) return ''
  const feeFiat = Math.round(feeCrypto * fiatPerUsdtNum.value)
  return t('withdraw_fiat_fee_line', {
    currency: fiatCurrency.value,
    amount: _numberWithCommas(feeFiat)
  })
})
const withdrawMinNum = computed(() => {
  const raw =
    currentWithdrawConfig.value?.withdrawalMix ??
    currentWithdrawConfig.value?.withdrawalMin ??
    route.query.withdrawalMix ??
    route.query.withdrawalMin
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
})
const withdrawMaxNum = computed(() => {
  const n = Number(currentWithdrawConfig.value?.withdrawalMax ?? route.query.withdrawalMax)
  return Number.isFinite(n) && n > 0 ? n : null
})
const hasWithdrawLimit = computed(() => withdrawMinNum.value != null || withdrawMaxNum.value != null)
const withdrawLimitRangeText = computed(() => {
  if (!hasWithdrawLimit.value) return ''
  const minTxt = withdrawMinNum.value != null ? _numberWithCommas(Math.floor(withdrawMinNum.value)) : '--'
  const maxTxt = withdrawMaxNum.value != null ? _numberWithCommas(Math.floor(withdrawMaxNum.value)) : '--'
  return `${minTxt} - ${maxTxt} ${(route.query.type || '').toString().toUpperCase()}`
})
const withdrawFeeDisplay = computed(() => {
  if (['coinsexpto'].includes(_getConfig('_APP_ENV'))) {
    return `${route.query.fee || ''} ${(route.query.icon || '').toString().toUpperCase()}`
  }
  return `${route.query.ratio || 0}%`
})

const address = ref(userInfo.value?.user?.address)
const password = ref('')
let allNum = () => {
  allAmount.value = amount.value
}

const onWithdrawAmountInput = () => {
  const raw = allAmount.value
  if (raw === '' || raw === null || raw === undefined) return
  const n = Number(String(raw).replace(/,/g, ''))
  if (!Number.isFinite(n)) return
  const max = Number(amount.value)
  if (!Number.isFinite(max)) return
  if (n > max) {
    allAmount.value = max
  }
}

// 特殊平台，提现需要初级认证（初级）
const advancedAuth = ref(userInfo.value.detail?.auditStatusAdvanced)
// 提交
const submitForm = () => {
  userStore.getUserInfo()
  let flag = true
  const withdrawQty = Number(String(allAmount.value ?? '').replace(/,/g, ''))
  const balanceQty = Number(amount.value)
  // 非空判断
  if (
    allAmount.value === '' ||
    allAmount.value === null ||
    allAmount.value === undefined ||
    !Number.isFinite(withdrawQty) ||
    withdrawQty <= 0 ||
    (Number.isFinite(balanceQty) && withdrawQty > balanceQty)
  ) {
    // showToast('请输入正确的提现数量')
    _toast('withdraw_please_num')
    return
  }
  if (route.query?.icon != 'card') {
    if (address.value == '') {
      // showToast('请输入提现地址')
      _toast('withdraw_please_address')
      return
    }
  }
  if (password.value == '') {
    // showToast('请输入提现密码')
    _toast('withdraw_please_pwd')
    return
  }
  if (userInfo.value.detail?.userTardPwd == null) {
    // showToast('请设置资金密码')
    _toast('withdraw_please_fundPwd')
    setTimeout(() => {
      router.push('/fund-password')
    }, 800)
    return
  }
  if (route.query?.icon != 'card') {
    const expectedLen = getExpectedAddressLength(
      route.query?.type,
      COIN_ADDRESS_LENGTH_SAMPLES
    )
    const addrLen = String(address.value || '').trim().length
    if (expectedLen != null && addrLen !== expectedLen) {
      _toast('withdraw_coin_length_error')
      return
    }
  }

  if (['paxpay'].includes(__config._APP_ENV) && withdrawQty > 500) {
    flag = false
    if (advancedAuth.value !== '1') {
      _toast('please_advanced')
      setTimeout(() => {
        router.push('/certification-advanced')
      }, 1000)
      // return
    } else {
      flag = true
    }
  }
  let params = ``
  if (route.query?.icon == 'card') {
    params = `amount=${priceFormat(allAmount.value)}&coinType=BANK&pwd=${password.value}&adress=${curBank.value.cardNumber
      }&coin=${route.query?.type.toLowerCase()}&bankName=${curBank.value.bankName}&bankUserName=${curBank.value.userName
      }&bankBranch=${curBank.value.bankBranch}`
  } else {
    params = `amount=${priceFormat(allAmount.value)}&coinType=${route.query?.type}&pwd=${password.value
      }&adress=${address.value}&coin=${route.query?.icon}`
  }
  if (flag) {
    if (DIFF_WITHDRAW.includes(__config._APP_ENV)) {
      getCacheStatus().then((res) => {
        if (!res.data) {
          setAddress(params)
        } else {
          _toast('last_order_info')
        }
      })
    } else {
      submitApi(params)
    }
  }
}
const setAddress = (params) => {
  let data = { coin: route.query?.type, address: address.value }
  saveCacheAddress(data).then((res) => {
    if (res.code == '200') {
      submitApi(params)
    }
  })
}
const submitApi = (params) => {
  withdrawSubmit(params)
    .then((res) => {
      if (res.code == '200' || res.code == 200) {
        _toast('withdraw_success')
        setTimeout(() => {
          router.push('/withdraw')
        }, 500)
      } else {
        _toast(res.msg || 'error')
      }
    })
    .catch((err) => {
      _toast(err?.data?.msg || err?.msg || err?.message || 'error')
    })
}
const submit = () => {
  if (DIFF_ISFREEZE.includes(__config._APP_ENV)) {
    if (_isFreeze(DIFF_ISFREEZE)) {
      submitForm()
    }
  } else {
    submitForm()
  }
}

/**
 * 查询提现地址
 */
const getAddress = async () => {
  let params = { coin: route.query?.type }
  const res = await saveCacheAddress(params)
  if (res.code == '200') {
    if (res.msg) {
      address.value = res.msg
    }
  }
}
onMounted(() => {
  if ((mainStore.getWithdrawList || []).length === 0) {
    mainStore.getSettingConfig()
  }
  if (route.query?.icon == 'card') {
    getCardList()
  }
  if (DIFF_WITHDRAW.includes(__config._APP_ENV) && route.query?.icon != 'card') {
    getAddress()
  }
})

const goWithdrawOrder = () => router.push('/withdraw-order')
</script>

<style lang="scss" scoped>
.page-withdraw-apply {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏 */
.wa-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.wa-header__back {
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

.wa-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.wa-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.wa-header__action {
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

.wa-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.page-body {
  background: transparent;
  padding: 16px 14px 0;
  box-sizing: border-box;
}

.card {
  background: rgba(30, 21, 48, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 18px 16px;
  margin-bottom: 14px;
  box-shadow: none;
}

.card-asset {
  .currency-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 20px;
    text-align: center;
  }

  .currency-row--bank {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .coin-icon {
    flex-shrink: 0;
    font-size: 40px;
    width: 40px;
    height: 40px;
    display: block;
  }

  .currency-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .coin-code {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
  }

  .coin-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.2;
  }

  .bank-preview {
    flex: 1;
    min-width: 0;
  }

  .bank-name {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 500;
    color: #fff;
  }

  .card-line {
    margin: 0;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.85);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .bank-chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .balance-row {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .balance-val {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    line-height: 1.15;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #fff 0%, #fff 60%, rgb(196, 124, 255) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .balance-unit-pill {
    font-size: 13px;
    font-weight: 500;
    color: rgb(196, 124, 255);
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(160, 65, 237, 0.14);
    border: 1px solid rgba(160, 65, 237, 0.35);
    line-height: 1.2;
  }
}

.card-form {
  .field {
    margin-bottom: 18px;
  }

  .field-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
    margin: 0 0 8px;
    padding-left: 4px;
    line-height: 1.3;
  }

  .field-box {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(160, 65, 237, 0.45);
    border-radius: 25px;
    padding: 0 16px;
    min-height: 50px;
    background: rgb(34, 34, 34);
    box-shadow: 0 0 0 1px rgba(160, 65, 237, 0.12), 0 0 14px rgba(160, 65, 237, 0.18);
    box-sizing: border-box;
  }

  .field-box--split {
    padding-right: 8px;
  }

  .field-input {
    flex: 1;
    min-width: 0;
    height: 46px;
    border: none;
    background: transparent;
    font-size: 15px;
    color: #fff;
    outline: none;
    padding: 0;

    &::placeholder {
      color: rgba(255, 255, 255, 0.45);
    }
  }

  .link-all {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    padding: 6px 14px;
    border-radius: 999px;
    background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
    box-shadow: 0 4px 10px rgba(127, 43, 218, 0.32);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .fiat-hints {
    margin: -8px 4px 14px;
  }

  .fiat-rate-line,
  .fiat-fee-line {
    margin: 0 0 6px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.5;
  }

  .fiat-estimate {
    margin: 4px 0 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px;
    font-size: 13px;
    line-height: 1.5;
  }

  .fiat-est-label {
    color: rgba(255, 255, 255, 0.55);
  }

  .fiat-est-val {
    font-weight: 600;
    color: rgb(196, 124, 255);
  }

  .eye-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: rgb(196, 124, 255);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
}

.tip-block {
  margin-top: 22px;
  padding-top: 4px;

  .tips-card {
    margin-bottom: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid rgba(160, 65, 237, 0.28);
    background: rgba(160, 65, 237, 0.06);
  }

  .tips-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
  }

  .tips-row:last-child {
    border-bottom: 0;
  }

  .tips-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.65);
  }

  .tips-value {
    font-size: 12px;
    color: #fff;
    text-align: right;
    font-weight: 600;
  }

  .tips-value--warn {
    color: #ff435d;
  }

  .tip-line {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.55;
    margin-bottom: 10px;
    text-align: center;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tip-q {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: rgb(196, 124, 255);
    cursor: pointer;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
}

.btn-wrap {
  margin: 22px 2px 0;
  cursor: pointer;
}

.page-withdraw-apply :deep(.btn-wrap .btn1),
.page-withdraw-apply :deep(.btn-wrap .btn2) {
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%) !important;
  border: none !important;
  border-radius: 999px !important;
  height: 48px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35) !important;
}

/* 银行卡选择 action-sheet (teleport 到 body，scoped 触不到内部，需要全局 deep 覆盖) */
.sheet-box {
  padding: 0 15px 24px;
  max-height: 360px;
  overflow: auto;
  background: #1a1325;
  color: #f5f3f8;
}

.sheet-title {
  font-size: 17px;
  padding: 20px 0 14px;
  text-align: center;
  color: #fff;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin: 0 -15px 14px;
}

.sheet-row {
  display: flex;
  align-items: center;
  padding: 14px 14px;
  border-radius: 12px;
  background: rgba(30, 21, 48, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 10px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: rgba(160, 65, 237, 0.12);
  }

  .sheet-coin {
    font-size: 24px;
    width: 24px;
    height: 24px;
    margin-right: 12px;
    flex-shrink: 0;
    display: block;
  }

  .sheet-bank-name {
    margin: 0 0 6px;
    font-size: 14px;
    color: #fff;
    font-weight: 500;
  }

  .sheet-coin-tag {
    color: rgba(255, 255, 255, 0.55);
    font-weight: 400;
  }

  .sheet-card-num {
    margin: 0;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 0.5px;
  }
}
</style>

<!-- van-action-sheet teleport 到 body，scoped 触不到外壳，全局覆盖暗色 -->
<style lang="scss">
.page-withdraw-apply ~ .van-action-sheet,
.page-withdraw-apply + .van-action-sheet,
body > .van-overlay + .van-action-sheet,
.van-action-sheet:has(.sheet-box) {
  background: #1a1325 !important;
}

/* 提现提示 dialog (showDialog 走 vant 默认 teleport 到 body，必须全局 + className 限定) */
.wa-tip-dialog.van-dialog {
  background: transparent !important;
  border-radius: 18px !important;
  overflow: hidden !important;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(160, 65, 237, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
}

.wa-tip-dialog .van-dialog__header {
  padding: 22px 20px 8px;
  background:
    radial-gradient(120% 110% at 100% 0%, rgba(160, 65, 237, 0.28) 0%, rgba(160, 65, 237, 0) 60%),
    linear-gradient(155deg, rgba(60, 26, 110, 0.65) 0%, rgba(30, 21, 48, 0.95) 60%);
  color: #fff !important;
  font-size: 17px !important;
  font-weight: 600 !important;
  text-align: center;
  letter-spacing: 0.01em;
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
}

.wa-tip-dialog .van-dialog__content {
  padding: 8px 22px 22px;
  background:
    linear-gradient(155deg, rgba(60, 26, 110, 0.55) 0%, rgba(30, 21, 48, 0.92) 60%);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
}

.wa-tip-dialog .van-dialog__message {
  color: rgba(255, 255, 255, 0.82) !important;
  font-size: 13px !important;
  line-height: 1.65 !important;
  text-align: left !important;
  padding: 0 !important;
  word-break: break-word;
}

.wa-tip-dialog .van-dialog__footer {
  background: rgba(30, 21, 48, 0.92);
  border-top: none !important;
  padding: 12px 16px;
  display: flex;
  gap: 10px;
}

/* van 用 ::before / ::after 加 hairline 顶部细线，全部干掉 */
.wa-tip-dialog .van-dialog__footer::before,
.wa-tip-dialog .van-dialog__footer::after,
.wa-tip-dialog .van-hairline--top::after,
.wa-tip-dialog .van-hairline--top-bottom::after {
  display: none !important;
  border: none !important;
  background: transparent !important;
}

.wa-tip-dialog .van-dialog__confirm,
.wa-tip-dialog .van-dialog__cancel {
  flex: 1;
  height: 44px !important;
  border-radius: 999px !important;
  border: none !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #fff !important;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%) !important;
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.32) !important;
}

.wa-tip-dialog .van-dialog__cancel {
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  color: rgba(255, 255, 255, 0.85) !important;
  box-shadow: none !important;
}

/* van 默认中间分隔竖线去掉 */
.wa-tip-dialog .van-hairline--left::after {
  display: none !important;
}

/* overlay 暗一点跟其他 vant 一致 */
.wa-tip-dialog ~ .van-overlay,
.van-overlay:has(+ .wa-tip-dialog),
body > .van-overlay {
  background: rgba(0, 0, 0, 0.6) !important;
}
</style>
