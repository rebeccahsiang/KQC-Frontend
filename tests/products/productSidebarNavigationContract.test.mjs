import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const product = read('src/views/ProductView.vue')
const info = read('src/components/showcase/MarketplaceProcessInfo.vue')
const panel = read('src/components/showcase/MarketplaceServicePanel.vue')
const router = read('src/router/index.ts')

/* PRODUCT-SIDEBAR-R4F — Public Service Navigation Contract / only two local hashes and three display services are canonical. */
test('Product Sidebar owns exact anchor and service authorities without BUY SELL duplication', () => {
  for (const hash of ['#marketplace-cases', '#transfer-process']) assert.match(product, new RegExp(hash))
  for (const id of ['commercial-vehicle-quota', 'parking-space-application', 'commercial-insurance-advisory']) assert.match(product, new RegExp(id))
  const groups = product.slice(product.indexOf('const marketplaceGroups'), product.indexOf('const publicServices'))
  assert.doesNotMatch(groups, /label: '(?:全部|買方需求|精選待售)'/)
  assert.equal((groups.match(/type: 'anchor'/g) ?? []).length, 2)
  assert.equal((groups.match(/type: 'service'/g) ?? []).length, 3)
})

test('previously deferred information architecture is visible and non-actionable', () => {
  const groups = product.slice(product.indexOf('const marketplaceGroups'), product.indexOf('const publicServices'))
  const plannedGroups = {
    專屬形象網站: ['靜態網頁', '動態網頁', '後台管理'],
    智慧派遣導入: ['派遣平台建置', '派遣平台導入'],
    司機召募: ['立即卡位黃金職缺', '最新職缺'],
    業主專區: ['營業車額徵求', '停車場徵求', '方案 A：精選職缺刊登', '方案 B：顧問委託招募', '方案 C：企業專屬招募系統'],
    產業分析報告: ['企業價值評估報告', '產業併購策略規劃', '事業轉讓／承購顧問', '協助制定中長期轉型策略規劃'],
  }
  for (const [heading, items] of Object.entries(plannedGroups)) {
    assert.ok(groups.includes(`title: '${heading}'`), heading)
    for (const item of items) assert.ok(groups.includes(`label: '${item}'`), item)
  }
  assert.equal((groups.match(/type: 'planned', planned: true/g) ?? []).length, 16)
  assert.match(product, /if \(item\.type === 'planned'\) return/)
  assert.match(product, /:disabled="item\.type === 'planned'"/)
  assert.match(product, /<small v-if="item\.planned">規劃中<\/small>/)
  assert.doesNotMatch(groups, /type: 'planned'[^\n]*(?:hash:|route:|to:|href:|api)/i)
})

