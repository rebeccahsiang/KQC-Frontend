<template>
  <div class="kqc-radio-group" :class="{ 'is-vertical': vertical, 'is-disabled': disabled }">
    <label
      v-for="(opt, index) in options"
      :key="String(opt.value)"
      class="kqc-radio-item"
      :class="{
        'is-selected': modelValue === opt.value,
        'is-item-disabled': disabled || opt.disabled
      }"
      tabindex="0"
      @click="selectOption(opt.value, opt.disabled)"
      @keydown="handleKeyDown($event, index)"
    >
      <input
        type="radio"
        :name="name"
        :value="opt.value"
        :checked="modelValue === opt.value"
        :disabled="disabled || opt.disabled"
        class="kqc-radio-input"
        tabindex="-1"
        @change="selectOption(opt.value, opt.disabled)"
      />
      <span class="kqc-radio-control">
        <span class="kqc-radio-inner"></span>
      </span>
      <div class="kqc-radio-content">
        <span class="kqc-radio-label">{{ opt.label }}</span>
        <span v-if="opt.desc" class="kqc-radio-desc">{{ opt.desc }}</span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number | boolean">
export interface RadioOption<V = string | number | boolean> {
  label: string;
  value: V;
  desc?: string;
  disabled?: boolean;
}

interface Props {
  options: RadioOption<T>[];
  name?: string;
  disabled?: boolean;
  vertical?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  name: () => `kqc-radio-${Math.random().toString(36).substring(2, 9)}`,
  disabled: false,
  vertical: false
});

const modelValue = defineModel<T>({ required: true });

const selectOption = (val: T, isOptionDisabled?: boolean): void => {
  if (props.disabled || isOptionDisabled) return;
  modelValue.value = val;
};

const handleKeyDown = (event: KeyboardEvent, currentIndex: number): void => {
  if (props.disabled) return;
  const enabledOptions = props.options.filter((opt) => !opt.disabled);
  if (enabledOptions.length === 0) return;

  let nextIndex = currentIndex;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    do { nextIndex = (nextIndex + 1) % props.options.length; } while (props.options[nextIndex].disabled && nextIndex !== currentIndex);
    selectOption(props.options[nextIndex].value, props.options[nextIndex].disabled);
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    do { nextIndex = (nextIndex - 1 + props.options.length) % props.options.length; } while (props.options[nextIndex].disabled && nextIndex !== currentIndex);
    selectOption(props.options[nextIndex].value, props.options[nextIndex].disabled);
  }
};
</script>

<style lang="scss" scoped>
.kqc-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  &.is-vertical { flex-direction: column; }
  &.is-disabled { opacity: 0.6; cursor: not-allowed; }
}

.kqc-radio-item {
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border: 1.5px solid var(--kqc-border);
  border-radius: var(--kqc-radius-md);
  background-color: var(--kqc-bg-card); /* ✨ 選項背景保持與卡牌背景一致 */
  cursor: pointer;
  transition: var(--kqc-transition);
  outline: none;
  user-select: none;

  &:hover:not(.is-item-disabled) {
    border-color: var(--kqc-accent);
    background-color: var(--kqc-bg-hover);
  }

  /* 選中狀態 Selected Style */
  &.is-selected {
    border-color: var(--kqc-accent);
    background-color: var(--kqc-bg-selected);

    .kqc-radio-control {
      border-color: var(--kqc-accent);
      .kqc-radio-inner {
        transform: scale(1);
        background-color: var(--kqc-accent);
      }
    }

    .kqc-radio-label {
      color: var(--kqc-text-main);
      font-weight: 700;
    }
  }

  &.is-item-disabled {
    cursor: not-allowed;
    opacity: 0.5;
    border-color: var(--kqc-disabled);
  }
}

.kqc-radio-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.kqc-radio-control {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  border: 2px solid var(--kqc-text-muted);
  border-radius: 50%;
  transition: border-color 0.2s ease;
  flex-shrink: 0;

  .kqc-radio-inner {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transform: scale(0);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.kqc-radio-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kqc-radio-label {
  font-size: 14px;
  color: var(--kqc-text-main);
  line-height: 1.4;
}

.kqc-radio-desc {
  font-size: 12px;
  color: var(--kqc-text-muted);
  line-height: 1.3;
}
</style>