import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('HomeView composes bounded homepage sections', () => {
  const home = read('src/views/HomeView.vue')
  for (const section of ['HomeHeroSection','HomeIndustryWeatherSection','HomePromoCarouselSection','HomeServicesSection','HomeServiceGuideSection','HomePersonasSection','HomeInsightsSection','HomeContactCtaSection']) {
    assert.match(home, new RegExp(`<${section}`))
  }
  assert.doesNotMatch(home, /<Swiper|accordionItems|customerTargets|latestInsights|bannerSlides/)
})

test('industry weather remains owned by the existing card contract', () => {
  const section = read('src/components/home/HomeIndustryWeatherSection.vue')
  assert.match(section, /IndustryWeatherCard/)
  assert.doesNotMatch(section, /industryWeatherApi|sourceStatus|HOT|COOLING/)
})

test('promo, services, personas and insights keep explicit placeholder ownership', () => {
  assert.match(read('src/components/home/HomePromoCarouselSection.vue'), /placeholderSlides/)
  assert.match(read('src/components/home/HomeServicesSection.vue'), /placeholderServices/)
  assert.match(read('src/components/home/HomePersonasSection.vue'), /placeholderPersonas/)
  assert.match(read('src/components/home/HomeInsightsSection.vue'), /placeholderArticles/)
})

test('real cases remain isolated pending a product decision', () => {
  const home = read('src/views/HomeView.vue')
  assert.match(home, /axios\.get\(`\$\{apiBaseUrl\}\/api\/cases`\)/)
  assert.match(home, /<HomeLegacyCasesSection :cases="casesData"/)
  assert.match(read('src/components/home/HomeLegacyCasesSection.vue'), /CaseShowcase/)
})

test('shared layout responsibilities do not return to HomeView', () => {
  const home = read('src/views/HomeView.vue')
  assert.doesNotMatch(home, /FrontHeader|AppFooter|BackToTop|PublicBreadcrumb/)
})
