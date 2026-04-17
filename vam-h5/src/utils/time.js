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
 * 需要显示“用户所在时区名/偏移”也可以拿这个
 */
export function getClientTz() {
  return dayjs.tz.guess(); // e.g. "Asia/Manila"
}
