import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('summary foundation uses the Industry Statistics API and remains isolated from weather', () => {
  const component = read('src/components/home/IndustryStatisticsSummary.vue')
  const api = read('src/api/industryStatistics.ts')
  const home = read('src/views/HomeView.vue')
  const weather = read('src/components/home/IndustryWeatherCard.vue')

  assert.match(component, /from ['"]@\/api\/industryStatistics['"]/) 
  assert.match(component, /industryStatisticsApi\.getSummary\(\)/)
  assert.doesNotMatch(component, /industryWeatherApi|\/public\/industry-weather|stat\.thb\.gov\.tw|fetch\(/)
  assert.doesNotMatch(api, /stat\.thb\.gov\.tw|fetch\(/)
  assert.doesNotMatch(home, /IndustryStatisticsSummary/)
  assert.match(weather, /industryWeatherApi\.get\(\)/)
})

test('summary foundation exposes explicit request lifecycle and backend statuses', () => {
  const component = read('src/components/home/IndustryStatisticsSummary.vue')
  const api = read('src/api/industryStatistics.ts')

  for (const state of ['loading', 'requestError', 'status', 'refreshInFlight', 'summary']) {
    assert.match(component, new RegExp(`\\b${state}\\b`))
  }
  assert.match(component, /type IndustryStatisticsStatus/)
  assert.match(component, /status\.value = response\.data\.status/)
  assert.match(api, /IndustryStatisticsStatus = 'LIVE' \| 'CACHED' \| 'UNAVAILABLE'/)
  assert.match(component, /status === 'UNAVAILABLE'/)
  assert.match(component, /v-else-if="summary"/)
  assert.match(component, /requestError\.value = null/)
  assert.match(component, /v-else-if="requestError"/)
  assert.match(component, /summary = ref<IndustryStatisticsSummary \| null>\(null\)/)
  assert.match(component, /summary\.source\.officialPeriod/)
  assert.match(component, /summary\.source\.officialPeriod/)
  assert.match(component, /交通部公路局・機動車輛登記數統計/)
  assert.match(component, /<span class="summary-meta__source">交通部公路局・機動車輛登記數統計<\/span>/)
  assert.doesNotMatch(component, /<a[^>]*summary-meta__source|https:\/\/data\.gov\.tw\/dataset\/14208|target="_blank"|rel="noopener noreferrer"/)
  assert.match(component, /<template v-for="card in categoryCards"[\s\S]*<article v-if="card\.category"/)
  assert.match(component, /CAR_RENTAL[\s\S]*TRUCKING[\s\S]*CONTAINER_TRUCKING/)
  assert.match(component, /category\.categoryLabel/)
  assert.match(component, /category\.latest\.companies/)
  assert.match(component, /category\.latest\.vehicles/)
  for (const field of ['companiesAbsolute', 'companiesPercent', 'vehiclesAbsolute', 'vehiclesPercent']) assert.match(component, new RegExp(`category\\.change\\.${field}|card\\.category\\.change\\.${field}`))
  assert.match(component, /refreshInFlight/)
  assert.doesNotMatch(component, /companies:\s*0|vehicles:\s*0|companies\s*=\s*0|vehicles\s*=\s*0/)
  assert.doesNotMatch(component, /3-year|three-year|line chart|distribution bar|history|getHistory|<Dialog|v-html/i)
  assert.doesNotMatch(component, /分類數|背景更新中/)
  assert.doesNotMatch(component, /<h2[^>]*>產業統計資料<\/h2>|summary-source|查看官方來源|官方資料期間：|summary\.source\.title|2026-07/)
  assert.match(component, /業者較上月|車輛較上月/)
  assert.match(component, /category-card__changes/)
})

test('summary foundation performs one mount-triggered request without polling or history', () => {
  const component = read('src/components/home/IndustryStatisticsSummary.vue')

  assert.match(component, /onMounted\(loadSummary\)/)
  assert.equal((component.match(/industryStatisticsApi\.getSummary\(\)/g) || []).length, 1)
  assert.doesNotMatch(component, /setInterval|setTimeout|history|getHistory|chart\.js|vue-chartjs|echarts|apexcharts|pinia/i)
})
