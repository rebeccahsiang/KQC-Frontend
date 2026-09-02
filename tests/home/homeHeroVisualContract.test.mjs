import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('HOME-R1A Hero owns the locked copy, four evidence-free values, and no CTA', () => {
  const hero = read('src/components/home/HomeHeroSection.vue')
  assert.match(hero, /<section class="hero-banner-card"/)
  assert.match(hero, /您事業傳承與轉型的[\s\S]*最佳夥伴/)
  assert.match(hero, /我們專注於運輸產業，[\s\S]*為第一代創業者規劃圓滿退場；[\s\S]*為新一代經營者鋪設成功捷徑/)
  for (const text of ['產業專業', '深耕交通運輸', '專業顧問', '專人需求評估', '全方位', '一站式服務', '高效媒合', '精準需求配對']) assert.match(hero, new RegExp(text))
  assert.doesNotMatch(hero, /傳統產能的數位賦能|探索核心服務|AI 語意匹配|2\+|20\+|500\+/)
  assert.doesNotMatch(hero, /<RouterLink|<a\b|<button\b/)
  assert.equal((hero.match(/\{ icon: '[^']+', title: '[^']+', subtitle: '[^']+' \}/g) || []).length, 4)
})

test('decorative motion is lightweight, hidden from assistive technology and reduced-motion safe', () => {
  const hero = read('src/components/home/HomeHeroSection.vue')
  const styles = read('src/components/home/_homeSections.scss')
  assert.match(hero, /class="hero-visual" aria-hidden="true"/)
  assert.match(hero, /<svg class="hero-mesh"[\s\S]*hero-mesh__wave--horizontal[\s\S]*hero-mesh__wave--vertical[\s\S]*hero-mesh__wave--cross[\s\S]*hero-mesh__nodes--blue[\s\S]*hero-mesh__nodes--gold/)
  assert.match(hero, /class="hero-light-trails"/)
  assert.equal((hero.match(/class="hero-light-trail hero-light-trail--\d"/g) || []).length, 7)
  assert.match(styles, /\.hero-mesh__wave--horizontal \{ animation: hero-mesh-drift 18s/)
  assert.match(styles, /\.hero-mesh__wave--vertical \{[\s\S]*animation: hero-mesh-drift-reverse 20s/)
  assert.match(styles, /\.hero-mesh__nodes--blue circle \{ animation: hero-node-breathe 12s/)
  assert.match(styles, /\.hero-mesh__nodes--gold circle \{ animation: hero-gold-glow 14s/)
  assert.match(styles, /\.hero-light-trail \{[\s\S]*animation: hero-light-trail 8s[\s\S]*\}/)
  assert.match(styles, /\.hero-light-trail--1 \{[^}]*animation-duration: 7s[^}]*\}/)
  assert.match(styles, /\.hero-light-trail--7 \{[^}]*animation-duration: 15s[^}]*\}/)
  assert.match(styles, /\.hero-mesh__nodes circle \{ transform-box: fill-box; transform-origin: center; \}/)
  for (const animation of ['hero-mesh-drift', 'hero-mesh-drift-reverse', 'hero-mesh-drift-cross', 'hero-node-breathe', 'hero-gold-glow', 'hero-light-trail']) assert.match(styles, new RegExp(`@keyframes ${animation}`))
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(styles, /\.hero-mesh__wave, \.hero-mesh__nodes circle, \.hero-light-trail \{ animation: none !important; \}/)
  assert.doesNotMatch(`${hero}\n${styles}`, /<video|<canvas|three(?:\.js)?|webgl|lottie|gsap|requestAnimationFrame/i)
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
