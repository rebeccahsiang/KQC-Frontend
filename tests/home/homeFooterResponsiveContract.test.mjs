import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const footer = readFileSync(new URL('../../src/components/layout/AppFooter.vue', import.meta.url), 'utf8')
const style = footer.match(/<style scoped lang="scss">([\s\S]*?)<\/style>/)?.[1] ?? ''

test('AppFooter owns the approved brand, details and control content', () => {
  for (const className of ['public-footer', 'public-footer__inner', 'public-footer__brand', 'public-footer__details', 'public-footer__toggle']) {
    assert.match(footer, new RegExp(`class="${className}"`))
  }
  assert.match(footer, /<span class="public-footer__logo">KQC<\/span>/)
  assert.match(footer, /<strong>三爵資訊<\/strong>/)
  assert.match(footer, /智慧運輸與資產交易平台/)
  assert.match(footer, /<RouterLink to="\/contact">聯絡我們<\/RouterLink>/)
  assert.match(footer, /href="#privacy"[^>]*aria-label="隱私政策"/)
  assert.match(footer, /© 2026 KQC\. All Rights Reserved\./)
})

test('AppFooter keeps two horizontal groups above 640px and stacks them on mobile', () => {
  const inner = style.match(/\.public-footer__inner\s*\{[^}]*\}/)?.[0] ?? ''
  const details = style.match(/\.public-footer__details\s*\{[^}]*\}/)?.[0] ?? ''
  const mobile = style.match(/@media\s*\(max-width:\s*640px\)\s*\{([\s\S]*?)(?=@media\s*\(prefers-reduced-motion:\s*reduce\)|$)/)?.[1] ?? ''

  assert.match(inner, /display:\s*flex/)
  assert.match(inner, /align-items:\s*center/)
  assert.match(inner, /justify-content:\s*space-between/)
  assert.match(details, /display:\s*flex/)
  assert.match(details, /align-items:\s*center/)
  assert.match(details, /justify-content:\s*flex-end/)
  assert.match(details, /flex-wrap:\s*wrap/)

  assert.match(mobile, /\.public-footer__inner\s*\{[^}]*align-items:\s*flex-start;[^}]*flex-direction:\s*column/s)
  assert.match(mobile, /\.public-footer__details\s*\{[^}]*align-items:\s*flex-start;[^}]*flex-direction:\s*column/s)

  const ownedLayout = `${inner}\n${details}\n${mobile}`
  assert.doesNotMatch(ownedLayout, /grid-template-columns|position:\s*(?:absolute|fixed)|(?:^|[;\s])(?:height|min-height):\s*(?:[^;]*\d+(?:px|vh|rem))/i)
  assert.doesNotMatch(style, /@media\s*\([^)]*(?:768|769|900|960|1024)px[^)]*\)/)
})
