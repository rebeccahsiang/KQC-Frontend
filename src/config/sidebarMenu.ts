export interface SidebarMenuItem {
  id: string
  title: string
  icon: string
  path?: string
  roles?: string[]
  children?: SidebarMenuItem[]
}

export const sidebarMenu: SidebarMenuItem[] = [
  {
    id: 'dashboard', title: '總覽戰情室', icon: 'lucide:layout-dashboard',
    path: '/admin/dashboard', roles: ['manager', 'admin']
  },
  {
    id: 'accounts', title: '帳號管理', icon: 'lucide:users', roles: ['admin'],
    children: [
      { id: 'members', title: '會員帳號', icon: 'lucide:user-round', path: '/admin/users/members', roles: ['admin'] },
      { id: 'sales', title: '業務帳號', icon: 'lucide:briefcase-business', path: '/admin/users/sales', roles: ['admin'] },
      { id: 'managers', title: '主管帳號', icon: 'lucide:shield', path: '/admin/users/managers', roles: ['admin'] },
      { id: 'admins', title: '系統管理員', icon: 'lucide:crown', path: '/admin/users/admins', roles: ['admin'] }
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
