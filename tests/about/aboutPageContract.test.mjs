import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const view = read('src/views/CompanyView.vue')
const router = read('src/router/index.ts')
const presentationSource = view.slice(0, view.indexOf('<style'))

// ABOUT-R1B — Final Company Page Contract / ordered content, media, interaction and evidence authority remain About-local.
test('existing Company route owns the exact eight-section final presentation order', () => {
  assert.match(router, /path: '\/company', name: 'Company', component: \(\) => import\('@\/views\/CompanyView\.vue'\)/)
  const authorities = ['company-hero', 'company-origin', 'company-film', 'aria-labelledby="industry-title"', 'aria-labelledby="journey-title"', 'company-support', 'company-values', 'company-closing']
  let previous = -1
  for (const authority of authorities) {
    const position = view.indexOf(authority)
    assert.ok(position > previous, `${authority} must follow the preceding section`)
    previous = position
  }
  assert.match(view, /<main class="company-view">/)
})

test('Hero, origin and existing pillars retain approved brand content', () => {
  assert.match(view, /<h1 id="company-title" class="company-sr-only">我們不只理解交易，更理解一段事業的重量<\/h1>/)
  assert.match(view, /我們的起點：看見運輸業的時代十字路口/)
  for (const heading of ['我們懂這個產業', '我們陪的是一段事業']) assert.match(view, new RegExp(`<h2[^>]*>${heading}</h2>`))
  for (const value of ['交通運輸產業需求理解', '事業交易與營運需求整合', '市場、法規與專業資訊整理', '先理解需求，再提出方案', '從交易延伸至營運與資源整合', '陪伴事業傳承、創業與轉型']) assert.match(view, new RegExp(value))
  assert.match(view, /三爵資訊/)
  assert.doesNotMatch(view, /三瑋資訊/)
  assert.doesNotMatch(presentationSource, /第一名|全台首創|市占率|成交(?:量|率)|客戶數|成立\s*\d+|\d+\s*年經驗|\d+%|認證|獎項/)
})

test('approved image and native Brand Film authorities are exact', () => {
  for (const asset of ['about-hero.png', 'industry-expertise.png', 'business-journey.png']) assert.match(view, new RegExp(`src="/images/about/${asset.replace('.', '\\.')}"`))
  for (const asset of ['industry-insight.png', 'professional-matching.png', 'risk-control.png', 'digital-thinking.png', 'cross-industry-resources.png', 'full-journey-support.png']) assert.match(view, new RegExp(`image: '/images/about/${asset.replace('.', '\\.')}'`))
  assert.equal((view.match(/<img\b/g) ?? []).length, 4)
  assert.match(view, /<video controls playsinline preload="metadata">/)
  assert.match(view, /<source src="\/videos\/about\/about-brand\.mp4" type="video\/mp4">目前瀏覽器無法播放此影片。/)
  assert.doesNotMatch(view, /<video[^>]*\b(?:autoplay|loop)\b|https?:\/\/|data:image/)
  assert.match(view, /\.company-film__frame \{[^}]*width: min\(100%, 55rem\)[^}]*aspect-ratio: 16 \/ 9[^}]*margin-inline: auto[^}]*overflow: hidden[^}]*border-radius: 1\.25rem/s)
  assert.match(view, /\.company-film video \{[^}]*display: block[^}]*width: 100%[^}]*height: 100%[^}]*object-fit: contain/s)
  assert.doesNotMatch(view, /\.company-film video \{[^}]*object-fit: cover/s)
})

test('advisory process and existing closing route authority remain unchanged', () => {
  for (const step of ['理解需求', '整合方案', '陪伴執行']) assert.match(view, new RegExp(step))
  assert.match(view, /<ol class="company-support__grid">/)
  assert.match(view, /:to="\{ name: 'Contact' \}"[^>]*>與我們聊聊/)
  assert.match(view, /:to="\{ name: 'Products' \}"[^>]*>查看服務/)
  assert.match(router, /path: '\/contact', name: 'Contact'/)
  assert.match(router, /path: '\/products', name: 'Products'/)
})

