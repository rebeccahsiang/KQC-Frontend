<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import ProgressBar from 'primevue/progressbar'
import Skeleton from 'primevue/skeleton'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import Tag from 'primevue/tag'
import { financeApi, type FinanceDetail, type FinanceHistory, type FinancePayment, type FinanceRisk, type FinanceSettlement } from '@/api/finance'
import { caseStatusLabel, categoryLabel, directionLabel, financeStatusLabel, formatCurrency, paymentStatusLabel, readinessLabel } from '@/config/finance'

const route = useRoute()
const router = useRouter()
const businessCaseId = computed(() => String(route.params.businessCaseId || ''))
const detail = ref<FinanceDetail | null>(null)
const payments = ref<FinancePayment[]>([])
const risks = ref<FinanceRisk[]>([])
const settlement = ref<FinanceSettlement | null>(null)
const history = ref<FinanceHistory>({ finance: [], settlement: [] })
const loading = ref(true)
const refreshing = ref(false)
const errorMessage = ref('')

const percent = computed(() => detail.value && detail.value.paymentProgress.totalServiceFee > 0 ? detail.value.paymentProgress.paymentProgressRate / 100 : 0)
const hasPayableTotal = computed(() => (detail.value?.paymentProgress.totalServiceFee || 0) > 0)
const historyEvents = computed(() => [...history.value.finance, ...history.value.settlement].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)))
const statusSeverity = (value: string | null): 'success' | 'warn' | 'secondary' => value === 'FROZEN' || value === 'FINALIZED' || value === 'CLOSED' ? 'success' : value === 'PAUSED' ? 'warn' : 'secondary'
const formatRate = (basisPoints?: number | null) => basisPoints == null ? '目前後端未提供' : `${(basisPoints / 100).toFixed(2)}%`
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
const paymentTypeLabel = (value?: string) => ({ DEPOSIT: '訂金', DOWN_PAYMENT: '頭期款', INSTALLMENT: '分期款', FINAL_PAYMENT: '尾款' }[value || ''] || value || '未分類')
const eventLabel = (value: string) => ({ INITIALIZED: '財務資料建立', INPUT_UPDATED: '財務資料更新', COMMISSION_RATE_APPROVED: '佣金率核准', CONTRIBUTION_APPROVED: '業績分配核准', FROZEN: '財務凍結', PAYMENT_RECORDED: '收款登錄', RISK_ADJUSTMENT_APPROVED: '風險調整核准', SETTLEMENT_FINALIZED: '結算完成' }[value] || '財務狀態更新')
const safeError = (error: unknown) => isAxiosError(error) && error.response?.status === 403 ? '目前帳號沒有此財務案件的存取權限。' : '財務案件詳情暫時無法載入。'

const load = async () => {
  errorMessage.value = ''
  try {
    const [detailResponse, paymentResponse, riskResponse, historyResponse] = await Promise.all([financeApi.detail(businessCaseId.value), financeApi.payments(businessCaseId.value), financeApi.risks(businessCaseId.value), financeApi.history(businessCaseId.value)])
    detail.value = detailResponse.data
    payments.value = paymentResponse.data
    risks.value = riskResponse.data
    history.value = historyResponse.data
    try { settlement.value = (await financeApi.settlement(businessCaseId.value)).data } catch (error) { if (!isAxiosError(error) || error.response?.status !== 404) throw error; settlement.value = null }
  } catch (error) { errorMessage.value = safeError(error) } finally { loading.value = false; refreshing.value = false }
}
const refresh = () => { refreshing.value = true; void load() }
const blockerText = computed(() => detail.value?.settlementReadiness.ready ? '已符合結算條件' : (detail.value?.settlementReadiness.blockingReasons || []).map(readinessLabel).join('、'))
onMounted(load)
</script>

