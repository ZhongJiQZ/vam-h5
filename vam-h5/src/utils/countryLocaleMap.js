/**
 * ISO 3166-1 alpha-2 国家码 -> 前端语言 dictValue
 * 仅作默认语言推断；最终仍须在后端 t_app_language 列表中开启对应语言。
 */
const COUNTRY_TO_LOCALE = {
  PH: 'ph',
  ID: 'id',
  CN: 'zh',
  TW: 'tw',
  HK: 'tw',
  MO: 'tw',
  JP: 'ja',
  KR: 'ko',
  TH: 'th',
  VN: 'vi',
  PK: 'pk',
  US: 'en',
  GB: 'en',
  CA: 'en',
  AU: 'en',
  NZ: 'en',
  IE: 'en',
  SG: 'en',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  PE: 'es',
  VE: 'es',
  FR: 'fr',
  BE: 'fr',
  CH: 'fr',
  DE: 'de',
  AT: 'de',
  IT: 'it',
  PT: 'pt',
  BR: 'pt',
  AO: 'pt',
  MZ: 'pt',
  RU: 'ru',
  BY: 'ru',
  KZ: 'ru',
  NL: 'nl',
  PL: 'pl',
  TR: 'tr',
  SA: 'ar',
  AE: 'ar',
  EG: 'ar',
  JO: 'ar',
  KW: 'ar',
  IQ: 'ar',
  OM: 'ar',
  QA: 'ar',
  YE: 'ar',
  BH: 'ar',
  LB: 'ar',
  SY: 'ar',
  DZ: 'ar',
  MA: 'ar',
  TN: 'ar',
  IN: 'hi',
  IL: 'iw',
  ZA: 'af',
  DK: 'da'
}

export function countryCodeToLocale(countryCode) {
  const code = String(countryCode || '')
    .trim()
    .toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return null
  return COUNTRY_TO_LOCALE[code] || null
}
