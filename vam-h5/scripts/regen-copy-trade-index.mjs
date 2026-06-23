import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/plugin/i18n/copyTradeDocs')
const LOCALES = fs
  .readdirSync(outDir)
  .filter((f) => f.endsWith('.js') && f !== 'index.js')
  .map((f) => f.replace('.js', ''))
  .sort()

const imports = LOCALES.map((l) => `import ${l} from './${l}.js'`).join('\n')
const packEntries = LOCALES.map((l) => `  ${l}`).join(',\n')

const indexJs = `${imports}

const PACKS = {
${packEntries}
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
    copy_trade_risk_doc_content: texts.risk
  }
}
`

fs.writeFileSync(path.join(outDir, 'index.js'), indexJs)
console.log(`index.js regenerated (${LOCALES.length} locales)`)
