<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import FrontHeader from '@/components/layout/FrontHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import PublicBreadcrumb from '@/components/layout/PublicBreadcrumb.vue'
import BackToTop from '@/components/layout/BackToTop.vue'
import PublicFaqModal from '@/components/public/PublicFaqModal.vue'
import HomeServiceDock from '@/components/home/HomeServiceDock.vue'
import { publicServicePanelKey, type PublicServicePanel } from '@/composables/publicServicePanel'

const route = useRoute()
const floatingServiceRouteNames = new Set(['Home', 'Products', 'Insights', 'InsightDetail', 'Company'])
const showFloatingServiceNavigation = computed(() => floatingServiceRouteNames.has(String(route.name)))
const activePanel = ref<PublicServicePanel | null>(null)
const openServicePanel = (panel: PublicServicePanel) => { activePanel.value = panel }

provide(publicServicePanelKey, { activePanel, openServicePanel })
watch(showFloatingServiceNavigation, (visible) => { if (!visible) activePanel.value = null })
</script>

<template>
  <div class="public-layout">
    <FrontHeader />
    <PublicBreadcrumb />
    <div class="public-layout__content"><RouterView /></div>
    <HomeServiceDock v-if="showFloatingServiceNavigation" :active-panel="activePanel" @update:active-panel="activePanel = $event" />
    <BackToTop />
    <AppFooter />
    <PublicFaqModal />
  </div>
</template>

<style scoped lang="scss">
.public-layout { min-height: 100vh; padding-top: 1rem; display: flex; flex-direction: column; background: var(--bg-main); color: var(--text-main); }
.public-layout__content { flex: 1; min-width: 0; }
</style>

<style lang="scss">
@use '@/components/home/homeSections';
</style>
