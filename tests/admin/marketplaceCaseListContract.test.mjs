import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const view = read('src/views/admin/cases/CaseListView.vue')
const api = read('src/api/adminMarketplaceCases.ts')
const router = read('src/router/index.ts')
const sidebar = read('src/config/sidebarMenu.ts')

/* PRODUCT-CASE-B3 — Marketplace List Authority Contract / no local fixtures or legacy lifecycle authority. */
test('list uses canonical API without mock data, generic status, or delete calls', () => {
  assert.match(api, /list:[\s\S]*get<Envelope<AdminMarketplaceCase\[\]>>\('\/admin\/cases'\)/)
  assert.match(view, /adminMarketplaceCasesApi\.list\(\)/)
  assert.doesNotMatch(view, /Mock Data|caseList = ref<CaseItem|KQC-SFT26081|active['"]|hidden['"]|handleSaveEdit/)
  assert.doesNotMatch(api, /\.patch\(|\.delete\(|\/status/)
})

test('six canonical statuses and Traditional Chinese labels remain explicit', () => {
  const expected = { DRAFT: '草稿', PENDING_APPROVAL: '待審核', RETURNED: '已退回', PUBLISHED: '已發布', UNPUBLISHED: '已下架', CLOSED: '已結案' }
  for (const [value, label] of Object.entries(expected)) {
    assert.match(view, new RegExp(`value: '${value}', label: '${label}'`))
  }
})

/* PRODUCT-CASE-B3 — Review Action Matrix Contract / one-stage review remains creator-safe and capability-specific. */
test('review actions require pending state, non-creator identity, and required capability', () => {
  assert.match(view, /item\.marketplaceStatus === 'PENDING_APPROVAL' && !isCreator\(item\) && hasCapability\(authStore\.user, item\.requiredApproverCapability\)/)
  assert.match(view, /通過並發布/)
  assert.match(view, /退回修改/)
  assert.match(view, /等待授權審核者處理/)
  assert.doesNotMatch(view, /APPROVED/)
})

test('canonical transition endpoints cover return, approve, unpublish, republish, and close', () => {
  for (const path of ['return', 'approve', 'unpublish', 'republish', 'close']) assert.match(api, new RegExp(`/\\$\\{encodeURIComponent\\(id\\)\\}/${path}`))
  assert.match(api, /returnForRevision:[\s\S]*\{ reason \}/)
  assert.match(view, /!returnReason\.value\.trim\(\)[\s\S]*請填寫退回原因/)
  assert.match(view, /window\.confirm\(`確定通過並發布/)
  assert.match(view, /replaceItem\(\(await operation\(\)\)\.data\)/)
})

test('DRAFT and RETURNED creator actions navigate to shared edit form and submit canonically', () => {
  assert.match(view, /\['DRAFT', 'RETURNED'\]\.includes\(item\.marketplaceStatus\) && isCreator\(item\)/)
  assert.match(view, /router\.push\(\{ name: 'CaseCreate', query: \{ id: item\.id \} \}\)/)
  assert.match(view, /adminMarketplaceCasesApi\.submit\(item\.id\)/)
  assert.match(view, /重新提交審核/)
})

test('publication action matrix is bounded and CLOSED remains read-only', () => {
  assert.match(view, /marketplaceStatus === 'PUBLISHED' && canPublish[\s\S]*下架[\s\S]*結案/)
  assert.match(view, /marketplaceStatus === 'UNPUBLISHED' && canPublish[\s\S]*重新發布[\s\S]*結案/)
  assert.match(view, /marketplaceStatus === 'CLOSED'[\s\S]*案件已結案/)
  assert.doesNotMatch(view, />刪除</)
})

test('structured price, category, and transaction presentation use canonical fields', () => {
  for (const field of ['priceType', 'priceAmount', 'priceMin', 'priceMax']) assert.match(view, new RegExp(`item\\.${field}`))
  const priceBoundary = view.slice(view.indexOf('const formatWan ='), view.indexOf('/* PRODUCT-CASE-B3 — Representative Image Resolution'))
  assert.match(priceBoundary, /format\(value \/ 10000\)\} 萬/)
  assert.match(priceBoundary, /priceType === 'RANGE'[\s\S]*formatWan\(item\.priceMin\)[\s\S]*～\$\{formatWan\(item\.priceMax\)\}/)
  assert.match(priceBoundary, /priceType === 'MAX'[\s\S]*formatWan\(item\.priceAmount\)\}以下/)
  assert.match(priceBoundary, /priceType === 'APPROXIMATE'[\s\S]*約 \$\{formatWan\(item\.priceAmount\)\}/)
  assert.match(priceBoundary, /return `\$\{prefix\} \$\{formatWan\(item\.priceAmount\)\}`/)
  assert.match(priceBoundary, /transactionType === 'BUY' \? '預算' : '售價'/)
  assert.doesNotMatch(priceBoundary, /item\.price(?:\W|$)/)
  for (const entry of ['CA｜甲種小客車', 'CB｜乙種小客車', 'TX｜計程車', 'LT｜小貨車', 'MV｜搬家公司', 'FT｜汽車貨運', 'CT｜貨櫃貨運', 'BUY｜買家需求', 'SELL｜精選待售']) assert.match(view, new RegExp(entry))
})

test('representative image remains slot-derived and CRM PII or demo fallback is absent', () => {
  assert.match(view, /slot\.businessCategory === item\.businessCategory && slot\.transactionType === item\.transactionType/)
  assert.match(view, /尚未設定代表圖片/)
  assert.doesNotMatch(view + api, /clientCompany|clientName|clientMobile|internalNotes|crmData|productImageId|mock fallback/i)
})

/* PRODUCT-CASE-B3 — Marketplace Route Authority Contract / canonical capabilities replace manager role inheritance. */
test('list and create route/sidebar authority excludes PLATFORM_MANAGER', () => {
  const routerBoundary = router.slice(router.indexOf("{ path: 'list', name: 'CaseList'"), router.indexOf("{ path: 'photos', name: 'CasePhotos'"))
  const sidebarBoundary = sidebar.slice(sidebar.indexOf("{ id: 'case-create'"), sidebar.indexOf("{ id: 'messages'"))
  assert.match(routerBoundary, /CaseList[\s\S]*capabilities: \['SALES', 'SALES_SUPERVISOR', 'ADMIN'\]/)
  assert.match(routerBoundary, /CaseCreate[\s\S]*capabilities: \['SALES', 'SALES_SUPERVISOR'\]/)
  assert.match(sidebarBoundary, /case-list[\s\S]*capabilities: \['SALES', 'SALES_SUPERVISOR', 'ADMIN'\]/)
  assert.match(sidebarBoundary, /case-create[\s\S]*capabilities: \['SALES', 'SALES_SUPERVISOR'\]/)
  assert.doesNotMatch(routerBoundary + sidebarBoundary, /PLATFORM_MANAGER|roles:\s*\['manager'/)
  assert.match(router, /name: 'CaseManagement'[\s\S]*capabilities: \['SALES', 'SALES_SUPERVISOR', 'ADMIN'\]/)
  assert.match(sidebar, /id: 'cases'[\s\S]*capabilities: \['SALES', 'SALES_SUPERVISOR', 'ADMIN'\]/)
  assert.match(sidebar, /case-photos[\s\S]*capabilities: \['SALES_SUPERVISOR', 'ADMIN'\]/)
})

test('loading, empty, filtered-empty, errors, labeled dialog, alt text, and responsive layout are protected', () => {
  for (const text of ['載入商品案件中', '目前沒有可管理的商品案件', '沒有符合篩選條件的商品案件', '商品案件載入失敗']) assert.match(view, new RegExp(text))
  assert.match(view, /role="alert"/)
  assert.match(view, /header="退回修改"/)
  assert.match(view, /for="marketplace-return-reason"/)
  assert.match(view, /:alt="`\$\{item\.title\} 代表圖片`"/)
  assert.match(view, /@media \(max-width: 640px\)[\s\S]*grid-template-columns: 1fr/)
})
