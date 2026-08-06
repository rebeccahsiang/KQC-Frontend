<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import type { MenuItem } from './menuConfig'

const props = defineProps<{
  item: MenuItem
  isCollapsed?: boolean
}>()

const router = useRouter()
const route = useRoute()
const isOpen = ref(true)

const handleClick = () => {
  if (props.item.children) {
    isOpen.value = !isOpen.value
  } else if (props.item.path) {
    router.push(props.item.path)
  }
}
</script>

<template>
  <div class="menu-item-wrapper">
    <button
      @click="handleClick"
      :class="[
        'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group text-sm font-medium',
        route.path === item.path
          ? 'bg-[#EAB308] text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
      ]"
      v-tooltip.right="isCollapsed ? item.title : ''"
    >
      <!-- Lucide Icon 動態渲染 -->
      <Icon
        :icon="item.icon"
        :class="[
          'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110',
          route.path === item.path ? 'text-slate-950' : 'text-amber-400/90 group-hover:text-amber-400'
        ]"
      />

      <!-- 選單標題 (修復：修正為 item.title) -->
      <span v-if="!isCollapsed" class="whitespace-nowrap tracking-wide flex-1 text-left">
        {{ item.title }}
      </span>

      <!-- 下拉選單箭頭 (修復：補上 lucide:chevron-down) -->
      <Icon
        v-if="item.children && !isCollapsed"
        icon="lucide:chevron-down"
        :class="['w-4 h-4 transition-transform duration-200', isOpen ? 'rotate-180' : '']"
      />
    </button>

    <!-- 子選單遞迴渲染 -->
    <div v-if="item.children && isOpen && !isCollapsed" class="pl-6 mt-1 space-y-1">
      <SidebarMenuItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :isCollapsed="isCollapsed"
      />
    </div>
  </div>
</template>