<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 卡片風格變體 */
  variant?: 'default' | 'flat' | 'outline'
  /** 內邊距大小 */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** 是否具備懸浮 Hover 效果與陰影 */
  hoverable?: boolean
  /** 是否顯示 Header 底線分隔線 */
  headerBorder?: boolean
  /** 是否顯示 Footer 頂部分隔線 */
  footerBorder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false,
  headerBorder: false,
  footerBorder: false,
})

const paddingClasses = computed(() => {
  switch (props.padding) {
    case 'none':
      return 'p-0'
    case 'sm':
      return 'p-4'
    case 'lg':
      return 'p-8'
    case 'md':
    default:
      return 'p-6'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'flat':
      return 'bg-gray-50 dark:bg-gray-800/50 border-none'
    case 'outline':
      return 'bg-transparent border border-gray-200 dark:border-gray-800 shadow-none'
    case 'default':
    default:
      return 'bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-sm'
  }
})
</script>

<template>
  <div
    :class="[
      'rounded-xl transition-all duration-200 overflow-hidden flex flex-col',
      variantClasses,
      hoverable ? 'hover:shadow-lg hover:-translate-y-0.5 hover:border-[#1E293B]/30 dark:hover:border-[#EAB308]/50' : '',
    ]"
  >
    <!-- 卡片頂部 Header 插槽 -->
    <div
      v-if="$slots.header"
      :class="[
        'px-6 py-4 flex items-center justify-between',
        headerBorder ? 'border-b border-gray-100 dark:border-gray-800' : '',
      ]"
    >
      <slot name="header" />
    </div>

    <!-- 視覺展示區域插槽 -->
    <div v-if="$slots.media" class="w-full overflow-hidden">
      <slot name="media" />
    </div>

    <!-- 卡片主要內容區塊 (Body) -->
    <div :class="['flex-1', paddingClasses]">
      <slot />
    </div>

    <!-- 卡片底部 Footer 插槽 -->
    <div
      v-if="$slots.footer"
      :class="[
        'px-6 py-4 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between mt-auto',
        footerBorder ? 'border-t border-gray-100 dark:border-gray-800' : '',
      ]"
    >
      <slot name="footer" />
    </div>
  </div>
</template>