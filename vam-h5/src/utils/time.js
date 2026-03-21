import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 把服务端时间(带时区的ISO字符串/时间戳)显示为客户端本地时间
 * @param {string|number|Date} input
 * @param {string} fmt
 */
export function formatLocalTime(input, fmt = "YYYY-MM-DD HH:mm:ss") {
  if (!input) return "--";
  // dayjs 会解析 "2026-02-10T12:26:35.000+08:00" 并自动转成本地时区显示
  const d = dayjs(input);
  return d.isValid() ? d.format(fmt) : "--";
}

/**
 * 需要显示“用户所在时区名/偏移”也可以拿这个
 */
export function getClientTz() {
  return dayjs.tz.guess(); // e.g. "Asia/Manila"
}
