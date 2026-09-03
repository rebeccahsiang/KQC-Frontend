<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import { adminMarketplaceCasesApi, type AdminMarketplaceCase, type MarketplaceCaseInput, type MarketplacePriceType } from '@/api/adminMarketplaceCases'
import { adminProductImagesApi, productImageUrl, type ProductBusinessCategory, type ProductImageRepresentativeSlot, type ProductTransactionType } from '@/api/adminProductImages'
import { useAuthStore } from '@/stores/authStore'
import { hasCapability } from '@/config/capabilities'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isReviewMode = computed(() => route.name === 'CaseReview')
const editingId = computed(() => isReviewMode.value ? String(route.params.id || '') : typeof route.query.id === 'string' ? route.query.id : '')
const isEditMode = computed(() => Boolean(editingId.value) && !isReviewMode.value)
const busy = ref(false)
const loading = ref(false)
const feedback = ref('')
const loadError = ref('')
const returnVisible = ref(false)
const returnReason = ref('')
const returnError = ref('')
const errors = reactive<Record<string, string>>({})
const representativeSlots = ref<ProductImageRepresentativeSlot[]>([])

const categories: ReadonlyArray<{ value: ProductBusinessCategory; label: string }> = [
  { value: 'CA', label: 'CA｜甲種小客車' }, { value: 'CB', label: 'CB｜乙種小客車' },
  { value: 'TX', label: 'TX｜計程車' }, { value: 'LT', label: 'LT｜小貨車' },
  { value: 'MV', label: 'MV｜搬家公司' }, { value: 'FT', label: 'FT｜汽車貨運' },
  { value: 'CT', label: 'CT｜貨櫃貨運' },
]
const transactionTypes: ReadonlyArray<{ value: ProductTransactionType; label: string }> = [
  { value: 'BUY', label: 'BUY｜買家需求' }, { value: 'SELL', label: 'SELL｜精選待售' },
]
const targetAreas = ['北部地區', '中部地區', '南部地區', '東部地區'] as const
const priceTypes: ReadonlyArray<{ value: MarketplacePriceType; label: string }> = [
  { value: 'FIXED', label: '固定金額' }, { value: 'RANGE', label: '金額區間' },
  { value: 'MAX', label: '最高金額' }, { value: 'APPROXIMATE', label: '約略金額' },
]

/* PRODUCT-CASE-B2-B — Marketplace Create Form / canonical Marketplace fields only; CRM PII is intentionally absent. */
const form = reactive({
  businessCaseId: '', caseId: '系統建立後自動產生', businessCategory: 'FT' as ProductBusinessCategory,
  transactionType: 'SELL' as ProductTransactionType, title: '', targetArea: '北部地區' as typeof targetAreas[number],
  companyType: '有限公司', capitalAmount: 0, priceType: 'FIXED' as MarketplacePriceType,
  amountWan: null as number | null, minWan: null as number | null, maxWan: null as number | null,
  coreNeed: '', isPriority: false, marketplaceStatus: 'DRAFT', returnReason: null as string | null,
  createdBy: '', createdByName: null as string | null, submittedAt: null as string | null, submittedBy: null as string | null, submittedByName: null as string | null,
  requiredApproverCapability: 'SALES_SUPERVISOR' as 'SALES_SUPERVISOR' | 'ADMIN',
})

const priceHeading = computed(() => form.transactionType === 'BUY' ? '預算' : '售價')
const representative = computed(() => representativeSlots.value.find((slot) => slot.businessCategory === form.businessCategory && slot.transactionType === form.transactionType)?.productImage || null)
const canReadRepresentativeSlots = computed(() => hasCapability(authStore.user, 'SALES_SUPERVISOR') || hasCapability(authStore.user, 'ADMIN'))
const canPersist = computed(() => !isReviewMode.value && !busy.value && (!isEditMode.value || ['DRAFT', 'RETURNED'].includes(form.marketplaceStatus)))
const statusLabels: Record<string, string> = { DRAFT: '草稿', PENDING_APPROVAL: '待審核', RETURNED: '已退回', PUBLISHED: '已發布', UNPUBLISHED: '已下架', CLOSED: '已結案' }
const statusLabel = computed(() => statusLabels[form.marketplaceStatus] || form.marketplaceStatus)
const actorId = computed(() => authStore.user?._id || '')
const isCreator = computed(() => Boolean(actorId.value) && form.createdBy === actorId.value)
const isAdminSelfConfirmation = computed(() => isCreator.value && form.requiredApproverCapability === 'ADMIN' && hasCapability(authStore.user, 'ADMIN'))
const canReview = computed(() => isReviewMode.value && form.marketplaceStatus === 'PENDING_APPROVAL' && hasCapability(authStore.user, form.requiredApproverCapability) && (!isCreator.value || isAdminSelfConfirmation.value))
const inputId = (name: string) => `marketplace-${name}`

