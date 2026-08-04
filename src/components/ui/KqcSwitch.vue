<script setup lang="ts">
import { computed } from 'vue'

// 1. Props 規格定義：嚴格對齊 KQC 設計系統與 TypeScript 型別
interface Props {
  /** v-model 雙向綁定（開關狀態） */
  modelValue?: boolean
  /** 顯示標籤文案（若不傳則預設顯示 '開啟' 或 '關閉'） */
  label?: string
  /** 尺寸規格：sm (28px), md (36px), lg (44px) */
  size?: 'sm' | 'md' | 'lg'
  /** 手動指定狀態 (支援 Figma 12 宮格矩陣驗收) */
  state?: 'default' | 'hover' | 'disabled' | 'error'
  /** 是否停用 */
  disabled?: boolean
  /** 開啟時的提示文字 */
  onLabel?: string
  /** 關閉時的提示文字 */
  offLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  size: 'md',
  state: 'default',
  disabled: false,
  onLabel: '開啟',
  offLabel: '關閉',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}>()

const isDisabled = computed(() => props.disabled || props.state === 'disabled')

// 2. 1:1 光學比例與內滑塊移動量字典 Mapping (8pt Grid)
const sizeConfig = computed(() => {
  switch (props.size) {
    case 'lg':
      return {
        track: 'w-[44px] h-[24px] p-[2px]', // 44x24px 軌道
        thumb: 'w-[20px] h-[20px]',        // 20x20px 實心圓滑塊
        translate: 'translate-x-[20px]',  // 滑動 20px
        text: 'text-[18px] leading-[24px]', // 18px 字號
        gap: 'gap-[10px]',                 // 間距 10px
      }
    case 'sm':
      return {
        track: 'w-[28px] h-[16px] p-[2px]', // 28x16px 軌道
        thumb: 'w-[12px] h-[12px]',        // 12x12px 實心圓滑塊
        translate: 'translate-x-[12px]',  // 滑動 12px
        text: 'text-[12px] leading-[16px]', // 12px 字號
        gap: 'gap-[6px]',                  // 間距 6px
      }
    case 'md':
    default:
      return {
        track: 'w-[36px] h-[20px] p-[2px]', // 36x20px 軌道
        thumb: 'w-[16px] h-[16px]',        // 16x16px 實心圓滑塊
        translate: 'translate-x-[16px]',  // 滑動 16px
        text: 'text-[14px] leading-[20px]', // 14px 字號
        gap: 'gap-[8px]',                  // 間距 8px
      }
  }
})

// 3. KQC Design Tokens 軌道顏色動態對應 (對齊 Figma 截圖)
const trackClasses = computed(() => {
  // Disabled 狀態
  if (isDisabled.value) {
    return props.modelValue
      ? 'bg-[#CBD5E1] cursor-not-allowed'
      : 'bg-[#F1F5F9] border border-[#E2E8F0] cursor-not-allowed'
  }

  // Error 狀態
  if (props.state === 'error') {
    return 'bg-[#EF4444] hover:bg-[#DC2626]'
  }

  // On (Checked) 狀態 - 三爵鋼鐵藍
  if (props.modelValue) {
    if (props.state === 'hover') {
      return 'bg-[#334155]' // Hover 深鋼鐵藍
    }
    return 'bg-[#1E293B] hover:bg-[#334155]'
  }

  // Off (Unchecked) 狀態 - 邊框線灰
  if (props.state === 'hover') {
    return 'bg-[#94A3B8]' // Hover 深灰軌道
  }
  return 'bg-[#CBD5E1] hover:bg-[#94A3B8]'
})

// 4. 切換事件處理器
const toggleSwitch = () => {
  if (isDisabled.value) return
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<template>
  <label
    :class="[
      'inline-flex items-center select-none group transition-all duration-150',
      sizeConfig.gap,
      isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
    ]"
  >
    <!-- 原生 Accessibility 隱藏 Input (支援觸發事件) -->
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="isDisabled"
      class="sr-only peer"
      @change="toggleSwitch"
    />

    <!-- 📦 軌道 (Track) 包含 琥珀璀璨金 Focus-visible 光環 -->
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-disabled="isDisabled"
      :disabled="isDisabled"
      :class="[
        'relative inline-flex shrink-0 rounded-full transition-colors duration-200 ease-in-out box-border',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-[#EAB308] peer-focus-visible:ring-offset-2',
        sizeConfig.track,
        trackClasses,
      ]"
      @click="toggleSwitch"
    >
      <!-- 滑塊 (Thumb) -->
      <span
        :class="[
          'pointer-events-none inline-block rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out',
          sizeConfig.thumb,
          modelValue ? sizeConfig.translate : 'translate-x-0',
        ]"
      />
    </button>

    <!-- 標籤文字 (Semi-bold 600 字重與狀態色對齊) -->
    <span
      v-if="label || onLabel || offLabel || $slots.default"
      :class="[
        'font-semibold transition-colors duration-150',
        sizeConfig.text,
        isDisabled ? 'text-[#CBD5E1]' : 'text-[#0F172A] group-hover:text-[#1E293B]',
      ]"
    >
      <slot>{{ label || (modelValue ? onLabel : offLabel) }}</slot>
    </span>
  </label>
</template>