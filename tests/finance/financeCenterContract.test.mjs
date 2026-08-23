import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const router = read('src/router/index.ts')
const menu = read('src/config/sidebarMenu.ts')
const api = read('src/api/finance.ts')
const config = read('src/config/finance.ts')
const view = read('src/views/admin/finance/FinanceCenterView.vue')
const adminLayout = read('src/components/layout/AdminLayout.vue')
const sidebar = read('src/components/layout/sidebar/SidebarNav.vue')
const sidebarItem = read('src/components/layout/sidebar/SidebarMenuItem.vue')
const detailView = read('src/views/admin/finance/FinanceDetailView.vue')

test('Finance Center route and navigation are ADMIN-authoritative while reserved performance visibility follows capabilities', () => {
  assert.match(router, /path:\s*'finance'[\s\S]{0,180}capabilities:\s*\['ADMIN'\]/)
  assert.match(menu, /id:\s*'finance-center'[\s\S]{0,160}path:\s*'\/admin\/finance'[\s\S]{0,100}capabilities:\s*\['ADMIN'\]/)
  assert.match(menu, /id:\s*'my-performance'[\s\S]{0,180}disabled:\s*true[\s\S]{0,120}\['SALES', 'SALES_SUPERVISOR', 'ADMIN'\]/)
  assert.match(menu, /id:\s*'team-performance'[\s\S]{0,180}disabled:\s*true[\s\S]{0,120}\['SALES_SUPERVISOR', 'ADMIN'\]/)
  const financeMenu = menu.slice(menu.indexOf("id: 'finance-management'"), menu.indexOf("id: 'frontend'"))
  assert.doesNotMatch(financeMenu, /PLATFORM_MANAGER/)
})

test('typed Finance API preserves reads and exposes only the initialization mutation', () => {
  for (const endpoint of ['summary', 'business-cases', 'uninitialized-business-cases']) assert.match(api, new RegExp(`/v1/crm/finance/${endpoint}`))
  assert.match(api, /initialize:[\s\S]{0,180}api\.post<Envelope<InitializeFinanceResult>>\(`\/v1\/crm\/finance\/business-cases\/\$\{businessCaseId\}`,[\s\S]{0,40}input\)/)
  assert.equal((api.match(/api\.post\s*</g) || []).length, 1)
  assert.doesNotMatch(api, /api\.(patch|put|delete)\s*\(/)
  for (const query of ['page', 'pageSize', 'search', 'financeStatus', 'settlementStatus', 'paymentProgress']) assert.match(api, new RegExp(`${query}`))
})

test('Finance Detail route, navigation, and five backend reads stay ADMIN-only and read-only', () => {
  assert.match(router, /path:\s*'finance\/:businessCaseId'[\s\S]{0,220}capabilities:\s*\['ADMIN'\]/)
  assert.match(view, /router\.push\(\{ name: 'AdminFinanceDetail', params: \{ businessCaseId \} \}\)/)
  for (const suffix of ['', '/payments', '/risks', '/settlement', '/history']) assert.match(api, new RegExp(`business-cases/\\$\\{businessCaseId\\}${suffix.replace('/', '\\/')}`))
  assert.doesNotMatch(api, /api\.(patch|put|delete)\s*\(/)
})

test('ADMIN initialization uses canonical discovery identity and exactly four backend inputs', () => {
  assert.match(view, /v-if="authStore\.isAdmin"[^>]*label="建立財務資料"/)
  assert.match(view, /openInitialize\(item\)/)
  assert.match(view, /const businessCaseId = initializeCase\.value\.businessCaseId/)
  assert.match(view, /financeApi\.initialize\(businessCaseId, \{ \.\.\.initializeForm\.value \}\)/)
  for (const field of ['buyerServiceFee', 'sellerServiceFee', 'variableCost', 'actualCost']) assert.match(view, new RegExp(`initializeForm\\.${field}`))
  assert.deepEqual([...api.matchAll(/interface InitializeFinanceInput \{([^}]*)\}/g)][0][1].match(/\w+(?=: number)/g), ['buyerServiceFee', 'sellerServiceFee', 'variableCost', 'actualCost'])
  assert.doesNotMatch(view, /PREPARING|PENDING_APPROVAL|developmentBonus|administrativeCost\s*=|projectBaseProfit\s*=|performanceAdjustment|commissionReleaseRate|commissionRiskReserveRate/)
})

test('initialization is pending-safe, refreshes discovery, and maps controlled conflicts', () => {
  assert.match(view, /if \(!initializeCase\.value \|\| initializing\.value\) return/)
  assert.match(view, /:loading="initializing" :disabled="initializing \|\| !validInitializeForm"/)
  assert.match(view, /await financeApi\.initialize[\s\S]*await loadAll\(\)[\s\S]*viewDetail\(businessCaseId\)/)
  for (const code of ['FINANCE_CASE_NOT_ELIGIBLE', 'FINANCE_ALREADY_EXISTS', 'FINANCE_CONFLICT']) assert.match(view, new RegExp(code))
  assert.match(view, /error\.response\?\.status === 409\) await loadAll\(\)/)
  assert.match(view, /lucide:circle-plus|lucide:wallet-cards/)
})

