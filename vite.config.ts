import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),    
  ],
  resolve: {
    alias: {
      // 💡 確保 `@/` 頂級路徑指引在 TypeScript 環境下精準對齊 src 目錄
      '@': path.resolve(__dirname, './src'),
    }
  },
})