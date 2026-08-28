import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const view = read('src/views/InsightsDetailView.vue')
const api = read('src/api/publicArticles.ts')
const renderer = read('src/components/insights/StructuredArticleContent.vue')
const blocks = read('src/components/insights/ArticleContentBlocks.vue')
const richText = read('src/components/insights/ArticleRichText.vue')

// ============================================================
// D2D-B2 — Public Structured Article Renderer Contract
// Structured Content Public Rendering / Article Content Safety
// ============================================================
test('public DTO reuses the canonical structured contract and detail renders exactly one body path', () => {
  assert.match(api, /import type \{ StructuredArticleContent \} from '\.\/adminArticles'/)
  assert.match(api, /structuredContent\?: StructuredArticleContent \| null/)
  // D2D-B2 R8 — Public Renderer Mutual Exclusion Contract
  const bodyBoundary = view.slice(view.indexOf('D2D-B2 — Legacy Article Fallback'), view.indexOf('article-detail__return'))
  assert.match(bodyBoundary, /StructuredArticleContent v-if="article\.structuredContent"/)
  assert.match(bodyBoundary, /<div v-else class="article-detail__body">\{\{ article\.content \}\}<\/div>/)
  assert.equal((bodyBoundary.match(/article\.content/g) ?? []).length, 1)
})

test('News Summary is optional and renders content, source name and a safe external source link', () => {
  assert.match(renderer, /v-if="content\.newsSummary\.enabled && content\.newsSummary\.content"/)
  assert.match(renderer, />新聞摘要<\/h2>/)
  assert.match(renderer, /\{\{ content\.newsSummary\.content \}\}/)
  assert.match(renderer, /來源：\{\{ content\.newsSummary\.sourceName \}\}/)
  assert.match(renderer, /safeSourceUrl\(content\.newsSummary\.sourceUrl\)/)
  assert.match(renderer, /target="_blank" rel="noopener noreferrer">查看原始資料 ↗/)
  assert.match(renderer, /\['http:', 'https:'\]\.includes\(new URL\(value\)\.protocol\)/)
})

test('normal sections preserve source order and render semantic paragraph, bullet and numbered blocks', () => {
  assert.match(renderer, /v-for="\(section, sectionIndex\) in content\.sections"/)
  assert.match(renderer, /<h2>\{\{ section\.heading \}\}<\/h2>/)
  assert.match(renderer, /<ArticleContentBlocks :blocks="section\.blocks" \/>/)
  assert.match(blocks, /<p v-if="block\.type === 'PARAGRAPH'"[^>]*><ArticleRichText :segments="block\.content" \/><\/p>/)
  assert.match(blocks, /<ul v-else-if="block\.type === 'BULLET_LIST'"[^>]*><li v-for="\(item, itemIndex\) in block\.items"[^>]*><ArticleRichText :segments="item" \/><\/li><\/ul>/)
  assert.match(blocks, /<ol v-else-if="block\.type === 'NUMBERED_LIST'"[^>]*><li v-for="\(item, itemIndex\) in block\.items"[^>]*><ArticleRichText :segments="item" \/><\/li><\/ol>/)
  assert.match(blocks, /ul\.article-blocks__list \{ list-style-type: disc; \}/)
  assert.match(blocks, /ol\.article-blocks__list \{ list-style-type: decimal; \}/)
  assert.doesNotMatch(renderer, /章節 \{\{|sectionIndex \+ 1/)
})

test('Callout uses controlled content and the required default or custom editorial title', () => {
  assert.match(blocks, /v-else-if="block\.type === 'CALLOUT'" class="article-blocks__callout"/)
  assert.match(blocks, /block\.title\?\.trim\(\) \? block\.title : '重點提醒'/)
  assert.match(blocks, /<h3>\{\{ calloutTitle\(block\) \}\}<\/h3><p><ArticleRichText :segments="block\.content" \/><\/p>/)
  assert.doesNotMatch(renderer, /danger|warning-triangle|alert-triangle/i)
})

test('Advisor is optional, follows all normal sections and reuses the same controlled block semantics', () => {
  const sectionsAt = renderer.indexOf('v-for="(section, sectionIndex) in content.sections"')
  const advisorAt = renderer.indexOf('v-if="content.advisorAdvice.enabled && content.advisorAdvice.blocks.length"')
  assert.ok(sectionsAt >= 0 && advisorAt > sectionsAt)
  assert.match(renderer, /<h2>\{\{ content\.advisorAdvice\.title \}\}<\/h2>/)
  assert.match(renderer.slice(advisorAt), /<ArticleContentBlocks :blocks="content\.advisorAdvice\.blocks" \/>/)
  for (const type of ['PARAGRAPH', 'BULLET_LIST', 'NUMBERED_LIST', 'CALLOUT']) assert.ok(blocks.includes(`block.type === '${type}'`))
})

test('controlled rich text supports deterministic BOLD ITALIC EMPHASIS and safe LINK composition', () => {
  for (const mark of ['BOLD', 'ITALIC', 'EMPHASIS', 'LINK']) assert.match(richText, new RegExp(`'${mark}'`))
  assert.match(richText, /h\('strong'/)
  assert.match(richText, /h\('em'/)
  assert.match(richText, /article-rich-text__emphasis/)
  assert.match(richText, /h\('a', \{ href, target: '_blank', rel: 'noopener noreferrer' \}/)
  assert.match(richText, /\['http:', 'https:'\]\.includes\(url\.protocol\)/)
  const nesting = ['LINK', 'EMPHASIS', 'ITALIC', 'BOLD'].map((mark) => richText.indexOf(`firstByType.${mark === 'LINK' ? 'get' : 'has'}('${mark}')`))
  assert.ok(nesting.every((position) => position >= 0))
  assert.deepEqual([...nesting].sort((a, b) => a - b), nesting)
})

test('unknown marks and unsafe links preserve escaped text without arbitrary HTML or clickable fallback', () => {
  assert.match(richText, /let node: VNodeChild = segment\.text/)
  assert.match(richText, /if \(href\) node = h\('a'/)
  assert.match(richText, /if \(\['BOLD', 'ITALIC', 'EMPHASIS', 'LINK'\]\.includes\(mark\.type\)/)
  assert.doesNotMatch(`${view}\n${renderer}\n${blocks}\n${richText}`, /v-html|innerHTML|outerHTML|DOMParser|marked\(|markdown-it|dangerouslySetInnerHTML/i)
  assert.doesNotMatch(richText, /javascript:|data:|vbscript:/i)
})

test('renderer remains bounded, responsive and leaves the existing D2C metadata surface in the detail owner', () => {
  const styles = renderer.slice(renderer.indexOf('<style'))
  assert.match(styles, /overflow-wrap: anywhere/)
  assert.match(styles, /@media \(max-width: \$breakpoint-sm\)/)
  assert.match(blocks, /padding-inline-start:/)
  assert.match(blocks, /article-blocks__callout/)
  assert.match(styles, /structured-article__advisor/)
  for (const owner of ['article.coverImage', 'article.categories', 'article.title', 'article.publishedAt', 'article.tags', 'article-detail__breadcrumb', 'article-detail__return']) assert.ok(view.includes(owner))
  assert.match(view, /width: min\(100%, 52rem\)/)
  assert.doesNotMatch(`${renderer}\n${blocks}\n${richText}`, /publicArticlesApi|adminArticlesApi|fetch\(|axios|router|useRoute/)
})
