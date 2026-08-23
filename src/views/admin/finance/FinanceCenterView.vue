<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Paginator, { type PageState } from 'primevue/paginator'
import ProgressBar from 'primevue/progressbar'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { financeApi, type FinanceBusinessCase, type FinanceListQuery, type FinanceReadModel, type FinanceStatus, type FinanceSummary, type PaymentProgressFilter, type SettlementStatus } from '@/api/finance'
import { caseStatusLabel, categoryLabel, financeStatusLabel, formatCurrency, readinessLabel } from '@/config/finance'
import { useAuthStore } from '@/stores/authStore'

const summary = ref<FinanceSummary | null>(null)
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const cases = ref<FinanceReadModel[]>([])
const caseTotal = ref(0)
const discovery = ref<FinanceBusinessCase[]>([])
const discoveryTotal = ref(0)
const loading = ref(true)
const refreshing = ref(false)
const errorMessage = ref('')
const initializeCase = ref<FinanceBusinessCase | null>(null)
const initializeForm = ref({ buyerServiceFee: 0, sellerServiceFee: 0, variableCost: 0, actualCost: 0 })
const initializeError = ref('')
const initializing = ref(false)
const pageSize = 10
const filters = ref<{ page: number; search: string; financeStatus: FinanceStatus | ''; settlementStatus: SettlementStatus | ''; paymentProgress: PaymentProgressFilter | '' }>({ page: 1, search: '', financeStatus: '', settlementStatus: '', paymentProgress: '' })
const discoveryQuery = ref({ page: 1, search: '' })
const statusOptions = [{ label: '全部財務狀態', value: '' }, { label: '草稿', value: 'DRAFT' }, { label: '已凍結', value: 'FROZEN' }]
const settlementOptions = [{ label: '全部結算狀態', value: '' }, { label: '結算中', value: 'OPEN' }, { label: '已結算', value: 'FINALIZED' }]
const progressOptions = [{ label: '全部收款進度', value: '' }, { label: '尚未收款', value: 'NONE' }, { label: '部分收款', value: 'PARTIAL' }, { label: '已全額收款', value: 'COMPLETE' }]
const kpis = computed(() => summary.value ? [
  { label: '財務案件', value: summary.value.caseCount.toLocaleString('zh-TW'), icon: 'lucide:wallet-cards' },
  { label: '總服務費', value: formatCurrency(summary.value.totalServiceFee), icon: 'lucide:hand-coins' },
  { label: '待收服務費', value: formatCurrency(summary.value.outstandingEligibleReceivable), icon: 'lucide:file-clock' },
  { label: '待結算案件', value: summary.value.pendingSettlementCount.toLocaleString('zh-TW'), icon: 'lucide:clock-3' }
] : [])

