<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Drawer from 'primevue/drawer'
import Message from 'primevue/message'
import Paginator from 'primevue/paginator'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { adminContactInquiriesApi, type ContactInquiryAdminDetail, type ContactInquiryAdminListItem, type ContactInquiryStatus } from '@/api/adminContactInquiries'
import { CONTACT_SERVICE_PILLARS, questionsForServices, type ContactServiceCode } from '@/config/contactServices'

const PAGE_SIZE = 25
const STATUS_OPTIONS: { value: ContactInquiryStatus; label: string }[] = [
  { value: 'PENDING', label: '待處理' }, { value: 'IN_PROGRESS', label: '處理中' },
  { value: 'COMPLETED', label: '已完成' }, { value: 'CLOSED', label: '已關閉' },
]
const serviceLabels = new Map(CONTACT_SERVICE_PILLARS.flatMap(({ services }) => services.map(({ code, label }) => [code, label])))
const statusLabel = (status: ContactInquiryStatus) => STATUS_OPTIONS.find(({ value }) => value === status)?.label || status
const statusSeverity = (status: ContactInquiryStatus) => ({ PENDING: 'warn', IN_PROGRESS: 'info', COMPLETED: 'success', CLOSED: 'secondary' }[status] as 'warn' | 'info' | 'success' | 'secondary')
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
const backendMessage = (error: unknown) => isAxiosError(error) ? (error.response?.data as { error?: { message?: string } })?.error?.message || '聯絡諮詢操作失敗。' : '聯絡諮詢操作失敗。'

const inquiries = ref<ContactInquiryAdminListItem[]>([])
const pagination = ref({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 })
const loading = ref(false)
const errorMessage = ref('')
const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<ContactInquiryAdminDetail | null>(null)
const updatingId = ref('')
const detailQuestions = computed(() => detail.value ? questionsForServices(detail.value.serviceTypes) : [])
const knownAnswerKeys = computed(() => new Set(detailQuestions.value.map(({ key }) => key)))
const additionalAnswers = computed(() => Object.entries(detail.value?.answers || {}).filter(([key]) => !knownAnswerKeys.value.has(key)))

// CONTACT-R1B-2 — Admin Contact Inquiry List / pagination and row refresh reconcile from Backend authority.
const loadInquiries = async (page = pagination.value.page) => {
  loading.value = true; errorMessage.value = ''
  try { const response = await adminContactInquiriesApi.list(page, PAGE_SIZE); inquiries.value = response.data.inquiries; pagination.value = response.data.pagination }
  catch (error) { errorMessage.value = backendMessage(error) }
  finally { loading.value = false }
}
const openDetail = async (item: ContactInquiryAdminListItem) => {
  detailVisible.value = true; detailLoading.value = true; detail.value = null; errorMessage.value = ''
  try { detail.value = (await adminContactInquiriesApi.detail(item.id)).data.inquiry }
  catch (error) { errorMessage.value = backendMessage(error); detailVisible.value = false }
  finally { detailLoading.value = false }
}
const updateStatus = async (item: ContactInquiryAdminListItem, status: ContactInquiryStatus) => {
  if (updatingId.value || item.status === status) return
  updatingId.value = item.id; errorMessage.value = ''
  try {
    const updated = (await adminContactInquiriesApi.updateStatus(item.id, status)).data.inquiry
    const index = inquiries.value.findIndex(({ id }) => id === item.id)
    if (index >= 0) inquiries.value[index] = { ...inquiries.value[index], status: updated.status, assignedTo: updated.assignedTo }
    if (detail.value?.id === item.id) detail.value = updated
  } catch (error) { errorMessage.value = backendMessage(error) }
  finally { updatingId.value = '' }
}
const serviceSummary = (types: ContactServiceCode[]) => ({ primary: serviceLabels.get(types[0]) || types[0], extra: Math.max(0, types.length - 1) })
onMounted(() => loadInquiries())
</script>

