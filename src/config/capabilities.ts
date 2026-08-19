import type { Role } from '@/api/auth'

export type Capability = 'MEMBER' | 'SALES' | 'SALES_SUPERVISOR' | 'PLATFORM_MANAGER' | 'ADMIN'

export const CAPABILITIES = Object.freeze({
  MEMBER: 'MEMBER', SALES: 'SALES', SALES_SUPERVISOR: 'SALES_SUPERVISOR',
  PLATFORM_MANAGER: 'PLATFORM_MANAGER', ADMIN: 'ADMIN'
} as const)

export const CAPABILITY_LABELS: Record<Capability, string> = {
  MEMBER: '會員', SALES: '業務', SALES_SUPERVISOR: '業務主管',
  PLATFORM_MANAGER: '平台管理者', ADMIN: '最高管理者'
}

const LEGACY_ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  user: ['MEMBER'], sales: ['SALES'], manager: ['PLATFORM_MANAGER'], admin: ['ADMIN']
}

export const effectiveCapabilities = (user: { role: Role; capabilities?: Capability[] } | null | undefined) => {
  if (!user) return []
  const source = Array.isArray(user.capabilities) ? user.capabilities : LEGACY_ROLE_CAPABILITIES[user.role]
  const normalized = new Set(source)
  if (normalized.has('SALES_SUPERVISOR')) normalized.add('SALES')
  return Object.keys(CAPABILITY_LABELS).filter((item) => normalized.has(item as Capability)) as Capability[]
}

export const hasCapability = (user: { role: Role; capabilities?: Capability[] } | null | undefined,
  capability: Capability) => effectiveCapabilities(user).includes(capability)
export const hasAnyCapability = (user: { role: Role; capabilities?: Capability[] } | null | undefined,
  capabilities: Capability[]) => capabilities.some((item) => hasCapability(user, item))
export const canManageAccounts = (user: { role: Role; capabilities?: Capability[] } | null | undefined) =>
  hasCapability(user, 'ADMIN') || hasCapability(user, 'PLATFORM_MANAGER')
export const canManageOrganization = (user: { role: Role; capabilities?: Capability[] } | null | undefined) =>
  hasAnyCapability(user, ['ADMIN', 'SALES_SUPERVISOR', 'PLATFORM_MANAGER'])
