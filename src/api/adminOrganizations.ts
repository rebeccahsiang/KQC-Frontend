import api from './axios'
import type { AccountStatus } from './adminUsers'
import type { Capability } from '@/config/capabilities'

interface Envelope<T> { success: true; data: T }
export type OrganizationDomain = 'sales' | 'platform'
export type OrganizationStatus = 'active' | 'disabled'
export type AssignmentRole = 'member' | 'supervisor'
export interface OrganizationUnit { id: string; name: string; parentId: string | null; domain: OrganizationDomain; status: OrganizationStatus }
export interface AssignmentUser { id: string; name: string; email: string; capabilities: Capability[]; accountStatus: AccountStatus }
export interface OrganizationAssignment { id: string; userId: string; organizationUnitId: string; domain: OrganizationDomain; assignmentRole: AssignmentRole; isPrimary: boolean; user?: AssignmentUser; organization?: OrganizationUnit }
export interface OrganizationAssignmentsResponse { organization: OrganizationUnit; assignments: OrganizationAssignment[] }
export interface AssignmentCandidate { id: string; name: string; email: string; capabilities: Capability[]; accountStatus: AccountStatus }
export interface AssignmentCandidateQuery { assignmentRole: AssignmentRole; search?: string; page: number; limit: number }
export interface AssignmentCandidateResponse { candidates: AssignmentCandidate[]; pagination: { page: number; limit: number; total: number; totalPages: number } }

export const adminOrganizationsApi = {
  list: () => api.get<Envelope<{ organizations: OrganizationUnit[] }>>('/v1/admin/organizations'),
  assignments: (id: string) => api.get<Envelope<OrganizationAssignmentsResponse>>(`/v1/admin/organizations/${encodeURIComponent(id)}/assignments`),
  assignmentCandidates: (id: string, query: AssignmentCandidateQuery) =>
    api.get<Envelope<AssignmentCandidateResponse>>(`/v1/admin/organizations/${encodeURIComponent(id)}/assignment-candidates`, { params: query }),
  create: (input: { name: string; domain: OrganizationDomain; parentId?: string }) => api.post<Envelope<{ organization: OrganizationUnit }>>('/v1/admin/organizations', input),
  update: (id: string, input: { name?: string; status?: OrganizationStatus }) => api.patch<Envelope<{ organization: OrganizationUnit }>>(`/v1/admin/organizations/${encodeURIComponent(id)}`, input),
  assign: (id: string, input: { userId: string; assignmentRole: AssignmentRole }) => api.post<Envelope<{ assignment: OrganizationAssignment }>>(`/v1/admin/organizations/${encodeURIComponent(id)}/assignments`, input),
  // 部門職務角色是既有 assignment 的獨立治理資料；此 API 不攜帶 capability 或 Primary 變更。
  changeAssignmentRole: (organizationId: string, assignmentId: string, assignmentRole: AssignmentRole) =>
    api.patch<Envelope<{ assignment: OrganizationAssignment }>>(
      `/v1/admin/organizations/${encodeURIComponent(organizationId)}/assignments/${encodeURIComponent(assignmentId)}/role`,
      { assignmentRole }
    ),
  remove: (id: string, userId: string) => api.delete<Envelope<{ removed: true }>>(`/v1/admin/organizations/${encodeURIComponent(id)}/assignments/${encodeURIComponent(userId)}`),
  move: (id: string, input: { userId: string; destinationOrganizationUnitId: string }) => api.post<Envelope<{ assignment: OrganizationAssignment }>>(`/v1/admin/organizations/${encodeURIComponent(id)}/moves`, input)
}
