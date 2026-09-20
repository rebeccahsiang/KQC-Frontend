import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('homepage Industry Weather section mounts the approved Pulse and Summary children', () => {
  const section = read('src/components/home/HomeIndustryWeatherSection.vue')
  const home = read('src/views/HomeView.vue')

  assert.match(section, /import IndustryWeatherPulse from ['"]@\/components\/home\/IndustryWeatherPulse\.vue['"]/) 
  assert.equal((section.match(/<IndustryWeatherPulse\s*\/>/g) || []).length, 1)
  assert.match(section, /import IndustryStatisticsSummary from ['"]@\/components\/home\/IndustryStatisticsSummary\.vue['"]/) 
  assert.equal((section.match(/<IndustryStatisticsSummary\s*\/>/g) || []).length, 1)
  assert.doesNotMatch(section, /IndustryWeatherCard|industryStatisticsApi|industryWeatherApi|from ['"](?:@\/)?(?:api\/)?axios['"]|fetch\(/)
  assert.match(section, /class="home-industry-weather"/)
  assert.doesNotMatch(section, /INDUSTRY PULSE|pulse-eyebrow|pulse-subtitle|pulse-cta/)
  assert.match(home, /<HomeIndustryWeatherSection\s*\/>/)
  assert.doesNotMatch(home, /IndustryStatisticsSummary|industryStatisticsApi/)
})

test('summary homepage composition does not add direct data access or future history behavior', () => {
  const section = read('src/components/home/HomeIndustryWeatherSection.vue')
  const home = read('src/views/HomeView.vue')

  assert.doesNotMatch(`${section}\n${home}`, /stat\.thb\.gov\.tw|\/public\/industry-weather|\/public\/industry-statistics|history|getHistory|setInterval|setTimeout|watch\(|watchEffect\(/i)
})

