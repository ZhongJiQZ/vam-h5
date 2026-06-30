/** 底部栏 key / linkUrl → 路由 name（与 router 定义一致） */
const TABBAR_KEY_ROUTE_MAP = {
  home: 'Home',
  quote: 'Quote',
  trade: 'Trade',
  tradeu: 'TradeU',
  tradebb: 'TradeBB',
  myassets: 'Myassets',
  financial: 'Financial',
  copytrade: 'CopyTrade',
  copy_trade: 'CopyTrade'
}

const TABBAR_LINK_ROUTE_MAP = {
  '/home': 'Home',
  '/quote': 'Quote',
  '/trade': 'Trade',
  '/tradeu': 'TradeU',
  '/tradebb': 'TradeBB',
  '/myassets': 'Myassets',
  '/financial': 'Financial',
  '/copy-trade': 'CopyTrade'
}

/** 跟单模块子页仍高亮「跟单」底栏 */
const COPY_TRADE_ROUTE_NAMES = new Set([
  'CopyTrade',
  'CopyTradeInstitution',
  'CopyTradeStrategies',
  'CopyTradeSubmit',
  'MyCopyTrade',
  'CopyTradeDetail'
])

export function normalizeTabbarKey(key) {
  return String(key || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')
}

export function tabbarKeyToRouteName(key, linkUrl = '') {
  const normalized = normalizeTabbarKey(key)
  if (TABBAR_KEY_ROUTE_MAP[normalized]) {
    return TABBAR_KEY_ROUTE_MAP[normalized]
  }
  const compact = normalized.replace(/_/g, '')
  if (TABBAR_KEY_ROUTE_MAP[compact]) {
    return TABBAR_KEY_ROUTE_MAP[compact]
  }

  const path = String(linkUrl || '')
    .split('?')[0]
    .replace(/\/$/, '')
    .toLowerCase()
  if (TABBAR_LINK_ROUTE_MAP[path]) {
    return TABBAR_LINK_ROUTE_MAP[path]
  }

  const raw = String(key || '')
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : ''
}

export function isCopyTradeRouteName(routeName) {
  return COPY_TRADE_ROUTE_NAMES.has(String(routeName || ''))
}

/** 当前路由是否命中某个底栏项（含跟单子路由） */
export function isTabbarRouteActive(route, tabItem) {
  const routeName = route?.name
  if (!routeName || !tabItem) return false

  const expected = tabbarKeyToRouteName(tabItem.key, tabItem.linkUrl)
  if (routeName === expected) return true

  if (expected === 'CopyTrade' && isCopyTradeRouteName(routeName)) {
    return true
  }

  return normalizeTabbarKey(tabItem.key) === String(routeName).toLowerCase()
}

export function buildTabbarRouteNameList(tabbarList = []) {
  const names = tabbarList
    .filter((item) => item?.isOpen === true)
    .map((item) => tabbarKeyToRouteName(item.key, item.linkUrl))
    .filter(Boolean)

  if (names.includes('CopyTrade')) {
    names.push(...COPY_TRADE_ROUTE_NAMES)
  }

  return [...new Set(names)]
}
