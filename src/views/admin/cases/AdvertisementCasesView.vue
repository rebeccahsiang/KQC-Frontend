<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import AdvertisementPreview from '@/components/admin/advertisements/AdvertisementPreview.vue'
import { adminAdvertisementImagesApi, advertisementImageUrl, type AdvertisementImageItem } from '@/api/adminAdvertisementImages'
import { adminAdvertisementsApi, type AdminAdvertisement, type AdvertisementContentInput, type AdvertisementLayoutStyle, type AdvertisementStatus, type AdvertisementTextTone, type AdvertisementTypographyStyle } from '@/api/adminAdvertisements'
import { hasCapability } from '@/config/capabilities'
import { useAuthStore } from '@/stores/authStore'

const toast = useToast()
const router = useRouter()
const authStore = useAuthStore()
const advertisements = ref<AdminAdvertisement[]>([])
const images = ref<AdvertisementImageItem[]>([])
const loading = ref(false)
const mutating = ref(false)
const loadError = ref('')
const operationError = ref('')
const statusFilter = ref<'ALL' | AdvertisementStatus>('ALL')
const editorVisible = ref(false)
const pickerVisible = ref(false)
const confirmationVisible = ref(false)
const returnVisible = ref(false)
const editing = ref<AdminAdvertisement | null>(null)
const pendingAction = ref<{ item: AdminAdvertisement; action: 'submit' | 'approve' | 'unpublish' | 'republish' } | null>(null)
const returnTarget = ref<AdminAdvertisement | null>(null)
const returnReason = ref('')

interface AdvertisementOption<T extends string> { label: string; value: T }
const layoutOptions: AdvertisementOption<AdvertisementLayoutStyle>[] = [
  { label: '標準圖文', value: 'STANDARD' }, { label: '左側疊字', value: 'OVERLAY_LEFT' }, { label: '置中疊字', value: 'OVERLAY_CENTER' }
]
const typographyOptions: AdvertisementOption<AdvertisementTypographyStyle>[] = [
  { label: '品牌標準', value: 'BRAND' }, { label: '現代粗體', value: 'BOLD' }, { label: '優雅風格', value: 'ELEGANT' }
]
const toneOptions: AdvertisementOption<AdvertisementTextTone>[] = [
  { label: '白色', value: 'WHITE' }, { label: '深色', value: 'DARK' }, { label: '品牌金', value: 'BRAND_GOLD' },
  { label: '品牌藍', value: 'BRAND_BLUE' }, { label: '品牌綠', value: 'BRAND_GREEN' }
]
const statusOptions = [
  { label: '全部狀態', value: 'ALL' }, { label: '草稿', value: 'DRAFT' }, { label: '待審核', value: 'PENDING_APPROVAL' },
  { label: '退回修改', value: 'RETURNED' }, { label: '已發布', value: 'PUBLISHED' }, { label: '已下架', value: 'UNPUBLISHED' }
]
const statusLabels: Record<AdvertisementStatus, string> = { DRAFT: '草稿', PENDING_APPROVAL: '待審核', RETURNED: '退回修改', PUBLISHED: '已發布', UNPUBLISHED: '已下架' }
const destinationOptions = [
  { label: '商品櫥窗', value: '/products' }, { label: '產業洞察', value: '/insights' }, { label: '聯絡我們', value: '/contact' }
]
const blankForm = (): AdvertisementContentInput => ({
  productImageId: '', title: '', shortDescription: '', ctaLabel: '', ctaDestination: '/products', sortOrder: 0,
  layoutStyle: 'STANDARD', typographyStyle: 'BRAND', textTone: 'DARK'
})
const form = reactive<AdvertisementContentInput>(blankForm())
const isAdmin = computed(() => hasCapability(authStore.user, 'ADMIN'))
const currentUserId = computed(() => authStore.user?._id || '')
const filteredAdvertisements = computed(() => statusFilter.value === 'ALL' ? advertisements.value : advertisements.value.filter((item) => item.status === statusFilter.value))
const selectedImage = computed(() => images.value.find((image) => image.id === form.productImageId) || null)
const imageFor = (item: AdminAdvertisement) => images.value.find((image) => image.id === item.productImageId) || null
const canEdit = (item: AdminAdvertisement) => item.createdBy === currentUserId.value && ['DRAFT', 'RETURNED'].includes(item.status)
const canSubmit = canEdit
const canReview = (item: AdminAdvertisement) => isAdmin.value && item.status === 'PENDING_APPROVAL'
const canUnpublish = (item: AdminAdvertisement) => isAdmin.value && item.status === 'PUBLISHED'
const canRepublish = (item: AdminAdvertisement) => isAdmin.value && item.status === 'UNPUBLISHED'
const isSelfConfirmation = (item: AdminAdvertisement) => item.createdBy === currentUserId.value

