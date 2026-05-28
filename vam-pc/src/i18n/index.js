import en from "./langs/en";
import ja from "./langs/ja";
import ko from "./langs/ko";
import zh from "./langs/zh";
import pt from "./langs/pt";
import vi from "./langs/vi";
import th from "./langs/th";
import es from "./langs/es";
import fr from "./langs/fr";
import ru from "./langs/ru";
import de from "./langs/de";
import it from "./langs/it";
import tw from "./langs/tw";
import id from "./langs/id";
import pk from "./langs/pk";
import giftCertMessages from "./langs/giftCertMessages";
// import hk from './zh-hk.json'
// import vi from './vi-vn.json'
// import de from './de-DE.json'
// import ja from './ja-JP.json'
// import fr from './fr-FR.json'
// import ru from './ru-RU.json'
// import th from './th-TH.json'
// import es from './es-ES.json'
// import kr from './kr-KR.json'
// import ms from './ms.json'

import enLocale from "element-ui/lib/locale/lang/en";
import zhLocale from "element-ui/lib/locale/lang/zh-CN";
// src/i18n/index.js

const pcCopyTradeEn = {
  pc_copy_trade_title: "Copy Trade Strategies",
  pc_copy_trade_my: "My Copy Trades",
  pc_copy_trade_submit_title: "Follow Strategy",
  pc_copy_trade_detail_title: "Copy Trade Details",
  pc_copy_trade_status: "Status",
  pc_copy_trade_unknown_status: "Unknown status",
  pc_copy_trade_tab_ongoing: "Ongoing",
  pc_copy_trade_tab_ended: "Ended",
  pc_copy_trade_rate: "Profit rate",
  pc_copy_trade_join_window: "Join window",
  pc_copy_trade_amount: "Copy amount",
  pc_copy_trade_amount_placeholder: "Please enter copy amount",
  pc_copy_trade_range: "Amount range",
  pc_copy_trade_follow_now: "Follow now",
  pc_copy_trade_unjoinable: "Unavailable to join",
  pc_copy_trade_amount_invalid: "Amount is out of allowed range",
  pc_copy_trade_submit_success: "Submitted successfully",
  pc_copy_trade_empty: "No strategies",
  pc_copy_trade_no_data: "No data",
  pc_copy_trade_disabled: "Copy trading is unavailable",
  pc_copy_trade_no_limit: "No limit",
  pc_copy_trade_symbol: "Symbol",
  pc_copy_trade_join_time: "Join time",
  pc_copy_trade_end_time: "End time",
  pc_copy_trade_cycle_progress: "Cycle progress",
  pc_copy_trade_current_pnl: "Current PnL",
  pc_copy_trade_view_detail: "View details",
  pc_copy_trade_target_profit: "Target profit",
  pc_copy_trade_win_lose: "Wins/Losses",
  pc_copy_trade_profit_loss_breakdown: "Profit/Loss breakdown",
  pc_copy_trade_pnl_rate: "PnL rate",
  pc_copy_trade_stop: "Stop Copy",
  pc_copy_trade_history_positions: "History positions",
  pc_copy_trade_direction: "Direction",
  pc_copy_trade_long: "Long",
  pc_copy_trade_short: "Short",
  pc_copy_trade_open_price: "Open price",
  pc_copy_trade_close_price: "Close price",
  pc_copy_trade_pnl_usdt: "PnL (USDT)",
  pc_copy_trade_open_time: "Open time",
  pc_copy_trade_close_time: "Close time",
  pc_copy_trade_stop_confirm_desc: "Are you sure to stop this copy trade?",
  pc_copy_trade_tips: "Tips",
  pc_copy_trade_exit_success: "Exited successfully",
};

