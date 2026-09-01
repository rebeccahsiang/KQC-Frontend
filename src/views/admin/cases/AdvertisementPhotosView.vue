<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { ADVERTISEMENT_IMAGE_MAX_BYTES, adminAdvertisementImagesApi, advertisementImageUrl, type AdvertisementImageItem } from '@/api/adminAdvertisementImages'

const toast = useToast()
const images = ref<AdvertisementImageItem[]>([])
const loading = ref(false)
const loadError = ref('')
const operationError = ref('')
const uploadVisible = ref(false)
const editVisible = ref(false)
const deleteVisible = ref(false)
const mutating = ref(false)
const selected = ref<AdvertisementImageItem | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const upload = reactive<{ image: File | null; name: string; altText: string }>({ image: null, name: '', altText: '' })
const edit = reactive({ name: '', altText: '' })
let loadEpoch = 0

const formatBytes = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.ceil(bytes / 1024)} KB`
const formatDate = (value: string) => new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium' }).format(new Date(value))
const errorMessage = (error: unknown, fallback: string) => isAxiosError(error) ? (error.response?.data as { error?: { message?: string } })?.error?.message || fallback : fallback
const uploadReady = computed(() => Boolean(upload.image && upload.name.trim() && upload.altText.trim()))

/* PRODUCT-ADVERTISEMENT-R2A — Advertisement Photo Library / backend purpose-filtered records own the responsive card collection. */
const loadImages = async () => {
  const epoch = ++loadEpoch; loading.value = true; loadError.value = ''
  try { const response = await adminAdvertisementImagesApi.list(); if (epoch === loadEpoch) images.value = response.data.images }
  catch (error) { if (epoch === loadEpoch) { images.value = []; loadError.value = errorMessage(error, '廣告照片載入失敗，請稍後再試。') } }
  finally { if (epoch === loadEpoch) loading.value = false }
}

const clearPreview = () => { if (previewUrl.value) URL.revokeObjectURL(previewUrl.value); previewUrl.value = '' }
const resetUpload = () => { clearPreview(); upload.image = null; upload.name = ''; upload.altText = ''; operationError.value = ''; if (fileInput.value) fileInput.value.value = '' }
const selectFile = (event: Event) => {
  const input = event.target as HTMLInputElement; const file = input.files?.[0] || null
  operationError.value = ''; clearPreview(); upload.image = null
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { operationError.value = '僅支援 JPEG、PNG、WebP 圖片。'; input.value = ''; return }
  if (file.size > ADVERTISEMENT_IMAGE_MAX_BYTES) { operationError.value = '圖片大小不可超過 5 MB。'; input.value = ''; return }
  upload.image = file; previewUrl.value = URL.createObjectURL(file)
}

/* PRODUCT-ADVERTISEMENT-R2A — Advertisement Photo Upload / duplicate submit is blocked and successful writes reconcile from backend. */
const uploadImage = async () => {
  if (mutating.value || !uploadReady.value || !upload.image) return
  mutating.value = true; operationError.value = ''
  try { await adminAdvertisementImagesApi.upload(upload.image, upload.name.trim(), upload.altText.trim()); uploadVisible.value = false; resetUpload(); await loadImages(); toast.add({ severity: 'success', summary: '上傳完成', detail: '廣告照片已加入照片庫。', life: 3000 }) }
  catch (error) { operationError.value = errorMessage(error, '廣告照片上傳失敗，請檢查資料後再試。') }
  finally { mutating.value = false }
}

const openEdit = (image: AdvertisementImageItem) => { selected.value = image; edit.name = image.name; edit.altText = image.altText; operationError.value = ''; editVisible.value = true }
const saveMetadata = async () => {
  if (!selected.value || mutating.value || !edit.name.trim() || !edit.altText.trim()) return
  mutating.value = true; operationError.value = ''
  try { await adminAdvertisementImagesApi.update(selected.value.id, { name: edit.name.trim(), altText: edit.altText.trim() }); editVisible.value = false; selected.value = null; await loadImages(); toast.add({ severity: 'success', summary: '儲存完成', detail: '圖片名稱與 ALT 文字已更新。', life: 3000 }) }
  catch (error) { operationError.value = errorMessage(error, '圖片資料更新失敗，請稍後再試。') }
  finally { mutating.value = false }
}

/* PRODUCT-ADVERTISEMENT-R2A — Advertisement Photo Delete Guard / UI state assists users while backend usage remains final authority. */
const openDelete = (image: AdvertisementImageItem) => { if (image.usageCount > 0) return; selected.value = image; operationError.value = ''; deleteVisible.value = true }
const deleteImage = async () => {
  if (!selected.value || selected.value.usageCount > 0 || mutating.value) return
  mutating.value = true; operationError.value = ''
  try { await adminAdvertisementImagesApi.remove(selected.value.id); deleteVisible.value = false; selected.value = null; await loadImages(); toast.add({ severity: 'success', summary: '刪除完成', detail: '未使用的廣告照片已刪除。', life: 3000 }) }
  catch (error) { operationError.value = errorMessage(error, '圖片仍在使用中或目前無法刪除。') }
  finally { mutating.value = false }
}

onMounted(loadImages)
onBeforeUnmount(() => { loadEpoch += 1; clearPreview() })
</script>

<template>
  <section class="advertisement-photos">
    <header class="page-header"><div><p class="eyebrow">ADVERTISEMENT MEDIA</p><h1>廣告照片</h1><p>管理廣告案件專用圖片；圖片建立後可於廣告案件中選用。</p></div><Button label="＋ 新增廣告照片" icon="pi pi-image" @click="uploadVisible = true" /></header>
    <Message v-if="loadError" severity="error" :closable="false" role="alert"><span>{{ loadError }}</span><Button label="重新載入" text @click="loadImages" /></Message>
    <div v-if="loading" class="page-state" role="status" aria-live="polite">正在載入廣告照片…</div>
    <div v-else-if="!loadError && !images.length" class="empty-state"><span class="pi pi-images" aria-hidden="true" /><h2>尚無廣告照片</h2><p>新增第一張廣告圖片，之後即可在廣告案件中選用。</p><Button label="＋ 新增廣告照片" @click="uploadVisible = true" /></div>
    <div v-else-if="!loadError" class="photo-grid">
      <article v-for="image in images" :key="image.id" class="photo-card">
        <div class="photo-preview"><img :src="advertisementImageUrl(image.imageUrl)" :alt="image.altText || image.name" loading="lazy"><span class="preview-fallback" aria-hidden="true">圖片無法顯示</span></div>
        <div class="photo-body"><h2>{{ image.name }}</h2><p class="alt-text">{{ image.altText || '未提供 ALT 文字' }}</p><dl><div><dt>檔案</dt><dd>{{ image.mimeType }} · {{ formatBytes(image.fileSize) }}</dd></div><div><dt>建立日期</dt><dd>{{ formatDate(image.createdAt) }}</dd></div></dl><span :class="['usage-badge', { 'usage-badge--active': image.usageCount > 0 }]">{{ image.usageCount === 0 ? '尚未使用' : `使用中 · ${image.usageCount}` }}</span><footer><Button label="編輯" severity="secondary" outlined @click="openEdit(image)" /><Button label="刪除" severity="danger" text :disabled="image.usageCount > 0" :title="image.usageCount > 0 ? '此圖片仍被廣告案件使用，無法刪除。' : '刪除廣告照片'" @click="openDelete(image)" /></footer></div>
      </article>
    </div>

    <Dialog v-model:visible="uploadVisible" modal header="新增廣告照片" :style="{ width: 'min(38rem, calc(100vw - 2rem))' }" @hide="resetUpload">
      <form class="photo-form" @submit.prevent="uploadImage"><div class="file-field"><span id="advertisement-photo-file-label">圖片 *</span><Button type="button" :label="upload.image ? '更換圖片' : '選擇圖片'" icon="pi pi-image" outlined aria-describedby="advertisement-photo-file-help" @click="fileInput?.click()" /><input id="advertisement-photo-file" ref="fileInput" class="visually-hidden-file" type="file" accept="image/jpeg,image/png,image/webp" required aria-labelledby="advertisement-photo-file-label" aria-describedby="advertisement-photo-file-help" @change="selectFile"><small id="advertisement-photo-file-help">單張 JPEG、PNG 或 WebP，最大 5 MB。</small></div><img v-if="previewUrl" class="upload-preview" :src="previewUrl" :alt="upload.altText || upload.name || '待上傳圖片預覽'"><label for="advertisement-photo-name">圖片名稱 *<InputText id="advertisement-photo-name" v-model="upload.name" maxlength="120" required /></label><label for="advertisement-photo-alt">ALT 文字 *<InputText id="advertisement-photo-alt" v-model="upload.altText" maxlength="300" required /></label><Message v-if="operationError" severity="error" :closable="false" role="alert">{{ operationError }}</Message><footer><Button type="button" label="取消" text :disabled="mutating" @click="uploadVisible = false" /><Button type="submit" label="確認上傳" :loading="mutating" :disabled="mutating || !uploadReady" /></footer></form>
    </Dialog>

    <Dialog v-model:visible="editVisible" modal header="編輯廣告照片資料" :style="{ width: 'min(34rem, calc(100vw - 2rem))' }" @hide="operationError = ''"><form class="photo-form" @submit.prevent="saveMetadata"><label for="advertisement-edit-name">圖片名稱 *<InputText id="advertisement-edit-name" v-model="edit.name" maxlength="120" required /></label><label for="advertisement-edit-alt">ALT 文字 *<InputText id="advertisement-edit-alt" v-model="edit.altText" maxlength="300" required /></label><Message v-if="operationError" severity="error" :closable="false" role="alert">{{ operationError }}</Message><footer><Button type="button" label="取消" text :disabled="mutating" @click="editVisible = false" /><Button type="submit" label="儲存" :loading="mutating" :disabled="mutating || !edit.name.trim() || !edit.altText.trim()" /></footer></form></Dialog>
    <Dialog v-model:visible="deleteVisible" modal header="刪除廣告照片" :style="{ width: 'min(30rem, calc(100vw - 2rem))' }" @hide="operationError = ''"><div class="delete-copy"><p>確定要刪除「{{ selected?.name }}」嗎？</p><p>刪除後無法復原。</p><Message v-if="operationError" severity="error" :closable="false" role="alert">{{ operationError }}</Message></div><template #footer><Button label="取消" text :disabled="mutating" @click="deleteVisible = false" /><Button label="確認刪除" severity="danger" :loading="mutating" @click="deleteImage" /></template></Dialog>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.advertisement-photos{display:grid;gap:$kqc-spacing-lg;color:var(--text-main)}.page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:$kqc-spacing-md}.page-header h1{margin:.2rem 0;font-size:1.75rem}.page-header p{margin:0;color:var(--text-muted)}.page-header .eyebrow{color:var(--accent-active);font-size:$kqc-type-label;font-weight:800;letter-spacing:.09em}.page-state,.empty-state{display:grid;min-height:16rem;place-content:center;justify-items:center;gap:$kqc-spacing-sm;border:1px solid var(--border-grey);border-radius:$kqc-radius-lg;background:var(--bg-card);text-align:center}.empty-state .pi{color:var(--accent);font-size:2.25rem}.empty-state h2,.empty-state p{margin:0}.empty-state p{color:var(--text-muted)}.photo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:$kqc-spacing-lg}.photo-card{min-width:0;overflow:hidden;border:1px solid var(--border-grey);border-radius:$kqc-radius-lg;background:var(--bg-card);box-shadow:var(--shadow-sm)}.photo-preview{position:relative;aspect-ratio:16/9;background:var(--bg-main)}.photo-preview img{position:relative;z-index:1;display:block;width:100%;height:100%;object-fit:cover}.preview-fallback{position:absolute;inset:0;display:grid;place-items:center;color:var(--text-muted)}.photo-body{display:grid;gap:$kqc-spacing-sm;padding:$kqc-spacing-md}.photo-body h2,.photo-body p{margin:0}.photo-body h2{font-size:1.05rem;overflow-wrap:anywhere}.alt-text{min-height:2.8em;color:var(--text-muted);line-height:1.4}.photo-body dl{display:grid;gap:.35rem;margin:0}.photo-body dl div{display:flex;justify-content:space-between;gap:$kqc-spacing-sm}.photo-body dt{color:var(--text-muted);font-size:$kqc-type-metadata}.photo-body dd{margin:0;font-size:$kqc-type-metadata;text-align:right}.usage-badge{justify-self:start;padding:.28rem .55rem;border-radius:999px;background:var(--bg-main);color:var(--text-muted);font-size:$kqc-type-metadata;font-weight:700}.usage-badge--active{background:color-mix(in srgb,var(--accent-active) 16%,var(--bg-main));color:var(--accent-active)}.photo-body footer,.photo-form footer{display:flex;justify-content:flex-end;gap:$kqc-spacing-sm}.photo-form,.photo-form label,.file-field,.delete-copy{display:grid;gap:$kqc-spacing-sm}.visually-hidden-file{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.upload-preview{width:100%;aspect-ratio:16/9;border-radius:$kqc-radius-md;object-fit:cover;background:var(--bg-main)}.photo-form small{color:var(--text-muted)}button:focus-visible,input:focus-visible{outline:2px solid var(--accent-active);outline-offset:2px}@media(max-width:960px){.photo-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.page-header{align-items:stretch;flex-direction:column}.photo-grid{grid-template-columns:1fr}.photo-body footer,.photo-form footer{flex-direction:column-reverse}.photo-body footer :deep(button),.photo-form footer :deep(button){width:100%}}
</style>
