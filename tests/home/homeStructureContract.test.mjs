import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('HomeView composes bounded homepage sections', () => {
  const home = read('src/views/HomeView.vue')
  for (const section of ['HomeHeroSection','HomeIndustryWeatherSection','HomePromoCarouselSection','HomeServiceGuideSection','HomePersonasSection','HomeInsightsSection','HomeContactCtaSection']) {
    assert.match(home, new RegExp(`<${section}`))
  }
  assert.doesNotMatch(home, /HomeServicesSection/)
  assert.ok(home.indexOf('<HomePromoCarouselSection') < home.indexOf('<HomeServiceGuideSection'))
  assert.doesNotMatch(home, /<Swiper|accordionItems|customerTargets|latestInsights|bannerSlides/)
})

test('industry weather remains owned by the existing card contract', () => {
  const section = read('src/components/home/HomeIndustryWeatherSection.vue')
  assert.match(section, /IndustryWeatherCard/)
  assert.doesNotMatch(section, /industryWeatherApi|sourceStatus|HOT|COOLING/)
})

test('promo, unused services, personas and insights keep explicit placeholder ownership', () => {
  assert.match(read('src/components/home/HomePromoCarouselSection.vue'), /placeholderPromos/)
  assert.match(read('src/components/home/HomeServicesSection.vue'), /placeholderServices/)
  assert.match(read('src/components/home/HomePersonasSection.vue'), /placeholderPersonas/)
  assert.match(read('src/components/home/HomeInsightsSection.vue'), /placeholderArticles/)
})

/* PRODUCT-CASE-B4-T1 — Homepage Marketplace Test Authority / HomeView consumes the canonical store instead of owning network access. */
test('homepage Marketplace presentation uses the centralized public case authority', () => {
  const home = read('src/views/HomeView.vue')
  const store = read('src/stores/useCaseStore.ts')
  assert.match(home, /import \{ useCaseStore \} from '@\/stores\/useCaseStore'/)
  assert.match(home, /const caseStore = useCaseStore\(\)/)
  assert.match(home, /caseStore\.fetchPublicCases\(\)/)
  assert.match(home, /<HomeLegacyCasesSection :cases="caseStore\.cases" :loading="caseStore\.isLoading" :error="caseStore\.error"/)
  assert.doesNotMatch(home, /axios\.get\(`\$\{apiBaseUrl\}\/api\/cases`\)|axios\.get\(['"]\/api\/cases/)
  assert.match(store, /publicMarketplaceApi\.list\(\)/)
  assert.match(read('src/components/home/HomeLegacyCasesSection.vue'), /CaseShowcase/)
})

test('shared layout responsibilities do not return to HomeView', () => {
  const home = read('src/views/HomeView.vue')
  assert.doesNotMatch(home, /FrontHeader|AppFooter|BackToTop|PublicBreadcrumb/)
})

test('service dock remains desktop-only without a mobile replacement', () => {
  const home = read('src/views/HomeView.vue')
  const styles = read('src/components/home/_homeSections.scss')
  const mobileStyles = styles.slice(
    styles.lastIndexOf('@media (max-width: 768px)'),
    styles.lastIndexOf('@media (max-width: 480px)'),
  )

  assert.equal((home.match(/<HomeServiceDock\b/g) ?? []).length, 1)
  assert.match(styles, /\.fixed-right-widget-panel\s*\{[^}]*display:\s*flex;/s)
  assert.match(mobileStyles, /\.fixed-right-widget-panel\s*\{\s*display:\s*none;\s*\}/)
  assert.doesNotMatch(home, /MobileServiceDock|BottomServiceDock/)
})
