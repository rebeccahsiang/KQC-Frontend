<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CaseShowcase from '@/components/showcase/CaseShowcase.vue'
import { useCaseStore } from '@/stores/useCaseStore'

const caseStore = useCaseStore()

// Hero Banner 三大亮點
const highlights = [
  { icon: '🏆', label: '特許牌照媒合', desc: '甲種、乙種、丙種運輸業牌照快速撮合' },
  { icon: '🤖', label: 'AI 語意配對', desc: '口語化需求輸入，智慧篩選最佳標的' },
  { icon: '🔒', label: '個資嚴格隔離', desc: '核心資料加密保護，買賣雙方安心媒合' },
]

// Hero Banner 右側圖片
const heroImageSrc = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'

// 類型篩選
const activeFilter = ref<'ALL' | 'BUY' | 'SELL'>('ALL')

/* PRODUCT-CASE-B4 — Marketplace Transaction Filter / tabs map directly to the canonical public transactionType. */
const setFilter = (type: 'ALL' | 'BUY' | 'SELL') => {
  activeFilter.value = type
  caseStore.setFilters({ transactionType: type })
}

onMounted(async () => {
  await caseStore.fetchPublicCases()
})
</script>

<template>
  <div class="product-view">
    <!-- 全域頂部導覽列 -->
    <main class="product-main" id="main-content">

      <!-- ============================================
           Hero Banner：文左 + 圖右
           ============================================ -->
      <section class="hero-banner" aria-label="業務櫥窗 Hero Banner">
        <div class="hero-content">
          <!-- 左側：文字區 -->
          <div class="hero-text">
            <!-- 醒目標籤 -->
            <span class="hero-tag">🏆 特許牌照與車隊資產交易平台</span>

            <h1 class="hero-title">
              智慧媒合<br />
              <span class="hero-title--accent">特許牌照</span>交易
            </h1>

            <p class="hero-subtitle">
              串聯買家委託需求與精選待售標的，以 AI 語意精準配對，<br class="br-desktop" />
              協助您以最快速度完成甲乙丙種運輸業牌照合法讓渡。
            </p>

            <!-- 三大亮點 -->
            <ul class="highlight-list" aria-label="三大核心優勢">
              <li
                v-for="item in highlights"
                :key="item.label"
                class="highlight-item"
              >
                <span class="h-icon">{{ item.icon }}</span>
                <div class="h-text">
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.desc }}</span>
                </div>
              </li>
            </ul>

            <!-- PRODUCT-CASE-B3-E2E-R7 — Product Showcase Public CTA / the public Hero owns consultation only, never an admin/war-room entry. -->
            <div class="hero-ctas">
              <router-link to="/contact" class="btn-primary">
                免費預約諮詢 →
              </router-link>
            </div>
          </div>

          <!-- 右側：圖片區（固定高度 180px） -->
          <div class="hero-image-wrapper" aria-hidden="true">
            <img
              :src="heroImageSrc"
              alt="運輸業特許牌照交易"
              class="hero-image"
            />
            <!-- 浮動數據卡 -->
            <div class="hero-float-card hero-float-card--tl">
              <div class="float-number">12+</div>
              <div class="float-label">待售標的</div>
            </div>
            <div class="hero-float-card hero-float-card--br">
              <div class="float-number">98%</div>
              <div class="float-label">媒合成功率</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================
           案件展示區：篩選 + 1列3欄網格
           ============================================ -->
      <section class="showcase-section" aria-label="案件列表">
        <div class="showcase-inner">
          <!-- Section 標題 -->
          <div class="section-header">
            <div class="section-title-group">
              <h2 class="section-title">業務櫥窗案件</h2>
              <span class="case-count-badge">{{ caseStore.filteredCases.length }} 筆</span>
            </div>

            <!-- 類型篩選 Tabs -->
            <div class="filter-tabs" role="tablist" aria-label="案件類型篩選">
              <button
                role="tab"
                class="filter-tab"
                :class="{ 'filter-tab--active': activeFilter === 'ALL' }"
                :aria-selected="activeFilter === 'ALL'"
                @click="setFilter('ALL')"
              >
                全部案件
              </button>
              <button
                role="tab"
                class="filter-tab"
                :class="{ 'filter-tab--active': activeFilter === 'BUY' }"
                :aria-selected="activeFilter === 'BUY'"
                @click="setFilter('BUY')"
              >
                🛒 買家需求
              </button>
              <button
                role="tab"
                class="filter-tab"
                :class="{ 'filter-tab--active': activeFilter === 'SELL' }"
                :aria-selected="activeFilter === 'SELL'"
                @click="setFilter('SELL')"
              >
                🏷️ 精選待售
              </button>
            </div>
          </div>

          <!-- 案件網格：CaseShowcase 元件 -->
          <CaseShowcase
            :cases="caseStore.filteredCases"
            :loading="caseStore.isLoading"
            :error="caseStore.error"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
