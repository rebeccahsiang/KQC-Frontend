import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const view = read('src/views/admin/cases/CasePhotosView.vue')
const api = read('src/api/adminProductImages.ts')
const router = read('src/router/index.ts')
const sidebar = read('src/config/sidebarMenu.ts')

// PRODUCT-IMG-A2 — Product Image Representative UI / canonical 14-slot presentation contract.
test('商品照片 renders seven canonical category groups with BUY and SELL slots', () => {
  assert.match(view, /<h1>商品照片<\/h1>/)
  assert.doesNotMatch(view, /案件照片管理|產品照片|產品櫥窗/)
  for (const [code, label] of [['CA', '甲種小客車'], ['CB', '乙種小客車'], ['TX', '計程車'], ['LT', '小貨車'], ['MV', '搬家公司'], ['FT', '汽車貨運'], ['CT', '貨櫃貨運']]) assert.match(view, new RegExp(`code: '${code}', label: '${label}'`))
  assert.match(view, /v-for="category in CATEGORY_OPTIONS"/)
  assert.match(view, /v-for="transaction in TRANSACTION_OPTIONS"/)
  assert.match(view, /code: 'BUY'.*title: '買方代表圖片'/)
  assert.match(view, /code: 'SELL'.*title: '賣方代表圖片'/)
  assert.match(view, /尚未設定代表圖片/)
  for (const label of ['圖片名稱', '替代文字 ALT', '原始檔名', '檔案類型', '檔案大小', '更新時間']) assert.match(view, new RegExp(label))
  assert.match(view, /class="slot-preview"[\s\S]{0,260}:alt="slotFor\([^}]+altText"[\s\S]{0,80}loading="lazy"/)
})

test('representative API owns GET and multipart upload without client category metadata', () => {
  assert.match(api, /getProductImageRepresentatives:[\s\S]*\/v1\/admin\/product-image-representatives'/)
  assert.match(api, /uploadProductImageRepresentative:[\s\S]*businessCategory[\s\S]*transactionType[\s\S]*\/image`/)
  for (const field of ['image', 'name', 'altText']) assert.match(api, new RegExp(`body\\.append\\('${field}'`))
  assert.doesNotMatch(api, /body\.append\('(businessCategory|transactionType)'/)
  assert.match(api, /PRODUCT_IMAGE_MAX_BYTES = 5 \* 1024 \* 1024/)
  assert.match(view, /accept="image\/jpeg,image\/png,image\/webp"/)
})

test('upload state uses backend slot response and preserves bounded retry behavior', () => {
  assert.match(view, /onMounted\(loadRepresentatives\)/)
  assert.match(view, /slots\.value = response\.data\.slots/)
  assert.match(view, /const authoritativeSlot = response\.data\.slot/)
  assert.match(view, /if \(uploadingSlotKey\.value\) return/)
  assert.match(view, /uploadError\.value = backendMessage\(error,[\s\S]*代表圖片上傳失敗/)
  assert.match(view, /dialogVisible\.value = false; resetUpload\(\)/)
  assert.match(view, /v-else-if="loadError"[\s\S]{0,200}重新載入/)
  assert.doesNotMatch(view + api, /localStorage|sessionStorage|indexedDB/i)
})

test('A2 keeps representative maintenance direct and excludes generic library controls', () => {
  assert.doesNotMatch(view, /圖片庫|圖片選擇器|選擇既有圖片|刪除圖片|清空代表圖/)
  assert.doesNotMatch(api, /\.delete\(|\/product-images(?:`|'|")/)
  assert.match(view, /商品案件將依業別與買／賣方向自動使用/)
  assert.doesNotMatch(view, /商品櫥窗|發布審核|publish approval/i)
})

test('route and sidebar expose 商品照片 only to representative maintainers', () => {
  assert.match(router, /path: 'photos'[^}]+title: '商品照片'[^}]+capabilities: \['SALES_SUPERVISOR', 'ADMIN'\]/)
  assert.match(sidebar, /id: 'case-photos'[^}]+title: '商品照片'[^}]+capabilities: \['SALES_SUPERVISOR', 'ADMIN'\]/)
  const routeEntry = router.match(/\{ path: 'photos'[^}]+\}/)[0]
  const menuEntry = sidebar.match(/\{ id: 'case-photos'[^}]+\}/)[0]
  assert.doesNotMatch(routeEntry + menuEntry, /'SALES'|'PLATFORM_MANAGER'/)
})

test('responsive and accessibility boundaries remain explicit', () => {
  assert.match(view, /@media\(max-width:768px\)[\s\S]*\.slot-grid\{grid-template-columns:1fr\}/)
  assert.match(view, /@submit\.prevent="uploadRepresentative"/)
  assert.match(view, /aria-live="polite"/)
  assert.match(view, /aria-live="assertive"/)
  assert.match(view, /button:focus-visible,input:focus-visible/)
  for (const comment of ['Product Image Representative UI', 'Canonical 14 Slot Rendering', 'Representative Upload', 'Representative Backend Authority', 'Slot Upload State', 'Representative Accessibility', 'Product Automation Explanation']) assert.match(view + api, new RegExp(`PRODUCT-IMG-A2 — ${comment}`))
})

test('A2 does not couple product cases or public showcase', () => {
  assert.doesNotMatch(view + api, /CaseCreateView|CaseListView|ProductView|ProductShowcase|case schema/i)
})
