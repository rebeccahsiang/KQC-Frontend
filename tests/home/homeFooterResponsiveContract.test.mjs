import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const footer = readFileSync(new URL('../../src/components/layout/AppFooter.vue', import.meta.url), 'utf8')
const style = footer.match(/<style scoped lang="scss">([\s\S]*?)<\/style>/)?.[1] ?? ''
test('AppFooter owns the approved brand, details and control content', () => {
  for (const className of ['public-footer','public-footer__inner','public-footer__brand','public-footer__contact','public-footer__divider','public-footer__utility','public-footer__toggle']) assert.match(footer, new RegExp(`class="${className}"`))
  assert.match(footer, /<img class="public-footer__logo" :src="footerLogo" alt="KQJ 三瑝資訊" \/>/)
  assert.match(footer, /<strong class="public-footer__wordmark">KQJ<\/strong>/)
  assert.match(footer, /<strong class="public-footer__company">三瑝資訊<\/strong>/)
  assert.match(footer, /智慧運輸與資產交易平台/)
  for (const label of ['隱私政策','使用條款']) assert.match(footer, new RegExp(`<span>${label}<\/span>`))
  assert.match(footer, /const email = 'service@kqj\.com\.tw'/)
  assert.match(footer, /:href="`mailto:\$\{email\}`"/)
  assert.match(footer, /© 2026 三瑝資訊／KQJ\. All Rights Reserved\./)
})
test('AppFooter keeps approved utility grid and mobile flow', () => {
  const contact = style.match(/\.public-footer__contact\s*\{[^}]*\}/)?.[0] ?? ''
  const mobile = style.match(/@media\s*\(max-width:\s*640px\)\s*\{([\s\S]*?)(?=@media\s*\(prefers-reduced-motion:\s*reduce\)|$)/)?.[1] ?? ''
  assert.match(style, /\.public-footer__utility\s*\{[^}]*grid-template-columns:\s*repeat\(3/)
  assert.match(contact, /display:\s*grid/)
  assert.match(contact, /grid-auto-rows:\s*max-content/)
  assert.match(contact, /align-self:\s*center/)
  assert.match(contact, /align-content:\s*start/)
  assert.match(mobile, /\.public-footer__main\s*\{[^}]*flex-direction:\s*column/s)
  assert.doesNotMatch(style, /\.public-footer__utility\s*\{[^}]*justify-content:\s*space-between/)
})
