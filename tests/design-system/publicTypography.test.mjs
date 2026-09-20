import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { compile } from 'sass'

const source = new URL('../../src/assets/styles/_publicTypography.scss', import.meta.url)
const css = compile(fileURLToPath(source)).css
const text = readFileSync(source, 'utf8')

test('compiled public typography cannot target admin or global roots', () => {
  for (const rule of css.split('}').filter(rule => rule.includes('{'))) {
    const selector = rule.slice(0, rule.indexOf('{')).replace(/\/\*[\s\S]*?\*\//g, '').trim()
    assert.match(selector, /:is\(\.public-layout, \.session-page, \.public-verification, \.kqc-auth-dialog, \.intent-overlay\)/)
    assert.doesNotMatch(selector, /:root|\.admin|#app/)
  }
  assert.doesNotMatch(css, /!important/)
})

test('public fluid scale stays readable across requested viewport widths', () => {
  const roles = Object.fromEntries([...text.matchAll(/--public-type-([\w-]+): ([^;]+);/g)].map(m => [m[1], m[2]]))
  const value = (expression, width) => {
    if (!expression.startsWith('clamp')) return parseFloat(expression) * 16
    const [min, fluid, max] = expression.slice(6, -1).split(',')
    const [base, viewport] = fluid.split('+')
    return Math.min(parseFloat(max) * 16, Math.max(parseFloat(min) * 16, parseFloat(base) * 16 + parseFloat(viewport) * width / 100))
  }
  for (const width of [375, 390, 430, 768, 1024, 1280, 1366, 1440, 1920]) {
    for (const role of ['body', 'body-small', 'caption', 'metadata', 'action', 'label']) {
      assert.ok(value(roles[role], width) >= 16, `${role} at ${width}px`)
    }
    assert.ok(value(roles['card-title'], width) > value(roles.body, width))
    assert.ok(value(roles['page-title'], width) > value(roles['card-title'], width))
    assert.ok(value(roles.display, width) >= value(roles['page-title'], width))
  }
  assert.equal(value(roles.navigation, 1440), 20)
  assert.equal(value(roles.body, 1440), 18)
})

test('shared semantic aliases compile with unchanged admin fallbacks', () => {
  const variables = compile(fileURLToPath(new URL('../../src/assets/styles/_typography.scss', import.meta.url))).css
  for (const [role, size] of Object.entries({ caption: '0.75rem', metadata: '0.875rem', body: '1rem', 'card-title': '1.25rem' })) {
    assert.ok(variables.includes(`font-size: var(--public-type-${role}, ${size});`))
  }
})
