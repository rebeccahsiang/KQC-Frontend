<template>
  <label class="kqc-switch" :class="{ 'is-disabled': disabled }">
    <input
      type="checkbox"
      class="kqc-switch__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    />
    <!-- 滑軌 Track: 補上清晰邊框 -->
    <span class="kqc-switch__track" :class="{ 'is-checked': modelValue }">
      <!-- 滑塊 Thumb: 移除原本內部的勾勾 SVG，還原純粹圓球 -->
      <span class="kqc-switch__thumb"></span>
    </span>
    <span v-if="label" class="kqc-switch__label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false
})

const modelValue = defineModel<boolean>({ default: false })

const handleChange = (e: Event) => {
  if (props.disabled) return
  const target = e.target as HTMLInputElement
  modelValue.value = target.checked
}
</script>

<style lang="scss" scoped>
.kqc-switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &__input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }

  /* 滑軌 Track：加上 1px 清晰邊框，解決黑曜石暗色下看不到邊緣問題 */
  &__track {
    position: relative;
    width: 44px;
    height: 24px;
    background-color: var(--kqc-bg-track);
    border: 1px solid var(--kqc-border);
    border-radius: 9999px;
    transition: var(--kqc-transition);
    flex-shrink: 0;

    &.is-checked {
      background-color: var(--kqc-accent);
      border-color: var(--kqc-accent);

      .kqc-switch__thumb {
        transform: translateX(20px);
      }
    }
  }

  /* 滑塊 Thumb：純潔質感白球 */
  &__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    background-color: var(--kqc-bg-thumb);
    border-radius: 50%;
    box-shadow: var(--kqc-shadow-sm);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: var(--kqc-text-main);
  }
}
</style>