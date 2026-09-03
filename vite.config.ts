import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [
        IconsResolver({
          prefix: 'icon'
        })
      ]
    }),
    Icons({
      autoInstall: true
    })
  ],
  resolve: {
    alias: {
      // 🎯 精準對齊 TypeScript / ESM 頂層路徑映射 (取代舊式 __dirname)
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 跨組件自動注入 SCSS 變數，精準對齊 src/assets/styles/_variables.scss
        additionalData: `@use "@/assets/styles/_variables.scss" as *;`
      }
    }
  },
  // 🟢 核心保留：本地開發 API 反向代理設定
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 指向 Node.js Express 後端伺服器
        changeOrigin: true,             // 允許修改請求標頭的 Origin
        secure: false                    // 若為 http 協議不強制校驗 SSL
      },
      // Article Media / WEB-1F-D2A-1 — local preview uses the bounded Backend static route.
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
