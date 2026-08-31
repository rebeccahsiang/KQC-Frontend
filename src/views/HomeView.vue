<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useThemeStore } from '@/stores/themeStore'
import HomeHeroSection from '@/components/home/HomeHeroSection.vue'
import HomeIndustryWeatherSection from '@/components/home/HomeIndustryWeatherSection.vue'
import HomeCarouselSection from '@/components/home/HomeCarouselSection.vue'
import HomePromoCarouselSection from '@/components/home/HomePromoCarouselSection.vue'
import HomeServiceGuideSection from '@/components/home/HomeServiceGuideSection.vue'
import HomePersonasSection from '@/components/home/HomePersonasSection.vue'
import HomeInsightsSection from '@/components/home/HomeInsightsSection.vue'
import HomeContactCtaSection from '@/components/home/HomeContactCtaSection.vue'
import HomeLegacyCasesSection from '@/components/home/HomeLegacyCasesSection.vue'
import HomeServiceDock from '@/components/home/HomeServiceDock.vue'
import { useCaseStore } from '@/stores/useCaseStore'

type ServicePanel = 'ai' | 'quick-service' | 'human'

const themeStore = useThemeStore()
const caseStore = useCaseStore()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const backendMessage = ref('正在連線到後端 API...')
const textInput = ref('')
const isLoading = ref(false)
const activePanel = ref<ServicePanel | null>(null)

const openServicePanel = (panel: ServicePanel) => {
  activePanel.value = panel
}

const handleAiMatch = async () => {
  if (!textInput.value.trim()) return
  try {
    isLoading.value = true
    const response = await axios.post(`${apiBaseUrl}/api/ai/match`, { textInput: textInput.value })
    if (response.data.success) {
      backendMessage.value = `AI 已找到 ${response.data.count || response.data.data?.length || 0} 筆相關案件`
    }
  } catch {
    backendMessage.value = 'AI 匹配服務暫時無法使用，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  /* PRODUCT-CASE-B4 — Homepage Marketplace Authority / marketplace loading is independent from the legacy health surface. */
  await caseStore.fetchPublicCases()
  try {
    const health = await axios.get(`${apiBaseUrl}/api/health`)
    backendMessage.value = health.data.message
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
      <!-- D2G-B — Homepage Section Placement: Weather → Carousel → Featured Services. -->
      <HomeCarouselSection />
      <HomePromoCarouselSection />
      <HomeServiceGuideSection :active-panel="activePanel" @open-panel="openServicePanel" />
      <HomePersonasSection />
      <HomeInsightsSection />
      <HomeLegacyCasesSection :cases="caseStore.cases" :loading="caseStore.isLoading" :error="caseStore.error" />
      <HomeContactCtaSection />
    </main>
    <HomeServiceDock :active-panel="activePanel" @update:active-panel="activePanel = $event" />
  </div>
</template>

<style lang="scss">
@use '@/components/home/homeSections';
</style>
