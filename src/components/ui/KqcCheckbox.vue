<template>
  <div class="kqc-checkbox-group" :class="{ 'has-error': Boolean(errorMessage) }">
    <!-- 群組標題與必填標示（當有群組標題且有 options 時呈現） -->
    <div v-if="label && options && options.length > 0" class="kqc-checkbox-group__header">
      <label class="kqc-checkbox-group__label">
        {{ label }}
        <span v-if="required" class="kqc-checkbox-group__required">*</span>
      </label>
      <span v-if="hint" class="kqc-checkbox-group__hint">{{ hint }}</span>
    </div>

    <!-- 情況 A：傳入 options 陣列（多選群組模式） -->
    <div 
      v-if="options && options.length > 0"
      class="kqc-checkbox-group__options"
      :class="[`layout-${layout}`, `variant-${variant}`]"
    >
      <label
        v-for="option in options"
        :key="String(option.value)"
        class="kqc-checkbox-item"
        :class="{
          'is-checked': isChecked(option.value),
          'is-disabled': option.disabled || disabled
        }"
      >
        <input
          type="checkbox"
          class="kqc-checkbox-item__input"
          :value="option.value"
          :checked="isChecked(option.value)"
          :disabled="option.disabled || disabled"
          @change="handleChange(option.value)"
        />
        
        <!-- 自訂 Checkbox 視覺圖示 -->
        <span class="kqc-checkbox-item__box">
          <svg class="kqc-checkbox-item__icon" viewBox="0 0 16 16" fill="none">
            <path
              d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2.5-2.5a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"
              fill="currentColor"
            />
          </svg>
        </span>

        <!-- 內容文字與副標 -->
        <div class="kqc-checkbox-item__content">
          <span class="kqc-checkbox-item__label">{{ option.label }}</span>
          <span v-if="option.description" class="kqc-checkbox-item__desc">
            {{ option.description }}
          </span>
        </div>
      </label>
    </div>

    <!-- 情況 B：未傳入 options（單一核取 Toggle 模式，如「同意服務條款」） -->
    <div v-else class="kqc-checkbox-group__options layout-column">
      <label
        class="kqc-checkbox-item"
        :class="{
          'is-checked': isChecked(),
          'is-disabled': disabled
        }"
      >
        <input
          type="checkbox"
          class="kqc-checkbox-item__input"
          :checked="isChecked()"
          :disabled="disabled"
          @change="handleChange()"
        />
        
        <span class="kqc-checkbox-item__box">
          <svg class="kqc-checkbox-item__icon" viewBox="0 0 16 16" fill="none">
            <path
              d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2.5-2.5a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"
              fill="currentColor"
            />
          </svg>
        </span>

        <div class="kqc-checkbox-item__content">
          <span class="kqc-checkbox-item__label">
            {{ label }}
            <span v-if="required" class="kqc-checkbox-group__required">*</span>
          </span>
          <span v-if="hint" class="kqc-checkbox-item__desc">{{ hint }}</span>
        </div>
      </label>
    </div>

    <!-- 驗證錯誤訊息 -->
    <Transition name="fade">
      <span v-if="errorMessage" class="kqc-checkbox-group__error">
        <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}
      </span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/**
 * B2B 企業級 Checkbox 選項介面
 */
export interface CheckboxOption {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
}

interface Props {
  /** 群組或單一核取方塊標題 */
  label?: string;
  /** 提示小字 */
  hint?: string;
  /** 選項清單（未傳入時自動切換為單一布林核取模式） */
  options?: CheckboxOption[];
  /** 佈局方式：grid (網格) / flex (自適應) / column (單列) */
  layout?: 'grid' | 'flex' | 'column';
  /** 視覺風格：default (傳統框) / card (商務卡片模式) / button (按鈕標籤) */
  variant?: 'default' | 'card' | 'button';
  /** 必填標示 */
  required?: boolean;
  /** 停用狀態 */
  disabled?: boolean;
  /** 錯誤訊息 */
  errorMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  options: () => [],
  layout: 'grid',
  variant: 'card',
  required: false,
  disabled: false,
  errorMessage: ''
});

