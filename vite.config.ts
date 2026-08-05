import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url' // ✨ 關鍵修正：具名匯出加 {}

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      // 🎯 精準對齊 TypeScript 頂層路徑映射
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 🚀 全域自動注入 Design Tokens，徹底解決 SFC 元件《未定義變數》問題
        // 請依據實體檔案路徑確認（常見為 @/styles/_variables.scss 或 @/assets/styles/_variables.scss）
        additionalData: `@use "@/styles/_variables.scss" as *;`
      }
    }
  }
})