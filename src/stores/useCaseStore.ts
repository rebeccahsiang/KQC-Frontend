import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// ==========================================
// 1. TypeScript 型態定義 (嚴格對齊 MongoDB Schema)
// ==========================================
export type CaseType = 'buyer_request' | 'seller_listing'
export type CaseStatus = 'active' | 'completed'

export interface CaseDetails {
  target_area: string
  capital_amount: number
  requirement_core: string
}

export interface MarketplaceCase {
  _id: string
  case_number: string
  case_type: CaseType
  title: string
  details: CaseDetails
  status: CaseStatus
  image_url?: string
}

export interface CaseFilterParams {
  case_type?: CaseType | 'all'
  target_area?: string
  searchQuery?: string
}

// 預設 Demo 測試案件 (確保在 API 未連線或回傳空值時，前端展示依然亮眼)
const INITIAL_DEMO_CASES: MarketplaceCase[] = [
  {
    _id: '65f8a1b2c3d4e5f6a7b8c9d1',
    case_number: 'KQC-SFT260814',
    case_type: 'buyer_request',
    title: '隊長創業：貨櫃貨運專利牌照讓渡',
    details: {
      target_area: '南部地區',
      capital_amount: 6000000,
      requirement_core: '急買，尋求南部優質貨櫃貨運業者，洽談 100% 股權讓渡。',
    },
    status: 'active',
  },
  {
    _id: '65f8a1b2c3d4e5f6a7b8c9d2',
    case_number: 'KQC-BCA260722',
    case_type: 'buyer_request',
    title: '誠意收購：甲種小客車',
    details: {
      target_area: '北部地區',
      capital_amount: 5000000,
      requirement_core: '頂尖擴張，需北部甲種小客車牌照與車位證明，資金已到位。',
    },
    status: 'active',
  },
  {
    _id: '65f8a1b2c3d4e5f6a7b8c9d3',
    case_number: 'KQC-SMV260725',
    case_type: 'seller_listing',
    title: '老牌搬家公司滿場退場讓渡',
    details: {
      target_area: '北部地區',
      capital_amount: 10000000,
      requirement_core: '當老闆，老牌物流與搬家公司經營權轉讓，含優質車隊。',
    },
    status: 'active',
  },
]

// ==========================================
// 2. Pinia Store 定義 (Composition API Setup 風格)
// ==========================================
export const useCaseStore = defineStore('useCaseStore', () => {
  // ------------------------------------------
  // State 狀態管理
  // ------------------------------------------
  const cases = ref<MarketplaceCase[]>(INITIAL_DEMO_CASES)
  const currentCase = ref<MarketplaceCase | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // 前台條件篩選器狀態
  const filters = ref<CaseFilterParams>({
    case_type: 'all',
    target_area: '',
    searchQuery: '',
  })

  // ------------------------------------------
  // Getters (計算屬性：實現毫秒級無跳頁過濾)
  // ------------------------------------------
  const filteredCases = computed(() => {
    return cases.value.filter((item) => {
      // 1. 案件類型過濾 (買家委託 / 精選待售)
      const matchType =
        filters.value.case_type === 'all' || !filters.value.case_type
          ? true
          : item.case_type === filters.value.case_type

      // 2. 目標區域過濾
      const matchArea = filters.value.target_area
        ? item.details?.target_area?.includes(filters.value.target_area)
        : true

      // 3. 關鍵字搜尋 (標題、需求內文或案件編號)
      const matchQuery = filters.value.searchQuery
        ? item.title?.toLowerCase().includes(filters.value.searchQuery.toLowerCase()) ||
          item.case_number?.toLowerCase().includes(filters.value.searchQuery.toLowerCase()) ||
          item.details?.requirement_core?.toLowerCase().includes(filters.value.searchQuery.toLowerCase())
        : true

      return matchType && matchArea && matchQuery
    })
  })

  const activeCasesCount = computed(() => {
    return cases.value.filter((c) => c.status === 'active').length
  })

  // ------------------------------------------
  // Actions 異步業務邏輯
  // ------------------------------------------
  async function fetchPublicCases() {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.get<MarketplaceCase[]>('/api/cases')
      const fetchedData = Array.isArray(response) ? response : (response as any)?.data
      
      if (Array.isArray(fetchedData) && fetchedData.length > 0) {
        cases.value = fetchedData
      }
    } catch (err: any) {
      console.warn('[useCaseStore]: 後端 API 未連線或未建置，啟用靜態展示資料。')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCaseById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.get<MarketplaceCase>(`/api/cases/${id}`)
      const caseData = (response as any).data || response
      currentCase.value = caseData
      return caseData
    } catch (err: any) {
      error.value = err.response?.data?.message || '無法取得該案件詳細內容。'
      console.error('[useCaseStore fetchCaseById Error]:', err)
    } finally {
      isLoading.value = false
    }
  }

  function setFilters(newFilters: Partial<CaseFilterParams>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function resetFilters() {
    filters.value = {
      case_type: 'all',
      target_area: '',
      searchQuery: '',
    }
  }

  return {
    cases,
    currentCase,
    isLoading,
    error,
    filters,
    filteredCases,
    activeCasesCount,
    fetchPublicCases,
    fetchCaseById,
    setFilters,
    resetFilters,
  }
})