import { DEFAULT_LANGUAGE } from '@/config'
import { storageDict } from '@/config/dict'

const LANGUAGE_COUNTRY_MAP = {
  en: {
    phoneCode: '1',
    country: 'United States of America'
  },
  zh: {
    phoneCode: '86',
    country: 'China'
  },
  tw: {
    phoneCode: '886',
    country: 'Taiwan'
  },
  ja: {
    phoneCode: '81',
    country: 'Japan'
  },
  ko: {
    phoneCode: '82',
    country: 'South Korea'
  },
  pt: {
    phoneCode: '351',
    country: 'Portugal'
  },
  vi: {
    phoneCode: '84',
    country: 'Vietnam'
  },
  th: {
    phoneCode: '66',
    country: 'Thailand'
  },
  es: {
    phoneCode: '34',
    country: 'Spain'
  },
  fr: {
    phoneCode: '33',
    country: 'France'
  },
  ru: {
    phoneCode: '7',
    country: 'Russia'
  },
  de: {
    phoneCode: '49',
    country: 'Germany'
  },
  it: {
    phoneCode: '39',
    country: 'Italy'
  },
  id: {
    phoneCode: '62',
    country: 'Indonesia'
  },
  ph: {
    phoneCode: '63',
    country: 'Philippines'
  },
  pk: {
    phoneCode: '92',
    country: 'Pakistan'
  }
}

function normalizeLanguage(language) {
  const value = String(language || DEFAULT_LANGUAGE)
    .trim()
    .toLowerCase()
    .replace('_', '-')

  if (['zh-tw', 'zh-hk', 'tw'].includes(value)) return 'tw'
  if (value === 'zh' || value.startsWith('zh-')) return 'zh'

  return value.split('-')[0] || DEFAULT_LANGUAGE
}

export function getLanguageCountryConfig(language) {
  return LANGUAGE_COUNTRY_MAP[normalizeLanguage(language)] || LANGUAGE_COUNTRY_MAP.en
}

export function getDefaultPhoneCodeByLanguage(language) {
  return getLanguageCountryConfig(language).phoneCode
}

export function getCurrentLanguagePhoneCode() {
  return getDefaultPhoneCodeByLanguage(localStorage.getItem(storageDict.LANGUAGE))
}

export function getDefaultCountryByLanguage(language) {
  return getLanguageCountryConfig(language).country
}

export function getCurrentLanguageCountryKey() {
  return `nation_${getDefaultCountryByLanguage(localStorage.getItem(storageDict.LANGUAGE))}`
}
