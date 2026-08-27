<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
<template>
  <!-- Industry Insights / WEB-1F-D2B — D2C owns the full article detail surface. -->
  <main class="insight-detail-deferred"><p>Industry Insights</p><h1>文章內容即將推出</h1><RouterLink to="/insights">返回產業洞察</RouterLink></main>
</template>
<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.insight-detail-deferred { display: grid; width: min(100% - 2rem, 60rem); min-height: 55vh; margin-inline: auto; place-content: center; gap: $kqc-spacing-md; text-align: center; }
.insight-detail-deferred p { margin: 0; color: var(--accent-active); font-size: $kqc-type-label; font-weight: 700; }
.insight-detail-deferred h1 { margin: 0; color: var(--text-main); font-size: $kqc-type-section-title; }
.insight-detail-deferred a { color: var(--accent-active); }
</style>
