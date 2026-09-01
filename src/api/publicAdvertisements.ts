import api from './axios'

interface Envelope<T> { success: true; data: T }
export type PublicAdvertisementLayoutStyle = 'STANDARD' | 'OVERLAY_LEFT' | 'OVERLAY_CENTER'
export type PublicAdvertisementTypographyStyle = 'BRAND' | 'BOLD' | 'ELEGANT'
export type PublicAdvertisementTextTone = 'WHITE' | 'DARK' | 'BRAND_GOLD' | 'BRAND_BLUE' | 'BRAND_GREEN'

/* PRODUCT-ADVERTISEMENT-R3 — Public Advertisement DTO / public creative data is independent from admin and Marketplace Case contracts. */
export interface PublicAdvertisement {
  id: string
  title: string
  shortDescription: string
  imageUrl: string
  ctaLabel: string
  ctaDestination: string
  sortOrder: number
  layoutStyle: PublicAdvertisementLayoutStyle
  typographyStyle: PublicAdvertisementTypographyStyle
  textTone: PublicAdvertisementTextTone
}

export const publicAdvertisementImageUrl = (path: string) => {
  if (!path || /^https?:\/\//i.test(path)) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  return /^https?:\/\//i.test(apiBase) ? new URL(path, apiBase).toString() : path
}

/* PRODUCT-ADVERTISEMENT-R3 — Public Advertisement API / PUBLISHED creatives use a dedicated unauthenticated read client. */
export const publicAdvertisementsApi = { list: () => api.get<Envelope<PublicAdvertisement[]>>('/public/advertisements') }
