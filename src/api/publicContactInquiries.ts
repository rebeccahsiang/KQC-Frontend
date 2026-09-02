import api from './axios'
import type { ContactProfileData, ContactServiceCode } from '@/config/contactServices'

export interface PublicContactInquiryPayload {
  serviceTypes: ContactServiceCode[]
  profile: Omit<ContactProfileData, 'privacyAccepted'>
  privacyAccepted: true
  answers: Record<string, string>
}
export interface PublicContactInquiryCreated { id: string; inquiryNo: string; status: 'PENDING'; createdAt: string }
interface Envelope<T> { success: true; data: T }

// CONTACT-R1B-1 — Public Contact API / transport owns no lifecycle, assignment, timestamp, or CRM fields.
export const publicContactInquiriesApi = {
  async create(payload: PublicContactInquiryPayload) {
    const response = await api.post<Envelope<{ inquiry: PublicContactInquiryCreated }>>('/public/contact-inquiries', payload)
    return response.data.inquiry
  }
}
