<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { ARTICLE_IMAGE_MAX_BYTES, adminArticleImagesApi, articleImageUrl, type ArticleImageItem } from '@/api/adminArticleImages'

const images = ref<ArticleImageItem[]>([])
const loading = ref(false)
const feedback = ref('')
const feedbackSeverity = ref<'success' | 'error'>('error')
const uploadVisible = ref(false)
const uploading = ref(false)
const deletingId = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const form = reactive<{ image: File | null; name: string; altText: string }>({ image: null, name: '', altText: '' })
let loadEpoch = 0

// D2F-B — Article Image Library / Route / Stale Response Guard.
const loadImages = async () => {
  const epoch = ++loadEpoch; loading.value = true; feedback.value = ''
  try { const response = await adminArticleImagesApi.list(); if (epoch === loadEpoch) images.value = response.data.images }
  catch { if (epoch === loadEpoch) { images.value = []; feedbackSeverity.value = 'error'; feedback.value = '文章圖片載入失敗，請稍後再試。' } }
  finally { if (epoch === loadEpoch) loading.value = false }
}
const resetUpload = () => { form.image = null; form.name = ''; form.altText = ''; if (fileInput.value) fileInput.value.value = '' }
const selectFile = (event: Event) => {
  const input = event.target as HTMLInputElement; const file = input.files?.[0] || null
  feedback.value = ''; form.image = null
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { feedbackSeverity.value = 'error'; feedback.value = '僅支援 JPEG、PNG、WebP 圖片。'; input.value = ''; return }
  if (file.size > ARTICLE_IMAGE_MAX_BYTES) { feedbackSeverity.value = 'error'; feedback.value = '圖片大小不可超過 5 MB。'; input.value = ''; return }
  form.image = file
}

// D2F-B — Article Image Upload / entered metadata survives recoverable failures.
const uploadImage = async () => {
  if (uploading.value || !form.image || !form.name.trim() || !form.altText.trim()) return
  uploading.value = true; feedback.value = ''
  try {
    await adminArticleImagesApi.upload(form.image, form.name.trim(), form.altText.trim())
    feedbackSeverity.value = 'success'; feedback.value = '文章圖片已新增。'; uploadVisible.value = false; resetUpload(); await loadImages()
  } catch { feedbackSeverity.value = 'error'; feedback.value = '圖片新增失敗，請確認格式與大小後再試。' }
  finally { uploading.value = false }
}
const usageLabel = (count: number) => count === 0 ? '尚未使用' : `已使用於 ${count} 篇文章`

// D2F-B — Article Image Delete Guard / Backend 409 remains final authority.
const deleteImage = async (image: ArticleImageItem) => {
  if (image.usageCount > 0 || deletingId.value || !window.confirm(`確定要刪除「${image.name}」圖片嗎？刪除後無法復原。`)) return
  deletingId.value = image.id; feedback.value = ''
  try { await adminArticleImagesApi.remove(image.id); feedbackSeverity.value = 'success'; feedback.value = '文章圖片已刪除。'; await loadImages() }
  catch (error) {
    const code = isAxiosError(error) ? (error.response?.data as { error?: { code?: string } })?.error?.code : undefined
    feedbackSeverity.value = 'error'; feedback.value = code === 'ARTICLE_IMAGE_IN_USE' ? '此圖片仍被文章使用，無法刪除。請先更換相關文章的封面圖片。' : '圖片刪除失敗，請稍後再試。'
  } finally { deletingId.value = '' }
}
const formatDate = (value: string) => new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium' }).format(new Date(value))
onMounted(loadImages)
</script>