const safeError = (error: unknown) => isAxiosError(error) && error.response?.status === 403 ? '目前帳號沒有財務中心存取權限。' : '財務資料暫時無法載入，請稍後再試。'
const listParams = (): FinanceListQuery => ({ page: filters.value.page, pageSize, ...(filters.value.search.trim() ? { search: filters.value.search.trim() } : {}), ...(filters.value.financeStatus ? { financeStatus: filters.value.financeStatus } : {}), ...(filters.value.settlementStatus ? { settlementStatus: filters.value.settlementStatus } : {}), ...(filters.value.paymentProgress ? { paymentProgress: filters.value.paymentProgress } : {}) })
const loadAll = async () => {
  errorMessage.value = ''
  try {
    const [summaryResponse, listResponse, discoveryResponse] = await Promise.all([financeApi.summary(), financeApi.list(listParams()), financeApi.uninitialized({ page: discoveryQuery.value.page, pageSize: 5, ...(discoveryQuery.value.search.trim() ? { search: discoveryQuery.value.search.trim() } : {}) })])
    summary.value = summaryResponse.data
    cases.value = listResponse.data.items
    caseTotal.value = listResponse.data.total
    discovery.value = discoveryResponse.data.items
    discoveryTotal.value = discoveryResponse.data.total
  } catch (error) { errorMessage.value = safeError(error) } finally { loading.value = false; refreshing.value = false }
}
const refresh = () => { refreshing.value = true; void loadAll() }
const applyFilters = () => { filters.value.page = 1; void loadAll() }
const applyDiscoverySearch = () => { discoveryQuery.value.page = 1; void loadAll() }
const changePage = (event: PageState) => { filters.value.page = event.page + 1; void loadAll() }
const changeDiscoveryPage = (event: PageState) => { discoveryQuery.value.page = event.page + 1; void loadAll() }
const viewDetail = (businessCaseId: string) => void router.push({ name: 'AdminFinanceDetail', params: { businessCaseId } })
const openInitialize = (item: FinanceBusinessCase) => { initializeCase.value = item; initializeForm.value = { buyerServiceFee: 0, sellerServiceFee: 0, variableCost: 0, actualCost: 0 }; initializeError.value = '' }
const closeInitialize = () => { if (!initializing.value) { initializeCase.value = null; initializeError.value = '' } }
const validInitializeForm = computed(() => Object.values(initializeForm.value).every((value) => Number.isSafeInteger(value) && value >= 0))
const initializeErrorMessage = (error: unknown) => {
  if (!isAxiosError(error)) return '建立財務資料失敗，請稍後再試。'
  const code = (error.response?.data as { error?: { code?: string } } | undefined)?.error?.code
  if (error.response?.status === 403) return '權限不足，無法建立財務資料。'
  if (code === 'FINANCE_CASE_NOT_ELIGIBLE') return '此案件目前不可建立財務資料。'
  if (code === 'FINANCE_ALREADY_EXISTS') return '此案件已建立財務資料。'
  if (code === 'FINANCE_CONFLICT') return '資料已被其他操作更新，請重新整理。'
  if (error.response?.status === 400) return '請確認所有金額皆為非負整數。'
  return '建立財務資料失敗，請稍後再試。'
}
const submitInitialize = async () => {
  if (!initializeCase.value || initializing.value) return
  if (!validInitializeForm.value) { initializeError.value = '請確認所有金額皆為非負整數。'; return }
  const businessCaseId = initializeCase.value.businessCaseId
  initializing.value = true; initializeError.value = ''
  try {
    await financeApi.initialize(businessCaseId, { ...initializeForm.value })
    toast.add({ severity: 'success', summary: '建立完成', detail: '財務資料已建立。', life: 3000 })
    initializeCase.value = null
    await loadAll()
    viewDetail(businessCaseId)
  } catch (error) {
    initializeError.value = initializeErrorMessage(error)
    if (isAxiosError(error) && error.response?.status === 409) await loadAll()
  } finally { initializing.value = false }
}
const hasPayableTotal = (item: FinanceReadModel) => item.paymentProgress.totalServiceFee > 0
const progressPercent = (item: FinanceReadModel) => hasPayableTotal(item) ? Math.round(item.paymentProgress.paymentProgressRate / 100) : 0
const primaryBlocker = (item: FinanceReadModel) => item.requiresAdminApproval ? '需最高管理者核准' : item.settlementReadiness.ready ? '已可進行結算' : readinessLabel(item.settlementReadiness.blockingReasons[0] || '')
const severity = (value: string | null): 'success' | 'warn' | 'secondary' => value === 'FROZEN' || value === 'FINALIZED' || value === 'CLOSED' ? 'success' : value === 'PAUSED' ? 'warn' : 'secondary'
onMounted(loadAll)
</script>

