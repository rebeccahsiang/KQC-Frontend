import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import router from './router'
import './style.css'
// 🎯 關鍵：在這裡引入全域樣式變數，才能真正通電到全站！
import './styles/_theme.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
      darkModeSelector: '.dark', // 支援你的暗黑戰情室切換
    }
    }
})

app.mount('#app')
