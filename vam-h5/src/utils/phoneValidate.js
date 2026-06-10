/** 印尼区号（不含 +） */
export const INDONESIA_AREA_CODE = '1'

export function digitsOnlyMobile(mobile) {
  return String(mobile ?? '').replace(/\D/g, '')
}

export function isIndonesiaAreaCode(areaCode) {
  return String(areaCode ?? '').replace(/\D/g, '') === INDONESIA_AREA_CODE
}

/**
 * @returns {{ ok: boolean, key?: string, digits?: string }}
 */
export function validateMobileByAreaCode(areaCode, mobile) {
  const digits = digitsOnlyMobile(mobile)
  if (!digits) {
    return { ok: false, key: 'please_mobile' }
  }
  if (isIndonesiaAreaCode(areaCode)) {
    if (digits.length < 10 || digits.length > 13) {
      return { ok: false, key: 'mobile_id_length_error' }
    }
  }
  return { ok: true, digits }
}
