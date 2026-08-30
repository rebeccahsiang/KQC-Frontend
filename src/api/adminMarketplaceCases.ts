import api from './axios'
import type { ProductBusinessCategory, ProductTransactionType } from './adminProductImages'

export type MarketplacePriceType = 'FIXED' | 'RANGE' | 'MAX' | 'APPROXIMATE'
export type MarketplaceStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'RETURNED' | 'PUBLISHED' | 'UNPUBLISHED' | 'CLOSED'
export interface MarketplacePrice { priceType: MarketplacePriceType; priceAmount: number | null; priceMin: number | null; priceMax: number | null }
export interface MarketplaceCaseInput extends MarketplacePrice { businessCaseId: string; businessCategory: ProductBusinessCategory; transactionType: ProductTransactionType; title: string; targetArea: '北部地區' | '中部地區' | '南部地區' | '東部地區'; companyType: string; capitalAmount: number; coreNeed: string; isPriority: boolean }
export interface AdminMarketplaceCase extends MarketplaceCaseInput { id: string; caseId: string; marketplaceStatus: MarketplaceStatus; returnReason: string | null }
interface Envelope<T> { success: true; data: T }

// PRODUCT-CASE-B2-B — Marketplace Submission / canonical endpoints own persistence and workflow state.
export const adminMarketplaceCasesApi = {
  detail: (id: string) => api.get<Envelope<AdminMarketplaceCase>>(`/admin/cases/${encodeURIComponent(id)}`),
  create: (input: MarketplaceCaseInput) => api.post<Envelope<AdminMarketplaceCase>>('/admin/cases', input),
  update: (id: string, input: MarketplaceCaseInput) => api.put<Envelope<AdminMarketplaceCase>>(`/admin/cases/${encodeURIComponent(id)}`, input),
  submit: (id: string) => api.post<Envelope<AdminMarketplaceCase>>(`/admin/cases/${encodeURIComponent(id)}/submit`, {}),
}
