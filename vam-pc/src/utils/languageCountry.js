const LANGUAGE_COUNTRY_MAP = {
  en: {
    phoneCode: "1",
    country: "United States of America",
  },
  zh: {
    phoneCode: "86",
    country: "China",
  },
  tw: {
    phoneCode: "886",
    country: "Taiwan",
  },
  ja: {
    phoneCode: "81",
    country: "Japan",
  },
  ko: {
    phoneCode: "82",
    country: "South Korea",
  },
  pt: {
    phoneCode: "351",
    country: "Portugal",
  },
  vi: {
    phoneCode: "84",
    country: "Vietnam",
  },
  th: {
    phoneCode: "66",
    country: "Thailand",
  },
  es: {
    phoneCode: "34",
    country: "Spain",
  },
  fr: {
    phoneCode: "33",
    country: "France",
  },
  ru: {
    phoneCode: "7",
    country: "Russia",
  },
  de: {
    phoneCode: "49",
    country: "Germany",
  },
  it: {
    phoneCode: "39",
    country: "Italy",
  },
  id: {
    phoneCode: "62",
    country: "Indonesia",
  },
  pk: {
    phoneCode: "92",
    country: "Pakistan",
  },
};

function normalizeLanguage(language) {
  const value = String(language || "")
    .trim()
    .toLowerCase()
    .replace("_", "-");

  if (["zh-tw", "zh-hk", "tw"].includes(value)) return "tw";
  if (value === "zh" || value.startsWith("zh-")) return "zh";

  return value.split("-")[0] || "en";
}

export function getLanguageCountryConfig(language) {
  return LANGUAGE_COUNTRY_MAP[normalizeLanguage(language)] || LANGUAGE_COUNTRY_MAP.en;
}

export function getDefaultPhoneCodeByLanguage(language) {
  return getLanguageCountryConfig(language).phoneCode;
}

export function getDefaultCountryByLanguage(language) {
  return getLanguageCountryConfig(language).country;
}

export function resolvePhoneCodeByLanguage(language, areaData = [], fallbackPhoneCode = "1") {
  const defaultPhoneCode = getDefaultPhoneCodeByLanguage(language);
  const list = Array.isArray(areaData)
    ? areaData.reduce((result, group) => {
        if (Array.isArray(group.data)) {
          return result.concat(group.data);
        }
        return result;
      }, [])
    : [];

  if (!list.length) return defaultPhoneCode;

  const matchedDefault = list.find(
    (item) => String(item.phoneCode) === String(defaultPhoneCode)
  );
  if (matchedDefault) return matchedDefault.phoneCode;

  const matchedFallback = list.find(
    (item) => String(item.phoneCode) === String(fallbackPhoneCode)
  );
  if (matchedFallback) return matchedFallback.phoneCode;

  return list[0]?.phoneCode || defaultPhoneCode;
}