test('Finance Detail has six tabs with summary default and backend-derived neutral payment progress', () => {
  assert.match(detailView, /<Tabs value="summary"/)
  for (const tab of ['財務摘要', '收款紀錄', '業績分配', '結算', '風險調整', '歷程']) assert.match(detailView, new RegExp(`>${tab}<`))
  assert.match(detailView, /paymentProgress\.paymentProgressRate \/ 100/)
  assert.match(detailView, /totalServiceFee > 0/)
  assert.match(detailView, /尚無可計算的收款進度/)
  assert.doesNotMatch(detailView, /developmentBonus|5000|500,?000|300,?000|20000|\.reduce\(|raw snapshot|JSON\.stringify/i)
})

test('Finance Detail uses Lucide, existing theme tokens, localized reasons, and responsive structures', () => {
  for (const icon of ['lucide:arrow-left', 'lucide:wallet-cards', 'lucide:receipt-text', 'lucide:shield-check', 'lucide:history', 'lucide:lock-keyhole']) assert.match(detailView, new RegExp(icon))
  for (const token of ['--bg-main', '--bg-card', '--border-grey', '--text-main', '--text-muted', '--accent']) assert.match(detailView, new RegExp(token))
  assert.match(detailView, /readinessLabel/)
  assert.match(detailView, /@media\(max-width:1023px\)[\s\S]*@media\(max-width:767px\)/)
  assert.match(detailView, /desktop-only[\s\S]*mobile-list/)
  assert.doesNotMatch(detailView, /data-theme|toggleTheme|primeicons|font-awesome|material-icons|<svg/i)
})

test('Finance Detail localizes verified direction and payment status enums', () => {
  assert.match(config, /DIRECTION_LABELS[^\n]*BUY:\s*'買方'[^\n]*SELL:\s*'賣方'/)
  assert.match(config, /PAYMENT_STATUS_LABELS[^\n]*RECEIVED:\s*'已收款'[^\n]*VOIDED:\s*'已作廢'/)
  assert.match(detailView, /directionLabel\(detail\.businessCase\.direction\)/)
  assert.match(detailView, /paymentStatusLabel\(data\.status\)/)
  assert.match(detailView, /paymentStatusLabel\(payment\.status\)/)
  assert.doesNotMatch(detailView, /\{\{\s*detail\.businessCase\.direction\s*\}\}|\{\{\s*payment\.status\s*\}\}|field="status"/)
})

test('Finance Detail tabs avoid vertical desktop overflow and retain mobile horizontal scrolling', () => {
  assert.match(detailView, /\.finance-tabs :deep\(\.p-tablist\)\{overflow:hidden\}/)
  assert.match(detailView, /\.p-tablist-tab-list\)\{overflow-x:visible;overflow-y:hidden;flex-wrap:nowrap\}/)
  assert.match(detailView, /@media\(max-width:767px\)[\s\S]*\.p-tablist\)\{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch\}/)
  assert.doesNotMatch(detailView, /overflow-y:\s*(?:auto|scroll)/)
})

