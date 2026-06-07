import { _mul, _div, priceFormat } from '@/utils/decimal'
import { formatLocalTime } from '@/utils/time'

/** 盈亏率 % */
export function calcPnlRate(profit, amount) {
  const a = Number(amount)
  const p = Number(profit)
  if (!a || !Number.isFinite(a) || !Number.isFinite(p)) return '0.00'
  return priceFormat(_mul(_div(p, a), 100), 2)
}

/** 进行中跟单盈亏：netProfit */
export function copyTradeNetProfit(item) {
  if (!item) return 0
  const params = item.params || {}
  const raw = params.netProfit ?? item.netProfit
  if (raw == null || raw === '') return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

/** 跟单交易次数：winCount + loseCount */
export function copyTradeTradeCount(item) {
  if (!item) return 0
  const params = item.params || {}
  const hasWinLose =
    params.winCount != null ||
    params.loseCount != null ||
    item.winCount != null ||
    item.loseCount != null
  if (hasWinLose) {
    const win = Number(params.winCount ?? item.winCount ?? 0)
    const lose = Number(params.loseCount ?? item.loseCount ?? 0)
    return (Number.isFinite(win) ? win : 0) + (Number.isFinite(lose) ? lose : 0)
  }
  const fallback = params.tradeCount ?? item.tradeCount
  return fallback != null && fallback !== '' ? Number(fallback) || 0 : 0
}

/** 跟单盈亏率 %：netProfit / amount * 100 */
export function copyTradePnlRate(item) {
  return calcPnlRate(copyTradeNetProfit(item), item?.amount)
}

const MIN_AMOUNT_KEYS = [
  'minAmount',
  'minCopyAmount',
  'copyMinAmount',
  'amountMin',
  'minFollowAmount',
  'followMinAmount',
  'copyAmountMin',
  'minInvestAmount'
]
const MAX_AMOUNT_KEYS = [
  'maxAmount',
  'maxCopyAmount',
  'copyMaxAmount',
  'amountMax',
  'maxFollowAmount',
  'followMaxAmount',
  'copyAmountMax',
  'maxInvestAmount'
]

function pickAmountField(src, keys) {
  if (!src || typeof src !== 'object') return null
  for (const key of keys) {
    const val = src[key]
    if (val != null && val !== '') {
      const n = Number(val)
      return Number.isFinite(n) ? n : val
    }
  }
  return null
}

/** 解析策略/机构跟单金额上下限 */
export function normalizeStrategyAmountRange(raw) {
  if (!raw || typeof raw !== 'object') return { minAmount: null, maxAmount: null }
  const nested = raw.strategy || raw.detail || raw.limit || raw.amountLimit || raw.rule || {}
  const src = { ...nested, ...raw }
  return {
    minAmount: pickAmountField(src, MIN_AMOUNT_KEYS),
    maxAmount: pickAmountField(src, MAX_AMOUNT_KEYS)
  }
}

/** 策略详情归一化（含金额范围） */
export function normalizeStrategyDetail(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const limits = normalizeStrategyAmountRange(raw)
  return { ...raw, ...limits }
}

/** 策略优先，机构详情兜底金额范围 */
export function resolveStrategyAmountRange(strategy = {}, institution = {}) {
  const fromStrategy = normalizeStrategyAmountRange(strategy)
  const fromInstitution = normalizeStrategyAmountRange(institution)
  return {
    minAmount: fromStrategy.minAmount ?? fromInstitution.minAmount ?? null,
    maxAmount: fromStrategy.maxAmount ?? fromInstitution.maxAmount ?? null
  }
}

/** 路由 query.data 解析策略快照 */
export function parseCopyTradeStrategyQuery(raw) {
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(String(raw)))
  } catch {
    try {
      return JSON.parse(decodeURI(String(raw)))
    } catch {
      return null
    }
  }
}

