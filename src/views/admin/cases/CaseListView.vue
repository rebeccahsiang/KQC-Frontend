<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminMarketplaceCasesApi, type AdminMarketplaceCase, type MarketplaceStatus } from '@/api/adminMarketplaceCases'
import { adminProductImagesApi, productImageUrl, type ProductBusinessCategory, type ProductImageRepresentativeSlot } from '@/api/adminProductImages'
import { useAuthStore } from '@/stores/authStore'
import { hasCapability } from '@/config/capabilities'

const router = useRouter()
const authStore = useAuthStore()
const items = ref<AdminMarketplaceCase[]>([])
const representativeSlots = ref<ProductImageRepresentativeSlot[]>([])
const loading = ref(true)
const mutatingId = ref('')
const errorMessage = ref('')
const statusFilter = ref<'ALL' | MarketplaceStatus>('ALL')
const transactionFilter = ref<'ALL' | 'BUY' | 'SELL'>('ALL')
const categoryFilter = ref<'ALL' | ProductBusinessCategory>('ALL')
const keyword = ref('')

/* PRODUCT-CASE-B3 — Marketplace Status Presentation / canonical values retain explicit Traditional Chinese labels. */
const statuses: ReadonlyArray<{ value: MarketplaceStatus; label: string }> = [
  { value: 'DRAFT', label: '草稿' }, { value: 'PENDING_APPROVAL', label: '待審核' },
  { value: 'RETURNED', label: '已退回' }, { value: 'PUBLISHED', label: '已發布' },
  { value: 'UNPUBLISHED', label: '已下架' }, { value: 'CLOSED', label: '已結案' },
]
const statusLabel = (value: MarketplaceStatus) => statuses.find((item) => item.value === value)?.label || value
const categories: ReadonlyArray<{ value: ProductBusinessCategory; label: string }> = [
  { value: 'CA', label: 'CA｜甲種小客車' }, { value: 'CB', label: 'CB｜乙種小客車' },
  { value: 'TX', label: 'TX｜計程車' }, { value: 'LT', label: 'LT｜小貨車' },
  { value: 'MV', label: 'MV｜搬家公司' }, { value: 'FT', label: 'FT｜汽車貨運' },
  { value: 'CT', label: 'CT｜貨櫃貨運' },
]
const categoryLabel = (value: ProductBusinessCategory) => categories.find((item) => item.value === value)?.label || value
const actorId = computed(() => authStore.user?._id || '')
const canPublish = computed(() => hasCapability(authStore.user, 'SALES_SUPERVISOR') || hasCapability(authStore.user, 'ADMIN'))
const canReadRepresentativeSlots = computed(() => hasCapability(authStore.user, 'SALES_SUPERVISOR') || hasCapability(authStore.user, 'ADMIN'))
const isCreator = (item: AdminMarketplaceCase) => Boolean(actorId.value) && item.createdBy === actorId.value
/* PRODUCT-CASE-B3-E2E-R2 — Highest Authority Confirmation / required capability remains authoritative for every pending Case. */
/* PRODUCT-CASE-B3-E2E-R2 — ADMIN Self Confirmation Exception / only ADMIN-required work exposes confirmation to its ADMIN creator. */
const isAdminSelfConfirmation = (item: AdminMarketplaceCase) => isCreator(item) && item.requiredApproverCapability === 'ADMIN' && hasCapability(authStore.user, 'ADMIN')
const canReview = (item: AdminMarketplaceCase) => item.marketplaceStatus === 'PENDING_APPROVAL' && hasCapability(authStore.user, item.requiredApproverCapability) && (!isCreator(item) || isAdminSelfConfirmation(item))

const counts = computed(() => Object.fromEntries(statuses.map(({ value }) => [value, items.value.filter((item) => item.marketplaceStatus === value).length])))
const filteredItems = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase('zh-Hant')
  return items.value.filter((item) =>
    (statusFilter.value === 'ALL' || item.marketplaceStatus === statusFilter.value) &&
    (transactionFilter.value === 'ALL' || item.transactionType === transactionFilter.value) &&
    (categoryFilter.value === 'ALL' || item.businessCategory === categoryFilter.value) &&
    (!query || item.caseId.toLocaleLowerCase().includes(query) || item.title.toLocaleLowerCase().includes(query)))
})

