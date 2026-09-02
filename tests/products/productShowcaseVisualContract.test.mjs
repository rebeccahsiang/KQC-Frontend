import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const card = read('src/components/showcase/CaseCard.vue')
const showcase = read('src/components/showcase/CaseShowcase.vue')
const product = read('src/views/ProductView.vue')
const advertisement = read('src/components/showcase/MarketplaceAdvertisementCard.vue')

/* PRODUCT-SHOWCASE-UI-R2C — Marketplace Sidebar Behavior Alignment / Admin dimensions own workspace reflow. */
test('Marketplace sidebar follows Admin expanded and collapsed dimensions with icon-only reflow', () => {
  assert.match(product, /isMarketplaceSidebarCollapsed = ref\(false\)/)
  assert.match(product, /workspace[\s\S]*sidebar-collapsed[\s\S]*marketplace-sidebar[\s\S]*collapsed/)
  assert.match(product, /展開服務分類[\s\S]*收合服務分類/)
  assert.match(product, /lucide:panel-left-open[\s\S]*lucide:panel-left-close/)
  const groupToggleStart = product.indexOf('<button v-if="!isMarketplaceSidebarCollapsed" type="button" class="service-group__toggle"')
  const groupToggle = product.slice(groupToggleStart, product.indexOf('</button>', groupToggleStart))
  assert.ok(groupToggleStart >= 0)
  assert.match(groupToggle, /<Icon :icon="group\.icon" class="service-group__icon"/)
  assert.match(groupToggle, /<span>\{\{ group\.title \}\}<\/span>/)
  assert.match(groupToggle, /isMarketplaceGroupExpanded\(group\.id\) \? 'lucide:chevron-up' : 'lucide:chevron-down'/)
  assert.match(product, /<div v-else class="service-group__compact-icon" aria-hidden="true"><Icon :icon="group\.icon" \/><\/div>/)
  assert.match(product, /<ul v-if="!isMarketplaceSidebarCollapsed" v-show="isMarketplaceGroupExpanded\(group\.id\)"/)
  assert.match(product, /grid-template-columns: 16rem minmax\(0, 1fr\)/)
  assert.match(product, /sidebar-collapsed[^}]+grid-template-columns: 4\.75rem minmax\(0, 1fr\)/)
  assert.match(product, /marketplace-sidebar \{ width: 16rem/)
  assert.match(product, /marketplace-sidebar\.collapsed \{ width: 4\.75rem/)
})

/* PRODUCT-SHOWCASE-UI-R2D — Marketplace Sidebar Accordion / canonical defaults and accessible local controls. */
test('completed and planned Marketplace groups use independent accessible accordions with bounded child controls', () => {
  for (const label of ['運輸業買賣媒合', '交通運輸運營服務', '商品案件', '過戶流程', '營業用車額買賣', '停車位證明申辦', '車險與產險顧問對接']) assert.match(product, new RegExp(label))
  assert.equal((product.match(/title: '(?:運輸業買賣媒合|交通運輸運營服務|專屬形象網站|智慧派遣導入|司機召募|業主專區|產業分析報告)'/g) ?? []).length, 7)
  for (const obsolete of ['資產買賣媒合', '誠意｜買家委託', '精選｜賣家案件', '特約公證處', '代書流程把關']) assert.doesNotMatch(product, new RegExp(obsolete))
  assert.match(product, /expandedMarketplaceGroups = ref\(new Set\(\['asset-matching', 'transport-operations'\]\)\)/)
  assert.match(product, /toggleMarketplaceGroup\(group\.id\)/)
  assert.match(product, /:aria-expanded="isMarketplaceGroupExpanded\(group\.id\)"/)
  assert.match(product, /:aria-controls="`marketplace-group-\$\{group\.id\}`"/)
  assert.match(product, /lucide:chevron-up[\s\S]*lucide:chevron-down/)
  assert.match(product, /service-group__toggle[\s\S]*font-size: \.82rem/)
  assert.match(product, /service-group__children li[\s\S]*font-size: \.76rem/)
  assert.match(product, /<button type="button" class="service-item-button"[\s\S]*:aria-current="isSidebarItemActive\(item\) \? 'location' : undefined"[\s\S]*@click="activateSidebarItem\(item\)"/)
  assert.match(product, /v-if="!isMarketplaceSidebarCollapsed" v-show="isMarketplaceGroupExpanded\(group\.id\)"/)
  assert.match(product, /v-else class="service-group__compact-icon"/)
  assert.doesNotMatch(product, /localStorage|sessionStorage/)
})

/* PRODUCT-SHOWCASE-UI-R1 — BUY/SELL Visual Identity / distinct surfaces still derive from canonical transactionType. */
test('BUY demand and SELL offering cards have distinct professional visual identities', () => {
  assert.match(card, /caseData\.transactionType === 'BUY'/)
  assert.match(card, /isBuyer \? 'case-card--buy' : 'case-card--sell'/)
  assert.match(card, /isBuyer \? '尋找條件' : '案件重點'/)
  assert.match(card, /isBuyer \? '需求預算' : '公開售價'/)
  assert.match(card, /\.case-card--buy[\s\S]*--market-accent:/)
  const buyStyleStart = card.indexOf('.case-card--buy {')
  const buyStyle = card.slice(buyStyleStart, card.indexOf('}', buyStyleStart))
  assert.doesNotMatch(buyStyle, /dashed|dotted|outline/)
  assert.match(card, /\.case-card[^}]*border-top: 3px solid var\(--market-accent\)/)
  assert.match(card, /\.intent-link[\s\S]*&:focus-visible[^}]*outline: 3px solid/)
  assert.match(card, /isBuyer \? '我有合適的標的' : '我有興趣'/)
  assert.doesNotMatch(card, /buyer_request|seller_listing|caseType/)
})

