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

/** 统一解析后台 linkUrl（兼容 #/copy-trade、copy-trade） */
export function normalizeTabbarLinkPath(linkUrl = '') {
  let path = String(linkUrl || '').trim()
  if (!path) return ''

  const hashIdx = path.indexOf('#')
  if (hashIdx >= 0) {
    path = path.slice(hashIdx + 1)
  }

  path = path.split('?')[0].replace(/\/$/, '')
  if (path && !path.startsWith('/')) {
    path = `/${path}`
  }
  return path.toLowerCase()
}

export function isCopyTradeTabItem(item) {
  if (!item) return false
  const path = normalizeTabbarLinkPath(item.linkUrl)
  if (path === '/copy-trade' || path.startsWith('/copy-trade/')) {
    return true
  }
  const key = normalizeTabbarKey(item.key).replace(/_/g, '')
  return key.includes('copytrade')
}

export function isOnCopyTradeRoute(route) {
  const path = normalizeTabbarLinkPath(route?.path || route?.fullPath || '')
  if (path === '/copy-trade' || path.startsWith('/copy-trade/')) {
    return true
  }
  return isCopyTradeRouteName(route?.name)
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

  const path = normalizeTabbarLinkPath(linkUrl)
  if (path === '/copy-trade' || path.startsWith('/copy-trade/')) {
    return 'CopyTrade'
  }
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

  if (isCopyTradeTabItem(tabItem) && isOnCopyTradeRoute(route)) {
    return true
  }

  return normalizeTabbarKey(tabItem.key) === String(routeName).toLowerCase()
}

export function buildTabbarRouteNameList(tabbarList = []) {
  const openItems = (tabbarList || []).filter((item) => item?.isOpen === true)
  const names = openItems
    .map((item) => tabbarKeyToRouteName(item.key, item.linkUrl))
    .filter(Boolean)

  if (openItems.some(isCopyTradeTabItem)) {
    names.push(...COPY_TRADE_ROUTE_NAMES)
  }

  return [...new Set(names)]
}

const EXTRA_TABBAR_ROUTE_NAMES = ['OrderCenter', 'AssetRecord', 'FinancialDetails']

/** App.vue：当前页是否展示底部栏 */
export function shouldShowTabbar(route, tabbarList = [], extraNames = EXTRA_TABBAR_ROUTE_NAMES) {
  const routeNames = [...buildTabbarRouteNameList(tabbarList), ...extraNames]
  if (route?.name && routeNames.includes(route.name)) {
    return true
  }

  const openItems = (tabbarList || []).filter((item) => item?.isOpen === true)
  if (!openItems.length) return false

  return openItems.some((item) => isTabbarRouteActive(route, item))
}
