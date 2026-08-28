import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const api = read('src/api/adminArticles.ts')
const view = read('src/views/admin/content/AdminArticlesView.vue')
const editor = read('src/components/admin/articles/StructuredArticleEditor.vue')
const blocks = read('src/components/admin/articles/ArticleContentBlocksEditor.vue')
const helpers = read('src/utils/articleStructuredContent.ts')

// WEB-1F-D2D-B1 Regression Gate R1 — Static Contract Test Precision
// ============================================================
// Industry Insights — Platform Manager Article Editor Contract
// Structured Article Editor / WEB-1F-D2D-B1
// ============================================================
test('new articles default to structured mode while legacy edit remains explicit and non-destructive', () => {
  assert.match(view, /contentMode = ref<'LEGACY' \| 'STRUCTURED'>\('STRUCTURED'\)/)
  assert.match(view, /structuredContent: createStructuredArticleContent\(\)/)
  assert.match(view, /contentMode\.value = article\.structuredContent \? 'STRUCTURED' : 'LEGACY'/)
  assert.match(view, /article\.structuredContent \? cloneStructuredArticleContent\(article\.structuredContent\) : null/)
  assert.match(view, /const convertLegacyToStructured[\s\S]*createStructuredArticleContent\(\)/)
  const legacyEditor = view.slice(view.indexOf('<div v-if="contentMode === \'LEGACY\'"'), view.indexOf('<StructuredArticleEditor'))
  assert.match(legacyEditor, /<Button\b[^>]*\blabel="改用結構化文章內容"/)
  assert.match(legacyEditor, /<Button\b[^>]*@click="convertLegacyToStructured"/)
  assert.match(view, /contentMode\.value === 'STRUCTURED'[\s\S]*structuredContent/)
  assert.doesNotMatch(view, /openEdit[\s\S]{0,300}structuredContent:\s*createStructuredArticleContent/)
})

test('explicit TypeScript DTO matches the controlled Backend contract without unrestricted shapes', () => {
  for (const name of ['StructuredArticleContent', 'NewsSummary', 'ArticleSection', 'ArticleContentBlock', 'RichTextSegment', 'RichTextMark']) assert.match(api, new RegExp(`(?:interface|type) ${name}`))
  for (const value of ['BOLD', 'ITALIC', 'EMPHASIS', 'LINK', 'PARAGRAPH', 'BULLET_LIST', 'NUMBERED_LIST', 'CALLOUT']) assert.match(api, new RegExp(`'${value}'`))
  assert.match(api, /structuredContent: StructuredArticleContent \| null/)
  assert.match(api, /structuredContent\?: StructuredArticleContent/)
  assert.doesNotMatch(api.slice(api.indexOf('export type RichTextMark'), api.indexOf('export interface ArticleListResponse')), /\bany\b|Record<string,\s*any>/)
})

