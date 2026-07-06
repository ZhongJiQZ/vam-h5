/** 充值通道 type 归一化（如 BANK-GC、BANK-MAYA） */
export function normalizeRechargeType(type) {
  return String(type || '').trim().toUpperCase()
}

/** 三方支付通道：BANK-GC、BANK-MAYA 等，下单后跳转 payUrl */
export function isPayGatewayRechargeType(type) {
  return normalizeRechargeType(type).startsWith('BANK-')
}

/** 银行卡手动转账（仅 type=BANK） */
export function isBankManualRechargeType(type) {
  return normalizeRechargeType(type) === 'BANK'
}

/** 银行类充值（手动 + 三方） */
export function isBankRechargeType(type) {
  const t = normalizeRechargeType(type)
  return t === 'BANK' || t.startsWith('BANK-')
}

/** 充值列表展示名：优先后台配置名称，避免多个通道都显示同一 bankName */
export function resolveRechargeListTitle(item) {
  if (!item) return ''
  const fields = [
    item.rechargeName,
    item.name,
    item.channelName,
    item.displayName,
    item.coinName,
    item.rechargeType,
    item.type,
    item.bankName
  ]
  for (const raw of fields) {
    const text = String(raw ?? '').trim()
    if (text) return text
  }
  return ''
}

function normalizeRechargeCoinIcon(coin) {
  const key = String(coin || 'usdt').toLowerCase()
  if (key === 'usdt') return key
  return key.replace('usdt', '').trim() || 'usdt'
}

/** 充值通道图标：银行卡/三方用 card，虚拟币用 coin 字段 */
export function resolveRechargeIcon(item, queryCoin = '') {
  const channelType = item?.coinName || item?.rechargeType || item?.type
  const isGateway = isPayGatewayRechargeType(channelType)
  const isBank = Boolean(item?.bankCardNo && item?.bankName) && !isGateway
  if (isBank || isGateway) return 'card'
  return normalizeRechargeCoinIcon(item?.coin || queryCoin)
}