const toTwd = (wan: number | null) => wan == null ? null : wan * 10000
const toWan = (twd: number | null) => twd == null ? null : twd / 10000
const formatWan = (value: number | null) => value == null ? '—' : `${new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 4 }).format(value)} 萬`
/* PRODUCT-CASE-B3-E2E-R9 — Reviewer Read-Only Authority / structured review copy never reads legacy price. */
const reviewPrice = computed(() => {
  const prefix = form.transactionType === 'BUY' ? '預算' : '售價'
  if (form.priceType === 'RANGE') return `${prefix} ${formatWan(form.minWan).replace(' 萬', '')}～${formatWan(form.maxWan)}`
  if (form.priceType === 'MAX') return `${prefix} ${formatWan(form.amountWan)}以下`
  if (form.priceType === 'APPROXIMATE') return `${prefix}約 ${formatWan(form.amountWan)}`
  return `${prefix} ${formatWan(form.amountWan)}`
})
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'

/* PRODUCT-CASE-B2-B — Structured Price UI / 萬元 input is converted to integer TWD before API submission. */
const validate = () => {
  for (const key of Object.keys(errors)) delete errors[key]
  if (!form.title.trim()) errors.title = '請輸入案件標題。'
  const validWan = (value: number | null) => Number.isFinite(value) && Number.isInteger(toTwd(value)) && Number(value) >= 0
  if (form.priceType === 'RANGE') {
    if (!validWan(form.minWan) || !validWan(form.maxWan)) errors.price = '請輸入有效且非負數的最低與最高金額。'
    else if (Number(form.minWan) > Number(form.maxWan)) errors.price = '最低金額不得高於最高金額。'
  } else if (!validWan(form.amountWan)) errors.price = '請輸入有效且非負數的金額。'
  return Object.keys(errors).length === 0
}

const payload = (): MarketplaceCaseInput => ({
  /* PRODUCT-CASE-B3-E2E-R1 — Optional BusinessCase Source / omit absent traceability without inventing an identifier. */
  ...(form.businessCaseId ? { businessCaseId: form.businessCaseId } : {}),
  businessCategory: form.businessCategory, transactionType: form.transactionType,
  title: form.title.trim(), targetArea: form.targetArea, companyType: form.companyType,
  capitalAmount: Number(form.capitalAmount), coreNeed: form.coreNeed.trim(), isPriority: form.isPriority,
  priceType: form.priceType,
  priceAmount: form.priceType === 'RANGE' ? null : toTwd(form.amountWan),
  priceMin: form.priceType === 'RANGE' ? toTwd(form.minWan) : null,
  priceMax: form.priceType === 'RANGE' ? toTwd(form.maxWan) : null,
})

/* PRODUCT-CASE-B3-E2E-R5 — Returned Case Edit Hydration / the manageable detail DTO restores every canonical editable field and lifecycle context. */
const applyCase = (item: AdminMarketplaceCase) => Object.assign(form, {
  businessCaseId: item.businessCaseId || '', caseId: item.caseId,
  businessCategory: item.businessCategory, transactionType: item.transactionType,
  title: item.title, targetArea: item.targetArea, companyType: item.companyType,
  capitalAmount: item.capitalAmount, priceType: item.priceType,
  amountWan: toWan(item.priceAmount), minWan: toWan(item.priceMin), maxWan: toWan(item.priceMax),
  coreNeed: item.coreNeed, isPriority: item.isPriority,
  marketplaceStatus: item.marketplaceStatus, returnReason: item.returnReason,
  createdBy: item.createdBy, createdByName: item.createdByName || item.createdBy, submittedAt: item.submittedAt || null, submittedBy: item.submittedBy || null, submittedByName: item.submittedByName || item.submittedBy || null,
  requiredApproverCapability: item.requiredApproverCapability,
})

const persistDraft = async () => {
  if (!validate()) return null
  /* PRODUCT-CASE-B3-E2E-R5 — Returned Case Save / edit mode updates the existing identity and trusts the returned server DTO. */
  const response = isEditMode.value
    ? await adminMarketplaceCasesApi.update(editingId.value, payload())
    : await adminMarketplaceCasesApi.create(payload())
  applyCase(response.data)
  return response.data
}

