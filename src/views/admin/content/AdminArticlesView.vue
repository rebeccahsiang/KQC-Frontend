<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import {
  ARTICLE_COVER_IMAGE_MAX_BYTES, adminArticlesApi, articleCoverImageUrl,
  type ArticleAdminItem, type ArticleCategory, type ArticleStatus, type ArticleWriteInput,
} from '@/api/adminArticles'

// ============================================================
// Industry Insights — Admin Article Management
// WEB-1F-D2A
// ============================================================
const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  BUSINESS_MANAGEMENT: '經營管理',
  TRANSPORT_KNOWLEDGE: '運輸小知識',
  MARKET_TREND: '市場趨勢',
  BUSINESS_TRANSFORMATION: '事業轉型',
  POLICY_REGULATION: '政策法規',
  KQC_NEWS: 'KQC 快訊',
}
const STATUS_LABELS: Record<ArticleStatus, string> = { DRAFT: '草稿', PUBLISHED: '已發布' }
const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))
const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))
const articles = ref<ArticleAdminItem[]>([])
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const dialogVisible = ref(false)
const editingId = ref('')
const coverInput = ref<HTMLInputElement | null>(null)
const selectedCoverFile = ref<File | null>(null)
const uploadingCover = ref(false)
const uploadError = ref('')
const coverPreviewFailed = ref(false)
let coverUploadEpoch = 0
const form = reactive({ title: '', slug: '', category: 'BUSINESS_MANAGEMENT' as ArticleCategory, summary: '', content: '', coverImage: '', tags: '', status: 'DRAFT' as ArticleStatus, isFeatured: false })
const coverPreviewUrl = computed(() => articleCoverImageUrl(form.coverImage))
const resetCoverUpload = () => {
  coverUploadEpoch += 1
  selectedCoverFile.value = null; uploadingCover.value = false; uploadError.value = ''; coverPreviewFailed.value = false
  if (coverInput.value) coverInput.value.value = ''
}
const resetForm = () => {
  Object.assign(form, { title: '', slug: '', category: 'BUSINESS_MANAGEMENT', summary: '', content: '', coverImage: '', tags: '', status: 'DRAFT', isFeatured: false })
  resetCoverUpload()
}
const backendMessage = (error: unknown) => isAxiosError(error)
  ? (error.response?.data as { error?: { message?: string } })?.error?.message || '文章操作失敗'
  : '文章操作失敗'
