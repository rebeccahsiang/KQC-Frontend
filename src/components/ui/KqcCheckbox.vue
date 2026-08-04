<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// 1. Props 規格定義：對齊 KQC 設計系統與 TypeScript 強型別
interface Props {
  /** v-model 雙向綁定值 */
  modelValue?: boolean | (string | number)[]
  /** Checkbox 傳遞的原生 value (當 modelValue 為陣列時使用) */
  value?: string | number
  /** 顯示標籤文字 */
  label?: string
  /** 尺寸規格：sm (16px), md (20px), lg (24px) */
  size?: 'sm' | 'md' | 'lg'
  /** 手動指定狀態 (支援 Figma 矩陣驗收) */
  state?: 'default' | 'hover' | 'disabled' | 'error'
  /** 是否停用 */
  disabled?: boolean
  /** 半選/不確定狀態 (專用於 B2B 批次選擇表格情境) */
  indeterminate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  value: undefined,
  label: '',
  size: 'md',
  state: 'default',
  disabled: false,
  indeterminate: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean | (string | number)[]): void
  (e: 'change', event: Event): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

// 同步原生的 indeterminate 屬性 (DOM 層級設定)
watch(
  () => props.indeterminate,
  (val) => {
    if (inputRef.value) {
      inputRef.value.indeterminate = val
    }
  },
  { immediate: true }
)

// 2. 計算當前是否處於勾選狀態 (支援 Boolean 與 Array 兩種 v-model 模式)
const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.value !== undefined && props.modelValue.includes(props.value)
  }
  return Boolean(props.modelValue)
})

const isDisabled = computed(() => props.disabled || props.state === 'disabled')

// 3. 1:1 光學配重尺寸字典 Mapping (8pt Grid)
const sizeConfig = computed(() => {
  switch (props.size) {
    case 'lg':
      return {
        box: 'w-6 h-6 rounded-[6px]', // 24x24px, 圓角 6px
        icon: 'w-4 h-4', // 16x16px
        text: 'text-[18px] leading-[24px]', // 18px 字號
        gap: 'gap-[10px]', // 間距 10px
      }
    case 'sm':
      return {
        box: 'w-4 h-4 rounded-[3px]', // 16x16px, 圓角 3px
        icon: 'w-3 h-3', // 12x12px
        text: 'text-[12px] leading-[16px]', // 12px 字號
        gap: 'gap-[6px]', // 間距 6px
      }
    case 'md':
    default:
      return {
        box: 'w-5 h-5 rounded-[4px]', // 20x20px, 圓角 4px
        icon: 'w-[14px] h-[14px]', // 14x14px
        text: 'text-[14px] leading-[20px]', // 14px 字號
        gap: 'gap-[8px]', // 間距 8px
      }
  }
})

// 4. KQC Design Tokens 顏色狀態 Mapping (精準還原 Figma 18 宮格)
const boxClasses = computed(() => {
  // Disabled 狀態
  if (isDisabled.value) {
    return isChecked.value || props.indeterminate
      ? 'bg-[#CBD5E1] border-[#CBD5E1] text-white cursor-not-allowed'
      : 'bg-[#F1F5F9] border-[#E2E8F0] text-transparent cursor-not-allowed'
  }

  // Error 狀態
  if (props.state === 'error') {
    return 'bg-white border-2 border-[#EF4444] hover:border-[#DC2626]'
  }

  // Checked 或 Indeterminate 狀態
  if (isChecked.value || props.indeterminate) {
    if (props.state === 'hover') {
      return 'bg-[#334155] border-[#334155] text-white' // Hover 深鋼鐵藍
    }
    return 'bg-[#1E293B] border-[#1E293B] text-white hover:bg-[#334155] hover:border-[#334155]'
  }

  // Unchecked 狀態
  if (props.state === 'hover') {
    return 'bg-white border-[#64748B]' // Hover 深灰邊框
  }
  return 'bg-white border-[#CBD5E1] hover:border-[#64748B]'
})

// 5. 事件處理器
const handleChange = (event: Event) => {
  if (isDisabled.value) return

  const target = event.target as HTMLInputElement
  const checked = target.checked

  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    if (props.value !== undefined) {
      if (checked) {
        newValue.push(props.value)
      } else {
        const index = newValue.indexOf(props.value)
        if (index !== -1) newValue.splice(index, 1)
      }
      emit('update:modelValue', newValue)
    }
  } else {
    emit('update:modelValue', checked)
  }

  emit('change', event)
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
    <!-- 原生 Accessibility 隱藏 Input -->
    <input
      ref="inputRef"
      type="checkbox"
      :checked="isChecked"
      :disabled="isDisabled"
      :value="value"
      :aria-checked="indeterminate ? 'mixed' : isChecked"
      class="sr-only peer"
      @change="handleChange"
    />

    <!-- 自訂 Checkbox 方塊容器 (具備 Focus-visible 璀璨金無障礙外框) -->
    <div
      :class="[
        'border flex items-center justify-center transition-all duration-150 shrink-0 box-border',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-[#EAB308] peer-focus-visible:ring-offset-2',
        sizeConfig.box,
        boxClasses,
      ]"
    >
      <!-- 半選狀態 Icon (-) -->
      <svg
        v-if="indeterminate"
        class="fill-current stroke-current"
        :class="sizeConfig.icon"
        viewBox="0 0 20 20"
      >
        <rect x="3" y="8.75" width="14" height="2.5" rx="1" />
      </svg>

      <!-- 全選勾勾 Icon (✓) -->
      <svg
        v-else-if="isChecked"
        class="fill-current"
        :class="sizeConfig.icon"
        viewBox="0 0 20 20"
      >
        <path d="M0 11l2-2 5 5 L18 3l2 2L7 18z" />
      </svg>
    </div>

    <!-- 標籤文字區塊：精準對齊 Semi-bold 600 字重與色階 -->
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