<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { startAuthActivityTracker } from '@/auth/activityTracker'
import AuthModal from '@/components/auth/AuthModal.vue'
import PublicLayout from '@/components/layout/PublicLayout.vue'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const publicRouteNames = new Set(['Home', 'Products', 'Company', 'Insights', 'InsightDetail', 'Contact'])
const usesPublicLayout = computed(() => publicRouteNames.has(String(route.name)))
let stopAuthActivityTracker: (() => void) | null = null

watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated, wasAuthenticated) => {
    if (
      wasAuthenticated &&
      !isAuthenticated &&
      router.currentRoute.value.name === 'MemberSessions'
    ) {
      await router.replace({ name: 'Home' })
      authStore.openAuthModal('login', '登入狀態已失效，請重新登入。')
    }
  }
)

// 🎯 防範 FOUC (Flash of Unstyled Content) 白閃 Bug：DOM 繪製前初始化主題屬性
themeStore.initTheme()

onMounted(() => {
  stopAuthActivityTracker = startAuthActivityTracker(authStore)
})

onUnmounted(() => {
  stopAuthActivityTracker?.()
  stopAuthActivityTracker = null
})
</script>

<template>
  <div class="kqc-global-wrapper">
    <!-- 1. 核心頁面渲染（僅保留單一 RouterView 避免重複繪製） -->
    <PublicLayout v-if="usesPublicLayout" />
    <RouterView v-else />

    <!-- 2. 全域彈跳登入/註冊模組（置於 wrapper 內部以完整繼承 --bg-main 與 --text-primary 主題變數） -->
    <AuthModal />
  </div>
</template>

<style lang="scss">
/* 
  💡 Vite 已於 vite.config.ts 設定 SCSS 全域注入，
  無需重複寫入 @use "@/assets/styles/_variables.scss" as *;
*/
.kqc-global-wrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
