<script setup lang="ts">
import CaseCard from '@/components/showcase/CaseCard.vue'
import type { PublicMarketplaceCase } from '@/api/publicMarketplace'

withDefaults(defineProps<{ cases?: PublicMarketplaceCase[]; loading?: boolean; error?: string | null }>(), {
  cases: () => [], loading: false, error: null,
})
</script>

<template>
  <section class="case-showcase" aria-label="商品案件列表" aria-live="polite">
    <div v-if="loading" class="case-grid" aria-label="商品案件載入中">
      <div v-for="n in 6" :key="n" class="skeleton-card" aria-busy="true"><div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line short"></div><div class="skeleton-line long"></div><div class="skeleton-line medium"></div></div></div>
    </div>
    <!-- PRODUCT-CASE-B4 — Marketplace Empty/Error State / API failure is distinct from a valid empty collection. -->
    <div v-else-if="error" class="empty-state empty-state--error" role="alert"><div class="empty-icon" aria-hidden="true">!</div><h3>商品案件載入失敗</h3><p>{{ error }}</p></div>
    <div v-else-if="!cases.length" class="empty-state" role="status"><div class="empty-icon" aria-hidden="true">◇</div><h3>目前尚無公開商品案件</h3><p>歡迎稍後再回來查看最新案件。</p></div>
    <div v-else class="case-grid"><CaseCard v-for="item in cases" :key="item.caseId" :case-data="item" /></div>
  </section>
</template>

<style lang="scss" scoped>
.case-showcase { width: 100%; }.case-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; align-items: stretch; }
.empty-state { padding: 3.5rem 1.5rem; border: 2px dashed #cbd5e1; border-radius: .75rem; color: #64748b; background: #fff; text-align: center; h3 { margin: .5rem 0; color: #1e293b; font-size: 1rem; } p { margin: 0; font-size: .85rem; } }.empty-state--error { border-color: #fca5a5; }.empty-icon { font-size: 2rem; }
.skeleton-card { overflow: hidden; border: 1px solid #e2e8f0; border-radius: .65rem; background: #fff; }.skeleton-img { aspect-ratio: 16 / 9; background: #e2e8f0; }.skeleton-body { display: grid; gap: .65rem; padding: 1rem; }.skeleton-line { height: .7rem; border-radius: 999px; background: #e2e8f0; }.short { width: 38%; }.medium { width: 65%; }.long { width: 95%; }
@media (max-width: 1100px) { .case-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }@media (max-width: 640px) { .case-grid { grid-template-columns: 1fr; } }
</style>