<template>
  <section class="image-library">
    <header><div><p>Industry Insights</p><h1>文章圖片</h1><small>管理產業洞察文章使用的圖片素材；使用中的圖片受到保護。</small></div><Button label="新增圖片" @click="uploadVisible = true" /></header>
    <Message v-if="feedback" :severity="feedbackSeverity" :closable="false" role="status">{{ feedback }}</Message>
    <p v-if="loading" role="status" aria-live="polite">正在載入文章圖片…</p>
    <div v-else-if="!images.length" class="image-empty"><strong>目前尚無文章圖片</strong><p>請先新增圖片，再於文章管理選擇封面。</p><Button label="新增圖片" @click="uploadVisible = true" /></div>
    <!-- D2F-B — Article Image Accessibility / selection and destructive state are explicit. -->
    <div v-else class="image-grid">
      <article v-for="image in images" :key="image.id" class="image-card">
        <img :src="articleImageUrl(image.path)" :alt="image.altText">
        <div><h2>{{ image.name }}</h2><p>{{ image.altText }}</p><dl><div><dt>上傳日期</dt><dd>{{ formatDate(image.createdAt) }}</dd></div><div><dt>使用狀態</dt><dd>{{ usageLabel(image.usageCount) }}</dd></div></dl><Button v-if="image.usageCount === 0" label="刪除" severity="danger" text :loading="deletingId === image.id" @click="deleteImage(image)" /><span v-else class="in-use">使用中，不可刪除</span></div>
      </article>
    </div>
    <Dialog v-model:visible="uploadVisible" modal header="新增文章圖片" :style="{ width: 'min(36rem, calc(100vw - 2rem))' }" @hide="resetUpload">
      <form class="upload-form" @submit.prevent="uploadImage">
        <label for="article-image-file">圖片<input id="article-image-file" ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" required @change="selectFile"><small>支援 JPEG、PNG、WebP，最大 5 MB。</small></label>
        <label for="article-image-name">圖片名稱<InputText id="article-image-name" v-model="form.name" maxlength="120" required /></label>
        <label for="article-image-alt">ALT 替代文字<InputText id="article-image-alt" v-model="form.altText" maxlength="300" required /><small>描述圖片內容，協助無法觀看圖片的使用者理解資訊。</small></label>
        <footer><Button type="button" label="取消" text @click="uploadVisible = false" /><Button type="submit" label="新增圖片" :loading="uploading" :disabled="uploading || !form.image || !form.name.trim() || !form.altText.trim()" /></footer>
      </form>
    </Dialog>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.image-library { display: grid; gap: $kqc-spacing-lg; }
.image-library > header, .upload-form footer { display: flex; align-items: center; justify-content: space-between; gap: $kqc-spacing-md; }
.image-library h1, .image-card h2 { margin: 0; color: var(--text-main); }
.image-library header p { margin: 0 0 $kqc-spacing-xs; color: var(--accent-active); font-size: $kqc-type-label; font-weight: 700; }
.image-library header small, .image-card p, dt, .upload-form small { color: var(--text-muted); }
.image-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: $kqc-spacing-lg; }
.image-card { overflow: hidden; border: 1px solid var(--border-grey); border-radius: $kqc-radius-lg; background: var(--bg-card); }
.image-card > img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; background: var(--bg-main); }
.image-card > div { display: grid; gap: $kqc-spacing-sm; padding: $kqc-spacing-md; }
.image-card p { margin: 0; line-height: 1.5; }
.image-card dl { display: grid; gap: $kqc-spacing-xs; margin: 0; }
.image-card dl div { display: flex; justify-content: space-between; gap: $kqc-spacing-sm; }
.image-card dd { margin: 0; color: var(--text-main); }
.in-use { color: var(--text-muted); font-size: $kqc-type-metadata; }
.image-empty { display: grid; min-height: 18rem; place-items: center; align-content: center; gap: $kqc-spacing-sm; border: 1px dashed var(--border-grey); border-radius: $kqc-radius-lg; text-align: center; }
.upload-form, .upload-form label { display: grid; gap: $kqc-spacing-sm; }
.upload-form footer { justify-content: flex-end; }
@media (max-width: 900px) { .image-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .image-library > header { align-items: stretch; flex-direction: column; } .image-grid { grid-template-columns: 1fr; } }
</style>