const errorMessage = (error: unknown, fallback: string) => isAxiosError(error)
  ? ((error.response?.data as { error?: { message?: string } } | undefined)?.error?.message || fallback) : fallback

const loadAll = async () => {
  loading.value = true; loadError.value = ''
  try {
    const [advertisementResponse, imageResponse] = await Promise.all([adminAdvertisementsApi.list(), adminAdvertisementImagesApi.list()])
    advertisements.value = advertisementResponse.data
    images.value = imageResponse.data.images
  } catch (error) { loadError.value = errorMessage(error, '無法載入廣告案件，請稍後重試。') }
  finally { loading.value = false }
}

/* PRODUCT-ADVERTISEMENT-R2B — Advertisement Create/Edit / content changes remain separate from lifecycle authority. */
const openCreate = () => { editing.value = null; Object.assign(form, blankForm()); operationError.value = ''; editorVisible.value = true }
const openEdit = (item: AdminAdvertisement) => {
  editing.value = item
  Object.assign(form, { productImageId: item.productImageId, title: item.title, shortDescription: item.shortDescription, ctaLabel: item.ctaLabel, ctaDestination: item.ctaDestination, sortOrder: item.sortOrder, layoutStyle: item.layoutStyle, typographyStyle: item.typographyStyle, textTone: item.textTone })
  operationError.value = ''; editorVisible.value = true
}
const save = async () => {
  if (mutating.value) return
  operationError.value = ''
  if (!form.productImageId) { operationError.value = '請選擇廣告照片。'; return }
  mutating.value = true
  try {
    if (editing.value) await adminAdvertisementsApi.update(editing.value.id, { ...form })
    else await adminAdvertisementsApi.create({ ...form })
    editorVisible.value = false; await loadAll(); toast.add({ severity: 'success', summary: editing.value ? '廣告案件已更新' : '廣告草稿已建立', life: 2600 })
  } catch (error) { operationError.value = errorMessage(error, '無法儲存廣告案件。') }
  finally { mutating.value = false }
}

/* PRODUCT-ADVERTISEMENT-R2B — Advertisement Workflow Actions / confirmation precedes every Backend transition. */
const requestAction = (item: AdminAdvertisement, action: 'submit' | 'approve' | 'unpublish' | 'republish') => { pendingAction.value = { item, action }; confirmationVisible.value = true }
const actionLabel = computed(() => {
  if (!pendingAction.value) return ''
  if (pendingAction.value.action === 'submit') return '提交審核'
  if (pendingAction.value.action === 'approve') return isSelfConfirmation(pendingAction.value.item) ? '確認自行發布' : '通過並發布'
  return pendingAction.value.action === 'unpublish' ? '下架廣告' : '重新發布'
})
const runAction = async () => {
  if (!pendingAction.value || mutating.value) return
  const { item, action } = pendingAction.value; mutating.value = true; operationError.value = ''
  try {
    if (action === 'submit') await adminAdvertisementsApi.submit(item.id)
    if (action === 'approve') await adminAdvertisementsApi.approve(item.id)
    if (action === 'unpublish') await adminAdvertisementsApi.unpublish(item.id)
    if (action === 'republish') await adminAdvertisementsApi.republish(item.id)
    confirmationVisible.value = false; pendingAction.value = null; await loadAll(); toast.add({ severity: 'success', summary: '廣告狀態已更新', life: 2600 })
  } catch (error) { operationError.value = errorMessage(error, '無法更新廣告狀態。'); confirmationVisible.value = false }
  finally { mutating.value = false }
}
const openReturn = (item: AdminAdvertisement) => { returnTarget.value = item; returnReason.value = ''; returnVisible.value = true }
const returnForRevision = async () => {
  if (!returnTarget.value || !returnReason.value.trim() || mutating.value) return
  mutating.value = true
  try { await adminAdvertisementsApi.returnForRevision(returnTarget.value.id, returnReason.value.trim()); returnVisible.value = false; await loadAll(); toast.add({ severity: 'success', summary: '已退回修改', life: 2600 }) }
  catch (error) { operationError.value = errorMessage(error, '無法退回廣告案件。') }
  finally { mutating.value = false }
}

