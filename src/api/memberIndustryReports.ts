import api from './axios'

interface Envelope<T> { success: true; data: T }

export interface MemberIndustryReportCover {
  id: string
  path: string
  altText: string
}

export interface MemberIndustryReportListItem {
  id: string
  title: string
  slug: string
  summary: string
  coverImageId: string | null
  coverImage: MemberIndustryReportCover | null
  publishedAt: string | null
}

export interface MemberIndustryReportDetail extends MemberIndustryReportListItem {
  content: string
}

export interface MemberIndustryReportListResponse {
  reports: MemberIndustryReportListItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const memberIndustryReportImageUrl = (path: string): string => {
  if (!path || /^https?:\/\//i.test(path)) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  return /^https?:\/\//i.test(apiBase) ? new URL(path, apiBase).toString() : path
}

export const memberIndustryReportsApi = {
  list: () => api.get<Envelope<MemberIndustryReportListResponse>>('/v1/member/industry-reports', {
    params: { page: 1, limit: 100 }
  }),
  detail: (slug: string) => api.get<Envelope<{ report: MemberIndustryReportDetail }>>(
    `/v1/member/industry-reports/${encodeURIComponent(slug)}`
  )
}