export function formatAmountRangeText(minAmount, maxAmount, fallback = '--') {
  const minText = minAmount != null && minAmount !== '' ? priceFormat(minAmount) : fallback
  const maxText = maxAmount != null && maxAmount !== '' ? priceFormat(maxAmount) : fallback
  return `${minText} ~ ${maxText} USDT`
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

/** 跟单当前持仓币种：优先 params.runningSymbol */
export function copyTradeRunningSymbol(item) {
  if (!item) return ''
  const params = item.params || {}
  const raw =
    params.runningSymbol ?? params.activeSymbol ?? params.currentCoin ?? item.runningSymbol ?? ''
  return String(raw || '').trim()
}

/** 当前持仓展示 */
export function copyTradePositionSymbol(item) {
  const running = copyTradeRunningSymbol(item)
  if (running) return running.toUpperCase()
  return '--'
}

function pickCopyTradeMillis(item, key) {
  if (!item) return null
  const params = item.params || {}
  const raw = params[key] ?? item[key]
  if (raw == null || raw === '') return null
  return raw
}

/** 策略开始时间（毫秒时间戳 → 设备本地时间） */
export function formatCopyTradeStrategyStartTime(item, fmt = 'YYYY-MM-DD HH:mm') {
  const ms = pickCopyTradeMillis(item, 'strategyStartTimeMillis')
  if (ms != null) return formatLocalTime(ms, fmt)
  const fallback = item?.startTime || item?.cycleStartTime
  if (!fallback) return '--'
  const formatted = formatLocalTime(fallback, fmt)
  return formatted !== '--' ? formatted : fallback
}

/** 策略结束时间（毫秒时间戳 → 设备本地时间） */
export function formatCopyTradeStrategyEndTime(item, fmt = 'YYYY-MM-DD HH:mm') {
  const ms = pickCopyTradeMillis(item, 'strategyEndTimeMillis')
  if (ms != null) return formatLocalTime(ms, fmt)
  const fallback = item?.endTime
  if (!fallback) return '--'
  const formatted = formatLocalTime(fallback, fmt)
  return formatted !== '--' ? formatted : fallback
}

/** 加入时间（毫秒时间戳 / ISO → 设备本地时间） */
export function formatCopyTradeJoinTime(item, fmt = 'YYYY-MM-DD HH:mm') {
  if (!item) return '--'
  const params = item.params || {}
  const ms = params.joinTimeMillis ?? item.joinTimeMillis
  if (ms != null) return formatLocalTime(ms, fmt)
  const fallback = item.joinTime ?? params.joinTime ?? item.startTime
  if (!fallback) return '--'
  const formatted = formatLocalTime(fallback, fmt)
  return formatted !== '--' ? formatted : fallback
}

/** 跟单详情接口响应归一化 */
export function normalizeCopyTradeDetailResponse(res) {
  const payload = res?.data
  if (!payload || typeof payload !== 'object') {
    return { meta: {}, orders: [] }
  }
  if (payload.id != null && !payload.orderList && !payload.order) {
    return { meta: payload, orders: [payload] }
  }
  const orders = []
  const seen = new Set()
  const pushOrder = (item) => {
    if (!item || item.id == null || seen.has(item.id)) return
    seen.add(item.id)
    orders.push(item)
  }
  // 优先 anchor 主单，再合并列表
  pushOrder(payload.order)
  ;(payload.orderList || []).forEach(pushOrder)
  return {
    meta: {
      strategyId: payload.strategyId,
      strategyName: payload.strategyName,
      statusFilter: payload.statusFilter,
      statusFilterText: payload.statusFilterText,
      anchorOrderId: payload.anchorOrderId,
      total: payload.total
    },
    orders
  }
}

/** 策略时间范围 */
export function formatCopyTradeStrategyTimeRange(item, fmt = 'YYYY-MM-DD HH:mm') {
  const start = formatCopyTradeStrategyStartTime(item, fmt)
  const end = formatCopyTradeStrategyEndTime(item, fmt)
  if (start === '--' && end === '--') return '--'
  if (start === '--') return end
  if (end === '--') return start
  return `${start} ~ ${end}`
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
    item?.useCount ??
    item?.usePeopleCount ??
    item?.realUseCount ??
    item?.fakeUserCount ??
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

/** 策略列表：是否已跟单（跟单中） */
export function isStrategyFollowing(item) {
  if (!item) return false
  const status = Number(item.followStatus)
  if (status === 1) return true
  const text = String(item.followStatusText || item.statusText || '')
  return /已跟单|跟单中/i.test(text)
}

function calcCopyDaysFromSubscribeTime(timeStr) {
  if (!timeStr) return null
  const ts = Date.parse(String(timeStr).replace(/-/g, '/'))
  if (!Number.isFinite(ts)) return null
  const diff = Math.floor((Date.now() - ts) / 86400000) + 1
  return diff > 0 ? diff : 1
}

/** 表现汇总字段归一化（入驻/订阅时间、跟单天数等） */
export function normalizePerfSummary(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const nested = raw.summary || raw.stat || raw.stats || raw.overview || raw.info || {}
  const src = { ...nested, ...raw }
  const subscribeTime =
    src.subscribeTime ||
    src.subscribeDate ||
    src.userSubscribeTime ||
    src.instSubscribeTime ||
    src.copyStartTime ||
    src.firstSubscribeTime ||
    src.startTime ||
    src.joinTime ||
    src.joinDate ||
    ''
  const copyDaysRaw =
    src.copyDays ??
    src.followDays ??
    src.copyDayCount ??
    src.followDayCount ??
    src.myCopyDays ??
    src.days ??
    null
  let copyDays =
    copyDaysRaw != null && copyDaysRaw !== '' ? Number(copyDaysRaw) : calcCopyDaysFromSubscribeTime(subscribeTime)
  if (!Number.isFinite(copyDays)) copyDays = null
  let tradingDays =
    src.tradingDays ??
    src.leadDays ??
    src.institutionTradingDays ??
    src.instTradingDays ??
    null
  if (tradingDays != null && tradingDays !== '') tradingDays = Number(tradingDays)
  if (!Number.isFinite(tradingDays)) tradingDays = null
  return {
    subscribeTime: subscribeTime || '',
    copyDays,
    joinTime:
      src.joinTime ||
      src.joinDate ||
      src.settleTime ||
      src.institutionJoinTime ||
      src.instJoinTime ||
      '',
    tradingDays,
    totalProfitRate: src.totalProfitRate ?? src.totalRate ?? src.profitRate,
    totalProfit: src.totalProfit ?? src.totalProfitAmt,
    rangeTotalProfitRate: src.rangeTotalProfitRate ?? src.rangeProfitRate
  }
}

/** 将接口多种字段格式统一为图表可用结构 */
function toArray(maybeList) {
  if (Array.isArray(maybeList)) return maybeList
  if (maybeList && typeof maybeList === 'object') {
    return Object.entries(maybeList).map(([key, val]) => {
      if (val && typeof val === 'object') {
        return { date: key, ...val }
      }
      return { date: key, dailyRate: val, rate: val, value: val }
    })
  }
  return []
}

function normalizeDailyRow(row, idx) {
  if (row == null) return null
  if (typeof row !== 'object') {
    const n = Number(row)
    return Number.isFinite(n) ? { date: String(idx + 1), dailyRate: n, cumulativeRate: n } : null
  }
  const date =
    row.date ||
    row.day ||
    row.statDate ||
    row.stat_date ||
    row.time ||
    row.label ||
    row.x ||
    row.name ||
    ''
  const dailyRate =
    row.dailyRate ??
    row.daily_rate ??
    row.dayRate ??
    row.day_rate ??
    row.rate ??
    row.profitRate ??
    row.profit_rate ??
    row.value ??
    row.y
  const cumulativeRate =
    row.cumulativeRate ??
    row.cumulative_rate ??
    row.totalRate ??
    row.total_rate ??
    row.accRate ??
    row.acc_rate
  if (date === '' && dailyRate == null && cumulativeRate == null) return null
  return { ...row, date: date || `D${idx + 1}`, dailyRate, cumulativeRate }
}

function normalizeWeeklyRow(row, idx) {
  if (row == null) return null
  if (typeof row !== 'object') {
    const n = Number(row)
    return Number.isFinite(n)
      ? { week: `${idx + 1}周`, weeklyRate: n, cumulativeRate: n }
      : null
  }
  const week =
    row.week ||
    row.weekLabel ||
    row.week_label ||
    row.label ||
    row.name ||
    (row.weekNo != null ? `${row.weekNo}周` : row.weekIndex != null ? `${row.weekIndex}周` : `${idx + 1}周`)
  const weeklyRate =
    row.weeklyRate ??
    row.weekly_rate ??
    row.weekRate ??
    row.week_rate ??
    row.rate ??
    row.profitRate ??
    row.value ??
    row.y
  const cumulativeRate = row.cumulativeRate ?? row.cumulative_rate ?? row.totalRate
  if (weeklyRate == null && cumulativeRate == null) return null
  return { ...row, week, weeklyRate, cumulativeRate }
}

/** 折线图优先用累计收益率；无累计字段时按日收益累加 */
export function buildDailyChartPoints(rows = []) {
  const list = toArray(rows)
    .map((row, idx) => normalizeDailyRow(row, idx))
    .filter(Boolean)
  if (!list.length) return []

  let acc = 0
  return list.map((row) => {
    const daily = Number(row.dailyRate)
    if (row.cumulativeRate != null && row.cumulativeRate !== '') {
      acc = Number(row.cumulativeRate) || 0
    } else if (Number.isFinite(daily)) {
      acc += daily
    }
    return {
      ...row,
      chartValue: Number.isFinite(acc) ? acc : 0
    }
  })
}

export function buildWeeklyChartPoints(rows = []) {
  return toArray(rows)
    .map((row, idx) => normalizeWeeklyRow(row, idx))
    .filter(Boolean)
    .map((row) => {
      const weekly = Number(row.weeklyRate)
      const cumulative = Number(row.cumulativeRate)
      const chartValue = Number.isFinite(cumulative)
        ? cumulative
        : Number.isFinite(weekly)
          ? Math.abs(weekly)
          : 0
      return { ...row, chartValue }
    })
}

export function normalizePerfData(raw) {
  if (!raw) return {}
  if (Array.isArray(raw)) {
    return { dailySeries: buildDailyChartPoints(raw) }
  }
  if (typeof raw !== 'object') return {}

  const dailyRaw =
    raw.dailySeries ||
    raw.dailyList ||
    raw.dailyChart ||
    raw.dailyData ||
    raw.daily ||
    raw.daySeries ||
    []
  const weeklyRaw =
    raw.weeklySeries ||
    raw.weeklyList ||
    raw.weeklyChart ||
    raw.weeklyData ||
    raw.weekly ||
    raw.weekSeries ||
    []
  return {
    ...raw,
    ...normalizePerfSummary(raw),
    dailySeries: buildDailyChartPoints(dailyRaw),
    weeklySeries: buildWeeklyChartPoints(weeklyRaw),
    coinPreference: normalizeCoinPreference(raw)
  }
}

/** 币种偏好列表归一化 */
export function normalizeCoinPreference(raw) {
  if (!raw) return []
  let list = []
  if (Array.isArray(raw)) {
    list = raw
  } else if (typeof raw === 'object') {
    const coinRaw =
      raw.coinPreference ||
      raw.coinPref ||
      raw.coins ||
      raw.coinList ||
      raw.list ||
      raw.data
    if (Array.isArray(coinRaw)) list = coinRaw
    else if (coinRaw && typeof coinRaw === 'object') list = toArray(coinRaw)
  }
  return list
    .map((row) => {
      if (!row || typeof row !== 'object') return null
      const rate = Number(
        row.rate ?? row.ratio ?? row.percent ?? row.percentage ?? row.proportion ?? 0
      )
      const count = Number(row.count ?? row.tradeCount ?? row.num ?? 0)
      const symbol = row.symbol || row.coin || row.coinName || row.name || ''
      if (!symbol && !rate && !count) return null
      return {
        ...row,
        symbol: symbol || '--',
        rate: Number.isFinite(rate) ? rate : 0,
        count: Number.isFinite(count) ? count : 0,
        icon: row.icon || row.logo || row.coinIcon || ''
      }
    })
    .filter(Boolean)
}

export function buildInstitutionChartPayload(institutionId, range) {
  const id = institutionId != null && institutionId !== '' ? institutionId : undefined
  return {
    institutionId: id,
    id,
    range: range || '7d'
  }
}
