import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  // =========================================================
  // 1. 前台公開區域 (Public Frontend Routes)
  // =========================================================
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '三爵資訊 KQC - 智慧運輸與 AI 轉型平台' },
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/ProductView.vue'),
    meta: { title: '業務櫥窗與資產轉型 - 三爵資訊 KQC' },
  },
  {
    path: '/company',
    name: 'Company',
    component: () => import('@/views/CompanyView.vue'),
    meta: { title: '關於公司與品牌理念 - 三爵資訊 KQC' },
  },
  {
    path: '/insights',
    name: 'Insights',
    component: () => import('@/views/InsightsView.vue'),
    meta: { title: '產業洞察與趨勢分析 - 三爵資訊 KQC' },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/ContactView.vue'),
    meta: { title: '聯絡我們與一對一諮詢 - 三爵資訊 KQC' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '會員與管理員登入 - 三爵資訊 KQC' },
  },

  // =========================================================
  // 2. 設計系統展示頁 (Design System Sandbox)
  // =========================================================
  {
    path: '/design-system',
    name: 'DesignSystem',
    component: () => import('@/views/DesignSystemView.vue'),
    meta: { title: 'Design System - 三爵鋼鐵藍 × 琥珀金 Token 展示' },
  },

  // =========================================================
  // 3. 後台管理系統 (Restricted Admin Portal - AdminLayout)
  // =========================================================
  {
    path: '/admin',
    component: () => import('@/components/layout/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: {
      requiresAuth: true,
      title: '後台管理戰情室',
      roles: ['admin', 'editor'],
    },
    children: [
      // 3.1 總覽戰情室
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '總覽戰情室', roles: ['admin', 'editor'] },
      },
      // 3.2 前台管理模組 (跑馬燈 / Banner)
      {
        path: 'frontend',
        name: 'FrontendManagement',
        redirect: '/admin/frontend/marquee',
        meta: { title: '前台管理', roles: ['admin'] },
        children: [
          {
            path: 'marquee',
            name: 'MarqueeManage',
            component: () => import('@/views/admin/frontend/MarqueeView.vue'),
            meta: { title: '跑馬燈管理', roles: ['admin'] },
          },
          {
            path: 'banner',
            name: 'BannerManage',
            component: () => import('@/views/admin/frontend/BannerView.vue'),
            meta: { title: '首頁輪播圖管理', roles: ['admin'] },
          },
        ],
      },
      // 3.3 案件管理模組 (個資嚴格隔離區)
      {
        path: 'cases',
        name: 'CaseManagement',
        redirect: '/admin/cases/list',
        meta: { title: '案件管理', roles: ['admin', 'editor'] },
        children: [
          {
            path: 'list',
            name: 'CaseList',
            component: () => import('@/views/admin/cases/CaseListView.vue'),
            meta: { title: '案件列表管理', roles: ['admin', 'editor'] },
          },
          {
            path: 'create',
            name: 'CaseCreate',
            component: () => import('@/views/admin/cases/CaseCreateView.vue'),
            meta: { title: '新增智慧案例', roles: ['admin'] },
          },
          {
            path: 'photos',
            name: 'CasePhotos',
            component: () => import('@/views/admin/cases/CasePhotosView.vue'),
            meta: { title: '案件照片管理', roles: ['admin'] },
          },
        ],
      },
      // 3.4 訊息與 AI 客服紀錄管理
      {
        path: 'messages',
        name: 'MessageManagement',
        redirect: '/admin/messages/emails',
        meta: { title: '訊息管理', roles: ['admin'] },
        children: [
          {
            path: 'emails',
            name: 'EmailLogs',
            component: () => import('@/views/admin/messages/EmailLogsView.vue'),
            meta: { title: '表格電子郵件紀錄', roles: ['admin'] },
          },
          {
            path: 'ai-faq',
            name: 'AiFaqManage',
            component: () => import('@/views/admin/messages/AiFaqView.vue'),
            meta: { title: '智能客服答疑紀錄', roles: ['admin'] },
          },
        ],
      },
    ],
  },

  // =========================================================
  // 4. 防呆 Catch-All 路由 (避免網址打錯出現預設白屏)
  // =========================================================
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 切換頁面時自動回到頂部
  scrollBehavior() {
    return { top: 0 }
  },
})

// =========================================================
// 5. 全域導航守衛 (Navigation Guard & RBAC 預留)
// =========================================================
router.beforeEach((to, _from, next) => {
  // 1. 動態更新瀏覽器頁面頁籤標題 (Tab Title)
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // 2. 權限檢查 (未登入者存取 /admin 區域時，自動防呆導回 /login)
  const isAuthenticated = localStorage.getItem('token') // 範例 Token 驗證邏輯
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 未驗證且嘗試進入後台，安全導至登入頁
    return next({ name: 'Login' })
  }

  next()
})

export default router