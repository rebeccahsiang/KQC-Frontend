<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import CaseShowcase from '@/components/showcase/CaseShowcase.vue'
import FrontHeader from '@/components/layout/FrontHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules'

import { useThemeStore } from '../stores/themeStore'

const router = useRouter()
const themeStore = useThemeStore()
const backendMessage = ref<string>('正在連線到後端 API...')
const swiperModules = [EffectCoverflow, Pagination, Autoplay]
// API 基礎 URL，從環境變數讀取，若未設定則預設為本地端
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
// 狀態管理
const casesData = ref<any[]>([])
const textInput = ref<string>('')
const isLoading = ref<boolean>(false)
const marketScore = ref<number>(71)

// UI 狀態控制 
const isHeaderCompact = ref<boolean>(false)
const isFooterExpanded = ref<boolean>(false)
const lastScrollTop = ref<number>(0)
const activeWidgetDrawer = ref<'ai' | 'chat' | 'contact' | null>(null)

// 工具函式：取得圖片資源 URL
const getImageUrl = (name: string): string => {
  return new URL(`../assets/images/${name}`, import.meta.url).href
}

// 精選 Banner 輪播圖
const bannerSlides = ref<string[]>([
  getImageUrl('banner-1.jpg'),
  getImageUrl('banner-2.jpg'),
  getImageUrl('banner-3.jpg')
])

// 左側 70% 欄位內部：一列三欄核心服務卡片
const coreServices70 = ref([
  {
    id: 'srv-1',
    title: '專屬資產買賣媒合',
    tag: '誠意 ｜ 買家委託',
    desc: '提供特許牌照、營業用車牌與車隊資產 100% 物理隔離之高保密交易環境。',
    route: '/product?type=buyer'
  },
  {
    id: 'srv-2',
    title: '交通運輸運營服務',
    tag: '產品分頁 ｜ 運營支援',
    desc: '跨區車隊派遣、過戶無欠稅審查、營業車位證明與監理站過戶全流程協助。',
    route: '/product?category=transport'
  },
  {
    id: 'srv-3',
    title: '專屬形象網站',
    tag: '產品分頁 ｜ 數位轉型',
    desc: '擺脫 WordPress 套版維護困境與昂貴續費，打造零跳頁、現代化品牌戰情室。',
    route: '/company'
  }
])

// 手風琴 UI 資料
const activeAccordion = ref<number | null>(0)
const accordionItems = ref([
  {
    title: 'WordPress 套版痛點 vs KQC 客製化解法',
    content: '擺脫每年昂貴外掛續費與跑版風險，Vue 3 SPA 實現零重整、毫秒級檢索體驗，節省 60% 營運維護成本。'
  },
  {
    title: '資料庫物理隔離與資安防禦機制',
    content: '採用 MongoDB NoSQL 雙向隔離結構，前台 API 透過 .select("-crmData") 100% 遮蔽敏感個資，後台戰情室審核授權。'
  },
  {
    title: 'LINE Bot + AI 語意精準對接',
    content: '貼近車行老闆打白話文的習慣，口語指令秒級匹配資料庫，內建情緒轉化器優先排定潛在買家跟進。'
  }
])

const customerTargets = ref([
  { id: 1, title: '汽車貨運業者', desc: '擴建車隊規模、徵求營業大貨車牌', tag: '買家需求' },
  { id: 2, title: '計程車車行老闆', desc: '牌照讓渡轉讓、世代交接圓滿退場', tag: '精選待售' },
  { id: 3, title: '遊覽車/客運公司', desc: '特許執照讓渡、資產盤點與股權變更', tag: '股權變更' },
  { id: 4, title: '企業控股集團', desc: '指定收購港口貨櫃與跨區運輸企業', tag: '併購委託' }
])

const latestInsights = ref([
  {
    id: 1,
    title: '2026 年台灣物流特許牌照交易趨勢分析',
    summary: '隨著跨境電商與智慧供應鏈興起，甲種運輸業牌照市場需求持續攀升...',
    date: '2026-08-01',
    category: '法規與趨勢'
  },
  {
    id: 2,
    title: '車行老闆如何透過 AI 語意客服提升 3 倍撮合率',
    summary: '傳統電話接單轉型為 LINE Bot 自動過濾，解決人力短缺與訊息割裂痛點...',
    date: '2026-07-28',
    category: '數位轉型'
  }
])

