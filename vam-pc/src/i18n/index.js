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
  pc_copy_trade_strategy_start_time: "Strategy Start Time",
  pc_copy_trade_strategy_end_time: "Strategy End Time",
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
  pc_copy_trade_profit_share_rate: "Profit share rate",
  pc_copy_trade_profit_share_rate_none: "No profit share",
  pc_copy_trade_profit_share_rate_desc: "Charged on profit portion only",
  pc_copy_trade_trade_fee: "Trading fee",
  pc_copy_trade_profit_share_amt: "Profit share amount",
  pc_copy_trade_net_profit: "Net profit",
  pc_copy_trade_append: "Add investment",
  pc_copy_trade_append_title: "Add investment",
  pc_copy_trade_append_amount: "Add amount",
  pc_copy_trade_append_amount_placeholder: "Enter add amount",
  pc_copy_trade_append_amount_invalid: "Please enter a valid amount",
  pc_copy_trade_append_success: "Investment added successfully",
  pc_copy_trade_append_failed: "Failed to add investment",
  pc_copy_trade_append_tip: "Amount will be deducted from contract account",
  pc_copy_trade_contract_balance: "Contract balance",
  pc_copy_trade_insufficient_balance: "Insufficient balance",
  pc_copy_trade_inst_title: "Institutions",
  pc_copy_trade_inst_empty: "No institutions",
  pc_copy_trade_inst_subscribers: "{n} subscribers",
  pc_copy_trade_inst_subscribe: "Subscribe",
  pc_copy_trade_inst_subscribed: "Subscribed",
  pc_copy_trade_inst_sub_hint: "Enter the institution invite code",
  pc_copy_trade_inst_secret_ph: "Invite code",
  pc_copy_trade_inst_secret_required: "Please enter invite code",
  pc_copy_trade_inst_sub_ok: "Subscribed successfully",
  pc_copy_trade_inst_lock_warn: "5 failed attempts will lock for 1 hour",
  pc_copy_trade_inst_locked: "Locked for 1 hour, try later",
  pc_copy_trade_inst_subscribe_first: "Please subscribe to this institution first",
  pc_copy_trade_join_date: "Join date",
  pc_copy_trade_trading_days: "Trading days",
  pc_copy_trade_normal_share: "Normal exit share",
  pc_copy_trade_force_share: "Force close share",
  pc_copy_trade_inst_perf: "Institution performance",
  pc_copy_trade_my_perf: "My copy records",
  pc_copy_trade_range_7d: "7D",
  pc_copy_trade_range_15d: "15D",
  pc_copy_trade_range_30d: "30D",
  pc_copy_trade_range_all: "All",
  pc_copy_trade_range_rate: "Range return",
  pc_copy_trade_total_rate: "Total return",
  pc_copy_trade_total_profit: "Total profit",
  pc_copy_trade_daily_chart: "Daily returns",
  pc_copy_trade_coin_pref: "Coin preference",
  pc_copy_trade_no_chart: "No chart data",
  pc_copy_trade_join_strategy: "Join strategy",
  pc_copy_trade_date: "Date",
  pc_copy_trade_agreement: "Copy agreement",
  pc_copy_trade_risk: "Risk disclosure",
  pc_copy_trade_coin_count: "Trades",
  pc_copy_trade_weekly_chart: "Weekly returns",
  pc_copy_trade_copy_days: "Copy days",
  pc_copy_trade_inst_intro: "About",
  pc_copy_trade_inst_intro_title: "Institution",
  pc_copy_trade_signal_provider: "Signal provider",
  pc_copy_trade_rules_title: "Provider rules",
  pc_copy_trade_min_amount: "Min copy amount",
  pc_copy_trade_max_amount: "Max copy amount",
  pc_copy_trade_semi_share: "Semi-managed share",
  pc_copy_trade_full_share: "Fully-managed share",
  pc_copy_trade_total_followers: "Total followers",
  pc_copy_trade_join_time_label: "Join time",
  pc_copy_trade_daily_perf: "Daily performance",
  pc_copy_trade_weekly_perf: "Weekly performance",
  pc_copy_trade_desc_more: "More",
  pc_copy_trade_range_7d_total: "7-day total return",
  pc_copy_trade_range_15d_total: "15-day total return",
  pc_copy_trade_range_30d_total: "30-day total return",
  pc_copy_trade_range_all_total: "All-time total return",
  pc_copy_trade_inst_sub_modal_hint: "This institution is invite-only. Enter the subscription code issued offline.",
  pc_copy_trade_inst_secret_footer: "Valid permanently after subscription · One key per institution per user",
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
  pc_copy_trade_strategy_start_time: "策略启动时间",
  pc_copy_trade_strategy_end_time: "策略结束时间",
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
  pc_copy_trade_profit_share_rate: "机构分润比例",
  pc_copy_trade_profit_share_rate_none: "不分润",
  pc_copy_trade_profit_share_rate_desc: "仅对盈利部分收取",
  pc_copy_trade_trade_fee: "交易手续费",
  pc_copy_trade_profit_share_amt: "机构分润金额",
  pc_copy_trade_net_profit: "实际盈利",
  pc_copy_trade_append: "追加投资",
  pc_copy_trade_append_title: "追加投资",
  pc_copy_trade_append_amount: "追加金额",
  pc_copy_trade_append_amount_placeholder: "请输入追加金额",
  pc_copy_trade_append_amount_invalid: "请输入有效追加金额",
  pc_copy_trade_append_success: "追加投资成功",
  pc_copy_trade_append_failed: "追加投资失败",
  pc_copy_trade_append_tip: "追加金额将从合约账户扣除",
  pc_copy_trade_contract_balance: "合约账户余额",
  pc_copy_trade_insufficient_balance: "余额不足",
  pc_copy_trade_inst_title: "机构信息",
  pc_copy_trade_inst_empty: "暂无机构",
  pc_copy_trade_inst_subscribers: "{n} 人已订阅",
  pc_copy_trade_inst_subscribe: "订阅",
  pc_copy_trade_inst_subscribed: "已订阅",
  pc_copy_trade_inst_sub_hint: "请输入机构线下发放的订阅邀请码",
  pc_copy_trade_inst_secret_ph: "请输入邀请码",
  pc_copy_trade_inst_secret_required: "请输入机构密钥",
  pc_copy_trade_inst_sub_ok: "订阅成功",
  pc_copy_trade_inst_lock_warn: "连续错误5次将锁定1小时",
  pc_copy_trade_inst_locked: "密钥错误次数过多，请1小时后再试",
  pc_copy_trade_inst_subscribe_first: "请先订阅该机构后再查看",
  pc_copy_trade_join_date: "入驻时间",
  pc_copy_trade_trading_days: "带单天数",
  pc_copy_trade_normal_share: "正常退出分润",
  pc_copy_trade_force_share: "强平分润",
  pc_copy_trade_inst_perf: "机构带单表现",
  pc_copy_trade_my_perf: "我的跟单记录",
  pc_copy_trade_range_7d: "7天",
  pc_copy_trade_range_15d: "15天",
  pc_copy_trade_range_30d: "30天",
  pc_copy_trade_range_all: "全部",
  pc_copy_trade_range_rate: "区间总收益率",
  pc_copy_trade_total_rate: "总收益率",
  pc_copy_trade_total_profit: "总收益",
  pc_copy_trade_daily_chart: "每日收益",
  pc_copy_trade_coin_pref: "币种偏好",
  pc_copy_trade_no_chart: "暂无图表数据",
  pc_copy_trade_join_strategy: "加入跟单",
  pc_copy_trade_date: "日期",
  pc_copy_trade_agreement: "跟单协议书",
  pc_copy_trade_risk: "风险揭示书",
  pc_copy_trade_coin_count: "笔数",
  pc_copy_trade_weekly_chart: "每周收益",
  pc_copy_trade_copy_days: "跟单天数",
  pc_copy_trade_inst_intro: "机构简介",
  pc_copy_trade_inst_intro_title: "机构介绍",
  pc_copy_trade_signal_provider: "信号提供商",
  pc_copy_trade_rules_title: "信号提供商规则",
  pc_copy_trade_min_amount: "最低跟单金额",
  pc_copy_trade_max_amount: "最高跟单金额",
  pc_copy_trade_semi_share: "半托管分润%",
  pc_copy_trade_full_share: "全托管分润%",
  pc_copy_trade_total_followers: "跟单总人数",
  pc_copy_trade_join_time_label: "入驻时间",
  pc_copy_trade_daily_perf: "每日收益表现",
  pc_copy_trade_weekly_perf: "每周收益表现",
  pc_copy_trade_desc_more: "更多",
  pc_copy_trade_range_7d_total: "7天总收益率",
  pc_copy_trade_range_15d_total: "15天总收益率",
  pc_copy_trade_range_30d_total: "30天总收益率",
  pc_copy_trade_range_all_total: "全部总收益率",
  pc_copy_trade_inst_sub_modal_hint: "该机构为私域邀请制，请输入机构线下发放的订阅邀请码",
  pc_copy_trade_inst_secret_footer: "订阅后永久有效 · 一密钥一机构一用户",
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
  pc_copy_trade_strategy_start_time: "策略啟動時間",
  pc_copy_trade_strategy_end_time: "策略結束時間",
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
  pc_copy_trade_profit_share_rate: "機構分潤比例",
  pc_copy_trade_profit_share_rate_none: "不分潤",
  pc_copy_trade_profit_share_rate_desc: "僅對盈利部分收取",
  pc_copy_trade_trade_fee: "交易手續費",
  pc_copy_trade_profit_share_amt: "機構分潤金額",
  pc_copy_trade_net_profit: "實際盈利",
  pc_copy_trade_append: "追加投資",
  pc_copy_trade_append_title: "追加投資",
  pc_copy_trade_append_amount: "追加金額",
  pc_copy_trade_append_amount_placeholder: "請輸入追加金額",
  pc_copy_trade_append_amount_invalid: "請輸入有效追加金額",
  pc_copy_trade_append_success: "追加投資成功",
  pc_copy_trade_append_failed: "追加投資失敗",
  pc_copy_trade_append_tip: "追加金額將從合約賬戶扣除",
  pc_copy_trade_contract_balance: "合約賬戶餘額",
  pc_copy_trade_insufficient_balance: "餘額不足",
  pc_copy_trade_inst_title: "機構信息",
  pc_copy_trade_inst_empty: "暫無機構",
  pc_copy_trade_inst_subscribers: "{n} 人已訂閱",
  pc_copy_trade_inst_subscribe: "訂閱",
  pc_copy_trade_inst_subscribed: "已訂閱",
  pc_copy_trade_inst_sub_hint: "請輸入機構線下發放的訂閱邀請碼",
  pc_copy_trade_inst_secret_ph: "請輸入邀請碼",
  pc_copy_trade_inst_secret_required: "請輸入機構密鑰",
  pc_copy_trade_inst_sub_ok: "訂閱成功",
  pc_copy_trade_inst_lock_warn: "連續錯誤5次將鎖定1小時",
  pc_copy_trade_inst_locked: "密鑰錯誤次數過多，請1小時後再試",
  pc_copy_trade_inst_subscribe_first: "請先訂閱該機構後再查看",
  pc_copy_trade_join_date: "入駐時間",
  pc_copy_trade_trading_days: "帶單天數",
  pc_copy_trade_normal_share: "正常退出分潤",
  pc_copy_trade_force_share: "強平分潤",
  pc_copy_trade_inst_perf: "機構帶單表現",
  pc_copy_trade_my_perf: "我的跟單記錄",
  pc_copy_trade_range_7d: "7天",
  pc_copy_trade_range_15d: "15天",
  pc_copy_trade_range_30d: "30天",
  pc_copy_trade_range_all: "全部",
  pc_copy_trade_range_rate: "區間總收益率",
  pc_copy_trade_total_rate: "總收益率",
  pc_copy_trade_total_profit: "總收益",
  pc_copy_trade_daily_chart: "每日收益",
  pc_copy_trade_coin_pref: "幣種偏好",
  pc_copy_trade_no_chart: "暫無圖表數據",
  pc_copy_trade_join_strategy: "加入跟單",
  pc_copy_trade_date: "日期",
  pc_copy_trade_agreement: "跟單協議書",
  pc_copy_trade_risk: "風險揭示書",
  pc_copy_trade_coin_count: "筆數",
  pc_copy_trade_weekly_chart: "每週收益",
  pc_copy_trade_copy_days: "跟單天數",
  pc_copy_trade_inst_intro: "機構簡介",
  pc_copy_trade_inst_intro_title: "機構介紹",
  pc_copy_trade_signal_provider: "信號提供商",
  pc_copy_trade_rules_title: "信號提供商規則",
  pc_copy_trade_min_amount: "最低跟單金額",
  pc_copy_trade_max_amount: "最高跟單金額",
  pc_copy_trade_semi_share: "半託管分潤%",
  pc_copy_trade_full_share: "全託管分潤%",
  pc_copy_trade_total_followers: "跟單總人數",
  pc_copy_trade_join_time_label: "入駐時間",
  pc_copy_trade_daily_perf: "每日收益表現",
  pc_copy_trade_weekly_perf: "每週收益表現",
  pc_copy_trade_desc_more: "更多",
  pc_copy_trade_range_7d_total: "7天總收益率",
  pc_copy_trade_range_15d_total: "15天總收益率",
  pc_copy_trade_range_30d_total: "30天總收益率",
  pc_copy_trade_range_all_total: "全部總收益率",
  pc_copy_trade_inst_sub_modal_hint: "該機構為私域邀請制，請輸入機構線下發放的訂閱邀請碼",
  pc_copy_trade_inst_secret_footer: "訂閱後永久有效 · 一密鑰一機構一用戶",
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
