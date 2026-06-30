/** 金刚区菜单项是否为「跟单」入口 */
export function isCopyTradeJingangMenuItem(item) {
  if (!item) return false

  const link = String(item.linkUrl || '')
    .trim()
    .toLowerCase()
    .split('?')[0]
    .replace(/\/$/, '')
  if (link === '/copy-trade' || link.endsWith('/copy-trade')) {
    return true
  }

  const key = String(item.key || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')
  if (key === 'copy_trade' || key === 'copytrade' || key === 'copy_trade_title') {
    return true
  }
  return key.includes('copy_trade') || key.includes('copytrade')
}

/** 金刚区跟单入口是否开启（与首页 menu.vue 过滤逻辑一致） */
export function isCopyTradeJingangVisible(menuList = []) {
  return (menuList || []).some((item) => item?.isOpen == true && isCopyTradeJingangMenuItem(item))
}