const formatWan = (value: number | null) => value == null ? '—' : `${new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 4 }).format(value / 10000)} 萬`
/* PRODUCT-CASE-B3 — Structured Price Display / legacy price is never a display authority. */
const priceLabel = (item: AdminMarketplaceCase) => {
  const prefix = item.transactionType === 'BUY' ? '預算' : '售價'
  if (item.priceType === 'RANGE') return `${prefix} ${formatWan(item.priceMin).replace(' 萬', '')}～${formatWan(item.priceMax)}`
  if (item.priceType === 'MAX') return `${prefix} ${formatWan(item.priceAmount)}以下`
  if (item.priceType === 'APPROXIMATE') return `${prefix}約 ${formatWan(item.priceAmount)}`
  return `${prefix} ${formatWan(item.priceAmount)}`
}

/* PRODUCT-CASE-B3 — Representative Image Resolution / list cards resolve the authoritative category + transaction slot. */
const representative = (item: AdminMarketplaceCase) => representativeSlots.value.find((slot) => slot.businessCategory === item.businessCategory && slot.transactionType === item.transactionType)?.productImage || null

/* PRODUCT-CASE-B3 — Marketplace List Authority / Backend result owns visible scope; filters are presentation only. */
const load = async () => {
  loading.value = true; errorMessage.value = ''
  try {
    const casesResponse = await adminMarketplaceCasesApi.list()
    items.value = casesResponse.data
    representativeSlots.value = canReadRepresentativeSlots.value ? (await adminProductImagesApi.getProductImageRepresentatives()).data.slots : []
  } catch { errorMessage.value = '商品案件載入失敗，請稍後重試。' }
  finally { loading.value = false }
}
const replaceItem = (item: AdminMarketplaceCase) => { const index = items.value.findIndex((current) => current.id === item.id); if (index >= 0) items.value[index] = item }
const transition = async (item: AdminMarketplaceCase, operation: () => Promise<{ data: AdminMarketplaceCase }>) => {
  mutatingId.value = item.id; errorMessage.value = ''
  try { replaceItem((await operation()).data) } catch { errorMessage.value = '操作失敗，案件狀態可能已變更，請重新整理。' }
  finally { mutatingId.value = '' }
}
const edit = (item: AdminMarketplaceCase) => router.push({ name: 'CaseCreate', query: { id: item.id } })
/* PRODUCT-CASE-B3-E2E-R9 — Reviewer Case Detail / review begins on the server-loaded read-only surface. */
const review = (item: AdminMarketplaceCase) => router.push({ name: 'CaseReview', params: { id: item.id } })
const submit = (item: AdminMarketplaceCase) => transition(item, () => adminMarketplaceCasesApi.submit(item.id))
const unpublish = (item: AdminMarketplaceCase) => transition(item, () => adminMarketplaceCasesApi.unpublish(item.id))
const republish = (item: AdminMarketplaceCase) => transition(item, () => adminMarketplaceCasesApi.republish(item.id))
const close = (item: AdminMarketplaceCase) => { if (window.confirm(`確定將「${item.title}」結案？`)) void transition(item, () => adminMarketplaceCasesApi.close(item.id)) }

onMounted(() => { void load() })
</script>

