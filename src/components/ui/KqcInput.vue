<template>
  <div 
    class="kqc-input-wrapper" 
    :class="[
      `kqc-input-wrapper--${size}`,
      { 'kqc-input-wrapper--block': block },
      { 'kqc-input-wrapper--error': error },
      { 'kqc-input-wrapper--disabled': disabled }
    ]"
  >
    <!-- 前置圖標/標籤插槽 -->
    <span v-if="$slots.prefix" class="kqc-input__prefix">
      <slot name="prefix" />
    </span>

    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      class="kqc-input__field"
      @input="handleInput"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />

    <!-- 後置圖標/按鈕插槽 -->
    <span v-if="$slots.suffix" class="kqc-input__suffix">
      <slot name="suffix" />
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | number
  type?: string
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: boolean
  block?: boolean
  id?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
  placeholder: '',
  disabled: false,
  readonly: false,
  error: false,
  block: false,
  id: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.kqc-input-wrapper {
  display: inline-flex;
  align-items: center;
  position: relative;
  border-radius: $kqc-radius-md;
  border: 1px solid var(--color-border);
  background-color: var(--bg-card);
  transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;

  /* 尺寸與 KqcButton 絕對同步 */
  &--sm {
    height: $kqc-control-height-sm; // 32px (2.0rem)
    font-size: $kqc-font-size-sm;   // 14px
    padding: 0 0.75rem;
  }

  &--md {
    height: $kqc-control-height-md; // 40px (2.5rem) - 預設標準高度
    font-size: $kqc-font-size-md;   // 16px
    padding: 0 1.0rem;
  }

  &--lg {
    height: $kqc-control-height-lg; // 48px (3.0rem)
    font-size: $kqc-font-size-lg;   // 18px
    padding: 0 1.25rem;
  }

  &--block {
    width: 100%;
  }

  /* Focus 狀態與 CSS Custom Properties 響應式切換 */
  &:focus-within {
    border-color: $color-primary;
    box-shadow: 0 0 0 3px var(--kqc-focus-ring-primary);
  }

  /* 錯誤警示狀態 */
  &--error {
    border-color: $color-danger !important;
    &:focus-within {
      box-shadow: 0 0 0 var(--kqc-focus-ring-danger);
    }
  }

  /* Disabled 停用狀態 */
  &--disabled {
    background-color: $color-disabled;
    opacity: 0.6;
    cursor: not-allowed;
    .kqc-input__field {
      cursor: not-allowed;
    }
  }
}

.kqc-input__field {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-main);
  font-family: inherit;
  font-size: inherit;

  &::placeholder {
    color: var(--color-text-muted);
  }
}

.kqc-input__prefix,
.kqc-input__suffix {
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
}

.kqc-input__prefix {
  margin-right: 0.5rem;
}

.kqc-input__suffix {
  margin-left: 0.5rem;
}
</style>