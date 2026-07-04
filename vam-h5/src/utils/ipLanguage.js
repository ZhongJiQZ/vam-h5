// 依据用户 IP 返回站点支持的语言 code；命中不到 / 请求失败均返回 null（由上层继续降级到浏览器语言 / en）
// 结果按浏览器会话 (sessionStorage) 缓存，避免同一会话重复请求。

const CACHE_KEY = 'ipLanguage.v1'
const REQUEST_TIMEOUT_MS = 3000

// 覆盖 src/plugin/i18n/locales/ 下的 24 种 locale；不在此表 → null → fallback
const COUNTRY_TO_LANG = {
  CN: 'zh',
  HK: 'tw', MO: 'tw', TW: 'tw',
  US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', SG: 'en',
  JP: 'ja',
  KR: 'ko',
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
  VN: 'vi',
  TH: 'th',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  FR: 'fr', BE: 'fr', CH: 'fr',
  RU: 'ru', BY: 'ru', KZ: 'ru',
  DE: 'de', AT: 'de',
  IT: 'it',
  ID: 'id',
  PH: 'ph',
  PK: 'pk',
  SA: 'ar', AE: 'ar', EG: 'ar', JO: 'ar', KW: 'ar', IQ: 'ar', OM: 'ar', QA: 'ar', YE: 'ar', BH: 'ar', LB: 'ar', SY: 'ar', DZ: 'ar', MA: 'ar', TN: 'ar',
  IL: 'iw',
  IN: 'hi',
  PL: 'pl',
  TR: 'tr',
  NL: 'nl',
  DK: 'da',
  ZA: 'af'
}

// 备选 GeoIP endpoint；轮流试到有效响应为止
const GEOIP_ENDPOINTS = [
  { url: 'https://ipapi.co/json/', field: 'country' },
  { url: 'https://freeipapi.com/api/json', field: 'countryCode' }
]

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function detectCountryCode() {
  for (const ep of GEOIP_ENDPOINTS) {
    const data = await fetchWithTimeout(ep.url, REQUEST_TIMEOUT_MS)
    const code = data?.[ep.field]
    if (typeof code === 'string' && code.length === 2) return code.toUpperCase()
  }
  return null
}

/**
 * @param {Array<{dictValue: string}>} languageList 站点当前支持的语言列表（后端字典）
 * @returns {Promise<string|null>} 命中的 locale code；未命中返回 null
 */
export async function getLangByIp(languageList) {
  const supported = new Set((languageList || []).map((i) => i.dictValue))

  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached && supported.has(cached)) return cached
  if (cached === '__miss__') return null

  const country = await detectCountryCode()
  const lang = country ? COUNTRY_TO_LANG[country] : null
  const hit = lang && supported.has(lang) ? lang : null

  sessionStorage.setItem(CACHE_KEY, hit || '__miss__')
  return hit
}
