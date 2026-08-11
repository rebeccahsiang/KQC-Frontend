import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useAuthStore } from '@/stores/authStore'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue'), meta: { title: '三爵資訊 KQC - 智慧運輸與 AI 轉型平台' } },
  { path: '/products', name: 'Products', component: () => import('@/views/ProductView.vue'), meta: { title: '業務櫥窗與資產轉型 - 三爵資訊 KQC' } },
  { path: '/company', name: 'Company', component: () => import('@/views/CompanyView.vue'), meta: { title: '關於公司與品牌理念 - 三爵資訊 KQC' } },
  { path: '/insights', name: 'Insights', component: () => import('@/views/InsightsView.vue'), meta: { title: '產業洞察與趨勢分析 - 三爵資訊 KQC' } },
  { path: '/contact', name: 'Contact', component: () => import('@/views/ContactView.vue'), meta: { title: '聯絡我們與一對一諮詢 - 三爵資訊 KQC' } },
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { title: '會員與管理員登入 - 三爵資訊 KQC' } },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/ChangePasswordView.vue'),
    meta: { requiresAuth: true, title: '變更密碼 - 三爵資訊 KQC' }
  },
  { path: '/design-system', name: 'DesignSystem', component: () => import('@/views/DesignSystemView.vue'), meta: { title: 'Design System - 三爵鋼鐵藍 × 琥珀金 Token 展示' } },
  {
    path: '/admin',
    component: () => import('@/components/layout/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, title: '後台管理戰情室', roles: ['sales', 'manager', 'admin'] },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '總覽戰情室', roles: ['manager', 'admin'] }
      },
      {
        path: 'frontend',
        name: 'FrontendManagement',
        redirect: '/admin/frontend/marquee',
        meta: { title: '前台管理', roles: ['admin'] },
        children: [
          { path: 'marquee', name: 'MarqueeManage', component: () => import('@/views/admin/frontend/MarqueeView.vue'), meta: { title: '跑馬燈管理', roles: ['admin'] } },
          { path: 'banner', name: 'BannerManage', component: () => import('@/views/admin/frontend/BannerView.vue'), meta: { title: '首頁輪播圖管理', roles: ['admin'] } }
        ]
      },
      {
        path: 'cases',
        name: 'CaseManagement',
        redirect: '/admin/cases/list',
        meta: { title: '案件管理', roles: ['sales', 'manager', 'admin'] },
        children: [
          { path: 'list', name: 'CaseList', component: () => import('@/views/admin/cases/CaseListView.vue'), meta: { title: '案件列表管理', roles: ['manager', 'admin'] } },
          { path: 'create', name: 'CaseCreate', component: () => import('@/views/admin/cases/CaseCreateView.vue'), meta: { title: '新增智慧案例', roles: ['sales', 'manager', 'admin'] } },
          { path: 'photos', name: 'CasePhotos', component: () => import('@/views/admin/cases/CasePhotosView.vue'), meta: { title: '案件照片管理', roles: ['admin'] } }
        ]
      },
      {
        path: 'messages',
        name: 'MessageManagement',
        redirect: '/admin/messages/emails',
        meta: { title: '訊息管理', roles: ['admin'] },
        children: [
          { path: 'emails', name: 'EmailLogs', component: () => import('@/views/admin/messages/EmailLogsView.vue'), meta: { title: '表格電子郵件紀錄', roles: ['admin'] } },
          { path: 'ai-faq', name: 'AiFaqManage', component: () => import('@/views/admin/messages/AiFaqView.vue'), meta: { title: '智能客服答疑紀錄', roles: ['admin'] } }
        ]
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to) => {
  if (to.meta.title) document.title = String(to.meta.title)

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (!requiresAuth) return true

  const authStore = useAuthStore()
  if (!authStore.initialized) await authStore.initialize()

  if (!authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  const isPasswordChangeRoute = to.name === 'ChangePassword'
  if (authStore.passwordChangeRequired && !isPasswordChangeRoute) {
    return { name: 'ChangePassword', query: { redirect: to.fullPath } }
  }

  const allowedRoles = to.meta.roles as string[] | undefined
  if (allowedRoles && (!authStore.user || !allowedRoles.includes(authStore.user.role))) {
    return { name: 'Home' }
  }
  return true
})

export default router