const pcCopyTradeZh = {
  pc_copy_trade_title: "跟单策略",
  pc_copy_trade_my: "我的跟单",
  pc_copy_trade_submit_title: "跟单提交",
  pc_copy_trade_detail_title: "跟单详情",
  pc_copy_trade_status: "状态",
  pc_copy_trade_unknown_status: "未知状态",
  pc_copy_trade_tab_ongoing: "进行中",
  pc_copy_trade_tab_ended: "已结束",
  pc_copy_trade_rate: "收益率",
  pc_copy_trade_join_window: "可加入时间",
  pc_copy_trade_amount: "跟单金额",
  pc_copy_trade_amount_placeholder: "请输入跟单金额",
  pc_copy_trade_range: "金额范围",
  pc_copy_trade_follow_now: "立即跟单",
  pc_copy_trade_unjoinable: "当前不可加入",
  pc_copy_trade_amount_invalid: "金额不在可跟单范围内",
  pc_copy_trade_submit_success: "提交成功",
  pc_copy_trade_empty: "暂无策略",
  pc_copy_trade_no_data: "暂无数据",
  pc_copy_trade_disabled: "跟单功能暂未开放",
  pc_copy_trade_no_limit: "不限",
  pc_copy_trade_symbol: "交易对",
  pc_copy_trade_join_time: "加入时间",
  pc_copy_trade_end_time: "结束时间",
  pc_copy_trade_cycle_progress: "周期进度",
  pc_copy_trade_current_pnl: "当前盈亏",
  pc_copy_trade_view_detail: "查看详情",
  pc_copy_trade_target_profit: "目标收益",
  pc_copy_trade_win_lose: "胜/负",
  pc_copy_trade_profit_loss_breakdown: "盈亏拆分",
  pc_copy_trade_pnl_rate: "盈亏率",
  pc_copy_trade_stop: "停止跟单",
  pc_copy_trade_history_positions: "历史持仓",
  pc_copy_trade_direction: "方向",
  pc_copy_trade_long: "做多",
  pc_copy_trade_short: "做空",
  pc_copy_trade_open_price: "开仓价",
  pc_copy_trade_close_price: "平仓价",
  pc_copy_trade_pnl_usdt: "盈亏(USDT)",
  pc_copy_trade_open_time: "开仓时间",
  pc_copy_trade_close_time: "平仓时间",
  pc_copy_trade_stop_confirm_desc: "确认停止该跟单？",
  pc_copy_trade_tips: "提示",
  pc_copy_trade_exit_success: "退出成功",
};

const pcCopyTradeTw = {
  pc_copy_trade_title: "跟單策略",
  pc_copy_trade_my: "我的跟單",
  pc_copy_trade_submit_title: "跟單提交",
  pc_copy_trade_detail_title: "跟單詳情",
  pc_copy_trade_status: "狀態",
  pc_copy_trade_unknown_status: "未知狀態",
  pc_copy_trade_tab_ongoing: "進行中",
  pc_copy_trade_tab_ended: "已結束",
  pc_copy_trade_rate: "收益率",
  pc_copy_trade_join_window: "可加入時間",
  pc_copy_trade_amount: "跟單金額",
  pc_copy_trade_amount_placeholder: "請輸入跟單金額",
  pc_copy_trade_range: "金額範圍",
  pc_copy_trade_follow_now: "立即跟單",
  pc_copy_trade_unjoinable: "當前不可加入",
  pc_copy_trade_amount_invalid: "金額不在可跟單範圍內",
  pc_copy_trade_submit_success: "提交成功",
  pc_copy_trade_empty: "暫無策略",
  pc_copy_trade_no_data: "暫無數據",
  pc_copy_trade_disabled: "跟單功能暫未開放",
  pc_copy_trade_no_limit: "不限",
  pc_copy_trade_symbol: "交易對",
  pc_copy_trade_join_time: "加入時間",
  pc_copy_trade_end_time: "結束時間",
  pc_copy_trade_cycle_progress: "週期進度",
  pc_copy_trade_current_pnl: "當前盈虧",
  pc_copy_trade_view_detail: "查看詳情",
  pc_copy_trade_target_profit: "目標收益",
  pc_copy_trade_win_lose: "勝/負",
  pc_copy_trade_profit_loss_breakdown: "盈虧拆分",
  pc_copy_trade_pnl_rate: "盈虧率",
  pc_copy_trade_stop: "停止跟單",
  pc_copy_trade_history_positions: "歷史持倉",
  pc_copy_trade_direction: "方向",
  pc_copy_trade_long: "做多",
  pc_copy_trade_short: "做空",
  pc_copy_trade_open_price: "開倉價",
  pc_copy_trade_close_price: "平倉價",
  pc_copy_trade_pnl_usdt: "盈虧(USDT)",
  pc_copy_trade_open_time: "開倉時間",
  pc_copy_trade_close_time: "平倉時間",
  pc_copy_trade_stop_confirm_desc: "確認停止該跟單？",
  pc_copy_trade_tips: "提示",
  pc_copy_trade_exit_success: "退出成功",
};

