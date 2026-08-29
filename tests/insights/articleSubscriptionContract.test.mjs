import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const api = read('src/api/publicArticleSubscriptions.ts')
const axios = read('src/api/axios.ts')
const component = read('src/components/insights/ArticleSubscription.vue')
const detail = read('src/views/InsightsDetailView.vue')
const list = read('src/views/InsightsView.vue')

// D2E-C2 — Email Subscription UI Contract
test('public client uses the four bounded credentialed subscription endpoints', () => {
  assert.match(api, /type ArticleSubscriptionStatus = 'NONE' \| 'PENDING' \| 'ACTIVE'/)
  assert.match(api, /state: \(\) => api\.get<Envelope<ArticleSubscriptionState>>\('\/public\/article-subscriptions\/state'\)/)
  assert.match(api, /subscribe: \(email: string\) => api\.post<Envelope<ArticleSubscriptionState>>\('\/public\/article-subscriptions\/subscribe', \{ email \}\)/)
  assert.match(api, /verify: \(token: string\) => api\.post<Envelope<ArticleSubscriptionState>>\('\/public\/article-subscriptions\/verify', \{ token \}\)/)
  assert.match(api, /unsubscribe: \(\) => api\.post<Envelope<ArticleSubscriptionState>>\('\/public\/article-subscriptions\/unsubscribe', \{\}\)/)
  assert.match(axios, /withCredentials: true/)
})

test('Detail places one Subscription after Like and Share and before the return link', () => {
  const engagement = detail.slice(detail.indexOf('article-detail__engagement'), detail.indexOf('article-detail__return'))
  assert.match(engagement, /<ArticleLike[\s\S]*<ArticleShare[\s\S]*<ArticleSubscription \/>/)
  assert.equal((detail.match(/<ArticleSubscription\b/g) ?? []).length, 1)
})

test('NONE PENDING and ACTIVE states have distinct Backend-authoritative surfaces', () => {
  assert.match(component, /v-else-if="status === 'NONE' \|\| \(status === 'PENDING' && isCorrectingEmail\)"[\s\S]*@submit\.prevent="subscribe"/)
  assert.match(component, /type="email" autocomplete="email"/)
  assert.match(component, /v-else-if="status === 'PENDING'"[\s\S]*請確認您的信箱/)
  assert.match(component, /v-else-if="status === 'ACTIVE'"[\s\S]*已訂閱 KQC 產業洞察[\s\S]*取消訂閱/)
  assert.match(component, /status\.value = response\.data\.status/g)
})

test('PENDING correction exposes the existing Email form without rewriting Backend authority', () => {
  assert.match(component, /D2E-C2-R1 — Pending Email Correction UX/)
  assert.match(component, /const isCorrectingEmail = ref\(false\)/)
  assert.match(component, /@click="correctPendingEmail">重新輸入 Email<\/button>/)
  const correction = component.slice(component.indexOf('const correctPendingEmail'), component.indexOf('const subscribe'))
  assert.match(correction, /isCorrectingEmail\.value = true/)
  assert.doesNotMatch(correction, /status\.value|unsubscribe|publicArticleSubscriptionsApi|cookie|Storage/i)
})

test('corrected Email resubmit remains Backend-authoritative and failure stays retryable', () => {
  const subscribe = component.slice(component.indexOf('const subscribe'), component.indexOf('// D2E-C2 — Unsubscribe'))
  assert.match(subscribe, /publicArticleSubscriptionsApi\.subscribe\(requestedEmail\)/)
  assert.match(subscribe, /status\.value = response\.data\.status[\s\S]*isCorrectingEmail\.value = false/)
  const failure = subscribe.slice(subscribe.indexOf('catch'))
  assert.doesNotMatch(failure, /isCorrectingEmail\.value = false|email\.value = ''|status\.value/)
})

