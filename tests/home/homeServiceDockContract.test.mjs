import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('desktop dock owns exactly three canonical service launchers', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  const itemsStart = dock.indexOf('const dockItems')
  const itemsBodyStart = dock.indexOf('= [', itemsStart) + 3
  const itemsBodyEnd = dock.indexOf(']\nconst aiPrompts', itemsBodyStart)
  const items = dock.slice(itemsBodyStart, itemsBodyEnd)
  const launchers = [...items.matchAll(/\{ id: '([^']+)', icon: '([^']+)', label: '([^']+)' \}/g)]
    .map((match) => ({ id: match[1], icon: match[2], label: match[3] }))

  assert.ok(itemsStart >= 0 && itemsBodyStart > itemsStart && itemsBodyEnd > itemsBodyStart)
  assert.deepEqual(launchers, [
    { id: 'ai', icon: 'lucide:bot', label: 'AI 助理' },
    { id: 'quick-service', icon: 'lucide:messages-square', label: '快速服務' },
    { id: 'human', icon: 'lucide:phone-call', label: '真人諮詢' },
  ])
  assert.equal((dock.match(/class="widget-tab-btn"/g) ?? []).length, 1)
  assert.doesNotMatch(dock, /home-service-panel__close[^>]*widget-tab-btn|home-service-panel__actions[^>]*widget-tab-btn/)
  assert.doesNotMatch(dock, /立即互動/)
  assert.match(dock, /type ServicePanel = 'ai' \| 'quick-service' \| 'human'/)
  assert.match(dock, /<Icon :icon="item\.icon" class="tab-icon" aria-hidden="true"/)
  assert.doesNotMatch(items, /🤖|💬|📞/)
  assert.doesNotMatch(dock, /ref<ServicePanel \| null>/)
})

test('page cards and floating dock share the single Home-owned panel state', () => {
  const home = read('src/views/HomeView.vue')
  const guide = read('src/components/home/HomeServiceGuideSection.vue')
  const dock = read('src/components/home/HomeServiceDock.vue')
  const combined = `${home}\n${guide}\n${dock}`

  assert.equal((combined.match(/ref<ServicePanel \| null>\(null\)/g) ?? []).length, 1)
  assert.match(home, /<HomeServiceGuideSection :active-panel="activePanel" @open-panel="openServicePanel"/)
  assert.match(home, /<HomeServiceDock :active-panel="activePanel" @update:active-panel="activePanel = \$event"/)
  assert.match(guide, /const serviceEntries:/)
  for (const entry of [
    ["'ai'", 'lucide:bot', 'AI 助理'], ["'quick-service'", 'lucide:messages-square', '快速服務'], ["'human'", 'lucide:phone-call', '真人諮詢'],
  ]) assert.match(guide, new RegExp(`id: ${entry[0]}[^}]*icon: '${entry[1]}'[^}]*label: '${entry[2]}'`))
  assert.match(guide, /<Icon :icon="entry\.icon" class="home-service-entry-card__icon" aria-hidden="true"/)
  assert.doesNotMatch(guide.slice(guide.indexOf('const serviceEntries'), guide.indexOf('</script>')), /🤖|💬|📞/)
  assert.match(guide, /class="home-service-entry-card"/)
  assert.equal((guide.match(/class="home-service-entry-grid"/g) ?? []).length, 1)
  assert.match(guide, /<aside class="home-service-entry-column"[^>]*>[\s\S]*class="home-service-entry-grid"/)
  assert.match(guide, /@click="emit\('open-panel', entry\.id\)"/)
  assert.equal((combined.match(/id="home-service-panel"/g) ?? []).length, 1)
})

test('dock and panel are separate accessible surfaces with deterministic closing', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  assert.match(dock, /class="fixed-right-widget-panel"/)
  assert.match(dock, /class="home-service-panel"/)
  assert.match(dock, /:aria-expanded="props\.activePanel === item\.id"/)
  assert.match(dock, /aria-controls="home-service-panel"/)
  assert.match(dock, /aria-label="關閉服務面板"/)
  assert.match(dock, /props\.activePanel === panel \? null : panel/)
  assert.match(dock, /event\.key === 'Escape'/)
  assert.match(dock, /window\.addEventListener\('keydown', handleEscape\)/)
  assert.equal((dock.match(/v-if="props\.activePanel"/g) ?? []).length, 1)
})

