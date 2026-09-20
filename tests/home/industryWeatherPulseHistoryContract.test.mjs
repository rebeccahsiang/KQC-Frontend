import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const root = new URL('../../', import.meta.url)
const read = (p) => readFileSync(new URL(p, root), 'utf8')
test('pulse history is lazy and capped to recent actual points', () => {
  const pulse = read('src/components/home/IndustryWeatherPulse.vue'); const trend = read('src/components/home/IndustryWeatherTrend.vue')
  assert.match(pulse, /const historyRequested = ref\(false\)/); assert.match(pulse, /industryStatisticsApi\.getHistory\(\)/); assert.match(pulse, /if \(!historyRequested\.value\)/)
  assert.doesNotMatch(pulse, /getHistory\(\{/); assert.equal((pulse.match(/industryStatisticsApi\.getHistory\(\)/g) || []).length, 1)
  assert.match(trend, /sort\(\(a, b\) => a\.period\.localeCompare\(b\.period\)\)\.slice\(-36\)/); assert.doesNotMatch(trend, /Array\(36\)|interpolat/i)
})
test('pulse selectors and trend metrics remain scoped', () => {
  const pulse = read('src/components/home/IndustryWeatherPulse.vue'); const trend = read('src/components/home/IndustryWeatherTrend.vue')
  for (const key of ['CAR_RENTAL','TRUCKING','CONTAINER_TRUCKING']) assert.match(pulse, new RegExp(key)); assert.match(pulse, /v-for="category in categoryOptions"/); assert.match(pulse, /aria-pressed/)
  assert.equal((trend.match(/<svg /g) || []).length, 1); assert.match(pulse, /selectedMetric = ref<'companies' \| 'vehicles'>\('companies'\)/); assert.match(pulse, /selectedMetric === 'companies'/); assert.match(pulse, /selectedMetric === 'vehicles'/); assert.match(trend, /props\.metric/); assert.match(trend, /@pointermove="selectPoint"/); assert.match(trend, /@pointerleave="hoveredIndex = null"/); assert.match(trend, /niceStep/); assert.match(trend, /formatNumber/); assert.match(trend, /shortPeriod/); assert.match(trend, /availableRange/); assert.doesNotMatch(trend, /2023-08|2026-07|industryStatisticsApi|fetch\(|axios|setInterval|setTimeout|login|authStore|useAuthStore|openAuthModal|regional|chart\.js|echarts|apexcharts/i)
})
test('pulse preserves explicit states and accessibility', () => {
  const pulse = read('src/components/home/IndustryWeatherPulse.vue')
  for (const token of ['historyLoading', 'historyRequestError', "historyStatus === 'UNAVAILABLE'", "historyStatus === 'CACHED'", '!history.complete', 'role="dialog"', 'aria-modal="true"']) {
    assert.ok(pulse.includes(token))
  }
  assert.match(pulse, /event\.key === 'Escape'/); assert.match(pulse, /@click\.self="closeDialog"/)
})


