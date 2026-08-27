import api from './axios'

interface Envelope<T> { success: true; data: T }

export type HumanConsultationServiceType = 'asset-trade' | 'website' | 'vehicle-quota' | 'parking-proof'
export type HumanConsultationStatus = 'PENDING_CONTACT' | 'CONTACTED'

export interface HumanConsultationAdminItem {
  id: string
  name: string
  phone: string
  serviceTypes: HumanConsultationServiceType[]
  source: 'PUBLIC_HUMAN_CONSULTATION'
  status: HumanConsultationStatus
  createdAt: string
}

export interface HumanConsultationListResponse {
  requests: HumanConsultationAdminItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const adminHumanConsultationsApi = {
  list: (page = 1, limit = 25) => api.get<Envelope<HumanConsultationListResponse>>(
    '/v1/admin/human-consultations', { params: { page, limit } },
  ),
  updateStatus: (id: string, status: HumanConsultationStatus) =>
    api.patch<Envelope<{ request: HumanConsultationAdminItem }>>(
      `/v1/admin/human-consultations/${encodeURIComponent(id)}/status`, { status },
    ),
}
