import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('CRM sidebar exposes capability-based My Business and reserved management/report entries', () => {
  const source = read('src/config/sidebarMenu.ts')
  assert.match(source, /id: 'crm-management'.*title: 'CRM 業務管理'.*icon: 'lucide:briefcase-business'/)
  assert.match(source, /id: 'crm-my-business'.*title: '我的業務'.*path: '\/admin\/crm\/my-business'.*capabilities: \['SALES', 'SALES_SUPERVISOR'\]/)
  assert.match(source, /id: 'crm-business-management'.*title: '業務管理'.*disabled: true.*capabilities: \['SALES_SUPERVISOR', 'ADMIN'\]/)
  assert.match(source, /id: 'crm-business-reports'.*title: '業務戰情室'.*disabled: true.*capabilities: \['SALES_SUPERVISOR', 'ADMIN'\]/)
})

test('Marketplace navigation is display-renamed to Product without changing paths', () => {
  const source = read('src/config/sidebarMenu.ts')
  assert.match(source, /id: 'cases', title: '商品管理'/)
  assert.match(source, /title: '商品照片'.*path: '\/admin\/cases\/photos'/)
  assert.match(source, /title: '商品案件'.*path: '\/admin\/cases\/create'/)
  assert.match(source, /title: '商品列表'.*path: '\/admin\/cases\/list'/)
  const router = read('src/router/index.ts')
  for (const path of ["path: 'list'", "path: 'create'", "path: 'photos'"]) assert.match(router, new RegExp(path))
})

test('My Business route inherits the admin portal boundary and uses exact capabilities', () => {
  const router = read('src/router/index.ts')
  assert.match(router, /path: '\/admin'[\s\S]*authPortal: 'admin'/)
  assert.match(router, /path: 'crm\/my-business'.*name: 'CrmMyBusiness'.*MyBusinessView\.vue'.*capabilities: \['SALES', 'SALES_SUPERVISOR'\]/)
})

test('CRM API uses shared portal-aware Axios for the four approved read endpoints', () => {
  const source = read('src/api/crm.ts')
  assert.match(source, /^import api from ['"]\.\/axios['"]/m)
  assert.match(source, /authPortal: 'admin'/)
  for (const endpoint of ['/v1/crm/my-business/summary', '/v1/crm/my-business/calendar', '/v1/crm/customers', '/v1/crm/business-cases']) assert.ok(source.includes(endpoint))
  assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie|axios\.create|Authorization|refreshToken/)
  assert.doesNotMatch(source, /api\.(post|patch|put|delete)/)
})

test('DTOs preserve nullable claim/calendar/customer contracts and backend-owned Customer Number', () => {
  const api = read('src/api/crm.ts')
  assert.match(api, /claimPendingCount: number \| null/)
  assert.match(api, /activityType: string \| null/)
  assert.match(api, /hasBusinessCase: boolean/)
  assert.match(api, /customerNumber: string/)
  const view = read('src/views/admin/crm/MyBusinessView.vue')
  assert.match(view, /item\.customerNumber/)
  assert.doesNotMatch(view, /customerNumber\s*=|generateCustomer|cultivation|customerStage/i)
})

test('Dashboard consumes real reads with independent loading, empty, error, and retry states', () => {
  const source = read('src/views/admin/crm/MyBusinessView.vue')
  for (const call of ['myBusinessSummary', 'myBusinessCalendar', 'customers', 'businessCases']) assert.match(source, new RegExp(`crmApi\\.${call}\\(`))
  for (const state of ['loadingSummary', 'loadingCalendar', 'loadingCustomers', 'loadingCases', 'summaryError', 'calendarError', 'customerError', 'caseError']) assert.match(source, new RegExp(state))
  for (const loader of ['loadSummary', 'loadCalendar', 'loadCustomers', 'loadCases']) assert.match(source, new RegExp(`@click="${loader}"`))
  assert.match(source, /今天沒有待辦行程/)
  assert.match(source, /未來 7 天沒有排定行程/)
  assert.match(source, /目前沒有案件/)
  assert.match(source, /目前沒有客戶/)
})

test('Claim gap is neutral, KPIs remain backend-authoritative, and no write UI is invented', () => {
  const source = read('src/views/admin/crm/MyBusinessView.vue')
  assert.match(source, /claimPendingCount != null/)
  assert.match(source, /資料尚未開放/)
  assert.match(source, /CLAIM_PENDING_READ_GAP/)
  for (const metric of ['operatingCount', 'followUpDueCount', 'monthlyClosedCount', 'monthlyClosedAmount']) assert.match(source, new RegExp(`summary\\.value\\.metrics\\.${metric}`))
  assert.match(source, /label="新增客戶" outlined disabled/)
  assert.match(source, /label="新增業務" disabled/)
  assert.doesNotMatch(source, /Dialog|v-model:visible|submitCustomer|createCustomer|patchNote|selfDeveloped/)
})

test('Calendar is lightweight, DateTime-based, non-polling, and localization stays frontend-owned', () => {
  const source = read('src/views/admin/crm/MyBusinessView.vue')
  assert.match(source, /toISOString\(\)/)
  assert.match(source, /7 \* 86400000/)
  assert.match(source, /activityLabel\(item\.activityType\)/)
  assert.doesNotMatch(source, /FullCalendar|setInterval|setTimeout|heartbeat|polling/i)
  const pkg = read('package.json')
  assert.doesNotMatch(pkg, /fullcalendar/i)
})

test('Cases avoid invented customer names/detail routes and customers support no-Case/read-only note states', () => {
  const source = read('src/views/admin/crm/MyBusinessView.vue')
  assert.match(source, /Customer ID/)
  assert.match(source, /item\.customerId/)
  assert.doesNotMatch(source, /router\.(push|replace)|customerName.*businessCases|caseDetail/i)
  assert.match(source, /item\.hasBusinessCase \? '已有案件' : '尚無案件'/)
  assert.match(source, /data\.note \|\| '—'/)
  assert.doesNotMatch(source, /InputText.*note|Textarea|PATCH|updateNote/)
})

test('My Business follows Admin shell design tokens and responsive table/card conventions', () => {
  const source = read('src/views/admin/crm/MyBusinessView.vue')
  const config = read('src/config/crm.ts')
  for (const token of ['--text-main', '--text-muted', '--accent-active', '--border-grey', '--bg-card', '--bg-main']) assert.ok(source.includes(token))
  assert.match(source, /@media\(max-width:1100px\)/)
  assert.match(source, /@media\(max-width:767px\)/)
  assert.match(source, /class="desktop-table"/)
  assert.match(source, /class="mobile-cards"/)
  assert.match(config, /Intl\.NumberFormat\('zh-TW'/)
  assert.match(source, /Icon icon="lucide:/)
})
