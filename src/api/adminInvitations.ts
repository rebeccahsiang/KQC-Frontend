import api from './axios'
import type { Capability } from '@/config/capabilities'
import type { AssignmentRole } from './adminOrganizations'

interface Envelope<T> { success: true; data: T }
export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'superseded' | 'expired'
export interface AdminInvitation { id: string; email: string; name: string; capabilities: Capability[]; organizationUnitId: string | null; assignmentRole: AssignmentRole | null; status: InvitationStatus; expiresAt: string; invitedAt: string; acceptedAt: string | null; revokedAt: string | null }
export interface InvitationListResponse { invitations: AdminInvitation[]; pagination: { page: number; limit: number; total: number; totalPages: number } }
export interface CreateInvitationInput { email: string; name: string; capabilities: Capability[]; organizationUnitId?: string; assignmentRole?: AssignmentRole }

export const adminInvitationsApi = {
  list: () => api.get<Envelope<InvitationListResponse>>('/v1/admin/invitations'),
  create: (input: CreateInvitationInput) => api.post<Envelope<{ invitation: AdminInvitation; mailDelivered: boolean }>>('/v1/admin/invitations', input),
  resend: (id: string) => api.post<Envelope<{ invitation: AdminInvitation; mailDelivered: boolean }>>(`/v1/admin/invitations/${encodeURIComponent(id)}/resend`),
  revoke: (id: string) => api.delete<Envelope<{ invitation: AdminInvitation }>>(`/v1/admin/invitations/${encodeURIComponent(id)}`)
}
