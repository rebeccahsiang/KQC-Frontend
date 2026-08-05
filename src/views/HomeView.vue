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

// 💡 核心通電：引入 TypeScript 規格的 Pinia 全域主題控制大腦
import { useThemeStore } from '../stores/themeStore'

const themeStore = useThemeStore()
const backendMessage = ref<string>('正在連線到後端...')
const swiperModules = [EffectCoverflow, Pagination]

// ⚡【全端核心狀態】
const casesData = ref<any[]>([])     // 雲端資料庫撈回來的真實卡牌陣列
const textInput = ref<string>('')    // 綁定 B2B 車行老闆輸入的白話文
const isLoading = ref<boolean>(false) // 防止重複點擊的快門控流

// 🔍 核心撮合函式：當車行老闆按下「語意匹配」按鈕時動態觸發
const handleAiMatch = async () => {
  if (!textInput.value.trim()) {
    alert('請先輸入您的白話文車隊、靠行中介或牌照需求！')
    return
  }
  
  try {
    isLoading.value = true
    backendMessage.value = '🤖 三爵 AI 大腦正透過 Circuit Breaker 機制拆解意圖...'
    
    // 📡 前後端正式對線：POST 送給後端 AI 智慧撮合入口門牌
    const response = await axios.post('http://localhost:3000/api/ai/match', {
      textInput: textInput.value
    })

    if (response.data.success) {
      // 🎯 實時解鎖：將後端 select('-crmData') 安全遮蔽後的卡牌直接更新至櫥窗
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
    const healthRes = await axios.get('http://localhost:3000/api/health')
    backendMessage.value = healthRes.data.message

    // 2. ⚡【全端合體】：預先向雲端 MongoDB 索取所有公開銷售中的案源
    const casesRes = await axios.get('http://localhost:3000/api/cases')
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
  <main class="p-8 max-w-6xl mx-auto w-full flex flex-col gap-10">
    <!-- 全端狀態戰情看板 -->
    <div class="w-full p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl flex justify-between items-center transition-all duration-300">
      <p class="text-emerald-600 dark:text-emerald-400 Hon font-semibold flex items-center gap-2 text-sm">
        <span>🌐</span> 系統全端狀態：{{ backendMessage }}
      </p>
      
      <!-- ☀️/🌙 物理切換時空按鈕 -->
      <button @click="themeStore.toggleTheme" class="theme-toggle-btn">
        {{ themeStore.currentTheme === 'dark' ? '☀️ 轉換明亮模式' : '🌙 進入暗黑戰情室' }}
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- 🤖 新增：B2B 語意模糊搜尋區塊 (流金科技風面板) -->
    <!-- ========================================================================= -->
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

    <!-- 案件卡牌展示櫥窗 -->
    <CaseShowcase :cases-data="casesData" />

    <!-- 3D 輪播演練展示區 -->
    <div class="w-full bg-surface-900 p-8 rounded-2xl shadow-2xl border border-surface-800">[cite: 2]
      <h2 class="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2 tracking-wide">[cite: 2]
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
        class="mySwiper w-full py-8"
      >[cite: 2]
        <swiper-slide class="swiper-custom-slide"><img src="https://swiperjs.com/demos/images/abstract-1.jpg" class="rounded-xl shadow-lg" /></swiper-slide>[cite: 2]
        <swiper-slide class="swiper-custom-slide"><img src="https://swiperjs.com/demos/images/abstract-2.jpg" class="rounded-xl shadow-lg" /></swiper-slide>[cite: 2]
        <swiper-slide class="swiper-custom-slide"><img src="https://swiperjs.com/demos/images/abstract-3.jpg" class="rounded-xl shadow-lg" /></swiper-slide>[cite: 2]
        <swiper-slide class="swiper-custom-slide"><img src="https://swiperjs.com/demos/images/abstract-4.jpg" class="rounded-xl shadow-lg" /></swiper-slide>[cite: 2]
        <swiper-slide class="swiper-custom-slide"><img src="https://swiperjs.com/demos/images/abstract-5.jpg" class="rounded-xl shadow-lg" /></swiper-slide>[cite: 2]
      </swiper>
    </div>
  </main>
</template>

<style lang="scss" scoped>
/*
=========================================================================
 🎨 前端切版風格調配：數位轉型流金科技感樣式
========================================================================
*/ 

.theme-toggle-btn {
  background-color: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--brand-primary);
    color: #0B0F19;
  }
}

.ai-search-dashboard {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
  
  .search-title {
    font-size: 1.25rem;
    font-weight: 900;
    color: var(--brand-primary);
    letter-spacing: 0.05em;
  }
  
  .search-subtitle {
    font-size: 0.85rem;
    color: var(--text-muted);
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
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  outline: none;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: var(--brand-primary);
  }
}

.kqc-gradient-btn {
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-gradient));
  color: #0B0F19;
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

.swiper-custom-slide {
  background-position: center; /* 💡 修正：刪除所有 雜質 */
  background-size: cover;
  width: 300px;
  height: 300px;
}

.swiper-custom-slide img {
  display: block;              /* 💡 修正：刪除所有[cite: 2] 雜質 */
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>