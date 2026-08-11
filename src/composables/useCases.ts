import { ref } from 'vue'
import axios from 'axios'
import apiClient from '@/api/axios'
import type { 
  CaseItem, 
  SupplyDemandStats, 
  AiMatchResponse 
} from '../types/case'

/**
 * 💡 三爵資訊 (KQC) 智慧案源與 AI 語意配對組合式邏輯層 (Composable)
 * 負責向後端 REST API 請求資料，並管理響應式狀態 (Cases, Stats, Loading, Error)
 */
export function useCases() {
  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return error.response?.data?.message || fallback
    }
    return fallback
  }

  // 響應式狀態 (Reactive States)
  const cases = ref<CaseItem[]>([])
  const stats = ref<SupplyDemandStats>({
    sellerCount: 0,
    buyerCount: 0,
    demandRatio: 50
  })
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  /**
   * 1. 撈取大眾櫥窗 / 管理員全量案件清單
   * @param isAdmin 是否開啟後台權限 (開啟時不隱藏 crmData 與下架案件)
   */
  const fetchCases = async (isAdmin: boolean = false): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get<{ success: boolean; data: CaseItem[] }>(
        `/cases${isAdmin ? '?isAdmin=true' : ''}`
      )
      cases.value = response.data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, '無法取得案源清單，請檢查後端連線')
      console.error('❌ [useCases] fetchCases Error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 2. 撈取供需晴雨窗看板數據 (即時百分比計算)
   */
  const fetchStats = async (): Promise<void> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: SupplyDemandStats }>('/cases/stats/supply-demand')
      stats.value = response.data
    } catch (err: unknown) {
      console.warn('⚠️ [useCases] 供需晴雨窗數據撈取失敗，啟動預設 50% 保底機制')
      stats.value = { sellerCount: 0, buyerCount: 0, demandRatio: 50 }
    }
  }

  /**
   * 3. 發送 Gemini 2.5 自然語言白話文配對
   * @param textInput 車行老闆輸入的口語需求
   */
  const matchWithAI = async (textInput: string): Promise<AiMatchResponse | null> => {
    if (!textInput.trim()) {
      error.value = '請輸入查詢需求'
      return null
    }

    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post<AiMatchResponse>('/ai/match', { textInput })
      
      // 自動將配對到的精準案件覆蓋至 cases 響應式狀態，UI 卡片會毫秒級自動更新！
      if (response.success) {
        cases.value = response.data
      }
      return response
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'AI 語意匹配服務暫時無法連線')
      console.error('❌ [useCases] matchWithAI Error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 4. 新增智慧案源 (用於後台表單)
   * @param newCaseData 欲建立的案源資料
   */
  const createCase = async (newCaseData: Partial<CaseItem>): Promise<CaseItem> => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post<{ success: boolean; data: CaseItem }>('/cases', newCaseData)
      await fetchCases(true) // 重新撈取最新後台資料
      return response.data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, '案源建立失敗，請檢查輸入格式')
      throw new Error(error.value || '建立失敗')
    } finally {
      loading.value = false
    }
  }

  return {
    cases,
    stats,
    loading,
    error,
    fetchCases,
    fetchStats,
    matchWithAI,
    createCase
  }
}
