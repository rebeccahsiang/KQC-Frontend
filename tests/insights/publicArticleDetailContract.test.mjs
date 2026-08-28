import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

// ============================================================
// Industry Insights — Public Article Detail Contract
// WEB-1F-D2C
// ============================================================
test('canonical detail route owns the final public view and shared public shell', () => {
  const router = read('src/router/index.ts'); const app = read('src/App.vue')
  assert.match(router, /path: '\/insights\/:slug', name: 'InsightDetail', component: \(\) => import\('@\/views\/InsightsDetailView\.vue'\)/)
  assert.match(app, /publicRouteNames = new Set\(\[[^\]]*'InsightDetail'/)
  assert.equal(existsSync(new URL('src/views/InsightsDetailDeferredView.vue', root)), false)
})

test('detail fetch uses only the bounded public slug endpoint and public-safe type', () => {
  const api = read('src/api/publicArticles.ts'); const view = read('src/views/InsightsDetailView.vue')
  assert.match(api, /import type \{ StructuredArticleContent \} from '\.\/adminArticles'/)
  assert.match(api, /export interface PublicArticleDetail extends PublicArticleListItem \{[\s\S]*content: string[\s\S]*structuredContent\?: StructuredArticleContent \| null/)
  assert.match(api, /detail: \(slug: string\)[\s\S]*api\.get<Envelope<\{ article: PublicArticleDetail \}>>\(`\/public\/articles\/\$\{encodeURIComponent\(slug\)\}`\)/)
  assert.match(view, /publicArticlesApi\.detail\(slug\)/)
  assert.doesNotMatch(`${api}\n${view}`, /adminArticlesApi|scheduledAt|createdBy|creatorDisplayName/)
})

test('detail renders semantic breadcrumb hero header metadata and deterministic return', () => {
  const view = read('src/views/InsightsDetailView.vue')
  assert.match(view, /<nav class="article-detail__breadcrumb" aria-label="麵包屑導覽">/)
  assert.match(view, /<RouterLink to="\/">首頁<\/RouterLink>/)
  assert.match(view, /<RouterLink to="\/insights">產業洞察<\/RouterLink>/)
  assert.match(view, /aria-current="page">\{\{ article\.title \}\}/)
  assert.match(view, /v-if="article\.coverImage" :src="publicArticleCoverUrl\(article\.coverImage\)"/)
  assert.match(view, /article-detail__hero-fallback/)
  assert.match(view, /v-for="category in article\.categories"/)
  assert.equal((view.match(/<h1>/g) ?? []).length, 2)
  assert.match(view, /<article v-else>[\s\S]*<h1>\{\{ article\.title \}\}<\/h1>/)
  assert.match(view, /<time :datetime="article\.publishedAt \|\| undefined">\{\{ formatDate\(article\.publishedAt\) \}\}<\/time>/)
  assert.match(view, /v-if="article\.tags\.length"/)
  assert.match(view, /class="article-detail__return" to="\/insights">返回產業洞察/)
  assert.doesNotMatch(view, /updatedAt|author|作者|撰寫人|creator/i)
})

test('detail selects structured rendering or escaped legacy text within the editorial responsive reading width', () => {
  const view = read('src/views/InsightsDetailView.vue'); const styles = view.slice(view.indexOf('<style'))
  assert.match(view, /<StructuredArticleContent v-if="article\.structuredContent" :content="article\.structuredContent" \/>[\s\S]*<div v-else class="article-detail__body">\{\{ article\.content \}\}<\/div>/)
  assert.doesNotMatch(view, /v-html/)
  assert.match(styles, /\.article-detail__reading \{[^}]*width: min\(100%, 52rem\);[^}]*margin-inline: auto;/s)
  assert.match(styles, /\.article-detail__body \{[^}]*overflow-wrap: anywhere;[^}]*line-height: 1\.9;[^}]*white-space: pre-wrap;/s)
  assert.match(styles, /\.article-detail__hero[^}]*height: clamp\(18rem, 30vw, 25rem\);[^}]*overflow: hidden/s)
  assert.match(styles, /\.article-detail__hero img \{[^}]*object-fit: cover;/s)
  assert.match(styles, /@media \(max-width: \$breakpoint-sm\)/)
  assert.doesNotMatch(styles, /-webkit-line-clamp/)
})