<template>
  <section class="finance-detail">
    <Button label="返回財務中心" text class="back-button" @click="router.push({ name: 'AdminFinanceCenter' })"><template #icon><Icon icon="lucide:arrow-left" /></template></Button>
    <div v-if="loading" class="loading-state"><Skeleton height="5rem" /><div class="kpi-grid"><Skeleton v-for="index in 4" :key="index" height="6rem" /></div><Skeleton height="24rem" /></div>
    <div v-else-if="errorMessage" class="state-card error" role="alert"><Icon icon="lucide:shield-alert" /><strong>{{ errorMessage }}</strong><Button label="重試" text @click="refresh" /></div>
    <template v-else-if="detail">
      <header class="detail-header surface-card">
        <div><p class="eyebrow">Finance Detail</p><h1>財務案件詳情</h1><strong class="case-number">{{ detail.businessCase.caseNumber }}</strong><p>{{ categoryLabel(detail.businessCase.category) }} · {{ directionLabel(detail.businessCase.direction) }} · 經辦識別：{{ detail.businessCase.assignedTo }}</p></div>
        <div class="header-actions"><div class="tags"><Tag :value="caseStatusLabel(detail.businessCase.status)" :severity="statusSeverity(detail.businessCase.status)" /><Tag :value="financeStatusLabel(detail.financeStatus)" :severity="statusSeverity(detail.financeStatus)" /><Tag :value="financeStatusLabel(detail.settlementStatus)" :severity="statusSeverity(detail.settlementStatus)" /></div><Button label="重新整理" severity="secondary" outlined :loading="refreshing" @click="refresh"><template #icon><Icon icon="lucide:refresh-cw" /></template></Button></div>
      </header>

      <div class="kpi-grid">
        <article class="surface-card kpi"><Icon icon="lucide:wallet-cards" /><div><small>總服務費</small><strong>{{ formatCurrency(detail.paymentProgress.totalServiceFee) }}</strong></div></article>
        <article class="surface-card kpi"><Icon icon="lucide:hand-coins" /><div><small>已收服務費</small><strong>{{ formatCurrency(detail.paymentProgress.eligibleReceivedAmount) }}</strong></div></article>
        <article class="surface-card kpi"><Icon icon="lucide:clock-3" /><div><small>待收服務費</small><strong>{{ formatCurrency(detail.paymentProgress.remainingEligibleAmount) }}</strong></div></article>
        <article class="surface-card kpi"><Icon icon="lucide:circle-dollar-sign" /><div><small>收款進度</small><strong>{{ hasPayableTotal ? `${percent.toFixed(2)}%` : '尚無可計算的收款進度' }}</strong></div></article>
      </div>

      <Tabs value="summary" class="finance-tabs">
        <TabList><Tab value="summary">財務摘要</Tab><Tab value="payments">收款紀錄</Tab><Tab value="allocation">業績分配</Tab><Tab value="settlement">結算</Tab><Tab value="risks">風險調整</Tab><Tab value="history">歷程</Tab></TabList>
        <TabPanels>
          <TabPanel value="summary"><section class="tab-content"><h2><Icon icon="lucide:receipt-text" />財務摘要</h2><div class="statement"><div><span>買方服務費</span><strong>{{ detail.finance.buyerServiceFee == null ? '目前後端未提供' : formatCurrency(detail.finance.buyerServiceFee) }}</strong></div><div><span>賣方服務費</span><strong>{{ detail.finance.sellerServiceFee == null ? '目前後端未提供' : formatCurrency(detail.finance.sellerServiceFee) }}</strong></div><div><span>總服務費</span><strong>{{ formatCurrency(detail.finance.totalServiceFee) }}</strong></div><div><span>行政費</span><strong>{{ formatCurrency(detail.finance.administrativeCost) }}</strong></div><div class="total"><span>專案基礎利潤</span><strong>{{ formatCurrency(detail.finance.projectBaseProfit) }}</strong></div><div><span>核准佣金率</span><strong>{{ formatRate(detail.finance.approvedCommissionRate) }}</strong></div><div><span>基礎應計佣金</span><strong>{{ formatCurrency(detail.finance.baseAccruedCommission) }}</strong></div></div><section class="internal"><h3><Icon icon="lucide:lock-keyhole" />內部財務</h3><dl><div><dt>實際成本</dt><dd>{{ detail.finance.actualCost == null ? '目前後端未提供' : formatCurrency(detail.finance.actualCost) }}</dd></div><div><dt>固定成本</dt><dd>{{ detail.finance.fixedCost == null ? '目前後端未提供' : formatCurrency(detail.finance.fixedCost) }}</dd></div><div><dt>變動成本</dt><dd>{{ detail.finance.variableCost == null ? '目前後端未提供' : formatCurrency(detail.finance.variableCost) }}</dd></div><div><dt>版本</dt><dd>{{ detail.finance.revision }}</dd></div><div><dt>凍結時間</dt><dd>{{ formatDate(detail.finance.frozenAt) }}</dd></div></dl></section></section></TabPanel>

          <TabPanel value="payments"><section class="tab-content"><h2><Icon icon="lucide:hand-coins" />收款紀錄</h2><div class="payment-progress"><div><span>已收 {{ formatCurrency(detail.paymentProgress.eligibleReceivedAmount) }}</span><span>總額 {{ formatCurrency(detail.paymentProgress.totalServiceFee) }} · 待收 {{ formatCurrency(detail.paymentProgress.remainingEligibleAmount) }}</span></div><ProgressBar v-if="hasPayableTotal" :value="percent" :show-value="false" /><span v-else class="empty-track" aria-label="尚無可計算的收款進度" /><small>{{ hasPayableTotal ? `${percent.toFixed(2)}%` : '尚無可計算的收款進度' }}</small></div><div v-if="!payments.length" class="empty-state"><Icon icon="lucide:receipt-text" /><strong>尚無收款紀錄</strong></div><DataTable v-else :value="payments" class="desktop-only"><Column header="類型"><template #body="{ data }">{{ paymentTypeLabel(data.paymentType) }}</template></Column><Column field="amount" header="金額"><template #body="{ data }">{{ formatCurrency(data.amount) }}</template></Column><Column header="狀態"><template #body="{ data }">{{ paymentStatusLabel(data.status) }}</template></Column><Column header="時間"><template #body="{ data }">{{ formatDate(data.receivedAt || data.recordedAt) }}</template></Column><Column field="reference" header="參考編號" /></DataTable><div v-if="payments.length" class="mobile-list"><article v-for="(payment, index) in payments" :key="payment.id || index"><strong>{{ paymentTypeLabel(payment.paymentType) }} · {{ formatCurrency(payment.amount) }}</strong><span>{{ paymentStatusLabel(payment.status) }} · {{ formatDate(payment.receivedAt || payment.recordedAt) }}</span><small>{{ payment.reference || '無參考編號' }}</small></article></div></section></TabPanel>

          <TabPanel value="allocation"><section class="tab-content"><h2><Icon icon="lucide:chart-no-axes-column-increasing" />業績分配</h2><div class="allocation-grid"><article><span>買方業務識別</span><strong>{{ detail.finance.buyerSalesId || '目前後端未提供' }}</strong><small>貢獻率 {{ formatRate(detail.finance.buyerContributionRate) }}</small></article><article><span>賣方業務識別</span><strong>{{ detail.finance.sellerSalesId || '目前後端未提供' }}</strong><small>貢獻率 {{ formatRate(detail.finance.sellerContributionRate) }}</small></article></div><h3>基礎佣金分配</h3><div v-if="!detail.finance.baseCommissionAllocations?.length" class="empty-state"><Icon icon="lucide:badge-dollar-sign" /><strong>目前沒有分配資料</strong></div><div v-else class="record-list"><article v-for="row in detail.finance.baseCommissionAllocations" :key="row.salesId"><strong>{{ row.salesId }}</strong><span>{{ formatCurrency(row.amount) }}</span><small>{{ formatRate(row.contributionRate) }}</small></article></div><p class="note">業績調整顯示後端結果：{{ detail.finance.performanceAdjustmentPreview == null ? '目前後端未提供' : formatCurrency(detail.finance.performanceAdjustmentPreview) }}</p></section></TabPanel>

          <TabPanel value="settlement"><section class="tab-content"><h2><Icon icon="lucide:circle-check" />結算</h2><div v-if="!settlement" class="empty-state"><Icon icon="lucide:clock-3" /><strong>尚未建立結算資料</strong><span>{{ blockerText }}</span></div><dl v-else class="detail-grid"><div><dt>結算狀態</dt><dd>{{ financeStatusLabel(settlement.status) }}</dd></div><div><dt>已認列基礎佣金</dt><dd>{{ formatCurrency(settlement.recognizedBaseCommission || 0) }}</dd></div><div><dt>已釋放基礎佣金</dt><dd>{{ formatCurrency(settlement.releasedBaseCommission || 0) }}</dd></div><div><dt>風險準備佣金</dt><dd>{{ formatCurrency(settlement.riskReserveCommission || 0) }}</dd></div><div><dt>風險調整</dt><dd>{{ formatCurrency(settlement.riskAdjustmentTotal || 0) }}</dd></div><div><dt>未解決差額</dt><dd>{{ formatCurrency(settlement.unresolvedDeficit || 0) }}</dd></div><div><dt>完成時間</dt><dd>{{ formatDate(settlement.finalizedAt) }}</dd></div></dl><p class="note">{{ blockerText }}</p></section></TabPanel>

          <TabPanel value="risks"><section class="tab-content"><h2><Icon icon="lucide:shield-alert" />風險調整 <Tag :value="`${risks.length} 筆`" severity="secondary" /></h2><div v-if="!risks.length" class="empty-state"><Icon icon="lucide:shield-check" /><strong>目前沒有風險調整</strong></div><div v-else class="record-list"><article v-for="(risk, index) in risks" :key="risk.id || index"><strong>{{ formatCurrency(risk.amount) }}</strong><span>{{ risk.reason }}</span><small>{{ risk.status || '已核准' }} · {{ formatDate(risk.approvedAt) }}<template v-if="risk.approvedBy"> · {{ risk.approvedBy }}</template></small></article></div></section></TabPanel>

          <TabPanel value="history"><section class="tab-content"><h2><Icon icon="lucide:history" />歷程</h2><div v-if="!historyEvents.length" class="empty-state"><Icon icon="lucide:history" /><strong>目前沒有歷程紀錄</strong></div><ol v-else class="timeline"><li v-for="(event, index) in historyEvents" :key="`${event.occurredAt}-${index}`"><span class="timeline-dot" /><div><strong>{{ eventLabel(event.eventType) }}</strong><span>{{ formatDate(event.occurredAt) }}</span><small v-if="event.actorId">操作者識別：{{ event.actorId }}<template v-if="event.revision != null"> · 版本 {{ event.revision }}</template></small><small v-if="event.amount != null">金額：{{ formatCurrency(event.amount) }}</small></div></li></ol></section></TabPanel>
        </TabPanels>
      </Tabs>
    </template>
  </section>
