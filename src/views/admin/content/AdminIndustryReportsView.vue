<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { adminArticleImagesApi, articleImageUrl, type ArticleImageItem } from '@/api/adminArticleImages'
import {
  adminIndustryReportsApi,
  type IndustryReportAdminItem,
  type IndustryReportStatus,
  type IndustryReportWriteInput,
} from '@/api/adminIndustryReports'

const reports = ref<IndustryReportAdminItem[]>([])
const loading = ref(false)
const saving = ref(false)
const mutatingId = ref('')
const errorMessage = ref('')
const feedbackMessage = ref('')
const dialogVisible = ref(false)
const editingId = ref('')
const coverPickerVisible = ref(false)
const coverPickerLoading = ref(false)
const coverPickerError = ref('')
const coverImages = ref<ArticleImageItem[]>([])
const selectedCover = ref<ArticleImageItem | null>(null)
let coverPickerEpoch = 0

const form = reactive({ title: '', slug: '', summary: '', content: '', coverImageId: null as string | null, status: 'DRAFT' as IndustryReportStatus, publishedAt: null as string | null })
const coverPreview = computed(() => selectedCover.value
  ? { path: selectedCover.value.path, altText: selectedCover.value.altText, name: selectedCover.value.name }
  : null)

const backendMessage = (error: unknown, fallback = '產業分析報告操作失敗') => {
  if (!isAxiosError(error)) return fallback
  const responseError = (error.response?.data as { error?: { code?: string; message?: string } })?.error
  if (responseError?.message === 'Cover image is required for publication') return '發布前請先選擇封面圖片。'
  if (responseError?.code === 'INDUSTRY_REPORT_PUBLISHED') return '已發布報告必須先下架才能刪除。'
  return responseError?.message || fallback
}
const resetMessages = () => { errorMessage.value = ''; feedbackMessage.value = '' }
const resetForm = () => {
  Object.assign(form, { title: '', slug: '', summary: '', content: '', coverImageId: null, status: 'DRAFT', publishedAt: null })
  editingId.value = ''; selectedCover.value = null; coverPickerVisible.value = false; coverPickerError.value = ''; coverPickerEpoch += 1
}
const loadReports = async () => {
  loading.value = true; errorMessage.value = ''
  try { reports.value = (await adminIndustryReportsApi.list({ page: 1, limit: 100 })).data.reports }
  catch (error) { errorMessage.value = backendMessage(error, '產業分析報告載入失敗') }
  finally { loading.value = false }
}
const openCreate = () => { resetMessages(); resetForm(); dialogVisible.value = true }
const openEdit = async (report: IndustryReportAdminItem) => {
  resetMessages(); editingId.value = report.id; selectedCover.value = null; errorMessage.value = ''
  try {
    const item = (await adminIndustryReportsApi.get(report.id)).data.report
    if (editingId.value !== report.id) return
    Object.assign(form, { title: item.title, slug: item.slug, summary: item.summary, content: item.content, coverImageId: item.coverImageId, status: item.status, publishedAt: item.publishedAt })
    if (item.coverImage) selectedCover.value = { id: item.coverImage.id, name: '目前封面', altText: item.coverImage.altText, path: item.coverImage.path, mimeType: 'image/webp', size: 0, usageCount: 0, createdAt: item.createdAt }
    dialogVisible.value = true
  } catch (error) { errorMessage.value = backendMessage(error, '報告內容載入失敗') }
}
const openCoverPicker = async () => {
  const epoch = ++coverPickerEpoch; coverPickerVisible.value = true; coverPickerLoading.value = true; coverPickerError.value = ''
  try { const response = await adminArticleImagesApi.list(); if (epoch === coverPickerEpoch && coverPickerVisible.value) coverImages.value = response.data.images }
  catch { if (epoch === coverPickerEpoch) coverPickerError.value = '文章圖片載入失敗，請稍後再試。' }
  finally { if (epoch === coverPickerEpoch) coverPickerLoading.value = false }
}
const chooseCoverImage = (image: ArticleImageItem) => { selectedCover.value = image; form.coverImageId = image.id; coverPickerVisible.value = false }
const removeCoverImage = () => { selectedCover.value = null; form.coverImageId = null }
const payload = (): IndustryReportWriteInput => ({ title: form.title, summary: form.summary, content: form.content, coverImageId: form.coverImageId, status: form.status })
const saveReport = async () => {
  if (saving.value) return
  saving.value = true; resetMessages()
  try {
    if (editingId.value) await adminIndustryReportsApi.update(editingId.value, payload())
    else await adminIndustryReportsApi.create(payload())
    dialogVisible.value = false; resetForm(); feedbackMessage.value = '產業分析報告已儲存。'; await loadReports()
  } catch (error) { errorMessage.value = backendMessage(error) }
  finally { saving.value = false }
}
const publishReport = async (report: IndustryReportAdminItem) => {
  if (!report.coverImageId) { errorMessage.value = '發布前請先選擇封面圖片。'; return }
  if (!window.confirm(`確定發布「${report.title}」？`)) return
  mutatingId.value = report.id; resetMessages()
  try { await adminIndustryReportsApi.publish(report.id); feedbackMessage.value = '產業分析報告已發布。'; await loadReports() }
  catch (error) { errorMessage.value = backendMessage(error) }
  finally { mutatingId.value = '' }
}
const unpublishReport = async (report: IndustryReportAdminItem) => {
  if (!window.confirm(`確定下架「${report.title}」？`)) return
  mutatingId.value = report.id; resetMessages()
  try { await adminIndustryReportsApi.unpublish(report.id); feedbackMessage.value = '產業分析報告已下架。'; await loadReports() }
  catch (error) { errorMessage.value = backendMessage(error) }
  finally { mutatingId.value = '' }
}
const deleteReport = async (report: IndustryReportAdminItem) => {
  if (report.status !== 'DRAFT' || !window.confirm(`確定刪除草稿「${report.title}」？`)) return
  mutatingId.value = report.id; resetMessages()
  try { await adminIndustryReportsApi.remove(report.id); feedbackMessage.value = '產業分析報告草稿已刪除。'; await loadReports() }
  catch (error) { errorMessage.value = backendMessage(error) }
  finally { mutatingId.value = '' }
}
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
onMounted(loadReports)
</script>

