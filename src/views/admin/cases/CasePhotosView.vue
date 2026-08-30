<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import {
  PRODUCT_IMAGE_MAX_BYTES, adminProductImagesApi, productImageUrl,
  type ProductBusinessCategory, type ProductImageRepresentativeSlot, type ProductTransactionType,
} from '@/api/adminProductImages'

const CATEGORY_OPTIONS = Object.freeze([
  { code: 'CA', label: '甲種小客車' }, { code: 'CB', label: '乙種小客車' },
  { code: 'TX', label: '計程車' }, { code: 'LT', label: '小貨車' },
  { code: 'MV', label: '搬家公司' }, { code: 'FT', label: '汽車貨運' },
  { code: 'CT', label: '貨櫃貨運' },
] as const)
const TRANSACTION_OPTIONS = Object.freeze([
  { code: 'BUY', label: '買', title: '買方代表圖片' },
  { code: 'SELL', label: '賣', title: '賣方代表圖片' },
] as const)

const slots = ref<ProductImageRepresentativeSlot[]>([])
const loading = ref(false)
const loadError = ref('')
const dialogVisible = ref(false)
const uploadError = ref('')
const successMessage = ref('')
const uploadingSlotKey = ref('')
const selectedSlot = ref<{ businessCategory: ProductBusinessCategory; transactionType: ProductTransactionType } | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const form = reactive<{ image: File | null; name: string; altText: string }>({ image: null, name: '', altText: '' })
let loadEpoch = 0

const slotKey = (category: ProductBusinessCategory, transaction: ProductTransactionType) => `${category}:${transaction}`
const slotMap = computed(() => new Map(slots.value.map((slot) => [slotKey(slot.businessCategory, slot.transactionType), slot])))
const slotFor = (category: ProductBusinessCategory, transaction: ProductTransactionType) =>
  slotMap.value.get(slotKey(category, transaction)) || { businessCategory: category, transactionType: transaction, productImage: null, updatedAt: null }