const save = async (submit: boolean) => {
  if (busy.value || isReviewMode.value) return
  busy.value = true
  feedback.value = ''
  try {
    /* PRODUCT-CASE-B2-B — Marketplace Submission / submission follows a successful server-created or updated DRAFT. */
    const saved = await persistDraft()
    if (!saved) return
    if (submit) applyCase((await adminMarketplaceCasesApi.submit(saved.id)).data)
    feedback.value = submit ? '案件已提交審核。' : saved.marketplaceStatus === 'RETURNED' ? '退回案件修改已儲存。' : '草稿已儲存。'
    if (!isEditMode.value) await router.replace({ query: { ...route.query, id: saved.id } })
  } catch (error) {
    feedback.value = '儲存失敗，請確認欄位或稍後再試。'
  } finally { busy.value = false }
}

/* PRODUCT-CASE-B3-E2E-R9 — Reviewer Detail Loading / route identity always reloads the bounded Backend detail DTO. */
const load = async () => {
  loading.value = true; loadError.value = ''
  try {
    if (editingId.value) applyCase((await adminMarketplaceCasesApi.detail(editingId.value)).data)
    representativeSlots.value = !isReviewMode.value && canReadRepresentativeSlots.value
      ? (await adminProductImagesApi.getProductImageRepresentatives()).data.slots
      : []
  } catch { loadError.value = isReviewMode.value ? '無法載入待審核商品案件，案件可能不存在或不在您的管理範圍。' : '商品案件載入失敗，請稍後重試。' }
  finally { loading.value = false }
}
watch(() => [route.query.id, route.params.id], () => { if (editingId.value) void load() })

/* PRODUCT-CASE-B3-E2E-R9 — Reviewer Lifecycle Actions / Backend completion precedes return to the canonical list. */
const approveReview = async () => {
  if (!canReview.value || busy.value || !window.confirm(`確定通過並發布「${form.title}」？`)) return
  busy.value = true; feedback.value = ''
  try { await adminMarketplaceCasesApi.approve(editingId.value); await router.push({ name: 'CaseList' }) }
  catch { feedback.value = '通過發布失敗，案件狀態或審核權限可能已變更。' }
  finally { busy.value = false }
}
const openReturnReview = () => { if (!canReview.value || isAdminSelfConfirmation.value) return; returnReason.value = ''; returnError.value = ''; returnVisible.value = true }
const returnReview = async () => {
  if (!canReview.value || isAdminSelfConfirmation.value || busy.value) return
  if (!returnReason.value.trim()) { returnError.value = '請填寫退回原因。'; return }
  busy.value = true; returnError.value = ''
  try { await adminMarketplaceCasesApi.returnForRevision(editingId.value, returnReason.value.trim()); returnVisible.value = false; await router.push({ name: 'CaseList' }) }
  catch { returnError.value = '退回失敗，案件狀態或審核權限可能已變更。' }
  finally { busy.value = false }
}
onMounted(() => { void load() })
</script>

