import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('the five primary public routes share one layout shell', () => {
  const app = read('src/App.vue')
  const layout = read('src/components/layout/PublicLayout.vue')
  for (const routeName of ['Home', 'Products', 'Company', 'Insights', 'Contact']) {
    assert.ok(app.includes(`'${routeName}'`))
  }
  for (const component of ['FrontHeader', 'PublicBreadcrumb', 'RouterView', 'BackToTop', 'AppFooter', 'PublicFaqModal']) {
    assert.match(layout, new RegExp(`<${component}`))
  }
  assert.doesNotMatch(read('src/views/HomeView.vue'), /<FrontHeader|<AppFooter|btn-scroll-to-top/)
  assert.doesNotMatch(read('src/views/ProductView.vue'), /<FrontHeader/)
})

test('header exposes responsive navigation and neutral utility foundations', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  for (const path of ['/products', '/company', '/insights', '/contact']) {
    assert.ok(header.includes(`path: '${path}'`))
  }
  assert.doesNotMatch(header, /\{ name: '首頁', path: '\/' \}/)
  assert.match(header, /<router-link to="\/" class="brand-link" aria-label="回首頁">/)
  assert.match(header, /active-class="nav-item--active"/)
  assert.match(header, /mobileNavigationOpen/)
  assert.match(header, /aria-controls="public-navigation"/)
  assert.match(header, /handleSearch/)
  assert.match(header, /faq-btn/)
  assert.match(header, /通知（目前沒有新通知）/)
  assert.doesNotMatch(header, /<span class="pulse-(?:ring|dot)"/)
})

test('breadcrumb is route-derived, omitted on home, and ready for deeper routes', () => {
  const breadcrumb = read('src/components/layout/PublicBreadcrumb.vue')
  const layout = read('src/components/layout/PublicLayout.vue')
  assert.match(breadcrumb, /useRoute/)
  assert.match(breadcrumb, /v-if="currentLabel"/)
  assert.match(breadcrumb, /aria-label="麵包屑導覽"/)
  assert.match(breadcrumb, /aria-current="page"/)
  assert.doesNotMatch(breadcrumb, /Home:/)
  for (const routeName of ['Products', 'Company', 'Insights', 'Contact']) {
    assert.match(breadcrumb, new RegExp(`${routeName}:`))
  }
  assert.match(layout, /\.public-layout \{[^}]*padding-top: 1rem;/)
  assert.doesNotMatch(`${layout}\n${breadcrumb}`, /\/products[^'"\n]*\{[^}]*margin|products-(?:breadcrumb|clearance)/i)
})

test('first visit remains light while saved valid preferences and switching are preserved', () => {
  const theme = read('src/stores/themeStore.ts')
  const header = read('src/components/layout/FrontHeader.vue')
  assert.match(theme, /isThemeMode\(storedTheme\) \? storedTheme : 'light'/)
  assert.match(theme, /localStorage\.setItem\(STORAGE_KEY, theme\)/)
  assert.match(header, /themeStore\.toggleTheme/)
})

test('footer supports accessible collapse and retains privacy and contact entries', () => {
  const footer = read('src/components/layout/AppFooter.vue')
  assert.match(footer, /expanded = ref\(true\)/)
  assert.match(footer, /@click="expanded = !expanded"/)
  assert.match(footer, /:aria-expanded="expanded"/)
  assert.match(footer, /隱私政策/)
  assert.match(footer, /to="\/contact"/)
  assert.match(footer, /<strong>三爵資訊<\/strong>/)
  assert.match(footer, /智慧運輸與資產交易平台/)
  assert.doesNotMatch(footer, /中華汽車資訊交流協會|商用車資訊與產業服務平台/)
  assert.doesNotMatch(read('src/views/InsightsView.vue'), /<AppFooter|三爵資訊|智慧運輸與資產交易平台/)
})

test('account and capability-aware staff entry contracts remain in the shared header', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  assert.match(header, /void authStore\.initialize\(\)/)
  assert.match(header, /authStore\.openAuthModal\('login'\)/)
  assert.match(header, /authStore\.logout\(\)/)
  assert.match(header, /v-if="authStore\.isAdminPortalUser"/)
  assert.match(header, /to="\/admin"/)
})
