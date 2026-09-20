import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('homepage Industry Weather section mounts only the summary foundation child', () => {
  const section = read('src/components/home/HomeIndustryWeatherSection.vue')
  const home = read('src/views/HomeView.vue')

  assert.match(section, /import IndustryStatisticsSummary from ['"]@\/components\/home\/IndustryStatisticsSummary\.vue['"]/) 
  assert.equal((section.match(/<IndustryStatisticsSummary\s*\/>/g) || []).length, 1)
  assert.doesNotMatch(section, /IndustryWeatherCard|industryStatisticsApi|industryWeatherApi|from ['"](?:@\/)?(?:api\/)?axios['"]|fetch\(/)
  assert.match(section, /class="home-industry-weather"/)
  assert.match(section, /INDUSTRY PULSE/)
  assert.match(section, /交通運輸產業晴雨圖/)
  assert.match(section, /以公開資料掌握近期產業動向。/)
  assert.match(home, /<HomeIndustryWeatherSection\s*\/>/)
  assert.doesNotMatch(home, /IndustryStatisticsSummary|industryStatisticsApi/)
})

test('summary homepage composition does not add direct data access or future history behavior', () => {
  const section = read('src/components/home/HomeIndustryWeatherSection.vue')
  const home = read('src/views/HomeView.vue')

  assert.doesNotMatch(`${section}\n${home}`, /stat\.thb\.gov\.tw|\/public\/industry-weather|\/public\/industry-statistics|history|getHistory|setInterval|setTimeout|watch\(|watchEffect\(/i)
})
