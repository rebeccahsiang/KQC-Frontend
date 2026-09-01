<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

const processSteps = [
  { stage: '第一階段', detail: '協助準備過戶資料準備', icon: 'lucide:clipboard-check' },
  { stage: '第二階段', detail: '向交通主管機關辦理「辦理公司變更許可」', icon: 'lucide:file-check-2' },
  { stage: '第三階段', detail: '向地方政府「辦理公司變更」', icon: 'lucide:building-2' },
  { stage: '第四階段', detail: '向交通主管機關辦理「新運輸執照」', icon: 'lucide:badge-check' },
  { stage: '第五階段', detail: '向經濟部辦理「稅務變更」', icon: 'lucide:receipt-text' },
] as const

const activeStageCount = ref(0)
const stageElements: HTMLElement[] = []
const timelineProgress = computed(() => {
  if (activeStageCount.value <= 1) return 0
  return (activeStageCount.value - 1) / (processSteps.length - 1)
})
let stageObserver: IntersectionObserver | null = null
let scrollFrame: number | null = null

const captureStageElement = (element: unknown, index: number) => {
  if (element instanceof HTMLElement) stageElements[index] = element
}

const updateActiveStageCount = () => {
  const viewportHeight = window.innerHeight
  const maximumScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight)
  const remainingScroll = Math.max(0, maximumScroll - window.scrollY)
  const bottomActivationRange = viewportHeight * 0.445
  const bottomProgress = Math.max(0, Math.min(1, 1 - (remainingScroll / bottomActivationRange)))
  const triggerPosition = viewportHeight * (0.555 + (0.445 * bottomProgress))
  activeStageCount.value = stageElements.filter((element) => {
    const bounds = element.getBoundingClientRect()
    return bounds.top + (bounds.height / 2) <= triggerPosition
  }).length
}

const scheduleTimelineUpdate = () => {
  if (scrollFrame !== null) return
  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = null
    updateActiveStageCount()
  })
}

/* PRODUCT-SHOWCASE-UI-R4A-1 — Bidirectional Timeline Progress / a stable viewport reading line owns current progress. */
onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion || typeof IntersectionObserver === 'undefined') {
    activeStageCount.value = processSteps.length
    return
  }

  stageObserver = new IntersectionObserver(() => {
    scheduleTimelineUpdate()
  }, { threshold: 0, rootMargin: '-55% 0px -44% 0px' })

  stageElements.forEach((element) => stageObserver?.observe(element))
  window.addEventListener('scroll', scheduleTimelineUpdate, { passive: true })
  updateActiveStageCount()
})

onBeforeUnmount(() => {
  stageObserver?.disconnect()
  stageObserver = null
  window.removeEventListener('scroll', scheduleTimelineUpdate)
  if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame)
  scrollFrame = null
})
</script>

<template>
  <!-- PRODUCT-SHOWCASE-UI-R4 — Marketplace Process Information / bounded presentation remains inside the product content column. -->
  <section class="marketplace-process-info" aria-labelledby="marketplace-process-info-title">
    <h2 id="marketplace-process-info-title" class="sr-only">交通運輸業轉讓資訊與申請流程</h2>
    <div class="advisory-column">
      <article class="info-card info-card--concept">
        <header><Icon icon="lucide:circle-check-big" aria-hidden="true" /><h3>核心概念</h3></header>
        <p>轉讓「交通運輸業」時，需要向經濟部、地方政府，以及交通主管機關提交相關審查資料。</p>
      </article>

      <article class="info-card info-card--advice">
        <header><Icon icon="lucide:lightbulb" aria-hidden="true" /><h3>建議</h3></header>
        <p>由於流程繁瑣且環環相扣，建議委託專業的會計師或記帳士事務所辦理。</p>
        <p>提供法規上的專業建議，避免走冤枉路。</p>
        <p>三瑝資訊亦熟悉送件流程，也能在您尋找營業地址與停車場地時，提供設立公司一條龍的服務，省去不必要的時間。</p>
      </article>

      <article class="info-card info-card--notice">
        <header><Icon icon="lucide:info" aria-hidden="true" /><h3>注意事項</h3></header>
        <strong>影響時間的關鍵因素</strong>
        <dl>
          <div><dt>文件齊全度</dt><dd>若文件不齊全需要「補件」，將會大幅延後時程。</dd></div>
          <div><dt>案件複雜度</dt><dd>若僅是單純的股東與負責人變更，速度最快。若涉及所在地不同地址變更，則時間會顯著拉長。</dd></div>
          <div><dt>各機關工作量</dt><dd>政府單位的審核速度會因案件量而浮動。</dd></div>
        </dl>
      </article>
    </div>

    <!-- PRODUCT-SHOWCASE-UI-R4 — Five-stage Application Timeline / ordered process contains no invented dates or duration promises. -->
    <section class="process-panel" aria-labelledby="application-process-title">
      <header><span>TRANSFER PROCESS</span><h3 id="application-process-title">申請流程</h3><p>依序完成資料準備與主管機關變更程序。</p></header>
      <ol class="process-timeline" :style="{ '--timeline-progress': timelineProgress }">
        <li v-for="(step, index) in processSteps" :key="step.stage" :class="{ 'is-even': index % 2 === 1, 'is-active': index < activeStageCount }">
          <div class="timeline-content"><span>{{ step.stage }}</span><strong>{{ step.detail }}</strong></div>
          <span :ref="(element) => captureStageElement(element, index)" class="timeline-node" aria-hidden="true"><Icon :icon="step.icon" /></span>
        </li>
      </ol>
    </section>
  </section>
