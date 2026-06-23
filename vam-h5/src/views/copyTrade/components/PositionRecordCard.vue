<template>
  <div class="position-card">
    <div class="board-head">
      <div class="board-head__left">
        <div class="board-coin" aria-hidden="true">{{ coinInitial }}</div>
        <span class="board-pair">{{ displayPairCompact }}</span>
        <span class="board-tag">{{ _t18('copy_trade_perp') }}</span>
        <template v-if="masked">
          <span class="board-tag">{{ _t18('copy_trade_cross') }}</span>
        </template>
        <template v-else>
          <span v-if="record.type != null" class="board-tag" :class="record.type === 0 ? 'board-tag--long' : 'board-tag--short'">
            {{ record.type === 0 ? _t18('copy_trade_long') : _t18('copy_trade_short') }}
          </span>
          <span class="board-tag">{{ _t18('copy_trade_cross') }}</span>
          <span v-if="recordLeverageText(record)" class="board-tag">{{ recordLeverageText(record) }}</span>
        </template>
      </div>
      <span class="board-status" :class="{ 'board-status--closed': closed }">{{ displayStatus }}</span>
    </div>

    <div class="board-hero">
      <div class="board-hero__metric">
        <span class="board-hero__label">{{ _t18('copy_trade_pnl_usdt') }}</span>
        <span class="board-hero__value ff-num" :class="masked ? '' : pnlClass(record.earn)">
          {{ masked ? MASK : formatPnl(record.earn) }}
        </span>
      </div>
      <div class="board-hero__metric board-hero__metric--right">
        <span class="board-hero__label">{{ _t18('copy_trade_roi') }}</span>
        <span class="board-hero__value ff-num" :class="masked ? '' : pnlClass(record.earn)">
          {{ masked ? MASK : `${recordPnlRate(record)}%` }}
        </span>
      </div>
    </div>

    <div class="board-grid">
      <div class="board-cell">
        <span class="board-cell__label">{{ _t18('copy_trade_position_size_usdt') }}</span>
        <span class="board-cell__value ff-num">{{ positionSizeUsdtText }}</span>
      </div>
      <div class="board-cell">
        <span class="board-cell__label">{{ _t18('copy_trade_margin') }} (USDT)</span>
        <span class="board-cell__value ff-num">{{ record.margin ?? '--' }}</span>
      </div>
      <div class="board-cell board-cell--right">
        <span class="board-cell__label">{{ _t18('copy_trade_margin_ratio') }}</span>
        <span class="board-cell__value ff-num">{{ marginRatioText }}</span>
      </div>
      <div class="board-cell">
        <span class="board-cell__label">{{ _t18('copy_trade_open_price') }} (USDT)</span>
        <span class="board-cell__value ff-num">{{ priceFormat(record.openPrice, 4) }}</span>
      </div>
      <div class="board-cell">
        <span class="board-cell__label">
          {{ closed ? _t18('copy_trade_close_price') : _t18('copy_trade_mark_price') }} (USDT)
        </span>
        <span class="board-cell__value ff-num">
          {{ closed ? (masked ? MASK : priceFormat(record.closePrice, 4)) : liveCloseText }}
        </span>
      </div>
      <div class="board-cell board-cell--right">
        <span class="board-cell__label">{{ _t18('copy_trade_open_time') }}</span>
        <span class="board-cell__value board-cell__value--time">{{ openTimeText }}</span>
      </div>
    </div>

    <div v-if="closed" class="board-meta">
      <span class="board-meta__label">{{ _t18('copy_trade_close_time') }}</span>
      <span class="board-meta__value">{{ closeTimeText }}</span>
    </div>
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

