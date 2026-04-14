<template>
  <div class="record-card">
    <div class="record-card__row">
      <span class="record-card__label">{{ _t18('fund_name') }}</span>
      <span class="record-card__value">{{ itemObj.planTitle }}</span>
    </div>
    <div class="record-card__row">
      <span class="record-card__label">{{ _t18('Lock-up_days') }}</span>
      <span class="record-card__value fw-num">{{ itemObj.days }}</span>
    </div>
    <div class="record-card__row">
      <span class="record-card__label">{{ _t18('host_dailyrateof_return') }}</span>
      <span class="record-card__value fw-num">{{ itemObj.avgRate }}%</span>
    </div>
    <div class="record-card__row">
      <span class="record-card__label">{{ _t18('investment_amount') }}</span>
      <span class="record-card__value fw-num">
        {{ itemObj.amount }} {{ itemObj.coin ? itemObj.coin.toUpperCase() : '' }}
      </span>
    </div>
    <div class="record-card__row">
      <span class="record-card__label">{{ _t18('Estimated income') }}</span>
      <span class="record-card__value fw-num">
        {{ estimatedIncome }}
        {{ itemObj.coin ? itemObj.coin.toUpperCase() : '' }}
      </span>
    </div>
    <div class="record-card__row">
      <span class="record-card__label">{{ _t18('Arrival_time') }}</span>
      <span class="record-card__value fw-num">
        {{ timeOfreceipt(itemObj.settlementType, itemObj.days, itemObj.params.createTime) }}
      </span>
    </div>
    <div class="record-card__row">
      <span class="record-card__label">{{ _t18('mining_status') }}</span>
      <span
        class="record-card__value fw-num record-card__status"
        :style="{ color: statusMeta.color }"
      >
        {{ statusMeta.name }}
      </span>
    </div>
    <div class="record-card__row record-card__row--time">
      <span class="record-card__label">{{ _t18('pledge_Buy') }}{{ _t18('k_time') }}</span>
      <span class="record-card__value record-card__value--time fw-num">{{ itemObj.createTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { timeOfreceipt, investmentStatus } from '@/utils/filters'
import { priceFormat, _mul, _div } from '@/utils/decimal'
import { _t18 } from '@/utils/public'

const props = defineProps({
  itemObj: {
    type: Object,
    default: () => ({})
  }
})

const statusMeta = computed(
  () => investmentStatus(props.itemObj.status) || { color: '#999', name: '--' }
)

/** 预估收益 = 本金 × (日收益率/100) × 锁仓天数，与列表展示的 avgRate（日收益率）一致 */
const estimatedIncome = computed(() => {
  const amt = Number(props.itemObj.amount)
  const days = Number(props.itemObj.days)
  const rate = Number(props.itemObj.avgRate)
  if (![amt, days, rate].every((n) => Number.isFinite(n) && n >= 0)) {
    return priceFormat(0, 4)
  }
  const daily = _div(rate, 100)
  const raw = _mul(_mul(amt, daily), days)
  return priceFormat(raw, 4)
})
</script>

<style lang="scss" scoped>
.record-card {
  background: #f6f7fa;
  border-radius: 14px;
  padding: 16px 16px 14px;
  margin-bottom: 14px;
  box-shadow: 0 1px 4px rgba(5, 16, 26, 0.04);
}

.record-card__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  font-size: 13px;
}

.record-card__label {
  flex-shrink: 0;
  color: #999;
  max-width: 42%;
}

.record-card__value {
  flex: 1;
  text-align: right;
  color: #333;
  word-break: break-all;
}

.record-card__row--time {
  padding-top: 10px;
  margin-top: 4px;
}

.record-card__value--time {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}
</style>
