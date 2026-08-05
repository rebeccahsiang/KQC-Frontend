// src/stores/theme.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // 1. 初始化狀態：優先讀取快取，若無則預設為傳產高階黑曜石暗黑模式
  const currentTheme = ref<string>(localStorage.getItem('kqc-theme') || 'dark');

  // 2. 一鍵扭轉明暗時空（一鍵切換邏輯）
  const toggleTheme = (): void => {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark';
    
    // 🗃️ 落地儲存至瀏覽器快取，下次車行老闆登入時免重新點選
    localStorage.setItem('kqc-theme', currentTheme.value);
    
    // 🧬 實時注入 HTML 節點標籤
    document.documentElement.setAttribute('data-theme', currentTheme.value);
  };

  // 3. 專屬初始化儀式：確保頁面重整（F5）時主題不閃爍、不跑版
  const initTheme = (): void => {
    document.documentElement.setAttribute('data-theme', currentTheme.value);
  };

  return { currentTheme, toggleTheme, initTheme };
});