import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const panel = read('src/components/showcase/MarketplaceServicePanel.vue')
const product = read('src/views/ProductView.vue')
const processInfo = read('src/components/showcase/MarketplaceProcessInfo.vue')
const router = read('src/router/index.ts')

// PRODUCT-SIDEBAR-R4F-8B — Real Service Detail Content Contract
test('commercial vehicle quota detail owns the approved bounded content and contact paths', () => {
  assert.match(product, /協助營業用車額買賣媒合、需求確認與交易流程辦理，降低資訊落差與交易風險。/)
  for (const copy of ['我要購買車額', '提出購買需求', '我要出售車額', '委託出售', '白牌司機靠行服務', '有車額買賣需求？']) assert.ok(panel.includes(copy), copy)
  for (const type of ['租賃小客（貨）車', '營業小貨車', '營業小客車', '營業大貨車（含貨運曳引車）', '營業拖車']) assert.ok(panel.includes(type), type)
  for (const step of ['需求確認', '媒合／報價', '確認交易', '簽署文件／訂金', '過戶辦理', '完成交付']) assert.ok(panel.includes(step), step)
  for (const item of ['車額表', '車牌價格', '公司准登記表', '變更登記表', '運輸執照', '公會證明書', '公司大小章', '車輛行照', '預購時間', '預算金額', '預計購買車牌／車額需求']) assert.ok(panel.includes(item), item)
  assert.match(panel, /<router-link to="\/contact">提出購買需求/)
  assert.match(panel, /<router-link to="\/contact">委託出售/)
})

test('parking detail owns prechecks process documents timing LINE and partnership presentation', () => {
  assert.match(product, /協助確認停車位證明需求、準備申辦資料及後續行政流程。/)
  for (const copy of ['確認申辦所在地區', '小型／大型車位・需求格數', '兩年／三年', '資料確認', '提供報價', '確認委託', '資料／用印', '申請作業', '核准函取得', '不同意報價 → 日後取得合適價格再通知']) assert.ok(panel.includes(copy), copy)
  for (const item of ['運輸業營業執照', '公司登記核准函', '變更登記表', '運輸公會證書']) assert.ok(panel.includes(item), item)
  assert.match(panel, /依申辦地區及案件狀況，約 5–14 個工作天取得核准函。/)
  assert.match(panel, /透過 LINE 官方帳號提供資料/)
  assert.match(panel, /註：計程車業者另有資料須提供。/)
  assert.match(panel, /若您有經營停車場，歡迎洽詢 KQC 停車位服務合作。/)
  assert.doesNotMatch(panel, /保證|一定(?:可|會)|百分之百/)
})

test('approved PDF and QR binaries use real same-origin download and image semantics', () => {
  assert.match(panel, /authorizationPdf: '\/downloads\/授權刻印同意書\.pdf'/)
  assert.match(panel, /lineQr: '\/images\/services\/kqc-line-official-qr\.png'/)
  assert.match(panel, /<a :href="parkingAssets\.authorizationPdf" download class="resource-action">/)
  assert.match(panel, /<img :src="parkingAssets\.lineQr" alt="KQC LINE 官方帳號 QR Code">/)
  assert.doesNotMatch(panel, /官方 QR Code 準備中|檔案準備中/)
  assert.doesNotMatch(panel, /authorizationPdf\.available|lineQr\.available/)
  assert.doesNotMatch(panel, /data:image|base64|mock|placeholder\.com/i)
})

test('third service remains planning-only and details introduce no backend workflow authority', () => {
  assert.match(panel, /<section v-if="service\.planned"[\s\S]*服務規劃中[\s\S]*正式內容與合作方式將於確認後公告/)
  assert.match(product, /'commercial-insurance-advisory':[\s\S]*planned: true/)
  assert.doesNotMatch(panel, /from ['"]@\/api\/|fetch\s*\(|axios|localStorage|sessionStorage|CRM|Lead/)
  assert.doesNotMatch(router, /commercial-vehicle-quota|parking-space-application|commercial-insurance-advisory/)
  assert.match(product, /selectedServiceId\.value = item\.id/)
  assert.doesNotMatch(panel, /setFilter|caseStore/)
})

test('service mode aligns at the main-column top without changing approved anchors', () => {
  assert.match(product, /<MarketplaceServicePanel v-if="selectedService" :service="selectedService" \/>\s*<template v-else>/)
  assert.doesNotMatch(product, /\.marketplace-service-panel\s*\{\s*margin-top:/)
  assert.match(product, /id="marketplace-cases" class="product-toolbar marketplace-anchor-target"/)
  // PRODUCT-SIDEBAR-R4F-8C — Service Detail Stale Anchor Test / transfer ownership remains inside MarketplaceProcessInfo.
  assert.match(processInfo, /<header(?=[^>]*\bid="transfer-process")(?=[^>]*\bclass="[^"]*\btransfer-process-anchor\b[^"]*")[^>]*>/)
  assert.match(product, /\.marketplace-anchor-target\s*\{\s*scroll-margin-top:\s*8rem/)
})

test('dark service strips explicitly preserve readable foreground contrast and real asset authority', () => {
  assert.match(panel, /\.support-card h3,\.timing-card h3,\.final-cta h3\{color:#fff\}/)
  assert.match(panel, /\.support-card p,\.timing-card p\{color:#e7f1f4\}/)
  assert.match(panel, /lineQr: '\/images\/services\/kqc-line-official-qr\.png'/)
  assert.match(panel, /authorizationPdf: '\/downloads\/授權刻印同意書\.pdf'/)
})
