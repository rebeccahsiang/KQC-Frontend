<script setup lang="ts">
import { computed } from 'vue'
import type { MarketplaceCase } from '@/types/case'

const props = defineProps<{
  caseData: MarketplaceCase
}>()

const isBuyer = computed(() => props.caseData.case_type === 'buyer_request')

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    active: '媒合中',
    completed: '已完成',
    closed: '已關閉',
  }
  return map[props.caseData.status] || props.caseData.status
})

const formattedCapital = computed(() => {
  if (!props.caseData.details?.capital_amount) return '面議'
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0
  }).format(props.caseData.details.capital_amount)
})

// 預設 Unsplash 圖片（穩定不跳動）
const coverImage = computed(() => {
  return props.caseData.cover_image || props.caseData.image_url || 
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
})
</script>

<template>
  <article class="case-card" :aria-label="caseData.title">
    <!-- ① 圖片區：高度精準 125px, object-fit: cover -->
    <div class="card-img-wrapper">
      <img
        :src="coverImage"
        :alt="caseData.title"
        class="card-img"
        loading="lazy"
      />

      <!-- 右上角：買家 / 賣家 Badge -->
      <span
        class="badge"
        :class="isBuyer ? 'badge--buyer' : 'badge--seller'"
      >
        {{ isBuyer ? '🛒 買家需求' : '🏷️ 精選待售' }}
      </span>

      <!-- 左上角：狀態點 -->
      <span class="status-dot" :class="'status--' + caseData.status" :title="statusLabel">
        <span class="dot-inner"></span>
        <span class="dot-label">{{ statusLabel }}</span>
      </span>
    </div>

    <!-- ② 內容區 -->
    <div class="card-content">
      <!-- 案件編號 -->
      <span class="case-number">{{ caseData.case_number }}</span>

      <!-- 標題 -->
      <h3 class="card-title" :title="caseData.title">{{ caseData.title }}</h3>

      <!-- 詳細資訊 -->
      <div class="card-details">
        <div class="detail-row">
          <span class="detail-label">目標區域</span>
          <span class="detail-value">{{ caseData.details?.target_area || '全台' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">資金 / 預算</span>
          <span class="detail-value detail-value--highlight">{{ formattedCapital }}</span>
        </div>
      </div>

      <!-- 核心需求摘要 -->
      <p class="requirement-summary" :title="caseData.details?.requirement_core">
        {{ caseData.details?.requirement_core }}
      </p>

      <!-- CTA 按鈕 -->
      <button class="btn-view-detail" type="button">
        查看案件細節 →
      </button>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.case-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  height: 100%; /* 在 grid 中等高 */

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -6px rgba(30, 41, 59, 0.12);
  }
}

/* ① 圖片區 ---------------------------------- */
.card-img-wrapper {
  position: relative;
  width: 100%;
  height: 125px; /* 精準限定 125px */
  overflow: hidden;
  background-color: #f1f5f9;
  flex-shrink: 0;

  .card-img {
    width: 100%;
    height: 125px;
    object-fit: cover; /* 3:2 比例呈現 */
    display: block;
    transition: transform 0.3s ease;
  }

  &:hover .card-img {
    transform: scale(1.04);
  }

  /* 右上角：買賣家 Badge */
  .badge {
    position: absolute;
    top: 8px;
    right: 8px; /* 右上角 */
    padding: 3px 8px;
    font-size: 0.68rem;
    font-weight: 700;
    border-radius: 20px;
    backdrop-filter: blur(4px);
    letter-spacing: 0.3px;

    &--buyer {
      background-color: #EAB308; /* 5% 琥珀璀璨金 */
      color: #1E293B;
    }

    &--seller {
      background-color: #1E293B; /* 25% 三爵鋼鐵藍 */
      color: #ffffff;
    }
  }

  /* 左上角：狀態點 */
  .status-dot {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 2px 7px;
    border-radius: 20px;
    backdrop-filter: blur(4px);

    .dot-inner {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .dot-label {
      font-size: 0.65rem;
      font-weight: 600;
      color: #334155;
    }

    &.status--active .dot-inner {
      background-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
      animation: status-pulse 2s infinite;
    }

    &.status--completed .dot-inner,
    &.status--closed .dot-inner {
      background-color: #94a3b8;
    }
  }
}

/* ② 內容區 ---------------------------------- */
.card-content {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 6px;
}

.case-number {
  font-size: 0.7rem;
  color: #94a3b8;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.card-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.35;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 3px;

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;

    .detail-label {
      color: #94a3b8;
    }

    .detail-value {
      color: #334155;
      font-weight: 500;

      &--highlight {
        color: #EAB308; /* 5% 琥珀璀璨金：金額高亮 */
        font-weight: 700;
      }
    }
  }
}

.requirement-summary {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  min-height: 2.3em;
}

/* CTA 按鈕 */
.btn-view-detail {
  margin-top: auto;
  width: 100%;
  padding: 8px 0;
  background-color: #1E293B; /* 25% 三爵鋼鐵藍 */
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease;

  &:hover {
    background-color: #334155;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 動畫 */
@keyframes status-pulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
}
</style>