<template>
  <section class="finance-center">
    <header class="page-header"><div><p class="eyebrow">Finance Management</p><h1>財務中心</h1><p>集中檢視案件財務、收款進度與結算準備狀態。</p></div><Button label="重新整理" severity="secondary" outlined :loading="refreshing" @click="refresh"><template #icon><Icon icon="lucide:refresh-cw" /></template></Button></header>
    <div v-if="errorMessage" class="error-state" role="alert"><Icon icon="lucide:shield-alert" /><div><strong>載入失敗</strong><p>{{ errorMessage }}</p></div><Button label="重試" text @click="refresh" /></div>
    <div class="kpi-grid" aria-label="財務摘要"><template v-if="loading"><article v-for="index in 4" :key="`skeleton-${index}`" class="surface-card"><Skeleton width="45%" height="1rem" /><Skeleton width="70%" height="1.8rem" /></article></template><template v-else><article v-for="kpi in kpis" :key="kpi.label" class="surface-card kpi-card"><span class="icon-box"><Icon :icon="kpi.icon" /></span><div><small>{{ kpi.label }}</small><strong>{{ kpi.value }}</strong></div></article></template></div>

    <article class="surface-card discovery-section">
      <header class="section-header"><div><h2>尚未建立財務資料</h2><p>列出符合後端資格、但尚未初始化財務資料的案件。</p></div><Tag :value="`${discoveryTotal} 件`" severity="warn" /></header>
      <form class="compact-search" @submit.prevent="applyDiscoverySearch"><Icon icon="lucide:search" /><InputText v-model="discoveryQuery.search" aria-label="搜尋尚未初始化案件" placeholder="輸入案件編號前綴" /><Button type="submit" label="搜尋" severity="secondary" /></form>
      <div v-if="loading" class="discovery-grid"><Skeleton v-for="index in 3" :key="index" height="7rem" /></div><div v-else-if="!discovery.length" class="empty-state"><Icon icon="lucide:circle-check" /><strong>目前沒有尚未建立財務資料的案件</strong></div><div v-else class="discovery-grid"><article v-for="item in discovery" :key="item.businessCaseId" class="discovery-card"><div><strong>{{ item.caseNumber }}</strong><Tag value="尚未初始化" severity="warn" /></div><p>{{ categoryLabel(item.category) }} · {{ caseStatusLabel(item.status) }}</p><small>經辦識別：{{ item.assignedTo }}</small><Button v-if="authStore.isAdmin" label="建立財務資料" text aria-label="建立財務資料" title="建立財務資料" @click="openInitialize(item)"><template #icon><Icon icon="lucide:circle-plus" /></template></Button></article></div>
      <form v-if="initializeCase && authStore.isAdmin" class="initialize-card" @submit.prevent="submitInitialize">
        <header><div><p class="eyebrow">Initialize Finance</p><h3>建立財務資料 · {{ initializeCase.caseNumber }}</h3><small>僅提交初始金額，財務結果由後端計算。</small></div><Button type="button" text aria-label="關閉建立表單" title="關閉建立表單" :disabled="initializing" @click="closeInitialize"><template #icon><Icon icon="lucide:x" /></template></Button></header>
        <Message v-if="initializeError" severity="error" :closable="false">{{ initializeError }}</Message>
        <div class="initialize-fields"><label><span>買方服務費</span><InputNumber v-model="initializeForm.buyerServiceFee" input-id="buyer-service-fee" mode="currency" currency="TWD" locale="zh-TW" :min="0" :max-fraction-digits="0" :disabled="initializing" /></label><label><span>賣方服務費</span><InputNumber v-model="initializeForm.sellerServiceFee" input-id="seller-service-fee" mode="currency" currency="TWD" locale="zh-TW" :min="0" :max-fraction-digits="0" :disabled="initializing" /></label><label><span>變動成本</span><InputNumber v-model="initializeForm.variableCost" input-id="variable-cost" mode="currency" currency="TWD" locale="zh-TW" :min="0" :max-fraction-digits="0" :disabled="initializing" /></label><label><span>實際成本</span><InputNumber v-model="initializeForm.actualCost" input-id="actual-cost" mode="currency" currency="TWD" locale="zh-TW" :min="0" :max-fraction-digits="0" :disabled="initializing" /></label></div>
        <div class="initialize-actions"><Button type="button" label="取消" severity="secondary" text :disabled="initializing" @click="closeInitialize" /><Button type="submit" label="建立財務資料" class="initialize-submit" :loading="initializing" :disabled="initializing || !validInitializeForm"><template #icon><Icon icon="lucide:wallet-cards" /></template></Button></div>
      </form>
      <Paginator v-if="discoveryTotal > 5" :first="(discoveryQuery.page - 1) * 5" :rows="5" :total-records="discoveryTotal" @page="changeDiscoveryPage" />
    </article>

    <article class="surface-card list-section">
      <header class="section-header"><div><h2>已建立財務案件</h2><p>共 {{ caseTotal }} 件，篩選與分頁皆由伺服器處理。</p></div></header>
      <form class="filters" @submit.prevent="applyFilters">
        <label class="filter-field"><span>案件編號</span><span class="search-field"><Icon icon="lucide:search" /><InputText v-model="filters.search" placeholder="輸入案件編號前綴" /></span></label>
        <label class="filter-field"><span>財務狀態</span><Select v-model="filters.financeStatus" :options="statusOptions" option-label="label" option-value="value" placeholder="選擇財務狀態" /></label>
        <label class="filter-field"><span>結算狀態</span><Select v-model="filters.settlementStatus" :options="settlementOptions" option-label="label" option-value="value" placeholder="選擇結算狀態" /></label>
        <label class="filter-field"><span>收款進度</span><Select v-model="filters.paymentProgress" :options="progressOptions" option-label="label" option-value="value" placeholder="選擇收款進度" /></label>
        <Button type="submit" label="套用篩選" class="filter-button"><template #icon><Icon icon="lucide:filter" /></template></Button>
      </form>
      <div v-if="loading" class="loading-list"><Skeleton v-for="index in 5" :key="index" height="3.5rem" /></div><div v-else-if="!cases.length" class="empty-state"><Icon icon="lucide:file-clock" /><strong>目前沒有符合篩選條件的財務案件</strong><span>請調整搜尋或篩選條件後再試。</span></div>
      <DataTable v-else :value="cases" class="desktop-table" striped-rows>
        <Column header="案件"><template #body="{ data }"><strong>{{ data.businessCase.caseNumber }}</strong><small>{{ categoryLabel(data.businessCase.category) }}</small></template></Column><Column header="案件狀態"><template #body="{ data }"><Tag :value="caseStatusLabel(data.businessCase.status)" :severity="severity(data.businessCase.status)" /></template></Column><Column header="財務狀態"><template #body="{ data }"><Tag :value="financeStatusLabel(data.financeStatus)" :severity="severity(data.financeStatus)" /></template></Column><Column header="服務費"><template #body="{ data }">{{ formatCurrency(data.finance.totalServiceFee) }}</template></Column>
        <Column header="收款進度"><template #body="{ data }"><div class="progress-cell"><span>{{ formatCurrency(data.paymentProgress.eligibleReceivedAmount) }} / {{ formatCurrency(data.paymentProgress.totalServiceFee) }}</span><ProgressBar v-if="hasPayableTotal(data)" :value="progressPercent(data)" :show-value="false" /><span v-else class="empty-progress" aria-label="尚無應收金額"><span /></span></div></template></Column>
        <Column header="結算"><template #body="{ data }">{{ financeStatusLabel(data.settlementStatus) }}</template></Column><Column header="準備狀態"><template #body="{ data }"><span class="readiness"><Icon :icon="data.settlementReadiness.ready ? 'lucide:circle-check' : 'lucide:clock-3'" />{{ primaryBlocker(data) }}</span></template></Column><Column header="操作"><template #body="{ data }"><Button label="查看" text aria-label="查看" title="查看" @click="viewDetail(data.businessCase.businessCaseId)"><template #icon><Icon icon="lucide:eye" /></template></Button></template></Column>
      </DataTable>
      <div v-if="!loading && cases.length" class="mobile-cards"><article v-for="item in cases" :key="item.businessCase.businessCaseId" class="case-card"><header><div><strong>{{ item.businessCase.caseNumber }}</strong><small>{{ categoryLabel(item.businessCase.category) }} · {{ caseStatusLabel(item.businessCase.status) }}</small></div><Tag :value="financeStatusLabel(item.financeStatus)" :severity="severity(item.financeStatus)" /></header><p>服務費 {{ formatCurrency(item.finance.totalServiceFee) }}</p><div class="progress-cell"><span>已收 {{ formatCurrency(item.paymentProgress.eligibleReceivedAmount) }} / {{ formatCurrency(item.paymentProgress.totalServiceFee) }}</span><ProgressBar v-if="hasPayableTotal(item)" :value="progressPercent(item)" :show-value="false" /><span v-else class="empty-progress" aria-label="尚無應收金額"><span /></span></div><span class="readiness"><Icon :icon="item.settlementReadiness.ready ? 'lucide:circle-check' : 'lucide:clock-3'" />{{ primaryBlocker(item) }}</span><Button class="mobile-view-button" text aria-label="查看" title="查看" @click="viewDetail(item.businessCase.businessCaseId)"><template #icon><Icon icon="lucide:eye" /></template></Button></article></div>
      <Paginator v-if="caseTotal > pageSize" :first="(filters.page - 1) * pageSize" :rows="pageSize" :total-records="caseTotal" @page="changePage" />
    </article>
  </section>
