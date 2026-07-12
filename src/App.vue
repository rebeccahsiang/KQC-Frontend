<!-- src/App.vue -->
<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue';
import { useThemeStore } from './stores/theme'; // 導入 TS 版 Pinia 大腦

const themeStore = useThemeStore();

// 🚀 全站靈魂初始化：確保車行老闆一開網頁、或重整時，主題完全不閃爍跑版
onMounted(() => {
  themeStore.initTheme();
});
</script>

<template>
  <!-- 運用 CSS 變數動態對齊全站背景與文字色，transition 帶來毫秒級流暢轉場 -->
  <div class="kqc-global-wrapper">
    <RouterView />
  </div>
</template>

<style>
/* 💡 乾淨、無雜質、100% 亮綠燈的原生全域通電寫法 */
.kqc-global-wrapper {
  min-height: 100vh;
  background-color: var(--bg-main); /* 實時對齊黑曜石深邃灰黑 */
  color: var(--text-main);           /* 實時對齊鉑金流光白 */
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
