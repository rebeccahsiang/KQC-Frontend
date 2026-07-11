<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Button from 'primevue/button'
import Card from 'primevue/card'
import CaseCard from '@/components/CaseCard.vue'

// 💡 引入 Swiper Vue 元件
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import { EffectCoverflow, Pagination } from 'swiper/modules'

const backendMessage = ref<string>('正在連線到後端...')
const swiperModules = [EffectCoverflow, Pagination]

// 💡 【核心重構】：原本這裡塞滿了很長的假資料，現在初始化為一個「乾淨的空陣列」！
const casesData = ref<any[]>([])

// 💡 當網頁一開機 (Component Mounted)，立刻執行全端非同步撈取
onMounted(async () => {
  try {
    // 1. 驗證健康檢查 API
    const healthRes = await axios.get('http://localhost:3000/api/health')
    backendMessage.value = healthRes.data.message

    // 2. ⚡【全端合體大招】：直接向後端路由索取雲端 MongoDB 的真實公開案件！
    const casesRes = await axios.get('http://localhost:3000/api/cases')
    
    if (casesRes.data.success) {
      // 把從雲端抓回來的 data 陣列，直接灌進我們的響應式變數
      casesData.value = casesRes.data.data
      console.log('🎉 成功從雲端抓取到真實案件：', casesData.value)
    }
  } catch (error) {
    backendMessage.value = '❌ 無法連線到後端，請確認後端 server.js 是否啟動 (npm run dev)'
    console.error('撈取雲端資料發生錯誤:', error)
  }
})
</script>

<template>
  <main class="p-8 max-w-6xl mx-auto w-full flex flex-col gap-10">
    <div class="w-full p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
      <p class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2 text-sm">
        <span>🌐</span> 系統全端狀態：{{ backendMessage }}
      </p>
    </div>

    <div class="space-y-6">
      <h2 class="text-2xl font-black text-surface-900 dark:text-surface-0 border-l-4 border-primary-500 pl-3 tracking-wide">
        三爵精選：業務櫥窗
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <CaseCard v-for="item in casesData" :key="item.caseId" :data="item" />
        
<Card class="shadow-xl rounded-2xl border border-dashed border-primary-400/50 dark:border-primary-600/40 bg-surface-50/5 dark:bg-surface-800/10 text-center flex flex-col justify-center items-center p-6 h-full">
  <template #content>
    <div class="flex flex-col items-center justify-center py-10 space-y-6">
      <div class="w-16 h-16 bg-primary-600/20 text-primary-400 rounded-full flex items-center justify-center text-3xl shadow-inner animate-pulse">
        <i class="pi pi-plus"></i>
      </div>
      <div class="space-y-2">
        <h4 class="text-xl font-bold text-white tracking-wide">您的事業，價值多少？</h4>
        <p class="text-xs text-surface-400 max-w-xs mx-auto leading-relaxed">
          別讓昂貴的資產與車頭曬太陽。我們有活躍的運輸駕駛與資產社群，為您精準媒合。
        </p>
      </div>
      <Button label="立即委託招募" severity="help" size="small" rounded raised />
    </div>
  </template>
</Card>
      </div>
    </div>

    <div class="w-full bg-surface-900 p-8 rounded-2xl shadow-2xl border border-surface-800">
      <h2 class="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2 tracking-wide">
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
      >
        <swiper-slide class="swiper-custom-slide"><img src="https://swiperjs.com/demos/images/abstract-1.jpg" class="rounded-xl shadow-lg" /></swiper-slide>
        <swiper-slide class="swiper-custom-slide"><img src="https://swiperjs.com/demos/images/abstract-2.jpg" class="rounded-xl shadow-lg" /></swiper-slide>
        <swiper-slide class="swiper-custom-slide"><img src="https://swiperjs.com/demos/images/abstract-3.jpg" class="rounded-xl shadow-lg" /></swiper-slide>
        <swiper-slide class="swiper-custom-slide"><img src="https://swiperjs.com/demos/images/abstract-4.jpg" class="rounded-xl shadow-lg" /></swiper-slide>
        <swiper-slide class="swiper-custom-slide"><img src="https://swiperjs.com/demos/images/abstract-5.jpg" class="rounded-xl shadow-lg" /></swiper-slide>
      </swiper>
    </div>
  </main>
</template>

<style scoped>
.swiper-custom-slide {
  background-position: center;
  background-size: cover;
  width: 300px;
  height: 300px;
}
.swiper-custom-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>