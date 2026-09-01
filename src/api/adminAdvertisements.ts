import api from './axios'

interface Envelope<T> { success: true; data: T }

export const ADVERTISEMENT_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'RETURNED', 'PUBLISHED', 'UNPUBLISHED'] as const
export const ADVERTISEMENT_LAYOUT_STYLES = ['STANDARD', 'OVERLAY_LEFT', 'OVERLAY_CENTER'] as const
export const ADVERTISEMENT_TYPOGRAPHY_STYLES = ['BRAND', 'BOLD', 'ELEGANT'] as const
export const ADVERTISEMENT_TEXT_TONES = ['WHITE', 'DARK', 'BRAND_GOLD', 'BRAND_BLUE', 'BRAND_GREEN'] as const

export type AdvertisementStatus = typeof ADVERTISEMENT_STATUSES[number]
export type AdvertisementLayoutStyle = typeof ADVERTISEMENT_LAYOUT_STYLES[number]
export type AdvertisementTypographyStyle = typeof ADVERTISEMENT_TYPOGRAPHY_STYLES[number]
export type AdvertisementTextTone = typeof ADVERTISEMENT_TEXT_TONES[number]

export interface AdminAdvertisement {
  id: string
  title: string
  shortDescription: string
  productImageId: string
  ctaLabel: string
  ctaDestination: string
  sortOrder: number
  layoutStyle: AdvertisementLayoutStyle
  typographyStyle: AdvertisementTypographyStyle
  textTone: AdvertisementTextTone
  status: AdvertisementStatus
  createdBy: string
  requiredApproverCapability: 'ADMIN'
  returnReason: string | null
  createdAt: string
  updatedAt: string
}

export type AdvertisementContentInput = Pick<AdminAdvertisement,
  'title' | 'shortDescription' | 'productImageId' | 'ctaLabel' | 'ctaDestination' |
  'sortOrder' | 'layoutStyle' | 'typographyStyle' | 'textTone'>

/* PRODUCT-ADVERTISEMENT-R2B — Advertisement Admin API / lifecycle mutations remain Backend-authoritative. */
export const adminAdvertisementsApi = {
  list: () => api.get<Envelope<AdminAdvertisement[]>>('/v1/admin/advertisements'),
  detail: (id: string) => api.get<Envelope<AdminAdvertisement>>(`/v1/admin/advertisements/${encodeURIComponent(id)}`),
  create: (input: AdvertisementContentInput) => api.post<Envelope<AdminAdvertisement>>('/v1/admin/advertisements', input),
  update: (id: string, input: AdvertisementContentInput) => api.put<Envelope<AdminAdvertisement>>(`/v1/admin/advertisements/${encodeURIComponent(id)}`, input),
  submit: (id: string) => api.post<Envelope<AdminAdvertisement>>(`/v1/admin/advertisements/${encodeURIComponent(id)}/submit`),
  returnForRevision: (id: string, reason: string) => api.post<Envelope<AdminAdvertisement>>(`/v1/admin/advertisements/${encodeURIComponent(id)}/return`, { reason }),
  approve: (id: string) => api.post<Envelope<AdminAdvertisement>>(`/v1/admin/advertisements/${encodeURIComponent(id)}/approve`),
  unpublish: (id: string) => api.post<Envelope<AdminAdvertisement>>(`/v1/admin/advertisements/${encodeURIComponent(id)}/unpublish`),
  republish: (id: string) => api.post<Envelope<AdminAdvertisement>>(`/v1/admin/advertisements/${encodeURIComponent(id)}/republish`),
}
