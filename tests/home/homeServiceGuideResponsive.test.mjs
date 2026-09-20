import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileString } from 'sass'
import postcss from 'postcss'

const guide = readFileSync(new URL('../../src/components/home/HomeServiceGuideSection.vue', import.meta.url), 'utf8')
const shared = readFileSync(new URL('../../src/components/home/_homeSections.scss', import.meta.url), 'utf8')
const style = guide.match(/<style scoped lang="scss">([\s\S]*?)<\/style>/)[1]
const css = postcss.parse(compileString(style).css)

function properties(selector, width) {
  const result = {}
  css.walkRules(rule => {
    if (!rule.selectors.includes(selector)) return
    for (let parent = rule.parent; parent; parent = parent.parent) {
      if (parent.type !== 'atrule') continue
      assert.equal(parent.name, 'media')
      for (const [, bound, limit] of parent.params.matchAll(/(min|max)-width:\s*(\d+)px/g)) {
        if (bound === 'max' && width > Number(limit)) return
        if (bound === 'min' && width < Number(limit)) return
      }
    }
    rule.walkDecls(declaration => { result[declaration.prop] = declaration.value })
  })
  return result
}

test('desktop and laptop widths retain a wider main column beside the service cards', () => {
  for (const width of [1024, 1100, 1280, 1366, 1440, 1920]) {
    const layout = properties('.home-service-guide', width)
    assert.equal(layout.display, 'grid')
    assert.equal(layout['grid-template-columns'], 'minmax(0, 7fr) minmax(15rem, 3fr)')
    assert.equal(properties('.home-service-guide > .kqc-card-block', width)['min-width'], '0')
    assert.equal(properties('.home-service-entry-column', width)['min-width'], '0')
  }
})

test('tablet preserves two columns and mobile stacks the main content before the three existing service cards', () => {
  for (const width of [375, 430, 640]) {
    assert.equal(properties('.home-service-guide', width)['grid-template-columns'], 'minmax(0, 1fr)')
  }
  for (const width of [641, 768]) {
    assert.equal(properties('.home-service-guide', width)['grid-template-columns'], 'minmax(0, 7fr) minmax(11rem, 3fr)')
  }
  assert.ok(guide.indexOf('class="kqc-card-block"') < guide.indexOf('<aside class="home-service-entry-column"'))
  for (const label of ['AI 助理', '快速服務', '真人諮詢']) assert.ok(guide.includes(label))
  assert.match(guide, /@click="emit\('open-panel', entry\.id\)"/)
  assert.match(shared, /\.home-service-entry-grid[^}]*grid-template-columns: 1fr/)
})

test('section RWD has one owner and narrow accordion content reflows without smaller text', () => {
  assert.doesNotMatch(shared, /\.home-service-guide\s*\{/)
  assert.doesNotMatch(style, /font-size|font:|--public-type-|!important/)
  for (const selector of ['.home-service-guide .accordion-body-text', '.home-service-guide .accordion-service-content ul']) {
    assert.equal(properties(selector, 375)['grid-template-columns'], 'minmax(0, 1fr)')
    assert.equal(properties(selector, 640)['grid-template-columns'], 'minmax(0, 1fr)')
    assert.equal(properties(selector, 641)['grid-template-columns'], undefined)
  }
})
