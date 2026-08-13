import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'kqc-theme'
const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'light' || value === 'dark'

export const useThemeStore = defineStore('theme', () => {
  const storedTheme = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY)
  const currentTheme = ref<ThemeMode>(isThemeMode(storedTheme) ? storedTheme : 'light')
  const isDark = computed(() => currentTheme.value === 'dark')

  const setTheme = (theme: ThemeMode) => {
    currentTheme.value = theme
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }

  const toggleTheme = () => setTheme(isDark.value ? 'light' : 'dark')
  const initTheme = () => setTheme(currentTheme.value)

  return { currentTheme, isDark, setTheme, toggleTheme, initTheme }
})