const handleAiMatch = async () => {
  if (!textInput.value.trim()) {
    alert('請先輸入您的白話文車隊或牌照需求！')
    return
  }
  try {
    isLoading.value = true
    backendMessage.value = '🤖 三爵 AI 大腦正拆解意圖與數據庫比對中...'
    const response = await axios.post(`${API_BASE_URL}/api/ai/match`, { textInput: textInput.value })
    if (response.data.success) {
      casesData.value = response.data.data
      backendMessage.value = `🎯 AI 解析成功！為您篩選出 ${response.data.count || casesData.value.length} 筆真實物件。`
    }
  } catch (error) {
    backendMessage.value = '🛡️ 觸發 Circuit Breaker 斷路防禦，系統無縫降級保底。'
  } finally {
    isLoading.value = false
  }
}

const handleScroll = () => {
  const st = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const fullHeight = document.documentElement.scrollHeight

  if (st > 100 && st > lastScrollTop.value) {
    isHeaderCompact.value = true
  } else if (st < lastScrollTop.value) {
    isHeaderCompact.value = false
  }
  lastScrollTop.value = st <= 0 ? 0 : st

  if (st + windowHeight >= fullHeight - 60) {
    isFooterExpanded.value = true
  }
}

const toggleWidgetDrawer = (type: 'ai' | 'chat' | 'contact') => {
  activeWidgetDrawer.value = activeWidgetDrawer.value === type ? null : type
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  try {
    const healthRes = await axios.get(`${API_BASE_URL}/api/health`)
    backendMessage.value = healthRes.data.message
    const casesRes = await axios.get(`${API_BASE_URL}/api/cases`)
    if (casesRes.data.success) casesData.value = casesRes.data.data
  } catch (error) {
    backendMessage.value = '展示模式：可進行介面瀏覽與 AI 語意匹配測試。'
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="kqc-home-wrapper" :class="{ 'dark-mode': themeStore.isDark }">
    
    <!-- 全域雙層 Header 導覽列 -->
    <FrontHeader :is-compact="isHeaderCompact" />

    <!-- 主內容容器：對齊 1280px -->
    <main class="kqc-main-container">
      
      <!-- 頂部 Hero 橫幅看板 -->
      <section class="hero-banner-card">
        <div class="hero-text-left">
          <span class="hero-badge-gold">三爵資訊 KQC 智慧運輸與 AI 轉型平台</span>
          <h1 class="hero-main-title">傳統產能的數位賦能：<br>打造 B2B 資產交易的科技戰情室</h1>
          <p class="hero-sub-desc">
            擺脫傳統套版受限與昂貴維護費，專為台灣交通運輸業打造的高保密、毫秒級資產交易戰情室。
          </p>
          
          <div class="ai-search-input-group">
            <input 
              v-model="textInput"
              @keyup.enter="handleAiMatch"
              type="text" 
              placeholder="請隨意輸入需求（例如：我北部有兩台計程車牌想轉讓...）" 
              class="kqc-input-field"
              :disabled="isLoading"
            />
            <button @click="handleAiMatch" class="btn-match-gold" :disabled="isLoading">
              {{ isLoading ? '匹配中...' : 'AI 語意匹配' }}
            </button>
          </div>
        </div>

        <div class="hero-gauge-right">
          <div class="gauge-card-header">
            <h3>供需晴雨窗</h3>
            <span class="source-lbl">資料來源：政府公開網站</span>
          </div>
          <div class="gauge-card-body">
            <div class="gauge-circle-outer">
              <span class="gauge-num">{{ marketScore }}%</span>
              <span class="gauge-txt">熱絡分數</span>
            </div>
            <div class="gauge-status-info">
              <p class="status-active">🟢 當前市場需求強勁</p>
              <p class="status-advice">建議買家提早布局，賣家即刻掛牌諮詢</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 系統運行狀態標籤 -->
      <div class="system-status-pill">
        <span class="pulse-dot"></span>
        <span class="status-msg">系統全端狀態：{{ backendMessage }}</span>
      </div>

      <!-- 中段嚴格 7:3 比例雙欄區域 -->
      <div class="content-split-73-grid">
        
        <!-- 左側 70% 欄位 -->
        <div class="left-column-70">
          
          <!-- 1. 左側一列三欄核心服務卡片 -->
          <section class="left-services-3col-grid">
            <div v-for="srv in coreServices70" :key="srv.id" class="service-tile-card">
              <span class="tile-tag">{{ srv.tag }}</span>
              <h3 class="tile-title">{{ srv.title }}</h3>
              <p class="tile-desc">{{ srv.desc }}</p>
              <button class="btn-tile-action" @click="router.push(srv.route)">了解更多 ❯</button>
            </div>
          </section>

          <!-- 2. 精選資產輪播圖 (Coverflow) -->
          <section class="kqc-card-block">
            <h2 class="block-section-title">✨ 三爵精選特許資產輪播</h2>
            <div class="swiper-wrapper-container">
              <Swiper
                v-if="bannerSlides && bannerSlides.length > 0"
                :effect="'coverflow'"
                :grab-cursor="true"
                :centered-slides="true"
                :slides-per-view="'auto'"
                :coverflow-effect="{ rotate: 25, stretch: 0, depth: 80, modifier: 1, slideShadows: true }"
                :autoplay="{ delay: 3500, disableOnInteraction: false }"
                :pagination="{ clickable: true }"
                :modules="swiperModules"
                class="kqc-coverflow-swiper"
              >
                <SwiperSlide v-for="(imgUrl, idx) in bannerSlides" :key="idx" class="swiper-custom-slide">
                  <div class="slide-card-surface">
                    <img :src="imgUrl" :alt="`Banner ${idx + 1}`" class="slide-img" />
                    <span class="badge-tag-gold">三爵精選</span>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </section>

          <!-- 3. 核心服務模組對照 (手風琴，高對比度白字) -->
          <section class="kqc-card-block">
            <h2 class="block-section-title text-center">📋 核心服務模組對照</h2>
            <div class="accordion-centered-box">
              <div 
                v-for="(item, index) in accordionItems" 
                :key="index"
                class="accordion-item-row"
                :class="{ active: activeAccordion === index }"
              >
                <div class="accordion-head-bar" @click="activeAccordion = activeAccordion === index ? null : index">
                  <span class="head-title">{{ item.title }}</span>
                  <span class="arrow-icon">{{ activeAccordion === index ? '▲' : '▼' }}</span>
                </div>
                <div v-if="activeAccordion === index" class="accordion-body-text">
                  <p>{{ item.content }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- 4. 客群服務對象 (1 列 4 欄，高度 220px) -->
          <section class="kqc-card-block">
            <h2 class="block-section-title">👥 我們服務的對象，我們始終以客戶為先</h2>
            <div class="customer-4col-large-grid">
              <div v-for="cust in customerTargets" :key="cust.id" class="customer-large-card">
                <span class="cust-badge">{{ cust.tag }}</span>
                <h4 class="cust-name">{{ cust.title }}</h4>
                <p class="cust-detail">{{ cust.desc }}</p>
              </div>
            </div>
          </section>

          <!-- 5. 最新產業洞察 (1 列 2 欄) -->
          <section class="kqc-card-block">
            <div class="block-header-between">
              <h2 class="block-section-title">📰 最新產業洞察</h2>
              <router-link to="/insights" class="link-gold-more">查看更多文章 ❯</router-link>
            </div>
            <div class="insights-2col-grid">
              <article v-for="art in latestInsights" :key="art.id" class="insight-article-card">
                <span class="category-chip">{{ art.category }}</span>
                <h3 class="article-title">{{ art.title }}</h3>
                <p class="article-summary">{{ art.summary }}</p>
                <div class="article-footer-bar">
                  <span class="article-date">{{ art.date }}</span>
                  <button class="btn-read-full" @click="router.push('/insights')">閱讀全文 ❯</button>
                </div>
              </article>
            </div>
          </section>

          <!-- 6. 即時案件卡牌展示櫥窗 -->
          <section class="kqc-card-block">
            <h2 class="block-section-title">💼 即時資產買賣與委託櫥窗</h2>
            <CaseShowcase :cases-data="casesData" />
          </section>

        </div>

        <!-- 右側 30% 欄位 -->
        <aside class="right-column-30">
          <div class="sticky-card-stack">
            <div class="brand-feature-card">
              <div class="feature-icon">🛡️</div>
              <h3>誠信保密交易</h3>
              <p>100% 物理隔絕個資，確保買賣雙方高保密談判環境，維護企業信譽。</p>
            </div>

            <div class="brand-feature-card">
              <div class="feature-icon">⚡</div>
              <h3>秒級 AI 響應</h3>
              <p>全天候 LINE Bot 與 AI 語意對接，即時預約跟進，自動歸點標籤。</p>
            </div>

            <div class="brand-feature-card">
              <div class="feature-icon">📜</div>
              <h3>資深顧問協助</h3>
              <p>協助執照讓渡、驗車證明、營業車位證明與監理站過戶全流程。</p>
            </div>
          </div>
        </aside>

      </div>

      <!-- 預約表單區塊 -->
      <section class="reservation-form-block">
        <h2>聯絡我們</h2>
        <p>歡迎線上預約展示或直接填寫留言，我們的專屬顧問團隊將於 24 小時內連線跟進。</p>
        <button class="btn-reserve-gold-cta" @click="router.push('/contact')">預約展示 ❯</button>
      </section>

      <button class="btn-scroll-to-top" @click="scrollToTop" title="回到頁首">▲</button>
    </main>

    <!-- 右側懸浮 Widget 面板 -->
    <div class="fixed-right-widget-panel">
      <div class="widget-icon-bar">
        <button class="widget-tab-btn" :class="{ active: activeWidgetDrawer === 'ai' }" @click="toggleWidgetDrawer('ai')">
          <span class="tab-icon">🤖</span>
          <span class="tab-label">AI 助理</span>
        </button>
        <button class="widget-tab-btn" :class="{ active: activeWidgetDrawer === 'chat' }" @click="toggleWidgetDrawer('chat')">
          <span class="tab-icon">💬</span>
          <span class="tab-label">立即互動</span>
        </button>
        <button class="widget-tab-btn" :class="{ active: activeWidgetDrawer === 'contact' }" @click="toggleWidgetDrawer('contact')">
          <span class="tab-icon">📞</span>
          <span class="tab-label">真人諮詢</span>
        </button>
      </div>

      <div v-if="activeWidgetDrawer" class="widget-drawer-content">
        <div class="drawer-header-bar">
          <h4 v-if="activeWidgetDrawer === 'ai'">🤖 AI 助理與 LINE 機器人</h4>
          <h4 v-if="activeWidgetDrawer === 'chat'">💬 即時線上諮詢互動</h4>
          <h4 v-if="activeWidgetDrawer === 'contact'">📞 專屬顧問直連電話</h4>
          <button class="btn-close-drawer" @click="activeWidgetDrawer = null">✕</button>
        </div>
        <div class="drawer-body-container">
          <template v-if="activeWidgetDrawer === 'ai'">
            <p class="drawer-tip">您好！請掃碼加入 LINE AI 助理：</p>
            <div class="quick-chip-list">
              <button class="btn-quick-chip">不確定是否符合設立條件？</button>
              <button class="btn-quick-chip">想了解執照買賣流程？</button>
            </div>
          </template>
          <template v-if="activeWidgetDrawer === 'chat'">
            <div class="quick-grid-menu">
              <button class="btn-grid-option">預約諮詢</button>
              <button class="btn-grid-option">常見問題答案</button>
            </div>
          </template>
          <template v-if="activeWidgetDrawer === 'contact'">
            <p class="drawer-tip">專屬顧問直線：(02) 2345-6789</p>
            <button class="btn-submit-contact" @click="router.push('/contact')">請與我聯絡 ❯</button>
          </template>
        </div>
      </div>
    </div>

    <!-- 全域 Footer (1280px 對齊) -->
    <AppFooter :is-expanded="isFooterExpanded" @toggle="isFooterExpanded = !isFooterExpanded" />
  </div>
</template>

<style scoped lang="scss">
.kqc-home-wrapper {
  background-color: var(--bg-main, #f8fafc);
  color: var(--text-main, #1e293b);
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &.dark-mode {
    --bg-main: #0b0f19;
    --text-main: #f8fafc;
  }
}

.kqc-main-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-sizing: border-box;
}

.hero-banner-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 28px;

  .hero-text-left {
    flex: 1.2;

    .hero-badge-gold {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(234, 179, 8, 0.12);
      color: #eab308;
      border: 1px solid #eab308;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .hero-main-title {
      font-size: 1.85rem;
      font-weight: 900;
      color: #1e293b;
      margin: 0 0 12px 0;
      line-height: 1.3;
    }

    .hero-sub-desc { font-size: 0.9rem; color: #64748b; line-height: 1.6; margin-bottom: 20px; }
  }

  .hero-gauge-right {
    flex: 0.8;
    background-color: #1e293b;
    color: #ffffff;
    padding: 24px;
    border-radius: 12px;

    .gauge-card-header {
      display: flex; justify-content: space-between; margin-bottom: 16px;
      h3 { margin: 0; font-size: 1rem; }
      .source-lbl { font-size: 0.75rem; color: #94a3b8; }
    }

    .gauge-card-body {
      display: flex; align-items: center; gap: 16px;

      .gauge-circle-outer {
        width: 80px; height: 80px; border-radius: 50%; border: 5px solid #eab308;
        display: flex; flex-direction: column; align-items: center; justify-content: center;

        .gauge-num { font-size: 1.25rem; font-weight: 900; color: #eab308; }
        .gauge-txt { font-size: 0.65rem; color: #cbd5e1; }
      }

      .gauge-status-info p { margin: 4px 0; font-size: 0.8rem; color: #e2e8f0; }
    }
  }
}

.ai-search-input-group {
  display: flex; gap: 8px;
  .kqc-input-field { flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; }
  .btn-match-gold { padding: 10px 20px; background: #1e293b; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
}

.system-status-pill {
  display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #64748b;
  padding: 6px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; width: fit-content;
  .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; }
}

/* 🔥【核心修復】嚴格 7:3 比例 Grid，設定 min-width: 0 防止內容擠壓 */
.content-split-73-grid {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 28px;
  width: 100%;

  @media (max-width: 1024px) { grid-template-columns: 1fr; }
}

/* 🔥 CRITICAL: 加上 min-width: 0 解除 CSS Grid 自動展開限制 */
.left-column-70 {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* 🔥 CRITICAL: 加上 min-width: 0 與 width: 100% 確保 30% 欄位穩定渲染 */
.right-column-30 {
  min-width: 0;
  width: 100%;

  .sticky-card-stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 80px;

    .brand-feature-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 22px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);

      .feature-icon { font-size: 1.8rem; margin-bottom: 8px; }
      h3 { font-size: 1.05rem; font-weight: 800; color: #1e293b; margin: 0 0 6px 0; }
      p { font-size: 0.825rem; color: #64748b; margin: 0; line-height: 1.55; }
    }
  }
}

/* 左側 70% 區域內的一列三欄卡片 */
.left-services-3col-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;

  @media (max-width: 768px) { grid-template-columns: 1fr; }

  .service-tile-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;

    .tile-tag { font-size: 0.75rem; color: #eab308; font-weight: 800; margin-bottom: 6px; }
    .tile-title { font-size: 1.05rem; font-weight: 800; color: #1e293b; margin: 0 0 8px 0; }
    .tile-desc { font-size: 0.825rem; color: #64748b; line-height: 1.5; margin-bottom: 16px; flex-grow: 1; }

    .btn-tile-action {
      padding: 8px 14px;
      background-color: #1e293b;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;

      &:hover { background-color: #334155; }
    }
  }
}

.kqc-card-block {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;

  .block-section-title { font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0 0 16px 0; &.text-center { text-align: center; } }
  .block-header-between { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; .link-gold-more { color: #eab308; font-weight: 700; text-decoration: none; font-size: 0.85rem; } }
}

.swiper-wrapper-container {
  width: 100%; overflow: hidden;
  .swiper-custom-slide {
    width: 320px; height: 200px;
    .slide-card-surface {
      position: relative; width: 100%; height: 100%; border-radius: 12px; overflow: hidden;
      .slide-img { width: 100%; height: 100%; object-fit: cover; }
      .badge-tag-gold { position: absolute; top: 12px; left: 12px; background: #eab308; color: #1e293b; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; }
    }
  }
}

.accordion-centered-box {
  max-width: 768px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .accordion-item-row {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;

    .accordion-head-bar {
      padding: 14px 18px;
      background: #f8fafc;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-weight: 700;
      color: #1e293b;

      .head-title { flex-grow: 1; text-align: center; color: #1e293b; }
    }

    .accordion-body-text {
      padding: 16px;
      text-align: center;
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.6;
    }

    &.active .accordion-head-bar {
      background: #1e293b;
      
      .head-title, .arrow-icon {
        color: #ffffff !important;
        font-weight: 800;
      }
    }
  }
}

.customer-4col-large-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }

  .customer-large-card {
    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 16px; min-height: 220px; display: flex; flex-direction: column;
    .cust-badge { font-size: 0.75rem; color: #eab308; font-weight: 800; margin-bottom: 8px; }
    .cust-name { font-size: 1rem; color: #1e293b; margin: 0 0 6px 0; font-weight: 800; }
    .cust-detail { font-size: 0.825rem; color: #64748b; line-height: 1.5; margin: 0; }
  }
}

.insights-2col-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
  .insight-article-card {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px;
    .category-chip { font-size: 0.7rem; background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 4px; }
    .article-title { font-size: 0.95rem; font-weight: 800; margin: 8px 0; color: #1e293b; }
    .article-summary { font-size: 0.8rem; color: #64748b; margin-bottom: 16px; line-height: 1.5; }
    .article-footer-bar {
      display: flex; justify-content: space-between; align-items: center;
      .article-date { font-size: 0.75rem; color: #94a3b8; }
      .btn-read-full { padding: 6px 12px; background-color: #1e293b; color: #ffffff; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer; &:hover { background-color: #eab308; color: #1e293b; } }
    }
  }
}

.reservation-form-block {
  text-align: center; background-color: #1e293b; color: #ffffff; padding: 36px 24px; border-radius: 16px;
  h2 { font-size: 1.4rem; font-weight: 800; margin-bottom: 8px; }
  p { font-size: 0.875rem; color: #cbd5e1; margin-bottom: 20px; }
  .btn-reserve-gold-cta { padding: 10px 28px; background-color: #eab308; color: #1e293b; border: none; border-radius: 6px; font-weight: 800; cursor: pointer; }
}

.fixed-right-widget-panel {
  position: fixed; right: 0; top: 50%; transform: translateY(-50%); z-index: 999; display: flex; align-items: center;
  .widget-icon-bar {
    display: flex; flex-direction: column; background-color: #1e293b; border-radius: 8px 0 0 8px; overflow: hidden;
    .widget-tab-btn {
      display: flex; flex-direction: column; align-items: center; padding: 12px 10px; background: transparent; color: #cbd5e1; border: none; border-bottom: 1px solid #334155; cursor: pointer;
      .tab-icon { font-size: 1.2rem; } .tab-label { font-size: 0.65rem; margin-top: 4px; }
      &:hover, &.active { background-color: #eab308; color: #1e293b; }
    }
  }
  .widget-drawer-content {
    width: 280px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px 0 0 8px; padding: 16px;
    .drawer-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; h4 { margin: 0; font-size: 0.95rem; color: #1e293b; } .btn-close-drawer { border: none; background: transparent; cursor: pointer; } }
    .drawer-body-container { font-size: 0.8rem; color: #475569; .btn-quick-chip, .btn-grid-option { padding: 8px 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 6px; cursor: pointer; &:hover { background: #1e293b; color: #ffffff; } } .btn-submit-contact { width: 100%; padding: 10px; background: #eab308; color: #1e293b; border: none; border-radius: 4px; font-weight: 700; margin-top: 10px; cursor: pointer; } }
  }
}

.btn-scroll-to-top {
  position: fixed; bottom: 24px; right: 24px; width: 36px; height: 36px; border-radius: 50%; background: #1e293b; color: #ffffff; border: none; cursor: pointer; z-index: 900;
}
</style>