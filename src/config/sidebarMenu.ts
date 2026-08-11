export interface SidebarMenuItem {
  id: string;
  title: string;
  icon: string; // 統一使用 Lucide/Iconify 圖示 (例如 'lucide:layout-dashboard')
  path?: string;
  roles?: string[]; // 允許訪問的角色群，例如 ['admin']
  children?: SidebarMenuItem[];
}

export const sidebarMenu: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    title: '總覽戰情室',
    icon: 'lucide:layout-dashboard',
    path: '/admin/dashboard',
    roles: ['admin', 'editor']
  },
  {
    id: 'frontend',
    title: '前台管理',
    icon: 'lucide:monitor',
    roles: ['admin'],
    children: [
      { id: 'marquee', title: '跑馬燈管理', icon: 'lucide:square-dashed-top-solid', path: '/admin/frontend/marquee', roles: ['admin'] },
      { id: 'banner', title: '首頁輪播圖', icon: 'lucide:gallery-horizontal', path: '/admin/frontend/banner', roles: ['admin'] }
    ]
  },
  {
    id: 'cases',
    title: '案件管理',
    icon: 'lucide:gem',
    roles: ['admin', 'editor'],
    children: [
      { id: 'case-photos', title: '案件照片管理', icon: 'lucide:image', path: '/admin/cases/photos', roles: ['admin'] },
      { id: 'case-create', title: '新增案例', icon: 'lucide:layers-plus', path: '/admin/cases/create', roles: ['admin'] },
      { id: 'case-list', title: '案件列表', icon: 'lucide:list-check', path: '/admin/cases/list', roles: ['admin', 'editor'] }
    ]
  },
  {
    id: 'messages',
    title: '訊息管理',
    icon: 'lucide:messages-square',
    roles: ['admin'],
    children: [
      { id: 'emails', title: '電子郵件紀錄', icon: 'lucide:mail', path: '/admin/messages/emails', roles: ['admin'] },
      { id: 'ai-faq', title: '智能客服答疑', icon: 'lucide:bot', path: '/admin/messages/ai-faq', roles: ['admin'] }
    ]
  },
  {
    id: 'crm',
    title: '業務 CRM',
    icon: 'lucide:handshake',
    children: [
      { id: 'crm-new', title: '業績新增', icon: 'lucide:folder-plus', path: '/admin/crm/new' },
      { id: 'crm-follow', title: '業績追蹤', icon: 'lucide:user-round-check', path: '/admin/crm/follow' },
      { id: 'crm-list', title: '業績總表', icon: 'lucide:list-chevrons-up-down', path: '/admin/crm/list' }
    ]
  }
];
