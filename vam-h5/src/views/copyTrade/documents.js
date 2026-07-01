/** 跟单说明 / 协议 / 风险揭示书（文案来自 i18n copyTradeDocs，随语言切换） */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function plainTextToHtml(text) {
  return String(text || '')
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((block) => {
      const trimmed = block.trim()
      const lines = trimmed.split('\n')
      const isHeading =
        lines.length === 1 &&
        (trimmed.length <= 80 || /^[IVX]+\./.test(trimmed)) &&
        !trimmed.endsWith('.')
      if (isHeading) return `<h3>${escapeHtml(trimmed)}</h3>`
      return `<p>${lines.map(escapeHtml).join('<br>')}</p>`
    })
    .join('')
}

function resolveDocTitle(translate, keys, fallback) {
  if (typeof translate !== 'function') return fallback
  const list = Array.isArray(keys) ? keys : [keys]
  for (const key of list) {
    const t = translate(key)
    if (t && t !== key) return String(t).replace(/[《》]/g, '')
  }
  return fallback
}

function resolveDocContent(translate, key) {
  if (typeof translate !== 'function') return ''
  const t = translate(key)
  return t && t !== key ? String(t) : ''
}

export function getCopyTradeIntroDoc(translate) {
  const raw = resolveDocContent(translate, 'copy_trade_intro_doc_content')
  return {
    title: resolveDocTitle(translate, ['copy_trade_intro_doc_title', 'pc_copy_trade_intro_doc_title'], 'Copy Trading Rules'),
    content: plainTextToHtml(raw)
  }
}

export function getCopyTradeAgreementDoc(translate) {
  return {
    title: resolveDocTitle(translate, ['copy_trade_agreement_user', 'pc_copy_trade_agreement'], 'Copy Agreement'),
    content: plainTextToHtml(resolveDocContent(translate, 'copy_trade_agreement_doc_content'))
  }
}

export function getCopyTradeRiskDoc(translate) {
  return {
    title: resolveDocTitle(translate, ['copy_trade_risk', 'pc_copy_trade_risk'], 'Risk Disclosure'),
    content: plainTextToHtml(resolveDocContent(translate, 'copy_trade_risk_doc_content'))
  }
}

/** API 文档优先，无内容时使用本地默认 */
export function resolveCopyTradeDoc(apiDoc, fallbackDoc) {
  if (apiDoc && String(apiDoc.content || '').trim()) return apiDoc
  return fallbackDoc
}
