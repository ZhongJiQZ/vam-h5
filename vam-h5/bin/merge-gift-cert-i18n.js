/**
 * 将礼券页英文文案合并到各语言包（跳过 zh / tw，由人工维护）
 * 运行: node bin/merge-gift-cert-i18n.js
 */
const fs = require('fs')
const path = require('path')

const GIFT_EN = {
  gift_cert_title: 'Recharge · Rewards & Gifts',
  gift_cert_empty_activity: 'No voucher campaign yet. Please try again later.',
  gift_cert_current_activity: 'Current campaign:',
  gift_cert_voucher_name_fallback: 'Voucher',
  gift_cert_placeholder_code: 'Enter voucher code',
  gift_cert_redeem: 'Redeem',
  gift_cert_claim: 'Claim',
  gift_cert_progress_recharged: 'Recharged: {cur} / {tgt} {sym}',
  gift_cert_feed_empty: 'No recent activity',
  gift_cert_section_live: 'Live feed',
  gift_cert_rule_participate_title: 'How to participate',
  gift_cert_rule_participate_body:
    'For every {hint} deposited (single or cumulative), you may receive trial vouchers (amount follows each campaign). When eligible, tap Claim to get a code. Limits follow your progress and platform rules.',
  gift_cert_rule_guide_title: 'Code usage',
  gift_cert_rule_guide_body:
    'Codes may be shared with friends. Usually only verified new users may redeem. Codes expire 7 days after generation unless stated otherwise.',
  gift_cert_rule_trial_title: 'Trial balance rules',
  gift_cert_rule_trial_body:
    'Trial funds are used first as contract margin. After closing a position, trial principal returns to the system and net profit goes to your cash wallet. If required margin exceeds trial balance, your own funds will be used automatically.',
  gift_cert_toast_input_code: 'Please enter a voucher code',
  gift_cert_toast_login: 'Please sign in first',
  gift_cert_toast_claim_ok: 'Redeemed successfully',
  gift_cert_toast_allocate_ok: 'Claimed successfully',
  gift_cert_toast_no_activity: 'No active campaign',
  gift_cert_toast_allocate_denied: 'Not eligible to claim yet',
  gift_cert_feed_congrats: 'Congrats! UID{uid} claimed a {amt} {cur} trial voucher!',
  gift_cert_my_codes_title: 'Your trial vouchers',
  gift_cert_my_codes_empty: 'No vouchers yet'
}

const dir = path.join(__dirname, '../src/plugin/i18n/locales')
const skip = new Set(['zh.json', 'tw.json'])

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json') || skip.has(f)) continue
  const p = path.join(dir, f)
  const j = JSON.parse(fs.readFileSync(p, 'utf8'))
  Object.assign(j, GIFT_EN)
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8')
}

console.log('Merged gift_cert_* keys into locale JSON files (except zh, tw).')