const formatBytes = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.ceil(bytes / 1024)} KB`
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
const backendMessage = (error: unknown, fallback: string) => isAxiosError(error)
  ? (error.response?.data as { error?: { message?: string } })?.error?.message || fallback : fallback

// PRODUCT-IMG-A2 — Representative Backend Authority / canonical list replaces local state.
const loadRepresentatives = async () => {
  const epoch = ++loadEpoch
  loading.value = true
  loadError.value = ''
  try {
    const response = await adminProductImagesApi.getProductImageRepresentatives()
    if (epoch === loadEpoch) slots.value = response.data.slots
  } catch (error) {
    if (epoch === loadEpoch) {
      slots.value = []
      loadError.value = backendMessage(error, '商品代表圖片暫時無法載入，請稍後再試。')
    }
  } finally { if (epoch === loadEpoch) loading.value = false }
}

const resetUpload = () => {
  form.image = null; form.name = ''; form.altText = ''; uploadError.value = ''; selectedSlot.value = null
  if (fileInput.value) fileInput.value.value = ''
}
const openUpload = (businessCategory: ProductBusinessCategory, transactionType: ProductTransactionType) => {
  resetUpload(); selectedSlot.value = { businessCategory, transactionType }; dialogVisible.value = true
}
const selectFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  uploadError.value = ''; form.image = null
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    uploadError.value = '請選擇 JPEG、PNG 或 WebP 圖片。'; input.value = ''; return
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    uploadError.value = '圖片大小不可超過 5 MB。'; input.value = ''; return
  }
  form.image = file
}

// PRODUCT-IMG-A2 — Representative Upload / PRODUCT-IMG-A2 — Slot Upload State.
const uploadRepresentative = async () => {
  const target = selectedSlot.value
  if (!target || !form.image || !form.name.trim() || !form.altText.trim()) {
    uploadError.value = '請完整填寫圖片、圖片名稱與替代文字 ALT。'; return
  }
  const key = slotKey(target.businessCategory, target.transactionType)
  if (uploadingSlotKey.value) return
  uploadingSlotKey.value = key; uploadError.value = ''; successMessage.value = ''
  try {
    const response = await adminProductImagesApi.uploadProductImageRepresentative(target.businessCategory, target.transactionType, {
      image: form.image, name: form.name.trim(), altText: form.altText.trim(),
    })
    const authoritativeSlot = response.data.slot
    const exists = slots.value.some((slot) => slotKey(slot.businessCategory, slot.transactionType) === key)
    slots.value = exists
      ? slots.value.map((slot) => slotKey(slot.businessCategory, slot.transactionType) === key ? authoritativeSlot : slot)
      : [...slots.value, authoritativeSlot]
    successMessage.value = `${target.businessCategory} ${target.transactionType} 代表圖片已更新。`
    dialogVisible.value = false; resetUpload()
  } catch (error) {
    uploadError.value = backendMessage(error, '代表圖片上傳失敗，請保留資料後重試。')
  } finally { uploadingSlotKey.value = '' }
}

onMounted(loadRepresentatives)
</script>

<template>
  <!-- PRODUCT-IMG-A2 — Product Image Representative UI -->
  <main class="product-images-view">
    <header class="page-heading">
      <div><p class="eyebrow">商品管理</p><h1>商品照片</h1><p>管理七大業別買／賣商品的系統代表圖片。商品案件將依業別與交易方向自動套用，不需逐案選圖。</p></div>
      <Button label="重新載入" icon="pi pi-refresh" severity="secondary" :loading="loading" @click="loadRepresentatives" />
    </header>

    <!-- PRODUCT-IMG-A2 — Product Automation Explanation -->
    <aside class="automation-note">商品案件將依業別與買／賣方向自動使用此處設定的代表圖片；更換後，同類商品會自動使用新圖。</aside>
    <Message v-if="successMessage" severity="success" :closable="true" @close="successMessage = ''">{{ successMessage }}</Message>
    <div v-if="loading" class="page-state" role="status" aria-live="polite">正在載入商品代表圖片…</div>
    <div v-else-if="loadError" class="page-state page-state--error" role="alert"><p>{{ loadError }}</p><Button label="重新載入" @click="loadRepresentatives" /></div>

    <!-- PRODUCT-IMG-A2 — Canonical 14 Slot Rendering -->
    <div v-else class="category-list">
      <section v-for="category in CATEGORY_OPTIONS" :key="category.code" class="category-group">
        <header><div><h2>{{ category.label }}</h2><span>{{ category.code }}</span></div></header>
        <div class="slot-grid">
          <article v-for="transaction in TRANSACTION_OPTIONS" :key="transaction.code" class="slot-card">
            <div class="slot-heading"><div><span class="transaction-badge">{{ transaction.code }}</span><strong>{{ transaction.title }}</strong></div><span class="category-code">{{ category.code }} · {{ transaction.label }}</span></div>
            <template v-if="slotFor(category.code, transaction.code).productImage">
              <img class="slot-preview" :src="productImageUrl(slotFor(category.code, transaction.code).productImage!.imageUrl)" :alt="slotFor(category.code, transaction.code).productImage!.altText" loading="lazy" />
              <dl class="slot-metadata">
                <div><dt>圖片名稱</dt><dd>{{ slotFor(category.code, transaction.code).productImage!.name }}</dd></div>
                <div><dt>替代文字 ALT</dt><dd>{{ slotFor(category.code, transaction.code).productImage!.altText }}</dd></div>
                <div><dt>原始檔名</dt><dd>{{ slotFor(category.code, transaction.code).productImage!.originalName }}</dd></div>
                <div><dt>檔案類型</dt><dd>{{ slotFor(category.code, transaction.code).productImage!.mimeType }}</dd></div>
                <div><dt>檔案大小</dt><dd>{{ formatBytes(slotFor(category.code, transaction.code).productImage!.fileSize) }}</dd></div>
                <div><dt>更新時間</dt><dd>{{ formatDate(slotFor(category.code, transaction.code).updatedAt) }}</dd></div>
              </dl>
            </template>
            <div v-else class="empty-slot"><span aria-hidden="true">＋</span><p>尚未設定代表圖片</p></div>
            <Button :label="slotFor(category.code, transaction.code).productImage ? '更換代表圖片' : '設定代表圖片'" :aria-label="`${category.label}${transaction.title}：${slotFor(category.code, transaction.code).productImage ? '更換代表圖片' : '設定代表圖片'}`" :loading="uploadingSlotKey === slotKey(category.code, transaction.code)" :disabled="Boolean(uploadingSlotKey)" @click="openUpload(category.code, transaction.code)" />
          </article>
        </div>
      </section>
    </div>

    <!-- PRODUCT-IMG-A2 — Representative Accessibility -->
    <Dialog v-model:visible="dialogVisible" modal :header="selectedSlot ? `${selectedSlot.businessCategory} ${selectedSlot.transactionType} 代表圖片` : '代表圖片'" class="representative-dialog" @hide="resetUpload">
      <form class="upload-form" @submit.prevent="uploadRepresentative">
        <label>圖片檔案 <span aria-hidden="true">*</span><input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" required @change="selectFile" /></label>
        <small>支援 JPEG、PNG、WebP，檔案上限 5 MB。</small>
        <label>圖片名稱 <span aria-hidden="true">*</span><InputText v-model="form.name" required maxlength="120" /></label>
        <label>替代文字 ALT <span aria-hidden="true">*</span><InputText v-model="form.altText" required maxlength="300" /></label>
        <small>ALT 用於圖片無法顯示及無障礙閱讀。</small>
        <Message v-if="uploadError" severity="error" :closable="false" role="alert" aria-live="assertive">{{ uploadError }}</Message>
        <div class="dialog-actions"><Button type="button" label="取消" severity="secondary" :disabled="Boolean(uploadingSlotKey)" @click="dialogVisible = false" /><Button type="submit" label="上傳並套用" :loading="Boolean(uploadingSlotKey)" :disabled="Boolean(uploadingSlotKey)" /></div>
      </form>
    </Dialog>
  </main>
</template>

<style scoped>
.product-images-view{display:grid;gap:1.25rem;color:var(--text-main)}.page-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}.page-heading h1{margin:.15rem 0 .4rem;font-size:1.75rem}.page-heading p{margin:0;color:var(--text-muted)}.eyebrow{color:var(--accent)!important;font-size:.78rem;font-weight:700;letter-spacing:.08em}.automation-note,.page-state{padding:1rem 1.15rem;border:1px solid var(--border-grey);border-radius:.75rem;background:var(--bg-card);color:var(--text-muted)}.page-state{text-align:center}.page-state--error{display:grid;justify-items:center;gap:.75rem}.category-list{display:grid;gap:1rem}.category-group{padding:1rem;border:1px solid var(--border-grey);border-radius:1rem;background:var(--bg-card);box-shadow:var(--shadow-sm)}.category-group>header{margin-bottom:.85rem}.category-group>header div{display:flex;align-items:baseline;gap:.55rem}.category-group h2{margin:0;font-size:1.1rem}.category-group header span{color:var(--text-muted);font-size:.78rem;font-weight:700}.slot-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.slot-card{display:grid;align-content:start;gap:.85rem;min-width:0;padding:1rem;border:1px solid var(--border-grey);border-radius:.8rem;background:var(--bg-main)}.slot-heading{display:flex;align-items:center;justify-content:space-between;gap:.75rem}.slot-heading>div{display:flex;align-items:center;gap:.55rem}.transaction-badge{padding:.25rem .5rem;border-radius:999px;background:var(--accent);color:#172033;font-size:.7rem;font-weight:800}.category-code{color:var(--text-muted);font-size:.75rem}.slot-preview{width:100%;aspect-ratio:16/9;border-radius:.65rem;object-fit:cover;background:var(--bg-hover)}.slot-metadata{display:grid;gap:.45rem;margin:0}.slot-metadata div{display:grid;grid-template-columns:6.5rem minmax(0,1fr);gap:.6rem}.slot-metadata dt{color:var(--text-muted);font-size:.78rem}.slot-metadata dd{min-width:0;margin:0;overflow-wrap:anywhere;font-size:.82rem}.empty-slot{display:grid;min-height:12rem;place-content:center;justify-items:center;border:1px dashed var(--border-grey);border-radius:.65rem;color:var(--text-muted)}.empty-slot span{font-size:2rem}.empty-slot p{margin:.35rem 0 0}.upload-form{display:grid;gap:.8rem;min-width:min(30rem,70vw)}.upload-form label{display:grid;gap:.4rem;font-weight:600}.upload-form input[type=file]{width:100%;padding:.7rem;border:1px solid var(--border-grey);border-radius:.5rem;background:var(--bg-main);color:var(--text-main)}.upload-form small{color:var(--text-muted)}.dialog-actions{display:flex;justify-content:flex-end;gap:.65rem;margin-top:.35rem}button:focus-visible,input:focus-visible{outline:2px solid var(--accent-active);outline-offset:2px}@media(max-width:768px){.page-heading{align-items:stretch;flex-direction:column}.slot-grid{grid-template-columns:1fr}.slot-metadata div{grid-template-columns:1fr;gap:.1rem}.upload-form{min-width:0}.dialog-actions{flex-direction:column-reverse}.dialog-actions :deep(button){width:100%}}
</style>
