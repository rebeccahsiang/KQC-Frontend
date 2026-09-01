<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Paginator, { type PageState } from 'primevue/paginator'
import CaseCard from '@/components/showcase/CaseCard.vue'
import MarketplaceAdvertisementCard from '@/components/showcase/MarketplaceAdvertisementCard.vue'
import MarketplaceIntentModal from '@/components/showcase/MarketplaceIntentModal.vue'
import type { PublicMarketplaceCase } from '@/api/publicMarketplace'
import type { PublicAdvertisement } from '@/api/publicAdvertisements'

const props = withDefaults(defineProps<{ cases?: PublicMarketplaceCase[]; advertisements?: PublicAdvertisement[]; loading?: boolean; error?: string | null; marketplaceMode?: boolean }>(), { cases: () => [], advertisements: () => [], loading: false, error: null, marketplaceMode: false })
const WINDOW_SIZE = 6
const STEP_SIZE = 3
const viewIndex = ref(0)
const selectedIntentCase = ref<PublicMarketplaceCase | null>(null)

/* PRODUCT-SHOWCASE-UI-R4C — Sliding Row Pagination / six visible slots advance by one three-card row. */
const viewCount = computed(() => props.cases.length <= WINDOW_SIZE ? 1 : 1 + Math.ceil((props.cases.length - WINDOW_SIZE) / STEP_SIZE))
const startIndex = computed(() => viewIndex.value * STEP_SIZE)
const visibleCases = computed(() => props.cases.slice(startIndex.value, startIndex.value + WINDOW_SIZE))
const displayedCases = computed(() => props.marketplaceMode ? visibleCases.value : props.cases)
/* PRODUCT-ADVERTISEMENT-R3 — Real Advertisement Fill Authority / unique PUBLISHED creatives fill only post-slice Case capacity. */
const advertisementSlots = computed(() => props.marketplaceMode && visibleCases.value.length ? props.advertisements.slice(0, WINDOW_SIZE - visibleCases.value.length) : [])
watch(() => props.cases, () => { viewIndex.value = 0 }, { deep: true })
const changeView = (event: PageState) => { viewIndex.value = Math.min(event.page, viewCount.value - 1) }
const openMarketplaceIntent = (caseData: PublicMarketplaceCase) => { selectedIntentCase.value = caseData }
const closeMarketplaceIntent = () => { selectedIntentCase.value = null }
</script>

<template>
  <section class="case-showcase" aria-label="商品案件列表" aria-live="polite">
    <div v-if="loading" class="case-grid" aria-label="商品案件載入中">
      <article v-for="n in 6" :key="n" class="skeleton-card" aria-busy="true"><div class="skeleton-image"></div><div class="skeleton-content"><span></span><span></span><span></span><span></span></div></article>
    </div>
    <!-- PRODUCT-CASE-B4 — Marketplace Empty/Error State / UI-R1 preserves distinct accessible request states. -->
    <div v-else-if="error" class="state-card state-card--error" role="alert"><span class="state-mark" aria-hidden="true">!</span><div><h3>商品案件載入失敗</h3><p>{{ error }}</p></div></div>
    <div v-else-if="!cases.length && !marketplaceMode" class="state-card" role="status"><span class="state-mark" aria-hidden="true">KQC</span><div><h3>目前尚無公開商品案件</h3><p>歡迎稍後再回來查看最新案件。</p></div></div>
    <template v-else>
      <p v-if="!cases.length" class="empty-note" role="status">目前尚無公開商品案件，以下提供 KQC 服務資訊。</p>
      <div v-if="displayedCases.length || advertisementSlots.length" class="case-grid" :class="{ 'case-grid--marketplace': marketplaceMode }"><CaseCard v-for="item in displayedCases" :key="item.caseId" :case-data="item" @intent="openMarketplaceIntent" /><MarketplaceAdvertisementCard v-for="advertisement in advertisementSlots" :key="advertisement.id" :advertisement="advertisement" /></div>
      <Paginator v-if="marketplaceMode && viewCount > 1" :first="viewIndex" :rows="1" :total-records="viewCount" @page="changeView" />
    </template>
    <MarketplaceIntentModal :visible="Boolean(selectedIntentCase)" :case-data="selectedIntentCase" @close="closeMarketplaceIntent" />
  </section>
</template>

<style lang="scss" scoped>
.case-showcase { width: 100%; }.case-showcase :deep(.p-paginator) { margin-top: 1rem; }.case-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .85rem; align-items: stretch; }.case-grid--marketplace { grid-template-columns: repeat(3, minmax(0, 1fr)); }.empty-note { margin: 0 0 .75rem; padding: .7rem .85rem; border: 1px dashed #cbd5e1; border-radius: .55rem; color: #64748b; background: #fff; font-size: .78rem; }
.state-card { display: flex; min-height: 10rem; padding: 1.5rem; align-items: center; justify-content: center; gap: 1rem; border: 1px dashed #cbd5e1; border-radius: .85rem; color: #64748b; background: #fff; h3 { margin: 0 0 .35rem; color: #1e293b; font-size: 1rem; } p { margin: 0; font-size: .85rem; } }.state-card--error { border-color: #e6a6a6; }.state-mark { display: grid; width: 3rem; height: 3rem; place-items: center; flex: 0 0 auto; border-radius: .65rem; color: #475569; background: #e9edf2; font-size: .72rem; font-weight: 900; letter-spacing: .05em; }.state-card--error .state-mark { color: #9f2929; background: #fee2e2; font-size: 1.1rem; }
.skeleton-card { overflow: hidden; border: 1px solid #e1e6ec; border-radius: .85rem; background: #fff; }.skeleton-image { aspect-ratio: 16 / 9; background: linear-gradient(100deg, #e7ebf0 20%, #f4f6f8 45%, #e7ebf0 70%); background-size: 220% 100%; animation: shimmer 1.4s linear infinite; }.skeleton-content { display: grid; gap: .7rem; padding: 1rem; span { height: .65rem; border-radius: 999px; background: #e7ebf0; } span:nth-child(1) { width: 35%; } span:nth-child(3) { width: 75%; } span:nth-child(4) { width: 55%; } }
@keyframes shimmer { to { background-position-x: -220%; } }@media (max-width: 1320px) { .case-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }@media (max-width: 1040px) { .case-grid, .case-grid--marketplace { grid-template-columns: repeat(2, minmax(0, 1fr)); } }@media (max-width: 640px) { .case-grid, .case-grid--marketplace { grid-template-columns: 1fr; gap: 1rem; }.state-card { align-items: flex-start; } }@media (prefers-reduced-motion: reduce) { .skeleton-image { animation: none; } }
</style>
