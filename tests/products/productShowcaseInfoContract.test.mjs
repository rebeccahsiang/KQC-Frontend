import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const product = read('src/views/ProductView.vue')
const info = read('src/components/showcase/MarketplaceProcessInfo.vue')
const intent = read('src/components/showcase/MarketplaceIntentModal.vue')
const publicContract = read('src/api/publicMarketplace.ts')

/* PRODUCT-SHOWCASE-UI-R4 — Main-column Information Placement / process content follows the grid without crossing the Sidebar. */
test('Marketplace information stays inside product-area immediately after the case grid', () => {
  const productArea = product.slice(product.indexOf('<div class="product-area">'), product.indexOf('</section>', product.indexOf('<div class="product-area">')))
  const sidebar = product.slice(product.indexOf('<aside class="marketplace-sidebar"'), product.indexOf('</aside>', product.indexOf('<aside class="marketplace-sidebar"')))
  assert.match(productArea, /<CaseShowcase[\s\S]*<MarketplaceProcessInfo \/>/)
  assert.ok(productArea.indexOf('<CaseShowcase') < productArea.indexOf('<MarketplaceProcessInfo />'))
  assert.doesNotMatch(sidebar, /MarketplaceProcessInfo/)
})

test('R4 owns the three advisory sections and exact five-stage application flow', () => {
  for (const heading of ['核心概念', '建議', '注意事項', '申請流程']) assert.match(info, new RegExp(`<h3[^>]*>${heading}<\\/h3>|<h3>${heading}<\\/h3>`))
  for (const stage of ['第一階段', '第二階段', '第三階段', '第四階段', '第五階段']) assert.match(info, new RegExp(stage))
  for (const detail of ['協助準備過戶資料準備', '辦理公司變更許可', '辦理公司變更', '新運輸執照', '稅務變更']) assert.match(info, new RegExp(detail))
  assert.equal((info.match(/stage: '第[一二三四五]階段'/g) ?? []).length, 5)
  assert.doesNotMatch(info, /2019|2025|2026|工作天|處理天數/)
})

test('desktop uses one-to-two columns and mobile becomes one readable timeline column', () => {
  assert.match(info, /grid-template-columns: minmax\(0, 1fr\) minmax\(0, 2fr\)/)
  assert.match(info, /@media \(max-width: 1040px\)[\s\S]*marketplace-process-info[^}]*grid-template-columns: 1fr/)
  assert.match(info, /@media \(max-width: 640px\)[\s\S]*process-timeline::before[^}]*left: 1rem/)
  assert.match(info, /timeline-content, \.is-even \.timeline-content[^}]*text-align: left/)
})

/* PRODUCT-SHOWCASE-UI-R4A-1 — Bidirectional Timeline + Header Alignment / current reading position can advance and reverse progress. */
test('timeline tracks bidirectional reading progress with cleanup and reduced-motion protection', () => {
  assert.match(info, /new IntersectionObserver/)
  assert.match(info, /rootMargin: '-55% 0px -44% 0px'/)
  assert.match(info, /activeStageCount\.value = stageElements\.filter/)
  assert.match(info, /getBoundingClientRect\(\)/)
  assert.doesNotMatch(info, /Math\.max\(activeStageCount|\.unobserve\(/)
  assert.match(info, /onBeforeUnmount\([\s\S]*stageObserver\?\.disconnect\(\)/)
  assert.match(info, /prefers-reduced-motion: reduce/)
  assert.match(info, /activeStageCount\.value = processSteps\.length/)
  assert.match(info, /process-timeline::after[\s\S]*scaleY\(var\(--timeline-progress\)\)/)
  assert.match(info, /'is-active': index < activeStageCount/)
  assert.doesNotMatch(info, /gsap|anime\.js|scrollmagic/i)
})

test('compact consultant action replaces the large workspace CTA without changing its route', () => {
  const toolbarStart = product.indexOf('<header class="product-toolbar">')
  const toolbar = product.slice(toolbarStart, product.indexOf('</header>', toolbarStart))
  assert.match(toolbar, /<router-link to="\/contact" class="consultant-entry">/)
  assert.match(toolbar, /lucide:messages-square[\s\S]*聯絡 KQC 顧問[\s\S]*精準媒合・加速成交[\s\S]*lucide:chevron-right/)
  assert.doesNotMatch(product, /class="marketplace-cta"|KQC MATCH/)
  assert.match(product, /grid-template-columns: minmax\(max-content, 1fr\) auto minmax\(max-content, 1fr\)/)
  assert.match(product, /consultant-entry[^}]*justify-self: end/)
  assert.doesNotMatch(product, /@media \(max-width: 1180px\)[\s\S]*filter-tabs[^}]*grid-row: 2/)
  assert.match(product, /@media \(max-width: 960px\)[\s\S]*filter-tabs[^}]*grid-row: 2/)
  assert.match(product, /@media \(max-width: 820px\)[\s\S]*product-toolbar[^}]*grid-template-columns: 1fr/)
})

test('R4 adds no forbidden CTA and preserves frozen intent and B4 boundaries', () => {
  assert.doesNotMatch(info, /選擇交付三瑝資訊服務|您可以選擇自己或交由三瑝資訊辦理公司變更|router-link|<button|href=/i)
  assert.match(intent, /PRODUCT-SHOWCASE-UI-R3F-1 — Consent Clearance/)
  assert.match(intent, /position: sticky; bottom: 0/)
  assert.match(publicContract, /export interface PublicMarketplaceCase/)
  assert.doesNotMatch(info, /fetch\(|axios|\/api\/|caseStore|PublicMarketplaceCase/)
})
