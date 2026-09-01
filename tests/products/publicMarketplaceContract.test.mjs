import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const api = read('src/api/publicMarketplace.ts')
const store = read('src/stores/useCaseStore.ts')
const view = read('src/views/ProductView.vue')
const card = read('src/components/showcase/CaseCard.vue')
const showcase = read('src/components/showcase/CaseShowcase.vue')
const intentModal = read('src/components/showcase/MarketplaceIntentModal.vue')
const home = read('src/views/HomeView.vue')

/* PRODUCT-CASE-B4 — Public Marketplace Authority / runtime owns only the bounded public endpoint without demo fallback. */
test('Product Showcase uses canonical public Marketplace data with no production demo authority', () => {
  assert.match(api, /publicMarketplaceApi[\s\S]*list: \(\) => api\.get<Envelope<PublicMarketplaceCase\[\]>>\('\/cases'\)/)
  assert.match(store, /cases = ref<PublicMarketplaceCase\[]>\(\[\]\)/)
  assert.match(store, /publicMarketplaceApi\.list\(\)/)
  assert.doesNotMatch(store + view, /INITIAL_DEMO_CASES|KQC-SFT260814|KQC-BCA260722|KQC-SMV260725|\/api\/admin\/cases/)
  assert.match(home, /caseStore\.fetchPublicCases\(\)/)
  assert.match(home, /:cases="caseStore\.cases"/)
  assert.doesNotMatch(store + api, /PublicAdvertisement|publicAdvertisementsApi|advertisementSlots/)
  assert.match(view, /:advertisements="publishedAdvertisements"/)
})

/* PRODUCT-CASE-B4 — Canonical Public DTO / presentation does not depend on internal Marketplace or CRM fields. */
test('public DTO and card consume the canonical privacy allowlist only', () => {
  for (const field of ['caseId', 'businessCategory', 'transactionType', 'title', 'targetArea', 'companyType', 'capitalAmount', 'priceType', 'priceAmount', 'priceMin', 'priceMax', 'isPriority', 'coreNeed', 'publishedAt', 'representativeImage']) assert.match(api, new RegExp(`\\b${field}\\b`))
  const cardBindings = card.match(/caseData\.[A-Za-z]+/g) ?? []
  for (const forbidden of ['businessCaseId', 'createdBy', 'submittedBy', 'approvedBy', 'requiredApproverCapability', 'returnReason', 'crmData', 'customer', 'finance', 'performance', 'caseType', 'leaseType', 'price']) assert.equal(cardBindings.includes(`caseData.${forbidden}`), false)
})

/* PRODUCT-CASE-B4 — Marketplace Transaction Filter / legacy caseType cannot drive public tabs. */
test('all BUY and SELL tabs filter through canonical transactionType', () => {
  assert.match(view, /ref<'ALL' \| 'BUY' \| 'SELL'>\('ALL'\)/)
  assert.match(view, /const tabs: ReadonlyArray<\{ value: 'ALL' \| 'BUY' \| 'SELL'/)
  assert.match(view, /\{ value: 'BUY', label:/)
  assert.match(view, /\{ value: 'SELL', label:/)
  assert.match(view, /const setFilter = \(type: 'ALL' \| 'BUY' \| 'SELL'\)/)
  assert.match(view, /caseStore\.setFilters\(\{ transactionType: type \}\)/)
  assert.match(view, /@click="setFilter\(tab\.value\)"/)
  assert.match(store, /item\.transactionType === filters\.value\.transactionType/)
  assert.doesNotMatch(store + view, /buyer_request|seller_listing|case_type|caseType/)
})

/* PRODUCT-CASE-B4 — Structured Price Presentation / every canonical mode retains BUY/Sell wording and integer-TWD conversion. */
test('card presents FIXED RANGE MAX and APPROXIMATE from canonical structured prices', () => {
  for (const mode of ['RANGE', 'MAX', 'APPROXIMATE']) assert.match(card, new RegExp(`priceType === '${mode}'`))
  assert.match(card, /transactionType === 'BUY'/)
  assert.match(card, /isBuyer\.value \? '預算' : '售價'/)
  assert.match(card, /value \/ 10000/)
  assert.doesNotMatch(card, /caseData\.price(?:\W|$)/)
})

/* PRODUCT-CASE-B4 — Representative Image Resolution / public DTO image, bounded placeholder, and accessible alt remain local. */
test('card uses public representativeImage and a stable missing-slot placeholder', () => {
  assert.match(card, /caseData\.representativeImage/)
  assert.match(card, /publicMarketplaceImageUrl\(image\.imageUrl\)/)
  assert.match(card, /:alt="image\.altText \|\| caseData\.title"/)
  assert.match(card, /v-else class="card-image-placeholder"/)
  assert.doesNotMatch(card + api, /adminProductImagesApi|getProductImageRepresentatives|productImageId/)
})

/* PRODUCT-CASE-B4 — Marketplace Empty/Error State and R3 intent boundary / failures never become demo data or fake persistence. */
test('loading empty error and presentation-only intent flow remain explicit', () => {
  assert.match(showcase, /v-if="loading"/)
  assert.match(showcase, /v-else-if="error"[\s\S]*role="alert"/)
  assert.match(showcase, /v-else-if="!cases\.length && !marketplaceMode"[\s\S]*目前尚無公開商品案件/)
  assert.match(card, /emit\('intent', caseData\)[\s\S]*我有合適的標的[\s\S]*我有興趣/)
  assert.doesNotMatch(card, /to="\/contact"/)
  assert.match(intentModal, /前端流程展示，不會送出資料或建立 CRM 紀錄/)
  assert.doesNotMatch(card + intentModal, /Lead|fetch\(|axios|publicMarketplaceApi\./)
})
