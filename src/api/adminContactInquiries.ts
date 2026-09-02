import api from './axios'
import type { ContactProfileData, ContactServiceCode } from '@/config/contactServices'

interface Envelope<T> { success: true; data: T }
export type ContactInquiryStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED'
export interface ContactInquiryAdminListItem {
  id: string; inquiryNo: string; serviceTypes: ContactServiceCode[]; name: string; companyName: string
  contactUrgency: string; status: ContactInquiryStatus; assignedTo: string | null; createdAt: string
}
export interface ContactInquiryAdminDetail {
  id: string; inquiryNo: string; source: 'PUBLIC_CONTACT'; status: ContactInquiryStatus
  serviceTypes: ContactServiceCode[]; profile: Omit<ContactProfileData, 'privacyAccepted'>
  answers: Record<string, string>; privacyAccepted: true; privacyAcceptedAt: string
  assignedTo: string | null; assignedAt: string | null; createdAt: string; updatedAt: string
}
export interface ContactInquiryListResponse {
  inquiries: ContactInquiryAdminListItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

// CONTACT-R1B-2 — Admin Contact Inquiry API / shared authenticated transport consumes bounded envelopes.
export const adminContactInquiriesApi = {
  list: (page = 1, limit = 25) => api.get<Envelope<ContactInquiryListResponse>>('/v1/admin/contact-inquiries', { params: { page, limit } }),
  detail: (id: string) => api.get<Envelope<{ inquiry: ContactInquiryAdminDetail }>>(`/v1/admin/contact-inquiries/${encodeURIComponent(id)}`),
  updateStatus: (id: string, status: ContactInquiryStatus) => api.patch<Envelope<{ inquiry: ContactInquiryAdminDetail }>>(`/v1/admin/contact-inquiries/${encodeURIComponent(id)}/status`, { status }),
}
