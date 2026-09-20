import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('pulse foundation is composed on the left without coupling to summary data', () => {
  const section = read('src/components/home/HomeIndustryWeatherSection.vue')
  const pulse = read('src/components/home/IndustryWeatherPulse.vue')
  const home = read('src/views/HomeView.vue')

  assert.match(section, /import IndustryWeatherPulse from ['"]@\/components\/home\/IndustryWeatherPulse\.vue['"]/) 
  assert.equal((section.match(/<IndustryWeatherPulse\s*\/>/g) || []).length, 1)
  assert.match(section, /<IndustryStatisticsSummary\s*\/>/)
  assert.doesNotMatch(home, /IndustryWeatherPulse/)
  assert.ok(pulse.includes('查看近期產業趨勢'))
  assert.match(pulse, /isDialogOpen/)
})

test('pulse foundation has no data access or premature trend scope', () => {
  const pulse = read('src/components/home/IndustryWeatherPulse.vue')

  assert.doesNotMatch(
    pulse,
    /industryWeatherApi|stat\.thb\.gov\.tw|data\.gov\.tw|fetch\(|setInterval|setTimeout|<svg\b|<canvas\b|chart\.js|echarts|apexcharts|login|regional/i,
  )
  assert.doesNotMatch(pulse, /hot|cold|sunny|rainy|good|bad|score/i)
})

test('pulse detail shell follows the public dialog accessibility boundary', () => {
  const pulse = read('src/components/home/IndustryWeatherPulse.vue')

  assert.match(pulse, /role="dialog"/)
  assert.match(pulse, /aria-modal="true"/)
  assert.match(pulse, /aria-labelledby="industry-pulse-dialog-title"/)
  assert.match(pulse, /id="industry-pulse-dialog-title"/)
  assert.match(pulse, /@click\.self="closeDialog"/)
  assert.match(pulse, /event\.key === 'Escape'/)
  assert.match(pulse, /closeButton\.value\?\.focus\(\)/)
  assert.match(pulse, /trigger\.value\?\.focus\(\)/)
})

