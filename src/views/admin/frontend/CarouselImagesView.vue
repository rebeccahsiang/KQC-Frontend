<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import { HOMEPAGE_CAROUSEL_MAX_BYTES, adminHomepageCarouselApi, homepageCarouselImageUrl, type AdminHomepageCarouselImage } from '@/api/homepageCarousel'

const images = ref<AdminHomepageCarouselImage[]>([]); const loading = ref(false); const errorMessage = ref(''); const feedback = ref('')
const uploadVisible = ref(false); const editVisible = ref(false); const mutating = ref(false); const deletingId = ref(''); const fileInput = ref<HTMLInputElement | null>(null)
const upload = reactive<{ image: File | null; name: string; altText: string }>({ image: null, name: '', altText: '' })
const edit = reactive({ id: '', name: '', altText: '', enabled: true, sortOrder: 0 })
let requestEpoch = 0

// D2G-B — Carousel Image Admin Management / Route / Stale Response Guard.
const loadImages = async () => { const epoch = ++requestEpoch; loading.value = true; errorMessage.value = ''; try { const response = await adminHomepageCarouselApi.list(); if (epoch === requestEpoch) images.value = response.data.images } catch { if (epoch === requestEpoch) errorMessage.value = '輪播圖片載入失敗，請稍後再試。' } finally { if (epoch === requestEpoch) loading.value = false } }
const resetUpload = () => { upload.image = null; upload.name = ''; upload.altText = ''; if (fileInput.value) fileInput.value.value = '' }
const selectFile = (event: Event) => { const input = event.target as HTMLInputElement; const file = input.files?.[0] || null; errorMessage.value = ''; upload.image = null; if (!file) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { errorMessage.value = '僅支援 JPEG、PNG、WebP 圖片。'; input.value = ''; return } if (file.size > HOMEPAGE_CAROUSEL_MAX_BYTES) { errorMessage.value = '圖片大小不可超過 5 MB。'; input.value = ''; return } upload.image = file }

// D2G-B — Carousel Image Upload / Backend creates enabled and sort defaults.
const uploadImage = async () => { if (mutating.value || !upload.image || !upload.name.trim() || !upload.altText.trim()) return; mutating.value = true; errorMessage.value = ''; try { await adminHomepageCarouselApi.upload(upload.image, upload.name.trim(), upload.altText.trim()); uploadVisible.value = false; resetUpload(); feedback.value = '輪播圖片已新增。'; await loadImages() } catch { errorMessage.value = '輪播圖片新增失敗，請確認格式與內容後再試。' } finally { mutating.value = false } }
const openEdit = (image: AdminHomepageCarouselImage) => { Object.assign(edit, { id: image.id, name: image.name, altText: image.altText, enabled: image.enabled, sortOrder: image.sortOrder }); editVisible.value = true }

// D2G-B — Carousel Image Enabled State / Ordering are PATCH-owned Backend values.
const saveEdit = async () => { if (mutating.value || !edit.name.trim() || !edit.altText.trim() || !Number.isInteger(edit.sortOrder) || edit.sortOrder < 0) return; mutating.value = true; errorMessage.value = ''; try { await adminHomepageCarouselApi.update(edit.id, { name: edit.name.trim(), altText: edit.altText.trim(), enabled: edit.enabled, sortOrder: edit.sortOrder }); editVisible.value = false; feedback.value = '輪播圖片設定已更新。'; await loadImages() } catch { errorMessage.value = '輪播圖片更新失敗，請稍後再試。' } finally { mutating.value = false } }

// D2G-B — Carousel Image Delete / no optimistic removal before Backend confirmation.
const deleteImage = async (image: AdminHomepageCarouselImage) => { if (deletingId.value || mutating.value || !window.confirm(`確定要永久刪除「${image.name}」輪播圖片嗎？刪除後無法復原。`)) return; deletingId.value = image.id; errorMessage.value = ''; try { await adminHomepageCarouselApi.remove(image.id); feedback.value = '輪播圖片已刪除。'; await loadImages() } catch { errorMessage.value = '輪播圖片刪除失敗，請稍後再試。' } finally { deletingId.value = '' } }
const formatDate = (value: string) => new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium' }).format(new Date(value))
onMounted(loadImages)
</script>

