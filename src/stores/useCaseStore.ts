import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { publicMarketplaceApi, type PublicMarketplaceCase } from '@/api/publicMarketplace'
import type { ProductTransactionType } from '@/api/adminProductImages'

export interface CaseFilterParams { transactionType?: ProductTransactionType | 'ALL'; targetArea?: string; searchQuery?: string }

/* PRODUCT-CASE-B4 — Public Marketplace Authority / Backend PUBLISHED data is the only runtime collection. */
export const useCaseStore = defineStore('useCaseStore', () => {
  const cases = ref<PublicMarketplaceCase[]>([])
  const currentCase = ref<PublicMarketplaceCase | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<CaseFilterParams>({ transactionType: 'ALL', targetArea: '', searchQuery: '' })

  /* PRODUCT-CASE-B4 — Marketplace Transaction Filter / BUY and SELL use canonical transactionType only. */
  const filteredCases = computed(() => cases.value.filter((item) => {
    const matchesTransaction = !filters.value.transactionType || filters.value.transactionType === 'ALL' || item.transactionType === filters.value.transactionType
    const matchesArea = !filters.value.targetArea || item.targetArea.includes(filters.value.targetArea)
    const query = filters.value.searchQuery?.trim().toLocaleLowerCase('zh-TW') || ''
    const matchesQuery = !query || [item.title, item.caseId, item.coreNeed].some((value) => value.toLocaleLowerCase('zh-TW').includes(query))
    return matchesTransaction && matchesArea && matchesQuery
  }))
  const activeCasesCount = computed(() => cases.value.length)

  /* PRODUCT-CASE-B4 — Marketplace Empty/Error State / [] stays empty and request failure never activates demo fallback. */
  async function fetchPublicCases() {
    isLoading.value = true; error.value = null
    try { cases.value = (await publicMarketplaceApi.list()).data }
    catch { cases.value = []; error.value = '商品案件暫時無法載入，請稍後再試。' }
    finally { isLoading.value = false }
  }
  async function fetchCaseById(id: string) {
    isLoading.value = true; error.value = null
    try { currentCase.value = (await publicMarketplaceApi.detail(id)).data; return currentCase.value }
    catch { currentCase.value = null; error.value = '商品案件暫時無法載入，請稍後再試。'; return null }
    finally { isLoading.value = false }
  }
  const setFilters = (value: Partial<CaseFilterParams>) => { filters.value = { ...filters.value, ...value } }
  const resetFilters = () => { filters.value = { transactionType: 'ALL', targetArea: '', searchQuery: '' } }
  return { cases, currentCase, isLoading, error, filters, filteredCases, activeCasesCount, fetchPublicCases, fetchCaseById, setFilters, resetFilters }
})
