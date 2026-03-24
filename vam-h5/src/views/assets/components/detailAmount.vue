<template>
  <div
    v-if="$route.path.includes('recharge')"
    class="userAmount"
    :class="{ 'userAmount--card': cardSurface }"
  >
    <p class="add ff-num">+{{ priceFormat(props.data?.amount || 0) }}</p>
    <span>{{ _t18('recharge_money') }}({{ props.data?.type || '' }})</span>
  </div>
  <div
    v-if="$route.path.includes('withdraw')"
    class="userAmount"
    :class="{ 'userAmount--card': cardSurface }"
  >
    <p class="reduce ff-num">-{{ priceFormat(props.data.amount || 0) }}</p>
    <span>{{ _t18('withdraw_money') }}({{ props.data?.type || '' }})</span>
  </div>
</template>

<script setup>
import { _t18 } from '@/utils/public'
import { priceFormat } from '@/utils/decimal.js'

const props = defineProps({
  data: {
    type: Object
  },
  amount: {
    type: String
  },
  coin: {
    type: String,
    default: 'USDT'
  },
  /** 充值详情等卡片式页面 */
  cardSurface: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.userAmount {
  font-size: 14px;
  color: var(--ex-default-font-color);
  padding: 50px 0;
  border-bottom: 1px solid var(--ex-border-color);
  display: flex;
  flex-direction: column;
  align-items: center;

  p {
    margin-bottom: 15px;
    font-size: 50px;
    font-weight: bold;
  }

  p.add {
    color: var(--ex-font-color2);
  }

  p.reduce {
    color: var(--ex-font-color10);
  }

  span,
  i {
    font-size: 16px;
    color: var(--ex-passive-font-color);
  }
}

.userAmount--card {
  padding: 20px 0 18px;
  border-bottom: 1px solid #ebedf0;

  p {
    margin-bottom: 8px;
    font-size: 36px;
    font-weight: 600;
  }

  p.add {
    color: #ee0a24;
  }

  p.reduce {
    color: #323233;
  }

  span {
    font-size: 14px;
    color: #969799;
  }
}
</style>