const coverUploadMessage = (error: unknown) => {
  if (!isAxiosError(error)) return '圖片上傳失敗，請稍後再試。'
  const status = error.response?.status
  const code = (error.response?.data as { error?: { code?: string } })?.error?.code
  if (status === 401) return '登入狀態已失效，請重新登入後再試。'
  if (status === 403) return '目前帳號沒有上傳文章圖片的權限。'
  if (status === 413 || code === 'ARTICLE_COVER_IMAGE_TOO_LARGE') return '圖片檔案不得超過 5 MB。'
  if (status === 415 || code === 'ARTICLE_COVER_IMAGE_TYPE_UNSUPPORTED') return '僅支援 JPG、PNG、WebP 圖片格式。'
  if (code === 'ARTICLE_COVER_IMAGE_INVALID') return '圖片上傳失敗，請重新選擇圖片後再試一次。'
  return '圖片上傳失敗，請稍後再試。'
}
const loadArticles = async () => {
  loading.value = true; errorMessage.value = ''
  try { articles.value = (await adminArticlesApi.list({ page: 1, limit: 25 })).data.articles }
  catch (error) { errorMessage.value = backendMessage(error) }
  finally { loading.value = false }
}
const openCreate = () => { editingId.value = ''; resetForm(); dialogVisible.value = true }
const openEdit = (article: ArticleAdminItem) => {
  resetCoverUpload()
  editingId.value = article.id
  Object.assign(form, { ...article, coverImage: article.coverImage || '', tags: article.tags.join(', ') })
  dialogVisible.value = true
}
const payload = (): ArticleWriteInput => ({
  title: form.title, slug: form.slug, category: form.category, summary: form.summary, content: form.content,
  coverImage: form.coverImage.trim() || null,
  tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), status: form.status, isFeatured: form.isFeatured,
})
// ============================================================
// Article Cover Image — Admin Upload Ownership
// WEB-1F-D2A-1
// Upload returns a reference; existing Article CRUD persists that reference.
// ============================================================
const selectCoverImage = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  uploadError.value = ''; selectedCoverFile.value = null
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    uploadError.value = '僅支援 JPG、PNG 或 WebP 圖片。'; input.value = ''; return
  }
  if (file.size > ARTICLE_COVER_IMAGE_MAX_BYTES) {
    uploadError.value = '圖片大小不可超過 5 MB。'; input.value = ''; return
  }
  selectedCoverFile.value = file
}
const uploadCoverImage = async () => {
  if (!selectedCoverFile.value) { uploadError.value = '請先選擇圖片。'; return }
  if (uploadingCover.value) return
  const requestEpoch = ++coverUploadEpoch
  uploadingCover.value = true; uploadError.value = ''
  try {
    const response = await adminArticlesApi.uploadCoverImage(selectedCoverFile.value)
    if (requestEpoch !== coverUploadEpoch) return
    form.coverImage = response.data.path; coverPreviewFailed.value = false
    selectedCoverFile.value = null
    if (coverInput.value) coverInput.value.value = ''
  } catch (error) { if (requestEpoch === coverUploadEpoch) uploadError.value = coverUploadMessage(error) }
  finally { if (requestEpoch === coverUploadEpoch) uploadingCover.value = false }
}
const removeCoverImage = () => { form.coverImage = ''; resetCoverUpload() }
const saveArticle = async () => {
  if (saving.value || uploadingCover.value) return
  saving.value = true; errorMessage.value = ''
  try {
    if (editingId.value) await adminArticlesApi.update(editingId.value, payload())
    else await adminArticlesApi.create(payload())
    dialogVisible.value = false; resetForm(); await loadArticles()
  } catch (error) { errorMessage.value = backendMessage(error) }
  finally { saving.value = false }
}
const deleteArticle = async (article: ArticleAdminItem) => {
  if (!window.confirm(`確定刪除「${article.title}」？`)) return
  try { await adminArticlesApi.remove(article.id); await loadArticles() }
  catch (error) { errorMessage.value = backendMessage(error) }
}
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
onMounted(loadArticles)
</script>

