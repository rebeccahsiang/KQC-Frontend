import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

// 1. 定義 B2B 案件與機密 CRM 資料型別
export interface CrmData {
  ownerName: string
  contactPhone: string
  negotiationStatus: string
  internalNotes?: string
}

export interface AdminCaseItem {
  _id: string
  caseNumber: string
  caseType: 'buyer_request' | 'seller_listing'
  title: string
  targetArea: string
  capitalAmount: number
  requirementCore: string
  status: 'active' | 'closed' | 'pending'
  crmData?: CrmData // 後端審核通過後才帶有的機密個資
  createdAt: string
  updatedAt: string
}

export const useAdminCaseStore = defineStore('adminCase', () => {
  // ----------------------------------------------------
  // State
  // ----------------------------------------------------
  const cases = ref<AdminCaseItem[]>([])
  const currentCase = ref<AdminCaseItem | null>(null)
  const isLoading = ref<boolean>(false)
  const errorMsg = ref<string>('')

  // ----------------------------------------------------
  // Getters
  // ----------------------------------------------------
  // 計算進行中的案件總數
  const activeCaseCount = computed<number>(() => {
    return cases.value.filter(c => c.status === 'active').length
  })

  // ----------------------------------------------------
  // Actions
  // ----------------------------------------------------
  /**
   * 拉取黑曜石戰情室完整案件列表（含機密 CRM 資料）
   */
  async function fetchAdminCases(): Promise<void> {
    isLoading.value = true
    errorMsg.value = ''
    try {
      // 呼叫後端 RESTful API: GET /api/admin/cases
      const response = await api.get<AdminCaseItem[]>('/admin/cases')
      cases.value = response.data
    } catch (err: any) {
      console.error('[AdminCaseStore fetchError]:', err)
      errorMsg.value = err.response?.data?.message || '無法取得管理員案件清單'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新案件狀態（如：切換為已結案）
   */
  async function updateCaseStatus(caseId: string, status: 'active' | 'closed' | 'pending'): Promise<boolean> {
    try {
      await api.patch(`/admin/cases/${caseId}`, { status })
      // 本地狀態即時更新，避免重新拉取整份清單
      const target = cases.value.find(c => c._id === caseId)
      if (target) {
        target.status = status
      }
      return true
    } catch (err: any) {
      console.error('[AdminCaseStore updateError]:', err)
      return false
    }
  }

  return {
    cases,
    currentCase,
    isLoading,
    errorMsg,
    activeCaseCount,
    fetchAdminCases,
    updateCaseStatus
  }
})