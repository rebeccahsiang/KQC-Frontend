<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useThemeStore } from './stores/themeStore' // 導入 Pinia 主題大腦

const themeStore = useThemeStore()

// 🚀 全站靈魂初始化：確保車行老闆一開網頁或重整時，主題完全不閃爍跑版
onMounted(() => {
  themeStore.initTheme()
})
</script>

<template>
  <div class="kqc-global-wrapper">
    <!-- Vue Router 會將比對到的頁面渲染於此 -->
    <router-view />
  </div>
</template>

<style>
/* 全域 CSS 重置 (CSS Reset) 與無障礙預設值 */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 💡 乾淨、無雜質、100% 亮綠燈的原生全域通電寫法 */
.kqc-global-wrapper {
  min-height: 100vh;
  background-color: var(--bg-main); /* 實時對齊黑曜石深邃灰黑 / 雲霧極光白 */
  color: var(--text-main);        /* 實時對齊鉑金流光白 / 石墨深灰 */
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