function withGiftCert(pack) {
  return {
    ...pack,
    navbar: {
      ...pack.navbar,
      trialVoucher: giftCertMessages.navbarTrialVoucher,
      copyTrade: (pack.navbar && pack.navbar.copyTrade) || "Copy Trade",
    },
    gift_cert: giftCertMessages.gift_cert,
  };
}

function withPcCopyTrade(pack, locale) {
  const localePack =
    locale === "zh" ? pcCopyTradeZh : locale === "tw" ? pcCopyTradeTw : {};
  return {
    ...pcCopyTradeEn,
    ...pack,
    ...localePack,
  };
}

export default {
  // 英文语言包（体验券文案与 giftCertMessages 统一，避免与 ja/ko 等英文兜底不一致）
  en: {
    ...withPcCopyTrade(withGiftCert(en), "en"),
    ...enLocale,
  },
  ja: {
    ...withPcCopyTrade(withGiftCert(ja), "ja"),
    ...enLocale,
  },
  ko: {
    ...withPcCopyTrade(withGiftCert(ko), "ko"),
    ...enLocale,
  },

  pt: {
    ...withPcCopyTrade(withGiftCert(pt), "pt"),
    ...enLocale,
  },
  vi: {
    ...withPcCopyTrade(withGiftCert(vi), "vi"),
    ...enLocale,
  },
  th: {
    ...withPcCopyTrade(withGiftCert(th), "th"),
    ...enLocale,
  },
  es: {
    ...withPcCopyTrade(withGiftCert(es), "es"),
    ...enLocale,
  },
  fr: {
    ...withPcCopyTrade(withGiftCert(fr), "fr"),
    ...enLocale,
  },
  ru: {
    ...withPcCopyTrade(withGiftCert(ru), "ru"),
    ...enLocale,
  },
  de: {
    ...withPcCopyTrade(withGiftCert(de), "de"),
    ...enLocale,
  },
  it: {
    ...withPcCopyTrade(withGiftCert(it), "it"),
    ...enLocale,
  },
  // 简/繁：各语言文件内需保留完整 gift_cert（勿用 giftCertMessages 覆盖）
  zh: {
    ...withPcCopyTrade(zh, "zh"),
    navbar: {
      ...zh.navbar,
      copyTrade: (zh.navbar && zh.navbar.copyTrade) || "跟单",
    },
    ...zhLocale,
  },
  tw: {
    ...withPcCopyTrade(tw, "tw"),
    navbar: {
      ...tw.navbar,
      copyTrade: (tw.navbar && tw.navbar.copyTrade) || "跟單",
    },
    ...zhLocale,
  },
  id: {
    ...withPcCopyTrade(withGiftCert(id), "id"),
    ...enLocale,
  },
  pk: {
    ...withPcCopyTrade(withGiftCert(pk), "pk"),
    ...enLocale,
  },
};

// import Vue from "vue"
// import VueI18n from "vue-i18n"
// //引入自定义语言配置
// import zh from './langs/zh'
// import en from './langs/en'
// //引入UI框架语言配置---elementui
// import ElementLocale from 'element-ui/lib/locale'
// import enLocale from 'element-ui/lib/locale/lang/en'
// import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

// ElementLocale.i18n((key, value) => i18n.t(key, value)) //为了实现element插件的多语言切换
// Vue.use(VueI18n); // 全局注册国际化包

// console.log("lang====>",localStorage.getItem('lang'));
// // 准备翻译的语言环境信息
// const i18n = new VueI18n({
//     locale: localStorage.getItem('lang') || "zh", //将语言标识存入localStorage或sessionStorage中，页面刷新不会默认中文显示
//     messages: {
//         // 中文语言包
//         'zh': {
//             ...zh,
//             ...zhLocale
//         },
//         //英文语言包
//         'en': {
//             ...en,
//             ...enLocale
//         }
//     },
//     silentTranslationWarn: true, //解决vue-i18n黄色警告"value of key 'xxx' is not a string"和"cannot translate the value of keypath 'xxx'.use the value of keypath as default",可忽略
//     globalInjection: true, // 全局注入
//     //fallbackLocale: 'zh', // 指定的locale没有找到对应的资源或当前语种不存在时，默认设置当前语种为中文
// });

// export default i18n
