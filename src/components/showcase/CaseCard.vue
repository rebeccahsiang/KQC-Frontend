<script setup lang="ts">
import { computed } from 'vue'
import { publicMarketplaceImageUrl, type PublicMarketplaceCase } from '@/api/publicMarketplace'

const props = defineProps<{ caseData: PublicMarketplaceCase }>()
const emit = defineEmits<{ intent: [caseData: PublicMarketplaceCase] }>()
const isBuyer = computed(() => props.caseData.transactionType === 'BUY')
const categoryLabels: Record<PublicMarketplaceCase['businessCategory'], string> = { CA: '甲種小客車', CB: '乙種小客車', TX: '計程車', LT: '小貨車', MV: '搬家公司', FT: '汽車貨運', CT: '貨櫃貨運' }
const money = (value: number | null) => value == null ? '—' : `${new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 4 }).format(value / 10000)} 萬`

/* PRODUCT-CASE-B4 — Structured Price Presentation / UI hierarchy changes without changing any canonical price semantics. */
const structuredPrice = computed(() => {
  const prefix = isBuyer.value ? '預算' : '售價'
  if (props.caseData.priceType === 'RANGE') return `${prefix} ${money(props.caseData.priceMin).replace(' 萬', '')}～${money(props.caseData.priceMax)}`
  if (props.caseData.priceType === 'MAX') return `${prefix} ${money(props.caseData.priceAmount)}以下`
  if (props.caseData.priceType === 'APPROXIMATE') return `${prefix}約 ${money(props.caseData.priceAmount)}`
  return `${prefix} ${money(props.caseData.priceAmount)}`
})
const capital = computed(() => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(props.caseData.capitalAmount || 0))
const image = computed(() => props.caseData.representativeImage)
</script>

