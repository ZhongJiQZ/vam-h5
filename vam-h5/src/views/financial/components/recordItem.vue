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
      <span class="record-card__label">{{ _t18('financial_current_income') }}</span>
      <span class="record-card__value fw-num">
        {{ currentAccumulaEarn }}
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
      <span class="record-card__value record-card__value--time fw-num">{{ purchaseTimeDisplay }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { timeOfreceipt, investmentStatus } from '@/utils/filters'
import { formatLocalTime } from '@/utils/time'
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

function parseAmountLike(v) {
  if (v == null || v === '') return NaN
  const n = Number(String(v).replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : NaN
}

/** 若后端已算好预估收益则直接展示（避免与前端公式不一致；旧订单可能只存了该字段） */
function pickServerEstimatedIncome(row) {
  if (!row || typeof row !== 'object') return null
  const keys = [
    'estimatedIncome',
    'estimateIncome',
    'expectedIncome',
    'preIncome',
    'predictIncome',
    'expectEarn',
    'estimatedReward'
  ]
  for (const k of keys) {
    if (row[k] != null && row[k] !== '') {
      const n = parseAmountLike(row[k])
      if (Number.isFinite(n)) return n
    }
  }
  return null
}

/**
 * 预估收益：优先接口字段；否则 本金 × (日收益率/100) × 天数
 * avgRate 兼容蛇形命名 avg_rate；避免部分订单缺字段时用错公式
 */
const estimatedIncome = computed(() => {
  const row = props.itemObj
  const server = pickServerEstimatedIncome(row)
  if (server != null) {
    return priceFormat(server, 4)
  }

  const amt = parseAmountLike(row.amount)
  const days = parseAmountLike(row.days)
  const rate = parseAmountLike(row.avgRate ?? row.avg_rate)

  if (
    Number.isFinite(amt) &&
    amt >= 0 &&
    Number.isFinite(days) &&
    days >= 0 &&
    Number.isFinite(rate) &&
    rate >= 0
  ) {
    const raw = _mul(_mul(amt, _div(rate, 100)), days)
    return priceFormat(raw, 4)
  }

  return '--'
})

const currentAccumulaEarn = computed(() => {
  const v =
    props.itemObj.accumulaEarn ??
    props.itemObj.accumula_earn ??
    props.itemObj.accumulaearn
  const n = parseAmountLike(v)
  if (!Number.isFinite(n)) {
    return '--'
  }
  return priceFormat(n, 4)
})

/** 购买时间：优先 params.createTime（毫秒/秒时间戳），与后端订单创建时刻一致 */
const purchaseTimeDisplay = computed(() => {
  const row = props.itemObj
  const ts = row.params?.createTime
  if (ts !== undefined && ts !== null && ts !== '') {
    const s = formatLocalTime(ts, 'DD/MM/YYYY HH:mm:ss')
    if (s !== '--') return s
  }
  return formatLocalTime(row.createTime, 'DD/MM/YYYY HH:mm:ss')
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
