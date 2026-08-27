import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

// ============================================================
// Industry Insights — Public Article List Contract
// WEB-1F-D2B
// ============================================================
test('public list uses the existing bounded Article endpoint and eight-item pagination', () => {
  const api = read('src/api/publicArticles.ts'); const view = read('src/views/InsightsView.vue')
  assert.match(api, /import api from '\.\/axios'/)
  assert.match(api, /api\.get<Envelope<PublicArticleListResponse>>\('\/public\/articles'/)
  assert.match(api, /params: \{ page, limit, \.\.\.\(category \? \{ category \} : \{\}\) \}/)
  assert.match(view, /const PAGE_SIZE = 8/)
  assert.match(view, /publicArticlesApi\.list\(\{ page: page\.value, limit: PAGE_SIZE, category: activeCategory\.value \}\)/)
  assert.doesNotMatch(`${api}\n${view}`, /adminArticlesApi|content:\s*string|hardcodedArticles|demoArticles|JSON\.stringify/)
})

test('seven visible filters map to exactly six canonical categories and all sends no category', () => {
  const api = read('src/api/publicArticles.ts'); const view = read('src/views/InsightsView.vue')
  const filters = view.slice(view.indexOf("  { label: '全部文章'"), view.indexOf('const categoryLabels'))
  for (const label of ['全部文章', '經營管理', '運輸小知識', '市場趨勢', '政策法規', 'KQC 快訊', '事業轉型']) assert.ok(filters.includes(`'${label}'`))
  assert.equal((filters.match(/label:/g) ?? []).length, 7)
  assert.equal((filters.match(/category:/g) ?? []).length, 6)
  assert.match(filters, /\{ label: '全部文章' \}/)
  assert.doesNotMatch(`${api}\n${filters}`, /DIGITAL_TRANSFORMATION|PRACTICAL_GUIDE|CASE_INSIGHT|ALL_ARTICLES|'ALL'/)
  const categoryType = api.match(/export type PublicArticleCategory = ([^\r\n]+)/)?.[1] ?? ''
  assert.equal((categoryType.match(/'[A-Z_]+'/g) ?? []).length, 6)
  assert.match(view, /activeCategory\.value = category; page\.value = 1; void loadArticles\(\)/)
})

test('cards use coverImage and slug navigation while D2C remains deferred', () => {
  const view = read('src/views/InsightsView.vue'); const router = read('src/router/index.ts'); const deferred = read('src/views/InsightsDetailDeferredView.vue')
  assert.match(view, /:to="`\/insights\/\$\{article\.slug\}`"/)
  assert.match(view, /v-if="article\.coverImage" :src="publicArticleCoverUrl\(article\.coverImage\)"/)
  for (const field of ['article.categories', 'article.title', 'article.publishedAt', 'article.summary']) assert.ok(view.includes(field))
  assert.match(view, /v-for="category in article\.categories"/)
  assert.match(view, /class="article-card__read-more">閱讀全文 →/)
  assert.doesNotMatch(view, /creatorDisplayName|createdBy|撰寫人|作者/)
  assert.match(router, /path: '\/insights\/:slug'[\s\S]{0,180}InsightsDetailDeferredView\.vue/)
  assert.match(deferred, /D2C owns the full article detail surface/)
  assert.doesNotMatch(`${view}\n${deferred}`, /v-html|article\.content|video|relatedArticles|related links|share|like|subscribe/i)
})

test('grid and media preserve four two one columns and a consistent sixteen-nine crop', () => {
  const view = read('src/views/InsightsView.vue'); const styles = view.slice(view.indexOf('<style'))
  assert.match(styles, /\.article-grid \{[^}]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/s)
  assert.match(styles, /@media \(max-width: \$breakpoint-lg\)[\s\S]*?\.article-grid \{[^}]*repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(styles, /@media \(max-width: \$breakpoint-sm\)[\s\S]*?\.article-grid \{[^}]*grid-template-columns: minmax\(0, 1fr\)/)
  assert.match(styles, /\.article-card__media[^}]*aspect-ratio: 16 \/ 9/s)
  assert.match(styles, /\.article-card__media img \{[^}]*object-fit: cover/s)
  assert.match(styles, /\.article-filters \{[^}]*overflow-x: auto/s)
  assert.doesNotMatch(styles, /\.article-card:hover[^}]*translateY|\.article-card:hover[^}]*box-shadow/s)
  assert.match(styles, /\.article-card:hover \.article-card__media img[^}]*transform: scale\(1\.04\)/s)
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[^}]*article-card__media img[^}]*transition: none/s)
})

test('loading empty error and explicit retry states remain production-data driven', () => {
  const view = read('src/views/InsightsView.vue')
  assert.match(view, /v-if="loading && !initialLoadComplete"[^>]*aria-label="文章載入中"/)
  assert.match(view, /v-if="loading && initialLoadComplete"[^>]*role="status">正在更新文章…/)
  assert.match(view, /initialLoadComplete\.value = true/)
  assert.match(view, /v-else-if="errorMessage"[^>]*role="alert"/)
  assert.match(view, /label="重新載入"[^>]*@click="loadArticles"/)
  assert.match(view, /v-else-if="!articles\.length"/)
  assert.match(view, /目前尚無文章/)
  assert.match(view, /catch \{[\s\S]*?文章載入失敗，請稍後再試。/)
  assert.doesNotMatch(view, /setInterval|setTimeout|fake|mock|seed/i)
})

test('category controls are centered without sacrificing bounded horizontal overflow and page spacing is locally compact', () => {
  const view = read('src/views/InsightsView.vue')
  assert.match(view, /class="article-filters__inner"/)
  assert.match(view, /\.article-filters \{[^}]*overflow-x: auto/s)
  assert.match(view, /\.article-filters__inner \{[^}]*width: max-content;[^}]*min-width: 100%;[^}]*justify-content: center;/s)
  assert.match(view, /class="insights-view insights-view--breadcrumb-compact"/)
  assert.match(view, /\.insights-view--breadcrumb-compact \{[^}]*padding-top: \$kqc-spacing-xl;/s)
})
