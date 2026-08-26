<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()
const labels: Record<string, string> = {
  Products: '商品櫥窗',
  Company: '我們公司',
  Insights: '產業洞察',
  Contact: '聯絡我們'
}
const currentLabel = computed(() => labels[String(route.name)])
</script>

<template>
  <nav v-if="currentLabel" class="public-breadcrumb" aria-label="麵包屑導覽">
    <ol>
      <li><RouterLink to="/">首頁</RouterLink></li>
      <li aria-hidden="true"><Icon icon="lucide:chevron-right" /></li>
      <li aria-current="page">{{ currentLabel }}</li>
    </ol>
  </nav>
</template>

<style scoped lang="scss">
.public-breadcrumb {
  width: min(100% - 2rem, 80rem); margin: 0.75rem auto 0; overflow-x: auto;
  ol { display: flex; align-items: center; gap: 0.4rem; min-width: max-content; margin: 0; padding: 0; list-style: none; color: var(--text-muted); font-size: 0.8125rem; }
  svg { width: 0.875rem; height: 0.875rem; }
  a { color: inherit; text-decoration: none; }
  a:hover { color: var(--accent); }
  [aria-current='page'] { color: var(--text-main); font-weight: 600; }
}
</style>
