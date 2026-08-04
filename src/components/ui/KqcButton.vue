<script setup lang="ts">
import { computed, useSlots } from 'vue'

// 1. 定義 Props 介面，符合 TypeScript 嚴格型態檢查與 Code Review 標準
interface Props {
  /** 按鈕風格變體 */
  variant?: 'primary' | 'accent' | 'outline' | 'text' | 'danger'
  /** 按鈕尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否停用 */
  disabled?: boolean
  /** 是否處於載入中狀態 */
  loading?: boolean
  /** 原生 HTML button type */
  type?: 'button' | 'submit' | 'reset'
  /** 是否以滿格（100% 寬度）顯示 */
  block?: boolean
}

// 2. 設定預設值 (withDefaults)
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  block: false,
})

// 3. 定義 Emits，嚴格約束事件型態
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const slots = useSlots()

// 4. 計算屬性：鎖定停用狀態（停用或載入中均無法觸發點擊）
const isDisabled = computed(() => props.disabled || props.loading)

// 5. 動態計算 class，確保樣式隔離與高靈活性
const buttonClasses = computed(() => [
  'kqc-btn',
  `kqc-btn--${props.variant}`,
  `kqc-btn--${props.size}`,
  {
    'kqc-btn--disabled': isDisabled.value,
    'kqc-btn--loading': props.loading,
    'kqc-btn--block': props.block,
    'kqc-btn--has-icon': !!slots.icon,
  },
])

// 6. 防呆點擊處理器：防止在 Loading 或 Disabled 狀態下觸發冒泡事件
const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    :aria-busy="loading"
    @click="handleClick"
  >
    <!-- Loading 載入轉圈動畫 -->
    <span v-if="loading" class="kqc-btn__spinner" aria-hidden="true">
      <svg
        class="kqc-btn__spinner-svg"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>

    <!-- 前置 Icon 插槽 -->
    <span
      v-if="slots.icon && !loading"
      class="kqc-btn__icon"
    >
      <slot name="icon" />
    </span>

    <!-- 按鈕文字內容 Slot -->
    <span v-if="slots.default" class="kqc-btn__content">
      <slot />
    </span>

    <!-- 後置 Icon 插槽 (預留擴充性) -->
    <span
      v-if="slots['icon-right'] && !loading"
      class="kqc-btn__icon kqc-btn__icon--right"
    >
      <slot name="icon-right" />
    </span>
  </button>
</template>

<style lang="scss" scoped>
// ==========================================
// 三爵資訊 (KQC) Design Tokens 色彩與規範
// ==========================================
$kqc-primary: #1e293b;        // 三爵鋼鐵藍
$kqc-primary-hover: #334155;
$kqc-primary-active: #0f172a;

$kqc-accent: #eab308;         // 琥珀璀璨金
$kqc-accent-hover: #facc15;
$kqc-accent-active: #ca8a04;

$kqc-danger: #ef4444;         // 霓虹警告紅
$kqc-danger-hover: #dc2626;
$kqc-danger-active: #b91c1c;

$kqc-border-grey: #e2e8f0;    // 邊框線灰
$kqc-text-muted: #64748b;     // 石墨次要字
$kqc-disabled-bg: #cbd5e1;    // 停用灰背景
$kqc-disabled-text: #94a3b8;  // 停用灰文字

.kqc-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.375rem; // 6px
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  position: relative;

  /* 鍵盤 Focus 視覺反饋 (Accessibility) */
  &:focus-visible {
    outline: 2px solid $kqc-accent;
    outline-offset: 2px;
  }

  // ------------------------------------------
  // 尺寸規格 (Sizes)
  // ------------------------------------------
  &--sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem; // 14px
  }

  &--md {
    padding: 0.5rem 1.25rem;
    font-size: 1rem; // 16px
  }

  &--lg {
    padding: 0.75rem 1.75rem;
    font-size: 1.125rem; // 18px
  }

  // ------------------------------------------
  // 滿格樣式 (Block)
  // ------------------------------------------
  &--block {
    width: 100%;
  }

  // ------------------------------------------
  // 顏色變體 (Variants)
  // ------------------------------------------
  // 1. 三爵鋼鐵藍 (Primary)
  &--primary {
    background-color: $kqc-primary;
    color: #ffffff;
    border-color: $kqc-primary;

    &:hover:not(:disabled) {
      background-color: $kqc-primary-hover;
      border-color: $kqc-primary-hover;
    }

    &:active:not(:disabled) {
      background-color: $kqc-primary-active;
      border-color: $kqc-primary-active;
    }
  }

  // 2. 琥珀璀璨金 (Accent CTA)
  &--accent {
    background-color: $kqc-accent;
    color: #1e293b;
    border-color: $kqc-accent;

    &:hover:not(:disabled) {
      background-color: $kqc-accent-hover;
      border-color: $kqc-accent-hover;
    }

    &:active:not(:disabled) {
      background-color: $kqc-accent-active;
      border-color: $kqc-accent-active;
    }
  }

  // 3. 外框按鈕 (Outline)
  &--outline {
    background-color: #ffffff;
    color: $kqc-primary;
    border-color: $kqc-border-grey;

    &:hover:not(:disabled) {
      background-color: #f8fafc;
      border-color: $kqc-primary;
    }

    &:active:not(:disabled) {
      background-color: #f1f5f9;
    }
  }

  // 4. 文字按鈕 (Text)
  &--text {
    background-color: transparent;
    color: $kqc-primary;

    &:hover:not(:disabled) {
      background-color: #f1f5f9;
    }

    &:active:not(:disabled) {
      background-color: #e2e8f0;
    }
  }

  // 5. 危險操作 (Danger)
  &--danger {
    background-color: $kqc-danger;
    color: #ffffff;
    border-color: $kqc-danger;

    &:hover:not(:disabled) {
      background-color: $kqc-danger-hover;
      border-color: $kqc-danger-hover;
    }

    &:active:not(:disabled) {
      background-color: $kqc-danger-active;
      border-color: $kqc-danger-active;
    }
  }

  // ------------------------------------------
  // 狀態 (Disabled & Loading)
  // ------------------------------------------
  &--disabled,
  &:disabled {
    background-color: $kqc-disabled-bg !important;
    color: $kqc-disabled-text !important;
    border-color: $kqc-disabled-bg !important;
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.85;
  }

  &--loading {
    cursor: wait;
  }

  // ------------------------------------------
  // 內部元素結構 (Sub-elements)
  // ------------------------------------------
  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1em;
  }

  &__content {
    display: inline-block;
    line-height: 1;
  }

  &__spinner {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &-svg {
      width: 1em;
      height: 1em;
      animation: kqc-spin 0.8s linear infinite;
    }
  }
}

// Keyframes 旋轉轉圈動畫
@keyframes kqc-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