</template>

<style lang="scss" scoped>
.marketplace-process-info { display: grid; width: 100%; margin-top: 1.5rem; align-items: stretch; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 1rem; }.advisory-column { display: grid; align-content: start; gap: .85rem; }.info-card, .process-panel { border: 1px solid #dce4eb; border-radius: .75rem; background: #fff; box-shadow: 0 6px 18px rgba(15,23,42,.045); }.info-card { padding: 1rem; }.info-card header { display: flex; margin-bottom: .65rem; align-items: center; gap: .55rem; }.info-card header svg { width: 1.15rem; height: 1.15rem; color: #247188; }.info-card h3 { margin: 0; color: #213148; font-size: .92rem; }.info-card p { margin: 0; color: #617083; font-size: .76rem; line-height: 1.7; }.info-card p + p { margin-top: .5rem; }.info-card--advice { border-left: 3px solid #b5841c; background: linear-gradient(135deg, #fffdf7, #fff9e9); }.info-card--advice header svg, .info-card--advice h3 { color: #926b17; }.info-card--notice { border-left: 3px solid #8293a4; background: #fbfcfd; }.info-card--notice > strong { display: block; margin-bottom: .5rem; color: #405367; font-size: .76rem; }.info-card dl { display: grid; margin: 0; gap: .55rem; }.info-card dl div { padding-top: .5rem; border-top: 1px solid #e8edf1; }.info-card dt { color: #405367; font-size: .72rem; font-weight: 800; }.info-card dd { margin: .15rem 0 0; color: #697789; font-size: .72rem; line-height: 1.6; }.process-panel { padding: 1.15rem; overflow: hidden; }.process-panel > header { text-align: center; }.process-panel > header span { color: #99731e; font-size: .62rem; font-weight: 900; letter-spacing: .14em; }.process-panel h3 { margin: .3rem 0; color: #213148; font-size: 1.15rem; }.process-panel > header p { margin: 0; color: #718093; font-size: .72rem; }.process-timeline { position: relative; display: grid; margin: 1rem 0 0; padding: 0; gap: .45rem; list-style: none; }.process-timeline::before, .process-timeline::after { position: absolute; top: 1.2rem; bottom: 1.2rem; left: 50%; width: 2px; content: ''; transform: translateX(-50%); }.process-timeline::before { background: #d9e1e7; }.process-timeline::after { z-index: 1; background: linear-gradient(#2a788e, #d6b45e); transform: translateX(-50%) scaleY(var(--timeline-progress)); transform-origin: top; transition: transform .45s cubic-bezier(.22,1,.36,1); }.process-timeline li { position: relative; display: grid; min-height: 4.2rem; align-items: center; grid-template-columns: minmax(0,1fr) 2.8rem minmax(0,1fr); }.timeline-content { grid-column: 1; padding: .65rem .75rem; border: 1px solid #e0e7ed; border-radius: .55rem; background: #f8fafb; opacity: .72; text-align: right; transition: border-color .3s ease, box-shadow .3s ease, opacity .3s ease, transform .3s ease; }.is-even .timeline-content { grid-column: 3; text-align: left; }.timeline-content span { display: block; margin-bottom: .18rem; color: #98721c; font-size: .65rem; font-weight: 850; }.timeline-content strong { color: #34465b; font-size: .76rem; line-height: 1.5; }.timeline-node { z-index: 2; display: grid; width: 2rem; height: 2rem; grid-column: 2; grid-row: 1; place-self: center; place-items: center; border: 3px solid #fff; border-radius: 50%; color: #667687; background: #e3e9ee; box-shadow: 0 0 0 1px #c3cdd5; transition: color .3s ease, background-color .3s ease, box-shadow .3s ease, transform .3s ease; }.timeline-node svg { width: .9rem; height: .9rem; }.process-timeline li.is-active .timeline-content { border-color: #b7cdd5; opacity: 1; box-shadow: 0 7px 18px rgba(30,91,112,.08); transform: translateY(-1px); }.process-timeline li.is-active .timeline-node { color: #fff; background: #276f86; box-shadow: 0 0 0 1px #8cb4c1, 0 4px 12px rgba(39,111,134,.18); transform: scale(1.04); }.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); border: 0; white-space: nowrap; }
@media (max-width: 1040px) { .marketplace-process-info { grid-template-columns: 1fr; }.process-panel { order: 2; } }
@media (max-width: 640px) { .marketplace-process-info { margin-top: 1rem; }.process-panel { padding: 1rem; }.process-timeline::before { left: 1rem; transform: none; }.process-timeline::after { left: 1rem; transform: scaleY(var(--timeline-progress)); transform-origin: top; }.process-timeline li { min-height: auto; padding-left: 2.75rem; grid-template-columns: 1fr; }.timeline-content, .is-even .timeline-content { grid-column: 1; text-align: left; }.timeline-node { left: 0; width: 2rem; height: 2rem; grid-column: 1; place-self: center start; transform: translateX(0); }.process-timeline li.is-active .timeline-node { transform: scale(1.04); } }
/* PRODUCT-SHOWCASE-UI-R4A — Reduced Motion Timeline / content stays readable without animated progression. */
@media (prefers-reduced-motion: reduce) { .process-timeline::after, .timeline-content, .timeline-node { transition: none; } }
</style>
