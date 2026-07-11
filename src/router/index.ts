import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// 💡 步驟 1：引入我們剛剛寫好的 AdminView 元件
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    // 💡 步驟 2：在 routes 陣列內，新增後臺管理頁面的路徑規則
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    }
  ]
})

export default router
