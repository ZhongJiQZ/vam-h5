import af from './af.js'
import ar from './ar.js'
import da from './da.js'
import de from './de.js'
import en from './en.js'
import es from './es.js'
import fr from './fr.js'
import hi from './hi.js'
import id from './id.js'
import it from './it.js'
import iw from './iw.js'
import ja from './ja.js'
import ko from './ko.js'
import nl from './nl.js'
import pk from './pk.js'
import pl from './pl.js'
import pt from './pt.js'
import ru from './ru.js'
import th from './th.js'
import tr from './tr.js'
import tw from './tw.js'
import vi from './vi.js'
import zh from './zh.js'

const PACKS = {
  af,
  ar,
  da,
  de,
  en,
  es,
  fr,
  hi,
  id,
  it,
  iw,
  ja,
  ko,
  nl,
  pk,
  pl,
  pt,
  ru,
  th,
  tr,
  tw,
  vi,
  zh
}

export function resolveCopyTradeDocLocale(locale) {
  const raw = String(locale || 'en')
  if (PACKS[raw]) return raw
  const short = raw.split('-')[0]
  if (PACKS[short]) return short
  return 'en'
}

export function getCopyTradeDocTexts(locale) {
  const key = resolveCopyTradeDocLocale(locale)
  return PACKS[key] || PACKS.en
}

export function getCopyTradeDocMessages(locale) {
  const texts = getCopyTradeDocTexts(locale)
  return {
    copy_trade_intro_doc_content: texts.intro,
    copy_trade_agreement_doc_content: texts.agreement,
    copy_trade_risk_doc_content: texts.risk,
    copy_trade_institution_rules_doc_content: texts.institutionRules
  }
}
