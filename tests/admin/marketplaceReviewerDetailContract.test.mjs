import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const detail = read('src/views/admin/cases/CaseCreateView.vue')
const list = read('src/views/admin/cases/CaseListView.vue')
const api = read('src/api/adminMarketplaceCases.ts')
const router = read('src/router/index.ts')

/* PRODUCT-CASE-B3-E2E-R9 — Reviewer Case Detail / route and refresh are backed by canonical detail loading. */
test('authorized pending review enters a refresh-safe server-loaded detail route', () => {
  assert.match(router, /path: 'review\/:id', name: 'CaseReview'[\s\S]*capabilities: \['SALES', 'SALES_SUPERVISOR', 'ADMIN'\]/)
  assert.match(list, /canReview\(item\)[\s\S]*@click="review\(item\)"[\s\S]*審核案件/)
  assert.match(detail, /route\.name === 'CaseReview'/)
  assert.match(detail, /String\(route\.params\.id \|\| ''\)/)
  assert.match(detail, /adminMarketplaceCasesApi\.detail\(editingId\.value\)/)
  assert.match(detail, /onMounted\(\(\) => \{ void load\(\) \}\)/)
  assert.match(detail, /載入商品案件內容中|無法載入待審核商品案件/)
})

test('reviewer presentation hydrates every bounded Marketplace submission field', () => {
  const hydration = detail.slice(detail.indexOf('const applyCase ='), detail.indexOf('const persistDraft ='))
  for (const field of ['businessCaseId', 'caseId', 'businessCategory', 'transactionType', 'title', 'targetArea', 'companyType', 'capitalAmount', 'priceType', 'priceAmount', 'priceMin', 'priceMax', 'coreNeed', 'isPriority', 'marketplaceStatus', 'createdBy', 'createdByName', 'submittedAt', 'submittedBy', 'submittedByName', 'requiredApproverCapability']) assert.match(hydration, new RegExp(`item\\.${field}`))
  for (const label of ['來源業務案件', '案件編號', '案件標題', '業務類別', '交易類型', '區域分類', '公司類型', '資本額（TWD）', '核心需求／商品說明', '目前狀態', '送審時間']) assert.match(detail, new RegExp(label.replace(/[（）]/g, '\\$&')))
  assert.match(detail, /尚無可用資料來源/)
  assert.doesNotMatch(detail, /clientCompany|clientName|clientMobile|clientEmail|internalNotes|crmData/)
})

/* PRODUCT-CASE-B3-E2E-R9-R1-T1 — Reviewer Actor Privacy Test Boundary / inspect actor markup and DTO fields, not unrelated shared-component comments. */
test('reviewer actor presentation uses bounded StaffIdentity names without broad User or CRM presentation', () => {
  const actorPresentation = detail.slice(
    detail.indexOf('<section v-if="isReviewMode" class="form-card review-context">'),
    detail.indexOf('</section>', detail.indexOf('<section v-if="isReviewMode" class="form-card review-context">')) + '</section>'.length,
  )
  assert.match(actorPresentation, /<dt>建立者<\/dt><dd>\{\{ form\.createdByName \|\| form\.createdBy \|\| '—' \}\}<\/dd>/)
  assert.match(actorPresentation, /<dt>送審者<\/dt><dd>\{\{ form\.submittedByName \|\| form\.submittedBy \|\| '—' \}\}<\/dd>/)
  assert.doesNotMatch(actorPresentation, /form\.(?:email|phone|crmData|customer|staffIdentity)\b/i)
  assert.match(api, /createdByName\?: string \| null/)
  assert.match(api, /submittedByName\?: string \| null/)
  assert.doesNotMatch(api, /(?:createdByName|submittedByName)\?:\s*\{/)
})

/* PRODUCT-CASE-B3-E2E-R9 — Reviewer Read-Only Authority / submitted fields cannot enter the persistence path. */
test('review mode makes submitted controls read-only and disables every selector or checkbox authority', () => {
  for (const id of ['title', 'capital', 'price-min', 'price-max', 'price-amount', 'content']) assert.match(detail, new RegExp(`inputId\\('${id}'\\)[^>]*:readonly="isReviewMode"|inputId\\('${id}'\\)[\\s\\S]{0,180}:readonly="isReviewMode"`))
  for (const id of ['category', 'transaction', 'area', 'company-type', 'price-type']) assert.match(detail, new RegExp(`inputId\\('${id}'\\)[^>]*:disabled="isReviewMode"`))
  assert.match(detail, /v-model="form\.isPriority"[^>]*:disabled="isReviewMode"/)
  assert.match(detail, /if \(busy\.value \|\| isReviewMode\.value\) return/)
  assert.match(detail, /v-if="!isReviewMode" class="form-actions"/)
  assert.match(detail, /case-id'\)" :value="form\.caseId" readonly/)
})

test('structured price review uses canonical fields and BUY or SELL semantics only', () => {
  const price = detail.slice(detail.indexOf('const reviewPrice ='), detail.indexOf('const formatDate'))
  for (const mode of ['RANGE', 'MAX', 'APPROXIMATE']) assert.match(price, new RegExp(mode))
  assert.match(price, /transactionType === 'BUY' \? '預算' : '售價'/)
  assert.match(price, /form\.minWan[\s\S]*form\.maxWan[\s\S]*form\.amountWan/)
  assert.doesNotMatch(price, /form\.price(?:\W|$)|item\.price(?:\W|$)/)
  assert.match(detail, /送審價格：[\s\S]*reviewPrice/)
})

/* PRODUCT-CASE-B3-E2E-R9 — Reviewer Lifecycle Actions / explicit approval and mandatory return reconcile through Backend. */
test('detail owns confirmed approve and mandatory-reason return then returns to canonical list', () => {
  assert.match(detail, /canReview[\s\S]*requiredApproverCapability[\s\S]*!isCreator\.value \|\| isAdminSelfConfirmation\.value/)
  assert.match(detail, /window\.confirm\(`確定通過並發布[\s\S]*adminMarketplaceCasesApi\.approve\(editingId\.value\)[\s\S]*router\.push\(\{ name: 'CaseList' \}\)/)
  assert.match(detail, /!returnReason\.value\.trim\(\)[\s\S]*請填寫退回原因[\s\S]*adminMarketplaceCasesApi\.returnForRevision\(editingId\.value, returnReason\.value\.trim\(\)\)[\s\S]*router\.push\(\{ name: 'CaseList' \}\)/)
  assert.match(detail, /v-if="canReview && !isAdminSelfConfirmation"[\s\S]*退回修改/)
  assert.match(detail, /v-if="canReview"[\s\S]*通過並發布/)
  assert.match(detail, /目前帳號沒有此案件的審核操作權限/)
})

test('creator returned edit/resubmit remains separate and R9 adds no B4 or B5 behavior', () => {
  assert.match(list, /marketplaceStatus === 'RETURNED' && isCreator\(item\)[\s\S]*編輯退回案件/)
  assert.match(detail, /adminMarketplaceCasesApi\.update\(editingId\.value, payload\(\)\)[\s\S]*adminMarketplaceCasesApi\.submit\(saved\.id\)/)
  assert.match(detail, /!isReviewMode\.value && canReadRepresentativeSlots\.value/)
  const reviewBoundary = detail.slice(detail.indexOf('PRODUCT-CASE-B3-E2E-R9 — Reviewer Detail Loading'))
  assert.doesNotMatch(reviewBoundary, /\/products|我有興趣|Lead|upload|productImageId|FormData/)
})
