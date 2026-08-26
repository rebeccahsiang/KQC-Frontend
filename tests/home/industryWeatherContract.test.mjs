import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('homepage uses the bounded backend DTO instead of a direct government request', () => {
  const api = read('src/api/industryWeather.ts'); const card = read('src/components/home/IndustryWeatherCard.vue'); const home = read('src/views/HomeView.vue')
  assert.match(api, /'\/public\/industry-weather'/); assert.doesNotMatch(card, /data\.gov\.tw|thb\.gov\.tw|fetch\(/); assert.match(home, /<IndustryWeatherCard/); assert.doesNotMatch(home, /marketScore\s*=|\{\{ marketScore \}\}/)
})
test('LIVE, FALLBACK and unavailable states remain visibly distinguishable', () => {
  const card = read('src/components/home/IndustryWeatherCard.vue')
  assert.match(card, /sourceStatus === 'FALLBACK'/); assert.match(card, /備援資料，非即時資料/); assert.match(card, /sourceStatus === 'LIVE'/); assert.match(card, /產業資料暫時無法取得/)
  for (const status of ['HOT', 'STABLE', 'COOLING', 'UNKNOWN']) assert.ok(card.includes(status))
})
test('indicators, source attribution, dates and responsive layout are present', () => {
  const card = read('src/components/home/IndustryWeatherCard.vue')
  for (const field of ['indicator.label', 'indicator.value', 'indicator.unit', 'indicator.changePercent', 'weather.dataAsOf', 'weather.sources[0].publisher', 'weather.sources[0].name']) assert.ok(card.includes(field))
  assert.match(card, /@media \(max-width: 640px\)/); assert.match(card, /@iconify\/vue/)
})
