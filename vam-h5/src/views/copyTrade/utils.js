import { _mul, _div, priceFormat } from '@/utils/decimal'
import { formatLocalTime } from '@/utils/time'
import dayjs from 'dayjs'

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
  const strategy = item.strategy || {}
  const raw =
    params.runningSymbol ??
    params.activeSymbol ??
    params.currentCoin ??
    params.symbol ??
    item.runningSymbol ??
    item.symbol ??
    strategy.symbol ??
    ''
  return String(raw || '').trim()
}

export function isWaitBuyPositionStatus(text) {
  const s = String(text || '').trim()
  return /^等待买入$/i.test(s) || /^wait(ing)?\s*(to\s*)?buy$/i.test(s)
}

export function formatWaitBuyPositionLabel(translate) {
  if (typeof translate === 'function') {
    const msg = translate('copy_trade_wait_institution_buy')
    if (msg && msg !== 'copy_trade_wait_institution_buy') return msg
  }
  return '等待机构买入'
}

/** 策略执行已结束（展示为已结束，待手动退出或强平） */
export function isCopyTradeStrategyEnded(item) {
  if (!item || item.status === 1) return true
  const params = item.params || {}
  if (params.displayStatus === 1) return true
  if (params.strategySessionEnded != null) return Boolean(params.strategySessionEnded)
  return params.statusTextKey === 'copy.trade.order.status.exited'
}

/** 策略结束后、强平前可手动退出 */
export function canManualExitCopyTrade(item) {
  if (!item || item.status === 1) return false
  return Boolean(item.params?.canManualExit)
}

export function copyTradeOrderBadgeClass(item) {
  return isCopyTradeStrategyEnded(item) ? 'badge--settled' : 'badge--ongoing'
}

export function copyTradeOrderStatusText(item, translate) {
  if (item?.params?.statusText) return item.params.statusText
  if (typeof translate === 'function') {
    return isCopyTradeStrategyEnded(item)
      ? translate('copy_trade_status_exited')
      : translate('copy_trade_tab_ongoing')
  }
  return isCopyTradeStrategyEnded(item) ? '跟单结束' : '跟单中'
}

function copyTradeHasRecordSymbol(item) {
  const records = item?.records
  if (!Array.isArray(records) || !records.length) return false
  return records.some((rec) => {
    const sym = rec?.symbol || rec?.coin || rec?.coinSymbol || rec?.symbolName
    return sym && !isWaitBuyPositionStatus(String(sym).trim())
  })
}

/** 进行中且尚无成交时展示等待买入 */
export function copyTradeShouldShowWaitBuy(item) {
  if (!item || item.status === 1) return false
  const running = copyTradeRunningSymbol(item)
  if (running && !isWaitBuyPositionStatus(running)) return false
  if (copyTradeHasRecordSymbol(item)) return false
  const params = item.params || {}
  if (params.activeSymbolKey === 'copy.trade.symbol.wait_buy') return true
  return copyTradeTradeCount(item) <= 0
}

/** 当前持仓展示（等待买入 → 等待机构买入） */
export function copyTradePositionSymbol(item, translate) {
  if (copyTradeShouldShowWaitBuy(item)) {
    return formatWaitBuyPositionLabel(translate)
  }
  const running = copyTradeRunningSymbol(item)
  if (!running) return '--'
  const trimmed = String(running).trim()
  if (isWaitBuyPositionStatus(trimmed)) {
    return formatWaitBuyPositionLabel(translate)
  }
  if (/[\u4e00-\u9fff]/.test(trimmed)) return trimmed
  return trimmed.toUpperCase()
}

function pickCopyTradeMillis(item, key) {
  if (!item) return null
  const params = item.params || {}
  const strategy = item.strategy || {}
  const raw = params[key] ?? item[key] ?? strategy[key]
  if (raw == null || raw === '') return null
  return raw
}

function formatStrategyExecuteTime(raw, dailyTimeEnabled, fmt = 'YYYY-MM-DD HH:mm') {
  if (raw == null || raw === '') return '--'
  const s = String(raw)
  const useDaily =
    (dailyTimeEnabled === 1 || dailyTimeEnabled === true) &&
    (s.startsWith('2000-01-01') || s.includes('2000-01-01'))
  if (useDaily) {
    const d = dayjs(raw)
    return d.isValid() ? d.format('HH:mm') : '--'
  }
  const formatted = formatLocalTime(raw, fmt)
  return formatted !== '--' ? formatted : s
}

/** 策略开始时间（毫秒时间戳 → 设备本地时间） */
export function formatCopyTradeStrategyStartTime(item, fmt = 'YYYY-MM-DD HH:mm') {
  const ms = pickCopyTradeMillis(item, 'strategyStartTimeMillis')
  if (ms != null) return formatLocalTime(ms, fmt)
  if (item?.executeStartTime) {
    return formatStrategyExecuteTime(item.executeStartTime, item.dailyTimeEnabled, fmt)
  }
  const fallback = item?.startTime || item?.cycleStartTime
  if (!fallback) return '--'
  const formatted = formatLocalTime(fallback, fmt)
  return formatted !== '--' ? formatted : fallback
}

