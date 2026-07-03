import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 将后端时间戳统一为毫秒：纯数字字符串或 number，支持秒（10 位）或毫秒（13 位）
 * @param {string|number} v
 * @returns {number|null}
 */
export function toEpochMs(v) {
  if (v === null || v === undefined || v === "") return null;
  const s = typeof v === "string" ? v.trim() : v;
  if (typeof s === "string" && !/^\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n < 1e12 ? n * 1000 : n;
}

/**
 * 把服务端时间(带时区的ISO字符串/时间戳)显示为客户端本地时间
 * @param {string|number|Date} input
 * @param {string} fmt
 */
export function formatLocalTime(input, fmt = "YYYY-MM-DD HH:mm:ss") {
  if (input === null || input === undefined || input === "") return "--";
  const ms = toEpochMs(input);
  const parsed = ms != null ? ms : input;
  const d = dayjs(parsed);
  return d.isValid() ? d.format(fmt) : "--";
}

const ASSET_RECORD_FMT = "DD/MM/YYYY HH:mm:ss";

/**
 * 资产流水/质押记录：开始、结束时间优先用 params 内毫秒时间戳，否则用顶层字符串/ISO（设备本地时区）
 * @param {Record<string, unknown>} row
 * @param {'begin' | 'end'} which
 */
export function formatAssetRecordTime(row, which) {
  if (!row || typeof row !== "object") return "--";
  const params = row.params;
  if (which === "begin") {
    const ts = params?.createTime;
    if (ts !== undefined && ts !== null && ts !== "") {
      const s = formatLocalTime(ts, ASSET_RECORD_FMT);
      if (s !== "--") return s;
    }
    return formatLocalTime(row.createTime, ASSET_RECORD_FMT);
  }
  if (which === "end") {
    const ts = params?.endTime;
    if (ts !== undefined && ts !== null && ts !== "") {
      const s = formatLocalTime(ts, ASSET_RECORD_FMT);
      if (s !== "--") return s;
    }
    return formatLocalTime(row.endTime, ASSET_RECORD_FMT);
  }
  return "--";
}

/**
 * 指定时刻在客户端时区的 UTC 偏移（分钟，东为正；每次调用读取系统时区，无缓存）
 */
export function getClientUtcOffsetMinutes(at = new Date()) {
  const date = at instanceof Date ? at : new Date(at)
  if (Number.isNaN(date.getTime())) return 0
  return -date.getTimezoneOffset()
}

/**
 * 格式化为 UTC 偏移标签，如 UTC+8、UTC+5:30
 * @param {Date|string|number} [at] 默认当前时刻；传事件时间可反映该时刻 DST 偏移
 */
export function formatClientUtcOffsetLabel(at = new Date()) {
  const offsetMinutes = getClientUtcOffsetMinutes(at)
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const abs = Math.abs(offsetMinutes)
  const hours = Math.floor(abs / 60)
  const mins = abs % 60
  if (mins === 0) return `UTC${sign}${hours}`
  return `UTC${sign}${hours}:${String(mins).padStart(2, "0")}`
}

/**
 * 毫秒/ISO/时间字符串 → 设备本地时间 + UTC 偏移标签
 */
export function formatClientLocalDateTime(input, fmt = "YYYY-MM-DD HH:mm:ss") {
  if (input === null || input === undefined || input === "") return "--"
  const ms = toEpochMs(input)
  const date = ms != null ? new Date(ms) : new Date(input)
  if (Number.isNaN(date.getTime())) {
    const fallback = dayjs(input)
    if (!fallback.isValid()) return "--"
    const fallbackDate = fallback.toDate()
    return `${fallback.format(fmt)} (${formatClientUtcOffsetLabel(fallbackDate)})`
  }
  const d = dayjs(date)
  return `${d.format(fmt)} (${formatClientUtcOffsetLabel(date)})`
}

/**
 * 需要显示“用户所在时区名/偏移”也可以拿这个（每次调用实时解析，不缓存）
 */
export function getClientTz() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}
