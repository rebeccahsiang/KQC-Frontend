import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('Hero remains a bounded section and preserves the AI match component contract', () => {
  const hero = read('src/components/home/HomeHeroSection.vue')
  assert.match(hero, /<section class="hero-banner-card"/)
  assert.match(hero, /modelValue: string; loading: boolean/)
  assert.match(hero, /'update:modelValue'/)
  assert.match(hero, /submit: \[\]/)
  assert.match(hero, /@submit\.prevent="emit\('submit'\)"/)
  assert.match(hero, /:disabled="loading"/)
})

test('decorative motion is lightweight, hidden from assistive technology and reduced-motion safe', () => {
  const hero = read('src/components/home/HomeHeroSection.vue')
  const styles = read('src/components/home/_homeSections.scss')
  assert.match(hero, /class="hero-visual" aria-hidden="true"/)
  assert.match(styles, /@keyframes hero-grid-drift/)
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(styles, /\.hero-grid, \.hero-orbit, \.hero-route-line \{ animation: none !important; \}/)
  assert.doesNotMatch(`${hero}\n${styles}`, /three(?:\.js)?|canvas|webgl|lottie|gsap/i)
})

test('Home keeps Hero immediately before the separate Industry Weather section', () => {
  const home = read('src/views/HomeView.vue')
  const hero = home.indexOf('<HomeHeroSection')
  const weather = home.indexOf('<HomeIndustryWeatherSection')
  assert.ok(hero >= 0 && weather > hero)
  assert.equal((home.slice(hero, weather).match(/<Home[A-Z]/g) || []).length, 1)
  assert.match(read('src/components/home/HomeIndustryWeatherSection.vue'), /<IndustryWeatherCard\s*\/>/)
})

test('Hero and transition introduce neither government nor Backend access', () => {
  const sources = [
    read('src/components/home/HomeHeroSection.vue'),
    read('src/components/home/HomeIndustryWeatherSection.vue'),
    read('src/components/home/_homeSections.scss')
  ].join('\n')
  assert.doesNotMatch(sources, /data\.gov\.tw|thb\.gov\.tw|axios|fetch\(|\/api\//)
})
