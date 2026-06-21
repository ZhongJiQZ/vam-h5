import { _mul, _div, priceFormat, _toFixed } from '@/utils/decimal'
import { formatLocalTime } from '@/utils/time'
import dayjs from 'dayjs'

/** 跟单金额精度（USDT 两位小数，提交时向下截断避免超额） */
export const COPY_TRADE_AMOUNT_DECIMALS = 2

/** 跟单金额向下截断到指定精度，无效值返回 null */
export function normalizeCopyTradeAmount(val, decimals = COPY_TRADE_AMOUNT_DECIMALS) {
  if (val === '' || val == null) return null
  const n = Number(val)
  if (!Number.isFinite(n) || n <= 0) return null
  return Number(_toFixed(n, decimals, 'down'))
}

/** 跟单页余额展示（向下截断，避免四舍五入高于接口真实可用余额） */
export function formatCopyTradeBalance(val, decimals = COPY_TRADE_AMOUNT_DECIMALS) {
  if (val === '' || val == null) return '0.00'
  const n = Number(val)
  if (!Number.isFinite(n) || n <= 0) return '0.00'
  return _toFixed(n, decimals, 'down')
}

/** 全额填入：min(余额, 上限) 后向下截断，避免四舍五入导致超额 */
export function resolveCopyTradeFillAmount(balance, limits = {}, decimals = COPY_TRADE_AMOUNT_DECIMALS) {
  const bal = normalizeCopyTradeAmount(balance, decimals)
  if (bal == null) return ''

  const rawMax =
    limits.maxAmount != null && limits.maxAmount !== '' ? Number(limits.maxAmount) : null
  const maxCap =
    Number.isFinite(rawMax) && rawMax > 0 ? normalizeCopyTradeAmount(rawMax, decimals) : null

  let fill = bal
  if (maxCap != null) fill = Math.min(fill, maxCap)

  const rawMin =
    limits.minAmount != null && limits.minAmount !== '' ? Number(limits.minAmount) : null
  if (Number.isFinite(rawMin) && rawMin > 0 && fill < rawMin) return ''

  return fill > 0 ? String(fill) : ''
}

/** 带正负号的比率展示（正数带 +，如 +3.49） */
export function formatSignedRate(val, digits = 2) {
  const n = Number(val)
  if (!Number.isFinite(n)) return '0.00'
  const formatted = priceFormat(n, digits)
  const prefix = n > 0 ? '+' : ''
  return `${prefix}${formatted}`
}

/** 盈亏率 % */
export function calcPnlRate(profit, amount) {
  const a = Number(amount)
  const p = Number(profit)
  if (!a || !Number.isFinite(a) || !Number.isFinite(p)) return '0.00'
  return formatSignedRate(_mul(_div(p, a), 100), 2)
}

/** 跟单日期展示（兼容中文「年月日」、时间戳、ISO 字符串） */
export function formatCopyTradeDisplayDate(raw, fmt = 'YYYY-MM-DD') {
  if (raw === null || raw === undefined || raw === '') return '--'
  const s = String(raw).trim()
  const cn = s.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/)
  if (cn) {
    const d = dayjs(`${cn[1]}-${cn[2]}-${cn[3]}`)
    return d.isValid() ? d.format(fmt) : s
  }
  const ms = Number(s)
  if (/^\d+$/.test(s) && Number.isFinite(ms) && ms > 0) {
    const formatted = formatLocalTime(ms < 1e12 ? ms * 1000 : ms, fmt)
    if (formatted !== '--') return formatted
  }
  const d = dayjs(s)
  if (d.isValid()) return d.format(fmt)
  const datePart = s.split(/[ T]/)[0]
  const d2 = dayjs(datePart)
  return d2.isValid() ? d2.format(fmt) : datePart || s
}

