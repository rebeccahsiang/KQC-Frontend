<script setup lang="ts">
import { computed } from 'vue'

// 1. Props 規格定義：完全對齊 KQC 設計系統與 TypeScript 強型別
interface Props {
  /** v-model 繫結的當前選中值 */
  modelValue?: string | number | boolean
  /** 此 Radio 代表的單一數值 */
  value: string | number | boolean
  /** 顯示標籤文字 */
  label?: string
  /** 尺寸規格：sm (16px), md (20px), lg (24px) */
  size?: 'sm' | 'md' | 'lg'
  /** 手動指定狀態 (支援 Figma 18 宮格矩陣驗收) */
  state?: 'default' | 'hover' | 'disabled' | 'error'
  /** 是否停用 */
  disabled?: boolean
  /** 原生 input name 屬性 (用於原生 Form 群組化) */
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  size: 'md',
  state: 'default',
  disabled: false,
  name: 'kqc-radio-group',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean): void
  (e: 'change', value: string | number | boolean): void
}>()

// 2. 單選狀態與停用狀態判定
const isChecked = computed(() => props.modelValue === props.value)
const isDisabled = computed(() => props.disabled || props.state === 'disabled')

// 3. 1:1 光學比例尺寸字典 Mapping (40% Optical Ratio)
const sizeConfig = computed(() => {
  switch (props.size) {
    case 'lg':
      return {
        outer: 'w-6 h-6', // 24x24px 外圓
        inner: 'w-[10px] h-[10px]', // 10x10px 內圓實心點
        text: 'text-[18px] leading-[24px]', // 18px 字號
        gap: 'gap-[10px]', // 間距 10px
      }
    case 'sm':
      return {
        outer: 'w-4 h-4', // 16x16px 外圓
        inner: 'w-[6px] h-[6px]', // 6x6px 內圓實心點
        text: 'text-[12px] leading-[16px]', // 12px 字號
        gap: 'gap-[6px]', // 間距 6px
      }
    case 'md':
    default:
      return {
        outer: 'w-5 h-5', // 20x20px 外圓
        inner: 'w-2 h-2', // 8x8px 內圓實心點
        text: 'text-[14px] leading-[20px]', // 14px 字號
        gap: 'gap-[8px]', // 間距 8px
      }
  }
})

// 4. KQC Design Tokens 顏色狀態 Mapping (精準對齊 Figma 截圖)
const outerClasses = computed(() => {
  // Disabled 狀態
  if (isDisabled.value) {
    return isChecked.value
      ? 'bg-[#CBD5E1] border-[#CBD5E1] cursor-not-allowed'
      : 'bg-[#F1F5F9] border-[#E2E8F0] cursor-not-allowed'
  }

  // Error 狀態
  if (props.state === 'error') {
    return 'bg-white border-2 border-[#EF4444] hover:border-[#DC2626]'
  }

  // Checked 狀態
  if (isChecked.value) {
    if (props.state === 'hover') {
      return 'bg-[#334155] border-[#334155]' // Hover 深鋼鐵藍
    }
    return 'bg-[#1E293B] border-[#1E293B] hover:bg-[#334155] hover:border-[#334155]'
  }

  // Unchecked 狀態
  if (props.state === 'hover') {
    return 'bg-white border-[#64748B]' // Hover 深灰外框
  }
  return 'bg-white border-[#CBD5E1] hover:border-[#64748B]'
})

// 5. 事件處理
const handleChange = () => {
  if (isDisabled.value) return
  emit('update:modelValue', props.value)
  emit('change', props.value)
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
    <!-- 原生 Accessibility 隱藏 Radio Input -->
    <input
      type="radio"
      :name="name"
      :value="value"
      :checked="isChecked"
      :disabled="isDisabled"
      class="sr-only peer"
      @change="handleChange"
    />

    <!-- 自訂 Radio 外圓 (包含 璀璨金 Focus-visible 無障礙光環) -->
    <div
      :class="[
        'rounded-full border flex items-center justify-center transition-all duration-150 shrink-0 box-border',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-[#EAB308] peer-focus-visible:ring-offset-2',
        sizeConfig.outer,
        outerClasses,
      ]"
    >
      <!-- 內實心點 (選中時縮放顯示白點) -->
      <transition
        enter-active-class="transition-transform duration-150 ease-out"
        enter-from-class="scale-0"
        enter-to-class="scale-100"
        leave-active-class="transition-transform duration-100 ease-in"
        leave-from-class="scale-100"
        leave-to-class="scale-0"
      >
        <div
          v-if="isChecked"
          class="rounded-full bg-white shrink-0"
          :class="sizeConfig.inner"
        />
      </transition>
    </div>

    <!-- 標籤文字 (Semi-bold 600 字重對齊) -->
    <span
      v-if="label || $slots.default"
      :class="[
        'font-semibold transition-colors duration-150',
        sizeConfig.text,
        isDisabled ? 'text-[#CBD5E1]' : 'text-[#0F172A] group-hover:text-[#1E293B]',
      ]"
    >
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>