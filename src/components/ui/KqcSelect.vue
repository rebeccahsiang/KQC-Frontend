<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 1. 選項介面定義
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

// 2. Props 規格定義 (TypeScript 強型別別名)
interface Props {
  modelValue?: string | number
  options?: SelectOption[]
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  state?: 'default' | 'hover' | 'focus' | 'disabled' | 'error'
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  label?: string
  helperText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [
    { label: '汽車貨運牌照 (甲種)', value: '1' },
    { label: '貨櫃客運特許牌照', value: '2' },
    { label: '遊覽車客運業牌照', value: '3' },
  ],
  placeholder: '請選擇項目...',
  size: 'md',
  state: undefined,
  disabled: false,
  error: false,
  errorMessage: '',
  label: '',
  helperText: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

// 3. 響應式狀態與 DOM 參考
const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

// 4. 計算當前運作狀態（State Machine）
const currentState = computed(() => {
  if (props.state) return props.state
  if (props.disabled) return 'disabled'
  if (props.error || props.errorMessage) return 'error'
  if (isOpen.value) return 'focus'
  return 'default'
})

// 5. 1:1 對齊 Figma 中 lg (48px), md (40px), sm (32px) 尺寸規格
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-[32px] px-[12px] text-xs rounded'
    case 'lg':
      return 'h-[48px] px-[24px] text-base rounded-lg'
    case 'md':
    default:
      return 'h-[40px] px-[16px] text-sm rounded-md'
  }
})

// 6. 狀態樣式對應（三爵鋼鐵藍 #1E293B / 霓虹警告紅 #EF4444 / 琥珀璀璨金 #EAB308）
const stateClasses = computed(() => {
  switch (currentState.value) {
    case 'disabled':
      return 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
    case 'error':
      return 'bg-white border-2 border-[#EF4444] text-[#1E293B]'
    case 'focus':
      return 'bg-white border-2 border-[#1E293B] text-[#1E293B]'
    case 'hover':
      return 'bg-white border border-[#64748B] text-[#1E293B]'
    case 'default':
    default:
      return 'bg-white border border-[#CBD5E1] text-[#1E293B] hover:border-[#64748B]'
  }
})

// 7. 選項選取處理
const handleSelect = (option: SelectOption) => {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

// 8. 觸發框點擊切換
const toggleOpen = () => {
  if (currentState.value === 'disabled') return
  isOpen.value = !isOpen.value
}

// 9. 點擊組件外部自動收合 (Click Outside) 靈魂邏輯
const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// 10. 鍵盤 Esc 鍵速關閉
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})

const selectedLabel = computed(() => {
  const found = props.options.find((o) => o.value === props.modelValue)
  return found ? found.label : props.placeholder
})
</script>

<template>
  <div ref="selectRef" class="relative w-full flex flex-col gap-1.5 p-0 select-none">
    <!-- 欄位 Label 標籤 -->
    <label v-if="label" class="text-xs font-semibold text-[#1E293B] flex items-center justify-between">
      <span>{{ label }}</span>
      <span v-if="disabled" class="text-xs font-normal text-[#94A3B8]">(已停用)</span>
    </label>

    <!-- 📦 Trigger Box (點擊觸發框) -->
    <div
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled || currentState === 'disabled'"
      class="w-full flex items-center justify-between cursor-pointer transition-all duration-150 box-border font-medium"
      :class="[sizeClasses, stateClasses]"
      @click="toggleOpen"
    >
      <span :class="!modelValue ? 'text-[#94A3B8]' : 'text-[#1E293B]'">
        {{ selectedLabel }}
      </span>

      <!-- 右側旋轉 Chevron 箭頭 Icon -->
      <svg
        class="w-4 h-4 text-[#64748B] transition-transform duration-200 shrink-0"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- 📦 Dropdown Panel (下拉選單浮層) -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen && currentState !== 'disabled'"
        role="listbox"
        class="absolute top-[100%] left-0 right-0 mt-1 bg-white border border-[#CBD5E1] rounded-md shadow-xl overflow-hidden py-1 z-50 max-h-60 overflow-y-auto"
      >
        <div
          v-for="item in options"
          :key="item.value"
          role="option"
          :aria-selected="item.value === modelValue"
          class="px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors"
          :class="[
            item.disabled ? 'text-[#CBD5E1] cursor-not-allowed bg-gray-50' : '',
            item.value === modelValue
              ? 'bg-[#EAB308] text-white font-bold'
              : 'text-[#1E293B] hover:bg-[#F1F5F9]',
          ]"
          @click="handleSelect(item)"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.value === modelValue" class="text-white font-bold">✓</span>
        </div>
      </div>
    </Transition>

    <!-- 錯誤提示訊息 (Error State) -->
    <p v-if="errorMessage || currentState === 'error'" class="text-xs text-[#EF4444] font-medium flex items-center gap-1 mt-0.5">
      <svg class="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <span>{{ errorMessage || '請選擇有效選項' }}</span>
    </p>

    <!-- 一般輔助說明文字 -->
    <p v-else-if="helperText" class="text-xs text-[#64748B]">
      {{ helperText }}
    </p>
  </div>
</template>