<template>
  <section class="carousel-admin">
    <header><div><p>Frontend Management</p><h1>輪播圖片</h1><small>管理首頁輪播圖片、顯示狀態與排列順序。</small></div><Button label="新增輪播圖片" @click="uploadVisible = true" /></header>
    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }} <button type="button" @click="loadImages">重試</button></Message>
    <Message v-if="feedback" severity="success" :closable="false" role="status">{{ feedback }}</Message>
    <p v-if="loading" role="status">正在載入輪播圖片…</p>
    <div v-else-if="!images.length" class="carousel-empty"><strong>目前尚無輪播圖片</strong><p>新增圖片後，即可於首頁輪播區顯示。</p><Button label="新增輪播圖片" @click="uploadVisible = true" /></div>
    <div v-else class="carousel-grid">
      <article v-for="image in images" :key="image.id"><img :src="homepageCarouselImageUrl(image.path)" :alt="image.altText"><div><h2>{{ image.name }}</h2><p>{{ image.altText }}</p><dl><div><dt>上傳日期</dt><dd>{{ formatDate(image.createdAt) }}</dd></div><div><dt>狀態</dt><dd>{{ image.enabled ? '啟用' : '停用' }}</dd></div><div><dt>顯示順序</dt><dd>{{ image.sortOrder }}</dd></div></dl><footer><Button label="編輯" outlined @click="openEdit(image)" /><Button label="刪除" severity="danger" text :loading="deletingId === image.id" @click="deleteImage(image)" /></footer></div></article>
    </div>
    <Dialog v-model:visible="uploadVisible" modal header="新增輪播圖片" :style="{ width: 'min(36rem, calc(100vw - 2rem))' }" @hide="resetUpload"><form class="carousel-form" @submit.prevent="uploadImage"><div class="carousel-file-field"><span id="carousel-file-label">圖片</span><!-- D2G-B-R2 — Carousel Image Picker UX keeps the real input behind an accessible explicit selection button. --><div class="carousel-file-picker"><Button type="button" :label="upload.image ? '更換圖片' : '選擇圖片'" icon="pi pi-image" outlined aria-describedby="carousel-file-name carousel-file-help" @click="fileInput?.click()" /><span id="carousel-file-name" class="carousel-file-name">{{ upload.image?.name || '尚未選擇檔案' }}</span></div><input id="carousel-file" ref="fileInput" class="carousel-file-input" type="file" accept="image/jpeg,image/png,image/webp" required aria-labelledby="carousel-file-label" aria-describedby="carousel-file-name carousel-file-help" @change="selectFile"><small id="carousel-file-help">支援 JPEG、PNG、WebP，最大 5 MB；不支援 SVG。</small></div><label for="carousel-name">圖片名稱<InputText id="carousel-name" v-model="upload.name" maxlength="120" required /></label><label for="carousel-alt">ALT 文字<InputText id="carousel-alt" v-model="upload.altText" maxlength="300" required /></label><small>新圖片由系統預設為啟用、顯示順序 0，建立後可編輯。</small><footer><Button type="button" label="取消" text @click="uploadVisible = false" /><Button type="submit" label="新增" :loading="mutating" :disabled="mutating || !upload.image || !upload.name.trim() || !upload.altText.trim()" /></footer></form></Dialog>
    <!-- D2G-B-R1 — Numeric Sort Order Input preserves numeric Backend authority through PrimeVue's typed model. -->
    <Dialog v-model:visible="editVisible" modal header="編輯輪播圖片" :style="{ width: 'min(34rem, calc(100vw - 2rem))' }"><form class="carousel-form" @submit.prevent="saveEdit"><label>圖片名稱<InputText v-model="edit.name" maxlength="120" required /></label><label>ALT 文字<InputText v-model="edit.altText" maxlength="300" required /></label><label>顯示順序<InputNumber v-model="edit.sortOrder" :min="0" :max="100000" :step="1" :min-fraction-digits="0" :max-fraction-digits="0" required /><small>數字越小越前面。</small></label><label class="enabled-field"><Checkbox v-model="edit.enabled" binary />啟用</label><footer><Button type="button" label="取消" text @click="editVisible = false" /><Button type="submit" label="儲存" :loading="mutating" :disabled="mutating" /></footer></form></Dialog>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.carousel-admin { display: grid; gap: $kqc-spacing-lg; }.carousel-admin > header,.carousel-form footer,.carousel-grid article footer { display:flex;align-items:center;justify-content:space-between;gap:$kqc-spacing-sm }.carousel-admin h1,.carousel-grid h2 { margin:0;color:var(--text-main) }.carousel-admin header p { margin:0 0 $kqc-spacing-xs;color:var(--accent-active);font-size:$kqc-type-label;font-weight:700 }.carousel-admin header small,.carousel-grid p,.carousel-form small { color:var(--text-muted) }.carousel-grid { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:$kqc-spacing-lg }.carousel-grid article { overflow:hidden;border:1px solid var(--border-grey);border-radius:$kqc-radius-lg;background:var(--bg-card) }.carousel-grid article>img { width:100%;aspect-ratio:16/9;display:block;object-fit:cover }.carousel-grid article>div { display:grid;gap:$kqc-spacing-sm;padding:$kqc-spacing-md }.carousel-grid p { margin:0 }.carousel-grid dl { display:grid;gap:$kqc-spacing-xs;margin:0 }.carousel-grid dl div { display:flex;justify-content:space-between;gap:$kqc-spacing-sm }.carousel-grid dd { margin:0 }.carousel-empty { display:grid;min-height:18rem;place-items:center;align-content:center;gap:$kqc-spacing-sm;border:1px dashed var(--border-grey);border-radius:$kqc-radius-lg;text-align:center }.carousel-form,.carousel-form label { display:grid;gap:$kqc-spacing-sm }.carousel-form footer { justify-content:flex-end }.carousel-form .enabled-field { display:flex;align-items:center }.p-message button { border:0;background:transparent;color:inherit;text-decoration:underline;cursor:pointer }
.carousel-file-field { display:grid;gap:$kqc-spacing-sm }.carousel-file-picker { display:flex;align-items:center;gap:$kqc-spacing-sm;min-width:0 }.carousel-file-name { min-width:0;overflow:hidden;color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap }.carousel-file-input { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0 }
@media(max-width:900px){.carousel-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.carousel-admin>header{align-items:stretch;flex-direction:column}.carousel-grid{grid-template-columns:1fr}.carousel-file-picker{align-items:stretch;flex-direction:column}}
</style>
