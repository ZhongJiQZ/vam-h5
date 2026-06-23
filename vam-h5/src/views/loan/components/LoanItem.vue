<script setup>
import { computed } from 'vue'
import { _t18 } from '@/utils/public'
import { _mul } from '@/utils/decimal'

const props = defineProps({
  dataList: {
    type: Object,
    default: () => ({})
  }
})

const status = computed(() => {
  if (props.dataList.status == 0) return _t18('loan_apply_wait')
  if (props.dataList.status == 1) return _t18('loan_apply_success')
  if (props.dataList.status == 2) return _t18('loan_apply_err')
  if (props.dataList.status == 3) return _t18('loan_apply_complete')
  if (props.dataList.status == 4) return _t18('loan_apply_overdue')
  return ''
})

const statusClass = computed(() => {
  const s = props.dataList?.status
  if (s === 1 || s === 3) return 'is-success'
  if (s === 2 || s === 4) return 'is-danger'
  return 'is-pending'
})
</script>

<template>
  <article class="loan-detail">
    <div class="item">
      <div class="left">{{ _t18('loan_amount') }}</div>
      <div class="right ff-num">{{ props.dataList.amount }}</div>
    </div>
    <div class="item">
      <div class="left">{{ _t18('loan_status') }}</div>
      <div class="right" :class="statusClass">{{ status }}</div>
    </div>
    <div class="item">
      <div class="left">{{ _t18('loan_cycle') }}</div>
      <div class="right ff-num">{{ props.dataList.cycleType }}</div>
    </div>
    <div class="item">
      <div class="left">{{ _t18('loan_rateDay') }}</div>
      <div class="right ff-num">{{ props.dataList.rate }}%</div>
    </div>
    <div class="item">
      <div class="left">{{ _t18('loan_interest') }}</div>
      <div class="right ff-num">
        {{ _mul(_mul(_mul(dataList.amount, dataList.rate), dataList.cycleType), 0.01) }}
      </div>
    </div>
    <div class="item">
      <div class="left">{{ _t18('loan_repayType') }}</div>
      <div class="right">{{ dataList.repayTypeLabel }}</div>
    </div>
    <div v-if="!(dataList.status === 0 || dataList.status === 2)" class="item">
      <div class="left">{{ _t18('loan_time') }}</div>
      <div class="right">
        {{ _timeFormat(dataList.params?.finalRepayTime, 'HH:mm MM/DD', true) }}
      </div>
    </div>
    <div class="item item--last">
      <div class="left">{{ _t18('loan_repayOrg') }}</div>
      <div class="right">{{ dataList.tloadProduct?.repayOrg }}</div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.loan-detail {
  background: rgb(34, 28, 49);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px 16px;
  margin-bottom: 12px;
  box-sizing: border-box;

  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    &--last {
      border-bottom: none;
    }

    .left {
      flex-shrink: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.55);
    }

    .right {
      font-size: 14px;
      color: #fff;
      text-align: right;
      word-break: break-all;

      &.is-success {
        color: #31c48d;
      }

      &.is-danger {
        color: #ff435d;
      }

      &.is-pending {
        color: rgb(196, 124, 255);
      }
    }
  }
}
</style>
