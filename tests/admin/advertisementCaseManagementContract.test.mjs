import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const view = read('src/views/admin/cases/AdvertisementCasesView.vue')
const preview = read('src/components/admin/advertisements/AdvertisementPreview.vue')
const api = read('src/api/adminAdvertisements.ts')
const imageApi = read('src/api/adminAdvertisementImages.ts')
const router = read('src/router/index.ts')
const sidebar = read('src/config/sidebarMenu.ts')

/* PRODUCT-ADVERTISEMENT-R2B — Advertisement Case Admin Contract / visual management and lifecycle authority stay bounded. */
test('Advertisement Case sidebar and route allow only SALES_SUPERVISOR and ADMIN', () => {
  const menu = sidebar.match(/\{ id: 'advertisement-cases'[^}]+\}/)?.[0] || ''
  const route = router.match(/\{ path: 'advertisements'[^}]+\}/)?.[0] || ''
  assert.match(menu, /title: '廣告案件'/); assert.match(menu, /lucide:megaphone/)
  assert.match(route, /AdvertisementCasesView\.vue/)
  for (const boundary of [menu, route]) {
    assert.match(boundary, /capabilities: \['SALES_SUPERVISOR', 'ADMIN'\]/)
    assert.doesNotMatch(boundary, /'SALES'|'PLATFORM_MANAGER'/)
  }
})

test('dedicated API owns exact Advertisement admin lifecycle without delete or APPROVED', () => {
  assert.match(api, /\/v1\/admin\/advertisements/)
  const encodedIdTemplate = '${encodeURIComponent(id)}'
  for (const action of ['submit', 'return', 'approve', 'unpublish', 'republish']) assert.ok(api.includes(`/${encodedIdTemplate}/${action}`))
  for (const status of ['DRAFT', 'PENDING_APPROVAL', 'RETURNED', 'PUBLISHED', 'UNPUBLISHED']) assert.match(api, new RegExp(`'${status}'`))
  assert.doesNotMatch(api + view, /APPROVED|adminAdvertisementsApi\.remove|adminAdvertisementsApi\.delete/)
})

test('shared visual renderer supports exactly three layouts, three typography styles, and five text tones', () => {
  assert.match(api, /\['STANDARD', 'OVERLAY_LEFT', 'OVERLAY_CENTER'\]/)
  assert.match(api, /\['BRAND', 'BOLD', 'ELEGANT'\]/)
  assert.match(api, /\['WHITE', 'DARK', 'BRAND_GOLD', 'BRAND_BLUE', 'BRAND_GREEN'\]/)
  assert.match(preview, /layoutStyle:\s*'STANDARD'/)
  assert.match(preview, /`advertisement-preview--\$\{props\.layoutStyle\.toLowerCase\(\)\.replace\('_', '-'\)\}`/)
  assert.match(preview, /\.advertisement-preview\s*\{[^}]*display:grid/)
  for (const style of ['overlay-left', 'overlay-center', 'type-brand', 'type-bold', 'type-elegant', 'tone-white', 'tone-dark', 'tone-brand-gold', 'tone-brand-blue', 'tone-brand-green']) assert.match(preview, new RegExp(`advertisement-preview--${style}`))
  assert.match(preview, /\.advertisement-preview\s*\{\s*--advertisement-dark-copy:#0f172a/)
  assert.match(preview, /\.advertisement-preview p\s*\{[^}]*color:var\(--advertisement-dark-copy\)/)
  assert.match(preview, /tone-dark h3\s*\{\s*color:var\(--advertisement-dark-copy\)/)
  assert.doesNotMatch(preview, /tone-(?:white|dark|brand-gold|brand-blue|brand-green)[^{]*\.(?:advertisement-preview__copy|advertisement-preview p)[^{]*\{[^}]*color:/)
  assert.match(preview, /overlay-left\.advertisement-preview--tone-dark::after[^}]*overlay-center\.advertisement-preview--tone-dark::after[^}]*background:transparent/)
  assert.match(preview, /overlay-left\.advertisement-preview--tone-dark \.advertisement-preview__copy[^}]*width:min\([^}]*background:linear-gradient/)
  assert.match(preview, /overlay-center\.advertisement-preview--tone-dark \.advertisement-preview__copy[^}]*width:min\([^}]*background:rgb/)
  assert.match(preview, /overlay-left::after[^}]*overlay-center::after[^}]*linear-gradient\(180deg,transparent 8%,rgb\(3 12 24 \/ 82%\)/)
  assert.doesNotMatch(preview, /tone-dark \.advertisement-preview__copy(?: h3| p)?[^}]*color:#fff/)
  assert.doesNotMatch(preview + view, /type="color"|font-family\s*:\s*v-bind|v-html|contenteditable|customCss|customHtml|hexColor/i)
})

