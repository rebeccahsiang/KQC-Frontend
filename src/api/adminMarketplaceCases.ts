import api from './axios'
import type { ProductBusinessCategory, ProductTransactionType } from './adminProductImages'

export type MarketplacePriceType = 'FIXED' | 'RANGE' | 'MAX' | 'APPROXIMATE'
export type MarketplaceStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'RETURNED' | 'PUBLISHED' | 'UNPUBLISHED' | 'CLOSED'
export interface MarketplacePrice { priceType: MarketplacePriceType; priceAmount: number | null; priceMin: number | null; priceMax: number | null }
export interface MarketplaceCaseInput extends MarketplacePrice { businessCaseId?: string | null; businessCategory: ProductBusinessCategory; transactionType: ProductTransactionType; title: string; targetArea: '北部地區' | '中部地區' | '南部地區' | '東部地區'; companyType: string; capitalAmount: number; coreNeed: string; isPriority: boolean }
export interface AdminMarketplaceCase extends MarketplaceCaseInput { id: string; caseId: string; marketplaceStatus: MarketplaceStatus; returnReason: string | null; createdBy: string; createdByName?: string | null; updatedBy?: string | null; requiredApproverCapability: 'SALES_SUPERVISOR' | 'ADMIN'; submittedAt?: string | null; submittedBy?: string | null; submittedByName?: string | null; returnedAt?: string | null; returnedBy?: string | null; approvedAt?: string | null; approvedBy?: string | null; publishedAt?: string | null; publishedBy?: string | null; createdAt?: string | null; updatedAt?: string | null }
interface Envelope<T> { success: true; data: T }
const envelope = <T>(request: unknown) => request as Promise<Envelope<T>>

// PRODUCT-CASE-B2-B — Marketplace Submission / canonical endpoints own persistence and workflow state.
export const adminMarketplaceCasesApi = {
  list: () => envelope<AdminMarketplaceCase[]>(api.get<Envelope<AdminMarketplaceCase[]>>('/admin/cases')),
  detail: (id: string) => envelope<AdminMarketplaceCase>(api.get<Envelope<AdminMarketplaceCase>>(`/admin/cases/${encodeURIComponent(id)}`)),
  create: (input: MarketplaceCaseInput) => envelope<AdminMarketplaceCase>(api.post<Envelope<AdminMarketplaceCase>>('/admin/cases', input)),
  update: (id: string, input: MarketplaceCaseInput) => envelope<AdminMarketplaceCase>(api.put<Envelope<AdminMarketplaceCase>>(`/admin/cases/${encodeURIComponent(id)}`, input)),
  submit: (id: string) => envelope<AdminMarketplaceCase>(api.post<Envelope<AdminMarketplaceCase>>(`/admin/cases/${encodeURIComponent(id)}/submit`, {})),
  returnForRevision: (id: string, reason: string) => envelope<AdminMarketplaceCase>(api.post<Envelope<AdminMarketplaceCase>>(`/admin/cases/${encodeURIComponent(id)}/return`, { reason })),
  approve: (id: string) => envelope<AdminMarketplaceCase>(api.post<Envelope<AdminMarketplaceCase>>(`/admin/cases/${encodeURIComponent(id)}/approve`, {})),
  unpublish: (id: string) => envelope<AdminMarketplaceCase>(api.post<Envelope<AdminMarketplaceCase>>(`/admin/cases/${encodeURIComponent(id)}/unpublish`, {})),
  republish: (id: string) => envelope<AdminMarketplaceCase>(api.post<Envelope<AdminMarketplaceCase>>(`/admin/cases/${encodeURIComponent(id)}/republish`, {})),
  close: (id: string) => envelope<AdminMarketplaceCase>(api.post<Envelope<AdminMarketplaceCase>>(`/admin/cases/${encodeURIComponent(id)}/close`, {})),
}
