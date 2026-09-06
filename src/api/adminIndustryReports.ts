import api from './axios'

interface Envelope<T> { success: true; data: T }
export type IndustryReportStatus = 'DRAFT' | 'PUBLISHED'
export interface IndustryReportCover {
  id: string
  path: string
  altText: string
}
export interface IndustryReportAdminItem {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  coverImageId: string | null
  coverImage: IndustryReportCover | null
  status: IndustryReportStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}
export interface IndustryReportWriteInput {
  title: string
  summary: string
  content: string
  coverImageId: string | null
  status: IndustryReportStatus
}
export interface IndustryReportListResponse {
  reports: IndustryReportAdminItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const adminIndustryReportsApi = {
  list: (params: { page?: number; limit?: number; status?: IndustryReportStatus } = {}) =>
    api.get<Envelope<IndustryReportListResponse>>('/v1/admin/industry-reports', { params }),
  get: (id: string) => api.get<Envelope<{ report: IndustryReportAdminItem }>>(`/v1/admin/industry-reports/${encodeURIComponent(id)}`),
  create: (input: IndustryReportWriteInput) => api.post<Envelope<{ report: IndustryReportAdminItem }>>('/v1/admin/industry-reports', input),
  update: (id: string, input: Partial<IndustryReportWriteInput>) =>
    api.patch<Envelope<{ report: IndustryReportAdminItem }>>(`/v1/admin/industry-reports/${encodeURIComponent(id)}`, input),
  publish: (id: string) => api.post<Envelope<{ report: IndustryReportAdminItem }>>(`/v1/admin/industry-reports/${encodeURIComponent(id)}/publish`),
  unpublish: (id: string) => api.post<Envelope<{ report: IndustryReportAdminItem }>>(`/v1/admin/industry-reports/${encodeURIComponent(id)}/unpublish`),
  remove: (id: string) => api.delete<Envelope<{ deleted: true }>>(`/v1/admin/industry-reports/${encodeURIComponent(id)}`),
}
