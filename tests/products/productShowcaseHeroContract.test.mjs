import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const product = read('src/views/ProductView.vue')
const header = read('src/components/layout/FrontHeader.vue')

/* PRODUCT-CASE-B3-E2E-R7 — Product Showcase Public CTA / Hero and authenticated Header navigation remain separate contracts. */
test('Product Showcase Hero keeps only the public consultation CTA', () => {
  const start = product.indexOf('PRODUCT-CASE-B3-E2E-R7 — Product Showcase Public CTA')
  const heroCtas = product.slice(start, product.indexOf('<div class="hero-image-wrapper"', start))

  assert.ok(start >= 0)
  assert.match(heroCtas, /<router-link to="\/contact" class="btn-primary">[\s\S]*免費預約諮詢 →[\s\S]*<\/router-link>/)
  assert.doesNotMatch(heroCtas, /進入戰情室|to="\/login"|btn-secondary/)
})

test('authenticated Header admin entry remains outside the Product Hero change', () => {
  const start = header.indexOf('title="進入後台"')
  const adminEntry = header.slice(start, header.indexOf('</router-link>', start))

  assert.ok(start >= 0)
  assert.match(adminEntry, /title="進入後台"/)
  assert.match(adminEntry, /aria-label="進入後台"/)
  assert.match(adminEntry, /<span>進入後台<\/span>/)
})
