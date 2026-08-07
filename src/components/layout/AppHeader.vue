<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()

// 動態從 Vue Router 取出目前頁面的 meta.title 當作麵包屑
const breadcrumbs = computed(() => {
  return route.matched.filter(item => item.meta && item.meta.title)
})

// 頁面重新整理
const refreshPage = () => {
  window.location.reload()
}
</script>

<template>
  <header class="h-16 bg-[var(--primary)] border-b border-slate-700/50 px-6 flex items-center justify-between flex-shrink-0 select-none">
    <!-- 左側：動態麵包路徑 (Breadcrumbs) -->
    <div class="flex items-center gap-2 text-sm">
      <div class="flex items-center gap-1.5 text-slate-400">
        <Icon icon="lucide:layout-dashboard" class="w-4 h-4 text-[var(--accent)]" />
        <span>三爵控制台</span>
      </div>
      
      <Icon icon="lucide:chevron-right" class="w-4 h-4 text-slate-600" />

      <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
        <span class="font-medium text-white tracking-wide">
          {{ crumb.meta.title }}
        </span>
        <Icon 
          v-if="index < breadcrumbs.length - 1" 
          icon="lucide:chevron-right" 
          class="w-4 h-4 text-slate-600" 
        />
      </template>
    </div>

    <!-- 右側：戰情室全域功能 Icon 區塊 -->
    <div class="flex items-center gap-3">
      <!-- 1. 重新整理 -->
      <button 
        @click="refreshPage"
        class="p-2 hover:bg-slate-700/60 rounded-lg text-slate-400 hover:text-[var(--accent)] transition-colors"
        title="重新整理數據"
      >
        <Icon icon="lucide:refresh-cw" class="w-4.5 h-4.5" />
      </button>

      <!-- 2. LINE Bot Webhook 即時通知狀態 -->
      <button 
        class="p-2 hover:bg-slate-700/60 rounded-lg text-slate-400 hover:text-[var(--accent)] transition-colors relative"
        title="LINE Bot 即時對接通知"
      >
        <Icon icon="lucide:bell" class="w-4.5 h-4.5" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent)] rounded-full animate-ping"></span>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent)] rounded-full"></span>
      </button>

      <div class="h-4 w-[1px] bg-slate-700 mx-1"></div>

      <!-- 3. 管理員資訊小徽章 -->
      <div class="flex items-center gap-2 pl-1">
        <span class="px-2 py-0.5 text-[11px] font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded">
          高階權限
        </span>
        <span class="text-xs text-slate-300 font-medium">項圓芬 (3號)</span>
      </div>
    </div>
  </header>
</template>