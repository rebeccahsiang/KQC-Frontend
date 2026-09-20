import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const api = () => read('src/api/industryStatistics.ts')

test('Industry Statistics API client uses the shared Axios instance and production paths', () => {
  const source = api()
  assert.match(source, /import api from ['"]\.\/axios['"]/) 
  assert.match(source, /getSummary:\s*\(\)\s*=>[\s\S]*?\/public\/industry-statistics\/summary/)
  assert.match(source, /getHistory:\s*\([\s\S]*?\)\s*=>[\s\S]*?\/public\/industry-statistics\/history/)
  assert.doesNotMatch(source, /data\.gov\.tw|stat\.thb\.gov\.tw|fetch\(/)
  assert.doesNotMatch(source, /industry-weather/)
})

test('query parameters are optional and undefined values are omitted', () => {
  const source = api()
  assert.match(source, /from\?: string/)
  assert.match(source, /to\?: string/)
  assert.match(source, /from !== undefined/)
  assert.match(source, /to !== undefined/)
  assert.doesNotMatch(source, /new Date\(|getFullYear\(|2026-07|2026-08|2026-09/)
})

test('contract types preserve status, category, nullable and percentage semantics', () => {
  const source = api()
  for (const status of ['LIVE', 'CACHED', 'UNAVAILABLE']) assert.match(source, new RegExp(`'${status}'`))
  for (const category of ['CAR_RENTAL', 'TRUCKING', 'CONTAINER_TRUCKING']) assert.match(source, new RegExp(category))
  assert.match(source, /summary: IndustryStatisticsSummary \| null/)
  assert.match(source, /history: IndustryStatisticsHistory \| null/)
  assert.match(source, /companiesPercent: number \| null/)
  assert.match(source, /vehiclesPercent: number \| null/)
  assert.match(source, /previous: IndustryStatisticsMetricPoint \| null/)
})
