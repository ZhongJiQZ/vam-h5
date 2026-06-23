/**
 * 将跟单协议文案翻译为全部支持语言，生成 copyTradeDocs/*.js
 * 用法: node scripts/translate-copy-trade-docs.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = path.join(root, 'src/plugin/i18n/copyTradeDocs')

/** H5 locale -> Google Translate target code */
const LOCALE_MAP = {
  af: 'af',
  ar: 'ar',
  da: 'da',
  de: 'de',
  en: 'en',
  es: 'es',
  fr: 'fr',
  hi: 'hi',
  id: 'id',
  it: 'it',
  iw: 'he',
  ja: 'ja',
  ko: 'ko',
  nl: 'nl',
  pk: 'ur',
  pl: 'pl',
  pt: 'pt',
  ru: 'ru',
  th: 'th',
  tr: 'tr',
  vi: 'vi',
  zh: 'zh-CN',
  tw: 'zh-TW'
}

const LOCALES = Object.keys(LOCALE_MAP)

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function splitChunks(text, maxLen = 3500) {
  const paragraphs = String(text).split('\n\n')
  const chunks = []
  let buf = ''
  for (const p of paragraphs) {
    const next = buf ? `${buf}\n\n${p}` : p
    if (next.length > maxLen && buf) {
      chunks.push(buf)
      buf = p
    } else if (p.length > maxLen) {
      if (buf) chunks.push(buf)
      for (let i = 0; i < p.length; i += maxLen) chunks.push(p.slice(i, i + maxLen))
      buf = ''
    } else {
      buf = next
    }
  }
  if (buf) chunks.push(buf)
  return chunks
}

async function translateChunk(text, target) {
  if (!text.trim() || target === 'en') return text
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`translate failed ${res.status} -> ${target}`)
  const data = await res.json()
  return data[0].map((row) => row[0]).join('')
}

async function translateText(text, target) {
  if (target === 'en') return text
  const chunks = splitChunks(text)
  const parts = []
  for (const chunk of chunks) {
    parts.push(await translateChunk(chunk, target))
    await sleep(300)
  }
  return parts.join('\n\n')
}

async function loadExisting(locale) {
  const file = path.join(outDir, `${locale}.js`)
  if (!fs.existsSync(file)) return null
  const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`)
  return mod.default
}

async function main() {
  const en = await loadExisting('en')
  const id = await loadExisting('id')
  const zh = await loadExisting('zh')
  const tw = await loadExisting('tw')
  if (!en) throw new Error('missing en.js')

  const manual = { en, id, zh, tw }
  const results = { ...manual }

  for (const locale of LOCALES) {
    if (manual[locale]) {
      console.log(`skip ${locale} (manual)`)
      continue
    }
    const target = LOCALE_MAP[locale]
    console.log(`translating ${locale} -> ${target}...`)
    try {
      results[locale] = {
        intro: await translateText(en.intro, target),
        agreement: await translateText(en.agreement, target),
        risk: await translateText(en.risk, target)
      }
      console.log(`  done ${locale}`)
    } catch (err) {
      console.error(`  failed ${locale}:`, err.message, '- fallback en')
      results[locale] = { ...en }
    }
  }

  fs.mkdirSync(outDir, { recursive: true })
  for (const locale of LOCALES) {
    const file = path.join(outDir, `${locale}.js`)
    fs.writeFileSync(file, `export default ${JSON.stringify(results[locale], null, 2)}\n`)
  }

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
  console.log(`generated ${LOCALES.length} locale files`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
