<script setup>
import { reactive, ref, computed } from 'vue'
import { DIFF_ISFREEZE } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
const { _isFreeze } = useFreeze()
import { _t18, _back } from '@/utils/public'
import { pledgeSubmit } from '@/api/pledge/index'
import { priceFormat } from '@/utils/decimal.js'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useToast } from '@/hook/useToast'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'

const { _toast } = useToast()

const route = useRoute()
const router = useRouter()
const data = reactive(JSON.parse(decodeURI(route.query.data)))

const userStore = useUserStore()
const { asset } = storeToRefs(userStore)
const amount = computed(() => {
  const row = asset.value.filter((item) => item.type == '1' && item.symbol == 'usdt')[0]
  return row?.availableAmount ?? 0
})
const maxAmount = ref('')

const maxNum = () => {
  maxAmount.value = amount.value
}

const submitForm = () => {
  const params = { planId: data.id, amount: maxAmount.value }
  if (maxAmount.value == '' || maxAmount.value > data.limitMax || maxAmount.value < data.limitMin) {
    _toast('pledge_buy_error')
    return
  }
  pledgeSubmit(params).then((res) => {
    if (res.code == '200') {
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
    <header class="pledge-detail-header">
      <button type="button" class="pledge-detail-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="pledge-detail-header__back-icon" />
      </button>
      <h1 class="pledge-detail-header__title">{{ _t18('host.detail') }}</h1>
    </header>

    <main class="pledge-detail-main">
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
            <p class="shouyi-value ff-num shouyi-value--accent">{{ data.minOdds }}%~{{ data.maxOdds }}%</p>
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
    </main>
  </div>
</template>

<style lang="scss" scoped>
.pledge-detail-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 140px 140px at -5% 35%, rgba(128, 43, 218, 0.55), transparent 70%),
    radial-gradient(ellipse 160px 160px at 105% 15%, rgba(128, 43, 218, 0.45), transparent 70%),
    radial-gradient(ellipse 130px 130px at 90% 75%, rgba(128, 43, 218, 0.35), transparent 70%),
    #111111;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

.pledge-detail-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.pledge-detail-header__back {
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

.pledge-detail-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.pledge-detail-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.pledge-detail-main {
  padding: 12px 15px 28px;
  box-sizing: border-box;
}

.detail-card {
  background: rgb(34, 28, 49);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 18px 16px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.jine-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.jine-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);

  span {
    color: rgba(255, 255, 255, 0.45);
  }
}

.jine-deposit {
  margin: 0;
  font-size: 14px;
  color: rgb(196, 124, 255);
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
  background: #181326;
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  color: #fff;
}

.ipt-input::placeholder {
  color: #625d6d;
}

.ipt-max {
  margin: 0 0 0 12px;
  flex-shrink: 0;
  font-size: 14px;
  color: rgb(196, 124, 255);
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.shouyi {
  display: flex;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
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
  color: rgba(255, 255, 255, 0.55);
}

.shouyi-value {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #fff;

  &--accent {
    color: rgb(196, 124, 255);
  }
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
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.balance-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
}

.balance-value {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.detail-btn {
  width: 100%;
  margin-top: 8px;
  padding: 14px 16px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35);
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>