<template>
  <section class="industry-report-admin">
    <header class="page-header"><div><p class="eyebrow">Member Exclusive</p><h1>產業分析報告</h1><p>管理提供會員閱讀的 KQC 定期產業分析報告。</p></div><Button label="新增產業分析報告" @click="openCreate" /></header>
    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <Message v-if="feedbackMessage" severity="success" :closable="false">{{ feedbackMessage }}</Message>
    <DataTable :value="reports" :loading="loading" striped-rows empty-message="目前沒有產業分析報告">
      <Column header="封面"><template #body="{ data }"><img v-if="data.coverImage" class="cover-thumbnail" :src="articleImageUrl(data.coverImage.path)" :alt="data.coverImage.altText"><span v-else>未設定</span></template></Column>
      <Column field="title" header="標題" />
      <Column field="summary" header="摘要" />
      <Column header="狀態"><template #body="{ data }"><span class="status-badge" :class="`is-${data.status.toLowerCase()}`"><Icon :icon="data.status === 'PUBLISHED' ? 'lucide:circle-check' : 'lucide:file-clock'" />{{ data.status === 'PUBLISHED' ? '已發布' : '草稿' }}</span></template></Column>
      <Column header="發布時間"><template #body="{ data }">{{ formatDate(data.publishedAt) }}</template></Column>
      <Column header="更新時間"><template #body="{ data }">{{ formatDate(data.updatedAt) }}</template></Column>
      <Column header="操作"><template #body="{ data }"><div class="row-actions">
        <Button size="small" outlined label="編輯" :disabled="mutatingId === data.id" @click="openEdit(data)" />
        <Button v-if="data.status === 'DRAFT'" size="small" label="發布" :loading="mutatingId === data.id" @click="publishReport(data)" />
        <Button v-if="data.status === 'DRAFT'" size="small" severity="danger" text label="刪除" :disabled="mutatingId === data.id" @click="deleteReport(data)" />
        <Button v-if="data.status === 'PUBLISHED'" size="small" severity="secondary" outlined label="下架" :loading="mutatingId === data.id" @click="unpublishReport(data)" />
      </div></template></Column>
    </DataTable>

    <Dialog v-model:visible="dialogVisible" modal :header="editingId ? '編輯產業分析報告' : '新增產業分析報告'" class="industry-report-dialog" @hide="resetForm">
      <form class="industry-report-form" @submit.prevent="saveReport">
        <label>標題<InputText v-model="form.title" maxlength="160" required /></label>
        <div class="readonly-field"><strong>Slug</strong><output>{{ editingId ? form.slug : '儲存後由系統自動產生' }}</output><small>建立後不可修改，作為穩定報告網址。</small></div>
        <label>摘要<Textarea v-model="form.summary" rows="3" maxlength="500" required /></label>
        <label>內容<Textarea v-model="form.content" rows="14" maxlength="100000" required /></label>
        <fieldset class="cover-field"><legend>封面圖片</legend><div class="cover-actions"><Button type="button" outlined :label="form.coverImageId ? '更換圖片' : '選擇圖片'" @click="openCoverPicker" /><small>從既有「文章圖片」圖片庫選擇。</small></div><div v-if="coverPreview" class="cover-preview"><img :src="articleImageUrl(coverPreview.path)" :alt="coverPreview.altText"><strong>{{ coverPreview.name }}</strong><Button type="button" label="移除封面" severity="danger" text @click="removeCoverImage" /></div></fieldset>
        <div class="readonly-grid"><div class="readonly-field"><strong>狀態</strong><output>{{ form.status === 'PUBLISHED' ? '已發布' : '草稿' }}</output></div><div class="readonly-field"><strong>發布時間</strong><output>{{ formatDate(form.publishedAt) }}</output></div></div>
        <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
        <footer><Button type="button" label="取消" text @click="dialogVisible = false" /><Button type="submit" label="儲存" :loading="saving" :disabled="saving" /></footer>
      </form>
    </Dialog>

    <Dialog v-model:visible="coverPickerVisible" modal header="選擇文章圖片" class="industry-report-cover-picker" @hide="coverPickerEpoch += 1">
      <p v-if="coverPickerLoading" role="status">正在載入文章圖片…</p>
      <Message v-else-if="coverPickerError" severity="error" :closable="false">{{ coverPickerError }}</Message>
      <div v-else-if="!coverImages.length" class="cover-picker-empty">目前尚無文章圖片</div>
      <div v-else class="cover-picker-grid"><button v-for="image in coverImages" :key="image.id" type="button" class="cover-picker-card" :aria-pressed="form.coverImageId === image.id" @click="chooseCoverImage(image)"><img :src="articleImageUrl(image.path)" :alt="image.altText"><strong>{{ image.name }}</strong><span>{{ image.altText }}</span></button></div>
    </Dialog>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.industry-report-admin { display: grid; gap: $kqc-spacing-lg; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: $kqc-spacing-md; }