<template>
  <section class="contact-inquiries-admin">
    <header><div><p class="eyebrow">訊息管理</p><h1>聯絡我們諮詢</h1><p>檢視公開聯絡表單，並維護目前處理狀態。</p></div></header>
    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <DataTable :value="inquiries" :loading="loading" striped-rows empty-message="目前沒有聯絡諮詢。" responsive-layout="scroll">
      <Column header="送出時間"><template #body="{ data }">{{ formatDate(data.createdAt) }}</template></Column>
      <Column header="姓名／公司"><template #body="{ data }"><strong>{{ data.name }}</strong><small>{{ data.companyName || '未填公司' }}</small></template></Column>
      <Column header="服務需求"><template #body="{ data }"><span>{{ serviceSummary(data.serviceTypes).primary }}</span><small v-if="serviceSummary(data.serviceTypes).extra">+{{ serviceSummary(data.serviceTypes).extra }}</small></template></Column>
      <Column field="contactUrgency" header="急迫度"><template #body="{ data }">{{ data.contactUrgency || '—' }}</template></Column>
      <Column header="狀態"><template #body="{ data }"><Select :model-value="data.status" :options="STATUS_OPTIONS" option-label="label" option-value="value" aria-label="更新處理狀態" :disabled="Boolean(updatingId)" @update:model-value="updateStatus(data, $event)" /></template></Column>
      <Column header="負責人"><template #body="{ data }"><span>{{ data.assignedTo || '未指派' }}</span></template></Column>
      <Column header="操作"><template #body="{ data }"><div class="row-actions"><Button label="查看" icon="pi pi-eye" size="small" text aria-label="查看詳細資料" @click="openDetail(data)" /><Button label="指派" icon="pi pi-user-plus" severity="secondary" text disabled title="規劃中" aria-label="指派負責人（規劃中）" /></div></template></Column>
    </DataTable>
    <Paginator v-if="pagination.totalPages > 1" :first="(pagination.page - 1) * pagination.limit" :rows="pagination.limit" :total-records="pagination.total" @page="loadInquiries($event.page + 1)" />

    <Drawer v-model:visible="detailVisible" header="聯絡諮詢詳細資料" position="right" class="contact-inquiry-drawer">
      <div v-if="detailLoading" class="drawer-state">載入詳細資料中…</div>
      <article v-else-if="detail" class="detail-content">
        <section><h2>諮詢資料</h2><dl><div><dt>諮詢編號</dt><dd>{{ detail.inquiryNo }}</dd></div><div><dt>送出時間</dt><dd>{{ formatDate(detail.createdAt) }}</dd></div><div><dt>狀態</dt><dd><Tag :value="statusLabel(detail.status)" :severity="statusSeverity(detail.status)" /></dd></div></dl></section>
        <section><h2>聯絡人</h2><dl><div><dt>稱呼</dt><dd>{{ detail.profile.salutation }}</dd></div><div><dt>姓名</dt><dd>{{ detail.profile.name }}</dd></div><div><dt>公司名稱</dt><dd>{{ detail.profile.companyName || '—' }}</dd></div><div><dt>職稱</dt><dd>{{ detail.profile.jobTitle || '—' }}</dd></div></dl></section>
        <section><h2>聯絡方式</h2><dl><div><dt>手機</dt><dd><a :href="`tel:${detail.profile.mobile}`">{{ detail.profile.mobile }}</a></dd></div><div><dt>Email</dt><dd><a v-if="detail.profile.email" :href="`mailto:${detail.profile.email}`">{{ detail.profile.email }}</a><span v-else>—</span></dd></div><div><dt>LINE ID</dt><dd>{{ detail.profile.lineId || '—' }}</dd></div></dl></section>
        <section><h2>需求服務</h2><div class="service-tags"><Tag v-for="type in detail.serviceTypes" :key="type" :value="serviceLabels.get(type) || type" severity="info" /></div></section>
        <section><h2>需求內容</h2><dl><div v-for="question in detailQuestions" :key="question.key"><dt>{{ question.label }}</dt><dd>{{ detail.answers[question.key] || '—' }}</dd></div><div v-for="([key, value]) in additionalAnswers" :key="key"><dt>{{ key }}</dt><dd>{{ value || '—' }}</dd></div></dl></section>
        <section><h2>處理資訊</h2><dl><div><dt>指派人員</dt><dd>{{ detail.assignedTo || '尚未指派' }}</dd></div><div><dt>指派時間</dt><dd>{{ formatDate(detail.assignedAt) }}</dd></div><div><dt>隱私同意時間</dt><dd>{{ formatDate(detail.privacyAcceptedAt) }}</dd></div></dl><Button label="指派人員（規劃中）" icon="pi pi-user-plus" disabled title="人員指派將於後續版本開放" /></section>
      </article>
    </Drawer>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.contact-inquiries-admin { display: grid; gap: $kqc-spacing-lg; }
header h1 { margin: 0; color: var(--text-main); font-size: $kqc-type-section-title; }
header p:last-child { margin-bottom: 0; color: var(--text-secondary); }
.eyebrow { margin: 0 0 $kqc-spacing-xs; color: var(--accent-active); font-size: $kqc-type-label; font-weight: 700; }
strong, small { display: block; } small { margin-top: .25rem; color: var(--text-secondary); }
.row-actions { display: flex; align-items: center; gap: $kqc-spacing-xs; min-width: 19rem; }
.detail-content { display: grid; gap: $kqc-spacing-lg; min-width: min(28rem, 82vw); }
.detail-content section { padding-bottom: $kqc-spacing-md; border-bottom: 1px solid var(--border-grey); }
.detail-content h2 { margin: 0 0 $kqc-spacing-sm; font-size: 1rem; color: var(--text-main); }
dl { display: grid; gap: $kqc-spacing-sm; margin: 0; } dl div { display: grid; grid-template-columns: 7rem 1fr; gap: $kqc-spacing-sm; } dt { color: var(--text-secondary); } dd { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.service-tags { display: flex; flex-wrap: wrap; gap: $kqc-spacing-xs; }
.drawer-state { padding: $kqc-spacing-xl 0; color: var(--text-secondary); text-align: center; }
a { color: var(--accent-active); }
@media (max-width: 640px) { .row-actions { min-width: 16rem; } dl div { grid-template-columns: 1fr; gap: .2rem; } }
</style>
