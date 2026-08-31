<script setup lang="ts">
import { computed } from 'vue'
import { publicMarketplaceImageUrl, type PublicMarketplaceCase } from '@/api/publicMarketplace'

const props = defineProps<{ caseData: PublicMarketplaceCase }>()
const isBuyer = computed(() => props.caseData.transactionType === 'BUY')
const categoryLabels: Record<PublicMarketplaceCase['businessCategory'], string> = { CA: '甲種小客車', CB: '乙種小客車', TX: '計程車', LT: '小貨車', MV: '搬家公司', FT: '汽車貨運', CT: '貨櫃貨運' }
const money = (value: number | null) => value == null ? '—' : `${new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 4 }).format(value / 10000)} 萬`
/* PRODUCT-CASE-B4 — Structured Price Presentation / all four modes read canonical integer-TWD fields only. */
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
  <!-- PRODUCT-CASE-B4 — Public Marketplace Privacy Boundary / the card binds only bounded public DTO fields. -->
  <article class="case-card" :aria-label="caseData.title">
    <!-- PRODUCT-CASE-B4 — Representative Image Resolution / image and alt text arrive with the public case DTO. -->
    <div class="card-img-wrapper"><img v-if="image" :src="publicMarketplaceImageUrl(image.imageUrl)" :alt="image.altText || caseData.title" class="card-img" loading="lazy" /><div v-else class="card-image-placeholder" role="img" :aria-label="`${caseData.title}尚未設定代表圖片`"><span>KQC</span></div><span class="badge" :class="isBuyer ? 'badge--buyer' : 'badge--seller'">{{ isBuyer ? 'BUY｜買方需求' : 'SELL｜精選待售' }}</span></div>
    <div class="card-content"><span class="case-number">{{ caseData.caseId }}</span><h3 class="card-title" :title="caseData.title">{{ caseData.title }}</h3><div class="card-details"><span>{{ categoryLabels[caseData.businessCategory] }}</span><span>{{ caseData.targetArea }}</span></div><div class="card-details"><span>{{ caseData.companyType }}</span><span>資本額 {{ capital }}</span></div><strong class="structured-price">{{ structuredPrice }}</strong><p class="requirement-summary">{{ caseData.coreNeed }}</p><!-- PRODUCT-CASE-B4 — Public Marketplace CTA / B5 is deferred, so both intents use the existing public consultation route. --><router-link class="btn-view-detail" to="/contact">{{ isBuyer ? '我有合適標的' : '我有興趣' }}</router-link></div>
  </article>
</template>

<style lang="scss" scoped>
.case-card { display: flex; height: 100%; overflow: hidden; flex-direction: column; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }.card-img-wrapper { position: relative; overflow: hidden; aspect-ratio: 16 / 9; background: #e2e8f0; }.card-img { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform .3s ease; }.card-img-wrapper:hover .card-img { transform: scale(1.04); }.card-image-placeholder { display: grid; width: 100%; height: 100%; place-items: center; color: #64748b; background: linear-gradient(135deg, #f8fafc, #e2e8f0); span { font-weight: 900; letter-spacing: .15em; } }.badge { position: absolute; top: .6rem; right: .6rem; padding: .25rem .55rem; border-radius: 999px; font-size: .7rem; font-weight: 750; backdrop-filter: blur(6px); }.badge--buyer { color: #1e293b; background: #eab308; }.badge--seller { color: #fff; background: #1e293b; }
.card-content { display: flex; flex: 1; flex-direction: column; gap: .55rem; padding: .9rem; }.case-number { color: #64748b; font: .72rem 'Courier New', monospace; }.card-title { margin: 0; color: #1e293b; font-size: 1rem; }.card-details { display: flex; justify-content: space-between; gap: .75rem; color: #64748b; font-size: .78rem; }.structured-price { color: #a16207; }.requirement-summary { display: -webkit-box; min-height: 2.4em; margin: 0; overflow: hidden; color: #64748b; font-size: .8rem; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }.btn-view-detail { margin-top: auto; padding: .6rem; border-radius: .4rem; color: #fff; background: #1e293b; font-size: .84rem; font-weight: 650; text-align: center; text-decoration: none; &:hover { background: #334155; } &:focus-visible { outline: 2px solid #eab308; outline-offset: 2px; } }
</style>
