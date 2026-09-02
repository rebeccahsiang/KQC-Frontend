import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const guide = read('src/components/home/HomeServiceGuideSection.vue')
const contact = read('src/config/contactServices.ts')

// HOME-R1B — Core Service Recognition Contract / labels remain derived from Contact service authority.
test('three homepage groups derive their service labels and Lucide icons from Contact authority', () => {
  assert.match(guide, /import \{ CONTACT_SERVICE_PILLARS, type ContactPillarCode, type ContactServicePillar \} from '@\/config\/contactServices'/)
  assert.match(guide, /type HomeAccordionPillarCode = Exclude<ContactPillarCode, 'OTHER'>/)
  assert.match(guide, /pillar is ContactServicePillar & \{ code: HomeAccordionPillarCode \}[\s\S]*pillar\.code !== 'OTHER'/)
  assert.match(guide, /CONTACT_SERVICE_PILLARS\.filter\(isHomeAccordionPillar\)/)
  assert.doesNotMatch(guide.slice(0, guide.indexOf('const serviceEntries')), /HOME_SERVICE_LABELS|💎|🚀|🤝/)
  for (const title of ['事業價值實現', '營運效能優化', '專業網絡支援']) assert.match(contact, new RegExp(title))
  for (const icon of ['lucide:gem', 'lucide:gauge', 'lucide:network']) assert.match(contact, new RegExp(icon))
})

test('Contact owns the exact four, eight, and five service-label mappings', () => {
  const groups = [...contact.matchAll(/\{ code: '(VALUE|OPERATIONS|NETWORK)'[\s\S]*?services: \[([\s\S]*?)\] \}/g)]
  assert.deepEqual(groups.map(([, code, services]) => [code, (services.match(/\{ code:/g) || []).length]), [['VALUE', 4], ['OPERATIONS', 8], ['NETWORK', 5]])
  const labelsByGroup = Object.fromEntries(groups.map(([, code, services]) => [code, [...services.matchAll(/label: '([^']+)'/g)].map((match) => match[1])]))
  assert.deepEqual(labelsByGroup, {
    VALUE: ['事業出售／轉讓', '事業購買／投資', '企業價值評估', '跨領域事業仲介'],
    OPERATIONS: ['智慧車隊派遣系統', '運輸業專屬網站設計', '其他行業網站設計', '停車位證明申辦', '停車場業者合作', '營業用車車額購買', '營業用車車額出售', '企業長期叫車等營運服務'],
    NETWORK: ['車險／產險顧問轉介', '特約公證／代書流程', '維修服務網絡', '專業司機轉介', '長期事業轉型支援'],
  })
  assert.doesNotMatch(guide, /label: '(?:事業出售|車隊調度|保險轉介)'/)
})

test('single-open accordion is accessible and branded while the superseded Other guidance stays absent', () => {
  assert.match(guide, /ref<HomeAccordionPillarCode \| null>\('VALUE'\)/)
  assert.match(guide, /:aria-expanded="active === pillar\.code"/)
  assert.match(guide, /:aria-controls="`home-service-\$\{pillar\.code\}`"/)
  assert.match(guide, /active = active === pillar\.code \? null : pillar\.code/)
  assert.match(guide, /<Transition name="home-accordion">[\s\S]*v-show="active === pillar\.code"/)
  assert.doesNotMatch(guide, /還不確定自己需要哪一項服務|聯絡我們選擇「其他」|accordion-help/)
  assert.equal((guide.match(/class="accordion-item-row"/g) || []).length, 1)
})

test('section heading uses Lucide and accordion titles share the right-card typography authority', () => {
  const styles = read('src/components/home/_homeSections.scss')
  assert.match(guide, /class="block-section-title text-center core-services-heading"><Icon icon="lucide:clipboard-list"/)
  assert.match(styles, /\.core-services-heading[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*center;/s)
  assert.match(styles, /\.core-services-heading > svg[^}]*color:\s*var\(--accent-active\);/s)
  assert.match(styles, /\.home-service-entry-card strong[^}]*font-size:\s*\$kqc-type-card-title;/s)
  assert.match(styles, /\.head-title[^}]*font-size:\s*\$kqc-type-card-title;[^}]*font-weight:\s*700;[^}]*line-height:\s*normal;/s)
  assert.doesNotMatch(styles, /\.accordion-category[^}]*\$kqc-type-card-title/s)
})

test('right-side entry cards retain their three existing launch contracts', () => {
  const entries = guide.slice(guide.indexOf('const serviceEntries'), guide.indexOf('</script>'))
  for (const pair of [['ai', 'AI 助理'], ['quick-service', '快速服務'], ['human', '真人諮詢']]) assert.match(entries, new RegExp(`id: '${pair[0]}'[^}]*label: '${pair[1]}'`))
  assert.match(guide, /<aside class="home-service-entry-column"[\s\S]*@click="emit\('open-panel', entry\.id\)"/)
})