</template>

<style scoped lang="scss">
.finance-detail{display:grid;max-width:1600px;margin:0 auto;gap:18px;color:var(--text-main)}.back-button{justify-self:start}.surface-card,.finance-tabs{border:1px solid var(--border-grey);border-radius:14px;background:var(--bg-card);box-shadow:var(--shadow-sm)}.detail-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:20px}.detail-header h1{margin:0}.detail-header p{margin:5px 0;color:var(--text-muted)}.eyebrow{color:var(--accent-active)!important;font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.case-number{display:block;margin-top:8px;font-size:1.25rem}.header-actions{display:flex;align-items:flex-end;flex-direction:column;gap:12px}.tags{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:7px}.kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.kpi{display:flex;align-items:center;gap:12px;padding:16px}.kpi>svg{width:24px;height:24px;color:var(--accent-active)}.kpi small,.kpi strong{display:block}.kpi small{color:var(--text-muted)}.kpi strong{margin-top:4px}.finance-tabs{overflow:hidden}.finance-tabs :deep(.p-tablist){overflow:hidden}.finance-tabs :deep(.p-tablist-tab-list){overflow-x:visible;overflow-y:hidden;flex-wrap:nowrap}.finance-tabs :deep(.p-tab){flex:1 1 auto;white-space:nowrap}.tab-content{display:grid;gap:18px;padding:4px}.tab-content h2,.internal h3{display:flex;align-items:center;gap:8px;margin:0}.tab-content h2>svg,.internal h3>svg{color:var(--accent-active)}.statement,.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--border-grey);border:1px solid var(--border-grey);border-radius:10px;overflow:hidden}.statement>div,.detail-grid>div{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px;background:var(--bg-main)}.statement span,.detail-grid dt{color:var(--text-muted)}.statement .total{grid-column:1/-1}.internal{display:grid;gap:12px;padding:16px;border:1px solid var(--border-grey);border-radius:10px;background:var(--bg-main)}.internal dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0}.internal dl div{min-width:0}.internal dt{color:var(--text-muted);font-size:.78rem}.internal dd{margin:4px 0 0;overflow-wrap:anywhere}.payment-progress{display:grid;gap:8px;padding:14px;border-radius:10px;background:var(--bg-main)}.payment-progress>div{display:flex;justify-content:space-between;gap:12px}.payment-progress :deep(.p-progressbar),.empty-track{display:block;height:8px;border-radius:999px;background:var(--bg-track)}.payment-progress small{color:var(--text-muted)}.allocation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.allocation-grid article,.record-list article,.mobile-list article{display:grid;gap:5px;padding:14px;border:1px solid var(--border-grey);border-radius:10px;background:var(--bg-main)}.allocation-grid span,.allocation-grid small,.record-list small,.mobile-list span,.mobile-list small,.note{color:var(--text-muted)}.record-list{display:grid;gap:10px}.empty-state,.state-card{display:grid;min-height:10rem;place-items:center;align-content:center;gap:8px;color:var(--text-muted);text-align:center}.empty-state>svg,.state-card>svg{width:30px;height:30px}.state-card{border:1px solid var(--border-grey);border-radius:14px;background:var(--bg-card)}.state-card.error{border-color:var(--danger);background:var(--danger-bg)}.loading-state{display:grid;gap:14px}.timeline{display:grid;gap:0;margin:0;padding:0;list-style:none}.timeline li{position:relative;display:grid;grid-template-columns:18px 1fr;gap:12px;padding-bottom:18px}.timeline li:not(:last-child)::before{position:absolute;top:13px;bottom:0;left:5px;width:2px;background:var(--border-grey);content:''}.timeline-dot{position:relative;z-index:1;width:12px;height:12px;margin-top:3px;border:3px solid var(--accent);border-radius:50%;background:var(--bg-card)}.timeline li div{display:grid;gap:3px}.timeline span,.timeline small{color:var(--text-muted)}.mobile-list{display:none}
@media(max-width:1023px){.kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.internal dl{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:767px){.detail-header{flex-direction:column}.header-actions{width:100%;align-items:stretch}.tags{justify-content:flex-start}.kpi-grid,.statement,.detail-grid,.allocation-grid,.internal dl{grid-template-columns:1fr}.statement .total{grid-column:auto}.desktop-only{display:none}.mobile-list{display:grid;gap:10px}.payment-progress>div{flex-direction:column}.tab-content{padding:0}.finance-tabs :deep(.p-tabpanels){padding:14px}.finance-tabs :deep(.p-tablist){overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}.finance-tabs :deep(.p-tablist-tab-list){width:max-content;min-width:100%;overflow:visible}.finance-tabs :deep(.p-tab){flex:0 0 auto}}
</style>
