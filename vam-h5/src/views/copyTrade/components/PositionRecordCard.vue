<template>
  <div class="position-card">
    <div class="position-card__head">
      <div class="position-card__pair">
        <span class="pair">{{ symbolPair(record.symbol || parentSymbol) }}</span>
        <span class="tag tag--muted">{{ _t18('copy_trade_usdt_contract') }}</span>
      </div>
      <span class="status-tag" :class="closed ? 'status-tag--closed' : 'status-tag--open'">
        {{ closed ? _t18('copy_trade_position_closed') : _t18('copy_trade_position_holding') }}
      </span>
    </div>
    <div class="position-card__tags">
      <span v-if="record.type != null" class="tag" :class="record.type === 0 ? 'tag--long' : 'tag--short'">
        {{ record.type === 0 ? _t18('copy_trade_long') : _t18('copy_trade_short') }}
      </span>
      <span class="tag tag--muted">{{ _t18('copy_trade_cross') }}</span>
    </div>
    <div class="position-card__grid">
      <div class="cell">
        <span class="label">{{ _t18('copy_trade_open_price') }}</span>
        <span class="value ff-num">{{ priceFormat(record.openPrice) }}</span>
      </div>
      <div class="cell">
        <span class="label">{{ _t18('copy_trade_pnl_usdt') }}</span>
        <span class="value ff-num" :class="pnlClass(record.earn)">{{ formatPnl(record.earn) }}</span>
      </div>
      <div class="cell">
        <span class="label">{{ _t18('copy_trade_close_price') }}</span>
        <span class="value ff-num">{{ priceFormat(record.closePrice) }}</span>
      </div>
      <div class="cell">
        <span class="label">{{ _t18('copy_trade_pnl_rate') }}</span>
        <span class="value ff-num" :class="pnlClass(record.earn)">{{ recordPnlRate(record) }}%</span>
      </div>
      <div class="cell cell--full">
        <span class="label">{{ _t18('copy_trade_open_time') }}</span>
        <span class="value">{{ record.openTime || '--' }}</span>
      </div>
      <div class="cell cell--full">
        <span class="label">{{ _t18('copy_trade_close_time') }}</span>
        <span class="value">{{ record.closeTime || '--' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { _t18 } from '@/utils/public'
import { _div, _mul, _sub, priceFormat } from '@/utils/decimal'
import { symbolPair, formatPnl, pnlClass } from '../utils'

function recordPnlRate(record) {
  const open = Number(record.openPrice)
  const close = Number(record.closePrice)
  if (!open || !Number.isFinite(close)) return '--'
  const raw =
    record.type === 1 ? _div(_sub(open, close), open) : _div(_sub(close, open), open)
  return priceFormat(_mul(raw, 100), 2)
}

defineProps({
  record: { type: Object, default: () => ({}) },
  parentSymbol: { type: String, default: '' },
  closed: { type: Boolean, default: true }
})
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
