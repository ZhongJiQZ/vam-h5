const normalizeUpper = (value) => String(value || '').trim().toUpperCase()
const THIRD_PARTY_PAY_CACHE_KEY = 'third_party_recharge_pay'

export function isManualBankRecharge(item) {
  return (
    normalizeUpper(item?.channelType) === 'BANK' &&
    normalizeUpper(item?.payMode) === 'MANUAL_BANK' &&
    item?.manualBank === true
  )
}

export function isBankRecharge(item) {
  return (
    normalizeUpper(item?.channelType) === 'BANK' ||
    Boolean(item?.bankCardNo && item?.bankName)
  )
}

export function getRechargeResponseData(response) {
  const data = response?.data?.data ?? response?.data
  return data && typeof data === 'object' ? data : {}
}

export function getRechargePayUrl(response) {
  const data = getRechargeResponseData(response)
  return String(data.payUrl ?? data.pay_url ?? data.payData ?? data.pay_data ?? response?.payUrl ?? '').trim()
}

export function getRechargePayDataType(response) {
  const data = getRechargeResponseData(response)
  return String(data.payDataType ?? data.pay_data_type ?? response?.payDataType ?? '').trim()
}

export function isRechargeNavigableUrl(value) {
  const text = String(value || '').trim()
  return /^https?:\/\//i.test(text)
}

export function isRechargeQrPayload(value, payDataType = '') {
  const text = String(value || '').trim()
  if (!text) return false
  const type = normalizeUpper(payDataType)
  if (['QR_CODE', 'QRIS', 'QRCODE', 'QR'].includes(type)) {
    return true
  }
  if (text.startsWith('000201')) {
    return true
  }
  return !isRechargeNavigableUrl(text) && text.length >= 20
}

export function resolveRechargePayAction(response) {
  const payValue = getRechargePayUrl(response)
  const payDataType = getRechargePayDataType(response)
  if (!payValue) {
    return { type: 'none', value: '', payDataType }
  }
  if (isRechargeNavigableUrl(payValue)) {
    return { type: 'url', value: payValue, payDataType }
  }
  if (isRechargeQrPayload(payValue, payDataType)) {
    return { type: 'qrcode', value: payValue, payDataType }
  }
  return { type: 'none', value: payValue, payDataType }
}

export function cacheThirdPartyPayPayload(payload) {
  if (!payload || typeof payload !== 'object') return
  try {
    sessionStorage.setItem(THIRD_PARTY_PAY_CACHE_KEY, JSON.stringify(payload))
  } catch (e) {}
}

export function consumeThirdPartyPayPayload() {
  try {
    const raw = sessionStorage.getItem(THIRD_PARTY_PAY_CACHE_KEY)
    sessionStorage.removeItem(THIRD_PARTY_PAY_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch (e) {
    sessionStorage.removeItem(THIRD_PARTY_PAY_CACHE_KEY)
    return null
  }
}

export function getRechargePayMode(response) {
  const data = getRechargeResponseData(response)
  return normalizeUpper(data.payMode ?? response?.payMode)
}
