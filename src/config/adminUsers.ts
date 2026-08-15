import type { AccountStatus } from '@/api/adminUsers'
import type { Role } from '@/api/auth'

export const ADMIN_USER_SECTIONS = Object.freeze({
  members: { role: 'user', label: '會員帳號' },
  sales: { role: 'sales', label: '業務帳號' },
  managers: { role: 'manager', label: '平台管理者' },
  admins: { role: 'admin', label: '最高管理者' }
} as const)

export const ROLE_LABELS: Record<Role, string> = { user: '會員', sales: '業務', manager: '平台管理者', admin: '最高管理者' }
export const STATUS_LABELS: Record<AccountStatus, string> = { pending: '待啟用', active: '使用中', suspended: '已暫停', disabled: '已停用' }
export const STATUS_SEVERITY: Record<AccountStatus, 'warn' | 'success' | 'danger' | 'secondary'> = { pending: 'warn', active: 'success', suspended: 'danger', disabled: 'secondary' }

export const formatAdminDate = (value: string | null, fallback = '尚未登入') => value
  ? new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : fallback
