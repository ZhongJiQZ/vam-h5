const normalizeUpper = (value) => String(value || '').trim().toUpperCase()

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
  return String(data.payUrl ?? response?.payUrl ?? '').trim()
}

export function getRechargePayMode(response) {
  const data = getRechargeResponseData(response)
  return normalizeUpper(data.payMode ?? response?.payMode)
}
