import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const view = read('src/views/admin/cases/AdvertisementPhotosView.vue')
const api = read('src/api/adminAdvertisementImages.ts')
const router = read('src/router/index.ts')
const sidebar = read('src/config/sidebarMenu.ts')

/* PRODUCT-ADVERTISEMENT-R2A — Advertisement Photo Admin Contract / navigation, media workflow, and frozen boundaries remain precise. */
test('sidebar and route expose 廣告照片 only to SALES_SUPERVISOR and ADMIN', () => {
  const menu = sidebar.match(/\{ id: 'advertisement-photos'[^}]+\}/)?.[0] || ''
  const route = router.match(/\{ path: 'advertisement-photos'[^}]+\}/)?.[0] || ''
  assert.match(menu, /title: '廣告照片'/); assert.match(menu, /lucide:images/); assert.match(menu, /capabilities: \['SALES_SUPERVISOR', 'ADMIN'\]/)
  assert.match(route, /AdvertisementPhotosView\.vue/); assert.match(route, /capabilities: \['SALES_SUPERVISOR', 'ADMIN'\]/)
  assert.doesNotMatch(menu + route, /'SALES'|'PLATFORM_MANAGER'/)
})

test('dedicated API client owns the four Advertisement Photo endpoints and bounded DTO', () => {
  for (const method of ['get', 'post', 'patch', 'delete']) assert.match(api, new RegExp(`api\\.${method}`))
  assert.match(api, /\/v1\/admin\/advertisement-images/)
  for (const field of ['image', 'name', 'altText']) assert.match(api, new RegExp(`body\\.append\\('${field}'`))
  for (const field of ['id', 'name', 'altText', 'imageUrl', 'mimeType', 'fileSize', 'usageCount', 'createdAt', 'updatedAt']) assert.match(api, new RegExp(`${field}:`))
  assert.doesNotMatch(api, /public\/advertisements|\/api\/advertisements|purpose:\s*|publicPath:\s*/)
})

test('view renders responsive cards, metadata, usage, loading, retry and empty state', () => {
  assert.match(view, /<h1>廣告照片<\/h1>/); assert.match(view, /class="photo-grid"/); assert.match(view, /image\.name/); assert.match(view, /image\.altText/); assert.match(view, /image\.usageCount/)
  assert.match(view, /正在載入廣告照片/); assert.match(view, /重新載入/); assert.match(view, /尚無廣告照片/)
  assert.match(view, /grid-template-columns:repeat\(3/); assert.match(view, /max-width:960px[\s\S]*repeat\(2/); assert.match(view, /max-width:640px[\s\S]*grid-template-columns:1fr/)
  assert.match(view, /object-fit:cover/); assert.match(view, /image\.altText \|\| image\.name/)
})

test('single upload validates format and 5MB, previews locally, and prevents duplicate submit', () => {
  assert.match(view, /accept="image\/jpeg,image\/png,image\/webp"/); assert.match(view + api, /5 \* 1024 \* 1024/)
  assert.match(view, /URL\.createObjectURL\(file\)/); assert.match(view, /if \(mutating\.value \|\| !uploadReady\.value/)
  assert.match(view, /:disabled="mutating \|\| !uploadReady"/); assert.match(view, /await loadImages\(\)/)
  assert.doesNotMatch(view + api, /multiple|progress-bar|localStorage|sessionStorage/)
})

test('metadata mutation is limited to name and altText', () => {
  assert.match(api, /update: \(id: string, input: \{ name: string; altText: string \}\)/)
  assert.match(view, /編輯廣告照片資料/); assert.match(view, /圖片名稱/); assert.match(view, /ALT 文字/)
  assert.doesNotMatch(view, /purpose change|publicPath edit|fileSize edit|mimeType edit|replace binary/i)
})

test('usage state disables in-use deletion and unused deletion requires a Dialog confirmation', () => {
  assert.match(view, /image\.usageCount === 0 \? '尚未使用' : `使用中 · \$\{image\.usageCount\}`/)
  assert.match(view, /:disabled="image\.usageCount > 0"/); assert.match(view, /if \(image\.usageCount > 0\) return/)
  assert.match(view, /header="刪除廣告照片"/); assert.match(view, /刪除後無法復原/); assert.match(view, /確認刪除/)
  assert.doesNotMatch(view, /window\.confirm/)
})

test('accessibility and frozen product/public boundaries remain intact', () => {
  assert.match(view, /aria-labelledby="advertisement-photo-file-label"/); assert.match(view, /role="alert"/); assert.match(view, /focus-visible/)
  assert.doesNotMatch(view + api, /CasePhotosView|ProductImageRepresentative|CaseShowcase|MarketplaceAdvertisementCard|publicMarketplace|caseStore|\/api\/cases/)
  /* PRODUCT-ADVERTISEMENT-R2B — R2A Photo Boundary / the photo library may be adjacent to, but never owns, Advertisement Case workflow. */
  assert.doesNotMatch(view + api, /adminAdvertisementsApi|PENDING_APPROVAL|RETURNED|PUBLISHED|UNPUBLISHED|\/admin\/cases\/advertisements/)
})