<template>
  <!-- PRODUCT-CASE-B4 — Public Marketplace Privacy Boundary / UI-R1 binds only the frozen public DTO. -->
  <article class="case-card" :class="isBuyer ? 'case-card--buy' : 'case-card--sell'" :data-transaction="caseData.transactionType" :aria-label="caseData.title">
    <!-- PRODUCT-CASE-B4 — Representative Image Resolution / canonical slot image, alt, lazy-load and placeholder remain unchanged. -->
    <div class="card-media">
      <img v-if="image" :src="publicMarketplaceImageUrl(image.imageUrl)" :alt="image.altText || caseData.title" class="card-image" loading="lazy" />
      <div v-else class="card-image-placeholder" role="img" :aria-label="`${caseData.title}尚未設定代表圖片`"><span>KQC</span><small>{{ isBuyer ? '需求媒合' : '公開標的' }}</small></div>
      <div class="media-tone" aria-hidden="true"></div>
      <span class="transaction-badge"><span class="transaction-code">{{ caseData.transactionType }}</span>{{ isBuyer ? '買方需求' : '精選待售' }}</span>
    </div>

    <div class="card-body">
      <h3 class="card-title" :title="caseData.title">{{ caseData.title }}</h3>
      <div class="identity-row"><span class="case-number">{{ caseData.caseId }}</span><span class="category">{{ categoryLabels[caseData.businessCategory] }}</span></div>
      <div class="market-meta"><span>{{ caseData.targetArea }}</span><span>{{ caseData.companyType }}</span><span>資本額 {{ capital }}</span></div>
      <div class="need-block"><span class="need-label">{{ isBuyer ? '尋找條件' : '案件重點' }}</span><p>{{ caseData.coreNeed }}</p></div>
      <!-- PRODUCT-SHOWCASE-UI-R3 — Marketplace Intent Entry / CTA emits the bounded public source case to one shared modal. -->
      <div class="card-footer"><div class="price-block"><span>{{ isBuyer ? '需求預算' : '公開售價' }}</span><strong>{{ structuredPrice }}</strong></div><button type="button" class="intent-link" @click="emit('intent', caseData)">{{ isBuyer ? '我有合適的標的' : '我有興趣' }}</button></div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.case-card { --market-accent: #a66f0a; --market-soft: #fff7df; display: flex; min-width: 0; min-height: 26rem; height: 100%; overflow: hidden; flex-direction: column; border: 1px solid #dce2e9; border-top: 3px solid var(--market-accent); border-radius: .85rem; background: #fff; box-shadow: 0 5px 18px rgba(15, 23, 42, .055); transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; &:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--market-accent) 45%, #dce2e9); box-shadow: 0 14px 30px rgba(15, 23, 42, .1); } }
/* PRODUCT-SHOWCASE-UI-R4B — BUY Card Border Polish / transaction identity uses a solid teal accent, never a selection-like dashed edge. */
.case-card--buy { --market-accent: #256e86; --market-soft: #e9f6f8; }
.card-media { position: relative; overflow: hidden; aspect-ratio: 16 / 9; background: #e8edf2; }.card-image { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform .32s ease; }.case-card:hover .card-image { transform: scale(1.035); }.media-tone { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to top, rgba(15,23,42,.38), transparent 48%); }.case-card--buy .media-tone { background: linear-gradient(135deg, rgba(20, 96, 119, .34), rgba(15,23,42,.08) 62%, rgba(255,255,255,.08)); }.card-image-placeholder { display: grid; width: 100%; height: 100%; place-content: center; gap: .25rem; color: #536175; background: linear-gradient(135deg, #f4f6f8, #dfe5eb); text-align: center; span { font-weight: 900; letter-spacing: .15em; } small { font-size: .7rem; } }.case-card--buy .card-image-placeholder { color: #236078; background: repeating-linear-gradient(-45deg, #edf8fa, #edf8fa 14px, #e2f1f4 14px, #e2f1f4 28px); }
.transaction-badge { position: absolute; left: .8rem; bottom: .7rem; display: inline-flex; min-height: 1.8rem; padding: .2rem .55rem .2rem .25rem; align-items: center; gap: .4rem; border-radius: .4rem; color: #fff; background: color-mix(in srgb, var(--market-accent) 90%, #111827); font-size: .72rem; font-weight: 800; box-shadow: 0 3px 10px rgba(15,23,42,.2); }.transaction-code { padding: .15rem .3rem; border-radius: .25rem; color: var(--market-accent); background: #fff; font-size: .62rem; letter-spacing: .04em; }
.card-body { display: flex; flex: 1; flex-direction: column; gap: .55rem; padding: .75rem; }.identity-row { display: flex; align-items: center; justify-content: space-between; gap: .55rem; }.case-number { overflow: hidden; color: #8691a0; font: .61rem 'Courier New', monospace; letter-spacing: .02em; text-overflow: ellipsis; white-space: nowrap; }.category { color: var(--market-accent); font-size: .64rem; font-weight: 800; white-space: nowrap; }.card-title { display: -webkit-box; min-height: 2.7em; margin: 0; overflow: hidden; color: #172033; font-size: .88rem; line-height: 1.35; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }.market-meta { display: flex; overflow: hidden; flex-wrap: wrap; gap: .25rem .45rem; color: #64748b; font-size: .62rem; line-height: 1.35; span:not(:last-child)::after { content: '·'; margin-left: .45rem; color: #c1c8d1; } }
.need-block { padding: .5rem .55rem; border-left: 2px solid var(--market-accent); border-radius: 0 .35rem .35rem 0; background: var(--market-soft); }.need-label { display: block; margin-bottom: .18rem; color: var(--market-accent); font-size: .56rem; font-weight: 850; letter-spacing: .06em; }.need-block p { display: -webkit-box; min-height: 2.5em; margin: 0; overflow: hidden; color: #536175; font-size: .66rem; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.card-footer { display: flex; margin-top: auto; padding-top: .55rem; align-items: flex-end; justify-content: space-between; gap: .45rem; border-top: 1px solid #edf0f3; }.price-block { display: flex; min-width: 0; flex-direction: column; gap: .12rem; span { color: #8290a2; font-size: .56rem; } strong { display: -webkit-box; overflow: hidden; color: #172033; font-size: .72rem; line-height: 1.25; -webkit-box-orient: vertical; -webkit-line-clamp: 2; } }.intent-link { display: inline-flex; min-height: 2rem; padding: 0 .55rem; align-items: center; justify-content: center; flex: 0 0 auto; border: 1px solid var(--market-accent); border-radius: .36rem; color: #fff; background: var(--market-accent); font: inherit; font-size: .64rem; font-weight: 800; white-space: nowrap; cursor: pointer; &:hover { filter: brightness(1.08); } &:focus-visible { outline: 3px solid color-mix(in srgb, var(--market-accent) 30%, transparent); outline-offset: 2px; } }
/* PRODUCT-SHOWCASE-UI-R4D — CaseCard Typography Readability / existing selectors and clamps own the desktop readability polish. */
.case-number, .category { font-size: .8125rem; }
.card-title { font-size: 1.125rem; }
.market-meta { font-size: .875rem; line-height: 1.5; }
.need-label { font-size: .8125rem; }
.need-block p { font-size: .875rem; line-height: 1.55; }
.price-block span { font-size: .8125rem; }
.price-block strong { font-size: .90625rem; font-weight: 800; line-height: 1.3; }
@media (max-width: 380px) { .card-footer { align-items: stretch; flex-direction: column; }.intent-link { width: 100%; box-sizing: border-box; } }@media (prefers-reduced-motion: reduce) { .case-card, .card-image { transition: none; }.case-card:hover { transform: none; } }
</style>
