import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const home = read('src/views/HomeView.vue')
const section = read('src/components/home/HomeLegacyCasesSection.vue')
const store = read('src/stores/useCaseStore.ts')
const api = read('src/api/publicMarketplace.ts')
const styles = read('src/components/home/_homeSections.scss')

// HOME-R1E — Latest Marketplace Contract / Home bounds centralized published order without owning fixtures or DTO rules.
test('Home consumes centralized public Marketplace order and renders at most its first two cases', () => {
  assert.match(home, /caseStore\.fetchPublicCases\(\)/)
  assert.match(home, /<HomeLegacyCasesSection :cases="caseStore\.cases" :loading="caseStore\.isLoading" :error="caseStore\.error"/)
  assert.match(store, /publicMarketplaceApi\.list\(\)/)
  assert.match(section, /const latestCases = computed\(\(\) => props\.cases\.slice\(0, 2\)\)/)
  assert.match(section, /v-for="item in latestCases"/)
  assert.doesNotMatch(section, /RC4|caseId:\s*['"]|title:\s*['"]|publishedAt.*sort|\.sort\(/)
})

test('compact cards bind only canonical public image identity and bounded public fields', () => {
  assert.match(section, /publicMarketplaceImageUrl\(item\.representativeImage\.imageUrl\)/)
  assert.match(section, /v-else class="home-marketplace-card__fallback"/)
  for (const field of ['item.transactionType', 'item.businessCategory', 'item.title', 'item.caseId', 'item.targetArea', 'item.companyType', 'item.capitalAmount']) assert.ok(section.includes(field))
  assert.doesNotMatch(section, /coreNeed|priceMin|priceMax|createdBy|businessCaseId|customer|crmData|CaseShowcase|need-block|案件重點|尋找條件/)
  assert.match(api, /export interface PublicMarketplaceCase/)
})

test('heading and semantic cards route to the existing Product Showcase anchor', () => {
  assert.match(section, /<Icon icon="lucide:store" aria-hidden="true" \/>商品櫥窗/)
  assert.equal((section.match(/name: 'Products', hash: '#marketplace-cases'/g) ?? []).length, 2)
  assert.match(section, /class="link-gold-more">查看更多商品 →/)
  assert.match(section, /<RouterLink[\s\S]*v-for="item in latestCases"[\s\S]*class="home-marketplace-card"/)
  assert.doesNotMatch(section, /@click|useRouter|router\.push/)
})

test('Home owns a compact two-column grid and a safe one-column mobile layout', () => {
  const boundary = styles.slice(styles.indexOf('/* HOME-R1E'), styles.indexOf('.reservation-form-block'))
  assert.match(boundary, /\.home-marketplace__grid \{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s)
  assert.match(boundary, /\.home-marketplace-card__media \{[^}]*aspect-ratio: 12 \/ 5/s)
  assert.match(boundary, /@media \(min-width: 769px\)[\s\S]*\.insights-2col-grid,[\s\S]*\.home-marketplace__grid \{[^}]*width: 86%;[^}]*margin-inline: auto/s)
  assert.match(boundary, /@media \(max-width: 640px\)[\s\S]*\.home-marketplace__grid \{[^}]*grid-template-columns: minmax\(0, 1fr\)/)
  assert.doesNotMatch(boundary, /min-height:\s*(?:[2-9]\d{2}px|\d+rem)|grid-template-columns:\s*repeat\([3-9]/)
})