test('three panels expose bounded content without inline network implementation', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  for (const prompt of ['不確定是否符合設立條件？', '想了解牌照買賣流程？', '想獲得 24 小時即時解答']) assert.ok(dock.includes(prompt))
  for (const action of ['預約諮詢', '服務介紹', '提出問題', '常見問題解答', '尋找優惠', '近期活動訊息']) assert.ok(dock.includes(action))
  for (const category of ['資產買賣', '網站架設', '車額買賣', '停車位證明']) assert.ok(dock.includes(category))
  for (const contact of ['直接撥打', '請與我聯絡']) assert.ok(dock.includes(contact))
  assert.match(dock, /const quickServiceActions: QuickServiceAction\[\]/)
  assert.match(dock, /const humanServiceOptions: HumanServiceOption\[\]/)
  assert.match(dock, /from '@\/api\/publicHumanConsultations'/)
  assert.match(dock, /await createHumanConsultationRequest\(/)
  assert.doesNotMatch(dock, /\baxios\b|fetch\s*\(|['"`]\/api\/|\/v1\/admin\/|\/v1\/crm\/|https?:\/\/|openai|line\.me|02\) 2345-6789/i)
})

test('Quick Service actions map only to approved frontend behavior', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  const promo = read('src/components/home/HomePromoCarouselSection.vue')
  const header = read('src/components/layout/FrontHeader.vue')
  const faq = read('src/composables/usePublicFaq.ts')
  const router = read('src/router/index.ts')
  const actions = dock.slice(dock.indexOf('const quickServiceActions'), dock.indexOf('const humanServiceOptions'))
  const handler = dock.slice(dock.indexOf('const handleQuickServiceAction'), dock.indexOf('const handleEscape'))

  assert.equal((actions.match(/\{ id:/g) ?? []).length, 6)
  assert.equal((actions.match(/label: '預約諮詢'/g) ?? []).length, 1)
  assert.match(actions, /id: 'consultation', label: '預約諮詢', type: 'panel', panel: 'human', enabled: true/)
  assert.doesNotMatch(actions, /id: 'consultation'[^\n]*(?:target: '\/contact'|type: 'route')/)
  assert.match(actions, /label: '服務介紹', type: 'home-anchor', target: '#featured-services', enabled: true/)
  assert.match(actions, /label: '提出問題', type: 'panel', panel: 'ai', enabled: true/)
  assert.match(actions, /label: '常見問題解答', type: 'faq', enabled: true/)
  assert.match(actions, /label: '尋找優惠', type: 'unavailable', enabled: false/)
  // D2H — Quick Service KQC News Navigation protects the canonical deep link without adding Article fetching here.
  // D2H-R2 — Quick Service KQC News Scroll Intent remains source-specific through the canonical target hash.
  assert.match(actions, /label: '近期活動訊息', type: 'route', target: '\/insights', query: \{ category: 'KQC_NEWS' \}, hash: '#insights-articles', enabled: true/)
  assert.match(promo, /<section id="featured-services" class="home-promo-section"/)
  assert.match(dock, /router\.push\(\{ path: '\/', hash: '#featured-services' \}\)/)
  assert.match(handler, /closePanel\(\)[\s\S]*router\.push\(\{ path: action\.target, query: action\.query, hash: action\.hash \}\)/)
  assert.doesNotMatch(handler, /window\.location|fetch\s*\(|publicArticlesApi/)
  assert.match(dock, /scrollIntoView\(\{ behavior, block: 'start' \}\)/)
  assert.match(dock, /emit\('update:activePanel', action\.panel\)/)
  assert.match(handler, /action\.type === 'panel' && action\.panel[\s\S]*emit\('update:activePanel', action\.panel\)/)
  assert.doesNotMatch(handler, /action\.id === 'consultation'|openReservation|openHumanConsultation/)
  assert.match(dock, /const \{ openFaq \} = usePublicFaq\(\)/)
  assert.match(header, /const \{ openFaq \} = usePublicFaq\(\)/)
  assert.match(header, /class="control-btn faq-btn"[^>]*@click="openFaq"/)
  assert.match(faq, /const isFaqOpen = ref\(false\)/)
  assert.match(router, /path: '\/contact'[^\n]*ContactView\.vue/)
  assert.doesNotMatch(`${dock}\n${header}\n${faq}`, /\/admin\/messages\/ai-faq|\/events|\/offers|axios|fetch\(|line\.me|openai/i)
})

test('old demo cards are removed with their exclusive wrapper', () => {
  const guide = read('src/components/home/HomeServiceGuideSection.vue')
  const styles = read('src/components/home/_homeSections.scss')
  for (const label of ['誠信保密交易', '秒級 AI 響應', '資深顧問協助']) assert.doesNotMatch(guide, new RegExp(label))
  assert.doesNotMatch(guide, /features|right-column-30|sticky-card-stack|brand-feature-card/)
  assert.doesNotMatch(styles, /\.right-column-30|\.sticky-card-stack|\.brand-feature-card/)
})

test('panel overlays desktop, stays hidden on mobile, and respects reduced motion', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  const styles = read('src/components/home/_homeSections.scss')
  const mobileStart = styles.lastIndexOf('@media (max-width: 768px)')
  const mobileEnd = styles.lastIndexOf('@media (max-width: 480px)')
  const mobile = styles.slice(mobileStart, mobileEnd)
  assert.match(styles, /\.home-service-panel\s*\{[^}]*position:\s*fixed;[^}]*bottom:\s*1\.5rem;/s)
  assert.match(styles, /\.fixed-right-widget-panel\s*\{[^}]*position:\s*fixed;[^}]*right:\s*0;[^}]*top:\s*50%;[^}]*transform:\s*translateY\(-50%\);/s)
  assert.match(styles, /&:hover, &:focus-within \{ transform: translateX\(-1px\) translateY\(calc\(-50% - 3px\)\) rotate\(-0\.2deg\); \}/)
  assert.match(styles, /&:hover \.tab-icon, &:focus-visible \.tab-icon \{ animation: none; transform: translateY\(-2px\) scale\(1\.05\); \}/)
  assert.match(styles, /\.tab-icon \{[^}]*animation: home-service-icon-idle 5s/s)
  assert.match(styles, /\.home-service-entry-card__icon \{[^}]*animation: home-service-icon-idle 5s/s)
  assert.match(styles, /\.widget-tab-btn:nth-child\(2\) \.tab-icon \{ animation-delay: -1\.7s; \}/)
  assert.match(styles, /@keyframes home-service-icon-idle[\s\S]*transform:[^;}]*scale\(/)
  const motion = styles.match(/\.service-panel-enter-from[^}]*opacity:\s*0;[^}]*translateY\(([\d.]+)rem\)/s)
  assert.ok(motion && Number(motion[1]) >= 3)
  assert.match(styles, /\.service-panel-enter-active[^}]*0\.32s[^}]*cubic-bezier/s)
  assert.match(mobile, /\.home-service-workspace\s*\{\s*display:\s*none;\s*\}/)
  assert.match(mobile, /\.fixed-right-widget-panel\s*\{\s*display:\s*none;\s*\}/)
  assert.match(mobile, /\.home-service-panel\s*\{\s*display:\s*none;\s*\}/)
  assert.match(styles, /\.home-service-guide\s*\{[^}]*grid-template-columns:\s*minmax\(0, 7fr\) minmax\(15rem, 3fr\);/s)
  assert.match(styles, /\.home-service-entry-grid\s*\{[^}]*grid-template-columns:\s*1fr;/s)
  assert.match(mobile, /\.home-service-guide\s*\{\s*grid-template-columns:\s*1fr;\s*\}/)
  assert.doesNotMatch(mobile, /\.home-service-entry-(?:column|grid|card)[^{]*\{[^}]*display:\s*none/s)
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.service-panel-enter-active[^}]*transition:\s*none;/)
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.tab-icon, \.home-service-entry-card__icon \{ animation: none !important; \}/)
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.fixed-right-widget-panel:hover, \.fixed-right-widget-panel:focus-within \{ transform: translateY\(-50%\); \}/)
  assert.doesNotMatch(dock, /@(?:mouse|pointer)move|addEventListener\(\s*['"](?:mouse|pointer)move['"]/i)
  assert.doesNotMatch(dock, /(?:mouse|pointer)(?:X|Y|Coordinates|Position)/)
  assert.doesNotMatch(`${styles}\n${read('src/views/HomeView.vue')}`, /MobileServiceDock|BottomSheet|mobile-service-dock/)
})
