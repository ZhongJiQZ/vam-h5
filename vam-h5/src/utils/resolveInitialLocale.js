import { countryCodeToLocale } from '@/utils/countryLocaleMap'
import { fetchIpCountryCode } from '@/utils/ipGeo'

function normalizeLocale(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/_/g, '-')
}

function matchLocaleInList(locale, languageList = []) {
  if (!locale) return null
  const normalized = normalizeLocale(locale)
  let hit = languageList.find((item) => normalizeLocale(item.dictValue) === normalized)
  if (hit) return hit.dictValue

  const primary = normalized.split('-')[0]
  hit = languageList.find((item) => normalizeLocale(item.dictValue).split('-')[0] === primary)
  return hit?.dictValue || null
}

function matchDeviceLocale(languageList = []) {
  if (typeof navigator === 'undefined') return null
  const raw = (navigator.languages && navigator.languages[0]) || navigator.language || ''
  if (!raw) return null

  const candidates = [raw, raw.split(/[-_]/)[0]]
  for (const candidate of candidates) {
    const hit = matchLocaleInList(candidate, languageList)
    if (hit) return hit
  }
  return null
}

async function matchIpLocale(languageList = []) {
  const countryCode = await fetchIpCountryCode()
  if (!countryCode) return null
  const locale = countryCodeToLocale(countryCode)
  return matchLocaleInList(locale, languageList)
}

/**
 * 解析首次进入应用时的默认语言。
 * 优先级：本地已保存 > IP 国家映射 > 浏览器语言 > en > 配置默认
 */
export async function resolveInitialLocale({
  languageList = [],
  saved = '',
  defaultLanguage = 'en'
} = {}) {
  const list = Array.isArray(languageList) ? languageList : []
  const isValidSaved = saved && list.some((item) => item.dictValue === saved)

  if (isValidSaved) return saved
  if (!list.length) return saved || defaultLanguage

  const fromIp = await matchIpLocale(list)
  if (fromIp) return fromIp

  return (
    matchDeviceLocale(list) ||
    list.find((item) => normalizeLocale(item.dictValue) === 'en')?.dictValue ||
    defaultLanguage
  )
}