test('card hierarchy preserves B4 representative image price privacy and contact contracts', () => {
  assert.match(card, /caseData\.representativeImage/)
  assert.match(card, /publicMarketplaceImageUrl\(image\.imageUrl\)/)
  assert.match(card, /:alt="image\.altText \|\| caseData\.title"/)
  assert.match(card, /loading="lazy"/)
  assert.match(card, /v-else class="card-image-placeholder"/)
  for (const mode of ['RANGE', 'MAX', 'APPROXIMATE']) assert.match(card, new RegExp(`priceType === '${mode}'`))
  assert.match(card, /value \/ 10000/)
  assert.match(card, /@click="emit\('intent', caseData\)">\{\{ isBuyer \? '我有合適的標的' : '我有興趣' \}\}<\/button>/)
  const bindings = card.match(/caseData\.[A-Za-z]+/g) ?? []
  for (const field of ['businessCaseId', 'crmData', 'customer', 'createdBy', 'submittedBy', 'approvedBy', 'finance', 'performance']) assert.equal(bindings.includes(`caseData.${field}`), false)
})

test('showcase retains accessible states plus homepage and Marketplace responsive grids', () => {
  assert.match(showcase, /v-if="loading"/)
  assert.match(showcase, /v-else-if="error"[\s\S]*role="alert"/)
  assert.match(showcase, /v-else-if="!cases\.length && !marketplaceMode"[\s\S]*role="status"/)
  assert.match(showcase, /grid-template-columns: repeat\(4/)
  assert.match(showcase, /case-grid--marketplace[^}]*repeat\(3/)
  assert.match(showcase, /max-width: 1320px[\s\S]*repeat\(3/)
  assert.match(showcase, /max-width: 1040px[\s\S]*repeat\(2/)
  assert.match(showcase, /max-width: 640px[\s\S]*grid-template-columns: 1fr/)
  assert.match(showcase, /aria-live="polite"/)
})

test('dense card hierarchy promotes title above secondary case id and anchors its CTA', () => {
  assert.ok(card.indexOf('<h3 class="card-title"') < card.indexOf('<span class="case-number"'))
  assert.match(card, /\.card-title[\s\S]*-webkit-line-clamp: 2/)
  assert.match(card, /\.need-block p[\s\S]*-webkit-line-clamp: 2/)
  assert.match(card, /\.card-footer[\s\S]*margin-top: auto/)
})

/* PRODUCT-SHOWCASE-UI-R4D — CaseCard Typography Readability / bounded minimums protect secondary copy without changing layout or CTA authority. */
test('CaseCard secondary information has readable hierarchy while clamps and CTA sizing stay stable', () => {
  const typographyStart = card.indexOf('PRODUCT-SHOWCASE-UI-R4D — CaseCard Typography Readability')
  const typographyBoundary = card.slice(typographyStart, card.indexOf('@media (max-width: 380px)', typographyStart))
  assert.ok(typographyStart >= 0)
  assert.match(typographyBoundary, /\.case-number, \.category \{ font-size: \.8125rem; \}/)
  assert.match(typographyBoundary, /\.market-meta \{ font-size: \.875rem; line-height: 1\.5; \}/)
  assert.match(typographyBoundary, /\.need-label \{ font-size: \.8125rem; \}/)
  assert.match(typographyBoundary, /\.need-block p \{ font-size: \.875rem; line-height: 1\.55; \}/)
  assert.match(typographyBoundary, /\.price-block span \{ font-size: \.8125rem; \}/)
  assert.match(typographyBoundary, /\.price-block strong \{ font-size: \.90625rem; font-weight: 800; line-height: 1\.3; \}/)
  assert.match(card, /\.need-block p[\s\S]*-webkit-line-clamp: 2/)
  assert.match(card, /\.intent-link \{[^}]*min-height: 2rem[^}]*font-size: \.64rem/)
})

/* PRODUCT-ADVERTISEMENT-R3 — Public Advertisement Visual Contract / creative tokens stay independent from BUY/SELL identity. */
test('real public Advertisement card renders image CTA and every bounded visual token', () => {
  assert.match(advertisement, /publicAdvertisementImageUrl\(advertisement\.imageUrl\)/)
  assert.match(advertisement, /advertisement\.shortDescription/)
  assert.match(advertisement, /<RouterLink[^>]*:to="advertisement\.ctaDestination">\{\{ advertisement\.ctaLabel \}\}<\/RouterLink>/)
  assert.match(advertisement, /`advertisement-card--\$\{props\.advertisement\.layoutStyle\.toLowerCase\(\)\.replace\('_', '-'\)\}`/)
  assert.match(advertisement, /\.advertisement-card\s*\{[^}]*grid-template-rows:auto 1fr/)
  for (const token of ['overlay-left', 'overlay-center', 'type-brand', 'type-bold', 'type-elegant', 'tone-white', 'tone-dark', 'tone-brand-gold', 'tone-brand-blue', 'tone-brand-green']) assert.match(advertisement, new RegExp(`advertisement-card--${token}`))
  assert.match(advertisement, /--advertisement-dark-copy:#0f172a/)
  assert.match(advertisement, /overlay-center\.advertisement-card--tone-dark \.advertisement-card__body[^}]*width:min/)
  assert.doesNotMatch(advertisement, /BUY|SELL|buyer|seller|representativeImage|v-html|contenteditable|type="color"/i)
})
