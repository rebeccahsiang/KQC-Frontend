import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const persona = read('src/components/home/HomePersonasSection.vue')
const styles = read('src/components/home/_homeSections.scss')
const personaStyles = styles.slice(styles.indexOf('/* HOME-R1C'), styles.indexOf('.insights-2col-grid'))

// HOME-R1C — Persona Foundation Contract / six static situations own one compact responsive strip.
test('heading and exactly six locked persona situations are present', () => {
  assert.match(persona, /lucide:users-round[\s\S]*我們服務的對象/)
  assert.match(persona, /我們始終以客戶為先/)
  const entries = [...persona.matchAll(/\{ title: '([^']+)', description: '([^']+)', image: (\w+) \}/g)].map(([, title, description, image]) => ({ title, description, image }))
  assert.deepEqual(entries, [
    { title: '退休傳承', description: '想把多年事業安心交棒', image: 'retirementSuccessionImage' },
    { title: '經營業主', description: '想讓公司經營得更穩更有效率', image: 'businessOwnerImage' },
    { title: '準備創業', description: '想進入運輸產業，卻不知道從哪開始', image: 'startupFounderImage' },
    { title: '轉型升級', description: '想導入網站、系統與數位工具', image: 'digitalTransformationImage' },
    { title: '停車場業者', description: '有場地資源，希望找合作機會', image: 'parkingOperatorImage' },
    { title: '駕駛夥伴們', description: '尋找工作、車隊或合作機會', image: 'professionalDriverImage' },
  ])
})

test('persona presentation uses six semantic images without duplicated placeholder decoration', () => {
  assert.match(persona, /import \{ Icon \} from '@iconify\/vue'/)
  assert.match(persona, /<Icon icon="lucide:users-round" aria-hidden="true"/)
  assert.match(persona, /<img :src="persona\.image" :alt="persona\.title" \/>/)
  assert.equal((persona.match(/from '@\/assets\/images\/home\/personas\//g) ?? []).length, 6)
  assert.match(styles, /\.home-persona__visual img\s*\{[^}]*display:\s*block;[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*aspect-ratio:\s*1;[^}]*object-fit:\s*contain;/s)
  assert.doesNotMatch(persona, /persona\.icon|home-persona__laurel|home-persona__seal|<svg/)
  assert.doesNotMatch(personaStyles, /home-persona__laurel|home-persona__seal|inset:\s*0 0 0/)
  assert.doesNotMatch(persona, /👥|placeholderPersonas|customer-large-card|cust-badge|>服務對象<|<button|<router-link|@click|to="/i)
  assert.doesNotMatch(styles, /customer-4col-large-grid|customer-large-card|min-height:\s*220px/)
})

test('responsive authority is six columns, then three and two without giant height', () => {
  assert.match(styles, /\.home-personas__grid \{[^}]*grid-template-columns:\s*repeat\(6, minmax\(0, 1fr\)\);/s)
  const tabletRules = styles.slice(styles.indexOf('@media (max-width: 1024px)', styles.indexOf('/* HOME-R1C')), styles.indexOf('@media (max-width: 768px)', styles.indexOf('/* HOME-R1C')))
  const mobileRules = styles.slice(styles.indexOf('@media (max-width: 768px)', styles.indexOf('/* HOME-R1C')), styles.indexOf('@media (prefers-reduced-motion: reduce)', styles.indexOf('/* HOME-R1C')))
  assert.match(tabletRules, /\.home-personas__grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s)
  assert.match(mobileRules, /\.home-personas__grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s)
  assert.doesNotMatch(personaStyles, /min-height|height:\s*(?:[2-9]\d{2}px|\d+vh)/)
})