<template>
  <main class="marketplace-form-page">
    <header class="page-heading">
      <div><p class="eyebrow">商品管理</p><h1>{{ isReviewMode ? '審核商品案件' : isEditMode ? '編輯商品案件' : '建立商品案件' }}</h1><p>{{ isReviewMode ? '檢視提交內容後，再決定通過發布或退回修改。' : '建立商品展示資料；提交後依審核流程發布。' }}</p></div>
      <span class="status-badge">{{ statusLabel }}</span>
    </header>

    <p v-if="form.returnReason" class="return-notice" role="status"><strong>退回原因：</strong>{{ form.returnReason }}</p>
    <p v-if="feedback" class="feedback" role="status" aria-live="polite">{{ feedback }}</p>
    <p v-if="loading" class="state-message" role="status">載入商品案件內容中…</p>
    <p v-else-if="loadError" class="feedback" role="alert">{{ loadError }}</p>

    <form v-else class="marketplace-form" @submit.prevent="save(false)">
      <!-- PRODUCT-CASE-B2-B — BusinessCase Source Boundary / no fake CRM options or manual ObjectId entry. -->
      <section class="form-card">
        <h2>A. 來源業務案件</h2>
        <label :for="inputId('business-case')">來源業務案件</label>
        <select :id="inputId('business-case')" disabled aria-describedby="business-case-help"><option>{{ form.businessCaseId || '尚無可用資料來源' }}</option></select>
        <p id="business-case-help" class="field-help">目前可先建立商品案件；待 CRM 業務管理開放後可連結來源業務案件。</p>
      </section>

      <section class="form-card">
        <h2>B. 商品基本資料</h2>
        <div class="field-grid">
          <div><label :for="inputId('case-id')">案件編號</label><input :id="inputId('case-id')" :value="form.caseId" readonly /></div>
          <div><label :for="inputId('title')">案件標題 *</label><input :id="inputId('title')" v-model="form.title" :readonly="isReviewMode" required /><p v-if="errors.title" class="field-error">{{ errors.title }}</p></div>
          <div><label :for="inputId('category')">業務類別 *</label><select :id="inputId('category')" v-model="form.businessCategory" :disabled="isReviewMode"><option v-for="item in categories" :key="item.value" :value="item.value">{{ item.label }}</option></select></div>
          <div><label :for="inputId('transaction')">交易類型 *</label><select :id="inputId('transaction')" v-model="form.transactionType" :disabled="isReviewMode"><option v-for="item in transactionTypes" :key="item.value" :value="item.value">{{ item.label }}</option></select></div>
          <div><label :for="inputId('area')">區域分類 *</label><select :id="inputId('area')" v-model="form.targetArea" :disabled="isReviewMode"><option v-for="area in targetAreas" :key="area">{{ area }}</option></select></div>
          <div><label :for="inputId('company-type')">公司類型</label><select :id="inputId('company-type')" v-model="form.companyType" :disabled="isReviewMode"><option>有限公司</option><option>股份有限公司</option><option>車行</option></select></div>
          <div><label :for="inputId('capital')">資本額（TWD）</label><input :id="inputId('capital')" v-model.number="form.capitalAmount" type="number" min="0" :readonly="isReviewMode" /></div>
        </div>
      </section>

      <!-- PRODUCT-CASE-B2-B-R1 — Browser Review Layout / capital stays basic data while price wording follows transaction intent. -->
      <section class="form-card">
        <h2>C. {{ priceHeading }}與條件</h2>
        <div class="field-grid">
          <div><label :for="inputId('price-type')">{{ priceHeading }}模式 *</label><select :id="inputId('price-type')" v-model="form.priceType" :disabled="isReviewMode"><option v-for="item in priceTypes" :key="item.value" :value="item.value">{{ item.label }}</option></select></div>
          <template v-if="form.priceType === 'RANGE'">
            <div><label :for="inputId('price-min')">最低金額（萬元）*</label><input :id="inputId('price-min')" v-model.number="form.minWan" type="number" min="0" step="0.0001" :readonly="isReviewMode" /></div>
            <div><label :for="inputId('price-max')">最高金額（萬元）*</label><input :id="inputId('price-max')" v-model.number="form.maxWan" type="number" min="0" step="0.0001" :readonly="isReviewMode" /></div>
          </template>
          <div v-else><label :for="inputId('price-amount')">{{ priceHeading }}金額（萬元）*</label><input :id="inputId('price-amount')" v-model.number="form.amountWan" type="number" min="0" step="0.0001" :readonly="isReviewMode" /></div>
          <label class="check-field"><input v-model="form.isPriority" type="checkbox" :disabled="isReviewMode" />設為優先展示案件</label>
        </div>
        <p v-if="isReviewMode" class="review-price"><strong>送審價格：</strong>{{ reviewPrice }}</p>
        <p v-if="errors.price" class="field-error" role="alert">{{ errors.price }}</p>
      </section>

      <!-- PRODUCT-CASE-B2-B — CRM PII Separation / public Marketplace copy contains no customer identity fields. -->
      <section class="form-card">
        <h2>D. 商品內容</h2>
        <label :for="inputId('content')">核心需求／商品說明 *</label>
        <textarea :id="inputId('content')" v-model="form.coreNeed" rows="7" :readonly="isReviewMode" required />
      </section>

      <!-- PRODUCT-CASE-B3-E2E-R9 — Reviewer Read-Only Authority / safe context never expands BusinessCase or Customer data. -->
      <!-- PRODUCT-CASE-B3-E2E-R9-R1 — Reviewer Actor Presentation / canonical StaffIdentity names replace raw IDs as the primary label. -->
      <section v-if="isReviewMode" class="form-card review-context"><h2>E. 送審資訊</h2><dl><div><dt>目前狀態</dt><dd>{{ statusLabel }}</dd></div><div><dt>送審時間</dt><dd>{{ formatDate(form.submittedAt) }}</dd></div><div><dt>建立者</dt><dd>{{ form.createdByName || form.createdBy || '—' }}</dd></div><div><dt>送審者</dt><dd>{{ form.submittedByName || form.submittedBy || '—' }}</dd></div></dl></section>

      <!-- PRODUCT-CASE-B2-B — Representative Image Preview / slot authority remains category + transaction type. -->
      <section v-if="!isReviewMode" class="form-card representative-card">
        <h2>E. 代表圖片</h2>
        <img v-if="representative" :src="productImageUrl(representative.imageUrl)" :alt="representative.altText" />
        <div v-else class="image-empty">尚未設定代表圖片</div>
        <p class="field-help">代表圖片由「商品照片」依業務類別與交易類型自動套用</p>
      </section>

      <footer v-if="!isReviewMode" class="form-actions">
        <button type="button" class="secondary" @click="router.back()">取消</button>
        <button type="submit" :disabled="!canPersist">儲存草稿</button>
        <button type="button" :disabled="!canPersist" @click="save(true)">{{ form.marketplaceStatus === 'RETURNED' ? '重新提交審核' : '提交審核' }}</button>
      </footer>
      <footer v-else class="form-actions review-actions"><button type="button" class="secondary" @click="router.push({ name: 'CaseList' })">返回商品列表</button><button v-if="canReview && !isAdminSelfConfirmation" type="button" class="secondary" :disabled="busy" @click="openReturnReview">退回修改</button><button v-if="canReview" type="button" :disabled="busy" @click="approveReview">通過並發布</button><span v-else class="field-help">目前帳號沒有此案件的審核操作權限。</span></footer>
    </form>
    <Dialog v-model:visible="returnVisible" modal header="退回修改" :style="{ width: 'min(32rem, calc(100vw - 2rem))' }" @hide="returnError = ''"><label for="review-return-reason">退回原因 *</label><textarea id="review-return-reason" v-model="returnReason" rows="5" aria-describedby="review-return-error" /><p id="review-return-error" class="field-error" role="alert">{{ returnError }}</p><template #footer><button type="button" class="secondary" @click="returnVisible = false">取消</button><button type="button" :disabled="busy" @click="returnReview">確認退回</button></template></Dialog>
  </main>
