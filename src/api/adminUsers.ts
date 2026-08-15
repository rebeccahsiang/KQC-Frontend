import api from './axios'
import type { Role } from './auth'

export type AccountStatus = 'pending' | 'active' | 'suspended' | 'disabled'
export interface AdminUser { id: string; email: string; name: string; role: Role; accountStatus: AccountStatus; emailVerifiedAt: string | null; lastLoginAt: string | null; createdAt: string; updatedAt: string }
export interface AdminUserPagination { page: number; limit: number; total: number; totalPages: number }
export interface AdminUserListResponse { users: AdminUser[]; pagination: AdminUserPagination }
export interface AdminUserListQuery { page: number; limit: number; search?: string; role: Role; status?: AccountStatus }
interface Envelope<T> { success: true; data: T }

export const adminUsersApi = {
  list: (query: AdminUserListQuery) => api.get<Envelope<AdminUserListResponse>>('/v1/admin/users', { params: query })
}