test('brand-value deck owns exactly six canonical image values in approved order', () => {
  const valuesSource = view.slice(view.indexOf('const brandValues'), view.indexOf('const brandValueSwiper'))
  const values = [...valuesSource.matchAll(/\{ image: '([^']+)', icon: '(lucide:[^']+)', title: '([^']+)', lead: '([^']+)', description: '([^']+)' \}/g)]
  assert.deepEqual(values.map(([, image, icon, title]) => ({ image, icon, title })), [
    { image: '/images/about/industry-insight.png', icon: 'lucide:chart-no-axes-combined', title: '產業洞察' },
    { image: '/images/about/professional-matching.png', icon: 'lucide:handshake', title: '專業媒合' },
    { image: '/images/about/risk-control.png', icon: 'lucide:shield-check', title: '風險把關' },
    { image: '/images/about/digital-thinking.png', icon: 'lucide:monitor-cog', title: '數位思維' },
    { image: '/images/about/cross-industry-resources.png', icon: 'lucide:network', title: '跨界資源' },
    { image: '/images/about/full-journey-support.png', icon: 'lucide:route', title: '全程陪伴' },
  ])
  assert.equal(values.length, 6)
  for (const text of ['懂技術，更懂交通運輸產業真正面對的問題。', '精準連結需求，讓事業價值找到合適的承接者。', '專業把關，讓重要決定更安心。', '用數據與科技，讓決策更有依據。', '串聯產業資源，開創更多合作可能。', '陪伴的，不只是一筆交易，而是一段事業。']) assert.match(valuesSource, new RegExp(text))
  for (const text of ['深耕交通運輸產業，從靠行生態、牌照法規到營運管理與市場需求，以產業視角整理複雜資訊，協助經營者更清楚地判斷下一步。', '透過產業網絡與需求理解，協助有意出售的業主與誠意買家進行媒合，提升溝通與交易效率。', '透過產業法規理解、交易資訊整理與必要的專業協作，協助客戶掌握重要事項，降低複雜交易過程中的不確定性。', '將數據分析與數位工具融入市場判斷、企業價值評估與需求媒合，讓重要決策建立在更清楚的資訊基礎上。', '依照不同經營需求，串聯交通運輸上下游與跨領域專業資源，協助企業建立合作橋樑，探索新的商業可能。', '從理解需求、整理方向到後續執行，我們以夥伴關係陪伴客戶面對事業傳承、轉型與下一階段的重要決定。']) assert.match(valuesSource, new RegExp(text))
  assert.match(view, /aria-label="上一項品牌價值" @click="previousValue"/)
  assert.match(view, /aria-label="下一項品牌價值" @click="nextValue"/)
})

test('official Swiper Cards Effect owns circular interaction without autoplay', () => {
  assert.match(view, /import \{ Swiper, SwiperSlide \} from 'swiper\/vue'/)
  assert.match(view, /import \{ A11y, EffectCards, Keyboard, Pagination \} from 'swiper\/modules'/)
  assert.match(view, /import 'swiper\/css'[\s\S]*import 'swiper\/css\/effect-cards'[\s\S]*import 'swiper\/css\/pagination'/)
  assert.match(view, /<Swiper[^>]*effect="cards"[^>]*:rewind="true"/)
  assert.match(view, /:cards-effect="\{ perSlideOffset: 36, perSlideRotate: 2, rotate: true, slideShadows: false \}"/)
  assert.match(view, /:pagination="\{ clickable: true, bulletElement: 'button' \}"/)
  assert.match(view, /brandValueSwiper\.value\?\.slidePrev\(\)[\s\S]*brandValueSwiper\.value\?\.slideNext\(\)/)
  assert.doesNotMatch(view, /<Swiper[^>]*:loop="true"|activeIndex|realIndex|slideToLoop/)
  assert.doesNotMatch(view, /<Swiper[^>]*\bautoplay\b|setInterval|setTimeout|EffectCoverflow|EffectCube|EffectFade/i)
})

test('philosophy copy remains exact and evidence-safe', () => {
  for (const text of ['OUR PHILOSOPHY', '我們的經營理念', '以夥伴之心，行專業之事，創三贏之局', '我們不將自己視為單純的服務供應商，而是客戶事業發展過程中的夥伴。', '我們重視的不只是一次交易的完成，而是透過專業、信任與長期合作，', '為客戶、合作夥伴與產業生態創造共榮共好的價值。']) assert.match(presentationSource, new RegExp(text))
})

test('About-local density authority constrains editorial, media, support and CTA footprint', () => {
  assert.match(view, /\.company-shell \{[^}]*82rem/)
  assert.match(view, /\.company-hero__frame \{[^}]*90rem/)
  assert.match(view, /\.company-pillar__media \{[^}]*41rem[^}]*aspect-ratio: 4 \/ 3/s)
  assert.match(view, /\.company-points li \{[^}]*min-height: 4rem/s)
  assert.match(view, /\.company-support \{[^}]*padding: clamp\(1\.75rem, 3vw, 2\.5rem\)/s)
  assert.match(view, /\.company-closing \{[^}]*padding: clamp\(2\.1rem, 4vw, 3\.5rem\)/s)
})

test('responsive accessibility remains motion-safe', () => {
  assert.match(view, /@media \(max-width: 900px\)[\s\S]*\.company-pillar, \.company-pillar--reverse \{ grid-template-columns: 1fr;/)
  assert.match(view, /@media \(max-width: 640px\)/)
  assert.match(view, /@media \(prefers-reduced-motion: reduce\)[^}]*\.company-values__swiper[^}]*transition-duration: 0ms !important/s)
  assert.match(view, /<Icon[^>]*aria-hidden="true"/)
  assert.doesNotMatch(view, /🤖|💬|📞|🚚|🏢|🤝|✨|🏆|axios|fetch\(|\/api\//)
})