test('sections own bounded add, reorder and final-item deletion protection', () => {
  assert.match(helpers, /ARTICLE_SECTION_MAX = 5/)
  assert.match(helpers, /sections: \[createArticleSection\(\)\]/)
  assert.match(editor, /draft\.sections\.length < ARTICLE_SECTION_MAX/)
  assert.match(editor, /\[draft\.sections\[index\], draft\.sections\[target\]\] = \[draft\.sections\[target\], draft\.sections\[index\]\]/)
  assert.match(editor, /draft\.sections\.length > 1/)
  assert.match(editor, /:disabled="modelValue\.sections\.length === 1"/)
  assert.match(editor, /:disabled="modelValue\.sections\.length >= ARTICLE_SECTION_MAX"/)
  assert.match(editor, />章節 \{\{ sectionIndex \+ 1 \}\}</)
  assert.match(editor, /label="＋ 新增章節"/)
  assert.match(editor, /:owner-label="`章節 \$\{sectionIndex \+ 1\}`"/)
  assert.doesNotMatch(editor, /\bdraggable(?:\s|=)|drag-and-drop/i)
  assert.doesNotMatch(helpers, /[{,]\s*order\s*:/i)
})

test('one shared block editor owns all four block types and bounded list operations', () => {
  assert.equal((editor.match(/<ArticleContentBlocksEditor/g) ?? []).length, 2)
  assert.match(blocks, /import \{ toRaw \} from 'vue'/)
  assert.match(blocks, /const clone = \(\) => structuredClone\(toRaw\(props\.modelValue\)\)/)
  for (const type of ['PARAGRAPH', 'BULLET_LIST', 'NUMBERED_LIST', 'CALLOUT']) assert.match(blocks, new RegExp(`addBlock\\('${type}'\\)`))
  assert.match(helpers, /ARTICLE_BLOCK_MAX = 10/)
  assert.match(helpers, /ARTICLE_LIST_ITEM_MAX = 10/)
  assert.match(blocks, /props\.modelValue\.length <= 1/)
  assert.match(blocks, /v-if="modelValue\.length > 1" class="compact-actions"/)
  assert.match(blocks, /block\.items\.length > 1/)
  assert.match(blocks, /block\.items\.length < ARTICLE_LIST_ITEM_MAX/)
  assert.match(blocks, /\[blocks\[index\], blocks\[target\]\] = \[blocks\[target\], blocks\[index\]\]/)
  assert.match(blocks, /title = title \|\| null/)
})

test('news summary and advisor toggles map independently from top-level Article summary', () => {
  assert.match(editor, /import \{ toRaw \} from 'vue'/)
  assert.match(editor, /structuredClone\(toRaw\(props\.modelValue\)\)[^\n]*emit\('update:modelValue', draft\)/)
  assert.match(editor, />加入新聞摘要</)
  assert.match(editor, /content: '', sourceName: '', sourceUrl: ''/)
  assert.match(editor, /type="url"[\s\S]*placeholder="https:\/\/"/)
  assert.match(editor, />加入 KQC 顧問建議</)
  assert.match(editor, /draft\.advisorAdvice\.blocks = \[createArticleBlock\(\)\]/)
  assert.match(view, />文章摘要<Textarea v-model="form\.summary"/)
  assert.doesNotMatch(view, /newsSummary[^\n]*form\.summary|summary:\s*form\.structuredContent/)
})

test('payload uses controlled rich text, deterministic fallback and preserves untouched marks', () => {
  assert.match(helpers, /const plainSegment[\s\S]*\{ text, marks: \[\] \}/)
  assert.match(helpers, /richTextPlainText\(segments\) === text \? segments : plainSegment\(text\)/)
  assert.match(blocks, /updateRichText\(block\.content, text\)/)
  assert.match(blocks, /updateRichText\(block\.items\[itemIndex\], text\)/)
  assert.match(view, /buildLegacyContentFallback\(form\.structuredContent\)/)
  assert.match(helpers, /import \{ toRaw \} from 'vue'/)
  assert.match(helpers, /cloneStructuredArticleContent[\s\S]*structuredClone\(toRaw\(value\)\)/)
  assert.match(helpers, /新聞摘要/)
  assert.match(helpers, /`- \$\{richTextPlainText\(item\)\.trim\(\)\}`/)
  assert.match(helpers, /`\$\{index \+ 1\}\. \$\{richTextPlainText\(item\)\.trim\(\)\}`/)
  assert.match(helpers, /value\.advisorAdvice\.enabled/)
})

test('valid new structured Article save reaches the create API branch without proxy-clone failure', () => {
  const saveHandler = view.slice(view.indexOf('const saveArticle = async () => {'), view.indexOf('const deleteArticle'))
  assert.match(view, /<form class="article-form" @submit\.prevent="saveArticle">/)
  assert.match(view, /<Button type="submit" label="儲存"/)
  assert.match(saveHandler, /if \(editingId\.value\) await adminArticlesApi\.update\(editingId\.value, payload\(\)\)[\s\S]*else await adminArticlesApi\.create\(payload\(\)\)/)
  assert.match(view, /<Dialog[\s\S]*<form class="article-form"[\s\S]*<Message v-if="errorMessage"/)
  assert.match(helpers, /structuredClone\(toRaw\(value\)\)/)
  assert.doesNotMatch(helpers, /structuredClone\(value\)/)
})

test('validation is region-aware and covers structured bounds, content, news URL and advisor title', () => {
  for (const text of ['正文必須有 1–5 個文章段落。', '段落標題不可空白。', '段落內容不可空白。', '清單項目不可空白。', '重點提醒內容不可空白。', '新聞摘要內容不可空白。', '新聞來源名稱不可空白。', '新聞來源網址必須使用 http 或 https。', 'KQC 顧問建議標題不可空白。']) assert.match(helpers, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(view, /structuredErrors\.value = validateStructuredArticleContent/)
  assert.match(editor, /<Message v-if="errors\.length"[\s\S]*v-for="error in errors"/)
})

test('scheduled publishing, cover upload, list and public Article boundaries remain intact', () => {
  assert.match(view, /form\.status === 'SCHEDULED'[\s\S]*new Date\(form\.scheduledAt\)\.toISOString\(\)/)
  assert.match(view, /validatePublication\(\)/)
  assert.match(view, /coverImage: form\.coverImage\.trim\(\) \|\| null/)
  for (const header of ['標題', '分類', '撰寫人', '狀態', '精選', '發布時間', '更新時間', '操作']) assert.match(view, new RegExp(`header="${header}"`))
  assert.doesNotMatch(`${view}\n${editor}\n${blocks}`, /v-html|contenteditable|execCommand|wysiwyg|quill|ckeditor|tinymce/i)
  assert.doesNotMatch(`${view}\n${editor}\n${blocks}\n${helpers}`, /publicArticlesApi|InsightsDetailView|InsightsView|\/public\/articles/)
})
