import { _mul, _div, priceFormat } from '@/utils/decimal'

/** 盈亏率 % */
export function calcPnlRate(profit, amount) {
  const a = Number(amount)
  const p = Number(profit)
  if (!a || !Number.isFinite(a) || !Number.isFinite(p)) return '0.00'
  return priceFormat(_mul(_div(p, a), 100), 2)
}

export function formatPnl(val, digits = 2) {
  const n = Number(val)
  if (!Number.isFinite(n)) return '0.00'
  const prefix = n > 0 ? '+' : n < 0 ? '' : ''
  return `${prefix}${priceFormat(n, digits)}`
}

export function pnlClass(val) {
  const n = Number(val)
  if (n < 0) return 'is-down'
  return 'is-up'
}

export function symbolPair(symbol) {
  const s = (symbol || '').toUpperCase()
  if (!s) return '--'
  return s.includes('/') ? s : `${s}/USDT`
}

/** 机构分润比例展示，0 表示不分润 */
export function formatProfitShareRate(rate, noneText = '0%') {
  const n = Number(rate)
  if (!Number.isFinite(n) || n === 0) return noneText
  return `${priceFormat(n, 2)}%`
}