test('Finance page maps backend summary, list, discovery, payment progress, and server pagination', () => {
  for (const call of ['financeApi.summary()', 'financeApi.list(listParams())', 'financeApi.uninitialized(']) assert.match(view, new RegExp(call.replace(/[().]/g, '\\$&')))
  assert.match(view, /paymentProgress\.paymentProgressRate \/ 100/)
  assert.match(view, /:total-records="caseTotal"/)
  assert.match(view, /:total-records="discoveryTotal"/)
  assert.doesNotMatch(view, /S網900[178]|PREPARING|PENDING_APPROVAL/)
})

test('Finance polish keeps zero-total progress neutral and filters readable', () => {
  assert.match(view, /hasPayableTotal[\s\S]*totalServiceFee > 0/)
  assert.match(view, /ProgressBar v-if="hasPayableTotal\(data\)"/)
  assert.match(view, /class="empty-progress" aria-label="尚無應收金額"/)
  for (const label of ['案件編號', '財務狀態', '結算狀態', '收款進度']) assert.match(view, new RegExp(`<span>${label}</span>`))
  for (const placeholder of ['輸入案件編號前綴', '選擇財務狀態', '選擇結算狀態', '選擇收款進度']) assert.match(view, new RegExp(`placeholder="${placeholder}"`))
  assert.match(view, /class="filter-button"[\s\S]*lucide:filter/)
  assert.doesNotMatch(view, /class="filter-button"[^>]*severity="success"/)
})

test('Finance actions use a desktop icon and an accessible mobile icon-only fallback', () => {
  assert.match(view, /label="查看"[\s\S]{0,120}lucide:eye/)
  assert.match(view, /class="mobile-view-button"[^>]*aria-label="查看"[^>]*title="查看"[\s\S]{0,120}lucide:eye/)
})

test('shared sidebar retains its architecture while remaining full-height and legible', () => {
  assert.match(adminLayout, /min-height:\s*100dvh/)
  assert.match(sidebar, /position:\s*sticky[\s\S]*align-self:\s*flex-start[\s\S]*height:\s*100dvh/)
  assert.match(sidebar, /overflow:\s*hidden[\s\S]*\.sidebar-menu \{ flex: 1; overflow-y: auto/)
  assert.match(sidebarItem, /color-mix\(in srgb, var\(--bg-thumb\)/)
})

test('raw backend reason codes are localized outside the template and never rendered directly', () => {
  for (const code of ['PAYMENT_INCOMPLETE', 'SUPERVISOR_PARTICIPATES_IN_CASE', 'FINANCE_NOT_FROZEN']) assert.match(config, new RegExp(code))
  assert.doesNotMatch(view, /PAYMENT_INCOMPLETE|SUPERVISOR_PARTICIPATES_IN_CASE|FINANCE_NOT_FROZEN/)
  assert.match(view, /readinessLabel\(/)
})

test('responsive Finance UI reuses theme tokens, PrimeVue, and Lucide without a Finance-specific theme', () => {
  for (const component of ['DataTable', 'Tag', 'ProgressBar', 'Skeleton', 'Paginator']) assert.match(view, new RegExp(component))
  for (const icon of ['lucide:wallet-cards', 'lucide:hand-coins', 'lucide:search', 'lucide:refresh-cw', 'lucide:shield-alert']) assert.match(view, new RegExp(icon))
  for (const token of ['--bg-main', '--bg-card', '--border-grey', '--text-main', '--text-muted']) assert.match(view, new RegExp(token))
  assert.match(view, /@media\(max-width:1279px\)/); assert.match(view, /@media\(max-width:767px\)/); assert.match(view, /\.mobile-cards\{display:grid/)
  assert.doesNotMatch(view, /#[0-9a-f]{3,8}|\b(?:blue|black|white)\b|data-theme|toggleTheme/i)
})
