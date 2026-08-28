import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const api = read('src/api/publicArticles.ts')
const axios = read('src/api/axios.ts')
const view = read('src/views/InsightsDetailView.vue')
const like = read('src/components/insights/ArticleLike.vue')
const structured = read('src/components/insights/StructuredArticleContent.vue')
const list = read('src/views/InsightsView.vue')

// D2E-B2 — Article Like Contract
test('public Article API owns bounded credentialed Like state and toggle calls', () => {
  assert.match(api, /export interface ArticleLikeState \{ liked: boolean; likeCount: number \}/)
  assert.match(api, /likeState: \(slug: string\)[\s\S]*api\.get<Envelope<ArticleLikeState>>\(`\/public\/articles\/\$\{encodeURIComponent\(slug\)\}\/like`\)/)
  assert.match(api, /toggleLike: \(slug: string\)[\s\S]*api\.post<Envelope<ArticleLikeState>>\(`\/public\/articles\/\$\{encodeURIComponent\(slug\)\}\/like`\)/)
  assert.match(axios, /withCredentials: true/)
  assert.doesNotMatch(`${api}\n${like}`, /visitorId|kqc_visitor_id|document\.cookie|localStorage|sessionStorage|indexedDB/i)
  assert.doesNotMatch(api, /likeCount\s*[:,][^\n]*(?:body|params)|visitorId\s*:/i)
})

test('one Article Like surface follows either body path and precedes the existing Share and return link', () => {
  const boundary = view.slice(view.indexOf('D2D-B2 — Legacy Article Fallback'), view.indexOf('article-detail__return'))
  assert.match(boundary, /StructuredArticleContent v-if="article\.structuredContent"/)
  assert.match(boundary, /<div v-else class="article-detail__body">\{\{ article\.content \}\}<\/div>/)
  assert.match(boundary, /<ArticleLike :slug="article\.slug" \/>[\s\S]*<ArticleShare :title="article\.title" :summary="article\.summary" \/>/)
  assert.equal((view.match(/<ArticleLike\b/g) ?? []).length, 1)
  assert.equal((view.match(/<ArticleShare\b/g) ?? []).length, 1)
  assert.doesNotMatch(structured, /ArticleLike/)
})

test('Like state loading is component-local, treats zero as valid and never blocks Article body', () => {
  // D2E-B2 R11 — Article Like Route Guard Contract Test Repair
  assert.match(like, /watch\(\(\) => props\.slug,[\s\S]*void loadLikeState\(slug, epoch\)/)
  assert.match(like, /confirmedState \? confirmedState\.likeCount : '—'/)
  assert.match(like, /:disabled="loading \|\| toggling"/)
  assert.doesNotMatch(view, /loadLikeState|likeState|toggling|likeCount/)
})

test('semantic heart toggle communicates state and remains keyboard and mobile accessible', () => {
  assert.match(like, /<button[\s\S]*type="button"[\s\S]*:aria-pressed="confirmedState \? liked : false"[\s\S]*:aria-label="accessibleLabel"/)
  assert.match(like, /:icon="liked \? 'mdi:heart' : 'lucide:heart'" aria-hidden="true"/)
  assert.match(like, /取消這篇文章的按讚|按讚這篇文章/)
  assert.match(like, /D2E-B2 R12 — Article Like Active Visual/)
  assert.match(like, /button:focus-visible/)
  assert.match(like, /@media \(max-width: \$breakpoint-sm\)[\s\S]*button \{ width: 100%; \}/)
})

test('toggle uses only the persisted Backend response and guards duplicate clicks', () => {
  assert.match(like, /if \(loading\.value \|\| toggling\.value\) return/)
  assert.match(like, /publicArticlesApi\.toggleLike\(slug\)/)
  assert.match(like, /confirmedState\.value = response\.data/)
  assert.doesNotMatch(like, /likeCount\s*(?:\+\+|--|\+=|-=)|likeCount\s*[+\-]\s*1|optimistic/i)
})

test('GET and POST failures remain local and preserve the last confirmed toggle state', () => {
  assert.match(like, /目前無法取得按讚狀態，請稍後再試。/)
  assert.match(like, /按讚狀態暫時無法更新，請稍後再試。/)
  const toggle = like.slice(like.indexOf('const toggleLike'), like.indexOf('</script>'))
  assert.doesNotMatch(toggle.slice(toggle.indexOf('catch')), /confirmedState\.value\s*=/)
  assert.match(like, /role="status" aria-live="polite"/)
  assert.doesNotMatch(like, /alert\(|Dialog|Modal|Axios|response\.data\.error|console\.error/)
})

test('route guard resets state and prevents stale slug responses from winning', () => {
  assert.match(like, /const epoch = \+\+requestEpoch[\s\S]*confirmedState\.value = null/)
  assert.match(like, /if \(epoch !== requestEpoch \|\| slug !== props\.slug\) return/)
  assert.match(like, /if \(epoch === requestEpoch && slug === props\.slug\)/)
})

test('Like remains detail-only and adds no deferred or identity persistence surfaces', () => {
  assert.doesNotMatch(list, /ArticleLike|toggleLike|likeState|likeCount/)
  assert.doesNotMatch(`${view}\n${like}`, /subscribe|email subscription|video|related(?:-|_)?links|media-library|fingerprint|analytics/i)
  assert.doesNotMatch(like, /fetch\(|axios\.create|Pinia|defineStore|useRoute|router/)
})
