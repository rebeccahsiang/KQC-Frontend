<script setup lang="ts">
import CaseCard from '@/components/showcase/CaseCard.vue'

defineProps({
  cases: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <section class="case-showcase" aria-label="案件展示區">

    <!-- 載入中骨架屏 Skeleton -->
    <div v-if="loading" class="case-grid">
      <div v-for="n in 6" :key="n" class="skeleton-card" aria-busy="true">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line long"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </div>

    <!-- 無資料空狀態 -->
    <div v-else-if="!cases || cases.length === 0" class="empty-state" role="status">
      <div class="empty-icon">🔍</div>
      <h3 class="empty-title">目前尚無匹配案件</h3>
      <p class="empty-desc">請嘗試調整搜尋條件或篩選項目</p>
    </div>

    <!-- 一列三欄響應式網格 -->
    <div v-else class="case-grid">
      <CaseCard
        v-for="item in cases"
        :key="(item as any)._id || (item as any).case_number"
        :case-data="item"
      />
    </div>

  </section>
</template>

<style lang="scss" scoped>
.case-showcase {
  width: 100%;
}

/* ===========================
   一列三欄網格容器（核心）
   =========================== */
.case-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  align-items: stretch; /* 卡片等高 */

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

/* ===========================
   Skeleton 骨架屏
   =========================== */
.skeleton-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;

  .skeleton-img {
    height: 125px;
    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s infinite;
  }

  .skeleton-body {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skeleton-line {
    height: 11px;
    border-radius: 6px;
    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s infinite;

    &.short  { width: 38%; }
    &.medium { width: 65%; }
    &.long   { width: 95%; }
  }
}

/* ===========================
   空狀態
   =========================== */
.empty-state {
  text-align: center;
  padding: 60px 24px;
  background-color: #ffffff;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
  }

  .empty-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1E293B;
    margin: 0 0 6px 0;
  }

  .empty-desc {
    font-size: 0.85rem;
    color: #94a3b8;
    margin: 0;
  }
}

/* 骨架屏動畫 */
@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>