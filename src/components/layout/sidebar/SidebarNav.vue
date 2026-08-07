<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { menuTree } from './menuConfig'
import SidebarMenuItem from './SidebarMenuItem.vue'

// 控制側邊欄展開/折疊狀態
const isCollapsed = ref(false)
</script>

<template>
  <aside
    :class="[
      'h-screen sticky top-0 bg-[var(--primary)] text-slate-200 transition-all duration-300 flex flex-col border-r border-slate-700/50 shadow-xl z-20 select-none',
      isCollapsed ? 'w-24' : 'w-64'
    ]"
  >
    <!-- 1. 頂部 Header：Logo 與收折按鈕 (精準 Flex 控管，嚴格防重疊) -->
    <div 
      :class="[
        'h-16 flex-shrink-0 flex items-center border-b border-slate-700/50 transition-all duration-300 overflow-hidden',
        isCollapsed ? 'px-3 justify-center gap-2' : 'px-4 justify-between'
      ]"
    >
      <!-- 左側品牌標誌區塊 -->
      <div class="flex items-center gap-2.5 min-w-0 flex-shrink-0">
        <!-- KQC 品牌 Icon：固定 32x32px 不可壓縮 -->
        <div class="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center font-bold text-slate-900 shadow-md flex-shrink-0 min-w-[32px] min-h-[32px]">
          KQC
        </div>
        
        <!-- 系統標題：僅在展開時顯示 -->
        <span 
          v-if="!isCollapsed" 
          class="font-bold text-lg tracking-wider whitespace-nowrap text-white truncate min-w-0"
        >
          三爵後台管理
        </span>
      </div>

      <!-- 收折控制按鈕：獨立 32x32px 實體按鈕，緊跟在 Logo 右側面，絕不重疊 -->
      <button
        @click="isCollapsed = !isCollapsed"
        class="w-8 h-8 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-[var(--accent)] transition-all flex items-center justify-center flex-shrink-0 min-w-[32px] min-h-[32px] shadow-sm"
        :title="isCollapsed ? '展開側邊欄' : '折疊側邊欄'"
      >
        <Icon 
          :icon="isCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" 
          class="w-4.5 h-4.5 flex-shrink-0" 
        />
      </button>
    </div>

    <!-- 2. 中央選單列表區塊 -->
    <nav 
      :class="[
        'flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1.5 custom-sidebar-scroll',
        isCollapsed ? 'flex flex-col items-center' : ''
      ]"
    >
      <SidebarMenuItem
        v-for="item in menuTree"
        :key="item.id"
        :item="item"
        :isCollapsed="isCollapsed"
      />
    </nav>

    <!-- 3. 底部管理員資訊區塊 -->
    <div class="p-3 border-t border-slate-700/50 flex-shrink-0">
      <div :class="['flex items-center gap-3 p-2 rounded-lg bg-slate-800/60 transition-all', isCollapsed ? 'justify-center' : '']">
        <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[var(--accent)] font-semibold border border-[var(--accent)]/30 flex-shrink-0">
          <Icon icon="lucide:user-check" class="w-4 h-4" />
        </div>
        <div v-if="!isCollapsed" class="overflow-hidden">
          <p class="text-xs font-semibold text-white truncate">系統管理員</p>
          <p class="text-[10px] text-slate-400 truncate">admin@kqc.com.tw</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.custom-sidebar-scroll {
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 4px;
    &:hover {
      background: var(--accent);
    }
  }
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
}
</style>
