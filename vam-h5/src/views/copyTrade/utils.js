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

/** 解析 institutionList 接口 data */
export function normalizeInstitutionListResponse(res) {
  const d = res?.data
  if (Array.isArray(d)) {
    return { list: d, banner: '' }
  }
  if (d && typeof d === 'object') {
    const list = d.list || d.records || d.rows || d.data || []
    const banner = d.banner || d.bannerUrl || d.imgUrl || ''
    return { list: Array.isArray(list) ? list : [], banner: banner || '' }
  }
  return { list: [], banner: '' }
}

export function institutionRowId(item) {
  return item?.institutionId ?? item?.id ?? ''
}

export function isInstitutionSubscribed(item) {
  if (item?.isSubscribed === true || item?.subscribed === true) return true
  if (item?.isSubscribed === 1 || item?.subscribed === 1) return true
  if (String(item?.isSubscribed) === 'true' || String(item?.subscribed) === 'true') return true
  return false
}

export function institutionSubscriberCount(item) {
  const n =
    item?.usePeopleCount ??
    item?.realUseCount ??
    item?.fakeUserCount ??
    item?.useCount ??
    0
  const num = Number(n)
  return Number.isFinite(num) ? num : 0
}

const SECRET_LOCK_PREFIX = 'copy_trade_inst_lock_'
const SECRET_LOCK_MS = 60 * 60 * 1000

export function getInstitutionSecretLockUntil(institutionId) {
  if (!institutionId) return 0
  try {
    const until = Number(localStorage.getItem(`${SECRET_LOCK_PREFIX}${institutionId}`))
    return Number.isFinite(until) && until > Date.now() ? until : 0
  } catch {
    return 0
  }
}

export function isInstitutionSecretLocked(institutionId) {
  return getInstitutionSecretLockUntil(institutionId) > Date.now()
}

export function setInstitutionSecretLock(institutionId, ms = SECRET_LOCK_MS) {
  if (!institutionId) return
  try {
    localStorage.setItem(`${SECRET_LOCK_PREFIX}${institutionId}`, String(Date.now() + ms))
  } catch {
    /* ignore */
  }
}

/** 后端锁定提示（连续错 5 次） */
export function isSecretKeyLockMessage(msg) {
  const s = String(msg || '')
  return s.includes('1小时') || s.includes('1 小时') || s.includes('锁定')
}

export function patchInstitutionSubscribed(list, institutionId, patch = {}) {
  const id = String(institutionId)
  return list.map((item) => {
    if (String(institutionRowId(item)) !== id) return item
    return {
      ...item,
      ...patch,
      subscribed: true,
      isSubscribed: true,
      subscribeText: patch.subscribeText || item.subscribeText || '已订阅'
    }
  })
}
