export interface MenuItem {
  id: string
  title: string
  icon: string // 統一使用 Lucide Icon 命名空間 (如 'lucide:layout-dashboard')
  path?: string
  children?: MenuItem[]
}

export const menuTree: MenuItem[] = [
  {
    id: 'dashboard',
    title: '總覽戰情室',
    icon: 'lucide:layout-dashboard',
    path: '/admin/dashboard',
    children: [
      { id: 'analytics', title: '分析頁', icon: 'lucide:chart-no-axes-combined', path: '/admin/analytics' }
    ]
  },
  {
    id: 'frontend',
    title: '前台管理',
    icon: 'lucide:monitor',
    children: [
      { id: 'marquee', title: '跑馬燈', icon: 'lucide:square-dashed-top-solid', path: '/admin/frontend/marquee' },
      { id: 'banner', title: '首頁輪播圖', icon: 'lucide:gallery-horizontal', path: '/admin/frontend/banner' }
    ]
  },
  {
    id: 'cases',
    title: '案件管理',
    icon: 'lucide:gem',
    children: [
      { id: 'case-media', title: '案件照片', icon: 'lucide:image', path: '/admin/cases/photos' },
      { id: 'case-new', title: '新增案件', icon: 'lucide:layers-plus', path: '/admin/cases/create' },
      { id: 'case-list', title: '案件列表', icon: 'lucide:list-check', path: '/admin/cases/list' } // 核心 AdminView 區塊
    ]
  },
  {
    id: 'messages',
    title: '訊息管理',
    icon: 'lucide:messages-square',
    children: [
      { id: 'emails', title: '表格 Email 紀錄', icon: 'lucide:mail', path: '/admin/messages/emails' },
      { id: 'ai-chat', title: '智能客服對答', icon: 'lucide:bot', path: '/admin/messages/ai-chat' }
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
]