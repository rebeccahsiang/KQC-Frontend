import axios, { type AxiosResponse } from 'axios'

// ============================================================
// Human Consultation — Public Submission Client
// WEB-1F-C2B
// Keeps public callback requests outside authenticated Admin API handling.
// ============================================================
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
})

export type HumanConsultationServiceType = 'asset-trade' | 'website' | 'vehicle-quota' | 'parking-proof'
export interface HumanConsultationRequest {
  name: string
  phone: string
  serviceTypes: HumanConsultationServiceType[]
}
export interface HumanConsultationCreated {
  id: string
  status: 'PENDING_CONTACT'
  createdAt: string
}
interface Envelope<T> { success: true; data: T }
type HumanConsultationCreateResponse = Envelope<HumanConsultationCreated>

export const createHumanConsultationRequest = async (payload: HumanConsultationRequest) => {
  // Human Consultation / WEB-1F-C2B: this client has no response-unwrapping interceptor.
  const response = await publicApi.post<AxiosResponse<HumanConsultationCreateResponse>>(
    '/public/human-consultations',
    { name: payload.name, phone: payload.phone, serviceTypes: payload.serviceTypes },
  )
  return response.data.data
}