test('loading and failures never fake NONE and actions have duplicate guards', () => {
  assert.match(component, /const status = ref<ArticleSubscriptionStatus \| null>\(null\)/)
  assert.match(component, /v-if="loading"[\s\S]*正在確認訂閱狀態/)
  assert.match(component, /status\.value = null; feedback\.value = '目前無法取得訂閱狀態/)
  assert.equal((component.match(/if \(busy\.value \|\| loading\.value\) return/g) ?? []).length, 2)
  assert.match(component, /:disabled="busy"/)
})

test('subscribe submits trimmed Email only and honors PENDING or ACTIVE response', () => {
  assert.match(component, /const requestedEmail = email\.value\.trim\(\)/)
  assert.match(component, /publicArticleSubscriptionsApi\.subscribe\(requestedEmail\)/)
  assert.doesNotMatch(component, /status:\s*['"](?:PENDING|ACTIVE|NONE)['"]|visitorId|memberUserId/)
})

test('unsubscribe submits the empty-body API contract and returns to Backend NONE', () => {
  assert.match(component, /publicArticleSubscriptionsApi\.unsubscribe\(\)/)
  assert.match(component, /status\.value = response\.data\.status/)
  assert.doesNotMatch(component, /unsubscribe\([^)]*(?:email|visitor|member|status)/i)
})

test('verification callback is one-shot and reports success or invalid-expired failure', () => {
  assert.match(list, /if \(verificationStarted \|\| typeof route\.query\.token !== 'string' \|\| !route\.query\.token\) return/)
  assert.match(list, /verificationStarted = true/)
  assert.match(list, /publicArticleSubscriptionsApi\.verify\(token\)/)
  assert.match(list, /信箱驗證成功，已完成 KQC 產業洞察訂閱。/)
  assert.match(list, /驗證連結無效或已過期，請重新訂閱。/)
})

test('verification always removes only token while preserving unrelated query parameters', () => {
  const callback = list.slice(list.indexOf('const verifySubscription'), list.indexOf('// D2H — Route / Stale Response Guard'))
  assert.match(callback, /finally \{[\s\S]*const query = \{ \.\.\.route\.query \}[\s\S]*delete query\.token[\s\S]*router\.replace\(\{ name: 'Insights', query, hash: route\.hash \}\)/)
  assert.doesNotMatch(callback, /history\.|location\.|query:\s*\{\s*\}/)
  assert.match(list, /onMounted\(async \(\) => \{[\s\S]*await verifySubscription\(\)[\s\S]*await loadArticles\(\)[\s\S]*\}\)/)
  assert.match(callback, /const query = \{ \.\.\.route\.query \}[\s\S]*delete query\.token/)
  assert.doesNotMatch(callback, /delete query\.category/)
})

test('token and subscription authority are never persisted logged or rendered', () => {
  const sources = `${api}\n${component}\n${list}`
  assert.doesNotMatch(sources, /localStorage|sessionStorage|indexedDB|document\.cookie|console\.(?:log|info|debug)|fingerprint|userAgent|ArticleLike|CRM/i)
  assert.doesNotMatch(component, /visitorId|memberUserId|kqc_visitor_id/)
  assert.doesNotMatch(list.slice(list.indexOf('<template>')), /\{\{\s*(?:token|route\.query\.token)/)
})

test('existing Insights list loading filters cards and pagination remain intact', () => {
  // D2E-C2-T1 — Insights List Preservation Test Repair
  assert.match(list, /const PAGE_SIZE = 8/)
  assert.match(list, /publicArticlesApi\.list\(\{ page: page\.value, limit: PAGE_SIZE, category: activeCategory\.value \}\)/)
  for (const contract of ['loadArticles', 'selectCategory', 'changePage', 'article-grid', 'article-card', '<Paginator']) assert.ok(list.includes(contract))
  assert.doesNotMatch(list, /<ArticleSubscription\b|@submit\.prevent="subscribe"|publicArticleSubscriptionsApi\.(?:subscribe|unsubscribe)\(/)
})