</template>

<style scoped lang="scss">
.finance-center{display:grid;gap:20px;max-width:1600px;margin:0 auto;color:var(--text-main)}.page-header,.section-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.page-header h1,.section-header h2{margin:0}.page-header p,.section-header p{margin:5px 0 0;color:var(--text-muted)}.eyebrow{color:var(--accent-active)!important;font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.surface-card{padding:18px;border:1px solid var(--border-grey);border-radius:14px;background:var(--bg-card);box-shadow:var(--shadow-sm)}.kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.kpi-card{display:flex;align-items:center;gap:14px}.kpi-card small{display:block;color:var(--text-muted)}.kpi-card strong{display:block;margin-top:4px;font-size:1.35rem}.icon-box{display:grid;width:42px;height:42px;place-items:center;border-radius:10px;background:var(--bg-active);color:var(--accent-active)}.icon-box svg{width:21px;height:21px}.discovery-section,.list-section{display:grid;gap:16px}.compact-search{display:flex;align-items:center;gap:10px;max-width:34rem}.compact-search>svg,.search-field>svg{color:var(--text-muted)}.compact-search :deep(input),.search-field :deep(input){width:100%;border-color:var(--border-grey);background:var(--bg-main);color:var(--text-main)}.compact-search :deep(input){flex:1}.discovery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.discovery-card,.case-card{padding:14px;border:1px solid var(--border-grey);border-radius:11px;background:var(--bg-main)}.discovery-card>div,.case-card header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.discovery-card p,.discovery-card small{color:var(--text-muted)}.filters{display:grid;grid-template-columns:minmax(14rem,1fr) repeat(3,minmax(10rem,.55fr)) auto;align-items:end;gap:10px}.filter-field{display:grid;min-width:0;gap:6px;color:var(--text-main);font-size:.78rem;font-weight:650}.filter-field :deep(.p-select){width:100%}.search-field{display:flex;align-items:center;gap:8px}.search-field :deep(input){min-width:0}.filter-button{background:var(--accent);border-color:var(--accent);color:var(--primary-active)}.filter-button:not(:disabled):hover{background:var(--accent-hover);border-color:var(--accent-hover)}.desktop-table small{display:block;color:var(--text-muted)}.progress-cell{display:grid;min-width:10rem;gap:6px;font-size:.78rem;color:var(--text-muted)}.progress-cell :deep(.p-progressbar),.empty-progress{display:block;height:7px;overflow:hidden;border-radius:999px;background:var(--bg-track)}.empty-progress>span{display:block;width:0;height:100%}.readiness{display:inline-flex;align-items:center;gap:6px;color:var(--text-muted)}.readiness svg{flex:0 0 16px;width:16px;height:16px}.mobile-cards{display:none}.empty-state{display:grid;min-height:9rem;place-items:center;align-content:center;gap:7px;color:var(--text-muted);text-align:center}.empty-state svg{width:28px;height:28px}.loading-list{display:grid;gap:8px}.error-state{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--danger);border-radius:12px;background:var(--danger-bg);color:var(--text-main)}.error-state>svg{width:22px;height:22px;color:var(--danger)}.error-state p{margin:3px 0 0;color:var(--text-muted)}.error-state .p-button{margin-left:auto}
.initialize-card{display:grid;gap:14px;padding:16px;border:1px solid var(--accent-active);border-radius:12px;background:var(--bg-main)}.initialize-card>header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.initialize-card h3{margin:0}.initialize-card small{color:var(--text-muted)}.initialize-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.initialize-fields label{display:grid;gap:6px;color:var(--text-main);font-size:.82rem;font-weight:650}.initialize-fields :deep(.p-inputnumber),.initialize-fields :deep(input){width:100%}.initialize-actions{display:flex;justify-content:flex-end;gap:8px}.initialize-submit{background:var(--accent);border-color:var(--accent);color:var(--primary-active)}.initialize-submit:not(:disabled):hover{background:var(--accent-hover);border-color:var(--accent-hover)}
@media(max-width:1279px){.kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.discovery-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.filters{grid-template-columns:repeat(2,minmax(0,1fr))}.desktop-table :deep(th:nth-child(2)),.desktop-table :deep(td:nth-child(2)),.desktop-table :deep(th:nth-child(6)),.desktop-table :deep(td:nth-child(6)){display:none}}
@media(max-width:767px){.finance-center{gap:14px}.page-header{align-items:stretch;flex-direction:column}.kpi-grid,.discovery-grid,.filters,.initialize-fields{grid-template-columns:1fr}.surface-card{padding:14px}.compact-search{display:grid;grid-template-columns:auto 1fr}.compact-search>.p-button{grid-column:1/-1}.desktop-table{display:none}.mobile-cards{display:grid;gap:10px}.case-card{display:grid;gap:12px}.case-card p{margin:0}.progress-cell{min-width:0}.mobile-view-button{justify-self:end}.initialize-actions{display:grid;grid-template-columns:1fr}.initialize-actions :deep(.p-button){width:100%}.error-state{align-items:flex-start;flex-wrap:wrap}}
</style>
