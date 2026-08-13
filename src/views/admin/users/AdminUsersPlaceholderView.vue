<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sectionLabel = computed(() => String(route.meta.userSectionLabel || '帳號'))
</script>

<template>
  <section class="placeholder-card">
    <div class="placeholder-icon"><Icon icon="lucide:users" /></div>
    <div>
      <p class="eyebrow">帳號管理</p>
      <h1>{{ sectionLabel }}</h1>
      <p>此路由已完成後台導覽與權限保護；資料表及 API 整合將於 Phase 1C-B2 實作。</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.placeholder-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  border: 1px solid var(--border-grey);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}
.placeholder-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 10px; background: var(--bg-active); color: var(--primary); }
.placeholder-icon svg { width: 21px; height: 21px; }
.eyebrow { margin: 0 0 4px; color: var(--accent-active); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; }
h1 { margin: 0 0 8px; color: var(--text-main); font-size: 1.45rem; }
p { margin: 0; color: var(--text-muted); line-height: 1.6; }
</style>
