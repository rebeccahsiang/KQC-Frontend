import api from './axios'
import type { Capability } from '@/config/capabilities'

export type Role = 'user' | 'sales' | 'manager' | 'admin'
export type Portal = 'frontend' | 'admin'

export interface AuthUser {
  _id: string
  email: string
  name: string
  role: Role
  capabilities?: Capability[]
  accountStatus: 'pending' | 'active' | 'suspended' | 'disabled'
  emailVerifiedAt: string | null
  mustChangePassword: boolean
  staffIdentity: { displayName: string } | null
}

export interface AuthSession {
  id: string
  deviceName: string | null
  isCurrent: boolean
  lastActiveAt: string
  createdAt: string
}

export interface SessionListResult {
  sessions: AuthSession[]
}

export interface RevokeSessionResult {
  revoked: boolean
  isCurrent: boolean
}

interface Envelope<T> {
  success: true
  data: T
}

interface TokenResult {
  accessToken: string
  passwordChangeRequired: boolean
  user: AuthUser
}

export interface LoginInput {
  email: string
  password: string
  portal: Portal
}

export const authApi = {
  login: (input: LoginInput) =>
    api.post<Envelope<TokenResult>>('/v1/auth/login', input, { skipAuthRefresh: true }),
  refresh: (portal: Portal = 'frontend') =>
    api.post<Envelope<TokenResult>>('/v1/auth/refresh', { portal }, { skipAuthRefresh: true, authPortal: portal }),
  adminElevation: (password?: string) => api.post<Envelope<TokenResult>>(
    '/v1/auth/admin-elevation', password ? { password } : {}, { skipAuthRefresh: true, authPortal: 'frontend' }
  ),
  me: (portal: Portal = 'frontend') => api.get<Envelope<{ user: AuthUser }>>('/v1/auth/me', { authPortal: portal }),
  sessions: () => api.get<Envelope<SessionListResult>>('/v1/auth/sessions'),
  revokeSession: (sessionId: string) =>
    api.delete<Envelope<RevokeSessionResult>>(`/v1/auth/sessions/${encodeURIComponent(sessionId)}`),
  logout: (portal: Portal = 'frontend') => api.post<Envelope<{ loggedOut: boolean }>>('/v1/auth/logout', { portal }, {
    skipAuthRefresh: true, authPortal: portal
  }),
  logoutAll: () => api.post<Envelope<{ revokedCount: number }>>('/v1/auth/logout-all'),
  activity: (portal: Portal = 'frontend') => api.post<Envelope<{ activityRecorded: boolean }>>('/v1/auth/activity', undefined, { authPortal: portal }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<Envelope<TokenResult & { revokedOtherSessions: number }>>('/v1/auth/change-password', {
      currentPassword,
      newPassword
    }),
  register: (input: { email: string; password: string; name: string }) =>
    api.post<Envelope<{ user: AuthUser }>>('/v1/auth/register', input, { skipAuthRefresh: true }),
  resendVerification: (email: string) =>
    api.post<Envelope<{ accepted: boolean }>>('/v1/auth/resend-verification', { email }, {
      skipAuthRefresh: true
    }),
  verifyEmail: (token: string) =>
    api.post<Envelope<{ user: AuthUser }>>('/v1/auth/verify-email', { token }, {
      skipAuthRefresh: true
    }),
  acceptInvitation: (token: string, password: string) =>
    api.post<Envelope<{ user: AuthUser }>>('/v1/auth/accept-invitation', { token, password }, {
      skipAuthRefresh: true
    })
}