<template>
  <main class="case-list-page">
    <header class="page-heading"><div><p class="eyebrow">商品管理</p><h1>商品列表</h1><p>檢視可管理案件並依權限完成提交、審核與發布流程。</p></div><button type="button" @click="load">重新整理</button></header>
    <section class="summary" aria-label="案件狀態摘要"><button v-for="status in statuses" :key="status.value" type="button" :class="{ active: statusFilter === status.value }" @click="statusFilter = status.value"><span>{{ status.label }}</span><strong>{{ counts[status.value] }}</strong></button></section>
    <section class="filters" aria-label="商品案件篩選">
      <label>狀態<select v-model="statusFilter"><option value="ALL">全部狀態</option><option v-for="status in statuses" :key="status.value" :value="status.value">{{ status.label }}</option></select></label>
      <label>交易類型<select v-model="transactionFilter"><option value="ALL">全部交易類型</option><option value="BUY">BUY｜買家需求</option><option value="SELL">SELL｜精選待售</option></select></label>
      <label>業務類別<select v-model="categoryFilter"><option value="ALL">全部業務類別</option><option v-for="category in categories" :key="category.value" :value="category.value">{{ category.label }}</option></select></label>
      <label>關鍵字<input v-model="keyword" type="search" placeholder="搜尋案件編號或標題" /></label>
    </section>

    <p v-if="errorMessage" class="error-state" role="alert">{{ errorMessage }}</p>
    <p v-if="loading" class="state-message" role="status">載入商品案件中…</p>
    <p v-else-if="!items.length" class="state-message">目前沒有可管理的商品案件。</p>
    <p v-else-if="!filteredItems.length" class="state-message">沒有符合篩選條件的商品案件。</p>

    <section v-else class="case-grid" aria-label="商品案件清單">
      <article v-for="item in filteredItems" :key="item.id" class="case-card">
        <div class="case-image"><img v-if="representative(item)" :src="productImageUrl(representative(item)!.imageUrl)" :alt="`${item.title} 代表圖片`" /><span v-else>尚未設定代表圖片</span></div>
        <div class="case-content">
          <header><div><p class="case-id">{{ item.caseId }}</p><h2>{{ item.title }}</h2></div><span class="status" :data-status="item.marketplaceStatus">{{ statusLabel(item.marketplaceStatus) }}</span></header>
          <div class="meta"><span>{{ categoryLabel(item.businessCategory) }}</span><span>{{ item.transactionType === 'BUY' ? 'BUY｜買家需求' : 'SELL｜精選待售' }}</span><span>{{ item.targetArea }}</span><strong>{{ priceLabel(item) }}</strong></div>
          <p v-if="item.marketplaceStatus === 'RETURNED' && item.returnReason" class="return-reason"><strong>退回原因：</strong>{{ item.returnReason }}</p>
          <!-- PRODUCT-CASE-B3 — Review Action Matrix / client hides impossible actions while Backend retains final authority. -->
          <footer class="actions">
            <!-- PRODUCT-CASE-B3-E2E-R5 — Returned Case Resubmit Context / returned work re-enters the authoritative edit-and-save surface before resubmission. -->
            <template v-if="item.marketplaceStatus === 'DRAFT' && isCreator(item)"><button type="button" @click="edit(item)">編輯</button><button type="button" :disabled="mutatingId === item.id" @click="submit(item)">提交審核</button></template>
            <template v-else-if="item.marketplaceStatus === 'RETURNED' && isCreator(item)"><button type="button" @click="edit(item)">編輯退回案件</button></template>
            <template v-if="canReview(item)"><button type="button" @click="review(item)">審核案件</button></template>
            <template v-if="item.marketplaceStatus === 'PUBLISHED' && canPublish"><button type="button" class="secondary" :disabled="mutatingId === item.id" @click="unpublish(item)">下架</button><button type="button" :disabled="mutatingId === item.id" @click="close(item)">結案</button></template>
            <template v-if="item.marketplaceStatus === 'UNPUBLISHED' && canPublish"><button type="button" :disabled="mutatingId === item.id" @click="republish(item)">重新發布</button><button type="button" class="secondary" :disabled="mutatingId === item.id" @click="close(item)">結案</button></template>
            <span v-if="item.marketplaceStatus === 'PENDING_APPROVAL' && !canReview(item)" class="waiting">等待授權審核者處理</span><span v-if="item.marketplaceStatus === 'CLOSED'" class="waiting">案件已結案</span>
          </footer>
        </div>
      </article>
    </section>

  </main>
