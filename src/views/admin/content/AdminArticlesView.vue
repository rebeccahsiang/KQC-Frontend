<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import ArticleQuickImport from '@/components/admin/articles/ArticleQuickImport.vue'
import StructuredArticleEditor from '@/components/admin/articles/StructuredArticleEditor.vue'
import {
  ARTICLE_COVER_IMAGE_MAX_BYTES, adminArticlesApi, articleCoverImageUrl,
  type ArticleAdminItem, type ArticleCategory, type ArticleStatus, type ArticleWriteInput, type StructuredArticleContent,
} from '@/api/adminArticles'
import { buildLegacyContentFallback, cloneStructuredArticleContent, createStructuredArticleContent, validateStructuredArticleContent } from '@/utils/articleStructuredContent'

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
const STATUS_LABELS: Record<ArticleStatus, string> = { DRAFT: '草稿', SCHEDULED: '預定', PUBLISHED: '發布' }
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
const contentMode = ref<'LEGACY' | 'STRUCTURED'>('STRUCTURED')
const structuredErrors = ref<string[]>([])
const structuredSurface = ref<'CHOICE' | 'IMPORT' | 'EDITOR'>('CHOICE')
const quickImportReturnSurface = ref<'CHOICE' | 'EDITOR'>('CHOICE')
const quickImportText = ref('')
const quickImportFeedback = ref('')
let coverUploadEpoch = 0
const form = reactive({ title: '', slug: '', categories: ['BUSINESS_MANAGEMENT'] as ArticleCategory[], summary: '', content: '', structuredContent: createStructuredArticleContent() as StructuredArticleContent | null, coverImage: '', tags: '', status: 'DRAFT' as ArticleStatus, isFeatured: false, scheduledAt: '' })
const coverPreviewUrl = computed(() => articleCoverImageUrl(form.coverImage))
const resetCoverUpload = () => {
  coverUploadEpoch += 1
  selectedCoverFile.value = null; uploadingCover.value = false; uploadError.value = ''; coverPreviewFailed.value = false
  if (coverInput.value) coverInput.value.value = ''
}
const resetForm = () => {
  Object.assign(form, { title: '', slug: '', categories: ['BUSINESS_MANAGEMENT'], summary: '', content: '', structuredContent: createStructuredArticleContent(), coverImage: '', tags: '', status: 'DRAFT', isFeatured: false, scheduledAt: '' })
  contentMode.value = 'STRUCTURED'; structuredErrors.value = []; errorMessage.value = ''
  structuredSurface.value = 'CHOICE'; quickImportReturnSurface.value = 'CHOICE'; quickImportText.value = ''; quickImportFeedback.value = ''
  resetCoverUpload()
}
const backendMessage = (error: unknown) => {
  if (!isAxiosError(error)) return '文章操作失敗'
  const responseError = (error.response?.data as { error?: { code?: string; message?: string } })?.error
  if (responseError?.code === 'ARTICLE_VALIDATION_ERROR') {
    if (responseError.message === 'Cover image is required for publication') return '預定或發布文章前，請先設定封面圖片。'
    if (responseError.message === 'Scheduled time is required') return '請設定預定發布時間。'
    if (responseError.message === 'Scheduled time must be in the future') return '預定發布時間必須晚於目前時間。'
  }
  return responseError?.message || '文章操作失敗'
}
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
const toLocalDateTime = (value: string | null) => {
  if (!value) return ''
  const date = new Date(value); const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}
