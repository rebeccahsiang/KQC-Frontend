<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  industryStatisticsApi,
  type IndustryStatisticsStatus,
  type IndustryStatisticsSummary,
} from '@/api/industryStatistics'

const loading = ref(true)
const requestError = ref<string | null>(null)
const status = ref<IndustryStatisticsStatus | null>(null)
const refreshInFlight = ref(false)
const summary = ref<IndustryStatisticsSummary | null>(null)

const loadSummary = async () => {
  loading.value = true
  requestError.value = null

  try {
    const response = await industryStatisticsApi.getSummary()
    status.value = response.data.status
    refreshInFlight.value = response.data.refreshInFlight
    summary.value = response.data.summary
  } catch {
    status.value = null
    refreshInFlight.value = false
    summary.value = null
    requestError.value = '產業統計資料暫時無法取得，請稍後再試。'
  } finally {
    loading.value = false
  }
}

onMounted(loadSummary)
</script>

<template>
  <section class="industry-statistics-summary" aria-labelledby="industry-statistics-summary-title">
    <h2 id="industry-statistics-summary-title">產業統計資料</h2>

    <p v-if="loading" aria-live="polite">正在取得產業統計資料…</p>

    <p v-else-if="requestError" role="alert">{{ requestError }}</p>

    <p v-else-if="status === 'UNAVAILABLE'" aria-live="polite">目前沒有可用的產業統計資料。</p>

    <div v-else-if="summary" class="industry-statistics-summary__data">
      <p>資料期間：{{ summary.source.officialPeriod }}</p>
      <p>資料狀態：{{ status }}</p>
      <p>背景更新中：{{ refreshInFlight ? '是' : '否' }}</p>
      <p>分類數：{{ summary.categories.length }}</p>
      <ul>
        <li v-for="category in summary.categories" :key="category.categoryKey">
          {{ category.categoryLabel }}：{{ category.latest.companies }} 家／{{ category.latest.vehicles }} 輛
        </li>
      </ul>
    </div>
  </section>
</template>
