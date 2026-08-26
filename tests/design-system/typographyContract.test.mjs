import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('semantic typography aliases preserve the authoritative primitive scale', () => {
  const variables = read('src/assets/styles/_variables.scss')
  const primitives = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  for (const primitive of primitives) {
    assert.match(variables, new RegExp(`\\$kqc-font-size-${primitive}:`))
  }

  const mappings = {
    caption: 'xs', metadata: 'sm', label: 'sm', 'body-small': 'sm',
    body: 'md', 'body-emphasis': 'lg', 'card-title': 'xl', 'section-title': '2xl',
  }
  for (const [role, primitive] of Object.entries(mappings)) {
    assert.match(variables, new RegExp(`\\$kqc-type-${role}: \\$kqc-font-size-${primitive};`))
  }
})

test('global semantic utilities and the Design System view share the same roles', () => {
  const typography = read('src/assets/styles/_typography.scss')
  const designSystem = read('src/views/DesignSystemView.vue')
  for (const role of ['caption', 'metadata', 'label', 'body-small', 'body', 'body-emphasis', 'card-title', 'section-title']) {
    assert.match(typography, new RegExp(`\\.type-${role} \\{ font-size: \\$kqc-type-${role}; \\}`))
    assert.match(designSystem, new RegExp(`class="type-${role}"`))
  }
  assert.match(designSystem, /Primitive scale/)
  assert.match(designSystem, /Semantic roles/)
})

test('homepage normal text adopts semantic roles while display typography stays responsive', () => {
  const home = read('src/components/home/_homeSections.scss')
  const weather = read('src/components/home/IndustryWeatherCard.vue')

  for (const role of ['caption', 'metadata', 'label', 'body-small', 'body', 'card-title', 'section-title']) {
    assert.match(`${home}\n${weather}`, new RegExp(`\\$kqc-type-${role}`))
  }
  assert.match(home, /\.hero-main-title[\s\S]*font-size: clamp\(/)
  assert.match(home, /\.home-industry-weather__intro h2[^\n]*font-size: clamp\(/)
  assert.match(weather, /strong[^\n]*font-size: 1\.05rem/)
  assert.doesNotMatch(`${home}\n${weather}`, /--(?:homepage|promo|weather)-font-/)
})

test('approved header typography and scroll behavior remain outside this migration', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  assert.doesNotMatch(header, /\$kqc-type-|type-(?:caption|metadata|label|body|card-title|section-title)/)
  assert.match(header, /const COMPACT_ENTER_Y = 140/)
  assert.match(header, /const FULL_RETURN_Y = 32/)
})
