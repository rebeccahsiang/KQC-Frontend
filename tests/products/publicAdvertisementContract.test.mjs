import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const api = read('src/api/publicAdvertisements.ts')
const product = read('src/views/ProductView.vue')
const showcase = read('src/components/showcase/CaseShowcase.vue')
const card = read('src/components/showcase/MarketplaceAdvertisementCard.vue')
const store = read('src/stores/useCaseStore.ts')

/* PRODUCT-ADVERTISEMENT-R3 — Public Advertisement Contract / Backend PUBLISHED creatives supplement but never become Cases. */
test('dedicated public client owns the exact allowlist and public endpoint', () => {
  assert.match(api, /interface PublicAdvertisement/)
  for (const field of ['id', 'title', 'shortDescription', 'imageUrl', 'ctaLabel', 'ctaDestination', 'sortOrder', 'layoutStyle', 'typographyStyle', 'textTone']) assert.match(api, new RegExp(`\\b${field}:`))
  for (const forbidden of ['status', 'productImageId', 'createdBy', 'approvedBy', 'returnReason', 'mimeType', 'fileSize', 'originalName']) assert.doesNotMatch(api, new RegExp(`\\b${forbidden}:`))
  assert.match(api, /api\.get<Envelope<PublicAdvertisement\[\]>>\('\/public\/advertisements'\)/)
  assert.doesNotMatch(api, /adminAdvertisementsApi|\/v1\/admin/)
})

test('ProductView fetches supplemental ads locally and degrades to an empty list independently of Cases', () => {
  assert.match(product, /publishedAdvertisements = ref<PublicAdvertisement\[\]>\(\[\]\)/)
  assert.match(product, /publicAdvertisementsApi\.list\(\)/)
  assert.match(product, /catch \{ publishedAdvertisements\.value = \[\] \}/)
  assert.match(product, /caseStore\.fetchPublicCases\(\); void fetchPublicAdvertisements\(\)/)
  assert.match(product, /:advertisements="publishedAdvertisements"/)
  assert.doesNotMatch(store, /PublicAdvertisement|publicAdvertisementsApi|publishedAdvertisements/)
})

test('CaseShowcase fills only real-case gaps without cyclic repeats or zero-case ad galleries', () => {
  assert.match(showcase, /advertisements\?: PublicAdvertisement\[\]/)
  assert.match(showcase, /props\.advertisements\.slice\(0, WINDOW_SIZE - visibleCases\.value\.length\)/)
  assert.match(showcase, /props\.marketplaceMode && visibleCases\.value\.length/)
  assert.doesNotMatch(showcase, /MARKETPLACE_ADVERTISEMENTS|index %|slotKey|Array\.from\(\{ length:/)
  assert.match(showcase, /:key="advertisement\.id"/)
  const viewCount = showcase.split('\n').find((line) => line.includes('const viewCount')) || ''
  assert.doesNotMatch(viewCount, /advertisement/)
  assert.match(product, /caseStore\.cases\.length/)
})

test('public card renders internal CTA image and exact R1B semantic mappings', () => {
  assert.match(card, /publicAdvertisementImageUrl\(advertisement\.imageUrl\)/)
  assert.match(card, /<RouterLink[^>]*:to="advertisement\.ctaDestination"/)
  assert.match(api, /'STANDARD' \| 'OVERLAY_LEFT' \| 'OVERLAY_CENTER'/)
  assert.match(card, /`advertisement-card--\$\{props\.advertisement\.layoutStyle\.toLowerCase\(\)\.replace\('_', '-'\)\}`/)
  assert.match(card, /\.advertisement-card\s*\{[^}]*grid-template-rows:auto 1fr/)
  for (const token of ['overlay-left', 'overlay-center', 'type-brand', 'type-bold', 'type-elegant', 'tone-white', 'tone-dark', 'tone-brand-gold', 'tone-brand-blue', 'tone-brand-green']) assert.match(card, new RegExp(`advertisement-card--${token}`))
  assert.match(card, /--advertisement-dark-copy:#0f172a/)
  assert.match(card, /\.advertisement-card__body > p\s*\{\s*color:#0f172a/)
  assert.match(card, /tone-dark h3\s*\{\s*color:var\(--advertisement-dark-copy\)/)
  assert.doesNotMatch(card, /tone-(?:white|dark|brand-gold|brand-blue|brand-green)[^{]*\.(?:advertisement-card__body|advertisement-card p)[^{]*\{[^}]*color:/)
  assert.match(card, /overlay-left\.advertisement-card--tone-dark \.advertisement-card__body[^}]*width:min/)
  assert.match(card, /overlay-center\.advertisement-card--tone-dark \.advertisement-card__body[^}]*width:min/)
  assert.doesNotMatch(card, /v-html|contenteditable|type="color"|style=".*advertisement\.|window\.location|target="_blank"/)
})

test('the three presentation-only advertisements are completely absent from runtime authority', () => {
  const runtime = product + showcase + card + api
  for (const copy of ['您的事業，價值多少？', '免費估值', '為何選擇三瑝？', '品牌與顧問價值', '誠意買家・尋找優質標的', '買方資源']) assert.doesNotMatch(runtime, new RegExp(copy))
})
