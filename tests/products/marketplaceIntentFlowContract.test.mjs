import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const product = read('src/views/ProductView.vue')
const showcase = read('src/components/showcase/CaseShowcase.vue')
const card = read('src/components/showcase/CaseCard.vue')
const advertisement = read('src/components/showcase/MarketplaceAdvertisementCard.vue')
const intent = read('src/components/showcase/MarketplaceIntentModal.vue')
const intentTemplate = intent.slice(intent.indexOf('<template>'), intent.lastIndexOf('</template>'))
const store = read('src/stores/useCaseStore.ts')

/* PRODUCT-SHOWCASE-UI-R4C — Sliding Row Pagination / six real-first slots advance by one three-card row. */
test('Marketplace owns a six-slot window with a three-case sliding step', () => {
  assert.match(product, /<h2\b[^>]*>\s*媒合商品案件\s*<\/h2>/)
  assert.match(product, /<CaseShowcase[^>]*marketplace-mode/)
  assert.match(showcase, /const WINDOW_SIZE = 6/)
  assert.match(showcase, /const STEP_SIZE = 3/)
  assert.match(showcase, /startIndex = computed\(\(\) => viewIndex\.value \* STEP_SIZE\)/)
  assert.match(showcase, /props\.cases\.slice\(startIndex\.value, startIndex\.value \+ WINDOW_SIZE\)/)
  assert.match(showcase, /1 \+ Math\.ceil\(\(props\.cases\.length - WINDOW_SIZE\) \/ STEP_SIZE\)/)
  assert.match(showcase, /WINDOW_SIZE - visibleCases\.value\.length/)
  assert.match(showcase, /:first="viewIndex" :rows="1" :total-records="viewCount"/)
  assert.match(showcase, /case-grid--marketplace[^}]*repeat\(3/)

  const viewCountFor = (totalCases) => totalCases <= 6 ? 1 : 1 + Math.ceil((totalCases - 6) / 3)
  assert.deepEqual([0, 1, 6, 7, 9, 10, 12].map(viewCountFor), [1, 1, 1, 2, 2, 3, 3])
  assert.equal(1 * 3, 3)
})

test('filters reset the view while advertisements never enter sliding case authority', () => {
  assert.match(showcase, /watch\(\(\) => props\.cases, \(\) => \{ viewIndex\.value = 0 \}/)
  assert.match(showcase, /displayedCases = computed\(\(\) => props\.marketplaceMode \? visibleCases\.value : props\.cases\)/)
  assert.match(showcase, /advertisementSlots = computed[\s\S]*WINDOW_SIZE - visibleCases\.value\.length/)
  const visibleCasesLine = showcase.split('\n').find((line) => line.includes('const visibleCases')) ?? ''
  assert.doesNotMatch(visibleCasesLine, /MARKETPLACE_ADVERTISEMENTS|advertisementSlots/)
  assert.doesNotMatch(visibleCasesLine, /\.sort\(/)
  assert.ok(showcase.indexOf('const visibleCases') < showcase.indexOf('const advertisementSlots'))
  const viewCountLine = showcase.split('\n').find((line) => line.includes('const viewCount')) ?? ''
  assert.doesNotMatch(viewCountLine, /MARKETPLACE_ADVERTISEMENTS|advertisementSlots/)
})

test('advertisement slots are equal card surfaces and never enter Marketplace case authority', () => {
  assert.match(showcase, /props\.advertisements\.slice\(0, WINDOW_SIZE - visibleCases\.value\.length\)/)
  assert.match(showcase, /visibleCases\.value\.length \? props\.advertisements\.slice/)
  assert.doesNotMatch(showcase, /MARKETPLACE_ADVERTISEMENTS|index %|slotKey|您的事業，價值多少？|為何選擇三瑝？|誠意買家/)
  assert.doesNotMatch(store, /MARKETPLACE_ADVERTISEMENTS|advertisementSlots|MarketplaceAdvertisement/)
  assert.match(advertisement, /min-height:26rem[\s\S]*border-radius:\.85rem/)
  assert.match(card, /min-height: 26rem[\s\S]*border-radius: \.85rem/)
  assert.match(product, /caseStore\.cases\.length/)
  assert.doesNotMatch(product, /advertisementSlots[\s\S]*公開標的/)
  assert.match(advertisement, /\.advertisement-card:hover[^}]*box-shadow:[^}]*transform:translateY\(-3px\)/)
  assert.match(advertisement, /prefers-reduced-motion:reduce[\s\S]*transform:none/)
  assert.match(advertisement, /<RouterLink[^>]*:to="advertisement\.ctaDestination"/)
})

/* PRODUCT-SHOWCASE-UI-R3 — Intent Flow Contract / BUY and SELL share one source-aware accessible presentation modal. */
test('BUY and SELL CTAs open one reusable source-aware intent modal', () => {
  assert.match(card, /defineEmits<\{ intent: \[caseData: PublicMarketplaceCase\] \}>/)
  assert.match(card, /emit\('intent', caseData\)/)
  assert.match(card, /我有合適的標的[\s\S]*我有興趣/)
  assert.doesNotMatch(card, /router-link[\s\S]*intent-link|to="\/contact"/)
  assert.match(showcase, /selectedIntentCase = ref<PublicMarketplaceCase \| null>\(null\)/)
  assert.match(showcase, /@intent="openMarketplaceIntent"/)
  assert.match(showcase, /<MarketplaceIntentModal[^>]*:case-data="selectedIntentCase"/)
  assert.match(intent, /caseData\.title[\s\S]*caseData\.caseId[\s\S]*caseData\.transactionType/)
})

