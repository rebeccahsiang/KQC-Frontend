// src/api/cases.ts
import apiClient from './axios'
import type { MarketplaceCase } from '@/types/case'

export interface GetCasesParams {
  case_type?: 'buyer_request' | 'seller_listing'
  target_area?: string
  status?: 'active' | 'completed'
}

/**
 * 前台公開櫥窗：獲取案件列表
 * 後端 API 已執行 .select('-crmData')，自動過濾保密個資
 */
export const getMarketplaceCases = (params?: GetCasesParams) => {
  return apiClient.get<MarketplaceCase[]>('/cases', { params })
}

/**
 * 後台高階管理員：建立買賣/待售案件 (包含 crmData)
 */
export const createCase = (caseData: Partial<MarketplaceCase>) => {
  return apiClient.post<MarketplaceCase>('/cases', caseData)
}

/**
 * 後台案件狀態更新 (active -> completed)
 */
export const updateCaseStatus = (id: string, status: 'active' | 'completed') => {
  return apiClient.patch<MarketplaceCase>(`/cases/${id}`, { status })
}