<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import {
  memberIndustryReportImageUrl,
  memberIndustryReportsApi,
  type MemberIndustryReportListItem
} from '@/api/memberIndustryReports'

const reports = ref<MemberIndustryReportListItem[]>([])
const loading = ref(true)
const loadError = ref(false)

const formatPublishedAt = (value: string | null): string => {
  if (!value) return '尚未提供日期'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '尚未提供日期'
  return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

const loadReports = async (): Promise<void> => {
  loading.value = true
  loadError.value = false
  try {
    reports.value = (await memberIndustryReportsApi.list()).data.reports
  } catch {
    reports.value = []
    loadError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadReports)
</script>

<template>
  <main id="main-content" class="member-reports-page">
    <header class="member-reports-hero">
      <p class="member-reports-hero__eyebrow">MEMBER EXCLUSIVE</p>
      <h1>KQC 定期產業分析報告</h1>
      <p>會員登入後可閱讀 KQC 定期發布的產業分析內容</p>
    </header>

    <section class="member-reports-content" aria-label="產業分析報告列表">
      <div v-if="loading" class="member-reports-state" role="status" aria-live="polite">
        <Icon icon="lucide:loader-circle" class="is-spinning" aria-hidden="true" />
        <p>正在載入產業分析報告…</p>
      </div>

      <div v-else-if="loadError" class="member-reports-state member-reports-state--error" role="alert">
        <Icon icon="lucide:circle-alert" aria-hidden="true" />
        <h2>暫時無法載入報告</h2>
        <p>請稍後再試。</p>
        <button type="button" @click="loadReports">重新載入</button>
      </div>

      <div v-else-if="reports.length === 0" class="member-reports-state">
        <Icon icon="lucide:notebook-text" aria-hidden="true" />
        <h2>目前尚無已發布報告</h2>
        <p>KQC 發布新內容後，將會顯示於此。</p>
      </div>

      <div v-else class="member-report-grid">
        <RouterLink
          v-for="report in reports"
          :key="report.id"
          :to="{ name: 'MemberIndustryReportDetail', params: { slug: report.slug } }"
          class="member-report-card"
        >
          <div class="member-report-card__cover">
            <img
              v-if="report.coverImage"
              :src="memberIndustryReportImageUrl(report.coverImage.path)"
              :alt="report.coverImage.altText || report.title"
            >
            <Icon v-else icon="lucide:image" aria-label="無封面圖片" />
          </div>
          <div class="member-report-card__body">
            <time :datetime="report.publishedAt || undefined">{{ formatPublishedAt(report.publishedAt) }}</time>
            <h2>{{ report.title }}</h2>
            <p>{{ report.summary }}</p>
            <span>閱讀報告 <Icon icon="lucide:arrow-right" aria-hidden="true" /></span>
          </div>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.member-reports-page { min-height: 70vh; color: #172b43; background: #f4f7fa; }
.member-reports-hero { padding: clamp(3rem, 7vw, 5.5rem) 1.5rem; text-align: center; background: linear-gradient(120deg, #eef5f9, #fff8e7); }
.member-reports-hero__eyebrow { margin: 0 0 .75rem; color: #97701c; font-size: .75rem; font-weight: 850; letter-spacing: .14em; }
.member-reports-hero h1 { margin: 0; color: #172b43; font-size: clamp(2rem, 4vw, 3.25rem); }
.member-reports-hero > p:last-child { max-width: 42rem; margin: 1rem auto 0; color: #5f6f82; line-height: 1.8; }
.member-reports-content { width: min(76rem, calc(100% - 2rem)); margin: 0 auto; padding: 3rem 0 5rem; }
.member-report-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; }
.member-report-card { overflow: hidden; border: 1px solid #dce4eb; border-radius: .9rem; color: inherit; background: #fff; box-shadow: 0 10px 28px rgba(23,43,67,.08); text-decoration: none; transition: transform .2s ease, box-shadow .2s ease; }
.member-report-card:hover { transform: translateY(-3px); box-shadow: 0 16px 34px rgba(23,43,67,.13); }
.member-report-card:focus-visible { outline: 3px solid rgba(151,112,28,.38); outline-offset: 3px; }
.member-report-card__cover { display: grid; aspect-ratio: 16 / 9; place-items: center; overflow: hidden; color: #7c8998; background: #e8eef3; }
.member-report-card__cover img { width: 100%; height: 100%; object-fit: cover; }
.member-report-card__cover > svg { width: 2.25rem; height: 2.25rem; }
.member-report-card__body { display: grid; padding: 1.25rem; gap: .7rem; }
.member-report-card time { color: #7a8795; font-size: .78rem; }
.member-report-card h2 { margin: 0; font-size: 1.2rem; line-height: 1.45; }
.member-report-card p { display: -webkit-box; margin: 0; overflow: hidden; color: #5f6f82; line-height: 1.7; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.member-report-card span { display: inline-flex; align-items: center; gap: .35rem; color: #876315; font-size: .85rem; font-weight: 800; }
.member-report-card span svg { width: 1rem; height: 1rem; }
.member-reports-state { display: grid; min-height: 18rem; place-items: center; align-content: center; gap: .65rem; border: 1px solid #dce4eb; border-radius: .9rem; color: #687789; background: #fff; text-align: center; }
.member-reports-state > svg { width: 2rem; height: 2rem; color: #97701c; }
.member-reports-state h2, .member-reports-state p { margin: 0; }
.member-reports-state button { margin-top: .5rem; padding: .65rem 1rem; border: 0; border-radius: .5rem; color: #fff; background: #172b43; font: inherit; font-weight: 750; cursor: pointer; }
.is-spinning { animation: member-report-spin 1s linear infinite; }
@keyframes member-report-spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) { .member-report-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .member-report-grid { grid-template-columns: 1fr; }.member-reports-content { padding-top: 2rem; } }
@media (prefers-reduced-motion: reduce) { .member-report-card { transition: none; }.is-spinning { animation: none; } }
</style>
