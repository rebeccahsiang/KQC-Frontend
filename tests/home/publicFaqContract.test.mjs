import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('one shared public FAQ surface is owned by PublicLayout', () => {
  const layout = read('src/components/layout/PublicLayout.vue')
  const header = read('src/components/layout/FrontHeader.vue')
  const dock = read('src/components/home/HomeServiceDock.vue')
  const modal = read('src/components/public/PublicFaqModal.vue')

  assert.match(layout, /import PublicFaqModal from '@\/components\/public\/PublicFaqModal\.vue'/)
  assert.equal((layout.match(/<PublicFaqModal\s*\/>/g) ?? []).length, 1)
  assert.doesNotMatch(`${header}\n${dock}`, /<PublicFaqModal/)
  assert.match(header, /const \{ openFaq \} = usePublicFaq\(\)/)
  assert.match(dock, /const \{ openFaq \} = usePublicFaq\(\)/)
  assert.match(modal, /const \{ isFaqOpen, closeFaq \} = usePublicFaq\(\)/)
})

test('FAQ owns exactly five approved local question and answer pairs', () => {
  const modal = read('src/components/public/PublicFaqModal.vue')
  const items = modal.slice(modal.indexOf('const publicFaqItems'), modal.indexOf('const router'))

  assert.equal((items.match(/\n\s+id: '/g) ?? []).length, 5)
  for (const question of [
    '如何開始使用三爵資訊的服務？',
    '可以先了解服務內容再決定是否諮詢嗎？',
    '如何尋找適合我的交通運輸相關服務？',
    '產業資訊與最新動態可以在哪裡查看？',
    'AI 助理目前可以提供哪些協助？',
  ]) assert.ok(items.includes(question))
  for (const answer of [
    '您可以先從產品櫥窗了解目前提供的服務內容，也可以透過聯絡我們提出需求，由服務人員協助您確認後續方向。',
    '可以。您可以先瀏覽首頁精選服務與產品櫥窗，了解服務方向後，再依實際需求選擇是否進一步諮詢。',
    '您可以從網站的服務內容開始瀏覽，或透過快速服務與聯絡我們說明需求，協助您找到較合適的服務入口。',
    '您可以前往「產業洞察」，查看平台整理的交通運輸產業資訊、趨勢與相關內容。',
    'AI 助理目前先作為網站互動功能的展示與基礎入口；正式服務能力與回答範圍將於後續版本逐步完善。',
  ]) assert.ok(items.includes(answer))
  assert.doesNotMatch(modal, /axios|fetch\(|\/api\/|\/admin\/|https?:\/\//i)
})

test('local search covers question and answer without weakening empty and no-result behavior', () => {
  const modal = read('src/components/public/PublicFaqModal.vue')
  assert.match(modal, /const keyword = query\.value\.trim\(\)\.toLocaleLowerCase\(\)/)
  assert.match(modal, /if \(!keyword\) return publicFaqItems/)
  assert.match(modal, /`\$\{question\} \$\{answer\}`\.toLocaleLowerCase\(\)\.includes\(keyword\)/)
  assert.match(modal, /v-model="query"/)
  assert.match(modal, /找不到符合的常見問題。/)
})

test('accordion and dialog expose deterministic accessible interaction', () => {
  const modal = read('src/components/public/PublicFaqModal.vue')
  assert.match(modal, /expandedId = ref<string \| null>\(publicFaqItems\[0\]\.id\)/)
  assert.match(modal, /expandedId\.value = expandedId\.value === id \? null : id/)
  assert.match(modal, /:aria-expanded="expandedId === item\.id"/)
  assert.match(modal, /:aria-controls="`public-faq-answer-\$\{item\.id\}`"/)
  assert.match(modal, /role="dialog"/)
  assert.match(modal, /aria-modal="true"/)
  assert.match(modal, /event\.key === 'Escape'/)
  assert.match(modal, /@click\.self="closeFaq"/)
  assert.match(modal, /dialogRef\.value\?\.focus\(\)/)
  assert.match(modal, /previousFocusedElement\?\.focus\(\)/)
})

test('footer keeps human consultation future-ready and routes contact safely', () => {
  const modal = read('src/components/public/PublicFaqModal.vue')
  assert.match(modal, /<button type="button" disabled[^>]*>真人諮詢<\/button>/)
  assert.match(modal, /closeFaq\(\)\s+await router\.push\('\/contact'\)/)
  assert.match(modal, /@click="goToContact">聯絡我們<\/button>/)
})

test('FAQ is centered, internally scrollable, responsive, and motion-aware', () => {
  const modal = read('src/components/public/PublicFaqModal.vue')
  assert.match(modal, /\.public-faq-overlay\s*\{[^}]*position: fixed;[^}]*inset: 0;[^}]*display: grid;[^}]*place-items: center;/s)
  assert.match(modal, /\.public-faq-modal\s*\{[^}]*width: min\(52rem, 100%\);[^}]*max-height:/s)
  assert.match(modal, /\.public-faq-modal__content\s*\{[^}]*overflow-y: auto;/s)
  assert.match(modal, /transition: opacity 0\.22s ease, transform 0\.22s cubic-bezier\(0\.22, 1, 0\.36, 1\)/)
  assert.match(modal, /@media \(max-width: \$breakpoint-sm\)/)
  assert.match(modal, /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition: none;/)
  assert.doesNotMatch(modal, /bottom-sheet|position:\s*fixed[^}]*bottom:\s*0/i)
})
