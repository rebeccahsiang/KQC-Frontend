import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  // 1. 前台公開頁面
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '三爵資訊 KQC - 智慧運輸與 AI 轉型平台' }
  },
  // 2. 設計系統展示頁 (Design System)
  {
    path: '/design-system',
    name: 'DesignSystem',
    component: () => import('@/views/DesignSystemView.vue'),
    meta: { title: 'Design System - 企業視覺規範展示' }
  },
  // 3. 後台管理系統 (採用 AdminLayout 作為外框，配置完整功能模組)
  {
    path: '/admin',
    component: () => import('@/components/layout/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true },
    children: [
      // 3.1 總覽戰情室 (僅留存數據圖表、KPI卡片、供需晴雨窗)
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '總覽戰情室 | 三爵後台管理' }
      },
      // 3.2 前台管理模組
      {
        path: 'frontend',
        name: 'FrontendManagement',
        redirect: '/admin/frontend/marquee',
        children: [
          {
            path: 'marquee',
            name: 'MarqueeManage',
            component: () => import('@/views/admin/frontend/MarqueeView.vue'),
            meta: { title: '跑馬燈管理 | 三爵後台管理' }
          },
          {
            path: 'banner',
            name: 'BannerManage',
            component: () => import('@/views/admin/frontend/BannerView.vue'),
            meta: { title: '首頁輪播圖 | 三爵後台管理' }
          }
        ]
      },
      // 3.3 案件管理模組 (將「新增智慧案例來源櫥窗」完全物理隔離至此)
      {
        path: 'cases',
        name: 'CaseManagement',
        redirect: '/admin/cases/list',
        children: [
          {
            path: 'list',
            name: 'CaseList',
            component: () => import('@/views/admin/cases/CaseListView.vue'),
            meta: { title: '案件列表 | 三爵後台管理' }
          },
          {
            path: 'create',
            name: 'CaseCreate',
            component: () => import('@/views/admin/cases/CaseCreateView.vue'),
            meta: { title: '新增智慧案例 | 三爵後台管理' } // 原本畫面中的大表單頁
          },
          {
            path: 'photos',
            name: 'CasePhotos',
            component: () => import('@/views/admin/cases/CasePhotosView.vue'),
            meta: { title: '案件照片管理 | 三爵後台管理' }
          }
        ]
      },
      // 3.4 訊息管理模組 (結合 LINE Bot 與 AI 智能客服紀錄)
      {
        path: 'messages',
        name: 'MessageManagement',
        redirect: '/admin/messages/emails',
        children: [
          {
            path: 'emails',
            name: 'EmailLogs',
            component: () => import('@/views/admin/messages/EmailLogsView.vue'),
            meta: { title: '表格電子郵件紀錄 | 三爵後台管理' }
          },
          {
            path: 'ai-faq',
            name: 'AiFaqManage',
            component: () => import('@/views/admin/messages/AiFaqView.vue'),
            meta: { title: '智能客服答疑 | 三爵後台管理' }
          }
        ]
      }
    ]
  },
  // 4. 防呆 Catch-All 路由 (避免無效網址白屏)
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 切換頁面時自動回到頂部
  scrollBehavior() {
    return { top: 0 }
  }
})

// 全域導航守衛 (Navigation Guard)：處理動態 Page Title 與 身份驗證預留
router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router