import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const api = read('src/api/adminIndustryReports.ts')
const view = read('src/views/admin/content/AdminIndustryReportsView.vue')
const router = read('src/router/index.ts')
const sidebar = read('src/config/sidebarMenu.ts')

test('IndustryReport Admin navigation follows the existing Industry Insights hierarchy and capability boundary', () => {
  const group = sidebar.slice(sidebar.indexOf("id: 'content-management'"), sidebar.indexOf("id: 'frontend'"))
  assert.ok(group.indexOf("title: '文章管理'") < group.indexOf("title: '文章圖片'"))
  assert.ok(group.indexOf("title: '文章圖片'") < group.indexOf("title: '產業分析報告'"))
  assert.ok(group.indexOf("title: '產業分析報告'") < group.indexOf("title: '相關連結'"))
  assert.match(group, /id: 'industry-reports'[^\n]*path: '\/admin\/content\/industry-reports'[^\n]*capabilities: \['PLATFORM_MANAGER', 'ADMIN'\]/)
  assert.match(router, /path: 'content\/industry-reports', name: 'AdminIndustryReports'[^\n]*AdminIndustryReportsView\.vue[^\n]*capabilities: \['PLATFORM_MANAGER', 'ADMIN'\]/)
})

test('IndustryReport API client uses the shared Axios client and exact Backend endpoints', () => {
  assert.match(api, /import api from '\.\/axios'/)
  assert.match(api, /api\.get<Envelope<IndustryReportListResponse>>\('\/v1\/admin\/industry-reports'/)
  assert.match(api, /api\.get<Envelope<\{ report: IndustryReportAdminItem \}>>\(`\/v1\/admin\/industry-reports\/\$\{encodeURIComponent\(id\)\}`/)
  assert.match(api, /api\.post<Envelope<\{ report: IndustryReportAdminItem \}>>\('\/v1\/admin\/industry-reports', input\)/)
  assert.match(api, /api\.patch<Envelope<\{ report: IndustryReportAdminItem \}>>\(`\/v1\/admin\/industry-reports\/\$\{encodeURIComponent\(id\)\}`/)
  assert.match(api, /\/\$\{encodeURIComponent\(id\)\}\/publish`/)
  assert.match(api, /\/\$\{encodeURIComponent\(id\)\}\/unpublish`/)
  assert.match(api, /api\.delete<Envelope<\{ deleted: true \}>>/)
  assert.doesNotMatch(api, /axios\.create|public\/articles|featured|scheduled|subscription|like/i)
})

test('list presents exact R1 columns, empty state, and status-bounded actions', () => {
  for (const column of ['封面', '標題', '摘要', '狀態', '發布時間', '更新時間', '操作']) assert.match(view, new RegExp(`header="${column}"`))
  assert.match(view, /empty-message="目前沒有產業分析報告"/)
  assert.match(view, /v-if="data\.status === 'DRAFT'"[^>]*label="發布"/)
  assert.match(view, /v-if="data\.status === 'DRAFT'"[^>]*label="刪除"/)
  assert.match(view, /v-if="data\.status === 'PUBLISHED'"[^>]*label="下架"/)
  assert.doesNotMatch(view, /v-if="data\.status === 'PUBLISHED'"[^>]*label="刪除"/)
  assert.match(view, /新增產業分析報告/)
})

test('editor owns only R1 fields, immutable persisted slug, and ArticleImage cover selection', () => {
  for (const label of ['標題', 'Slug', '摘要', '內容', '封面圖片', '狀態', '發布時間']) assert.ok(view.includes(label))
  assert.match(view, /editingId \? form\.slug : '儲存後由系統自動產生'/)
  assert.doesNotMatch(view, /v-model="form\.slug"/)
  assert.match(view, /adminArticleImagesApi\.list\(\)/)
  assert.match(view, /form\.coverImageId = image\.id/)
  assert.match(view, /coverImageId: form\.coverImageId/)
  assert.doesNotMatch(view, /type="file"|upload|category|featured|scheduled|subscription|like/i)
})

test('save, publish, unpublish, and draft delete rely on Backend responses and confirmations', () => {
  assert.match(view, /adminIndustryReportsApi\.create\(payload\(\)\)/)
  assert.match(view, /adminIndustryReportsApi\.update\(editingId\.value, payload\(\)\)/)
  assert.match(view, /adminIndustryReportsApi\.publish\(report\.id\)/)
  assert.match(view, /adminIndustryReportsApi\.unpublish\(report\.id\)/)
  assert.match(view, /report\.status !== 'DRAFT'/)
  assert.match(view, /adminIndustryReportsApi\.remove\(report\.id\)/)
  assert.equal((view.match(/window\.confirm/g) ?? []).length, 3)
  assert.match(view, /if \(!report\.coverImageId\) \{ errorMessage\.value = '發布前請先選擇封面圖片。'/)
  assert.match(view, /await loadReports\(\)/)
})

test('R1B stays isolated from public Member UI and unrelated frontend domains', () => {
  const combined = `${api}\n${view}\n${router}\n${sidebar}`
  assert.doesNotMatch(view, /ProductView|HomeView|InsightsView|ContactView|CompanyView|CRM|Finance/i)
  assert.doesNotMatch(api, /\/v1\/member\/industry-reports/)
  assert.equal((router.match(/AdminIndustryReportsView\.vue/g) ?? []).length, 1)
  assert.equal((sidebar.match(/title: '產業分析報告'/g) ?? []).length, 1)
  assert.ok(combined.includes("capabilities: ['PLATFORM_MANAGER', 'ADMIN']"))
})
