<template>
  <div
    :class="[
      'order-list-root',
      { 'order-list-root--card': cardLayout },
      { 'order-list-root--card--elevated': cardLayout && elevatedCard }
    ]"
    @click="toDetail(dataValue)"
  >
    <div class="title">
      <div class="left">
        <svg-load v-if="dataValue.type == 'BANK'" name="card" class="usdt"></svg-load>
        <svg-load v-else :name="filterCoin2(dataValue.coin)" class="usdt"></svg-load>
        <div class="txt">
          {{ dataValue.type }}
        </div>
      </div>
      <div class="right">
        <van-icon v-if="cardLayout" name="arrow" class="chevron" />
        <svg-load v-else name="jiantou" class="jiantou"></svg-load>
      </div>
    </div>
    <div class="message">
      <template v-if="showWithdrawBankFiat">
        <div>
          <p class="left">{{ _t18('withdraw_money') }}</p>
          <p class="right fontBold fw-num" :class="{ 'amount-highlight': cardLayout }">
            {{ priceFormat(dataValue.amount) }} USDT
          </p>
        </div>
        <div>
          <p class="left">{{ _t18('withdraw_commission') }}</p>
          <p class="right fontBold fw-num" :class="{ 'amount-highlight': cardLayout }">
            {{ priceFormat(dataValue.fee ?? 0) }} USDT
          </p>
        </div>
        <div>
          <p class="left">{{ _t18('withdraw_actual_fiat') }}</p>
          <p class="right ff-num" :class="{ 'time-val': cardLayout }">{{ receiptFiatDisplay }}</p>
        </div>
      </template>
      <template v-else>
        <div>
          <p class="left">
            {{
              ['paxpay', 'aams'].includes(_getConfig('_APP_ENV'))
                ? _t18('withdraw_money')
                : _t18('recharge_amount')
            }}
          </p>
          <p class="right fontBold fw-num" :class="{ 'amount-highlight': cardLayout }">
            {{ defaultAmountDisplay }}
          </p>
        </div>
      </template>

      <div>
        <p class="left">{{ _t18('recharge_status') }}</p>
        <p v-if="dataValue.status == 0" class="right status0" :class="{ 'status-wait': cardLayout }">
          {{ _t18('recharge_waiting') }}
        </p>
        <p v-if="dataValue.status == 1" class="right status1" :class="{ 'status-ok': cardLayout }">
          {{ _t18('recharge_tab_success') }}
        </p>
        <p v-if="dataValue.status == 2" class="right status2" :class="{ 'status-fail': cardLayout }">
          {{ _t18('recharge_tab_error') }}
        </p>
      </div>

      <div>
        <p class="left">{{ _t18('recharge_time') }}</p>
        <p class="right ff-num time-val">{{ formatLocalTime(dataValue.params?.createTime) }}</p>
      </div>
      <div v-if="dataValue.rechargeRemark" :class="{ 'remark-row': cardLayout }">
        <template v-if="cardLayout">
          <div class="remark-box">
            <p class="remark-box__title">{{ _t18('kind_tips') }}</p>
            <p class="remark-box__content ff-num">{{ dataValue.rechargeRemark }}</p>
          </div>
        </template>
        <template v-else>
          <p class="left">{{ _t18('kind_tips') }}</p>
          <p class="right ff-num">{{ dataValue.rechargeRemark }}</p>
        </template>
      </div>
      <div v-if="dataValue.withDrawRemark" :class="{ 'remark-row': cardLayout }">
        <template v-if="cardLayout">
          <div class="remark-box">
            <p class="remark-box__title">{{ _t18('kind_tips') }}</p>
            <p class="remark-box__content ff-num">{{ dataValue.withDrawRemark }}</p>
          </div>
        </template>
        <template v-else>
          <p class="left">{{ _t18('kind_tips') }}</p>
          <p class="right ff-num">{{ dataValue.withDrawRemark }}</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatLocalTime } from '@/utils/time'
import { _t18, _numberWithCommas } from '@/utils/public'
import { filterCoin2 } from '@/utils/public'
import { priceFormat } from '@/utils/decimal'

const router = useRouter()
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  /** 充值记录卡片样式（浅灰底、金额/状态配色） */
  cardLayout: {
    type: Boolean,
    default: false
  },
  /** 浅灰列表区上的白卡片（提现记录等） */
  elevatedCard: {
    type: Boolean,
    default: false
  }
})
const dataValue = computed(() => props.data)
const isAssetRecordRoute = computed(() => router.currentRoute.value.name === 'AssetRecord')

const fiatPrefix = (coin) => {
  const c = String(coin || '').toUpperCase()
  if (c === 'IDR') return 'Rp'
  return c || 'Rp'
}

const showWithdrawBankFiat = computed(() => {
  if (!props.cardLayout) return false
  const d = dataValue.value
  if (String(d?.type || '').toUpperCase() !== 'BANK') return false
  if (d?.receiptCoin == null || String(d.receiptCoin).trim() === '') return false
  if (d?.receiptAmount == null || d?.receiptAmount === '') return false
  return true
})

