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
  hoverable: true,
  headerBorder: false,
  footerBorder: false,
})

const paddingClasses = computed(() => {
  switch (props.padding) {
    case 'none':
      return 'p-0'
    case 'sm':
      return 'p-3'
    case 'lg':
      return 'p-6'
    case 'md':
    default:
      return 'p-4'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'flat':
      return 'kqc-card--flat'
    case 'outline':
      return 'kqc-card--outline'
    case 'default':
    default:
      return 'kqc-card--default'
  }
})
</script>

<template>
  <div
    :class="[
      'kqc-card rounded-xl transition-all duration-300 overflow-hidden flex flex-col h-full',
      variantClasses,
      { 'kqc-card--hoverable': hoverable },
    ]"
  >
    <!-- 1. 頂部視覺展示區 (Media Slot) -->
    <div v-if="$slots.media" class="relative w-full overflow-hidden shrink-0">
      <slot name="media" />
    </div>

    <!-- 2. 卡片標題區 (Header Slot) -->
    <div
      v-if="$slots.header"
      :class="[
        'px-4 py-3 flex items-center justify-between shrink-0',
        headerBorder ? 'border-b border-[var(--kqc-border)]' : '',
      ]"
    >
      <slot name="header" />
    </div>

    <!-- 3. 卡片主要內容區 (Body) -->
    <div :class="['flex-1 flex flex-col', paddingClasses]">
      <slot />
    </div>

    <!-- 4. 卡片底部操作區 (Footer Slot) -->
    <div
      v-if="$slots.footer"
      :class="[
        'px-4 py-3 bg-transparent flex items-center justify-between mt-auto shrink-0',
        footerBorder ? 'border-t border-[var(--kqc-border)]' : '',
      ]"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.kqc-card {
  &--default {
    background-color: var(--kqc-bg-card);
    border: 1px solid var(--kqc-border);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  &--flat {
    background-color: var(--kqc-bg-hover);
    border: 1px solid transparent;
  }

  &--outline {
    background-color: transparent;
    border: 1px solid var(--kqc-border);
  }

  &--hoverable {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
      border-color: var(--kqc-accent);
    }
  }
}
</style>