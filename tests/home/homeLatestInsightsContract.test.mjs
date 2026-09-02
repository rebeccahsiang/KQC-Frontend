import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const section = read('src/components/home/HomeInsightsSection.vue')
const api = read('src/api/publicArticles.ts')
const detail = read('src/views/InsightsDetailView.vue')
const styles = read('src/components/home/_homeSections.scss')

// HOME-R1D — Real Latest Insights Contract / Home consumes the same publication-safe API ordering as Insights.
test('Home requests only the newest two real public Article records', () => {
  assert.match(section, /publicArticlesApi\.list\(\{ page: 1, limit: 2 \}\)/)
  assert.match(section, /response\.data\.articles\.slice\(0, 2\)/)
  assert.match(api, /list: \(\{ page, limit, category \}/)
  assert.doesNotMatch(section, /2026 交通運輸產業市場觀察|交通運輸業的 AI 應用方向|2026-transportation-industry-market-outlook|ai-applications-in-transportation-industry/)
})

test('semantic image previews route each read link through the existing named Detail route', () => {
  assert.match(section, /<Icon icon="lucide:newspaper" aria-hidden="true" \/>最新產業洞察/)
  assert.match(section, /v-for="article in articles"/)
  assert.match(section, /<img v-if="article\.coverImage" :src="publicArticleCoverUrl\(article\.coverImage\)" :alt="`\$\{article\.title\}封面`" \/>/)
  assert.match(section, /v-else class="insight-article-card__fallback"/)
  assert.match(section, /:to="\{ name: 'InsightDetail', params: \{ slug: article\.slug \} \}" class="btn-read-full">閱讀全文 →/)
  assert.match(section, /to="\/insights" class="link-gold-more">查看更多文章 ❯/)
  assert.doesNotMatch(section, /📰|class="btn-read-full"[^>]*to="\/insights"|background-color:\s*#1e293b/)
})

test('Detail remains solely owned by the canonical public slug endpoint', () => {
  assert.match(detail, /await publicArticlesApi\.detail\(slug\)/)
  assert.doesNotMatch(detail, /homeInsights|findHomeInsightBySlug|Approved Homepage Detail Fallback/)
})

test('article cards retain two-column authority with wide cover media and lightweight links', () => {
  const boundary = styles.slice(styles.indexOf('.insights-2col-grid'), styles.indexOf('.reservation-form-block'))
  assert.match(boundary, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(boundary, /aspect-ratio:\s*12 \/ 5/)
  assert.match(boundary, /object-fit:\s*cover/)
  assert.match(boundary, /\.btn-read-full \{[^}]*color: var\(--accent-active\)[^}]*text-decoration: none/s)
  assert.match(boundary, /@media \(max-width: 640px\)[\s\S]*grid-template-columns: minmax\(0, 1fr\)/)
})

test('Home owns no image mapping or Persona/transport placeholder cover authority', () => {
  assert.doesNotMatch(section, /freight-truck|digital-transformation|images\/home\/personas|homeInsights/)
  assert.doesNotMatch(section, /title:\s*['"]|slug:\s*['"]|summary:\s*['"]/)
})
