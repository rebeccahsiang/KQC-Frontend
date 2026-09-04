<script setup lang="ts">
import { inject, onMounted } from 'vue'
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
import { useCaseStore } from '@/stores/useCaseStore'
import { publicServicePanelKey } from '@/composables/publicServicePanel'

const themeStore = useThemeStore()
const caseStore = useCaseStore()
const { activePanel, openServicePanel } = inject(publicServicePanelKey)!

onMounted(() => {
  /* PRODUCT-CASE-B4 — Homepage Marketplace Authority / Home loads only its canonical public Marketplace data. */
  void caseStore.fetchPublicCases()
})
</script>

<template>
  <div class="kqc-home-wrapper" :class="{ 'dark-mode': themeStore.isDark }">
    <main class="kqc-main-container">
      <HomeHeroSection />
      <HomeIndustryWeatherSection />
      <!-- D2G-B — Homepage Section Placement: Weather → Carousel → Featured Services. -->
      <HomeCarouselSection />
      <HomePromoCarouselSection />
      <HomeServiceGuideSection :active-panel="activePanel" @open-panel="openServicePanel" />
      <HomePersonasSection />
      <HomeInsightsSection />
      <HomeLegacyCasesSection :cases="caseStore.cases" :loading="caseStore.isLoading" :error="caseStore.error" />
      <HomeContactCtaSection />
    </main>
  </div>
</template>
