import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('primary navigation omits Home while full and compact logos return home', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  assert.doesNotMatch(header, /\{ name: '首頁', path: '\/' \}/)
  for (const path of ['/products', '/company', '/insights', '/contact']) assert.ok(header.includes(`path: '${path}'`))
  assert.match(header, /to="\/" class="brand-link" aria-label="回首頁"/)
  assert.match(header, /to="\/" class="compact-brand-link" aria-label="回首頁"/)
})

test('header uses explicit full and compact modes with hysteresis', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  assert.match(header, /const isCompact = ref\(false\)/)
  assert.match(header, /const COMPACT_ENTER_Y = 140/)
  assert.match(header, /const FULL_RETURN_Y = 32/)
  assert.match(header, /!isCompact\.value && scrollTop > COMPACT_ENTER_Y/)
  assert.match(header, /isCompact\.value && scrollTop < FULL_RETURN_Y/)
  assert.match(header, /class="kqc-sticky-header" :class="\{ 'is-compact': isCompact \}"/)
  assert.match(header, /class="compact-nav-links"/)
})

test('compact header remains navigable and the mobile header stays usable', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  const compactStart = header.indexOf('.kqc-sticky-header.is-compact {')
  const compactEnd = header.indexOf('.header-section-a {', compactStart)
  const compactPosition = header.slice(compactStart, compactEnd)
  assert.ok(compactStart >= 0 && compactEnd > compactStart)
  assert.match(compactPosition, /position: fixed/)
  assert.match(compactPosition, /top: 0\.5rem/)
  assert.match(compactPosition, /left: 50%/)
  assert.match(compactPosition, /z-index: 100/)
  assert.doesNotMatch(compactPosition, /display:\s*none|visibility:\s*hidden|opacity:\s*0|translateY/)
  assert.match(header, /\.is-compact[\s\S]*\.compact-brand-link[\s\S]*display: inline-flex/)
  assert.match(header, /\.compact-nav-links[\s\S]*display: flex/)
  assert.match(header, /@media \(max-width: 768px\)[\s\S]*\.header-section-a\.is-collapsed[\s\S]*visibility: visible/)
  assert.match(header, /active-class="nav-item--active"/)
})

test('mobile navigation stays in flow above the utility and search surface', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  const mobileStart = header.indexOf('@media (max-width: 768px)')
  const mobileEnd = header.indexOf('@media (prefers-reduced-motion: reduce)', mobileStart)
  const mobile = header.slice(mobileStart, mobileEnd)

  assert.ok(mobileStart >= 0 && mobileEnd > mobileStart)
  assert.equal((header.match(/v-for="item in navItems"/g) ?? []).length, 2)
  for (const path of ['/products', '/company', '/insights', '/contact']) assert.ok(header.includes(`path: '${path}'`))
  assert.match(header, /:aria-expanded="mobileNavigationOpen"/)
  assert.match(header, /mobileNavigationOpen \? 'lucide:x' : 'lucide:menu'/)
  assert.match(header, /@click="mobileNavigationOpen = false"/)
  assert.ok(header.indexOf('id="public-navigation"') < header.indexOf('class="header-section-b"'))
  assert.match(mobile, /\.header-section-a, \.header-section-a\.is-collapsed \{ max-height: none !important; overflow: visible; \}/)
  assert.match(mobile, /\.main-nav-links--open \{ display: flex; \}/)
  assert.doesNotMatch(mobile, /\.main-nav-links(?:--open)?\s*\{[^}]*position:\s*(?:absolute|fixed)/s)
  assert.doesNotMatch(mobile, /\.main-nav-links \.nav-item\s*\{[^}]*display:\s*none/s)
})

test('search is navigation assistance and announcement remains separate', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  assert.match(header, /icon="lucide:search" class="search-icon" aria-hidden="true"/)
  assert.doesNotMatch(header, /lucide:mic|mic-btn|SpeechRecognition|handleVoiceInput|語音輸入/)
  assert.match(header, /placeholder="輸入需求，快速找到適合的服務"/)
  assert.match(header, /class="market-ticker-wrapper"/)
  assert.match(header, /import \{ getPublicMarquees \} from '@\/api\/marquees'/)
  assert.match(header, /const MARQUEE_FALLBACK = '平台公告、產業提醒與新服務資訊將顯示於此。'/)
  assert.match(header, /await getPublicMarquees\(\)/)
  assert.match(header, /content\.length \? content\.join\('　•　'\) : MARQUEE_FALLBACK/)
  assert.match(header, /catch \{\s*tickerText\.value = MARQUEE_FALLBACK/s)
  assert.match(header, /<span class="ticker-text">\s*\{\{ tickerText \}\}/s)
  assert.doesNotMatch(header, /axios|fetch\(/)
})

test('theme, account and capability-aware admin entries remain present', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  for (const contract of ['themeStore.toggleTheme', "authStore.openAuthModal('login')", 'authStore.logout()', 'authStore.isAdminPortalUser', 'to="/admin"']) assert.ok(header.includes(contract))
})

test('FAQ button uses the bounded shared public FAQ foundation', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  assert.match(header, /import \{ usePublicFaq \} from '@\/composables\/usePublicFaq'/)
  assert.match(header, /const \{ openFaq \} = usePublicFaq\(\)/)
  assert.match(header, /class="control-btn faq-btn"[^>]*@click="openFaq"/)
  assert.doesNotMatch(header, /admin\/messages\/ai-faq|router\.push\([^)]*faq|axios|fetch\(/i)
})