test('same-page direct cross-route and history hash changes use bounded local scrolling', () => {
  assert.match(product, /useRoute\(\)[\s\S]*useRouter\(\)/)
  assert.match(product, /approvedProductHashes = new Set<ProductAnchorHash>\(\['#marketplace-cases', '#transfer-process'\]\)/)
  assert.match(product, /watch\(\(\) => route\.hash[\s\S]*scrollToProductHash\(hash\)/)
  assert.match(product, /onMounted\(\(\) => \{[\s\S]*scrollToProductHash\(route\.hash\)/)
  assert.match(product, /if \(route\.hash === item\.hash\) await scrollToProductHash\(item\.hash\)[\s\S]*else await router\.push\(\{ name: 'Products', query: route\.query, hash: item\.hash \}\)/)
  assert.match(product, /target\.scrollIntoView\(\{ behavior, block: 'start' \}\)/)
  assert.match(product, /prefers-reduced-motion: reduce[\s\S]*\? 'auto' : 'smooth'/)
  assert.match(product, /<header id="marketplace-cases" class="product-toolbar marketplace-anchor-target">/)
  assert.match(product, /marketplace-anchor-target \{[^}]*scroll-margin-top: 8rem/)
  assert.doesNotMatch(product, /<(?:section|main)[^>]*id="marketplace-cases"/)
  assert.match(info, /<section class="process-panel"[^>]*>[\s\S]*<header id="transfer-process" class="transfer-process-anchor">/)
  assert.match(info, /transfer-process-anchor \{ scroll-margin-top: 8rem/)
  assert.doesNotMatch(info, /<section[^>]*id="transfer-process"/)
  assert.doesNotMatch(product, /setTimeout|window\.scrollTo|scrollTop|localStorage|sessionStorage/)
  assert.doesNotMatch(router, /commercial-vehicle-quota|parking-space-application|commercial-insurance-advisory/)
})

test('Router yields only the two approved Product hashes to the local scroll authority', () => {
  assert.match(router, /productOwnedHashes = new Set\(\['#marketplace-cases', '#transfer-process'\]\)/)
  assert.match(router, /scrollBehavior: \(to\) => \{[\s\S]*to\.name === 'Products' && productOwnedHashes\.has\(to\.hash\)[\s\S]*return false[\s\S]*return \{ top: 0 \}/)
  const activation = product.slice(product.indexOf('const activateSidebarItem'), product.indexOf('const isSidebarItemActive'))
  assert.equal((activation.match(/scrollToProductHash\(item\.hash\)/g) ?? []).length, 1)
  assert.match(product, /watch\(\(\) => route\.hash[\s\S]*scrollToProductHash\(hash\)/)
  assert.match(product, /onMounted\(\(\) => \{[\s\S]*scrollToProductHash\(route\.hash\)/)
})

test('service selection is local presentation state and cannot mutate Marketplace filters or backend data', () => {
  const activation = product.slice(product.indexOf('const activateSidebarItem'), product.indexOf('const isSidebarItemActive'))
  const serviceBranch = activation.slice(0, activation.indexOf('selectedServiceId.value = null'))
  const serviceConfiguration = product.slice(product.indexOf('const publicServices'), product.indexOf('const selectedService'))
  assert.match(serviceBranch, /item\.type === 'service'[\s\S]*selectedServiceId\.value = item\.id; return/)
  assert.doesNotMatch(serviceBranch, /setFilter|caseStore|fetch|axios|router\.push/)
  assert.match(product, /'commercial-insurance-advisory':[\s\S]*planned: true/)
  assert.match(panel, /v-if="service\.planned"[\s\S]*規劃中/)
  assert.doesNotMatch(panel, /from ['"]@\/api\/|fetch\(|axios|useRoute|useRouter|RouterLink|localStorage|sessionStorage|Lead|CRM/)
  assert.doesNotMatch(serviceConfiguration, /\/api\/|fetch\(|axios|localStorage|sessionStorage|Lead|CRM/)
  assert.match(product, /<MarketplaceServicePanel v-if="selectedService" :service="selectedService" \/>[\s\S]*<template v-else>[\s\S]*<CaseShowcase[\s\S]*<MarketplaceProcessInfo \/>[\s\S]*<\/template>/)
})

test('desktop service navigation is sticky within the workspace and returns to normal flow on narrow layouts', () => {
  assert.match(product, /@media \(min-width: 821px\)\s*\{\s*\.marketplace-sidebar\s*\{[^}]*position:\s*sticky;[^}]*top:\s*6\.5rem;[^}]*align-self:\s*start;[^}]*max-height:\s*calc\(100vh - 8rem\);[^}]*overflow-y:\s*auto;/)
  assert.match(product, /@media \(max-width: 820px\)[\s\S]*\.marketplace-sidebar\s*\{[^}]*width:\s*100%;[^}]*max-height:\s*16rem;[^}]*overflow-y:\s*auto;/)
  assert.doesNotMatch(product, /\.marketplace-sidebar\s*\{[^}]*position:\s*fixed/)
  assert.equal((product.match(/position:\s*sticky/g) ?? []).length, 1)
})