// Vue 3.4+ defineModel：同時支援單選 Toggle (boolean) 與多選 Group ((string | number)[])
const modelValue = defineModel<boolean | (string | number)[]>({
  default: false
});

// 僅手動宣告自訂 change 事件，不重複宣告 update:modelValue 以免型別衝突
const emit = defineEmits<{
  (e: 'change', value: boolean | (string | number)[]): void;
}>();

// 判斷是否勾選
const isChecked = (val?: string | number): boolean => {
  if (Array.isArray(modelValue.value)) {
    return val !== undefined ? modelValue.value.includes(val) : false;
  }
  return Boolean(modelValue.value);
};

// 處理點擊與狀態更新
const handleChange = (val?: string | number): void => {
  if (props.disabled) return;

  if (Array.isArray(modelValue.value)) {
    if (val === undefined) return;
    const currentValues = [...modelValue.value];
    const index = currentValues.indexOf(val);

    if (index === -1) {
      currentValues.push(val);
    } else {
      currentValues.splice(index, 1);
    }

    modelValue.value = currentValues;
    emit('change', currentValues);
  } else {
    const nextVal = !modelValue.value;
    modelValue.value = nextVal;
    emit('change', nextVal);
  }
};
</script>

<style lang="scss" scoped>
/* ==========================================================================
   Design Tokens (三爵鋼鐵藍 × 琥珀璀璨金 - 100% 全域語意 Token 驅動)
   ========================================================================== */
.kqc-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  &__header {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  &__label {
    font-size: 15px;
    font-weight: 700;
    color: var(--kqc-text-main);
  }

  &__required {
    color: var(--kqc-danger);
    margin-left: 2px;
  }

  &__hint {
    font-size: 13px;
    color: var(--kqc-text-muted);
  }

  /* 佈局模式 */
  &__options {
    display: grid;
    gap: 12px;

    &.layout-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }

    &.layout-flex {
      display: flex;
      flex-wrap: wrap;
    }

    &.layout-column {
      grid-template-columns: 1fr;
    }
  }

  &__error {
    font-size: 13px;
    color: var(--kqc-danger);
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

/* ==========================================================================
   Checkbox 單一項目樣式重構 (Card 視覺風格)
   ========================================================================== */
.kqc-checkbox-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background-color: var(--kqc-bg-card);
  border: 1.5px solid var(--kqc-border);
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* 自訂勾選方框 */
  &__box {
    width: 18px;
    height: 18px;
    border: 2px solid var(--kqc-text-muted);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--kqc-bg-card);
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  &__icon {
    width: 14px;
    height: 14px;
    color: var(--kqc-color-white);
    opacity: 0;
    transform: scale(0.6);
    transition: all 0.15s ease-in-out;
  }

  &__content {
    display: flex;
    flex-direction: column;
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: var(--kqc-text-main);
  }

  &__desc {
    font-size: 12px;
    color: var(--kqc-text-muted);
    margin-top: 2px;
  }

  /* Hover 狀態 */
  &:hover:not(.is-disabled) {
    border-color: var(--kqc-primary);
    background-color: var(--kqc-bg-hover);

    .kqc-checkbox-item__box {
      border-color: var(--kqc-primary-hover);
    }
  }

  /* Checked 選取狀態 */
  &.is-checked {
    border-color: var(--kqc-primary);
    background-color: var(--kqc-bg-selected);
    box-shadow: var(--kqc-shadow-sm);

    .kqc-checkbox-item__box {
      background-color: var(--kqc-primary);
      border-color: var(--kqc-primary);
    }

    .kqc-checkbox-item__icon {
      opacity: 1;
      transform: scale(1);
    }

    .kqc-checkbox-item__label {
      color: var(--kqc-primary);
      font-weight: 700;
    }
  }

  /* Disabled 停用狀態 */
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: var(--kqc-bg-hover);
    border-color: var(--kqc-border);
  }
}

/* 漸變動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>