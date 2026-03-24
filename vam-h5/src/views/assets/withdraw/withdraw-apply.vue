<!-- 提现申请 -->
<template>
  <div class="page-withdraw-apply">
    <DarkHeaderBar
      :title="currentName"
      right="withdrawOrder"
      :border_bottom="true"
    />

    <van-action-sheet
      v-model:show="showSheet"
      :closeable="false"
      style="max-width: var(--ex-max-width); left: 50%; translate: -50%"
    >
      <div class="sheet-box">
        <div class="sheet-title fw-bold">{{ _t18('withdraw_select_card') }}</div>
        <div
          v-for="(item, index) in bankList"
          :key="index"
          class="sheet-row"
          @click="selectSheet(item)"
        >
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
        <div
          v-if="route.query.icon == 'card'"
          class="currency-row currency-row--bank"
          @click="showSheet = true"
        >
          <svg-load :name="route.query.icon" class="coin-icon" />
          <div class="bank-preview">
            <p class="bank-name">{{ curBank?.bankName }}</p>
            <p class="card-line fw-num">
              {{ hideBank(curBank?.cardNumber || '') }}
              <van-icon name="arrow" class="bank-chevron" />
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
            <input
              v-model="allAmount"
              type="number"
              class="field-input ff-num"
              :placeholder="_t18('withdraw_input')"
            />
            <span class="link-all" @click="allNum">{{ _t18('swap_all') }}</span>
          </div>
        </div>

        <div v-if="route.query.icon != 'card'" class="field">
          <div class="field-label">{{ _t18('withdraw_address') }}</div>
          <div class="field-box">
            <input
              v-model="address"
              type="text"
              class="field-input"
              :placeholder="_t18('withdraw_input')"
            />
          </div>
        </div>

        <div class="field">
          <div class="field-label">{{ _t18('withdraw_pwd', ['rxce']) }}</div>
          <div class="field-box field-box--split">
            <input
              v-model="password"
              class="field-input"
              :type="showk ? 'text' : 'password'"
              :placeholder="_t18('withdraw_input')"
            />
            <svg-load
              :name="showk ? 'yanjin-k' : 'yanjin-g'"
              class="eye-icon"
              @click.stop="showk = !showk"
            />
          </div>
        </div>

        <div v-if="!['aams'].includes(_getConfig('_APP_ENV'))" class="tip-block">
          <div class="tip-line" @click="dispatchCustomEvent('event_serviceChange')">
            {{ _t18('withdraw_tip') }}
            <span class="tip-service">{{ _t18('custorm_service') }}</span>
          </div>
          <div v-if="['coinsexpto'].includes(_getConfig('_APP_ENV'))" class="fee-line">
            {{ _t18('withdraw_commission') }}：<span class="ff-num"
              >{{ route.query.fee || '' }} {{ (route.query.icon || '').toString().toUpperCase() }}</span
            >
          </div>
          <div v-if="!['coinsexpto'].includes(_getConfig('_APP_ENV'))" class="fee-line">
            {{ _t18('withdraw_commission') }}：<span class="ff-num">{{ route.query.ratio }}%</span>
          </div>
        </div>
      </div>

      <div class="btn-wrap" @click="submit">
        <ButtonBar :btnValue="_t18('withdraw_require')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { dispatchCustomEvent } from '@/utils'
import {DIFF_ISFREEZE, DIFF_WITHDRAW} from '@/config/index'
import {useFreeze} from '@/hook/useFreeze'

const {_isFreeze} = useFreeze()
import {
  getBindCardList,
  getCacheStatus,
  saveCacheAddress,
  withdrawSubmit
} from '@/api/account.js'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import { priceFormat } from '@/utils/decimal.js'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { _t18, _getConfig } from '@/utils/public'
import { useToast } from '@/hook/useToast'
import { filterCoin2 } from '@/utils/public'
import { computed, onMounted, ref } from 'vue'
const { _toast } = useToast()
const userStore = useUserStore()
userStore.getUserInfo()
// 用户信息
const {userInfo} = storeToRefs(userStore)
// 用户余额信息
const {asset} = storeToRefs(userStore)
import {useRoute, useRouter} from 'vue-router'

const route = useRoute()
const router = useRouter()
const currentName = _t18('withdraw', ['latcoin'])
const showk = ref(false)

// 银行卡数据
const curBank = ref({})
const showSheet = ref(false)
const selectSheet = (item) => {
  showSheet.value = false
  curBank.value = item
}

const balanceCoinLabel = computed(() => {
  if (route.query.icon === 'card' && curBank.value?.coin) {
    return curBank.value.coin
  }
  return (route.query.type || '')?.toString() || ''
})

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
const address = ref(userInfo.value?.user?.address)
const password = ref('')
let allNum = () => {
  allAmount.value = amount.value
}