/** 跟单日期时间展示 */
export function formatCopyTradeDisplayDateTime(raw, fmt = 'YYYY-MM-DD HH:mm') {
  if (raw === null || raw === undefined || raw === '') return '--'
  const s = String(raw).trim()
  const cn = s.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日(?:\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
  if (cn) {
    const hh = cn[4] ?? '00'
    const mm = cn[5] ?? '00'
    const ss = cn[6] ?? '00'
    const d = dayjs(`${cn[1]}-${cn[2]}-${cn[3]} ${hh}:${mm}:${ss}`)
    return d.isValid() ? d.format(fmt) : formatCopyTradeDisplayDate(raw, fmt.split(' ')[0])
  }
  const formatted = formatLocalTime(raw, fmt)
  return formatted !== '--' ? formatted : formatCopyTradeDisplayDate(raw, fmt.split(' ')[0])
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

/** 今日交易次数：优先 tradeCount */
export function copyTradeTradeCount(item) {
  if (!item) return 0
  const params = item.params || {}
  const fromTradeCount = params.tradeCount ?? item.tradeCount
  if (fromTradeCount != null && fromTradeCount !== '') {
    const n = Number(fromTradeCount)
    return Number.isFinite(n) ? n : 0
  }
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
  return 0
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

/** 解析接口 amountRangeText，如 20USDT--50000USDT */
export function parseAmountRangeText(text) {
  if (!text || typeof text !== 'string') return {}
  const normalized = text.replace(/\s+/g, '')
  const match =
    normalized.match(/^([\d.,]+)USDT[-–—~]+([\d.,]+)USDT$/i) ||
    normalized.match(/([\d.,]+)\s*[-–—~]+\s*([\d.,]+)/)
  if (!match) return {}
  const minAmount = Number(String(match[1]).replace(/,/g, ''))
  const maxAmount = Number(String(match[2]).replace(/,/g, ''))
  return {
    minAmount: Number.isFinite(minAmount) ? minAmount : null,
    maxAmount: Number.isFinite(maxAmount) ? maxAmount : null
  }
}

/** 解析策略/机构跟单金额上下限 */
export function normalizeStrategyAmountRange(raw) {
  if (!raw || typeof raw !== 'object') return { minAmount: null, maxAmount: null }
  const nested = raw.strategy || raw.detail || raw.limit || raw.amountLimit || raw.rule || {}
  const src = { ...nested, ...raw }
  let minAmount = pickAmountField(src, MIN_AMOUNT_KEYS)
  let maxAmount = pickAmountField(src, MAX_AMOUNT_KEYS)
  if ((minAmount == null || maxAmount == null) && src.amountRangeText) {
    const parsed = parseAmountRangeText(src.amountRangeText)
    if (minAmount == null) minAmount = parsed.minAmount ?? null
    if (maxAmount == null) maxAmount = parsed.maxAmount ?? null
  }
  return { minAmount, maxAmount }
}

/** 策略详情归一化（含金额范围） */
export function normalizeStrategyDetail(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const limits = normalizeStrategyAmountRange(raw)
  return { ...raw, ...limits }
}

/** 策略优先，机构详情兜底金额范围；strategyOnly=true 时仅取策略自身配置 */
export function resolveStrategyAmountRange(strategy = {}, institution = {}, options = {}) {
  const fromStrategy = normalizeStrategyAmountRange(strategy)
  if (options.strategyOnly) return fromStrategy
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

export function interpolateCopyTradeText(template, params = {}) {
  if (!template || typeof template !== 'string') return template
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value ?? '')),
    template
  )
}

/** vue-i18n 会先消费 {min}/{max}，必须带 params 调用 t() */
function resolveCopyTradeI18nText(i18n, translate, key, params = {}) {
  if (i18n?.t) {
    const text = i18n.t(key, params)
    if (text && text !== key) return text
  }
  const template = typeof translate === 'function' ? translate(key) : key
  if (template && template !== key) {
    return interpolateCopyTradeText(template, params)
  }
  return key
}

function formatCopyTradeAmountLimitValue(value) {
  return value != null && value !== '' ? priceFormat(value) : '--'
}

/** 跟单金额区间提示（多语言 {min} / {max}） */
export function formatCopyTradeAmountRangeTip(minAmount, maxAmount, translate, i18n = null) {
  const t = typeof translate === 'function' ? translate : () => ''
  const min = formatCopyTradeAmountLimitValue(minAmount)
  const max = formatCopyTradeAmountLimitValue(maxAmount)
  const text = resolveCopyTradeI18nText(i18n, translate, 'copy_trade_amount_range_tip', { min, max })
  if (text && text !== 'copy_trade_amount_range_tip') return text
  return `${t('copy_trade_amount_range')} ${formatAmountRangeText(minAmount, maxAmount)}`
}

/** 跟单金额输入框占位（多语言 {min} / {max}） */
export function formatCopyTradeAmountPlaceholder(minAmount, maxAmount, translate, i18n = null) {
  const min = formatCopyTradeAmountLimitValue(minAmount)
  const max = formatCopyTradeAmountLimitValue(maxAmount)
  const text = resolveCopyTradeI18nText(i18n, translate, 'copy_trade_amount_placeholder', { min, max })
  if (text && text !== 'copy_trade_amount_placeholder') return text
  return formatAmountRangeText(minAmount, maxAmount)
}

/** 提交跟单金额校验（可选 balance 校验合约余额） */
export function validateCopyTradeSubmitAmount(val, limits = {}, balance = null) {
  const amount = normalizeCopyTradeAmount(val)
  const minAmount =
    limits.minAmount != null && limits.minAmount !== '' ? Number(limits.minAmount) : null
  const maxAmount =
    limits.maxAmount != null && limits.maxAmount !== '' ? Number(limits.maxAmount) : null
  const maxCap = maxAmount != null ? normalizeCopyTradeAmount(maxAmount) : null
  const balanceCap =
    balance != null && balance !== '' ? normalizeCopyTradeAmount(balance) : null

  if (val === '' || val == null || amount == null) {
    return { ok: false, key: 'copy_trade_amount_required' }
  }
  if (minAmount == null || maxAmount == null || !Number.isFinite(minAmount) || !Number.isFinite(maxAmount)) {
    return { ok: false, key: 'copy_trade_amount_error' }
  }
  if (amount < minAmount) {
    return {
      ok: false,
      key: 'copy_trade_amount_below_min',
      params: { min: priceFormat(minAmount) }
    }
  }
  if (maxCap != null && amount > maxCap) {
    return {
      ok: false,
      key: 'copy_trade_amount_above_max',
      params: { max: priceFormat(maxAmount) }
    }
  }
  if (balanceCap != null && amount > balanceCap) {
    return { ok: false, key: 'copy_trade_insufficient_balance' }
  }
  return { ok: true }
}

export function getCopyTradeAmountValidationMessage(result, translate, i18n = null) {
  if (!result || result.ok) return ''
  const key = result.key || 'copy_trade_amount_error'
  return resolveCopyTradeI18nText(i18n, translate, key, result.params || {})
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

function pickCopyTradeTimeField(item, key) {
  if (!item) return null
  const params = item.params || {}
  const strategy = item.strategy || {}
  const raw = item[key] ?? params[key] ?? strategy[key]
  if (raw == null || raw === '') return null
  return raw
}

function formatCopyTradeTimeValue(raw, dailyTimeEnabled, fmt = 'YYYY-MM-DD HH:mm') {
  if (raw == null || raw === '') return '--'
  const formatted = formatStrategyExecuteTime(raw, dailyTimeEnabled, fmt)
  return formatted !== '--' ? formatted : String(raw)
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

/** 策略开始时间：strategyStartTime / strategyStartTimeMillis / executeStartTime */
export function formatCopyTradeStrategyStartTime(item, fmt = 'YYYY-MM-DD HH:mm') {
  const ms = pickCopyTradeMillis(item, 'strategyStartTimeMillis')
  if (ms != null) return formatLocalTime(ms, fmt)

  const strategyTime = pickCopyTradeTimeField(item, 'strategyStartTime')
  if (strategyTime != null) {
    return formatCopyTradeTimeValue(strategyTime, item?.dailyTimeEnabled, fmt)
  }

  const execute =
    item?.executeStartTime ?? item?.strategy?.executeStartTime
  if (execute != null) {
    return formatStrategyExecuteTime(execute, item?.dailyTimeEnabled, fmt)
  }
  return '--'
}

/** 策略结束时间：strategyEndTime / strategyEndTimeMillis / executeEndTime（不用 endTime） */
export function formatCopyTradeStrategyEndTime(item, fmt = 'YYYY-MM-DD HH:mm') {
  const ms = pickCopyTradeMillis(item, 'strategyEndTimeMillis')
  if (ms != null) return formatLocalTime(ms, fmt)

  const strategyTime = pickCopyTradeTimeField(item, 'strategyEndTime')
  if (strategyTime != null) {
    return formatCopyTradeTimeValue(strategyTime, item?.dailyTimeEnabled, fmt)
  }

  const execute = item?.executeEndTime ?? item?.strategy?.executeEndTime
  if (execute != null) {
    return formatStrategyExecuteTime(execute, item?.dailyTimeEnabled, fmt)
  }
  return '--'
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

/** 加入时间原始值（毫秒或时间字符串） */
export function resolveCopyTradeJoinRaw(item) {
  if (!item) return ''
  const params = item.params || {}
  if (params.joinTimeMillis != null && params.joinTimeMillis !== '') return params.joinTimeMillis
  if (item.joinTimeMillis != null && item.joinTimeMillis !== '') return item.joinTimeMillis
  return item.joinTime ?? params.joinTime ?? item.startTime ?? item.createTime ?? ''
}

/** 退出时间原始值（毫秒或时间字符串） */
export function resolveCopyTradeExitRaw(item) {
  if (!item) return ''
  const params = item.params || {}
  if (params.exitTimeMillis != null && params.exitTimeMillis !== '') return params.exitTimeMillis
  if (item.exitTimeMillis != null && item.exitTimeMillis !== '') return item.exitTimeMillis
  return item.exitTime ?? params.exitTime ?? item.settleTime ?? params.settleTime ?? item.endTime ?? params.endTime ?? ''
}

/** 跟单运行天数（加入日至结束日，含首尾，至少 1 天） */
export function calcCopyTradeRunningDays(joinRaw, endRaw) {
  if (joinRaw == null || joinRaw === '') return null
  const start = dayjs(joinRaw)
  if (!start.isValid()) return null
  const end = endRaw != null && endRaw !== '' ? dayjs(endRaw) : dayjs()
  if (!end.isValid()) return Math.max(1, dayjs().diff(start, 'day') + 1)
  return Math.max(1, end.diff(start, 'day') + 1)
}

/** 加入时间：order.joinTime */
export function formatCopyTradeJoinTime(item, fmt = 'YYYY-MM-DD HH:mm') {
  if (!item) return '--'
  const raw = resolveCopyTradeJoinRaw(item)
  if (!raw) return '--'
  const formatted = formatLocalTime(raw, fmt)
  return formatted !== '--' ? formatted : String(raw)
}

/** 退出时间：exitTime / settleTime；endTime 兼容旧版（已退出订单的实际退出时间） */
export function formatCopyTradeExitTime(item, fmt = 'YYYY-MM-DD HH:mm') {
  if (!item) return '--'
  const params = item.params || {}
  const ms = params.exitTimeMillis ?? item.exitTimeMillis
  if (ms != null) {
    const formatted = formatLocalTime(ms, fmt)
    if (formatted !== '--') return formatted
  }
  const candidates = [
    item.exitTime,
    params.exitTime,
    item.settleTime,
    params.settleTime,
    item.endTime,
    params.endTime
  ]
  for (const raw of candidates) {
    if (raw == null || raw === '') continue
    const formatted = formatLocalTime(raw, fmt)
    if (formatted !== '--') return formatted
    return String(raw)
  }
  return '--'
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
    return {
      meta: {},
      orders: [attachCopyTradeOrderViewModel({ ...payload, records: normalizeRecords(payload.records) })]
    }
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
    const order = attachCopyTradeOrderViewModel({
      ...payload.order,
      records,
      strategy,
      institution,
      strategyName: payload.order.strategyName || strategy.strategyName,
      strategyId: payload.order.strategyId ?? strategy.strategyId,
      icon: payload.order.icon || institution.logo,
      institutionName: institution.institutionName,
      institutionId: institution.institutionId,
      strategyStartTime:
        payload.order.strategyStartTime ??
        payload.order.params?.strategyStartTime ??
        strategy.strategyStartTime,
      strategyEndTime:
        payload.order.strategyEndTime ??
        payload.order.params?.strategyEndTime ??
        strategy.strategyEndTime,
      strategyStartTimeMillis:
        strategy.strategyStartTimeMillis ?? payload.order.strategyStartTimeMillis,
      strategyEndTimeMillis:
        strategy.strategyEndTimeMillis ?? payload.order.strategyEndTimeMillis,
      executeStartTime: payload.order.executeStartTime ?? strategy.executeStartTime,
      executeEndTime: payload.order.executeEndTime ?? strategy.executeEndTime
    })
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
    orders.push(attachCopyTradeOrderViewModel({ ...item, records: normalizeRecords(item.records) }))
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

/** 详情页 Tab：0=仅持仓中，1=仅历史持仓 */
export function filterCopyTradeRecordsForDetailTab(records, tab) {
  const list = Array.isArray(records) ? records : []
  if (Number(tab) === 1) {
    return list.filter((rec) => isCopyTradeRecordClosed(rec))
  }
  return list.filter((rec) => !isCopyTradeRecordClosed(rec))
}

export function attachCopyTradeOrderViewModelForDetailTab(order, tab) {
  if (!order || typeof order !== 'object') return order
  const records = filterCopyTradeRecordsForDetailTab(order.records, tab)
  return attachCopyTradeOrderViewModel({ ...order, records })
}

/** 列表/详情行视图模型：预计算子单分组，避免模板重复遍历 */
export function attachCopyTradeOrderViewModel(order) {
  if (!order || typeof order !== 'object') return order
  const records = Array.isArray(order.records) ? order.records : []
  return {
    ...order,
    _recordGroups: splitCopyTradeRecords(records),
    _battle: groupCopyTradeDailyBattleRecords(records)
  }
}

export function normalizeCopyTradeListRow(row) {
  if (!row || typeof row !== 'object') return row
  const records = (Array.isArray(row.records) ? row.records : [])
    .map(normalizeCopyTradeRecord)
    .filter(Boolean)
  return attachCopyTradeOrderViewModel({ ...row, records })
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
  const raw =
    pickCopyTradeTimeField(item, 'strategyStartTime') ??
    item.executeStartTime ??
    item.strategy?.executeStartTime
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
      subscribeTime ||
      '',
    tradingDays,
    totalProfitRate: src.totalProfitRate ?? src.totalRate ?? src.profitRate,
    totalProfit: src.totalProfit ?? src.totalProfitAmt,
    rangeTotalProfitRate: src.rangeTotalProfitRate ?? src.rangeProfitRate
  }
}

const PERF_SUMMARY_KEYS = [
  'subscribeTime',
  'joinTime',
  'copyDays',
  'tradingDays',
  'totalProfitRate',
  'totalProfit',
  'rangeTotalProfitRate',
  'weeklyTotalProfitRate'
]

/** 合并表现汇总字段：仅用非空值覆盖，避免图表接口冲掉 myPerformance 汇总 */
export function mergePerfSummaryFields(target = {}, source = {}) {
  const next = { ...target }
  const summary = normalizePerfSummary(source)
  PERF_SUMMARY_KEYS.forEach((key) => {
    const val = summary[key] ?? source[key]
    if (val != null && val !== '') {
      next[key] = val
    }
  })
  return next
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
      let symbol = row.symbol || row.coin || row.coinName || row.name || ''
      if (/^(其他|其它|other)$/i.test(String(symbol).trim())) symbol = 'Other'
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
