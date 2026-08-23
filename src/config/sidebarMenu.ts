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
    id: 'frontend', title: '前台管理', icon: 'lucide:monitor', roles: ['admin'],
    children: [
      { id: 'marquee', title: '跑馬燈', icon: 'lucide:megaphone', path: '/admin/frontend/marquee', roles: ['admin'] },
      { id: 'banner', title: '首頁輪播圖', icon: 'lucide:gallery-horizontal', path: '/admin/frontend/banner', roles: ['admin'] }
    ]
  },
  {
    id: 'cases', title: '案件管理', icon: 'lucide:gem', roles: ['sales', 'manager', 'admin'],
    children: [
      { id: 'case-photos', title: '案件照片管理', icon: 'lucide:image', path: '/admin/cases/photos', roles: ['admin'] },
      { id: 'case-create', title: '新增案件', icon: 'lucide:layers-plus', path: '/admin/cases/create', roles: ['sales', 'manager', 'admin'] },
      { id: 'case-list', title: '案件列表', icon: 'lucide:list-check', path: '/admin/cases/list', roles: ['manager', 'admin'] }
    ]
  },
  {
    id: 'messages', title: '訊息管理', icon: 'lucide:messages-square', roles: ['admin'],
    children: [
      { id: 'emails', title: 'Email 紀錄', icon: 'lucide:mail', path: '/admin/messages/emails', roles: ['admin'] },
      { id: 'ai-faq', title: '智能客服對答', icon: 'lucide:bot', path: '/admin/messages/ai-faq', roles: ['admin'] }
    ]
  }
]