// 特殊平台，提现需要初级认证（初级）
const advancedAuth = ref(userInfo.value.detail?.auditStatusAdvanced)
// 提交
const submitForm = () => {
  userStore.getUserInfo()
  let flag = true
  // 非空判断
  if (allAmount.value == '' || allAmount.value > amount.value || allAmount.value <= 0) {
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
    flag = false
    _toast('withdraw_please_fundPwd')
    setTimeout(() => {
      router.push('/fund-password')
    }, 800)
    // return
  }

  if (['paxpay'].includes(__config._APP_ENV) && allAmount.value > 500) {
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
    params = `amount=${priceFormat(allAmount.value)}&coinType=BANK&pwd=${password.value}&adress=${
        curBank.value.cardNumber
    }&coin=${route.query?.type.toLowerCase()}&bankName=${curBank.value.bankName}&bankUserName=${
        curBank.value.userName
    }&bankBranch=${curBank.value.bankBranch}`
  } else {
    params = `amount=${priceFormat(allAmount.value)}&coinType=${route.query?.type}&pwd=${
        password.value
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
  let data = {coin: route.query?.type, address: address.value}
  saveCacheAddress(data).then((res) => {
    if (res.code == '200') {
      submitApi(params)
    }
  })
}
const submitApi = (params) => {
  withdrawSubmit(params).then((res) => {
    if (res.code == '200') {
      // showToast('提现成功')
      _toast('withdraw_success')
      // 提交成功
      setTimeout(() => {
        router.push('/withdraw')
      }, 500)
    } else {
      showToast(res.msg)
    }
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
  let params = {coin: route.query?.type}
  const res = await saveCacheAddress(params)
  if (res.code == '200') {
    if (res.msg) {
      address.value = res.msg
    }
  }
}
onMounted(() => {
  if (route.query?.icon == 'card') {
    getCardList()
  }
  if (DIFF_WITHDRAW.includes(__config._APP_ENV) && route.query?.icon != 'card') {
    getAddress()
  }
})
</script>

<style lang="scss" scoped>
.page-withdraw-apply {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.page-body {
  background: #f6f7fb;
  border-radius: 20px 20px 0 0;
  padding: 12px 15px;
  padding-bottom: calc(24px + constant(safe-area-inset-bottom));
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 18px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-asset {
  .currency-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 18px;
    border-bottom: 1px solid #eeeeee;
    margin-bottom: 20px;
  }

  .currency-row--bank {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .coin-icon {
    flex-shrink: 0;
    font-size: 40px;
  }

  .currency-main {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
  }

  .coin-code {
    font-size: 18px;
    font-weight: 700;
    color: #323233;
  }

  .coin-label {
    font-size: 13px;
    color: #969799;
  }

  .bank-preview {
    flex: 1;
    min-width: 0;
  }

  .bank-name {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 500;
    color: #323233;
  }

  .card-line {
    margin: 0;
    font-size: 15px;
    color: #323233;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .bank-chevron {
    flex-shrink: 0;
    color: #c8c9cc;
    font-size: 16px;
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
    color: #323233;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .balance-unit-pill {
    font-size: 13px;
    font-weight: 500;
    color: #646566;
    padding: 4px 10px;
    border-radius: 999px;
    background: #f0f2f5;
    line-height: 1.2;
  }
}

.card-form {
  .field {
    margin-bottom: 20px;
  }

  .field-label {
    font-size: 13px;
    color: #969799;
    margin-bottom: 10px;
    line-height: 1.4;
  }

  .field-box {
    display: flex;
    align-items: center;
    border: 1px solid #eeeeee;
    border-radius: 10px;
    padding: 0 14px;
    min-height: 50px;
    background: #fff;
    box-sizing: border-box;
  }

  .field-box--split {
    padding-right: 12px;
  }

  .field-input {
    flex: 1;
    min-width: 0;
    height: 46px;
    border: none;
    background: transparent;
    font-size: 15px;
    color: #323233;
    outline: none;

    &::placeholder {
      color: #c8c9cc;
    }
  }

  .link-all {
    flex-shrink: 0;
    font-size: 15px;
    font-weight: 500;
    color: var(--ex-primary-color);
    padding: 8px 0 8px 8px;
    -webkit-tap-highlight-color: transparent;
  }

  .eye-icon {
    flex-shrink: 0;
    font-size: 22px;
    padding: 8px 0 8px 10px;
    -webkit-tap-highlight-color: transparent;
  }
}

.tip-block {
  margin-top: 22px;
  padding-top: 4px;

  .tip-line {
    font-size: 13px;
    color: #969799;
    line-height: 1.55;
    margin-bottom: 10px;
  }

  .tip-service {
    color: var(--ex-primary-color);
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .fee-line {
    font-size: 13px;
    color: #646566;
    line-height: 1.5;
  }
}

.btn-wrap {
  margin-top: 8px;
  padding: 0 2px;
}

.page-withdraw-apply :deep(.btn-wrap > div) {
  border-radius: 999px !important;
  background: #05101a !important;
  border-color: #05101a !important;
  color: #fff !important;
  font-weight: 500 !important;
  padding: 14px 0 !important;
}

.sheet-box {
  padding: 0 15px 30px;
  max-height: 300px;
  overflow: auto;
}

.sheet-title {
  font-size: 17px;
  padding: 24px 0 16px;
  text-align: center;
  color: #323233;
}

.sheet-row {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  border-radius: 10px;
  background: #f6f7fb;
  margin-bottom: 10px;
  -webkit-tap-highlight-color: transparent;

  .sheet-coin {
    font-size: 24px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .sheet-bank-name {
    margin: 0 0 6px;
    font-size: 14px;
    color: #323233;
  }

  .sheet-coin-tag {
    color: #969799;
  }

  .sheet-card-num {
    margin: 0;
    font-size: 16px;
    color: #323233;
  }
}
</style>