</template>

<style scoped lang="scss">
.case-list-page { max-width: 76rem; margin: 0 auto; padding: 2rem; color: var(--text-main); }.page-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; h1 { color: var(--accent); margin: .1rem 0 .35rem; } p { margin: 0; color: var(--text-muted); } }.eyebrow { font-size: .75rem; letter-spacing: .12em; text-transform: uppercase; }
button { border: 0; border-radius: .5rem; padding: .65rem .85rem; cursor: pointer; font-weight: 700; background: var(--accent); color: #111827; &:focus-visible { outline: 2px solid var(--text-main); outline-offset: 2px; } &:disabled { opacity: .45; cursor: not-allowed; } &.secondary { background: var(--bg-active); color: var(--text-main); } }.summary { display: grid; grid-template-columns: repeat(6, 1fr); gap: .6rem; margin-bottom: 1rem; button { display: flex; justify-content: space-between; background: var(--bg-card); color: var(--text-muted); border: 1px solid var(--border-grey); &.active { outline: 2px solid var(--accent); } } }.filters { display: grid; grid-template-columns: repeat(4, 1fr); gap: .75rem; padding: 1rem; border: 1px solid var(--border-grey); border-radius: .8rem; background: var(--bg-card); label { font-size: .78rem; color: var(--text-muted); } select, input { display: block; width: 100%; box-sizing: border-box; margin-top: .35rem; padding: .65rem; border: 1px solid var(--border-grey); border-radius: .45rem; background: var(--bg-main); color: var(--text-main); } }
.case-grid { display: grid; gap: .85rem; margin-top: 1rem; }.case-card { display: grid; grid-template-columns: 11rem 1fr; min-width: 0; border: 1px solid var(--border-grey); border-radius: .8rem; overflow: hidden; background: var(--bg-card); }.case-image { display: grid; place-items: center; min-height: 9rem; background: var(--bg-main); color: var(--text-muted); font-size: .8rem; img { width: 100%; height: 100%; object-fit: cover; } }.case-content { min-width: 0; padding: 1rem; > header { display: flex; justify-content: space-between; gap: 1rem; h2 { margin: .15rem 0 .65rem; font-size: 1.05rem; } } }.case-id { margin: 0; color: var(--accent); font: 700 .78rem monospace; }.status { height: fit-content; white-space: nowrap; padding: .3rem .55rem; border: 1px solid var(--border-grey); border-radius: 999px; font-size: .75rem; }.meta { display: flex; flex-wrap: wrap; gap: .45rem .8rem; color: var(--text-muted); font-size: .82rem; strong { color: var(--accent-active); } }.actions { display: flex; justify-content: flex-end; align-items: center; gap: .55rem; margin-top: 1rem; }.waiting { color: var(--text-muted); font-size: .8rem; }.return-reason, .error-state { padding: .65rem .8rem; border-radius: .5rem; background: var(--warning-bg); color: var(--warning); }.state-message { padding: 2.5rem; text-align: center; color: var(--text-muted); }.field-error { min-height: 1.2rem; color: var(--danger); }textarea { width: 100%; box-sizing: border-box; margin-top: .4rem; padding: .7rem; border: 1px solid var(--border-grey); border-radius: .5rem; background: var(--bg-main); color: var(--text-main); }
@media (max-width: 900px) { .summary { grid-template-columns: repeat(3, 1fr); }.filters { grid-template-columns: 1fr 1fr; }.case-card { grid-template-columns: 9rem 1fr; } }
@media (max-width: 640px) { .case-list-page { padding: 1rem; }.page-heading { flex-direction: column; }.summary, .filters { grid-template-columns: 1fr; }.case-card { grid-template-columns: 1fr; }.case-image { min-height: 8rem; max-height: 12rem; }.case-content > header { flex-direction: column; }.actions { justify-content: stretch; flex-wrap: wrap; button { flex: 1; } } }
</style>
