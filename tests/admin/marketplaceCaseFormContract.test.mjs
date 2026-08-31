import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const view = read('src/views/admin/cases/CaseCreateView.vue')
const api = read('src/api/adminMarketplaceCases.ts')

/* PRODUCT-CASE-B2-B — Marketplace Create Form Contract / canonical presentation fields replace legacy CRM management UI. */
test('form owns seven canonical categories, two transaction types, and four safe regions', () => {
  for (const entry of ['CA｜甲種小客車', 'CB｜乙種小客車', 'TX｜計程車', 'LT｜小貨車', 'MV｜搬家公司', 'FT｜汽車貨運', 'CT｜貨櫃貨運']) assert.match(view, new RegExp(entry))
  for (const entry of ['BUY｜買家需求', 'SELL｜精選待售']) assert.match(view, new RegExp(entry))
  for (const area of ['北部地區', '中部地區', '南部地區', '東部地區']) assert.match(view, new RegExp(area))
})

test('CRM PII, direct publication selector, embedded list, and lifecycle shortcuts are absent', () => {
  for (const forbidden of ['clientCompany', 'clientName', 'clientMobile', 'internalNotes', '客戶真實公司名稱', '客戶聯絡負責人', '負責人行動電話', '內部業務追蹤備註', '上架初始狀態', '直接公開發布', '暫存為草稿隱藏', 'changeStatus', 'deleteCase', 'management-table-section']) assert.doesNotMatch(view, new RegExp(forbidden))
  assert.doesNotMatch(api, /\.patch\(|\.delete\(|\/status/)
})

test('BusinessCase source remains optional, disabled, and deferred without fake IDs or manual ObjectId entry', () => {
  assert.match(view, />來源業務案件<\/label>/)
  assert.doesNotMatch(view, /來源業務案件 \*/)
  assert.match(view, /select[^>]*disabled[^>]*aria-describedby="business-case-help"/)
  assert.match(view, /目前可先建立商品案件；待 CRM 業務管理開放後可連結來源業務案件。/)
  assert.match(view, /\.\.\.\(form\.businessCaseId \? \{ businessCaseId: form\.businessCaseId \} : \{\}\)/)
  assert.doesNotMatch(view, /canPersist[\s\S]{0,160}Boolean\(form\.businessCaseId\)/)
  assert.doesNotMatch(view, /[a-f\d]{24}/i)
})

/* PRODUCT-CASE-B2-B — Structured Price UI Contract / user-facing 萬 values become canonical integer TWD. */
test('four price modes, range validation, and TWD conversion are explicit', () => {
  for (const mode of ['FIXED', 'RANGE', 'MAX', 'APPROXIMATE']) assert.match(view, new RegExp(`value: '${mode}'`))
  assert.match(view, /wan \* 10000/)
  assert.match(view, /Number\.isInteger\(toTwd\(value\)\)/)
  assert.match(view, /form\.minWan[\s\S]*form\.maxWan/)
  assert.match(view, /最低金額不得高於最高金額/)
  for (const field of ['priceType', 'priceAmount', 'priceMin', 'priceMax']) assert.match(api + view, new RegExp(field))
})

test('canonical payload excludes lifecycle authority, legacy price, CRM, and case image identity', () => {
  const payloadBlock = view.slice(view.indexOf('const payload ='), view.indexOf('const applyCase ='))
  for (const field of ['businessCaseId', 'businessCategory', 'transactionType', 'title', 'targetArea', 'companyType', 'capitalAmount', 'coreNeed', 'isPriority', 'priceType', 'priceAmount', 'priceMin', 'priceMax']) assert.match(payloadBlock, new RegExp(field))
  for (const forbidden of ['marketplaceStatus:', 'caseStatus', 'price:', 'crmData', 'productImageId']) assert.doesNotMatch(payloadBlock, new RegExp(forbidden))
})

/* PRODUCT-CASE-B2-B — Marketplace Submission Contract / create or update completes before canonical submit. */
test('draft persistence uses canonical endpoints and submit follows returned server id', () => {
  assert.match(api, /post<Envelope<AdminMarketplaceCase>>\('\/admin\/cases', input\)/)
  assert.match(api, /put<Envelope<AdminMarketplaceCase>>\(`\/admin\/cases\/\$\{encodeURIComponent\(id\)\}`, input\)/)
  assert.match(api, /post<Envelope<AdminMarketplaceCase>>\(`\/admin\/cases\/\$\{encodeURIComponent\(id\)\}\/submit`, \{\}\)/)
  assert.match(view, /const saved = await persistDraft\(\)[\s\S]*if \(submit\)[\s\S]*submit\(saved\.id\)/)
  assert.doesNotMatch(view, /marketplaceStatus\s*=\s*['"]PENDING_APPROVAL/)
})

/* PRODUCT-CASE-B3-E2E-R5 — Returned Case Edit Hydration / detail authority precedes optional representative preview ownership. */
test('returned edit fetches and hydrates the existing Case before privileged representative preview', () => {
  assert.match(api, /detail: \(id: string\)[\s\S]*get<Envelope<AdminMarketplaceCase>>\(`\/admin\/cases\/\$\{encodeURIComponent\(id\)\}`\)/)
  assert.match(view, /const editingId = computed\([\s\S]*route\.query\.id/)
  const hydration = view.slice(view.indexOf('const applyCase ='), view.indexOf('const persistDraft ='))
  for (const field of ['businessCaseId', 'caseId', 'businessCategory', 'transactionType', 'title', 'targetArea', 'companyType', 'capitalAmount', 'priceType', 'priceAmount', 'priceMin', 'priceMax', 'coreNeed', 'isPriority', 'marketplaceStatus', 'returnReason']) assert.match(hydration, new RegExp(`item\\.${field}`))
  assert.match(hydration, /amountWan: toWan\(item\.priceAmount\)[\s\S]*minWan: toWan\(item\.priceMin\)[\s\S]*maxWan: toWan\(item\.priceMax\)/)
  assert.doesNotMatch(hydration, /item\.price(?:\W|$)/)
  const load = view.slice(view.indexOf('const load ='), view.indexOf('watch(() => route.query.id'))
  assert.ok(load.indexOf('adminMarketplaceCasesApi.detail') < load.indexOf('adminProductImagesApi.getProductImageRepresentatives'))
  assert.match(load, /canReadRepresentativeSlots\.value[\s\S]*:\s*\[\]/)
})

test('returned lifecycle context remains visible and save updates the same server identity', () => {
  assert.match(view, /statusLabels:[\s\S]*DRAFT: '草稿'[\s\S]*PENDING_APPROVAL: '待審核'[\s\S]*RETURNED: '已退回'/)
  assert.match(view, /v-if="form\.returnReason"[\s\S]*\{\{ form\.returnReason \}\}/)
  assert.match(view, /isEditMode\.value[\s\S]*adminMarketplaceCasesApi\.update\(editingId\.value, payload\(\)\)[\s\S]*adminMarketplaceCasesApi\.create/)
  assert.match(view, /applyCase\(response\.data\)[\s\S]*return response\.data/)
  assert.match(view, /adminMarketplaceCasesApi\.submit\(saved\.id\)/)
  const payloadBlock = view.slice(view.indexOf('const payload ='), view.indexOf('const applyCase ='))
  assert.doesNotMatch(payloadBlock, /caseId\s*:/)
})

test('representative image is a dynamic read-only slot preview without upload controls', () => {
  assert.match(view, /slot\.businessCategory === form\.businessCategory && slot\.transactionType === form\.transactionType/)
  assert.match(view, /尚未設定代表圖片/)
  assert.match(view, /代表圖片由「商品照片」依業務類別與交易類型自動套用/)
  assert.doesNotMatch(view, /type="file"|FormData|uploadProductImageRepresentative/)
})

test('form labels, feedback semantics, focus visibility, and mobile one-column layout remain explicit', () => {
  assert.match(view, /:for="inputId\('title'\)"/)
  assert.match(view, /aria-live="polite"/)
  assert.match(view, /role="alert"/)
  assert.match(view, /focus-visible/)
  assert.match(view, /@media \(max-width: 768px\)[\s\S]*grid-template-columns: 1fr/)
})
