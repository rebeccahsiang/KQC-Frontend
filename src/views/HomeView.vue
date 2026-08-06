<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import CaseShowcase from '@/components/showcase/CaseShowcase.vue'

// 💡 引入 Swiper Vue 元件
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import { EffectCoverflow, Pagination } from 'swiper/modules'

// 💡 Pinia 全域主題控制 Store
import { useThemeStore } from '../stores/themeStore'

const themeStore = useThemeStore()
const backendMessage = ref<string>('正在連線到後端...')
const swiperModules = [EffectCoverflow, Pagination]

// ⚡ 全端環境變數配置 (防止硬編碼 localhost)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// ⚡【全端核心狀態】
const casesData = ref<any[]>([])     // 雲端資料庫撈回來的真實卡牌陣列
const textInput = ref<string>('')    // 綁定 B2B 車行老闆輸入的白話文
const isLoading = ref<boolean>(false) // 快門控流防止重複發送

// 💡 將 Swiper 圖片網址改為動態資料陣列，避免 Vite 強制本機檔解析
const bannerSlides = [
  'https://swiperjs.com/demos/images/abstract-1.jpg',
  'https://swiperjs.com/demos/images/abstract-2.jpg',
  'https://swiperjs.com/demos/images/abstract-3.jpg',
  'https://swiperjs.com/demos/images/abstract-4.jpg',
  'https://swiperjs.com/demos/images/abstract-5.jpg'
]

// 🔍 核心撮合函式：當車行老闆按下「語意匹配」按鈕時動態觸發
const handleAiMatch = async () => {
  if (!textInput.value.trim()) {
    alert('請先輸入您的白話文車隊、靠行中介或牌照需求！')
    return
  }
  
  try {
    isLoading.value = true
    backendMessage.value = '🤖 三爵 AI 大腦正透過 Circuit Breaker 機制拆解意圖...'
    
    // 📡 前後端正式對線：POST 送給後端 AI 智慧撮合入口
    const response = await axios.post(`${API_BASE_URL}/api/ai/match`, {
      textInput: textInput.value
    })

    if (response.data.success) {
      casesData.value = response.data.data
      backendMessage.value = response.data.isMocked 
        ? `💡 命中快取字典！精準回應符合條件。`
        : `🎯 AI 解析成功！為您在雲端篩選出 ${response.data.count} 筆真實匹配物件。`
    }
  } catch (error: any) {
    console.error('❌ 前端對線攔截報錯：', error)
    backendMessage.value = '🛡️ 觸發 Circuit Breaker 自動斷路防禦，系統無縫降級保底。'
    casesData.value = []
  } finally {
    isLoading.value = false
  }
}

// 當網頁一開機 (Component Mounted)，自動加載公開櫥窗
onMounted(async () => {
  try {
    // 1. 驗證健康檢查 API
    const healthRes = await axios.get(`${API_BASE_URL}/api/health`)
    backendMessage.value = healthRes.data.message

    // 2. 預先向雲端 MongoDB 索取所有公開銷售中的案源
    const casesRes = await axios.get(`${API_BASE_URL}/api/cases`)
    if (casesRes.data.success) {
      casesData.value = casesRes.data.data
      console.log('🎉 成功加載雲端真實櫥窗案件：', casesData.value)
    }
  } catch (error) {
    backendMessage.value = '❌ 無法連線到後端，請確認後端 server.js 是否啟動 (npm run dev)'
    console.error('撈取雲端資料發生錯誤:', error)
  }
})
</script>