onMounted(loadAll)
</script>

<template>
  <main class="advertisement-admin">
    <header class="page-header">
      <div><p class="eyebrow">ADVERTISEMENT MANAGEMENT</p><h1>廣告案件</h1><p>以圖片、主標題、精簡文案與行動按鈕建立廣告素材，並依正式流程提交與發布。</p></div>
      <Button label="建立廣告" icon="pi pi-plus" @click="openCreate" />
    </header>
    <div class="toolbar"><label>篩選狀態<Select v-model="statusFilter" :options="statusOptions" option-label="label" option-value="value" /></label></div>
    <Message v-if="loadError" severity="error" :closable="false"><span role="alert">{{ loadError }}</span><Button label="重新載入" text @click="loadAll" /></Message>
    <Message v-if="operationError && !editorVisible" severity="error" :closable="false"><span role="alert">{{ operationError }}</span></Message>
    <div v-if="loading" class="state" aria-live="polite">正在載入廣告案件…</div>
    <section v-else-if="filteredAdvertisements.length" class="advertisement-grid" aria-label="廣告案件清單">
      <article v-for="item in filteredAdvertisements" :key="item.id" class="management-card">
        <AdvertisementPreview :image-url="advertisementImageUrl(imageFor(item)?.imageUrl || '')" :image-alt="imageFor(item)?.altText" :title="item.title" :short-description="item.shortDescription" :cta-label="item.ctaLabel" :layout-style="item.layoutStyle" :typography-style="item.typographyStyle" :text-tone="item.textTone" />
        <div class="management-card__meta"><span class="status" :data-status="item.status">{{ statusLabels[item.status] }}</span><span>順序 {{ item.sortOrder }}</span></div>
        <p v-if="item.status === 'RETURNED' && item.returnReason" class="return-reason">退回原因：{{ item.returnReason }}</p>
        <div class="management-card__actions">
          <Button v-if="canEdit(item)" label="編輯" outlined size="small" @click="openEdit(item)" />
          <Button v-if="canSubmit(item)" label="提交審核" size="small" @click="requestAction(item, 'submit')" />
          <template v-if="canReview(item)"><Button label="退回修改" severity="danger" outlined size="small" @click="openReturn(item)" /><Button :label="isSelfConfirmation(item) ? '確認自行發布' : '通過並發布'" size="small" @click="requestAction(item, 'approve')" /></template>
          <Button v-if="canUnpublish(item)" label="下架" outlined size="small" @click="requestAction(item, 'unpublish')" />
          <Button v-if="canRepublish(item)" label="重新發布" size="small" @click="requestAction(item, 'republish')" />
        </div>
      </article>
    </section>
    <section v-else class="state"><Icon icon="lucide:megaphone" /><h2>目前沒有符合條件的廣告案件</h2><p>建立第一則廣告草稿，或切換狀態篩選。</p></section>

    <Dialog v-model:visible="editorVisible" modal :header="editing ? '編輯廣告案件' : '建立廣告案件'" class="advertisement-editor" :style="{ width: 'min(72rem, calc(100vw - 2rem))' }">
      <form class="editor-layout" @submit.prevent="save">
        <div class="editor-form">
          <fieldset><legend>廣告照片</legend><button type="button" class="image-selection" @click="pickerVisible = true"><img v-if="selectedImage" :src="advertisementImageUrl(selectedImage.imageUrl)" :alt="selectedImage.altText || selectedImage.name" /><span v-else><Icon icon="lucide:image-plus" />選擇廣告照片</span></button><small>照片由「廣告照片」管理；此處不重複上傳流程。</small></fieldset>
          <label>廣告標題<InputText v-model="form.title" maxlength="120" required /></label>
          <label>精簡說明<Textarea v-model="form.shortDescription" maxlength="300" rows="3" required /><small>{{ form.shortDescription.length }}/300</small></label>
          <div class="field-row"><label>CTA 按鈕文字<InputText v-model="form.ctaLabel" maxlength="60" required /></label><label>CTA 站內目的地<Select v-model="form.ctaDestination" :options="destinationOptions" option-label="label" option-value="value" required /><small>僅允許 KQC 站內路徑。</small></label></div>
          <div class="field-row"><label>版面樣式<Select v-model="form.layoutStyle" :options="layoutOptions" option-label="label" option-value="value" /></label><label>字體風格<Select v-model="form.typographyStyle" :options="typographyOptions" option-label="label" option-value="value" /></label></div>
          <div class="field-row"><label>文字色調<Select v-model="form.textTone" :options="toneOptions" option-label="label" option-value="value" /></label><label>顯示順序<InputNumber v-model="form.sortOrder" :min="0" :max="100000" :step="1" :min-fraction-digits="0" :max-fraction-digits="0" /></label></div>
          <Message v-if="operationError" severity="error" :closable="false"><span role="alert">{{ operationError }}</span></Message>
          <footer><Button type="button" label="取消" text @click="editorVisible = false" /><Button type="submit" label="儲存草稿" :loading="mutating" :disabled="mutating" /></footer>
        </div>
        <aside class="live-preview"><p>即時預覽</p><AdvertisementPreview :image-url="advertisementImageUrl(selectedImage?.imageUrl || '')" :image-alt="selectedImage?.altText" :title="form.title" :short-description="form.shortDescription" :cta-label="form.ctaLabel" :layout-style="form.layoutStyle" :typography-style="form.typographyStyle" :text-tone="form.textTone" /></aside>
      </form>
    </Dialog>

    <Dialog v-model:visible="pickerVisible" modal header="選擇廣告照片" class="advertisement-picker" :style="{ width: 'min(58rem, calc(100vw - 2rem))' }">
      <!-- PRODUCT-ADVERTISEMENT-R2B — Advertisement Photo Picker / R2A library remains the sole upload authority. -->
      <div v-if="images.length" class="picker-grid"><button v-for="image in images" :key="image.id" type="button" class="picker-card" :aria-pressed="form.productImageId === image.id" @click="form.productImageId = image.id; pickerVisible = false"><img :src="advertisementImageUrl(image.imageUrl)" :alt="image.altText || image.name" /><strong>{{ image.name }}</strong><small>{{ image.altText }}</small><span>{{ image.usageCount ? `使用中（${image.usageCount}）` : '尚未使用' }}</span></button></div>
      <div v-else class="state"><p>尚無可選擇的廣告照片。</p><Button label="前往廣告照片" @click="router.push('/admin/cases/advertisement-photos'); pickerVisible = false" /></div>
    </Dialog>
    <Dialog v-model:visible="confirmationVisible" modal :header="actionLabel" :style="{ width: 'min(30rem, calc(100vw - 2rem))' }"><p v-if="pendingAction?.action === 'approve' && isSelfConfirmation(pendingAction.item)">這是您建立的 ADMIN 廣告。請明確確認後才會發布。</p><p v-else>確認執行「{{ actionLabel }}」？狀態只會在 Backend 成功後更新。</p><template #footer><Button label="取消" text @click="confirmationVisible = false" /><Button :label="actionLabel" :loading="mutating" @click="runAction" /></template></Dialog>
    <Dialog v-model:visible="returnVisible" modal header="退回廣告修改" :style="{ width: 'min(32rem, calc(100vw - 2rem))' }"><label class="return-field">退回原因<Textarea v-model="returnReason" maxlength="500" rows="4" required /></label><template #footer><Button label="取消" text @click="returnVisible = false" /><Button label="確認退回" severity="danger" :disabled="!returnReason.trim()" :loading="mutating" @click="returnForRevision" /></template></Dialog>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.advertisement-admin { display:grid; gap:$kqc-spacing-xl; padding:$kqc-spacing-xl; color:var(--text-main); }
