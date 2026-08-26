<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useThemeStore } from '@/stores/themeStore'
import HomeHeroSection from '@/components/home/HomeHeroSection.vue'
import HomeIndustryWeatherSection from '@/components/home/HomeIndustryWeatherSection.vue'
import HomePromoCarouselSection from '@/components/home/HomePromoCarouselSection.vue'
import HomeServiceGuideSection from '@/components/home/HomeServiceGuideSection.vue'
import HomePersonasSection from '@/components/home/HomePersonasSection.vue'
import HomeInsightsSection from '@/components/home/HomeInsightsSection.vue'
import HomeContactCtaSection from '@/components/home/HomeContactCtaSection.vue'
import HomeLegacyCasesSection from '@/components/home/HomeLegacyCasesSection.vue'
import HomeServiceDock from '@/components/home/HomeServiceDock.vue'

const themeStore = useThemeStore()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const backendMessage = ref('正在連線到後端 API...')
const casesData = ref<any[]>([])
const textInput = ref('')
const isLoading = ref(false)

const handleAiMatch = async () => {
  if (!textInput.value.trim()) return
  try {
    isLoading.value = true
    const response = await axios.post(`${apiBaseUrl}/api/ai/match`, { textInput: textInput.value })
    if (response.data.success) {
      casesData.value = response.data.data
      backendMessage.value = `AI 已找到 ${response.data.count || casesData.value.length} 筆相關案件`
    }
  } catch {
    backendMessage.value = 'AI 匹配服務暫時無法使用，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    const health = await axios.get(`${apiBaseUrl}/api/health`)
    backendMessage.value = health.data.message
    const cases = await axios.get(`${apiBaseUrl}/api/cases`)
    if (cases.data.success) casesData.value = cases.data.data
  } catch {
    backendMessage.value = '目前為離線瀏覽模式，仍可查看網站內容。'
  }
})
</script>

<template>
  <div class="kqc-home-wrapper" :class="{ 'dark-mode': themeStore.isDark }">
    <main class="kqc-main-container">
      <HomeHeroSection v-model="textInput" :loading="isLoading" @submit="handleAiMatch" />
      <HomeIndustryWeatherSection />
      <div class="system-status-pill"><span class="pulse-dot"></span><span class="status-msg">系統全端狀態：{{ backendMessage }}</span></div>
      <HomePromoCarouselSection />
      <HomeServiceGuideSection />
      <HomePersonasSection />
      <HomeInsightsSection />
      <HomeLegacyCasesSection :cases="casesData" />
      <HomeContactCtaSection />
    </main>
    <HomeServiceDock />
  </div>
</template>

<style lang="scss">
@use '@/components/home/homeSections';
</style>
