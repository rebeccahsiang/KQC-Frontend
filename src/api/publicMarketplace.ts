import api from './axios'
import type { ProductBusinessCategory, ProductTransactionType } from './adminProductImages'

interface Envelope<T> { success: true; data: T }
export type PublicMarketplacePriceType = 'FIXED' | 'RANGE' | 'MAX' | 'APPROXIMATE'
export interface PublicMarketplaceRepresentativeImage { id: string; name: string; altText: string; imageUrl: string; originalName: string; mimeType: string; fileSize: number }

/* PRODUCT-CASE-B4 — Canonical Public DTO / frontend mirrors only the Backend public Marketplace allowlist. */
export interface PublicMarketplaceCase {
  caseId: string; businessCategory: ProductBusinessCategory; transactionType: ProductTransactionType
  title: string; targetArea: '北部地區' | '中部地區' | '南部地區' | '東部地區'; companyType: string; capitalAmount: number
  priceType: PublicMarketplacePriceType; priceAmount: number | null; priceMin: number | null; priceMax: number | null
  isPriority: boolean; coreNeed: string; publishedAt: string | null; representativeImage: PublicMarketplaceRepresentativeImage | null
}

export const publicMarketplaceImageUrl = (path: string) => {
  if (!path || /^https?:\/\//i.test(path)) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  return /^https?:\/\//i.test(apiBase) ? new URL(path, apiBase).toString() : path
}

/* PRODUCT-CASE-B4 — Public Marketplace Authority / public pages never call admin or legacy Case APIs. */
export const publicMarketplaceApi = {
  list: () => api.get<Envelope<PublicMarketplaceCase[]>>('/cases'),
  detail: (id: string) => api.get<Envelope<PublicMarketplaceCase>>(`/cases/${encodeURIComponent(id)}`),
}