.page-header { display:flex; justify-content:space-between; gap:$kqc-spacing-xl; align-items:flex-start; } .page-header h1,.page-header p { margin:.2rem 0; } .eyebrow { color:var(--accent-active); font-size:$kqc-type-caption; font-weight:800; letter-spacing:.12em; }
.toolbar { display:flex; justify-content:flex-end; } .toolbar label { width:min(15rem,100%); }
label,fieldset { display:grid; gap:$kqc-spacing-xs; } fieldset { min-width:0; margin:0; padding:$kqc-spacing-md; border:1px solid var(--border-grey); border-radius:$kqc-radius-lg; } small { color:var(--text-muted); }
.advertisement-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:$kqc-spacing-xl; }
.management-card { display:grid; min-width:0; align-content:start; gap:$kqc-spacing-md; padding:$kqc-spacing-md; border:1px solid var(--border-grey); border-radius:$kqc-radius-xl; background:var(--bg-card); }
.management-card__meta,.management-card__actions { display:flex; flex-wrap:wrap; align-items:center; gap:$kqc-spacing-sm; } .management-card__meta { justify-content:space-between; color:var(--text-muted); font-size:$kqc-type-metadata; }
.status { padding:.3rem .6rem; border-radius:$kqc-radius-full; background:color-mix(in srgb,var(--accent-active) 13%,transparent); color:var(--text-main); font-weight:750; } .return-reason { margin:0; color:var(--danger); }
.state { display:grid; min-height:14rem; place-items:center; align-content:center; gap:$kqc-spacing-sm; text-align:center; color:var(--text-muted); } .state :deep(svg) { font-size:2rem; }
:global(.advertisement-editor .p-dialog-content),:global(.advertisement-picker .p-dialog-content) { overflow:auto; }
.editor-layout { display:grid; grid-template-columns:minmax(0,55fr) minmax(18rem,45fr); gap:$kqc-spacing-xl; } .editor-form { display:grid; gap:$kqc-spacing-md; } .field-row { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:$kqc-spacing-md; } .editor-form footer { display:flex; justify-content:flex-end; gap:$kqc-spacing-sm; }
.image-selection { display:grid; width:100%; min-height:9rem; place-items:center; overflow:hidden; padding:0; border:1px dashed var(--border-grey); border-radius:$kqc-radius-lg; background:var(--bg-main); color:var(--text-muted); cursor:pointer; } .image-selection img { width:100%; max-height:15rem; object-fit:cover; } .image-selection span { display:flex; align-items:center; gap:$kqc-spacing-sm; }
.live-preview { position:sticky; top:0; align-self:start; display:grid; gap:$kqc-spacing-sm; padding:$kqc-spacing-lg; border-radius:$kqc-radius-xl; background:color-mix(in srgb,var(--accent-active) 6%,var(--bg-main)); } .live-preview>p { margin:0; font-weight:800; }
.picker-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:$kqc-spacing-md; } .picker-card { display:grid; min-width:0; gap:$kqc-spacing-xs; padding:0 0 $kqc-spacing-sm; overflow:hidden; border:1px solid var(--border-grey); border-radius:$kqc-radius-lg; background:var(--bg-card); color:var(--text-main); cursor:pointer; text-align:left; } .picker-card[aria-pressed=true] { border-color:var(--accent-active); box-shadow:0 0 0 3px color-mix(in srgb,var(--accent-active) 25%,transparent); } .picker-card img { width:100%; aspect-ratio:16/9; object-fit:cover; } .picker-card strong,.picker-card small,.picker-card span { margin-inline:$kqc-spacing-sm; } .picker-card span { font-size:$kqc-type-caption; color:var(--text-muted); }
.return-field { display:grid; gap:$kqc-spacing-sm; }
button:focus-visible,.picker-card:focus-visible,.image-selection:focus-visible { outline:3px solid color-mix(in srgb,var(--accent-active) 40%,transparent); outline-offset:2px; }
@media (max-width:1100px) { .advertisement-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .editor-layout { grid-template-columns:1fr; } .live-preview { position:static; } }
@media (max-width:680px) { .advertisement-admin { padding:$kqc-spacing-md; } .page-header { align-items:stretch; flex-direction:column; } .advertisement-grid,.picker-grid,.field-row { grid-template-columns:1fr; } .management-card__actions :deep(.p-button) { flex:1 1 auto; } }
</style>
