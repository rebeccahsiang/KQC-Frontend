<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import PanelMenu from 'primevue/panelmenu'
import TieredMenu from 'primevue/tieredmenu'
import { sidebarMenu, SidebarMenuItem } from '@/config/sidebarMenu'

const router = useRouter()
const route = useRoute()

// 控制側邊欄展開/折疊狀態
const isCollapsed = ref(false)

// 當前登入用戶角色 (預設為 admin)
const currentRole = ref('admin')

// 權限過濾遞迴函式
const filterMenuByRole = (items: SidebarMenuItem[], role: string): SidebarMenuItem[] => {
  return items
    .filter(item => {
      // 若項目有定義 roles，且當前 role 不在其中，則過濾
      if (item.roles && !item.roles.includes(role)) {
        return false
      }
      return true
    })
    .map(item => {
      const newItem = { ...item }
      if (newItem.children) {
        newItem.children = filterMenuByRole(newItem.children, role)
      }
      return newItem
    })
}

// 根據權限過濾後的選單
const allowedMenu = computed(() => {
  return filterMenuByRole(sidebarMenu, currentRole.value)
})

// 轉換為 PrimeVue PanelMenu / TieredMenu 的 items 格式
const panelMenuItems = computed(() => {
  return allowedMenu.value.map(item => transformToPrimeItem(item))
})

const transformToPrimeItem = (item: SidebarMenuItem): any => {
  return {
    label: item.title,
    icon: item.icon,
    route: item.path,
    items: item.children && item.children.length > 0
      ? item.children.map(child => transformToPrimeItem(child))
      : undefined
  }
}

// 用於摺疊狀態的 TieredMenu 彈出控制
const tieredMenuRef = ref<any>(null)
const activeSubMenu = ref<any[]>([])

const handleCollapsedItemClick = (event: Event, item: SidebarMenuItem) => {
  if (item.children && item.children.length > 0) {
    // 轉換子選單為 PrimeVue items 格式
    activeSubMenu.value = item.children.map(child => ({
      label: child.title,
      icon: child.icon,
      command: () => {
        if (child.path) router.push(child.path)
      }
    }))
    tieredMenuRef.value.toggle(event)
  } else if (item.path) {
    router.push(item.path)
  }
}
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
    <div :class="['flex-1 overflow-y-auto overflow-x-hidden p-3 custom-sidebar-scroll', isCollapsed ? 'flex flex-col items-center' : '']">
      <!-- A. 展開狀態：使用 PrimeVue PanelMenu -->
      <div v-if="!isCollapsed" class="w-full sidebar-panelmenu-container">
        <PanelMenu :model="panelMenuItems" class="w-full">
          <template #item="{ item }">
            <router-link
              v-if="item.route"
              :to="item.route"
              v-slot="{ href, navigate, isActive }"
              custom
            >
              <a
                :href="href"
                @click="navigate"
                :class="[
                  'flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-sm font-medium w-full my-0.5',
                  isActive
                    ? 'bg-[var(--accent)] text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                ]"
              >
                <Icon
                  :icon="(item.icon as string)"
                  :class="[
                    'w-5 h-5 flex-shrink-0 transition-transform',
                    isActive ? 'text-slate-950' : 'text-amber-400/90'
                  ]"
                />
                <span class="whitespace-nowrap tracking-wide flex-1 text-left">
                  {{ item.label }}
                </span>
              </a>
            </router-link>

            <div
              v-else
              class="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-sm font-medium w-full cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 my-0.5"
            >
              <div class="flex items-center gap-3">
                <Icon
                  :icon="(item.icon as string)"
                  class="w-5 h-5 flex-shrink-0 text-amber-400/90"
                />
                <span class="whitespace-nowrap tracking-wide">
                  {{ item.label }}
                </span>
              </div>
              <Icon
                icon="lucide:chevron-down"
                class="w-4 h-4 text-slate-400 p-panelmenu-icon-transition"
              />
            </div>
          </template>
        </PanelMenu>
      </div>

      <!-- B. 摺疊狀態：顯示單個 icon，並在有點擊時彈出 TieredMenu -->
      <div v-else class="flex flex-col items-center gap-2 w-full">
        <button
          v-for="item in allowedMenu"
          :key="item.id"
          @click="handleCollapsedItemClick($event, item)"
          :class="[
            'w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center relative group',
            item.path && route.path === item.path
              ? 'bg-[var(--accent)] text-slate-950 shadow-lg shadow-amber-500/20'
              : 'hover:bg-slate-800 text-slate-300 hover:text-white'
          ]"
          :title="item.title"
        >
          <Icon
            :icon="item.icon"
            :class="[
              'w-5 h-5 transition-transform group-hover:scale-110',
              item.path && route.path === item.path ? 'text-slate-950' : 'text-amber-400/90'
            ]"
          />
          <!-- 懸浮 Tooltip 提示 -->
          <div class="absolute left-16 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            {{ item.title }}
          </div>
        </button>
        <!-- 全域懸浮 TieredMenu 元件 -->
        <TieredMenu ref="tieredMenuRef" :model="activeSubMenu" popup class="dark-tiered-menu" />
      </div>
    </div>

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

<style lang="scss">
// 全域與局部覆蓋 PrimeVue PanelMenu 預設背景與樣式以完美融合戰情室美學
.sidebar-panelmenu-container {
  .p-panelmenu {
    background: transparent !important;
    border: none !important;
    gap: 4px;
    display: flex;
    flex-direction: column;
  }
  
  .p-panelmenu-header {
    background: transparent !important;
    border: none !important;
    
    .p-panelmenu-header-content {
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
    }
  }

  .p-panelmenu-content {
    background: transparent !important;
    border: none !important;
    padding-left: 1.5rem !important;
    margin-top: 2px;
    margin-bottom: 2px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  // 隱藏 PrimeVue 預設 chevron
  .p-panelmenu-toggle-icon {
    display: none !important;
  }
}

// 摺疊時彈出菜單的曜石黑科技風樣式
.dark-tiered-menu {
  background-color: var(--bg-card) !important;
  border: 1px solid #374151 !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
  padding: 0.5rem !important;
  border-radius: 0.75rem !important;

  .p-tieredmenu-root-list {
    outline: none;
  }

  .p-tieredmenu-item-link {
    display: flex !important;
    align-items: center !important;
    gap: 0.75rem !important;
    padding: 0.75rem 1rem !important;
    color: #d1d5db !important;
    border-radius: 0.5rem !important;
    transition: all 0.2s !important;
    font-size: 0.875rem !important;

    &:hover {
      background-color: #1f2937 !important;
      color: #ffffff !important;
      
      .p-tieredmenu-item-icon {
        color: #f59e0b !important;
      }
    }
  }

  .p-tieredmenu-item-icon {
    color: #fbbf24 !important;
    width: 1.25rem !important;
    height: 1.25rem !important;
  }
}

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
