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

/**
 * 需要显示“用户所在时区名/偏移”也可以拿这个
 */
export function getClientTz() {
  return dayjs.tz.guess(); // e.g. "Asia/Manila"
}
