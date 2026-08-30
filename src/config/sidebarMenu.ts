export interface SidebarMenuItem {
  id: string
  title: string
  icon: string
  path?: string
  roles?: string[]
  disabled?: boolean
  capabilities?: import('./capabilities').Capability[]
  children?: SidebarMenuItem[]
}

export const sidebarMenu: SidebarMenuItem[] = [
  {
    id: 'dashboard', title: '總覽戰情室', icon: 'lucide:layout-dashboard',
    path: '/admin/dashboard', roles: ['manager', 'admin']
  },
  {
    id: 'accounts', title: '帳號管理', icon: 'lucide:users', capabilities: ['PLATFORM_MANAGER', 'ADMIN'],
    children: [
      {
        id: 'general-accounts', title: '一般帳號管理', icon: 'lucide:users-round', capabilities: ['PLATFORM_MANAGER', 'ADMIN'],
        children: [
          { id: 'members', title: '會員', icon: 'lucide:user-round', path: '/admin/users/members', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] },
          { id: 'sales', title: '業務', icon: 'lucide:briefcase-business', path: '/admin/users/sales', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] },
          { id: 'managers', title: '平台管理者', icon: 'lucide:shield', path: '/admin/users/managers', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] }
        ]
      },
      {
        id: 'highest-management', title: '最高管理', icon: 'lucide:shield-check', capabilities: ['ADMIN'],
        children: [
          { id: 'admins', title: '最高管理者', icon: 'lucide:crown', path: '/admin/users/admins', capabilities: ['ADMIN'] }
        ]
      }
    ]
  },
  {
    id: 'organization-governance', title: '組織管理', icon: 'lucide:network',
    capabilities: ['ADMIN', 'SALES_SUPERVISOR', 'PLATFORM_MANAGER'],
    children: [
      { id: 'invitations', title: '員工邀請', icon: 'lucide:mail-plus', path: '/admin/invitations', capabilities: ['ADMIN'] },
      { id: 'organizations', title: '組織管理', icon: 'lucide:network', path: '/admin/organizations', capabilities: ['ADMIN', 'SALES_SUPERVISOR', 'PLATFORM_MANAGER'] }
    ]
  },
  {
    id: 'finance-management', title: '財務管理', icon: 'lucide:wallet-cards', capabilities: ['SALES', 'SALES_SUPERVISOR', 'ADMIN'],
    children: [
      { id: 'my-performance', title: '我的績效', icon: 'lucide:circle-check', disabled: true, capabilities: ['SALES', 'SALES_SUPERVISOR', 'ADMIN'] },
      { id: 'team-performance', title: '團隊績效', icon: 'lucide:users-round', disabled: true, capabilities: ['SALES_SUPERVISOR', 'ADMIN'] },
      { id: 'finance-center', title: '財務中心', icon: 'lucide:hand-coins', path: '/admin/finance', capabilities: ['ADMIN'] }
    ]
  },
  {
    id: 'crm-management', title: 'CRM 業務管理', icon: 'lucide:briefcase-business', capabilities: ['SALES', 'SALES_SUPERVISOR', 'ADMIN'],
    children: [
      { id: 'crm-my-business', title: '我的業務', icon: 'lucide:calendar-check', path: '/admin/crm/my-business', capabilities: ['SALES', 'SALES_SUPERVISOR'] },
      { id: 'crm-business-management', title: '業務管理', icon: 'lucide:users-round', disabled: true, capabilities: ['SALES_SUPERVISOR', 'ADMIN'] },
      { id: 'crm-business-reports', title: '業務戰情室', icon: 'lucide:chart-no-axes-combined', disabled: true, capabilities: ['SALES_SUPERVISOR', 'ADMIN'] }
    ]
  },
  {
    // ============================================================
    // D2F-B — Admin Industry Insights Navigation
    // ============================================================
    id: 'content-management', title: '產業洞察', icon: 'lucide:notebook-tabs', capabilities: ['PLATFORM_MANAGER', 'ADMIN'],
    children: [
      { id: 'articles', title: '文章管理', icon: 'lucide:newspaper', path: '/admin/content/articles', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] },
      { id: 'article-images', title: '文章圖片', icon: 'lucide:images', path: '/admin/content/article-images', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] },
      { id: 'related-links', title: '相關連結', icon: 'lucide:link', disabled: true, capabilities: ['PLATFORM_MANAGER', 'ADMIN'] }
    ]
  },
  {
    // D2G-B — Carousel Image Admin Management navigation.
    id: 'frontend', title: '前台管理', icon: 'lucide:monitor', capabilities: ['PLATFORM_MANAGER', 'ADMIN'],
    children: [
      { id: 'marquee', title: '跑馬燈', icon: 'lucide:megaphone', path: '/admin/frontend/marquee', roles: ['admin'] },
      { id: 'carousel-images', title: '輪播圖片', icon: 'lucide:gallery-horizontal', path: '/admin/frontend/carousel-images', capabilities: ['PLATFORM_MANAGER', 'ADMIN'] }
    ]
  },
  {
    id: 'cases', title: '商品管理', icon: 'lucide:gem', capabilities: ['SALES', 'SALES_SUPERVISOR', 'ADMIN'],
    children: [
      { id: 'case-photos', title: '商品照片', icon: 'lucide:image', path: '/admin/cases/photos', capabilities: ['SALES_SUPERVISOR', 'ADMIN'] },
      { id: 'case-create', title: '商品案件', icon: 'lucide:layers-plus', path: '/admin/cases/create', capabilities: ['SALES', 'SALES_SUPERVISOR'] },
      { id: 'case-list', title: '商品列表', icon: 'lucide:list-check', path: '/admin/cases/list', capabilities: ['SALES', 'SALES_SUPERVISOR', 'ADMIN'] }
    ]
  },
  {
    id: 'messages', title: '訊息管理', icon: 'lucide:messages-square', capabilities: ['ADMIN'],
    children: [
      { id: 'emails', title: 'Email 紀錄', icon: 'lucide:mail', path: '/admin/messages/emails', capabilities: ['ADMIN'] },
      { id: 'ai-faq', title: '智能客服對答', icon: 'lucide:bot', path: '/admin/messages/ai-faq', capabilities: ['ADMIN'] },
      { id: 'human-consultations', title: '真人諮詢需求', icon: 'lucide:phone-call', path: '/admin/messages/human-consultations', capabilities: ['ADMIN'] }
    ]
  }
]
