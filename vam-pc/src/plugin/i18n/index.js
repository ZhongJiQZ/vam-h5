// src/i18n/setup.js (文件名随你，但内容这样写)

import Vue from "vue";
import VueI18n from "vue-i18n";
import { DEFAULT_LANGUAGE } from "@/config";
import store from "@/store";

Vue.use(VueI18n);

/**
 * i18n 实例（Vue2：new VueI18n）
 */
let i18nInstance = null;

/**
 * 创建 i18n 实例
 */
export const setupI18n = async (locale = DEFAULT_LANGUAGE) => {
  const i18n = new VueI18n({
    locale,                 // 当前语言
    fallbackLocale: locale, // 默认语言
    silentTranslationWarn: true,
    messages: {},           // 先空，后面动态塞
  });

  i18nInstance = i18n;

  // 先加载语言包
  await loadLocaleMessages(i18n, locale);

  // 设置语言 + html 属性 + 同步 store
  setI18nLanguage(i18n, locale);

  return i18n;
};

/**
 * 设置语言（Vue2：i18n.locale）
 */
export function setI18nLanguage(i18n, locale) {
  i18n.locale = locale;

  const list = store.getters.languageList || [];
  const currentLanguage = list.filter((item) => item.dictValue === locale);

  const html = document.querySelector("html");
  if (html) {
    html.setAttribute("lang", locale);
    if (currentLanguage.length > 0) {
      html.setAttribute("language", currentLanguage[0].dictValue);
    } else {
      html.setAttribute("language", DEFAULT_LANGUAGE);
    }
  }

  // ✅ 这里不要 mainStore.setLanguage（你没 mainStore）
  // 改成 Vuex：按你项目实际的 mutation/action 名称改一下
  // 方案 A：commit
  if (store._mutations && store._mutations.SET_LANGUAGE) {
    store.commit("SET_LANGUAGE", locale);
  } else if (store._actions && store._actions.setLanguage) {
    // 方案 B：dispatch
    store.dispatch("setLanguage", locale);
  } else {
    // 没有就先不管，至少别报错
    // console.warn("No SET_LANGUAGE mutation or setLanguage action found in store");
  }
}

/**
 * 动态加载语言文件
 * Vue2 里给 i18n 塞消息：i18n.setLocaleMessage
 */
export const loadLocaleMessages = async (i18n, locale = "") => {
  const messages = await import(`./locales/${locale}.json`);
  i18n.setLocaleMessage(locale, messages.default || {});
  return messages;
};

/**
 * 切换语言
 */
export const setLanguage = async (locale) => {
  if (!i18nInstance) return;

  // v8 判断是否已加载：看 messages 里有没有该语言
  const has = i18nInstance.getLocaleMessage(locale);
  const hasLoaded = has && Object.keys(has).length > 0;

  if (!hasLoaded) {
    await loadLocaleMessages(i18nInstance, locale);
  }

  setI18nLanguage(i18nInstance, locale);
};