<template>
  <section class="article-admin">
    <header><div><p class="eyebrow">Industry Insights</p><h1>產業文章管理</h1></div><Button label="新增文章" @click="openCreate" /></header>
    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <DataTable :value="articles" :loading="loading" striped-rows empty-message="目前沒有文章">
      <Column field="title" header="標題" />
      <Column header="分類"><template #body="{ data }">{{ CATEGORY_LABELS[data.category as ArticleCategory] }}</template></Column>
      <Column header="狀態"><template #body="{ data }"><Tag :value="STATUS_LABELS[data.status as ArticleStatus]" :severity="data.status === 'PUBLISHED' ? 'success' : 'secondary'" /></template></Column>
      <Column header="精選"><template #body="{ data }">{{ data.isFeatured ? '是' : '否' }}</template></Column>
      <Column header="發布時間"><template #body="{ data }">{{ formatDate(data.publishedAt) }}</template></Column>
      <Column header="更新時間"><template #body="{ data }">{{ formatDate(data.updatedAt) }}</template></Column>
      <Column header="操作"><template #body="{ data }"><div class="row-actions"><Button label="編輯" size="small" outlined @click="openEdit(data)" /><Button label="刪除" size="small" severity="danger" text @click="deleteArticle(data)" /></div></template></Column>
    </DataTable>
    <Dialog v-model:visible="dialogVisible" modal :header="editingId ? '編輯文章' : '新增文章'" class="article-dialog" @hide="resetForm">
      <form class="article-form" @submit.prevent="saveArticle">
        <label>標題<InputText v-model="form.title" maxlength="160" required /></label>
        <label for="article-slug">文章網址名稱</label>
        <div class="article-form__field">
          <InputText id="article-slug" v-model="form.slug" maxlength="160" required aria-describedby="article-slug-help" placeholder="market-trend-2026" />
          <small id="article-slug-help">用於文章網址，請使用英文小寫、數字或連字號。</small>
        </div>
        <label>分類<Select v-model="form.category" :options="categoryOptions" option-label="label" option-value="value" /></label>
        <label>摘要<Textarea v-model="form.summary" rows="3" maxlength="500" required /></label>
        <label>文章內容<Textarea v-model="form.content" rows="12" maxlength="100000" required /></label>
        <fieldset class="article-cover-field">
          <legend>文章封面圖片</legend>
          <div class="article-cover-upload">
            <label class="article-cover-select" for="article-cover-file">
              <input id="article-cover-file" ref="coverInput" class="article-cover-select__input" type="file" accept="image/jpeg,image/png,image/webp" :disabled="uploadingCover" aria-describedby="article-cover-filename" @change="selectCoverImage">
              <span aria-hidden="true">＋</span>
              {{ selectedCoverFile ? '重新選擇' : '選擇圖片' }}
            </label>
            <span id="article-cover-filename" class="article-cover-filename">
              {{ selectedCoverFile ? `已選擇：${selectedCoverFile.name}` : '尚未選擇檔案' }}
            </span>
            <Button class="article-cover-upload__button" type="button" label="上傳圖片" :loading="uploadingCover" :disabled="uploadingCover || !selectedCoverFile" @click="uploadCoverImage" />
          </div>
          <small>支援 JPG、PNG、WebP，檔案上限 5 MB。</small>
          <Message v-if="uploadError" severity="error" :closable="false">{{ uploadError }}</Message>
          <div v-if="form.coverImage" class="article-cover-preview">
            <img v-if="!coverPreviewFailed" :src="coverPreviewUrl" alt="文章封面預覽" @error="coverPreviewFailed = true">
            <p v-else role="status">封面圖片暫時無法預覽。</p>
            <Button type="button" label="移除封面" severity="danger" text :disabled="uploadingCover" @click="removeCoverImage" />
          </div>
        </fieldset>
        <label>標籤（以逗號分隔）<InputText v-model="form.tags" /></label>
        <label>狀態<Select v-model="form.status" :options="statusOptions" option-label="label" option-value="value" /></label>
        <label class="checkbox-field"><Checkbox v-model="form.isFeatured" binary />精選文章</label>
        <footer><Button type="button" label="取消" text @click="dialogVisible = false" /><Button type="submit" label="儲存" :loading="saving" :disabled="saving || uploadingCover" /></footer>
      </form>
    </Dialog>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
/* ============================================================
 * Admin Article Modal — Responsive Layout
 * WEB-1F-D2A
 * ============================================================ */