test('intent form owns required fields consent validation keyboard close and 300-character note', () => {
  for (const id of ['intent-salutation', 'intent-name', 'intent-company', 'intent-phone', 'intent-email', 'intent-line', 'intent-note']) assert.match(intent, new RegExp(`(?:for|id)="${id}"`))
  assert.match(intent, /intent-salutation[\s\S]*required/)
  assert.match(intent, /intent-name[\s\S]*required/)
  assert.match(intent, /intent-phone[\s\S]*required/)
  assert.match(intent, /form\.consent[\s\S]*required/)
  assert.match(intent, /maxlength="300"/)
  assert.match(intent, /role="dialog" aria-modal="true"/)
  assert.match(intent, /event\.key === 'Escape'/)
  assert.match(intent, /@click\.self="close"/)
  assert.match(intent, /focus-visible/)
})

/* PRODUCT-SHOWCASE-UI-R3E — Compact Intent Modal / paired desktop fields retain one-column mobile accessibility. */
test('intent modal uses compact two-column desktop fields and one-column mobile layout', () => {
  assert.match(intent, /\.form-grid \{[^}]*grid-template-columns: repeat\(2, minmax\(0,1fr\)\)/)
  assert.match(intent, /\.form-field--wide \{[^}]*grid-column: 1 \/ -1/)
  assert.match(intent, /@media \(max-width: 600px\)[\s\S]*\.form-grid \{[^}]*grid-template-columns: 1fr/)
  assert.match(intent, /\.intent-modal--buy \{[^}]*--intent-accent: #256e86/)
  assert.match(intent, /--intent-accent: #a66f0a/)
  assert.match(intent, /\.source-case \{[^}]*border-left: 3px solid var\(--intent-accent\)/)
})

test('valid submit shows explicit non-persistent success presentation without Backend or CRM workflow', () => {
  assert.match(intent, /if \(validate\(\)\) submitted\.value = true/)
  for (const copy of ['感謝您的填寫', '資料保密', '專人聯繫', '媒合服務', '返回商品櫥窗']) assert.match(intent, new RegExp(copy))
  assert.doesNotMatch(intentTemplate, /<p[^>]*>本階段為前端流程展示，不會送出資料或建立 CRM 紀錄。<\/p>/)
  assert.doesNotMatch(intent, /fetch\(|axios|Lead|lead|publicMarketplaceApi\.|localStorage|sessionStorage/)
})

/* PRODUCT-SHOWCASE-UI-R3F — Sticky Intent Actions / public form actions remain visible without exposing development copy. */
test('form action footer stays visible and retains bounded BUY SELL submission controls', () => {
  assert.match(intent, /\.intent-modal footer \{[^}]*position: sticky;[^}]*bottom: 0;[^}]*border-top: 1px solid #e2e8f0;[^}]*background: rgba\(255,255,255,\.97\)/)
  assert.match(intent, /scroll-padding-bottom: calc\(var\(--intent-footer-clearance\) \+ \.75rem\)/)
  assert.match(intentTemplate, /<footer><button type="button" class="secondary" @click="close">取消<\/button><button type="submit" class="primary">確認送出<\/button><\/footer>/)
  assert.doesNotMatch(intentTemplate, /本階段為前端流程展示，不會送出資料或建立 CRM 紀錄。/)
  assert.match(intent, /\.primary \{[^}]*var\(--intent-accent\)/)
  assert.match(intent, /\.intent-modal--buy \{[^}]*#256e86/)
  assert.match(intent, /--intent-accent: #a66f0a/)
})

/* PRODUCT-SHOWCASE-UI-R3F-1 — Consent Clearance / sticky actions reserve measurable scroll content space. */
test('sticky footer cannot obscure consent or its validation message', () => {
  const formStart = intentTemplate.indexOf('<form v-if="!submitted"')
  const formBoundary = intentTemplate.slice(formStart, intentTemplate.indexOf('</form>', formStart))
  assert.ok(formStart >= 0)
  assert.match(formBoundary, /<div class="intent-form-content">[\s\S]*class="consent-field"[\s\S]*id="intent-consent-error"[\s\S]*<\/div>[\s\S]*<footer>/)
  assert.match(intent, /--intent-footer-clearance: 4\.75rem/)
  assert.match(intent, /\.intent-form-content \{ padding-bottom: calc\(var\(--intent-footer-clearance\) \+ \.75rem\); \}/)
  assert.match(intent, /margin: calc\(0rem - var\(--intent-footer-clearance\)\) -1\.15rem 0/)
  assert.match(intent, /@media \(max-width: 600px\)[\s\S]*--intent-footer-clearance: 8rem/)
})

test('B4 structured price image and privacy allowlist remain intact', () => {
  for (const mode of ['RANGE', 'MAX', 'APPROXIMATE']) assert.match(card, new RegExp(`priceType === '${mode}'`))
  assert.match(card, /publicMarketplaceImageUrl\(image\.imageUrl\)/)
  const bindings = card.match(/caseData\.[A-Za-z]+/g) ?? []
  for (const field of ['businessCaseId', 'crmData', 'customer', 'createdBy', 'submittedBy', 'approvedBy', 'finance', 'performance']) assert.equal(bindings.includes(`caseData.${field}`), false)
})