const openEdit = (article: ArticleAdminItem) => {
  resetCoverUpload()
  editingId.value = article.id
  Object.assign(form, { ...article, structuredContent: article.structuredContent ? cloneStructuredArticleContent(article.structuredContent) : null, coverImage: article.coverImage || '', tags: article.tags.join(', '), scheduledAt: toLocalDateTime(article.scheduledAt) })
  contentMode.value = article.structuredContent ? 'STRUCTURED' : 'LEGACY'; structuredErrors.value = []
  structuredSurface.value = article.structuredContent ? 'EDITOR' : 'CHOICE'; quickImportReturnSurface.value = article.structuredContent ? 'EDITOR' : 'CHOICE'; quickImportText.value = ''; quickImportFeedback.value = ''
  dialogVisible.value = true
}
// ============================================================
// Structured Content Mapping / Legacy Article Compatibility
// Legacy Content Fallback / WEB-1F-D2D-B1
// ============================================================
const convertLegacyToStructured = () => {
  form.structuredContent = createStructuredArticleContent()
  contentMode.value = 'STRUCTURED'; structuredSurface.value = 'EDITOR'; structuredErrors.value = []
}
// ============================================================
// D2D-B1B — AI Article Quick Import / Article Create Round Trip
// Quick Import owns only session text and structuredContent replacement;
// Article metadata and the existing JSON create/update path remain isolated.
// ============================================================
const applyQuickImport = (value: StructuredArticleContent) => {
  form.structuredContent = value
  const blockCount = value.sections.reduce((total, section) => total + section.blocks.length, 0) + value.advisorAdvice.blocks.length
  quickImportFeedback.value = `已轉為結構化內容：${value.sections.length} 個章節、${blockCount} 個內容區塊${value.newsSummary.enabled ? '、新聞摘要' : ''}${value.advisorAdvice.enabled ? '、KQC 顧問建議' : ''}。`
  structuredErrors.value = []; structuredSurface.value = 'EDITOR'
}
const openQuickImport = (returnSurface: 'CHOICE' | 'EDITOR') => {
  quickImportReturnSurface.value = returnSurface; quickImportFeedback.value = ''; structuredSurface.value = 'IMPORT'
}
const payload = (): ArticleWriteInput => ({
  title: form.title, slug: form.slug, categories: [...form.categories], summary: form.summary,
  content: contentMode.value === 'STRUCTURED' && form.structuredContent ? buildLegacyContentFallback(form.structuredContent) : form.content,
  ...(contentMode.value === 'STRUCTURED' && form.structuredContent ? { structuredContent: cloneStructuredArticleContent(form.structuredContent) } : {}),
  coverImage: form.coverImage.trim() || null,
  tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), status: form.status, isFeatured: form.isFeatured,
  scheduledAt: form.status === 'SCHEDULED' && form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
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
// Article Scheduled Publishing / WEB-1F-D2B-3
const validatePublication = () => {
  if (form.status === 'DRAFT') return true
  if (!form.coverImage.trim()) { errorMessage.value = '預定或發布文章前，請先設定封面圖片。'; return false }
  if (form.status === 'SCHEDULED') {
    if (!form.scheduledAt) { errorMessage.value = '請設定預定發布時間。'; return false }
    const scheduled = new Date(form.scheduledAt)
    if (Number.isNaN(scheduled.getTime()) || scheduled.getTime() <= Date.now()) { errorMessage.value = '預定發布時間必須晚於目前時間。'; return false }
  }
  return true
}
const saveArticle = async () => {
  if (saving.value || uploadingCover.value) return
  if (form.categories.length < 1 || form.categories.length > 6) { errorMessage.value = '請選擇至少一個文章分類。'; return }
  if (contentMode.value === 'STRUCTURED' && form.structuredContent) {
    structuredErrors.value = validateStructuredArticleContent(form.structuredContent)
    if (structuredErrors.value.length) { structuredSurface.value = 'EDITOR'; return }
  }
  if (!validatePublication()) return
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
const publicationTime = (article: ArticleAdminItem) => article.status === 'SCHEDULED' ? article.scheduledAt : article.status === 'PUBLISHED' ? article.publishedAt : null
onMounted(loadArticles)
</script>

<template>
  <section class="article-admin">
    <header><div><p class="eyebrow">Industry Insights</p><h1>產業文章管理</h1></div><Button label="新增文章" @click="openCreate" /></header>
    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <DataTable :value="articles" :loading="loading" striped-rows empty-message="目前沒有文章">
      <Column field="title" header="標題" />
      <Column header="分類"><template #body="{ data }"><div class="article-category-tags"><Tag v-for="category in data.categories" :key="category" class="article-category-tag" :value="CATEGORY_LABELS[category as ArticleCategory]" severity="secondary" /></div></template></Column>
      <Column field="creatorDisplayName" header="撰寫人" />
      <Column header="狀態"><template #body="{ data }"><span class="article-status"><Icon :icon="data.status === 'PUBLISHED' ? 'lucide:circle-check' : data.status === 'SCHEDULED' ? 'lucide:calendar-clock' : 'lucide:file-clock'" aria-hidden="true" />{{ STATUS_LABELS[data.status as ArticleStatus] }}</span></template></Column>
      <Column header="精選"><template #body="{ data }">{{ data.isFeatured ? '是' : '否' }}</template></Column>
      <Column header="發布時間"><template #body="{ data }">{{ formatDate(publicationTime(data)) }}</template></Column>
      <Column header="更新時間"><template #body="{ data }">{{ formatDate(data.updatedAt) }}</template></Column>
      <Column header="操作"><template #body="{ data }"><div class="row-actions"><Button size="small" outlined aria-label="編輯" title="編輯" @click="openEdit(data)"><template #icon><Icon icon="lucide:pencil" /></template></Button><Button size="small" severity="danger" text aria-label="刪除" title="刪除" @click="deleteArticle(data)"><template #icon><Icon icon="lucide:trash-2" /></template></Button></div></template></Column>
    </DataTable>
    <Dialog v-model:visible="dialogVisible" modal :header="editingId ? '編輯文章' : '新增文章'" class="article-dialog" @hide="resetForm">
      <form class="article-form" @submit.prevent="saveArticle">
        <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
        <label>標題<InputText v-model="form.title" maxlength="160" required /></label>
        <label for="article-slug">文章網址名稱</label>
        <div class="article-form__field">
          <InputText id="article-slug" v-model="form.slug" maxlength="160" required aria-describedby="article-slug-help" placeholder="market-trend-2026" />
          <small id="article-slug-help">用於文章網址，請使用英文小寫、數字或連字號。</small>
        </div>
        <!-- Industry Insights / Article Multi-Category / WEB-1F-D2B-1 -->
        <label>分類<MultiSelect v-model="form.categories" :options="categoryOptions" option-label="label" option-value="value" :max-selected-labels="6" display="chip" placeholder="請選擇至少一個分類" /></label>
        <label>文章摘要<Textarea v-model="form.summary" rows="3" maxlength="500" required /><small>顯示於產業洞察列表與文章卡片。</small></label>
        <!-- Legacy Article Compatibility — explicit conversion only / WEB-1F-D2D-B1 -->
        <div v-if="contentMode === 'LEGACY'" class="legacy-content-editor">
          <header><div><strong>文章內容</strong><small>Legacy 模式：保留既有文章正文。</small></div><Button type="button" outlined label="改用結構化文章內容" @click="convertLegacyToStructured" /></header>
          <label for="legacy-article-content">既有文章內容</label>
          <Textarea id="legacy-article-content" v-model="form.content" rows="12" maxlength="100000" required />
        </div>
        <section v-else-if="form.structuredContent" class="structured-content-workflow">
          <div v-if="structuredSurface === 'CHOICE'" class="structured-entry">
            <div><strong>快速匯入文章</strong><p>將 AI 產生並完成審稿的 KQC 格式文章一次貼入，系統會自動整理成新聞摘要、章節、清單、重點提醒與 KQC 顧問建議。</p></div>
            <div><Button type="button" label="快速匯入文章" @click="openQuickImport('CHOICE')" /><Button type="button" outlined label="手動建立結構化內容" @click="structuredSurface = 'EDITOR'" /></div>
          </div>
          <ArticleQuickImport v-else-if="structuredSurface === 'IMPORT'" v-model="quickImportText" :current-content="form.structuredContent" @apply="applyQuickImport" @close="structuredSurface = quickImportReturnSurface" />
          <template v-else>
            <Message v-if="quickImportFeedback" severity="success" :closable="false">{{ quickImportFeedback }}</Message>
            <div class="structured-reimport"><Button type="button" text size="small" label="快速重新匯入" @click="openQuickImport('EDITOR')" /></div>
            <StructuredArticleEditor v-model="form.structuredContent" :errors="structuredErrors" />
          </template>
        </section>
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
        <label v-if="form.status === 'SCHEDULED'">預定發布時間<InputText v-model="form.scheduledAt" type="datetime-local" required /></label>
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
.legacy-content-editor { display: grid; gap: $kqc-spacing-sm; padding: $kqc-spacing-md; border: 1px solid var(--border-grey); border-radius: $kqc-radius-md; }
.legacy-content-editor > header { display: flex; align-items: center; justify-content: space-between; gap: $kqc-spacing-sm; }
.legacy-content-editor > header > div { display: grid; gap: $kqc-spacing-xs; }
.legacy-content-editor small { color: var(--text-muted); font-weight: 400; }
.structured-content-workflow { display: grid; gap: $kqc-spacing-sm; }
.structured-entry { display: grid; gap: $kqc-spacing-md; padding: $kqc-spacing-lg; border: 1px solid var(--border-grey); border-radius: $kqc-radius-md; }
.structured-entry p { max-width: 48rem; margin: $kqc-spacing-xs 0 0; color: var(--text-muted); }
.structured-entry > div:last-child { display: flex; flex-wrap: wrap; gap: $kqc-spacing-sm; }
.structured-reimport { display: flex; justify-content: flex-end; }
.article-form :deep(input), .article-form :deep(textarea), .article-form :deep(.p-select) { box-sizing: border-box; width: 100%; max-width: 100%; min-width: 0; }
.article-form :deep(textarea) { resize: vertical; }
.article-form .checkbox-field { display: flex; align-items: center; grid-template-columns: auto 1fr; }
.article-category-tags { display: flex; width: max-content; max-width: 18rem; align-items: center; flex-wrap: wrap; gap: $kqc-spacing-2xs; }
.article-category-tags :deep(.article-category-tag) { padding: $kqc-spacing-2xs $kqc-spacing-xs; font-size: $kqc-type-caption; line-height: 1.1; white-space: nowrap; }
.article-status { display: inline-flex; align-items: center; gap: $kqc-spacing-xs; white-space: nowrap; font-size: $kqc-type-metadata; }
.article-status svg { width: 0.95rem; height: 0.95rem; color: var(--accent-active); }
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