:global(.article-dialog) { width: min(94vw, 60rem); max-height: 90dvh; overflow: hidden; }
:global(.article-dialog .p-dialog-content) { min-width: 0; overflow-x: hidden; overflow-y: auto; }
.article-admin { display: grid; gap: $kqc-spacing-lg; }
.article-admin > header, .row-actions, .article-form footer { display: flex; align-items: center; justify-content: space-between; gap: $kqc-spacing-sm; }
h1 { margin: 0; color: var(--text-main); font-size: $kqc-type-section-title; }
.eyebrow { margin: 0 0 $kqc-spacing-xs; color: var(--accent-active); font-size: $kqc-type-label; font-weight: 700; }
.article-form { display: grid; width: 100%; min-width: 0; gap: $kqc-spacing-md; overflow-x: hidden; }
.article-form label { display: grid; gap: $kqc-spacing-xs; color: var(--text-main); font-weight: 650; }
.article-form__field { display: grid; min-width: 0; gap: $kqc-spacing-xs; }
.article-form__field small { color: var(--text-muted); font-weight: 400; }
.article-form :deep(input), .article-form :deep(textarea), .article-form :deep(.p-select) { box-sizing: border-box; width: 100%; max-width: 100%; min-width: 0; }
.article-form :deep(textarea) { resize: vertical; }
.article-form .checkbox-field { display: flex; align-items: center; grid-template-columns: auto 1fr; }
.article-form footer { position: sticky; bottom: 0; z-index: 1; justify-content: flex-end; padding-top: $kqc-spacing-sm; background: var(--bg-card); }
.article-cover-field { display: grid; min-width: 0; gap: $kqc-spacing-sm; margin: 0; padding: $kqc-spacing-md; border: 1px solid var(--border-grey); border-radius: $kqc-radius-md; }
.article-cover-field legend { padding: 0 $kqc-spacing-xs; color: var(--text-main); font-weight: 650; }
.article-cover-field > small { color: var(--text-muted); }
.article-cover-upload { display: flex; min-width: 0; flex-wrap: wrap; align-items: center; gap: $kqc-spacing-sm; }
/* ============================================================
 * Article Cover Image — File Selection UX
 * WEB-1F-D2A-1
 * ============================================================ */
.article-cover-select { position: relative; display: inline-flex; flex: 0 0 auto; align-items: center; gap: $kqc-spacing-xs; padding: 0.65rem 0.9rem; border: 1px solid var(--accent-active); border-radius: $kqc-radius-md; background: color-mix(in srgb, var(--accent-active) 14%, var(--bg-card)); color: var(--text-main); cursor: pointer; font-weight: 700; transition: background 160ms ease, box-shadow 160ms ease; }
.article-cover-select:hover { background: color-mix(in srgb, var(--accent-active) 24%, var(--bg-card)); }
.article-cover-select:focus-within { outline: 3px solid color-mix(in srgb, var(--accent-active) 35%, transparent); outline-offset: 2px; }
.article-cover-select:has(.article-cover-select__input:disabled) { opacity: 0.48; cursor: not-allowed; }
.article-cover-select__input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
.article-cover-filename { min-width: 0; flex: 1 1 12rem; overflow: hidden; color: var(--text-muted); text-overflow: ellipsis; white-space: nowrap; }
/* ============================================================
 * Article Cover Image — Upload Button State
 * WEB-1F-D2A-1
 * ============================================================ */
.article-cover-upload :deep(.article-cover-upload__button) { border-color: var(--accent-active); background: var(--accent-active); color: var(--text-on-accent, #fff); cursor: pointer; font-weight: 700; transition: filter 160ms ease, box-shadow 160ms ease, opacity 160ms ease; }
.article-cover-upload :deep(.article-cover-upload__button:not(:disabled):hover) { filter: brightness(0.9); }
.article-cover-upload :deep(.article-cover-upload__button:not(:disabled):focus-visible) { outline: 3px solid color-mix(in srgb, var(--accent-active) 35%, transparent); outline-offset: 2px; }
.article-cover-upload :deep(.article-cover-upload__button:disabled) { opacity: 0.48; cursor: not-allowed; filter: grayscale(0.25); }
.article-cover-preview { display: grid; min-width: 0; gap: $kqc-spacing-sm; }
.article-cover-preview img, .article-cover-preview p { width: 100%; aspect-ratio: 16 / 9; margin: 0; border-radius: $kqc-radius-md; background: var(--bg-main); }
.article-cover-preview img { display: block; object-fit: cover; }
.article-cover-preview p { display: grid; place-items: center; color: var(--text-muted); }
.article-cover-preview .p-button { justify-self: start; }
@media (max-width: 768px) { :global(.article-dialog) { width: 95vw; max-height: 92dvh; } .article-admin > header { align-items: stretch; flex-direction: column; } }
</style>
