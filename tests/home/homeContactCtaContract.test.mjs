import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

const section = read('src/components/home/HomeContactCtaSection.vue')
const styles = read('src/components/home/_homeSections.scss')

test('homepage Contact CTA owns the centered public contact action', () => {
  assert.match(section, /<section class="reservation-form-block">/)
  assert.match(section, /<h2>聯絡我們<\/h2>/)
  assert.match(section, /<p>[^<]+<\/p>/)
  assert.match(section, /<RouterLink[^>]*class="btn-reserve-gold-cta"[^>]*to="\/contact"[^>]*>預約展示\s*❯<\/RouterLink>/)
})

test('homepage Contact CTA remains a centered single-column block at every RWD width', () => {
  const block = styles.match(/\.reservation-form-block\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
  assert.ok(block)

  assert.match(block, /text-align:\s*center/)
  assert.match(block, /padding:\s*36px\s+24px/)
  assert.match(block, /border-radius:\s*16px/)
  assert.doesNotMatch(block, /display:\s*(?:grid|flex)/)
  assert.doesNotMatch(block, /grid-template-columns|position:\s*(?:absolute|fixed)|height:\s*[^;]+|min-height:\s*[^;]+|width:\s*[^;]+/)
})
