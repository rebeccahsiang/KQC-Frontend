<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute } from 'vue-router'
import { isAxiosError } from 'axios'
import {
  memberIndustryReportImageUrl,
  memberIndustryReportsApi,
  type MemberIndustryReportDetail
} from '@/api/memberIndustryReports'

const route = useRoute()
const report = ref<MemberIndustryReportDetail | null>(null)
const loading = ref(true)
const loadError = ref(false)
const notFound = ref(false)
const slug = computed(() => String(route.params.slug || ''))

const formatPublishedAt = (value: string | null): string => {
  if (!value) return '尚未提供日期'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '尚未提供日期'
  return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

const loadReport = async (): Promise<void> => {
  loading.value = true
  loadError.value = false
  notFound.value = false
  report.value = null
  try {
    report.value = (await memberIndustryReportsApi.detail(slug.value)).data.report
  } catch (error: unknown) {
    notFound.value = isAxiosError(error) && error.response?.status === 404
    loadError.value = !notFound.value
  } finally {
    loading.value = false
  }
}

watch(slug, loadReport, { immediate: true })
</script>

<template>
  <main id="main-content" class="member-report-detail">
    <div class="member-report-detail__shell">
      <RouterLink :to="{ name: 'MemberIndustryReports' }" class="member-report-detail__back">
        <Icon icon="lucide:arrow-left" aria-hidden="true" /> 返回報告列表
      </RouterLink>

      <div v-if="loading" class="member-report-detail__state" role="status" aria-live="polite">
        <Icon icon="lucide:loader-circle" class="is-spinning" aria-hidden="true" />
        <p>正在載入報告…</p>
      </div>

      <div v-else-if="notFound" class="member-report-detail__state" role="alert">
        <Icon icon="lucide:file-question" aria-hidden="true" />
        <h1>找不到這份報告</h1>
        <p>報告可能尚未發布、已下架或網址不存在。</p>
      </div>

      <div v-else-if="loadError" class="member-report-detail__state" role="alert">
        <Icon icon="lucide:circle-alert" aria-hidden="true" />
        <h1>暫時無法載入報告</h1>
        <p>請稍後再試。</p>
        <button type="button" @click="loadReport">重新載入</button>
      </div>

      <article v-else-if="report" class="member-report-article">
        <div class="member-report-article__cover">
          <img
            v-if="report.coverImage"
            :src="memberIndustryReportImageUrl(report.coverImage.path)"
            :alt="report.coverImage.altText || report.title"
          >
          <Icon v-else icon="lucide:image" aria-label="無封面圖片" />
        </div>
        <header>
          <time :datetime="report.publishedAt || undefined">{{ formatPublishedAt(report.publishedAt) }}</time>
          <h1>{{ report.title }}</h1>
          <p>{{ report.summary }}</p>
        </header>
        <div class="member-report-article__content">{{ report.content }}</div>
      </article>
    </div>
  </main>
</template>

<style scoped lang="scss">
.member-report-detail { min-height: 70vh; padding: 2.5rem 1rem 5rem; color: #172b43; background: #f4f7fa; }
.member-report-detail__shell { width: min(58rem, 100%); margin: 0 auto; }
.member-report-detail__back { display: inline-flex; margin-bottom: 1.5rem; align-items: center; gap: .45rem; color: #765817; font-weight: 750; text-decoration: none; }
.member-report-detail__back svg { width: 1rem; height: 1rem; }
.member-report-article { overflow: hidden; border: 1px solid #dce4eb; border-radius: 1rem; background: #fff; box-shadow: 0 14px 38px rgba(23,43,67,.09); }
.member-report-article__cover { display: grid; aspect-ratio: 16 / 9; place-items: center; overflow: hidden; color: #7c8998; background: #e8eef3; }
.member-report-article__cover img { width: 100%; height: 100%; object-fit: contain; background: #eef2f5; }
.member-report-article__cover > svg { width: 3rem; height: 3rem; }
.member-report-article header { padding: clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 5vw, 4rem) 1.5rem; }
.member-report-article time { color: #7a8795; font-size: .85rem; }
.member-report-article h1 { margin: .7rem 0 1rem; font-size: clamp(2rem, 4vw, 3rem); line-height: 1.25; }
.member-report-article header p { margin: 0; color: #5f6f82; font-size: 1.05rem; line-height: 1.8; }
.member-report-article__content { padding: 0 clamp(1.25rem, 5vw, 4rem) clamp(2rem, 6vw, 4.5rem); color: #26384d; font-size: 1rem; line-height: 1.95; white-space: pre-wrap; overflow-wrap: anywhere; }
.member-report-detail__state { display: grid; min-height: 22rem; place-items: center; align-content: center; gap: .7rem; border: 1px solid #dce4eb; border-radius: 1rem; background: #fff; text-align: center; }
.member-report-detail__state > svg { width: 2.4rem; height: 2.4rem; color: #97701c; }
.member-report-detail__state h1, .member-report-detail__state p { margin: 0; }
.member-report-detail__state p { color: #687789; }
.member-report-detail__state button { margin-top: .5rem; padding: .65rem 1rem; border: 0; border-radius: .5rem; color: #fff; background: #172b43; font: inherit; font-weight: 750; cursor: pointer; }
.is-spinning { animation: member-report-spin 1s linear infinite; }
@keyframes member-report-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .is-spinning { animation: none; } }
</style>