const displayPairCompact = computed(() => {
  const pair = displayPair.value
  if (!pair || pair === '--') return '--'
  if (/[\u4e00-\u9fff]/.test(pair)) return pair
  return String(pair).replace(/\//g, '').replace(/-/g, '').toUpperCase()
})

const coin = computed(() => {
  const raw = props.record?.symbol || props.record?.coin || props.record?.coinSymbol || props.parentSymbol || ''
  let key = String(raw).trim()
  if (!key) return ''
  if (key.includes('/')) key = key.split('/')[0]
  if (key.includes('USDT')) key = key.replace('/USDT', '').replace('USDT', '')
  return key.toLowerCase()
})

const coinInitial = computed(() => {
  const key = coin.value
  if (!key) return '?'
  return key.charAt(0).toUpperCase()
})

const openTimeText = computed(() => props.record?.openTime || '--')

const closeTimeText = computed(() => {
  if (props.masked) return MASK
  return props.record?.closeTime || '--'
})

const liveCloseNum = computed(() => {
  if (props.closed) return null
  const key = coin.value
  let price = key ? tradeStore.allCoinPriceInfo[key]?.close : null
  if (price == null || price === '') {
    price =
      props.record?.closePrice ??
      props.record?.markPrice ??
      props.record?.currentPrice ??
      props.record?.lastPrice
  }
  const n = Number(price)
  return Number.isFinite(n) ? n : null
})

const referencePriceNum = computed(() => {
  if (props.closed) {
    const close = Number(props.record?.closePrice)
    return Number.isFinite(close) && close > 0 ? close : null
  }
  return liveCloseNum.value
})

const liveCloseText = computed(() => {
  if (props.closed) return '--'
  if (liveCloseNum.value == null) return '--'
  return priceFormat(liveCloseNum.value, 4)
})

const positionSizeUsdtText = computed(() => {
  const num = Number(props.record?.openNum)
  const price = referencePriceNum.value ?? Number(props.record?.openPrice)
  if (!Number.isFinite(num) || !Number.isFinite(price) || price <= 0) return '--'
  return priceFormat(_mul(num, price), 2)
})

const marginRatioText = computed(() => {
  const margin = Number(props.record?.margin)
  const num = Number(props.record?.openNum)
  const price = referencePriceNum.value ?? Number(props.record?.openPrice)
  if (!Number.isFinite(margin) || !Number.isFinite(num) || !Number.isFinite(price) || price <= 0) {
    return '--'
  }
  const notional = _mul(num, price)
  if (!notional || Number(notional) <= 0) return '--'
  return `${priceFormat(_mul(_div(margin, notional), 100), 2)}%`
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
  return `${val}X`
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
$muted: #8b95a5;

.position-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
}

.board-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f2f4f7;
}

.board-head__left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.board-coin {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1fc87a, #17ac74);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(23, 172, 116, 0.25);
}

.board-pair {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.02em;
}

.board-tag {
  font-size: 10px;
  line-height: 1;
  padding: 4px 7px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;

  &--long {
    background: rgba($green, 0.1);
    color: $green;
  }

  &--short {
    background: rgba($red, 0.1);
    color: $red;
  }
}

.board-status {
  flex-shrink: 0;
  font-size: 11px;
  line-height: 1;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba($green, 0.1);
  color: $green;
  font-weight: 500;

  &--closed {
    background: #f3f4f6;
    color: $muted;
  }
}

.board-hero {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 14px;
  border-radius: 12px;
  background: #f8fafc;
}

.board-hero__metric {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--right {
    align-items: flex-end;
    text-align: right;
  }
}

.board-hero__label {
  font-size: 12px;
  color: $muted;
}

.board-hero__value {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.1;
  color: #111827;

  &.is-up {
    color: $green;
  }

  &.is-down {
    color: $red;
  }
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 8px;
}

.board-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;

  &--right {
    align-items: flex-end;
    text-align: right;
  }
}

.board-cell__label {
  font-size: 11px;
  color: $muted;
  line-height: 1.3;
}

.board-cell__value {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  line-height: 1.3;
  word-break: break-all;

  &--time {
    font-size: 11px;
    font-weight: 400;
    line-height: 1.35;
  }

  &.is-up {
    color: $green;
  }

  &.is-down {
    color: $red;
  }
}

.board-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f2f4f7;
}

.board-meta__label {
  flex-shrink: 0;
  font-size: 12px;
  color: $muted;
}

.board-meta__value {
  font-size: 12px;
  color: #374151;
  text-align: right;
  line-height: 1.35;
}
</style>
