import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

const product = read('src/views/ProductView.vue')
const router = read('src/router/index.ts')
const app = read('src/App.vue')
const api = read('src/api/memberIndustryReports.ts')
const list = read('src/views/account/IndustryReportsView.vue')
const detail = read('src/views/account/IndustryReportDetailView.vue')

test('Product Sidebar adds an independent member area without changing existing groups', () => {
  const groups = product.slice(product.indexOf('const marketplaceGroups'), product.indexOf('const publicServices'))
  assert.match(groups, /id: 'member-area', title: '會員專區'/)
  assert.match(groups, /label: 'KQC 定期產業分析報告'[^\n]*type: 'route'[^\n]*routeName: 'MemberIndustryReports'/)
  assert.match(groups, /label: '我的合作案件'[^\n]*type: 'planned', planned: true/)
  assert.match(groups, /id: 'owner-services', title: '業主專區'/)
  assert.doesNotMatch(groups, /id: 'industry-analysis'|title: '產業分析報告'/)
  assert.match(product, /item\.type === 'route'[^\n]*router\.push\(\{ name: item\.routeName \}\)/)
  assert.match(product, /:disabled="item\.type === 'planned'"/)
})

test('member report list and detail routes use the frontend portal without a user-only role', () => {
  const start = router.indexOf("path: '/account/industry-reports'")
  const end = router.indexOf("path: '/design-system'", start)
  const memberRoutes = router.slice(start, end)
  assert.match(memberRoutes, /name: 'MemberIndustryReports'/)
  assert.match(memberRoutes, /IndustryReportsView\.vue/)
  assert.match(memberRoutes, /path: '\/account\/industry-reports\/:slug'/)
  assert.match(memberRoutes, /name: 'MemberIndustryReportDetail'/)
  assert.match(memberRoutes, /IndustryReportDetailView\.vue/)
  assert.equal((memberRoutes.match(/requiresAuth: true/g) ?? []).length, 2)
  assert.equal((memberRoutes.match(/authPortal: 'frontend'/g) ?? []).length, 2)
  assert.doesNotMatch(memberRoutes, /roles:/)
})

test('member report routes reuse PublicLayout without enabling its floating navigation', () => {
  assert.match(app, /'MemberIndustryReports'/)
  assert.match(app, /'MemberIndustryReportDetail'/)
  assert.doesNotMatch(read('src/components/layout/PublicLayout.vue'), /MemberIndustryReports|MemberIndustryReportDetail/)
  assert.doesNotMatch(list + detail, /FrontHeader|AuthModal/)
})

test('member API client owns list and encoded slug detail paths without admin coupling', () => {
  assert.match(api, /api\.get<Envelope<MemberIndustryReportListResponse>>\('\/v1\/member\/industry-reports'/)
  assert.match(api, /`\/v1\/member\/industry-reports\/\$\{encodeURIComponent\(slug\)\}`/)
  assert.match(api, /params: \{ page: 1, limit: 100 \}/)
  assert.match(api, /MemberIndustryReportListItem/)
  assert.match(api, /MemberIndustryReportDetail extends MemberIndustryReportListItem/)
  assert.doesNotMatch(api, /adminIndustryReports|\/v1\/admin\//)
})

test('member list renders API cover metadata title summary date and all view states', () => {
  assert.match(list, /memberIndustryReportsApi\.list\(\)/)
  assert.match(list, /report\.coverImage\.path/)
  assert.match(list, /report\.coverImage\.altText \|\| report\.title/)
  assert.match(list, /\{\{ report\.title \}\}/)
  assert.match(list, /\{\{ report\.summary \}\}/)
  assert.match(list, /formatPublishedAt\(report\.publishedAt\)/)
  assert.match(list, /v-if="loading"/)
  assert.match(list, /v-else-if="loadError"/)
  assert.match(list, /v-else-if="reports\.length === 0"/)
  assert.match(list, /name: 'MemberIndustryReportDetail', params: \{ slug: report\.slug \}/)
})

test('member detail loads the route slug and renders report fields with distinct 404 and error states', () => {
  assert.match(detail, /route\.params\.slug/)
  assert.match(detail, /memberIndustryReportsApi\.detail\(slug\.value\)/)
  for (const field of ['report.title', 'report.summary', 'report.publishedAt', 'report.content', 'report.coverImage.path']) {
    assert.match(detail, new RegExp(field.replace('.', '\\.')))
  }
  assert.match(detail, /error\.response\?\.status === 404/)
  assert.match(detail, /v-else-if="notFound"/)
  assert.match(detail, /v-else-if="loadError"/)
  assert.match(detail, /name: 'MemberIndustryReports'/)
  assert.doesNotMatch(detail, /v-html|DRAFT|mock|fixture/i)
})
