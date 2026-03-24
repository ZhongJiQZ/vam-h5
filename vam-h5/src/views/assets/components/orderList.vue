<template>
  <div
    :class="['order-list-root', { 'order-list-root--card': cardLayout }]"
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
      <div>
        <p class="left">
          {{
            ['paxpay', 'aams'].includes(_getConfig('_APP_ENV'))
              ? _t18('withdraw_money')
              : _t18('recharge_amount')
          }}
        </p>
        <p class="right fontBold fw-num" :class="{ 'amount-highlight': cardLayout }">
          {{ priceFormat(dataValue.amount) }}
        </p>
      </div>

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
      <div v-if="dataValue.rechargeRemark">
        <p class="left">{{ _t18('kind_tips') }}</p>
        <p class="right ff-num">{{ dataValue.rechargeRemark }}</p>
      </div>
      <div v-if="dataValue.withDrawRemark">
        <p class="left">{{ _t18('kind_tips') }}</p>
        <p class="right ff-num">{{ dataValue.withDrawRemark }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatLocalTime } from '@/utils/time'
import { _t18 } from '@/utils/public'
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
  }
})
const dataValue = computed(() => props.data)
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
  background: #f6f7fb !important;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 0;
  box-sizing: border-box;

  .title {
    margin-bottom: 12px;

    .left {
      min-width: 0;
      flex: 1;
    }

    .txt {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }

    .usdt {
      margin-right: 12px;
      flex-shrink: 0;
    }

    .chevron {
      color: #c8c9cc;
      font-size: 16px;
      flex-shrink: 0;
    }
  }

  .message > div {
    padding: 10px 0;

    .left {
      color: #969799;
      font-size: 14px;
    }

    .amount-highlight {
      color: #ee0a24 !important;
      font-weight: 600;
    }

    .status-wait {
      color: #1989fa !important;
    }

    .status-ok {
      color: #17ac74 !important;
    }

    .status-fail {
      color: #ee0a24 !important;
    }

    .time-val {
      color: #646566 !important;
      font-weight: 400;
    }
  }
}
</style>
