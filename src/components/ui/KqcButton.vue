<template>
  <button
    class="kqc-btn"
    :class="[
      `kqc-btn--${variant}`,
      `kqc-btn--${size}`,
      { 'is-loading': loading, 'is-block': block }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="kqc-btn__spinner"></span>
    <span class="kqc-btn__content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'text' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false
})
</script>

<style lang="scss" scoped>
.kqc-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--kqc-font-family);
  font-weight: 600;
  border-radius: var(--kqc-radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--kqc-transition);
  user-select: none;
  white-space: nowrap;

  /* 尺寸 Sizes */
  &--sm { height: 32px; padding: 0 12px; font-size: 13px; }
  &--md { height: 40px; padding: 0 16px; font-size: 14px; }
  &--lg { height: 48px; padding: 0 24px; font-size: 16px; }

  /* 變體 Variants (100% 全域 Theme Token 驅動，無任何 HEX 硬編碼) */
  /* 1. 三爵鋼鐵藍 (Primary) */
  &--primary {
    background-color: var(--kqc-btn-primary-bg);
    color: var(--kqc-btn-primary-text);
    &:hover:not(:disabled) { background-color: var(--kqc-btn-primary-hover); }
    &:active:not(:disabled) { background-color: var(--kqc-btn-primary-active); }
  }

  /* 2. 琥珀璀璨金 (Accent) */
  &--accent {
    background-color: var(--kqc-accent);
    color: var(--kqc-color-white);
    font-weight: 700;
    &:hover:not(:disabled) { background-color: var(--kqc-accent-hover); }
    &:active:not(:disabled) { background-color: var(--kqc-accent-active); }
  }

  /* 3. 外框按鈕 (Outline) */
  &--outline {
    background-color: var(--kqc-bg-card);
    border-color: var(--kqc-border);
    color: var(--kqc-text-main);
    &:hover:not(:disabled) {
      border-color: var(--kqc-primary);
      color: var(--kqc-primary);
      background-color: var(--kqc-bg-hover);
    }
  }

  /* 4. 次要按鈕 (Secondary) */
  &--secondary {
    background-color: var(--kqc-bg-hover);
    color: var(--kqc-text-main);
    &:hover:not(:disabled) { background-color: var(--kqc-bg-active); }
  }

  /* 5. 文字按鈕 (Text) */
  &--text {
    background-color: transparent;
    color: var(--kqc-text-main);
    &:hover:not(:disabled) { background-color: var(--kqc-bg-hover); }
  }

  /* 6. 霓虹警告紅 (Danger) */
  &--danger {
    background-color: var(--kqc-danger);
    color: var(--kqc-color-white);
    &:hover:not(:disabled) { background-color: var(--kqc-danger-hover); }
  }

  /* 7. 成功媒合綠 (Success) */
  &--success {
    background-color: var(--kqc-success);
    color: var(--kqc-color-white);
    &:hover:not(:disabled) { background-color: var(--kqc-success-hover); }
    &:active:not(:disabled) { background-color: var(--kqc-success-active); }
  }

  &.is-block { width: 100%; }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--kqc-disabled);
    border-color: transparent;
    color: var(--kqc-text-muted);
  }
}

.kqc-btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>