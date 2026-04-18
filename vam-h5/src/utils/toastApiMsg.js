import { showToast } from 'vant'
import { _t18 } from '@/utils/public'

/** 后端固定中文等文案 → i18n key（避免接口 msg 随语言不变） */
const BACKEND_MSG_TO_KEY = new Map([
  ['操作失败', 'operation_failed'],
  ['操作失败。', 'operation_failed'],
  ['操作成功', 'quote_addSuccess'],
  ['操作成功。', 'quote_addSuccess'],
])

function normalizeMsg(msg) {
  return String(msg ?? '')
    .trim()
    .replace(/[。!！.]+$/g, '')
}

/**
 * 展示接口返回的 msg；若为已知的固定文案则走多语言，否则原样展示。
 */
export function toastApiMsg(msg) {
  const raw = String(msg ?? '').trim()
  if (!raw) {
    showToast(_t18('operation_failed'))
    return
  }
  const key =
    BACKEND_MSG_TO_KEY.get(raw) ||
    BACKEND_MSG_TO_KEY.get(normalizeMsg(raw))
  if (key) {
    showToast(_t18(key))
    return
  }
  showToast(raw)
}
