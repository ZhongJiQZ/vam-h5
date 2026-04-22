/**
 * /api/recharge/getAdress 等接口：data 形如
 * { "USDT-TRC": { "USDT-TRC": "T..." }, "ETH": { "ETH": "0x..." } }
 * 也可能是扁平字符串或其它字段名，统一成可展示的充值地址。
 */
export function normalizeRechargeAddressFromApi(raw, coinName) {
  if (raw == null || raw === '') return ''
  if (typeof raw === 'string') return raw
  if (typeof raw !== 'object') return ''

  const exactKey =
    coinName && Object.keys(raw).find((k) => String(k).toUpperCase() === String(coinName).toUpperCase())

  if (exactKey && raw[exactKey] != null) {
    const inner = raw[exactKey]
    if (typeof inner === 'string') return inner
    if (typeof inner === 'object' && inner !== null) {
      const innerExact = Object.keys(inner).find(
        (k) => String(k).toUpperCase() === String(coinName).toUpperCase()
      )
      if (innerExact && typeof inner[innerExact] === 'string') return inner[innerExact]
      for (const v of Object.values(inner)) {
        if (typeof v === 'string' && v.trim()) return v
      }
    }
  }

  if (coinName && raw[coinName] != null) {
    const inner = raw[coinName]
    if (typeof inner === 'string') return inner
    if (typeof inner === 'object' && inner !== null) {
      if (typeof inner[coinName] === 'string') return inner[coinName]
      for (const v of Object.values(inner)) {
        if (typeof v === 'string' && v.trim()) return v
      }
    }
  }

  const keys = ['address', 'adress', 'coinAddress', 'walletAddress', coinName].filter(Boolean)
  for (const k of keys) {
    const v = raw[k]
    if (typeof v === 'string' && v) return v
  }
  for (const v of Object.values(raw)) {
    if (typeof v === 'string' && v.trim()) return v
    if (typeof v === 'object' && v !== null && coinName) {
      const deep = normalizeRechargeAddressFromApi(v, coinName)
      if (deep) return deep
    }
  }
  return ''
}
