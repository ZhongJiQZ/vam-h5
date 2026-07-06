/**
 * 后台币种/链展示名（如 TRC20-USDT、ETH-USDT）与旧键名（USDT-TRC、USDT-ERC）映射。
 * 用于地址长度校验、配置项匹配、充值地址 Map 查找。
 */

/** @type {Record<string, string>} 展示名 / 别名 -> 地址格式参考键 */
export const COIN_TYPE_TO_LEGACY_KEY = {
  // TRC20
  'TRC20-USDT': 'USDT-TRC',
  'USDT-TRC20': 'USDT-TRC',
  'USDT-TRC': 'USDT-TRC',
  // ERC / 以太坊系
  'ETH-USDT': 'USDT-ERC',
  'ERC20-USDT': 'USDT-ERC',
  'USDT-ERC': 'USDT-ERC',
  'USDT-ERC20': 'USDT-ERC',
  'ETH-USDC': 'USDC-ERC',
  'ERC20-USDC': 'USDC-ERC',
  'USDC-ERC': 'USDC-ERC',
  'USDC-ERC20': 'USDC-ERC',
  'ETH': 'ETH',
  // BEP20（地址为 0x 开头，长度与 ERC 一致）
  'BEP20-USDT': 'USDT-ERC',
  'BEP20-USDC': 'USDC-ERC',
  'USDT-BEP20': 'USDT-ERC',
  'USDC-BEP20': 'USDC-ERC',
  // 其它常见链
  'BTC': 'BTC',
  'SOL': 'SOL',
  'TRX': 'TRX',
  'TRX-TRC': 'TRX'
}

/** 各 legacy 键对应的示例地址（仅用于取期望长度） */
export const COIN_ADDRESS_LENGTH_SAMPLES = {
  'USDT-ERC': '0xF8E687120ECDa2036C4a9f79Aa1aA93C15479F4b',
  'USDT-TRC': 'TU9w3To3ThVKhqjp3L3TPKXUL9xyML5DxY',
  'USDC-ERC': '0x3BAed24fe5D7a701cBD583DC77B556d6218404F9',
  ETH: '0xa493e9bcb328d126d7F0E1eB8725b3A08B1E06F1',
  BTC: '199NEFtTspcP1eR8kHnQwAktMCbNFQY5VS',
  SOL: 'AsNjVNZTYj6tbQszPJanMprRngzVwwKQsq2hVtx1r6vM',
  TRX: 'T9zTTVfegCiJ5ovip4y2dCPiEdXT9EmtEw'
}

export function normalizeCoinNetworkKey(type) {
  const t = String(type || '').trim().toUpperCase()
  if (!t) return ''
  if (COIN_TYPE_TO_LEGACY_KEY[t]) return COIN_TYPE_TO_LEGACY_KEY[t]
  if (COIN_ADDRESS_LENGTH_SAMPLES[t]) return t

  if (t.includes('TRC') && t.includes('USDT')) return 'USDT-TRC'
  if (t.includes('BEP') && t.includes('USDT')) return 'USDT-ERC'
  if (t.includes('BEP') && t.includes('USDC')) return 'USDC-ERC'
  if ((t.startsWith('ETH-') || t.includes('ERC')) && t.includes('USDT')) return 'USDT-ERC'
  if ((t.startsWith('ETH-') || t.includes('ERC')) && t.includes('USDC')) return 'USDC-ERC'
  if (t.includes('TRC')) return 'USDT-TRC'
  if (t.includes('ERC') || t.startsWith('ETH')) {
    if (t.includes('USDC')) return 'USDC-ERC'
    if (t.includes('USDT')) return 'USDT-ERC'
    return 'ETH'
  }
  if (t.includes('BTC')) return 'BTC'
  if (t.includes('SOL')) return 'SOL'
  if (t.includes('TRX')) return 'TRX'

  return t
}

export function isSameCoinNetworkType(a, b) {
  const na = normalizeCoinNetworkKey(a)
  const nb = normalizeCoinNetworkKey(b)
  if (!na || !nb) return false
  return na === nb
}

/** 在 Map / 接口 data 中可能出现的全部键名 */
export function coinNetworkLookupKeys(type) {
  const keys = new Set()
  const raw = String(type || '').trim()
  const upper = raw.toUpperCase()
  if (raw) {
    keys.add(raw)
    keys.add(upper)
  }
  const legacy = normalizeCoinNetworkKey(raw)
  if (legacy) keys.add(legacy)
  for (const [alias, target] of Object.entries(COIN_TYPE_TO_LEGACY_KEY)) {
    if (target === legacy) keys.add(alias)
  }
  return [...keys]
}

export function getExpectedAddressLength(type, samples = COIN_ADDRESS_LENGTH_SAMPLES) {
  const legacy = normalizeCoinNetworkKey(type)
  const sample = legacy && samples[legacy]
  return sample ? sample.length : null
}

export function findRechargeListItem(list, type) {
  const q = String(type || '').trim()
  if (!q || !Array.isArray(list)) return null
  const qu = q.toUpperCase()
  return (
    list.find((item) => {
      const coinName = String(item?.coinName || '').trim()
      const rechargeType = String(item?.rechargeType || item?.type || '').trim()
      if (coinName && (coinName === q || coinName.toUpperCase() === qu || isSameCoinNetworkType(coinName, q))) {
        return true
      }
      if (rechargeType && rechargeType.toUpperCase() === qu) return true
      return false
    }) || null
  )
}

export function findWithdrawChannelItem(list, queryType) {
  const q = String(queryType || '').trim()
  if (!q || !Array.isArray(list)) return null
  const qu = q.toUpperCase()
  return (
    list.find((item) => {
      const name = String(item?.rechargeName || '').trim()
      const rechargeType = String(item?.rechargeType || item?.coinName || '').trim()
      if (name && (name === q || name.toUpperCase() === qu || isSameCoinNetworkType(name, q))) {
        return true
      }
      if (
        rechargeType &&
        (rechargeType.toUpperCase() === qu || isSameCoinNetworkType(rechargeType, q))
      ) {
        return true
      }
      return false
    }) || null
  )
}
