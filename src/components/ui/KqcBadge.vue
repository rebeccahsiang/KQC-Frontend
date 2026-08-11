<script setup lang="ts">
interface Props {
  /** 徽章色彩變體 (對齊三爵專案色彩規範) */
  variant?: 'accent' | 'primary' | 'danger' | 'success' | 'outline' | 'neutral'
  /** 尺寸 */
  size?: 'sm' | 'md'
  /** 是否為圓角膠囊狀 (Pill Shape) */
  pill?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'accent',
  size: 'md',
  pill: true,
})
</script>

<template>
  <span
    class="kqc-badge"
    :class="[
      `kqc-badge--${variant}`,
      `kqc-badge--${size}`,
      { 'kqc-badge--pill': pill },
    ]"
  >
    <slot />
  </span>
</template>

<style lang="scss" scoped>
.kqc-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  transition: var(--kqc-transition, all 0.2s ease);

  /* 尺寸 Sizes */
  &--sm {
    padding: 2px 8px;
    font-size: 11px;
  }
  &--md {
    padding: 4px 10px;
    font-size: 12px;
  }

  /* 圓角邊框 (預設膠囊狀) */
  border-radius: var(--kqc-radius-sm, 4px);
  &--pill {
    border-radius: 9999px;
  }

  /* 變體 Variants (100% 全域 SCSS Theme Tokens 驅動) */
  /* 1. 琥珀璀璨金 (Accent) */
  &--accent {
    background-color: var(--kqc-accent);
    color: var(--kqc-color-white, #ffffff);
  }

  /* 2. 三爵鋼鐵藍 (Primary) */
  &--primary {
    background-color: var(--kqc-primary);
    color: var(--kqc-color-white, #ffffff);
  }

  /* 3. 警示/危險紅 (Danger) */
  &--danger {
    background-color: var(--kqc-danger-bg, rgba(239, 68, 68, 0.15));
    color: var(--kqc-danger);
    border: 1px solid var(--kqc-danger);
  }

  /* 4. 成功媒合綠 (Success) */
  &--success {
    background-color: var(--kqc-success-bg, rgba(16, 185, 129, 0.15));
    color: var(--kqc-success);
    border: 1px solid var(--kqc-success);
  }

  /* 5. 外框標籤 (Outline) */
  &--outline {
    background-color: transparent;
    color: var(--kqc-text-main);
    border: 1px solid var(--kqc-border);
  }

  /* 6. 次要中性標籤 (Neutral) */
  &--neutral {
    background-color: var(--kqc-bg-hover);
    color: var(--kqc-text-muted);
  }
}
</style>