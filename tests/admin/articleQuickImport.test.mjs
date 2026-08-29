import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  ArticleQuickImportError, hasMeaningfulStructuredContent, parseKqcArticleImport,
} from '../../src/utils/articleQuickImport.mjs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const fails = (input, pattern) => assert.throws(() => parseKqcArticleImport(input), (error) => error instanceof ArticleQuickImportError && pattern.test(error.message))

// D2D-B1B — AI Article Quick Import executable parser contract
test('optional modules stay disabled and normal sections preserve paragraph boundaries', () => {
  const result = parseKqcArticleImport('## 第一章\n連續第一行\n連續第二行\n\n第二段\n\n## 第二章\n內容')
  assert.deepEqual(result.newsSummary, { enabled: false, content: null, sourceName: null, sourceUrl: null })
  assert.deepEqual(result.advisorAdvice, { enabled: false, title: 'KQC 顧問建議', blocks: [] })
  assert.deepEqual(result.sections.map(({ heading }) => heading), ['第一章', '第二章'])
  assert.deepEqual(result.sections[0].blocks.map(({ type }) => type), ['PARAGRAPH', 'PARAGRAPH'])
  assert.equal(result.sections[0].blocks[0].content[0].text, '連續第一行\n連續第二行')
})

test('valid News Summary, wrappers, lists, callout and Advisor map deterministically', () => {
  const result = parseKqcArticleImport(`【文章匯入本文開始】
## 新聞摘要
摘要內容
來源：交通部
網址：https://example.com/news

## 成本變化
正文

- 車輛成本
• 人力成本

1. 盤點
2. 調整

【重點提醒】
保留現金流

## KQC 顧問建議
顧問段落
【文章匯入本文結束】`)
  assert.deepEqual(result.newsSummary, { enabled: true, content: '摘要內容', sourceName: '交通部', sourceUrl: 'https://example.com/news' })
  assert.deepEqual(result.sections[0].blocks.map(({ type }) => type), ['PARAGRAPH', 'BULLET_LIST', 'NUMBERED_LIST', 'CALLOUT'])
  assert.deepEqual(result.sections[0].blocks[1].items.map((item) => item[0].text), ['車輛成本', '人力成本'])
  assert.deepEqual(result.sections[0].blocks[2].items.map((item) => item[0].text), ['盤點', '調整'])
  assert.equal(result.sections[0].blocks[3].content[0].text, '保留現金流')
  assert.equal(result.advisorAdvice.enabled, true)
  assert.equal(result.advisorAdvice.blocks[0].content[0].text, '顧問段落')
  assert.equal(JSON.stringify(result).includes('文章匯入本文'), false)
  for (const mark of JSON.stringify(result).matchAll(/"marks":(\[[^\]]*\])/g)) assert.equal(mark[1], '[]')
})

test('News Summary exact required fields and safe URL fail with specific messages', () => {
  fails('## 新聞摘要\n內容\n網址：https://example.com\n## 正文\n內容', /缺少「來源：」/)
  fails('## 新聞摘要\n內容\n來源：交通部\n## 正文\n內容', /缺少「網址：」/)
  fails('## 新聞摘要\n內容\n來源：交通部\n網址：javascript:x\n## 正文\n內容', /http 或 https/)
})

test('Advisor is optional but an explicit empty Advisor fails atomically', () => {
  assert.equal(parseKqcArticleImport('## 正文\n內容').advisorAdvice.enabled, false)
  fails('## 正文\n內容\n## KQC 顧問建議', /沒有內容/)
  const existing = parseKqcArticleImport('## 原內容\n不應改變')
  assert.throws(() => parseKqcArticleImport('## KQC 顧問建議\n內容'), ArticleQuickImportError)
  assert.equal(existing.sections[0].heading, '原內容')
})

test('section, block, list and required-normal-section limits reject precisely', () => {
  fails(Array.from({ length: 6 }, (_, index) => `## 章節${index + 1}\n內容`).join('\n'), /最多只能有 5 個/)
  fails(`## 章節\n${Array.from({ length: 11 }, (_, index) => `段落${index + 1}`).join('\n\n')}`, /11 個內容區塊/)
  fails(`## 章節\n${Array.from({ length: 11 }, (_, index) => `- 項目${index + 1}`).join('\n')}`, /11 項/)
  fails('## 新聞摘要\n內容\n來源：來源\n網址：https://example.com', /至少需要 1 個/)
})

test('untouched skeleton skips overwrite confirmation while meaningful structures require it', () => {
  const empty = { newsSummary: { enabled: false }, sections: [{ heading: '', blocks: [{ type: 'PARAGRAPH', content: [{ text: '', marks: [] }] }] }], advisorAdvice: { enabled: false } }
  assert.equal(hasMeaningfulStructuredContent(empty), false)
  assert.equal(hasMeaningfulStructuredContent({ ...empty, sections: [{ heading: '已編輯', blocks: empty.sections[0].blocks }] }), true)
  assert.equal(hasMeaningfulStructuredContent({ ...empty, newsSummary: { enabled: true } }), true)
})

test('Quick Import UI is session-only, metadata-isolated and preserves legacy/content fallback boundaries', () => {
  const view = read('src/views/admin/content/AdminArticlesView.vue')
  const component = read('src/components/admin/articles/ArticleQuickImport.vue')
  const api = read('src/api/adminArticles.ts')
  assert.match(view, /structuredSurface = ref<'CHOICE' \| 'IMPORT' \| 'EDITOR'>\('CHOICE'\)/)
  assert.match(view, /label="快速匯入文章"[\s\S]*label="手動建立結構化內容"/)
  assert.match(view, /article\.structuredContent \? 'EDITOR' : 'CHOICE'/)
  assert.match(view, /label="快速重新匯入"/)
  assert.match(component, /hasMeaningfulStructuredContent[\s\S]*needsConfirmation\.value = true/)
  assert.match(component, /emit\('apply', parsed\)/)
  assert.match(view, /buildLegacyContentFallback\(form\.structuredContent\)/)
  assert.match(view, /v-if="contentMode === 'LEGACY'"/)
  assert.doesNotMatch(api, /quickImport|importText|rawImport/i)
  // D2F-B-R1 — Quick Import Test Boundary
  // D2F-B inserted unrelated Cover Picker code, so raw import isolation is scoped to Article payload authority.
  const payloadStart = view.indexOf('const payload')
  const payloadEnd = view.indexOf('// D2F-B — Article Cover Picker', payloadStart)
  assert.ok(payloadStart >= 0 && payloadEnd > payloadStart)
  const articlePayload = view.slice(payloadStart, payloadEnd)
  assert.doesNotMatch(articlePayload, /quickImportText|quickImportFeedback|quickImportReturnSurface/)
  // D2D-B1B Regression Gate R6 — allow the DTO type-only import while
  // continuing to reject direct network, upload, and unsafe rendering behavior.
  const importSurface = `${component}\n${read('src/utils/articleQuickImport.mjs')}`
  for (const forbidden of [
    /\badminArticlesApi\b/,
    /\bfetch\s*\(/,
    /\baxios\b/i,
    /\bFormData\b/,
    /\.docx\b/i,
    /\bv-html\b/i,
    /\bcontenteditable\b/i,
  ]) assert.doesNotMatch(importSurface, forbidden)
})
