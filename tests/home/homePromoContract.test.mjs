import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('Promo remains a bounded homepage section with a future-ready data shape', () => {
  const home = read('src/views/HomeView.vue')
  const promo = read('src/components/home/HomePromoCarouselSection.vue')
  assert.match(home, /<HomePromoCarouselSection\s*\/>/)
  assert.match(promo, /interface PromoItem/)
  for (const field of ['id', 'title', 'description', 'imageUrl', 'imageAlt']) assert.match(promo, new RegExp(`${field}[?:]`))
  assert.match(promo, /placeholderPromos: PromoItem\[\]/)
  assert.equal((promo.match(/id="featured-services"/g) ?? []).length, 1)
  assert.match(promo, /<section id="featured-services" class="home-promo-section"/)
})

test('featured services owns CSS anchor clearance below the compact header', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  const styles = read('src/components/home/_homeSections.scss')
  const sectionRule = styles.match(/\.home-promo-section\s*\{([^}]*)\}/)?.[1] ?? ''
  const promoStart = styles.indexOf('.home-promo-section')
  const mobileEnd = styles.indexOf('@media (max-width: 480px)', promoStart)
  const mobileStart = styles.lastIndexOf('@media (max-width: 768px)', mobileEnd)
  const mobileStyles = styles.slice(mobileStart, mobileEnd)
  const desktopClearance = Number(sectionRule.match(/scroll-margin-top:\s*([\d.]+)rem/)?.[1])
  const mobileClearance = Number(mobileStyles.match(/\.home-promo-section\s*\{[^}]*scroll-margin-top:\s*([\d.]+)rem/)?.[1])

  assert.ok(promoStart >= 0 && mobileStart > promoStart && mobileEnd > mobileStart)
  assert.match(sectionRule, /scroll-margin-top:\s*(?!0(?:rem|px)?;)[^;]+;/)
  assert.ok(mobileClearance > 0 && mobileClearance < desktopClearance)
  assert.match(dock, /target: '#featured-services'/)
  assert.match(dock, /scrollIntoView\(\{ behavior, block: 'start' \}\)/)
  assert.doesNotMatch(dock, /window\.scrollTo|scrollTop|setTimeout|header.*(?:offsetHeight|getBoundingClientRect)/i)
})

test('Swiper targets three desktop, two tablet and one mobile cards', () => {
  const promo = read('src/components/home/HomePromoCarouselSection.vue')
  assert.match(promo, /:slides-per-view="1"/)
  assert.match(promo, /640: \{ slidesPerView: 2/)
  assert.match(promo, /1100: \{ slidesPerView: 3/)
  assert.match(promo, /:navigation="true"/)
  assert.match(promo, /:pagination="\{ clickable: true \}"/)
  assert.match(promo, /A11y, Navigation, Pagination/)
})

test('local images have accessible text and controlled failure fallback', () => {
  const promo = read('src/components/home/HomePromoCarouselSection.vue')
  const styles = read('src/components/home/_homeSections.scss')
  assert.match(promo, /assets\/images\/categories/)
  assert.match(promo, /:alt="promo\.imageAlt"/)
  assert.match(promo, /@error="markImageUnavailable\(promo\.id\)"/)
  assert.match(promo, /class="home-promo-fallback" aria-hidden="true"/)
  assert.match(styles, /\.home-promo-fallback/)
  assert.doesNotMatch(promo, /unsplash|placeholder\.com|picsum|https?:\/\//i)
})

test('internal targets use RouterLink behavior without API or admin coupling', () => {
  const promo = read('src/components/home/HomePromoCarouselSection.vue')
  assert.match(promo, /promo\.target \? 'RouterLink' : 'article'/)
  for (const target of ['/products', '/company', '/contact']) assert.ok(promo.includes(`target: '${target}'`))
  assert.doesNotMatch(promo, /window\.location|axios|fetch\(|\/api\/|BannerManage|admin\/frontend/)
})

test('motion, sizing and copy remain restrained and non-statistical', () => {
  const promo = read('src/components/home/HomePromoCarouselSection.vue')
  const styles = read('src/components/home/_homeSections.scss')
  assert.doesNotMatch(promo, /Autoplay|autoplay/)
  assert.match(styles, /aspect-ratio: 16 \/ 9/)
  assert.match(styles, /object-fit: cover/)
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/)
  assert.doesNotMatch(promo, /全台第一|唯一|最大|成功率|客戶數|成交金額|\d+%/)
})
