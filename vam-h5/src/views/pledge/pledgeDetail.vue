<script setup>
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import { DIFF_ISFREEZE } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
const { _isFreeze } = useFreeze()
import { _t18 } from '@/utils/public'
import { pledgeSubmit } from '@/api/pledge/index'
import { priceFormat } from '@/utils/decimal.js'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useToast } from '@/hook/useToast'
const { _toast } = useToast()

const route = useRoute()
const router = useRouter()
const data = reactive(JSON.parse(decodeURI(route.query.data)))
/**
 * 账户信息
 */
const userStore = useUserStore()
const { asset } = storeToRefs(userStore)
const amount = computed(() => {
  // let data = 999
  let data = asset.value.filter((item, index) => {
    return item.type == '1' && item.symbol == 'usdt'
  })[0].availableAmount
  return data
})
const maxAmount = ref('')
let maxNum = () => {
  maxAmount.value = amount.value
}
const submitForm = () => {
  let params = { planId: data.id, amount: maxAmount.value }
  if (maxAmount.value == '' || maxAmount.value > data.limitMax || maxAmount.value < data.limitMin) {
    // showToast('购买金额有误')
    _toast('pledge_buy_error')
    return
  }
  pledgeSubmit(params).then((res) => {
    if (res.code == '200') {
      // showToast(res.msg)购买成功
      _toast('Purchase_successful')
      setTimeout(() => {
        router.push('/pledge/pledgeOrder')
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
</script>
<template>
  <div class="pledge-detail-page">
    <DarkHeaderBar :title="_t18('host.detail')" :border_bottom="true" />
    <div class="sheet">
      <section class="detail-card">
        <div class="jine">
          <div class="jine-top">
            <div class="jine-label">
              {{ _t18('pledge_Subscription_amount') }} <span>(USDT)</span>
            </div>
            <p class="jine-deposit" @click="$router.push('/recharge')">
              {{ _t18('pledge_deposit_funds') }}
            </p>
          </div>
          <div class="ipt">
            <input
              v-model="maxAmount"
              type="number"
              :placeholder="`${_t18('pledge_purchasing_price', ['aams'])}`"
              class="ff-num ipt-input"
            />
            <p class="ipt-max" @click="maxNum()">{{ _t18('pledge_maximum') }}</p>
          </div>
        </div>
        <div class="shouyi">
          <div class="shouyi-col">
            <p class="shouyi-label">{{ _t18('pledge_quota') }}</p>
            <p class="shouyi-value ff-num">{{ data.limitMin }}~{{ data.limitMax }}</p>
          </div>
          <div class="shouyi-col">
            <p class="shouyi-label">{{ _t18('host_dailyrateof_return') }}</p>
            <p class="shouyi-value ff-num">{{ data.minOdds }}%~{{ data.maxOdds }}%</p>
          </div>
          <div class="shouyi-col">
            <p class="shouyi-label">{{ _t18('pledge_cycle') }}({{ _t18('pledge_day') }})</p>
            <p class="shouyi-value ff-num">{{ data.days }}</p>
          </div>
        </div>
      </section>

      <section class="detail-card">
        <div class="balance-row">
          <span class="balance-label">{{ _t18('pledge_Available_Balance') }}</span>
          <span class="balance-value ff-num">{{ priceFormat(amount) }} USDT</span>
        </div>
        <div class="balance-row">
          <span class="balance-label">{{ _t18('pledge_Available_times') }}</span>
          <span class="balance-value ff-num" v-if="['dev'].includes(_getConfig('_APP_ENV'))">{{
            `${data.buyPurchase}/${data.timeLimit}`
          }}</span>
          <span class="balance-value ff-num" v-else>{{ `${data.timeLimit}` }}</span>
        </div>
      </section>

      <button type="button" class="detail-btn" @click="submit">
        {{ _t18('btnConfirm', ['bitmake']) }}
      </button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
/* 圆角与布局对齐 recharge-detail / recharge-order */
.pledge-detail-page {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-sizing: border-box;
}

.sheet {
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: #f5f6fa;
  border-radius: 16px 16px 0 0;
  padding: 20px 15px 28px;
  box-sizing: border-box;
  overflow: hidden;
}

.detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px 16px;
  margin-bottom: 12px;
  box-sizing: border-box;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.jine-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.jine-label {
  font-size: 14px;
  color: #888888;
  span {
    color: #888888;
  }
}

.jine-deposit {
  margin: 0;
  font-size: 14px;
  color: #17ac74;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.ipt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding: 12px 14px;
  background: #f5f6fa;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  box-sizing: border-box;
}

.ipt-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: #1a1a1a;
}

.ipt-input::placeholder {
  color: #b0b0b0;
}

.ipt-max {
  margin: 0;
  margin-left: 12px;
  flex-shrink: 0;
  font-size: 14px;
  color: #17ac74;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.shouyi {
  display: flex;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.shouyi-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.shouyi-col:first-child {
  align-items: flex-start;
  text-align: left;
}

.shouyi-col:last-child {
  align-items: flex-end;
  text-align: right;
}

.shouyi-label {
  margin: 0 0 10px;
  font-size: 13px;
  color: #888888;
}

.shouyi-value {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.balance-row:first-child {
  padding-top: 4px;
}

.balance-row + .balance-row {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.balance-label {
  font-size: 14px;
  color: #888888;
}

.balance-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.detail-btn {
  width: 100%;
  margin-top: 8px;
  padding: 14px 16px;
  border: none;
  border-radius: 999px;
  background: #05101a;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>
