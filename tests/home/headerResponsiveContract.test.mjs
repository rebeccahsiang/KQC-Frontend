import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import postcss from 'postcss'

const header = readFileSync(new URL('../../src/components/layout/FrontHeader.vue', import.meta.url), 'utf8')
const style = header.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1]
const css = postcss.parse(compileString(style).css)

// Evaluate the emitted media rules, not just the presence of a breakpoint string.
// This is a CSS contract test, not a browser layout/overflow measurement.
function declarations(selector, width) {
  const result = {}
  css.walkRules(rule => {
    if (!rule.selectors.includes(selector)) return
    for (let parent = rule.parent; parent; parent = parent.parent) {
      if (parent.type !== 'atrule') continue
      if (parent.name !== 'media') return
      if (parent.params.includes('prefers-reduced-motion')) return
      for (const [, bound, limit] of parent.params.matchAll(/(min|max)-width:\s*(\d+)px/g)) {
        if (bound === 'max' && width > Number(limit)) return
        if (bound === 'min' && width < Number(limit)) return
      }
    }
    rule.walkDecls(declaration => { result[declaration.prop] = declaration.value })
  })
  return result
}

test('desktop, laptop and sufficiently wide tablet retain full and compact text navigation', () => {
  for (const width of [641, 767, 768, 769, 820, 900, 1024, 1100, 1101, 1280, 1366, 1440, 1920]) {
    assert.equal(declarations('.mobile-nav-toggle', width).display, 'none', `hamburger at ${width}`)
    assert.equal(declarations('.main-nav-links', width).display, 'flex', `full links at ${width}`)
    assert.equal(declarations('.is-compact .compact-nav-links', width).display, 'flex', `compact links at ${width}`)
  }
})

test('only narrow viewports use hamburger navigation and expanded links stay accessible', () => {
  for (const width of [375, 390, 430, 600, 639, 640]) {
    assert.equal(declarations('.mobile-nav-toggle', width).display, 'grid')
    assert.equal(declarations('.main-nav-links', width).display, 'none')
    assert.equal(declarations('.main-nav-links--open', width).display, 'flex')
    assert.equal(declarations('.is-compact .compact-nav-links', width).display, 'none')
    assert.equal(declarations('.kqc-sticky-header.is-compact', width).position, 'sticky')
  }
})

test('intermediate widths preserve text navigation while applying targeted compaction', () => {
  assert.equal(declarations('.kqc-sticky-header', 1024).width, '95%')
  assert.equal(declarations('.header-inner-a', 1024)['max-width'], '1280px')
  assert.equal(declarations('.market-ticker-wrapper', 1024).display, 'flex')
  assert.equal(declarations('.market-ticker-wrapper', 1280).display, 'flex')
  assert.equal(declarations('.brand-link .brand-subtitle', 768).display, 'none')
  assert.equal(declarations('.is-compact .header-inner-b', 1440)['flex-wrap'], 'nowrap')
  assert.equal(declarations('.is-compact .action-controls', 768)['flex-basis'], 'auto')
  assert.equal(declarations('.is-compact .compact-nav-links', 768)['flex-shrink'], '0')
})
