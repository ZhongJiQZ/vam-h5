import { getIpCountryApi } from '@/api/common/index'

const IP_COUNTRY_CACHE_KEY = 'vam_ip_country_code'
const IP_COUNTRY_CACHE_AT_KEY = 'vam_ip_country_code_at'
const CACHE_TTL_MS = 30 * 60 * 1000
const REQUEST_TIMEOUT_MS = 3500

function normalizeCountryCode(value) {
  const code = String(value || '')
    .trim()
    .toUpperCase()
  return /^[A-Z]{2}$/.test(code) ? code : ''
}

function readCachedCountryCode() {
  try {
    const code = normalizeCountryCode(sessionStorage.getItem(IP_COUNTRY_CACHE_KEY))
    const cachedAt = Number(sessionStorage.getItem(IP_COUNTRY_CACHE_AT_KEY) || 0)
    if (!code || !cachedAt) return ''
    if (Date.now() - cachedAt > CACHE_TTL_MS) return ''
    return code
  } catch {
    return ''
  }
}

function writeCachedCountryCode(code) {
  try {
    sessionStorage.setItem(IP_COUNTRY_CACHE_KEY, code)
    sessionStorage.setItem(IP_COUNTRY_CACHE_AT_KEY, String(Date.now()))
  } catch {
    // ignore quota / private mode
  }
}

function parseCloudflareTrace(text) {
  const match = String(text || '').match(/(?:^|\n)loc=([A-Z]{2})(?:\n|$)/)
  return normalizeCountryCode(match?.[1])
}

async function fetchJsonCountry(url) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = controller
    ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    : null

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller?.signal
    })
    if (!res.ok) return ''
    const data = await res.json()
    return normalizeCountryCode(data?.country_code || data?.countryCode || data?.country)
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function fetchTraceCountry(url) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = controller
    ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    : null

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller?.signal
    })
    if (!res.ok) return ''
    return parseCloudflareTrace(await res.text())
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function fetchBackendCountryCode() {
  try {
    const res = await getIpCountryApi()
    if (res?.code !== 200 && res?.code !== '200') return ''
    const data = res?.data
    if (typeof data === 'string') return normalizeCountryCode(data)
    return normalizeCountryCode(
      data?.countryCode || data?.country_code || data?.country || data?.isoCode
    )
  } catch {
    return ''
  }
}

/**
 * 根据访问 IP 解析国家码（ISO2）。失败时返回空字符串，不抛错。
 */
export async function fetchIpCountryCode() {
  const cached = readCachedCountryCode()
  if (cached) return cached

  const providers = [
    fetchBackendCountryCode,
    () => fetchJsonCountry('https://ipwho.is/'),
    () => fetchTraceCountry('https://www.cloudflare.com/cdn-cgi/trace')
  ]

  for (const provider of providers) {
    try {
      const code = await provider()
      if (code) {
        writeCachedCountryCode(code)
        return code
      }
    } catch {
      // try next provider
    }
  }

  return ''
}
