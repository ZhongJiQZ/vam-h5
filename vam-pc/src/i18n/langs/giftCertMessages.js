/**
 * PC 体验券页英文兜底（与 i18n/index.js 中 withGiftCert 联用）。
 * - 已人工维护完整翻译：zh.js、tw.js 内的 gift_cert（勿在此处覆盖）。
 * - 其余语言（ja/ko/de/…）：注入本文件英文，键与页面 gift_cert.* 一一对应；若需地道翻译，在对应 lang 文件增加 gift_cert 并改为合并策略即可。
 */
export default {
  navbarTrialVoucher: "Trial voucher",
  gift_cert: {
    title: "Recharge · Rewards & Gifts",
    empty_activity: "No voucher campaign yet. Please try again later.",
    current_activity: "Current campaign:",
    voucher_name_fallback: "Voucher",
    placeholder_code: "Enter voucher code",
    redeem: "Redeem",
    claim: "Claim",
    progress_recharged: "Recharged: {cur} / {tgt} {sym}",
    feed_empty: "No recent activity",
    section_live: "Live feed",
    rule_participate_title: "How to participate",
    rule_participate_body:
      "For every {hint} deposited (single or cumulative), you may receive trial vouchers (amount follows each campaign). When eligible, tap Claim to get a code. Limits follow your progress and platform rules.",
    rule_guide_title: "Code usage",
    rule_guide_body:
      "Codes may be shared with friends. Usually only verified new users may redeem. Codes expire 7 days after generation unless stated otherwise.",
    rule_trial_title: "Trial balance rules",
    rule_trial_body:
      "Trial funds are used first as contract margin. After closing a position, trial principal returns to the system and net profit goes to your cash wallet. If required margin exceeds trial balance, your own funds will be used automatically.",
    toast_input_code: "Please enter a voucher code",
    toast_login: "Please sign in first",
    toast_claim_ok: "Redeemed successfully",
    toast_allocate_ok: "Claimed successfully",
    toast_no_activity: "No active campaign",
    toast_allocate_denied: "Not eligible to claim yet",
    feed_congrats: "Congrats! UID{uid} claimed a {amt} {cur} trial voucher!",
    feed_claim_line: "{userMask} claimed ×{amount} — {batchName}",
    my_codes_title: "Your trial vouchers",
    my_codes_empty: "No vouchers yet",
    my_code_unused: "Unused",
    my_code_used: "Used",
    my_codes_open: "My vouchers",
    copy_btn: "Copy",
  },
};