/* ===========================
   全頁結構
   =========================== */
.product-view {
  min-height: 100vh;
  background-color: #F8FAFC; /* 70% 雲霧極光白 */
  display: flex;
  flex-direction: column;
}

.product-main {
  flex: 1;
}

/* ===========================
   Hero Banner
   =========================== */
.hero-banner {
  background-color: #1E293B; /* 25% 三爵鋼鐵藍 */
  padding: 40px 0 48px;
  overflow: hidden;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 48px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 32px;
    padding: 0 20px;
  }
}

/* 左側：文字 */
.hero-text {
  flex: 1;
  min-width: 0;

  .hero-tag {
    display: inline-block;
    background-color: rgba(234, 179, 8, 0.15);
    color: #EAB308;
    border: 1px solid rgba(234, 179, 8, 0.3);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    letter-spacing: 0.5px;
    margin-bottom: 16px;
  }

  .hero-title {
    font-size: 2.25rem;
    font-weight: 900;
    color: #f1f5f9;
    line-height: 1.2;
    margin: 0 0 16px 0;

    &--accent {
      color: #EAB308; /* 5% 琥珀璀璨金 */
    }

    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }

  .hero-subtitle {
    font-size: 0.9rem;
    color: #94a3b8;
    line-height: 1.7;
    margin: 0 0 24px 0;

    .br-desktop {
      display: none;
      @media (min-width: 900px) { display: inline; }
    }
  }
}

/* 三大亮點 */
.highlight-list {
  list-style: none;
  padding: 0;
  margin: 0 0 28px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .highlight-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;

    .h-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .h-text {
      display: flex;
      flex-direction: column;
      gap: 1px;

      strong {
        font-size: 0.85rem;
        font-weight: 700;
        color: #e2e8f0;
      }

      span {
        font-size: 0.78rem;
        color: #64748b;
      }
    }
  }
}

/* CTA 按鈕組 */
.hero-ctas {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  .btn-primary {
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    background-color: #EAB308; /* 5% 琥珀璀璨金 CTA */
    color: #1E293B;
    font-weight: 700;
    font-size: 0.875rem;
    border-radius: 8px;
    text-decoration: none;
    transition: filter 0.2s ease, transform 0.15s ease;

    &:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    background-color: transparent;
    color: #e2e8f0;
    font-weight: 600;
    font-size: 0.875rem;
    border-radius: 8px;
    border: 1px solid #475569;
    text-decoration: none;
    transition: border-color 0.2s ease, color 0.2s ease;

    &:hover {
      border-color: #EAB308;
      color: #EAB308;
    }
  }
}

/* 右側：Hero 圖片（固定 180px 高度） */
.hero-image-wrapper {
  width: 340px;
  min-width: 280px;
  height: 180px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }

  .hero-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
  }

  /* 浮動數據卡 */
  .hero-float-card {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    padding: 6px 12px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    .float-number {
      font-size: 1.1rem;
      font-weight: 900;
      color: #1E293B;
      line-height: 1;
    }

    .float-label {
      font-size: 0.65rem;
      color: #64748b;
      font-weight: 600;
    }

    &--tl {
      top: 10px;
      left: 10px;
    }

    &--br {
      bottom: 10px;
      right: 10px;
    }
  }
}

/* ===========================
   案件展示區
   =========================== */
.showcase-section {
  padding: 40px 0 60px;
}

.showcase-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
}

/* Section 標題列 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;

  .section-title {
    font-size: 1.4rem;
    font-weight: 800;
    color: #1E293B;
    margin: 0;
  }

  .case-count-badge {
    background-color: #EAB308; /* 5% 琥珀璀璨金 */
    color: #1E293B;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 20px;
  }
}

/* 類型篩選 Tabs */
.filter-tabs {
  display: flex;
  gap: 4px;
  background-color: #e2e8f0;
  padding: 4px;
  border-radius: 8px;

  .filter-tab {
    padding: 6px 14px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #64748b;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
    white-space: nowrap;

    &:hover {
      background-color: #f8fafc;
      color: #1E293B;
    }

    &--active {
      background-color: #1E293B; /* 25% 三爵鋼鐵藍 */
      color: #ffffff;
      font-weight: 700;
    }
  }
}
</style>