/** 策略结束时间（毫秒时间戳 → 设备本地时间） */
export function formatCopyTradeStrategyEndTime(item, fmt = 'YYYY-MM-DD HH:mm') {
  const ms = pickCopyTradeMillis(item, 'strategyEndTimeMillis')
  if (ms != null) return formatLocalTime(ms, fmt)
  if (item?.executeEndTime) {
    return formatStrategyExecuteTime(item.executeEndTime, item.dailyTimeEnabled, fmt)
  }
  const fallback = item?.endTime
  if (!fallback) return '--'
  const formatted = formatLocalTime(fallback, fmt)
  return formatted !== '--' ? formatted : fallback
}

/** 策略加入条件：下级跟单人数门槛 */
export function getActiveSubCount(item) {
  if (!item) return 0
  const raw = item.activeSubCount ?? item.params?.activeSubCount
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function hasActiveSubCountCondition(item) {
  return getActiveSubCount(item) > 0
}

export function formatActiveSubCountCondition(item, translate) {
  const n = getActiveSubCount(item)
  if (n <= 0) return ''
  const text = typeof translate === 'function' ? translate('copy_trade_active_sub_count_gt') : ''
  if (!text || text === 'copy_trade_active_sub_count_gt') {
    return `下级跟单人数＞${n}`
  }
  return text.replace('{n}', String(n))
}

/** 策略收益率区间 */
export function formatStrategyProfitRateRange(item) {
  if (!item) return '--'
  const min = item.profitRateMin ?? item.profitRate
  const max = item.profitRateMax ?? item.profitRate
  const minN = Number(min)
  const maxN = Number(max)
  const fmt = (n) => (Number.isFinite(n) ? `${priceFormat(n, 2)}%` : '--')
  if (!Number.isFinite(minN) && !Number.isFinite(maxN)) return '--'
  if (!Number.isFinite(minN)) return fmt(maxN)
  if (!Number.isFinite(maxN)) return fmt(minN)
  if (minN === maxN) return fmt(minN)
  return `${priceFormat(minN, 2)}% ~ ${priceFormat(maxN, 2)}%`
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

  const normalizeRecords = (list) =>
    (Array.isArray(list) ? list : []).map(normalizeCopyTradeRecord).filter(Boolean)

  // 旧版：单订单扁平结构
  if (payload.id != null && !payload.order && !payload.orderList) {
    return { meta: {}, orders: [{ ...payload, records: normalizeRecords(payload.records) }] }
  }

  // 新版：institution + strategy + order + records
  if (payload.order) {
    const strategy = payload.strategy || {}
    const institution = payload.institution || {}
    const records = normalizeRecords(
      Array.isArray(payload.records)
        ? payload.records
        : Array.isArray(payload.order.records)
          ? payload.order.records
          : []
    )
    const order = {
      ...payload.order,
      records,
      strategy,
      institution,
      strategyName: payload.order.strategyName || strategy.strategyName,
      strategyId: payload.order.strategyId ?? strategy.strategyId,
      icon: payload.order.icon || institution.logo,
      institutionName: institution.institutionName,
      institutionId: institution.institutionId,
      strategyStartTimeMillis:
        strategy.strategyStartTimeMillis ?? payload.order.strategyStartTimeMillis,
      strategyEndTimeMillis:
        strategy.strategyEndTimeMillis ?? payload.order.strategyEndTimeMillis
    }
    return {
      meta: {
        strategyId: strategy.strategyId,
        strategyName: strategy.strategyName,
        recordsStatusFilter: payload.status,
        recordsStatusFilterText: payload.statusText,
        institution,
        strategy
      },
      orders: [order]
    }
  }

  // 旧版：orderList 列表结构
  const orders = []
  const seen = new Set()
  const pushOrder = (item) => {
    if (!item || item.id == null || seen.has(item.id)) return
    seen.add(item.id)
    orders.push({ ...item, records: normalizeRecords(item.records) })
  }
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

/** 子单时间戳（毫秒）→ 展示时间 */
export function formatCopyTradeRecordMillis(millis) {
  const n = Number(millis)
  if (!Number.isFinite(n) || n <= 0) return ''
  return formatLocalTime(n)
}

/** 归一化 list/detail 中的子单 records */
export function normalizeCopyTradeRecord(raw) {
  if (!raw || typeof raw !== 'object') return null
  const openTime =
    raw.openTime ||
    formatCopyTradeRecordMillis(raw.openTimeMillis) ||
    ''
  const closeTime =
    raw.closeTime ||
    formatCopyTradeRecordMillis(raw.closeTimeMillis) ||
    ''
  return {
    ...raw,
    openTime: openTime || raw.openTime,
    closeTime: closeTime || raw.closeTime,
    openPrice: raw.openPrice ?? raw.avgOpenPrice ?? raw.openAvgPrice,
    closePrice: raw.closePrice ?? raw.avgClosePrice ?? raw.closeAvgPrice,
    earn: raw.earn ?? raw.pnl ?? raw.profit,
    symbol:
      raw.symbol ||
      raw.coin ||
      raw.coinSymbol ||
      raw.symbolName ||
      raw.coinName ||
      raw.pair ||
      '',
    leverage: raw.leverage ?? raw.lever
  }
}

/** 子单归属日期（用于每日战绩分组） */
export function copyTradeRecordDayKey(record) {
  if (!record) return ''
  const ms = record.closeTimeMillis ?? record.openTimeMillis
  if (ms != null && ms !== '') {
    const d = dayjs(Number(ms))
    if (d.isValid()) return d.format('YYYY-MM-DD')
  }
  const time = record.closeTime || record.openTime
  if (time) {
    const d = dayjs(time)
    if (d.isValid()) return d.format('YYYY-MM-DD')
    const part = String(time).split(' ')[0]
    if (part) return part
  }
  return ''
}

/** 我的跟单列表：按日战绩（不含历史持仓汇总块） */
export function groupCopyTradeDailyBattleRecords(records) {
  const holding = []
  const dayMap = new Map()
  ;(Array.isArray(records) ? records : []).forEach((rec) => {
    if (!isCopyTradeRecordClosed(rec)) {
      holding.push(rec)
      return
    }
    const day = copyTradeRecordDayKey(rec) || 'unknown'
    if (!dayMap.has(day)) dayMap.set(day, [])
    dayMap.get(day).push(rec)
  })
  const days = Array.from(dayMap.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, list]) => ({ date, records: list }))
  return { holding, days }
}

