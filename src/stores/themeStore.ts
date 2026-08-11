import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 1. 定義主題嚴格型別，避免魔法字串（Magic Strings）
export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'kqc-theme';

export const useThemeStore = defineStore('theme', () => {
  // 2. 初始化狀態：優先讀取快取，若無則預設為明亮模式
  const currentTheme = ref<ThemeMode>(
    (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'light'
  );

  /**
   * 核心設置函式 (Single Source of Truth)
   * 統一步驟：更新 Reactive 狀態 -> 寫入 DOM dataset -> 落地 localStorage
   */
  const setTheme = (theme: ThemeMode): void => {
    currentTheme.value = theme;

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem(STORAGE_KEY, theme);
  };

  // 🟢 1. 新增 isDark 計算屬性
  const isDark = computed(() => currentTheme.value === 'dark')

  /**
   * 一鍵扭轉明暗時空（切換邏輯）
   */
  const toggleTheme = (): void => {
    const nextTheme: ThemeMode = currentTheme.value === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  /**
   * 頁面初始化/重整（F5）喚醒儀式
   */
  const initTheme = (): void => {
    setTheme(currentTheme.value);
  };

  return {
    currentTheme,
    isDark, // 👈 2. 必須在這裡 return，FrontHeader.vue 才能取得 TypeScript 型別提示！
    setTheme,
    toggleTheme,
    initTheme,
  };
});