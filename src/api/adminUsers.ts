import api from './axios'
import type { Role } from './auth'
import type { Capability } from '@/config/capabilities'
import type { OrganizationAssignment } from './adminOrganizations'

export type AccountStatus = 'pending' | 'active' | 'suspended' | 'disabled'
export interface AdminUser { id: string; email: string; name: string; role: Role; capabilities: Capability[]; accountStatus: AccountStatus; emailVerifiedAt: string | null; lastLoginAt: string | null; createdAt: string; updatedAt: string }
export interface AdminUserPagination { page: number; limit: number; total: number; totalPages: number }
export interface AdminUserListResponse { users: AdminUser[]; pagination: AdminUserPagination }
export interface AdminUserDetailResponse { user: AdminUser }
export interface AdminUserListQuery { page: number; limit: number; search?: string; capability: Capability; status?: AccountStatus }
export interface AdminUserAssignmentsResponse { user: Pick<AdminUser, 'id' | 'name' | 'email' | 'capabilities' | 'accountStatus'>; assignments: OrganizationAssignment[] }
export type StaffFunctionCapability = Extract<Capability, 'SALES' | 'SALES_SUPERVISOR' | 'PLATFORM_MANAGER'>
export interface AddStaffFunctionResponse { staffFunction: { userId: string; capability: StaffFunctionCapability }; assignment: OrganizationAssignment }
export interface RemoveStaffFunctionResponse { removed: true; userId: string; capability: StaffFunctionCapability }
interface Envelope<T> { success: true; data: T }

export const adminUsersApi = {
  list: (query: AdminUserListQuery) => api.get<Envelope<AdminUserListResponse>>('/v1/admin/users', { params: query }),
  get: (userId: string) => api.get<Envelope<AdminUserDetailResponse>>(`/v1/admin/users/${encodeURIComponent(userId)}`),
  assignments: (userId: string) => api.get<Envelope<AdminUserAssignmentsResponse>>(`/v1/admin/users/${encodeURIComponent(userId)}/organization-assignments`),
  changeCapabilities: (userId: string, capabilities: Capability[]) =>
    api.patch<Envelope<AdminUserDetailResponse>>(`/v1/admin/users/${encodeURIComponent(userId)}/capabilities`, { capabilities }),
  addStaffFunction: (userId: string, input: { capability: StaffFunctionCapability; organizationUnitId: string }) =>
    api.post<Envelope<AddStaffFunctionResponse>>(`/v1/admin/users/${encodeURIComponent(userId)}/staff-functions`, input),
  removeStaffFunction: (userId: string, capability: StaffFunctionCapability) =>
    api.delete<Envelope<RemoveStaffFunctionResponse>>(`/v1/admin/users/${encodeURIComponent(userId)}/staff-functions/${encodeURIComponent(capability)}`)
}
