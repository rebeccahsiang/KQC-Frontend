<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  badge?: string
  description?: string
  [key: string]: any
}

// Props 規範（業界標準：嚴格型別與預設值）
const props = withDefaults(
  defineProps<{
    options: SelectOption[]
    placeholder?: string
    label?: string
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    error?: boolean
    errorMessage?: string
    searchable?: boolean
    clearable?: boolean
    id?: string
  }>(),
  {
    placeholder: '請選擇項目...',
    label: '',
    size: 'md',
    disabled: false,
    error: false,
    errorMessage: '',
    searchable: false,
    clearable: false,
    id: () => `kqc-select-${Math.random().toString(36).substring(2, 9)}`
  }
)

// Vue 3.4+ v-model 雙向綁定
const modelValue = defineModel<string | number | null>({ default: null })

// 元件內部狀態
const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const selectRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

// 取得當前選中的 Option 物件
const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === modelValue.value) || null
})

// 搜尋過濾後的選項
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) {
    return props.options
  }
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(
    opt =>
      opt.label.toLowerCase().includes(query) ||
      (opt.description && opt.description.toLowerCase().includes(query))
  )
})

// 切換選單開啟/關閉
const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    highlightedIndex.value = filteredOptions.value.findIndex(
      opt => opt.value === modelValue.value
    )
    if (props.searchable) {
      nextTick(() => searchInputRef.value?.focus())
    }
  } else {
    searchQuery.value = ''
  }
}

// 選擇項目
const selectOption = (option: SelectOption) => {
  if (option.disabled) return
  modelValue.value = option.value
  isOpen.value = false
  searchQuery.value = ''
}

// 清除選擇
const handleClear = (e: MouseEvent) => {
  e.stopPropagation()
  modelValue.value = null
  searchQuery.value = ''
}

// 點擊元件外部自動關閉 (Click Outside)
const handleClickOutside = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

// 鍵盤無障礙操作 (A11y Keyboard Navigation)
const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return

  switch (e.key) {
    case 'Enter':
    case ' ':
      if (!isOpen.value) {
        toggleDropdown()
      } else if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
        selectOption(filteredOptions.value[highlightedIndex.value])
      }
      e.preventDefault()
      break
    case 'ArrowDown':
      if (!isOpen.value) {
        isOpen.value = true
      } else {
        highlightedIndex.value = (highlightedIndex.value + 1) % filteredOptions.value.length
      }
      e.preventDefault()
      break
    case 'ArrowUp':
      if (!isOpen.value) {
        isOpen.value = true
      } else {
        highlightedIndex.value =
          (highlightedIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length
      }
      e.preventDefault()
      break
    case 'Escape':
      isOpen.value = false
      searchQuery.value = ''
      e.preventDefault()
      break
    case 'Tab':
      isOpen.value = false
      break
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="selectRef"
    class="kqc-select-group"
    :class="[
      `size-${size}`,
      {
        'is-open': isOpen,
        'is-disabled': disabled,
        'has-error': error
      }
    ]"
  >
    <!-- Label 標籤 -->
    <label v-if="label" :for="id" class="kqc-select-label">
      {{ label }}
    </label>

    <!-- 主選擇框 Trigger -->
    <div
      :id="id"
      class="kqc-select-trigger"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-disabled="disabled"
      @click="toggleDropdown"
      @keydown="handleKeydown"
    >
      <div class="kqc-select-value">
        <!-- 具名插槽：自訂選中值呈現樣式 -->
        <slot name="value" :selected="selectedOption">
          <span v-if="selectedOption" class="selected-text">
            {{ selectedOption.label }}
            <span v-if="selectedOption.badge" class="kqc-badge">
              {{ selectedOption.badge }}
            </span>
          </span>
          <span v-else class="placeholder-text">{{ placeholder }}</span>
        </slot>
      </div>

      <!-- 右側 Icon 區塊 (Clear & Chevron) -->
      <div class="kqc-select-actions">
        <button
          v-if="clearable && selectedOption && !disabled"
          type="button"
          class="clear-btn"
          aria-label="Clear selection"
          @click="handleClear"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
        <i class="fa-solid fa-chevron-down chevron-icon"></i>
      </div>
    </div>

    <!-- Dropdown 下拉清單選單 -->
    <Transition name="kqc-dropdown-fade">
      <div v-if="isOpen" class="kqc-select-dropdown" role="listbox">
        <!-- 搜尋輸入框 (Searchable 模式) -->
        <div v-if="searchable" class="kqc-select-search-box" @click.stop>
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="kqc-search-input"
            placeholder="關鍵字搜尋..."
            @keydown="handleKeydown"
          />
        </div>

        <!-- 選項列表 -->
        <ul class="kqc-select-options">
          <li
            v-for="(option, index) in filteredOptions"
            :key="option.value"
            class="kqc-select-option"
            :class="{
              'is-selected': option.value === modelValue,
              'is-highlighted': index === highlightedIndex,
              'is-disabled': option.disabled
            }"
            role="option"
            :aria-selected="option.value === modelValue"
            @click.stop="selectOption(option)"
            @mouseenter="highlightedIndex = index"
          >
            <!-- 具名插槽：自訂 Option 呈現內容 -->
            <slot name="option" :option="option" :selected="option.value === modelValue">
              <div class="option-main">
                <span class="option-label">{{ option.label }}</span>
                <span v-if="option.badge" class="kqc-badge">
                  {{ option.badge }}
                </span>
              </div>
              <p v-if="option.description" class="option-desc">
                {{ option.description }}
              </p>
            </slot>
            <i v-if="option.value === modelValue" class="fa-solid fa-check check-icon"></i>
          </li>

          <!-- 查無資料時顯示 -->
          <li v-if="filteredOptions.length === 0" class="no-data">
            <i class="fa-solid fa-inbox"></i>
            <span>查無匹配的案件或類別</span>
          </li>
        </ul>
      </div>
    </Transition>

    <!-- 錯誤提示訊息 -->
    <span v-if="error && errorMessage" class="kqc-select-error-msg">
      <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