<template>
  <main class="home-container">
    <!-- 1. 全端狀態戰情看板 (對齊三爵鋼鐵藍與亮字) -->
    <div class="system-status-bar">
      <p class="status-text">
        <span class="status-icon">🌐</span> 系統全端狀態：{{ backendMessage }}
      </p>
      
      <!-- ☀️/🌙 物理切換主題按鈕 -->
      <button @click="themeStore.toggleTheme" class="theme-toggle-btn">
        {{ themeStore.currentTheme === 'dark' ? '☀️ 轉換明亮模式' : '🌙 進入暗黑戰情室' }}
      </button>
    </div>

    <!-- 2. B2B 語意模糊搜尋區塊 (流金科技風面板) -->
    <div class="ai-search-dashboard">
      <h3 class="search-title">智慧車隊語意媒合系統</h3>
      <p class="search-subtitle">無需繁瑣篩選，傳產車行老闆請隨意打一段白話文需求：</p>
      
      <div class="search-input-group">
        <input 
          v-model="textInput" 
          @keyup.enter="handleAiMatch"
          type="text" 
          placeholder="例：我北部這裡有兩台計程車牌想轉讓..." 
          class="kqc-custom-input"
          :disabled="isLoading"
        />
        <button @click="handleAiMatch" class="kqc-gradient-btn" :disabled="isLoading">
          {{ isLoading ? '撮合中...' : 'AI 語意匹配' }}
        </button>
      </div>
    </div>

    <!-- 3. 案件卡牌展示櫥窗 -->
    <CaseShowcase :cases-data="casesData"/>

    <!-- 4. 3D 輪播演練展示區 (對齊鋼鐵藍容器卡片) -->
    <div class="swiper-section-card">
      <h2 class="swiper-section-title">
        <span>✨</span> 三爵服務體系：Coverflow 輪播演練
      </h2>
      
      <swiper
        :effect="'coverflow'"
        :grabCursor="true"
        :centeredSlides="true"
        :slidesPerView="'auto'"
        :coverflowEffect="{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }"
        :pagination="{ clickable: true }"
        :modules="swiperModules"
        class="mySwiper"
      >
      <!-- ✅ 正確寫法 (加上冒號 :src 屬性綁定，告訴 Vite 這是動態字串網址)： -->
      <swiper-slide v-for="(imgUrl, idx) in bannerSlides" :key="idx" class="swiper-custom-slide">
        <img :src="imgUrl" :alt="`輪播圖 ${idx + 1}`" />
      </swiper-slide>      
      </swiper>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.home-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* 狀態列：採用暗藍透明底與黃金點綴 */
.system-status-bar {
  width: 100%;
  padding: 1rem 1.25rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.status-text {
  color: var(--color-accent);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin: 0;
}

.theme-toggle-btn {
  background-color: var(--bg-main);
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--color-accent);
    color: #0b0f19;
  }
}

/* AI 模糊搜尋區 */
.ai-search-dashboard {
  background-color: var(--bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.2);
  
  .search-title {
    font-size: 1.25rem;
    font-weight: 900;
    color: var(--color-accent);
    letter-spacing: 0.05em;
    margin: 0;
  }
  
  .search-subtitle {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin: 0.5rem 0 1.5rem 0;
  }
}

.search-input-group {
  display: flex;
  gap: 1rem;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.kqc-custom-input {
  flex: 1;
  background-color: var(--bg-main);
  border: 1px solid var(--color-border);
  color: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  outline: none;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: var(--color-accent);
  }
}

.kqc-gradient-btn {
  background: linear-gradient(135deg, var(--color-accent), #facc15);
  color: #0b0f19;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.2s ease;
  
  &:hover {
    filter: brightness(1.1);
  }
  
  &:active {
    transform: scale(0.98);
  }
}

/* Swiper 容器 */
.swiper-section-card {
  width: 100%;
  background-color: var(--bg-surface);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.swiper-section-title {
  font-size: 1.15rem;
  font-weight: bold;
  color: var(--color-accent);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: 0.5px;
}

.mySwiper {
  width: 100%;
  padding-top: 1rem;
  padding-bottom: 2rem;
}

.swiper-custom-slide {
  background-position: center;
  background-size: cover;
  width: 300px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
}
</style>