test('Hero uses first-category copy and bounded reduced-motion-safe Y scroll movement', () => {
  const view = read('src/views/InsightsDetailView.vue'); const styles = view.slice(view.indexOf('<style'))
  const mapping = view.slice(view.indexOf('const heroCopyByCategory'), view.indexOf('const heroCopy ='))
  const expected = {
    BUSINESS_MANAGEMENT: ['經營管理', '掌握經營關鍵，讓每一步決策更有方向'],
    TRANSPORT_KNOWLEDGE: ['運輸小知識', '懂運輸多一點，經營路上更從容'],
    MARKET_TREND: ['市場趨勢', '看懂市場變化，提前掌握下一步商機'],
    POLICY_REGULATION: ['政策法規', '掌握政策脈動，讓經營因應更有準備'],
    KQC_NEWS: ['KQC 快訊', '掌握 KQC 最新動態，與您分享重要消息'],
    BUSINESS_TRANSFORMATION: ['事業轉型', '看見轉型契機，為事業開啟更多可能'],
  }
  assert.equal((mapping.match(/^  [A-Z_]+:/gm) ?? []).length, 6)
  for (const [category, copy] of Object.entries(expected)) {
    assert.ok(mapping.includes(`${category}:`))
    for (const text of copy) assert.ok(mapping.includes(text))
  }
  assert.match(view, /const firstCategory = article\.value\?\.categories\[0\]/)
  assert.match(view, /heroCopyByCategory\[firstCategory\]/)
  assert.match(view, /class="article-detail__hero-copy"[\s\S]*heroCopy\.label[\s\S]*heroCopy\.copy/)
  assert.match(view, /Math\.min\(1, Math\.max\(0, -bounds\.top \/ bounds\.height\)\)/)
  assert.match(view, /30 \+ progress \* 40/)
  assert.match(styles, /object-position: center var\(--article-hero-position, 50%\)/)
  assert.doesNotMatch(styles, /background-attachment:\s*fixed|translateX\(/)
  assert.match(view, /requestAnimationFrame\(updateHeroMotion\)/)
  assert.match(view, /removeEventListener\('scroll', scheduleHeroMotion\)/)
  assert.match(view, /cancelAnimationFrame\(motionFrame\)/)
  assert.match(view, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/)
  assert.match(styles, /\.article-detail__hero-copy \{[^}]*top: 50%;[^}]*left: 50%;[^}]*justify-items: center;[^}]*text-align: center;[^}]*transform: translate\(-50%, -50%\);/s)
  assert.match(styles, /\.article-detail__hero-copy span \{[^}]*background: rgb\(255 255 255 \/ 14%\);[^}]*color: #fff;[^}]*opacity: 0\.32;[^}]*font-size: \$kqc-type-caption;[^}]*font-weight: 600;/s)
  assert.doesNotMatch(styles, /\.article-detail__hero-copy span \{[^}]*(?:blue|#(?:0{0,2}[0-9a-f]{2}ff)|var\(--accent-active\))/i)
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*object-position: center 50%;[^}]*will-change: auto;/)
  assert.doesNotMatch(view, /三瑝資訊有限公司|三爵資訊有限公司/)
})

test('loading unavailable title and route-change guards are bounded', () => {
  const view = read('src/views/InsightsDetailView.vue')
  assert.match(view, /aria-label="文章載入中"/)
  assert.match(view, /找不到這篇文章/)
  assert.match(view, /這篇文章可能尚未發布、已下架，或網址不存在。/)
  assert.match(view, /let requestEpoch = 0/)
  assert.match(view, /const epoch = \+\+requestEpoch/)
  assert.match(view, /if \(epoch !== requestEpoch\) return/)
  assert.match(view, /watch\(\(\) => route\.params\.slug, loadArticle, \{ immediate: true \}\)/)
  assert.match(view, /onBeforeUnmount\(\(\) => \{[\s\S]*requestEpoch \+= 1/)
  assert.match(view, /document\.title = `\$\{article\.value\.title\} - 三爵資訊 KQC`/)
  assert.match(view, /document\.title = genericTitle/)
  assert.doesNotMatch(view, /responseError|Axios|stack|ARTICLE_NOT_FOUND|DRAFT|SCHEDULED/)
})

test('D2C keeps deferred engagement media and unsafe rich-content surfaces excluded', () => {
  const view = read('src/views/InsightsDetailView.vue')
  const template = view.slice(view.indexOf('<template>'), view.indexOf('<style'))
  // D2E-B2 — D2C Deferred Surface Contract Update:
  // Share and Like graduated in D2E; Subscription, Video, Related Links and Media Library remain deferred.
  assert.doesNotMatch(template, /v-html|subscribe|video|related(?:-|_)?links|media-library/i)
})
