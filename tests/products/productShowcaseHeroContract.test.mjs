import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const product = read('src/views/ProductView.vue')
const header = read('src/components/layout/FrontHeader.vue')

/* PRODUCT-SHOWCASE-UI-R2A — Approved Marketplace Hero / local truck asset and presentation-only AI composition. */
test('Product Showcase Hero uses the approved two-column baseline without fake metrics', () => {
  const start = product.indexOf('PRODUCT-SHOWCASE-UI-R2A — Approved Marketplace Hero')
  const heroCtas = product.slice(start, product.indexOf('</section>', start))
  assert.ok(start >= 0)
  assert.match(heroCtas, /三爵資訊 KQC 智慧運輸與 AI 轉型平台/)
  assert.match(heroCtas, /傳統產能的數位賦能：[\s\S]*打造 B2B 資產交易的科技戰情室/)
  assert.match(heroCtas, /輸入需求，例如：計程車、北部地區、貨車、委託買賣\.\.\.[\s\S]*AI 語意匹配/)
  assert.match(heroCtas, /快速描述需求，系統會協助整理相關案件。/)
  assert.match(product, /freight-truck\.jpg/)
  assert.doesNotMatch(heroCtas, /<svg|unsplash/i)
  assert.match(heroCtas, /\{\{ caseStore\.cases\.length \}\}[\s\S]*公開標的/)
  assert.doesNotMatch(heroCtas, /filteredCases\.length[\s\S]*公開標的/)
  assert.doesNotMatch(product, /12\+|98%|hero-float-card|highlight-list|heroImageSrc/)
  assert.doesNotMatch(heroCtas, /進入戰情室|to="\/login"|btn-secondary/)
})

test('locked marketplace sidebar and compact consultation entry add no fake workflows', () => {
  for (const heading of ['資產買賣媒合', '交通運輸運營服務', '專屬形象網站', '智慧派遣導入', '司機召募', '業主專區', '產業分析報告']) assert.match(product, new RegExp(heading))
  const toolbarStart = product.indexOf('<header class="product-toolbar">')
  const toolbar = product.slice(toolbarStart, product.indexOf('</header>', toolbarStart))
  assert.match(toolbar, /<router-link to="\/contact" class="consultant-entry">/)
  assert.match(toolbar, /聯絡 KQC 顧問/)
  assert.match(toolbar, /精準媒合・加速成交/)
  assert.doesNotMatch(product, /class="marketplace-cta"|KQC MATCH/)
  assert.doesNotMatch(product, /pagination|sortBy|gridToggle|listView|submitListing|searchMarketplace/i)
})

test('canonical filters stay accessible and horizontally bounded on narrow screens', () => {
  assert.match(product, /ref<'ALL' \| 'BUY' \| 'SELL'>\('ALL'\)/)
  assert.match(product, /caseStore\.setFilters\(\{ transactionType: type \}\)/)
  assert.match(product, /role="tablist"[\s\S]*aria-selected/)
  assert.match(product, /\.filter-tabs[\s\S]*overflow-x: auto/)
  assert.doesNotMatch(product, /buyer_request|seller_listing|caseType/)
})

test('authenticated Header admin entry remains outside the Product Hero change', () => {
  const classIndex = header.indexOf('class="control-btn staff-entry-btn"')
  const start = header.lastIndexOf('<router-link', classIndex)
  const adminEntry = header.slice(start, header.indexOf('</router-link>', start))
  assert.ok(start >= 0)
  assert.match(adminEntry, /to="\/admin"/)
  assert.match(adminEntry, /lucide:layout-dashboard/)
})
