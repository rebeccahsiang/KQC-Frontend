import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminView from '../views/AdminView.vue'
import DesignSystemView from '../views/DesignSystemView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // 1. 前台首頁 (Home)
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      // 2. 後台管理戰情室 (Admin)
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      // 3. KQC UI 設計系統 15 宮格測試戰情頁 (Design System Sandbox)
      path: '/design-system',
      name: 'design-system',
      component: DesignSystemView,
    },
  ],
})

export default router
