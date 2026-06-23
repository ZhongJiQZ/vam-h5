<template>
  <div class="position-card">
    <div class="position-card__head">
      <div class="position-card__pair">
        <span class="pair">{{ displayPair }}</span>
        <span class="tag tag--muted">{{ _t18('copy_trade_usdt_contract') }}</span>
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
    <!-- 历史持仓：均价/时间双列网格，盈亏与盈亏率同行 -->
    <template v-if="closed">
      <div class="position-card__grid">
        <div class="cell">
          <span class="label">{{ _t18('copy_trade_open_price') }}</span>
          <span class="value ff-num">{{ masked ? MASK : priceFormat(record.openPrice, 4) }}</span>
        </div>
        <div class="cell cell--right">
          <span class="label">{{ _t18('copy_trade_open_time') }}</span>
          <span class="value value--time">{{ masked ? MASK : (record.openTime || '--') }}</span>
        </div>
        <div class="cell">
          <span class="label">{{ _t18('copy_trade_close_price') }}</span>
          <span class="value ff-num">{{ masked ? MASK : priceFormat(record.closePrice, 4) }}</span>
        </div>
        <div class="cell cell--right">
          <span class="label">{{ _t18('copy_trade_close_time') }}</span>
          <span class="value value--time">{{ masked ? MASK : (record.closeTime || '--') }}</span>
        </div>
        <div class="cell">
          <span class="label">{{ _t18('copy_trade_open_count') }}</span>
          <span class="value ff-num">{{ record.openNum }}</span>
        </div>
        <div class="cell cell--right">
          <span class="label">{{ _t18('copy_trade_margin') }}</span>
          <span class="value value--time">{{ record.margin }}</span>
        </div>
      </div>
      <div class="position-row position-row--pnl">
        <span class="position-row__left ff-num" :class="masked ? '' : pnlClass(record.earn)">
          {{ _t18('copy_trade_pnl_label') }}{{ masked ? MASK : formatPnl(record.earn) }}
        </span>
        <span class="position-row__right ff-num" :class="masked ? '' : pnlClass(record.earn)">
          {{ _t18('copy_trade_pnl_rate') }} {{ masked ? MASK : `${recordPnlRate(record)}%` }}
        </span>
      </div>
    </template>
    <template v-else>
      <div class="position-card__grid">
        <div class="cell">
          <span class="label">{{ _t18('copy_trade_open_count') }}</span>
          <span class="value ff-num">{{ record.openNum }}</span>
        </div>
        <div class="cell cell--right cell--grid-col-2">
          <span class="label">{{ _t18('copy_trade_open_price') }}</span>
          <span class="value ff-num">{{ priceFormat(record.openPrice, 4) }}</span>
        </div>
        <div class="cell">
          <span class="label">{{ _t18('copy_trade_margin') }}</span>
          <span class="value ff-num">{{ record.margin }}</span>
        </div>
        <div class="cell cell--right cell--grid-col-2">
          <span class="label">{{ _t18('copy_trade_open_time') }}</span>
          <span class="value">{{ record.openTime || '--' }}</span>
        </div>
        <div class="cell">
          <span class="label">{{ _t18('option_now_price') }}</span>
          <span class="value ff-num">{{ liveCloseText }}</span>
        </div>
        <div class="cell cell--right cell--grid-col-2">
          <span class="label">{{ _t18('copy_trade_pnl_usdt') }}</span>
          <span class="value ff-num" :class="masked ? '' : pnlClass(record.earn)">{{ masked ? MASK :
            formatPnl(record.earn) }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { _t18 } from '@/utils/public'
import { _div, _mul, _sub, priceFormat } from '@/utils/decimal'

import { symbolPair, formatPnl, pnlClass, formatSignedRate, formatWaitBuyPositionLabel, isWaitBuyPositionStatus } from '../utils'
import { useTradeStore } from '@/store/trade/index'
const tradeStore = useTradeStore()

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
  const raw =
    props.record?.symbol ||
    props.record?.coin ||
    props.record?.coinSymbol ||
    props.parentSymbol
  if (!raw) return '--'
  const trimmed = String(raw).trim()
  if (isWaitBuyPositionStatus(trimmed)) return formatWaitBuyPositionLabel(t18)
  if (/[\u4e00-\u9fff]/.test(trimmed)) return trimmed
  return symbolPair(trimmed)
})

const coin = computed(() => {
  const raw = props.record?.symbol || props.record?.coin || props.record?.coinSymbol || props.parentSymbol || ''
  let key = String(raw).trim()
  if (!key) return ''
  if (key.includes('/')) key = key.split('/')[0]
  if (key.includes('USDT')) key = key.replace('/USDT', '').replace('USDT', '')
  return key.toLowerCase()
})

const liveCloseText = computed(() => {
  if (props.closed) return '--'
  const key = coin.value
  let price = key ? tradeStore.allCoinPriceInfo[key]?.close : null
  if (price == null || price === '') {
    price =
      props.record?.closePrice ??
      props.record?.markPrice ??
      props.record?.currentPrice ??
      props.record?.lastPrice
  }
  if (price == null || price === '') return '--'
  return priceFormat(price, 4)
})

const displayStatus = computed(() => {
  const raw =
    props.record?.statusText ||
    props.record?.positionStatusText ||
    props.record?.params?.statusText ||
    props.record?.params?.positionStatusText
  if (raw) {
    const text = String(raw).trim()
    if (isWaitBuyPositionStatus(text)) return formatWaitBuyPositionLabel(t18)
    return text
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
  const earn = Number(record.earn)
  const margin = Number(record.margin)
  if (Number.isFinite(earn) && Number.isFinite(margin) && margin > 0) {
    return formatSignedRate(_mul(_div(earn, margin), 100), 2)
  }
  const open = Number(record.openPrice)
  const close = Number(record.closePrice)
  const leverage = Number(record.leverage)
  if (!open || !Number.isFinite(close)) return '--'
  const pricePct =
    record.type === 1 ? _div(_sub(open, close), open) : _div(_sub(close, open), open)
  const rate = Number.isFinite(leverage) && leverage > 0 ? _mul(pricePct, leverage) : pricePct
  return formatSignedRate(_mul(rate, 100), 2)
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

.position-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  line-height: 1.4;

  &--pnl {
    margin-top: 10px;
  }
}

.position-row__left {
  flex: 1;
  min-width: 0;
  color: #1a1a1a;

  &.is-up {
    color: $green;
  }

  &.is-down {
    color: $red;
  }
}

.position-row__right {
  flex-shrink: 0;
  text-align: right;
  color: #1a1a1a;
  font-size: 13px;

  &.is-up {
    color: $green;
  }

  &.is-down {
    color: $red;
  }
}

.position-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 12px;

  &:only-child {
    padding-bottom: 23px;
  }
}

.cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  &--grid-col-2 {
    grid-column: 2;
  }

  &--right {
    align-items: flex-end;
    text-align: right;
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

    &--time {
      font-size: 12px;
      line-height: 1.3;
      white-space: nowrap;
    }
  }
}
</style>