/** 子单 status：0=持仓中 1=已平仓 */
export function isCopyTradeRecordClosed(record) {
  const s = Number(record?.status)
  if (s === 1) return true
  if (s === 0) return false
  return record?.closed === true || Boolean(record?.closeTime || record?.closeTimeMillis)
}

/** 是否有有效跟单金额（无或 0 视为未跟单） */
export function copyTradeHasAmount(item) {
  const amt = Number(item?.amount ?? item?.params?.copyAmount)
  return Number.isFinite(amt) && amt > 0
}

/** 子单分组：先持仓中，后历史持仓 */
export function splitCopyTradeRecords(records) {
  const holding = []
  const closed = []
  ;(Array.isArray(records) ? records : []).forEach((rec) => {
    if (isCopyTradeRecordClosed(rec)) closed.push(rec)
    else holding.push(rec)
  })
  return { holding, closed }
}

export function normalizeCopyTradeListRow(row) {
  if (!row || typeof row !== 'object') return row
  const records = (Array.isArray(row.records) ? row.records : [])
    .map(normalizeCopyTradeRecord)
    .filter(Boolean)
  return { ...row, records }
}

/** 解析 list 接口 data（兼容 rows / data.rows） */
export function normalizeCopyTradeListResponse(res) {
  const payload = res?.data
  const rows = Array.isArray(res?.rows)
    ? res.rows
    : Array.isArray(payload?.rows)
      ? payload.rows
      : Array.isArray(payload)
        ? payload
        : []
  const total =
    res?.total ??
    payload?.total ??
    rows.length
  return {
    total: Number(total) || 0,
    rows: rows.map(normalizeCopyTradeListRow)
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

/** 策略列表：是否已跟单（等待启动 / 跟单中，followStatus 3/4） */
export function isStrategyFollowing(item) {
  if (!item) return false
  const status = Number(item.followStatus)
  if (status === 3 || status === 4) return true
  const text = String(item.followStatusText || item.statusText || '')
  return /跟单中|等待启动|已跟单/i.test(text)
}

function getStrategyStartMillis(item) {
  if (!item) return null
  const ms = pickCopyTradeMillis(item, 'strategyStartTimeMillis')
  if (ms != null) return ms
  const raw = item.startTime || item.cycleStartTime || item.executeStartTime
  if (raw == null || raw === '') return null
  const ts = Date.parse(String(raw).replace(/-/g, '/'))
  return Number.isFinite(ts) ? ts : null
}

/** 策略列表：暂未开始（不可加入且未到策略开始时间） */
export function isStrategyNotStarted(item) {
  if (!item) return false
  const status = Number(item.followStatus)
  if (status === 0) return true
  const text = String(item.followStatusText || item.statusText || '')
  if (/暂未开始|未开启|等待开启|尚未开始|not started|not open/i.test(text)) return true
  if (item.canJoin !== false) return false
  const startMs = getStrategyStartMillis(item)
  return startMs != null && startMs > Date.now()
}

/** 策略不可加入时的提示文案 */
export function getStrategyJoinBlockMessage(item, translate) {
  const t = typeof translate === 'function' ? translate : () => ''
  if (isStrategyNotStarted(item)) {
    const msg = t('copy_trade_strategy_not_started')
    return msg && msg !== 'copy_trade_strategy_not_started' ? msg : '暂未开启策略，请等待'
  }
  const fromApi = String(item?.followStatusText || item?.statusText || '').trim()
  if (fromApi) return fromApi
  const fallback = t('copy_trade_unjoinable')
  return fallback && fallback !== 'copy_trade_unjoinable' ? fallback : '当前不可加入'
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