</template>

<style scoped lang="scss">
.marketplace-form-page { max-width: 70rem; margin: 0 auto; padding: 2rem; color: var(--text-main); }
.page-heading { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 1.5rem; h1 { margin: .15rem 0 .4rem; color: var(--accent); } p { margin: 0; color: var(--text-muted); } }
.eyebrow { font-size: .75rem; letter-spacing: .12em; text-transform: uppercase; }.status-badge { padding: .4rem .7rem; border: 1px solid var(--border-grey); border-radius: 999px; font-size: .75rem; }
.marketplace-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }.form-card { padding: 1.25rem; border: 1px solid var(--border-grey); border-radius: .9rem; background: var(--bg-card); h2 { margin: 0 0 1rem; font-size: 1rem; color: var(--text-main); } }
.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }.form-card > label, .field-grid label { display: block; margin-bottom: .4rem; color: var(--text-muted); font-size: .82rem; }
input, select, textarea { width: 100%; box-sizing: border-box; border: 1px solid var(--border-grey); border-radius: .5rem; padding: .7rem .75rem; background: var(--bg-main); color: var(--text-main); &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; } &:disabled, &[readonly] { opacity: .7; cursor: not-allowed; } }
textarea { resize: vertical; }.field-help { margin: .55rem 0 0; color: var(--text-muted); font-size: .78rem; }.field-error { color: var(--danger); font-size: .8rem; }.return-notice, .feedback { padding: .8rem 1rem; border-radius: .6rem; background: var(--warning-bg); color: var(--warning); }
.state-message { padding: 3rem; text-align: center; color: var(--text-muted); }.review-price { margin: 1rem 0 0; color: var(--accent-active); }.review-context dl { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; margin: 0; div { padding: .75rem; border-radius: .55rem; background: var(--bg-main); } dt { color: var(--text-muted); font-size: .75rem; } dd { margin: .25rem 0 0; overflow-wrap: anywhere; } }
.check-field { display: flex !important; gap: .55rem; align-items: center; align-self: end; input { width: auto; } }.representative-card img { width: 100%; aspect-ratio: 16 / 9; border-radius: .65rem; object-fit: cover; }.image-empty { display: grid; place-items: center; width: 100%; min-height: 7rem; border: 1px dashed var(--border-grey); border-radius: .65rem; color: var(--text-muted); background: var(--bg-main); }
.form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: .75rem; padding-top: 0; margin-top: -.25rem; button { border: 0; border-radius: .55rem; padding: .75rem 1.1rem; background: var(--accent); color: #111827; font-weight: 700; cursor: pointer; &:disabled { opacity: .45; cursor: not-allowed; } &.secondary { background: #334155; color: #f8fafc; } } }
@media (max-width: 768px) { .marketplace-form-page { padding: 1rem; }.marketplace-form, .field-grid { grid-template-columns: 1fr; }.page-heading { flex-direction: column; }.form-actions { flex-direction: column-reverse; button { width: 100%; } } }
</style>
