<template>
  <div class="position-card">
    <div class="position-card__head">
      <div class="position-card__pair">
        <span class="pair">{{ displayPair }}</span>
        <span class="tag tag--muted">{{ masked ? MASK : _t18('copy_trade_usdt_contract') }}</span>
      </div>
      <span class="status-tag" :class="closed ? 'status-tag--closed' : 'status-tag--open'">
        {{ displayStatus }}
      </span>
    </div>
    <div class="position-card__tags">
      <template v-if="masked">
        <span class="tag tag--muted">{{ _t18('copy_trade_cross') }}</span>
      </template>
      <template v-else>
        <span v-if="record.type != null" class="tag" :class="record.type === 0 ? 'tag--long' : 'tag--short'">
          {{ record.type === 0 ? _t18('copy_trade_long') : _t18('copy_trade_short') }}
        </span>
        <span class="tag tag--muted">{{ _t18('copy_trade_cross') }}</span>
        <span v-if="recordLeverageText(record)" class="tag tag--muted">{{ recordLeverageText(record) }}</span>
      </template>
    </div>
    <div class="position-card__grid">
      <div class="cell">
        <span class="label">{{ _t18('copy_trade_open_price') }}</span>
        <span class="value ff-num">{{ priceFormat(record.openPrice) }}</span>
      </div>
      <div class="cell">
        <span class="label">{{ _t18('copy_trade_pnl_usdt') }}</span>
        <span class="value ff-num" :class="masked ? '' : pnlClass(record.earn)">{{ masked ? MASK : formatPnl(record.earn) }}</span>
      </div>
      <div class="cell">
        <span class="label">{{ _t18('copy_trade_close_price') }}</span>
        <span class="value ff-num">{{ masked ? MASK : priceFormat(record.closePrice) }}</span>
      </div>
      <div class="cell">
        <span class="label">{{ _t18('copy_trade_pnl_rate') }}</span>
        <span class="value ff-num" :class="masked ? '' : pnlClass(record.earn)">{{ masked ? MASK : `${recordPnlRate(record)}%` }}</span>
      </div>
      <div class="cell cell--full">
        <span class="label">{{ _t18('copy_trade_open_time') }}</span>
        <span class="value">{{ record.openTime || '--' }}</span>
      </div>
      <div class="cell cell--full">
        <span class="label">{{ _t18('copy_trade_close_time') }}</span>
        <span class="value">{{ masked ? MASK : (record.closeTime || '--') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { _t18 } from '@/utils/public'
import { _div, _mul, _sub, priceFormat } from '@/utils/decimal'
import { symbolPair, formatPnl, pnlClass, copyTradePositionSymbol } from '../utils'

const MASK = '***'

const props = defineProps({
  record: { type: Object, default: () => ({}) },
  parentSymbol: { type: String, default: '' },
  closed: { type: Boolean, default: true },
  masked: { type: Boolean, default: false }
})

const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)

const displayPair = computed(() => {
  const raw = props.record?.symbol || props.parentSymbol
  if (!raw) return '--'
  const normalized = copyTradePositionSymbol(
    { runningSymbol: raw, params: { runningSymbol: raw } },
    t18
  )
  if (/[\u4e00-\u9fff]/.test(normalized)) return normalized
  return symbolPair(raw)
})

const displayStatus = computed(() => {
  const raw =
    props.record?.statusText ||
    props.record?.positionStatusText ||
    props.record?.params?.statusText ||
    props.record?.params?.positionStatusText
  if (raw) {
    return copyTradePositionSymbol(
      { runningSymbol: String(raw), params: { runningSymbol: String(raw) } },
      t18
    )
  }
  if (props.closed) return t18('copy_trade_position_closed')
  return t18('copy_trade_position_holding')
})

function recordLeverageText(record) {
  const n = Number(record?.leverage)
  if (!Number.isFinite(n) || n <= 0) return ''
  const val = Number.isInteger(n) ? n : priceFormat(n, 2)
  return `${val}x`
}

function recordPnlRate(record) {
  const open = Number(record.openPrice)
  const close = Number(record.closePrice)
  if (!open || !Number.isFinite(close)) return '--'
  const raw =
    record.type === 1 ? _div(_sub(open, close), open) : _div(_sub(close, open), open)
  return priceFormat(_mul(raw, 100), 2)
}

</script>

<style lang="scss" scoped>
$green: #17ac74;
$red: #e8503a;
$muted: #888;

.position-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
}
.position-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.position-card__pair {
  .pair {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    margin-right: 6px;
  }
}
.status-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  &--open {
    background: rgba($green, 0.12);
    color: $green;
  }
  &--closed {
    background: #f2f2f2;
    color: $muted;
  }
}
.position-card__tags {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  &--long {
    background: rgba($green, 0.12);
    color: $green;
  }
  &--short {
    background: rgba($red, 0.12);
    color: $red;
  }
  &--muted {
    background: #f5f5f5;
    color: #666;
  }
}
.position-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 12px;
}
.cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  &--full {
    grid-column: 1 / -1;
  }
  .label {
    font-size: 12px;
    color: $muted;
  }
  .value {
    font-size: 14px;
    color: #1a1a1a;
    &.is-up {
      color: $green;
    }
    &.is-down {
      color: $red;
    }
  }
}
</style>