/* ==========================================================================
   KQC 三爵資訊 - Design Tokens (對齊三爵鋼鐵藍 x 琥珀璀璨金 色彩規範)
   ========================================================================== */
.kqc-select-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  font-family: 'DM Sans', 'PingFang TC', 'Microsoft JhengHei', sans-serif;

  .kqc-select-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--kqc-text-main);
    margin-bottom: 6px;
  }

  // 觸發元件主體
  .kqc-select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--kqc-bg-surface);
    border: 1.5px solid var(--kqc-border);
    border-radius: 8px;
    padding: 0 14px;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;

    &:hover:not([aria-disabled="true"]) {
      border-color: var(--kqc-primary-hover);
      background-color: var(--kqc-bg-hover);
    }

    &:focus-visible {
      border-color: var(--kqc-accent);
      box-shadow: 0 0 0 3px var(--kqc-focus-ring); // 金色 Focus 光暈
    }
  }

  .kqc-select-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.95rem;

    .selected-text {
      color: var(--kqc-text-main);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .placeholder-text {
      color: var(--kqc-text-muted);
    }
  }

  .kqc-select-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--kqc-text-muted);

    .clear-btn {
      background: none;
      border: none;
      padding: 2px 4px;
      color: var(--kqc-text-muted);
      cursor: pointer;
      border-radius: 50%;
      font-size: 0.85rem;

      &:hover {
        color: var(--kqc-danger);
      }
    }

    .chevron-icon {
      font-size: 0.8rem;
      transition: transform 0.25s ease;
    }
  }

  // Dropdown 選單面版
  .kqc-select-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: 100%;
    z-index: 1000;
    background-color: var(--kqc-bg-surface);
    border: 1px solid var(--kqc-border);
    border-radius: var(--kqc-radius-md, 10px);
    box-shadow: var(--kqc-shadow-lg);
    overflow: hidden;

    .kqc-select-search-box {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid var(--kqc-border);
      background-color: var(--kqc-bg-hover);

      .search-icon {
        color: var(--kqc-text-muted);
        font-size: 0.85rem;
        margin-right: 8px;
      }

      .kqc-search-input {
        width: 100%;
        border: none;
        background: transparent;
        outline: none;
        font-size: 0.875rem;
        color: var(--kqc-text-main);

        &::placeholder {
          color: var(--kqc-text-muted);
        }
      }
    }

    .kqc-select-options {
      list-style: none;
      margin: 0;
      padding: 6px;
      max-height: 240px;
      overflow-y: auto;

      /* KQC 精緻動態 Scrollbar */
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: var(--kqc-border);
        border-radius: 3px;
      }
    }

    .kqc-select-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.15s ease;

      .option-main {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        color: var(--kqc-text-main);
      }

      .option-desc {
        margin: 2px 0 0 0;
        font-size: 0.75rem;
        color: var(--kqc-text-muted);
      }

      .check-icon {
        color: var(--kqc-primary);
        font-size: 0.85rem;
      }

      &.is-highlighted {
        background-color: var(--kqc-bg-hover);
      }

      &.is-selected {
        background-color: var(--kqc-bg-selected); // 語意變數：亮色為鋼鐵藍淡色背景，暗色模式自動切換
        font-weight: 600;

        .option-main {
          color: var(--kqc-primary);
        }
      }

      &.is-disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .no-data {
      padding: 20px;
      text-align: center;
      color: var(--kqc-text-muted);
      font-size: 0.875rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
  }

  // 微章 Badge 標籤
  .kqc-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    font-size: 0.7rem;
    font-weight: 600;
    border-radius: 4px;
    background-color: var(--kqc-accent);
    color: var(--kqc-primary);
  }

  /* 尺寸變體 (Sizes) */
  &.size-sm .kqc-select-trigger { height: 36px; font-size: 0.85rem; }
  &.size-md .kqc-select-trigger { height: 44px; font-size: 0.95rem; }
  &.size-lg .kqc-select-trigger { height: 52px; font-size: 1.05rem; }

  /* 開啟狀態動態 */
  &.is-open {
    .kqc-select-trigger {
      border-color: var(--kqc-accent);
      box-shadow: 0 0 0 3px var(--kqc-focus-ring);
    }
    .chevron-icon {
      transform: rotate(180deg);
      color: var(--kqc-accent);
    }
  }

  /* 停用狀態 (Disabled) */
  &.is-disabled {
    opacity: 0.55;
    .kqc-select-trigger {
      cursor: not-allowed;
      background-color: var(--kqc-bg-hover);
    }
  }

  /* 錯誤狀態 (Error) */
  &.has-error {
    .kqc-select-trigger {
      border-color: var(--kqc-danger);
    }
    .kqc-select-error-msg {
      margin-top: 4px;
      font-size: 0.75rem;
      color: var(--kqc-danger);
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

// Dropdown 進場與退場動畫
.kqc-dropdown-fade-enter-active,
.kqc-dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.kqc-dropdown-fade-enter-from,
.kqc-dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>