test('form owns established content fields, bounded internal CTA, live preview, and no editable status', () => {
  for (const field of ['productImageId', 'title', 'shortDescription', 'ctaLabel', 'ctaDestination', 'sortOrder', 'layoutStyle', 'typographyStyle', 'textTone']) assert.match(view, new RegExp(`form\\.${field}`))
  assert.match(view, /maxlength="120"/); assert.match(view, /maxlength="300"/); assert.match(view, /maxlength="60"/)
  assert.match(view, /value: '\/products'/); assert.match(view, /value: '\/insights'/); assert.match(view, /value: '\/contact'/)
  assert.match(view, /class="live-preview"[\s\S]*<AdvertisementPreview/)
  assert.match(view, /<label>標題色調<Select v-model="form\.textTone"/)
  assert.doesNotMatch(view, /v-model="form\.status"|http:\/\/|https:\/\/|javascript:/)
})

test('visual Advertisement Photo picker consumes R2A library without duplicating upload', () => {
  assert.match(view, /adminAdvertisementImagesApi\.list\(\)/); assert.match(view, /class="picker-grid"/); assert.match(view, /image\.altText/); assert.match(view, /image\.usageCount/)
  assert.match(view, /router\.push\('\/admin\/cases\/advertisement-photos'\)/)
  assert.doesNotMatch(view, /new FormData|type="file"|\.upload\(/)
  assert.match(imageApi, /\/v1\/admin\/advertisement-images/)
})

test('workflow keeps Supervisor creation/submit separate from ADMIN review and explicit self-confirm', () => {
  assert.match(view, /canEdit = .*item\.createdBy === currentUserId/)
  assert.match(view, /canReview = .*isAdmin\.value.*PENDING_APPROVAL/)
  assert.match(view, /確認自行發布/); assert.match(view, /通過並發布/); assert.match(view, /退回修改/)
  assert.match(view, /returnReason\.value\.trim\(\)/)
  for (const call of ['submit', 'approve', 'returnForRevision', 'unpublish', 'republish']) assert.match(view, new RegExp(`adminAdvertisementsApi\\.${call}`))
  assert.doesNotMatch(view, /hasCapability\([^)]*SALES_SUPERVISOR[^)]*\).*approve|status\s*=\s*['"]PUBLISHED/)
})

test('responsive visual grid remains three, two, and one columns with accessible controls', () => {
  assert.match(view, /grid-template-columns:repeat\(3/); assert.match(view, /max-width:1100px[\s\S]*repeat\(2/); assert.match(view, /max-width:680px[\s\S]*grid-template-columns:1fr/)
  assert.match(view, /aria-label="廣告案件清單"/); assert.match(view, /aria-pressed=/); assert.match(view, /role="alert"/); assert.match(view, /focus-visible/)
  assert.match(preview, /prefers-reduced-motion:no-preference/)
})

test('admin Advertisement implementation remains isolated from public and Marketplace Case ownership', () => {
  const source = view + api + preview
  assert.doesNotMatch(source, /CaseShowcase|MarketplaceAdvertisementCard|caseStore|publicMarketplace|\/api\/cases|public\/advertisements/)
  assert.doesNotMatch(source, /CasePhotosView|ProductImageRepresentative|representativeImage|BUY|SELL/)
})
