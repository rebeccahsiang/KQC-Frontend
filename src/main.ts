import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import ToastService from 'primevue/toastservice' // 1. 匯入 Toast 服務

// PrimeVue 配置
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

// 全域 SCSS / Tailwind 樣式
// 核心修正：統一由 assets/styles/main.scss 載入全域樣式，移除單獨引入 _theme.scss 的舊路徑
import '@/assets/styles/main.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
void useAuthStore(pinia).initialize()
app.use(router)
app.use(ToastService) // 2. 啟用 Toast 服務 (AuthModal 必須)
app.use(PrimeVue, {
    theme: {
        preset: Aura, // 使用 PrimeVue 預設主題或客製 preset
        options: {
      darkModeSelector: '[data-theme="dark"]', // 對齊三爵暗黑戰情室切換邏輯
    }
    }
})

app.mount('#app')