.page-header h1 { margin: 0; color: var(--text-main); font-size: $kqc-type-section-title; }
.page-header > div > p:last-child { margin: $kqc-spacing-xs 0 0; color: var(--text-muted); }
.eyebrow { margin: 0 0 $kqc-spacing-xs; color: var(--accent-active); font-size: $kqc-type-label; font-weight: 700; }
.cover-thumbnail { display: block; width: 5rem; aspect-ratio: 16 / 9; border-radius: $kqc-radius-sm; object-fit: cover; }
.status-badge { display: inline-flex; align-items: center; gap: $kqc-spacing-xs; white-space: nowrap; font-size: $kqc-type-metadata; font-weight: 700; }
.status-badge svg { width: .95rem; height: .95rem; }
.status-badge.is-published { color: #24714b; }.status-badge.is-draft { color: var(--text-muted); }
.row-actions { display: flex; flex-wrap: wrap; gap: $kqc-spacing-xs; }
:global(.industry-report-dialog) { width: min(94vw, 60rem); max-height: 90dvh; overflow: hidden; }
:global(.industry-report-dialog .p-dialog-content), :global(.industry-report-cover-picker .p-dialog-content) { overflow-x: hidden; overflow-y: auto; }
.industry-report-form { display: grid; width: 100%; min-width: 0; gap: $kqc-spacing-md; overflow-x: hidden; }
.industry-report-form label, .readonly-field { display: grid; gap: $kqc-spacing-xs; color: var(--text-main); font-weight: 650; }
.industry-report-form :deep(input), .industry-report-form :deep(textarea) { box-sizing: border-box; width: 100%; min-width: 0; }
.industry-report-form :deep(textarea) { resize: vertical; }
.readonly-field output { padding: .7rem .8rem; border: 1px solid var(--border-grey); border-radius: $kqc-radius-md; color: var(--text-main); background: var(--bg-main); overflow-wrap: anywhere; }
.readonly-field small, .cover-actions small { color: var(--text-muted); font-weight: 400; }
.readonly-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: $kqc-spacing-md; }
.cover-field { display: grid; gap: $kqc-spacing-sm; margin: 0; padding: $kqc-spacing-md; border: 1px solid var(--border-grey); border-radius: $kqc-radius-md; }
.cover-field legend { padding: 0 $kqc-spacing-xs; color: var(--text-main); font-weight: 650; }
.cover-actions { display: flex; align-items: center; flex-wrap: wrap; gap: $kqc-spacing-sm; }
.cover-preview { display: grid; gap: $kqc-spacing-sm; }.cover-preview img { width: min(100%, 30rem); aspect-ratio: 16 / 9; border-radius: $kqc-radius-md; object-fit: cover; }.cover-preview .p-button { justify-self: start; }
.industry-report-form footer { position: sticky; bottom: 0; z-index: 1; display: flex; justify-content: flex-end; gap: $kqc-spacing-sm; padding-top: $kqc-spacing-sm; background: var(--bg-card); }
:global(.industry-report-cover-picker) { width: min(58rem, calc(100vw - 2rem)); max-height: 86dvh; }
.cover-picker-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: $kqc-spacing-md; }
.cover-picker-card { display: grid; min-width: 0; gap: $kqc-spacing-xs; overflow: hidden; padding: 0 0 $kqc-spacing-sm; border: 1px solid var(--border-grey); border-radius: $kqc-radius-md; color: var(--text-main); background: var(--bg-card); cursor: pointer; text-align: start; }
.cover-picker-card[aria-pressed="true"] { border-color: var(--accent-active); outline: 3px solid color-mix(in srgb, var(--accent-active) 25%, transparent); }
.cover-picker-card img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }.cover-picker-card strong, .cover-picker-card span { margin-inline: $kqc-spacing-sm; }.cover-picker-card span { color: var(--text-muted); }
.cover-picker-empty { display: grid; min-height: 12rem; place-items: center; color: var(--text-muted); }
@media (max-width: 800px) { .cover-picker-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 768px) { .page-header { align-items: stretch; flex-direction: column; }.readonly-grid, .cover-picker-grid { grid-template-columns: 1fr; }:global(.industry-report-dialog) { width: 95vw; max-height: 92dvh; } }
</style>
