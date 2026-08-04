<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'

// 1. Props 規格定義：嚴格對齊 Figma 3 Sizes x 5 States 矩陣
interface Props {
  /** 綁定數值 (支援 Vue 3 v-model) */
  modelValue?: string | number
  /** 尺寸規格：sm (32px), md (40px), lg (48px) */
  size?: 'sm' | 'md' | 'lg'
  /** 手動/測試指定狀態 (若不設定則依據使用者互動動態切換) */
  state?: 'default' | 'hover' | 'focus' | 'disabled' | 'error'
  /** 原生 input type */
  type?: string
  /** 占位預設文字 */
  placeholder?: string
  /** 是否停用 */
  disabled?: boolean
  /** 是否顯示錯誤狀態 */
  error?: boolean
  /** 錯誤提示訊息 (有值時自動觸發 Error 狀態) */
  errorMessage?: string
  /** 欄位 Label 標籤 */
  label?: string
  /** 欄位下方輔助說明文字 */
  helperText?: string
}

// 2. 預設值宣告 (withDefaults)
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  size: 'md',
  state: undefined,
  type: 'text',
  placeholder: '請輸入內容...',
  disabled: false,
  error: false,
  errorMessage: '',
  label: '',
  helperText: '',
})

// 3. Emits 約束
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'change', event: Event): void
}>()

const slots = useSlots()
const isFocused = ref(false)

// 4. v-model 雙向綁定計算屬性
const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', String(val)),
})

// 5. 狀態機核心計算 (State Machine)：精準決定當前的 Token 狀態
const currentState = computed(() => {
  // 若有外部手動傳入 state (用於 Storybook 或 Figma 驗收展示) 則優先使用
  if (props.state) return props.state

  if (props.disabled) return 'disabled'
  if (props.error || props.errorMessage) return 'error'
  if (isFocused.value) return 'focus'
  return 'default'
})

// 6. 尺寸對應表 (Size Token Classes)
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-8 px-2.5 text-xs rounded'
    case 'lg':
      return 'h-12 px-4 text-base rounded-lg'
    case 'md':
    default:
      return 'h-10 px-3 text-sm rounded-md'
  }
})

// 7. 5 大互動狀態 Token Classes 精準對應 (Tailwind CSS v4)
const stateClasses = computed(() => {
  switch (currentState.value) {
    // Disabled: Fill #F1F5F9 / Stroke 1px Inside #E2E8F0 / Text #CBD5E1
    case 'disabled':
      return 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#CBD5E1] placeholder-[#CBD5E1] cursor-not-allowed'

    // Error: Fill #FFFFFF / Stroke 2px Inside #EF4444 (警示紅框)
    case 'error':
      return 'bg-white border-2 border-[#EF4444] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none ring-0'

    // Focus: Fill #FFFFFF / Stroke 2px Inside #1E293B (三爵鋼鐵藍)
    case 'focus':
      return 'bg-white border-2 border-[#1E293B] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none ring-0'

    // Hover: Fill #FFFFFF / Stroke 1px Inside #64748B (深灰懸停)
    case 'hover':
      return 'bg-white border border-[#64748B] text-[#1E293B] placeholder-[#94A3B8]'

    // Default: Fill #FFFFFF / Stroke 1px Inside #CBD5E1 / Text #94A3B8
    case 'default':
    default:
      return 'bg-white border border-[#CBD5E1] text-[#1E293B] placeholder-[#94A3B8] hover:border-[#64748B] focus:border-2 focus:border-[#1E293B] focus:outline-none'
  }
})

// 8. 事件處理解析
const handleFocus = (event: FocusEvent) => {
  if (props.disabled) return
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleChange = (event: Event) => {
  emit('change', event)
}
</script>

<template>
  <div class="w-full flex flex-col gap-1.5">
    <!-- 欄位 Label 標籤 -->
    <label
      v-if="label"
      class="text-xs font-semibold text-[#1E293B] flex items-center justify-between"
    >
      <span>{{ label }}</span>
      <span v-if="disabled" class="text-xs font-normal text-[#94A3B8]">(已停用)</span>
    </label>

    <!-- Input 主體容器 (包含 Icon 插槽) -->
    <div class="relative w-full flex items-center">
      <!-- 前置 Icon 插槽 -->
      <div
        v-if="slots.prefix"
        class="absolute left-3 flex items-center justify-center text-[#64748B] pointer-events-none"
      >
        <slot name="prefix" />
      </div>

      <!-- 原生 Input 標籤 -->
      <input
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled || currentState === 'disabled'"
        :aria-invalid="currentState === 'error'"
        :aria-disabled="disabled"
        :class="[
          'w-full font-medium transition-all duration-150 ease-in-out',
          sizeClasses,
          stateClasses,
          slots.prefix ? 'pl-9' : '',
          slots.suffix ? 'pr-9' : '',
        ]"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
      />

      <!-- 後置 Icon 插槽 -->
      <div
        v-if="slots.suffix"
        class="absolute right-3 flex items-center justify-center text-[#64748B]"
      >
        <slot name="suffix" />
      </div>
    </div>

    <!-- 錯誤訊息提示區塊 (Error State) -->
    <p
      v-if="errorMessage"
      class="text-xs font-medium text-[#EF4444] flex items-center gap-1 mt-0.5"
    >
      <svg class="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ errorMessage }}</span>
    </p>

    <!-- 一般輔助說明文字 (Helper Text) -->
    <p
      v-else-if="helperText"
      class="text-xs text-[#64748B]"
    >
      {{ helperText }}
    </p>
  </div>
</template>
