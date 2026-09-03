import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

import { useAuthStore } from '@/stores/authStore'
import { adminLandingPath, hasAnyCapability, type Capability } from '@/config/capabilities'
import { setRuntimeAuthPortal } from '@/auth/authRuntime'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue'), meta: { title: '三爵資訊 KQC - 智慧運輸與 AI 轉型平台' } },
  { path: '/products', name: 'Products', component: () => import('@/views/ProductView.vue'), meta: { title: '業務櫥窗與資產轉型 - 三爵資訊 KQC' } },
  { path: '/company', name: 'Company', component: () => import('@/views/CompanyView.vue'), meta: { title: '關於公司與品牌理念 - 三爵資訊 KQC' } },
  { path: '/insights', name: 'Insights', component: () => import('@/views/InsightsView.vue'), meta: { title: '產業洞察與趨勢分析 - 三爵資訊 KQC' } },
  // Industry Insights / Public Article Detail / WEB-1F-D2C
  { path: '/insights/:slug', name: 'InsightDetail', component: () => import('@/views/InsightsDetailView.vue'), meta: { title: '產業文章 - 三爵資訊 KQC' } },
  { path: '/contact', name: 'Contact', component: () => import('@/views/ContactView.vue'), meta: { title: '聯絡我們與一對一諮詢 - 三爵資訊 KQC' } },
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { title: '會員與管理員登入 - 三爵資訊 KQC' } },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: () => import('@/views/VerifyEmailView.vue'),
    meta: { title: '驗證電子郵件 - 三爵資訊 KQC' }
  },
  {
    path: '/accept-invitation',
    name: 'AcceptInvitation',
    component: () => import('@/views/AcceptInvitationView.vue'),
    meta: { title: '接受後台帳號邀請 - 三爵資訊 KQC' }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/ChangePasswordView.vue'),
    meta: { requiresAuth: true, title: '變更密碼 - 三爵資訊 KQC' }
  },
  {
    path: '/account/sessions',
    name: 'MemberSessions',
    component: () => import('@/views/account/SessionManagementView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['user'],
      authPortal: 'frontend',
      title: '登入中的裝置 - 三爵資訊 KQC'
    }
  },
  { path: '/design-system', name: 'DesignSystem', component: () => import('@/views/DesignSystemView.vue'), meta: { title: 'Design System - 三爵鋼鐵藍 × 琥珀金 Token 展示' } },
  {
    path: '/admin',
    component: () => import('@/components/layout/AdminLayout.vue'),
    redirect: { name: 'AdminLanding' },
    meta: { requiresAuth: true, authPortal: 'admin', title: '後台管理戰情室', capabilities: ['SALES', 'SALES_SUPERVISOR', 'PLATFORM_MANAGER', 'ADMIN'] },
    children: [
      {
        path: 'landing',
        name: 'AdminLanding',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '後台入口' }
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '總覽戰情室', roles: ['manager', 'admin'] }
      },
      { path: 'invitations', name: 'AdminInvitations', component: () => import('@/views/admin/invitations/AdminInvitationsView.vue'), meta: { title: '員工邀請', capabilities: ['ADMIN'] } },
      { path: 'organizations', name: 'AdminOrganizations', component: () => import('@/views/admin/organizations/AdminOrganizationsView.vue'), meta: { title: '組織管理', capabilities: ['ADMIN', 'SALES_SUPERVISOR', 'PLATFORM_MANAGER'] } },
      { path: 'finance', name: 'AdminFinanceCenter', component: () => import('@/views/admin/finance/FinanceCenterView.vue'), meta: { title: '財務中心', capabilities: ['ADMIN'] } },
      { path: 'finance/:businessCaseId', name: 'AdminFinanceDetail', component: () => import('@/views/admin/finance/FinanceDetailView.vue'), meta: { title: '財務案件詳情', capabilities: ['ADMIN'] } },
      { path: 'crm/my-business', name: 'CrmMyBusiness', component: () => import('@/views/admin/crm/MyBusinessView.vue'), meta: { title: '我的業務', capabilities: ['SALES', 'SALES_SUPERVISOR'] } },
      // ============================================================
      // Industry Insights — Admin Article Management
      // WEB-1F-D2A
      // ============================================================
      { path: 'content/articles', name: 'AdminArticles', component: () => import('@/views/admin/content/AdminArticlesView.vue'), meta: { title: '文章管理', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] } },
      // D2F-B — Article Image Library Route
      { path: 'content/article-images', name: 'AdminArticleImages', component: () => import('@/views/admin/content/AdminArticleImagesView.vue'), meta: { title: '文章圖片', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] } },
      {
        path: 'users',
        name: 'AdminUserManagement',
        redirect: '/admin/users/members',
        meta: { title: '帳號管理', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] },
        children: [
          { path: 'members', name: 'AdminMembers', component: () => import('@/views/admin/users/AdminUsersView.vue'), meta: { title: '會員帳號', userSection: 'members', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] } },
          { path: 'sales', name: 'AdminSalesUsers', component: () => import('@/views/admin/users/AdminUsersView.vue'), meta: { title: '業務帳號', userSection: 'sales', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] } },
          { path: 'managers', name: 'AdminManagerUsers', component: () => import('@/views/admin/users/AdminUsersView.vue'), meta: { title: '平台管理者', userSection: 'managers', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] } },
          { path: 'admins', name: 'AdminUsers', component: () => import('@/views/admin/users/AdminUsersView.vue'), meta: { title: '最高管理者', userSection: 'admins', capabilities: ['ADMIN'] } }
        ]
      },
      {
        path: 'frontend',
        name: 'FrontendManagement',
        redirect: '/admin/frontend/marquee',
        meta: { title: '前台管理', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] },
        children: [
          { path: 'marquee', name: 'MarqueeManage', component: () => import('@/views/admin/frontend/MarqueeView.vue'), meta: { title: '跑馬燈管理', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] } },
          // D2G-B — Carousel Image Admin Management route.
          { path: 'carousel-images', name: 'CarouselImagesManage', component: () => import('@/views/admin/frontend/CarouselImagesView.vue'), meta: { title: '輪播圖片', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] } },
          { path: 'banner', redirect: '/admin/frontend/carousel-images' }
        ]
      },
      {
        path: 'cases',
        name: 'CaseManagement',
        redirect: '/admin/cases/list',
        meta: { title: '案件管理', capabilities: ['SALES', 'SALES_SUPERVISOR', 'ADMIN'] },
        children: [
          // PRODUCT-CASE-B3-E2E-R2 — ADMIN Creator Authority / PLATFORM_MANAGER does not imply Marketplace access.
          { path: 'list', name: 'CaseList', component: () => import('@/views/admin/cases/CaseListView.vue'), meta: { title: '商品列表', capabilities: ['SALES', 'SALES_SUPERVISOR', 'ADMIN'] } },
          // PRODUCT-CASE-B3-E2E-R9 — Reviewer Case Detail / direct refresh retains case identity while Backend detail remains scope authority.
          { path: 'review/:id', name: 'CaseReview', component: () => import('@/views/admin/cases/CaseCreateView.vue'), meta: { title: '審核商品案件', capabilities: ['SALES', 'SALES_SUPERVISOR', 'ADMIN'] } },
          { path: 'create', name: 'CaseCreate', component: () => import('@/views/admin/cases/CaseCreateView.vue'), meta: { title: '商品案件', capabilities: ['SALES', 'SALES_SUPERVISOR', 'ADMIN'] } },
          { path: 'photos', name: 'CasePhotos', component: () => import('@/views/admin/cases/CasePhotosView.vue'), meta: { title: '商品照片', capabilities: ['SALES_SUPERVISOR', 'ADMIN'] } },
          { path: 'advertisement-photos', name: 'AdvertisementPhotos', component: () => import('@/views/admin/cases/AdvertisementPhotosView.vue'), meta: { title: '廣告照片', capabilities: ['SALES_SUPERVISOR', 'ADMIN'] } },
          // PRODUCT-ADVERTISEMENT-R2B — Advertisement Case Route Authorization
          { path: 'advertisements', name: 'AdvertisementCases', component: () => import('@/views/admin/cases/AdvertisementCasesView.vue'), meta: { title: '廣告案件', capabilities: ['SALES_SUPERVISOR', 'ADMIN'] } }
        ]
      },
      {
        path: 'messages',
        name: 'MessageManagement',
        redirect: '/admin/messages/emails',
        meta: { title: '訊息管理', capabilities: ['ADMIN'] },
        children: [
          { path: 'emails', name: 'EmailLogs', component: () => import('@/views/admin/messages/EmailLogsView.vue'), meta: { title: '表格電子郵件紀錄', capabilities: ['ADMIN'] } },
          { path: 'ai-faq', name: 'AiFaqManage', component: () => import('@/views/admin/messages/AiFaqView.vue'), meta: { title: '智能客服答疑紀錄', capabilities: ['ADMIN'] } },
          { path: 'contact-inquiries', name: 'ContactInquiries', component: () => import('@/views/admin/messages/ContactInquiriesView.vue'), meta: { title: '聯絡我們諮詢', capabilities: ['ADMIN'] } },
          { path: 'human-consultations', name: 'HumanConsultations', component: () => import('@/views/admin/messages/HumanConsultationsView.vue'), meta: { title: '真人諮詢需求', capabilities: ['ADMIN'] } }
        ]
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

/* PRODUCT-SIDEBAR-R4F-5 — Single Product Hash Scroll Authority / ProductView owns only its two approved public anchors. */
const productOwnedHashes = new Set(['#marketplace-cases', '#transfer-process'])

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to) => {
    if (to.name === 'Products' && productOwnedHashes.has(to.hash)) return false
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  if (to.meta.title) document.title = String(to.meta.title)

  const portal = to.matched.some((record) => record.meta.authPortal === 'admin') ? 'admin' : 'frontend'
  if (portal === 'frontend') setRuntimeAuthPortal('frontend')

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (!requiresAuth) return true

  const authStore = useAuthStore()
  if (!authStore.initialized) await authStore.initialize()

  if (portal === 'admin') {
    if (!authStore.isAuthenticated || !authStore.isAdminPortalUser) return { name: 'Home' }
    if (!await authStore.ensureAdminSession()) return { name: 'Login', query: { redirect: to.fullPath } }
    if (to.name === 'AdminLanding') return adminLandingPath(authStore.user)
  }
  setRuntimeAuthPortal(portal)

  if (portal === 'frontend' && !authStore.isAuthenticated) {
    if (to.meta.authPortal === 'frontend') {
      authStore.openAuthModal('login', '請先重新登入。')
      return { name: 'Home' }
    }
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
  const requiredCapabilities = to.meta.capabilities as Capability[] | undefined
  if (requiredCapabilities && !hasAnyCapability(authStore.user, requiredCapabilities)) return { name: 'Home' }
  return true
})

export default router