const receiptFiatDisplay = computed(() => {
  const d = dataValue.value
  const coin = String(d?.receiptCoin || '').trim()
  const raw = d?.receiptAmount
  if (raw == null || raw === '') return ''
  const n = Number(raw)
  if (!Number.isFinite(n)) return `${coin} ${raw}`.trim()
  return `${coin} ${_numberWithCommas(n)}`
})

const isRechargeOrderRoute = computed(() => router.currentRoute.value.name === 'RechargOrder')

const defaultAmountDisplay = computed(() => {
  const d = dataValue.value
  const isBank = String(d?.type || '').toUpperCase() === 'BANK'
  if (isBank && isRechargeOrderRoute.value) {
    const raw = d?.realAmount ?? d?.amount
    const n = Number(raw)
    const text = Number.isFinite(n) ? priceFormat(n) : String(raw ?? '')
    const coin = String(d?.coin || 'USDT').toUpperCase()
    return `${text} ${coin}`
  }
  if (!isAssetRecordRoute.value || !isBank) {
    return priceFormat(d?.amount)
  }
  const raw = d?.receiptAmount ?? d?.amount
  const n = Number(raw)
  const prefix = fiatPrefix(d?.receiptCoin)
  if (!Number.isFinite(n)) return `${prefix} ${raw ?? ''}`.trim()
  return `${prefix} ${_numberWithCommas(n)}`
})

const toDetail = (data) => {
  if (router.currentRoute.value.name == 'RechargOrder') {
    router.push({
      path: '/recharge-detail',
      query: { id: data.id }
    })
  } else if (
    router.currentRoute.value.name == 'WithdrawOrder' ||
    router.currentRoute.value.name == 'AssetRecord'
  ) {
    router.push({
      path: '/withdraw-detail',
      query: { id: data.id }
    })
  }
}
</script>

<style lang="scss" scoped>
.order-list-root {
  font-size: 14px;
  color: var(--ex-default-font-color);
  background: var(--ex-default-background-color) !important;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;

    .left {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;

      .usdt {
        font-size: 24px;
        margin-right: 10px;
      }
    }

    .jiantou {
      font-size: 10px;
    }
  }

  .message {
    & > div {
      padding: 15px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left {
        color: var(--ex-passive-font-color);
      }

      .fontBold {
        font-weight: bold;
        color: var(--ex-font-color10);
      }

      .status0 {
        color: var(--ex-font-color23);
      }

      .status1 {
        color: var(--ex-font-color9);
      }

      .status2 {
        color: var(--ex-font-color3);
      }
    }
  }
}

.order-list-root--card {
  background: rgba(30, 21, 48, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 0;
  box-sizing: border-box;
  cursor: pointer;

  .title {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    .left {
      min-width: 0;
      flex: 1;
    }

    .txt {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }

    .usdt {
      margin-right: 12px;
      flex-shrink: 0;
    }

    .chevron {
      color: rgba(255, 255, 255, 0.4);
      font-size: 16px;
      flex-shrink: 0;
    }
  }

  .message > div {
    padding: 8px 0;

    .left {
      color: rgba(255, 255, 255, 0.55);
      font-size: 13px;
    }

    .right {
      color: #fff;
    }

    .fontBold {
      color: #fff !important;
      font-weight: 600;
    }

    .amount-highlight {
      color: rgb(196, 124, 255) !important;
      font-weight: 600;
    }

    .status-wait {
      color: #4ea6ff !important;
    }

    .status-ok {
      color: #5fd5a4 !important;
    }

    .status-fail {
      color: #ff5968 !important;
    }

    .time-val {
      color: rgba(255, 255, 255, 0.65) !important;
      font-weight: 400;
    }
  }

  .message > div.remark-row {
    display: block;
    padding-top: 12px;
    padding-bottom: 0;
  }

  .remark-box {
    border: 1px solid rgba(255, 67, 93, 0.32);
    background: rgba(255, 67, 93, 0.08);
    border-radius: 12px;
    padding: 10px 12px;
    box-sizing: border-box;
  }

  .remark-box__title {
    margin: 0 0 6px;
    color: #ff5968;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 600;
    text-align: left;
  }

  .remark-box__content {
    margin: 0;
    color: rgba(255, 255, 255, 0.75);
    font-size: 13px;
    line-height: 1.45;
    text-align: left;
    word-break: break-word;
    white-space: pre-wrap;
  }
}

.order-list-root--card.order-list-root--card--elevated {
  background: rgba(30, 21, 48, 0.85) !important;
  border: 1px solid rgba(160, 65, 237, 0.18);
  box-shadow: 0 8px 22px rgba(127, 43, 218, 0.12);

  .usdt {
    font-size: 32px;
  }
}
</style>
