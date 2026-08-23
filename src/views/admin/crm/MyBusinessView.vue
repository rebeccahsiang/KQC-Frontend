<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import { crmApi, type BusinessCaseListItem, type CalendarItem, type CreateCustomerInput, type CustomerListItem, type MyBusinessSummary } from '@/api/crm'
import { activityLabel, caseStatusLabel, categoryLabel, directionLabel, formatCurrency, formatDate } from '@/config/crm'

const summary = ref<MyBusinessSummary | null>(null)
const calendar = ref<CalendarItem[]>([])
const customers = ref<CustomerListItem[]>([])
const businessCases = ref<BusinessCaseListItem[]>([])
const loadingSummary = ref(true)
const loadingCalendar = ref(true)
const loadingCustomers = ref(true)
const loadingCases = ref(true)
const summaryError = ref('')
const calendarError = ref('')
const customerError = ref('')
const caseError = ref('')
const createCustomerVisible = ref(false)
const creatingCustomer = ref(false)
const createCustomerError = ref('')
const createCustomerSuccess = ref('')
const emptyCustomerForm = () => ({ customerType: 'PERSON' as 'PERSON' | 'COMPANY', name: '', companyName: '', taxId: '', representative: '', contactPerson: '', phone: '', mobile: '', email: '', address: '', grade: 'C' as 'A' | 'B' | 'C' | 'D', note: '' })
const customerForm = ref(emptyCustomerForm())
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const customerFormError = computed(() => {
  if (customerForm.value.customerType === 'PERSON' && !customerForm.value.name.trim()) return '請輸入客戶姓名。'
  if (customerForm.value.customerType === 'COMPANY' && !customerForm.value.companyName.trim()) return '請輸入公司名稱。'
  if (customerForm.value.email.trim() && !emailPattern.test(customerForm.value.email.trim())) return '請輸入有效的 Email。'
  return ''
})

const safeError = '資料暫時無法載入，請稍後再試。'
const calendarRange = () => {
  const from = new Date()
  const to = new Date(from.getTime() + 7 * 86400000)
  return { from: from.toISOString(), to: to.toISOString() }
}
const loadSummary = async () => { loadingSummary.value = true; summaryError.value = ''; try { summary.value = (await crmApi.myBusinessSummary()).data } catch { summaryError.value = safeError } finally { loadingSummary.value = false } }
const loadCalendar = async () => { loadingCalendar.value = true; calendarError.value = ''; try { const range = calendarRange(); calendar.value = (await crmApi.myBusinessCalendar(range.from, range.to)).data } catch { calendarError.value = safeError } finally { loadingCalendar.value = false } }
const loadCustomers = async () => { loadingCustomers.value = true; customerError.value = ''; try { customers.value = (await crmApi.customers()).data } catch { customerError.value = safeError } finally { loadingCustomers.value = false } }
const loadCases = async () => { loadingCases.value = true; caseError.value = ''; try { businessCases.value = (await crmApi.businessCases()).data } catch { caseError.value = safeError } finally { loadingCases.value = false } }
const refresh = () => { void Promise.all([loadSummary(), loadCalendar(), loadCustomers(), loadCases()]) }
const kpis = computed(() => summary.value ? [
  { label: '進行中', value: summary.value.metrics.operatingCount.toLocaleString('zh-TW'), icon: 'lucide:briefcase-business' },
  { label: '待跟進', value: summary.value.metrics.followUpDueCount.toLocaleString('zh-TW'), icon: 'lucide:clock-3' },
  { label: '本月結案', value: summary.value.metrics.monthlyClosedCount.toLocaleString('zh-TW'), icon: 'lucide:circle-check-big' },
  { label: '本月結案金額', value: formatCurrency(summary.value.metrics.monthlyClosedAmount), icon: 'lucide:badge-dollar-sign' }
] : [])
const time = (value: string) => formatDate(value, { hour: '2-digit', minute: '2-digit', hour12: false })
const contact = (customer: CustomerListItem) => customer.mobile || customer.phone || customer.email || '—'
const gradeSeverity = (grade: string): 'success' | 'info' | 'warn' | 'secondary' => grade === 'A' ? 'success' : grade === 'B' ? 'info' : grade === 'C' ? 'warn' : 'secondary'
const optional = (value: string) => value.trim() || undefined
const openCreateCustomer = () => { createCustomerError.value = ''; createCustomerSuccess.value = ''; createCustomerVisible.value = true }
const resetCustomerForm = () => { customerForm.value = emptyCustomerForm(); createCustomerError.value = '' }
const submitCustomer = async () => {
  if (creatingCustomer.value || customerFormError.value) return
  creatingCustomer.value = true
  createCustomerError.value = ''
  const shared = { phone: optional(customerForm.value.phone), mobile: optional(customerForm.value.mobile), email: optional(customerForm.value.email), address: optional(customerForm.value.address), grade: customerForm.value.grade, note: customerForm.value.note.trim() || null }
  const input: CreateCustomerInput = customerForm.value.customerType === 'PERSON'
    ? { customerType: 'PERSON', name: customerForm.value.name.trim(), ...shared }
    : { customerType: 'COMPANY', companyName: customerForm.value.companyName.trim(), taxId: optional(customerForm.value.taxId), representative: optional(customerForm.value.representative), contactPerson: optional(customerForm.value.contactPerson), ...shared }
  try {
    const created = (await crmApi.createCustomer(input)).data
    createCustomerVisible.value = false
    resetCustomerForm()
    await loadCustomers()
    createCustomerSuccess.value = `客戶建立成功，客戶編號：${created.customerNumber}`
  } catch { createCustomerError.value = '客戶建立失敗，請確認資料後再試。' } finally { creatingCustomer.value = false }
}

onMounted(refresh)
</script>

<template>
  <section class="my-business">
    <header class="page-header">
      <div><p class="eyebrow">CRM Workspace</p><h1>我的業務</h1><p>集中掌握今日行程、案件進度與客戶近況。</p></div>
      <div class="header-actions"><Button label="新增客戶" outlined @click="openCreateCustomer"><template #icon><Icon icon="lucide:user-plus" /></template></Button><Button label="新增業務" disabled title="即將推出"><template #icon><Icon icon="lucide:briefcase-business" /></template></Button><Button label="重新整理" severity="secondary" outlined @click="refresh"><template #icon><Icon icon="lucide:refresh-cw" /></template></Button></div>
    </header>
    <p v-if="createCustomerSuccess" class="success-message" role="status">{{ createCustomerSuccess }}</p>

    <article class="surface-card agenda-section">
      <header class="section-header"><div><p class="eyebrow">Today</p><h2>今日行程</h2><p>{{ formatDate(summary?.today.from || null) }}</p></div><Icon icon="lucide:calendar-days" /></header>
      <div v-if="loadingSummary" class="skeleton-list"><Skeleton v-for="i in 3" :key="i" height="3.4rem" /></div>
      <div v-else-if="summaryError" class="state error" role="alert"><Icon icon="lucide:triangle-alert" /><span>{{ summaryError }}</span><Button label="重試" text @click="loadSummary" /></div>
      <div v-else-if="!summary?.today.upcoming.length" class="state"><Icon icon="lucide:calendar-check" /><strong>今天沒有待辦行程</strong></div>
      <ol v-else class="timeline"><li v-for="item in summary.today.upcoming" :key="item.id"><time>{{ time(item.startAt) }}</time><span class="timeline-dot" /><div><strong>{{ activityLabel(item.activityType) }} · {{ item.customerName || '未命名客戶' }}</strong><small>{{ item.caseNumber || '尚無案件編號' }}</small><p>{{ item.content || '無補充內容' }}</p></div></li></ol>
    </article>

    <article class="surface-card claim-card">
      <span class="icon-box"><Icon icon="lucide:inbox" /></span><div><small>待認領</small><strong v-if="summary?.metrics.claimPendingCount != null">{{ summary.metrics.claimPendingCount }}</strong><strong v-else>資料尚未開放</strong><p v-if="summary?.gaps?.includes('CLAIM_PENDING_READ_GAP')">後端尚未提供可驗證的認領統計。</p></div>
    </article>

    <div class="kpi-grid"><template v-if="loadingSummary"><article v-for="i in 4" :key="i" class="surface-card"><Skeleton width="45%" /><Skeleton width="70%" height="1.7rem" /></article></template><article v-for="item in kpis" v-else :key="item.label" class="surface-card kpi-card"><span class="icon-box"><Icon :icon="item.icon" /></span><div><small>{{ item.label }}</small><strong>{{ item.value }}</strong></div></article></div>

    <article class="surface-card calendar-section">
      <header class="section-header"><div><h2>未來 7 天行程</h2><p>依下一步行動時間排列</p></div><Tag :value="`${calendar.length} 筆`" severity="secondary" /></header>
      <div v-if="loadingCalendar" class="skeleton-list"><Skeleton v-for="i in 4" :key="i" height="3rem" /></div><div v-else-if="calendarError" class="state error" role="alert"><span>{{ calendarError }}</span><Button label="重試" text @click="loadCalendar" /></div><div v-else-if="!calendar.length" class="state"><Icon icon="lucide:calendar-x" /><strong>未來 7 天沒有排定行程</strong></div>
      <div v-else class="calendar-list"><article v-for="item in calendar" :key="item.id"><time><strong>{{ formatDate(item.startAt, { month: '2-digit', day: '2-digit' }) }}</strong><span>{{ time(item.startAt) }}</span></time><span class="activity-mark" /><div><strong>{{ activityLabel(item.activityType) }}</strong><span>{{ item.customerName || '未命名客戶' }} · {{ item.caseNumber || '尚無案件編號' }}</span><small>{{ item.content || '無補充內容' }}</small></div></article></div>
    </article>

    <article class="surface-card data-section">
      <header class="section-header"><div><h2>我的案件</h2><p>查看目前由我負責的業務案件與進度</p></div></header>
      <div v-if="loadingCases" class="skeleton-list"><Skeleton v-for="i in 4" :key="i" height="3rem" /></div><div v-else-if="caseError" class="state error" role="alert"><span>{{ caseError }}</span><Button label="重試" text @click="loadCases" /></div><div v-else-if="!businessCases.length" class="state"><Icon icon="lucide:briefcase" /><strong>目前沒有案件</strong></div>
      <DataTable v-else :value="businessCases" class="desktop-table" striped-rows><Column field="caseNumber" header="案件編號"><template #body="{ data }">{{ data.caseNumber || '尚未編號' }}</template></Column><Column header="客戶"><template #body="{ data }"><div class="customer-cell"><strong>{{ data.customerDisplayName || '—' }}</strong><small>{{ data.customerNumber || '客戶資料未完整' }}</small></div></template></Column><Column header="類別"><template #body="{ data }">{{ categoryLabel(data.category) }}</template></Column><Column header="方向"><template #body="{ data }">{{ directionLabel(data.direction) }}</template></Column><Column header="狀態"><template #body="{ data }"><Tag :value="caseStatusLabel(data.status)" severity="secondary" /></template></Column><Column header="預估金額"><template #body="{ data }">{{ data.expectedAmount == null ? '—' : formatCurrency(data.expectedAmount) }}</template></Column><Column header="預計結案"><template #body="{ data }">{{ formatDate(data.expectedCloseDate) }}</template></Column></DataTable>
      <div v-if="!loadingCases && businessCases.length" class="mobile-cards"><article v-for="item in businessCases" :key="item.id"><header><strong>{{ item.caseNumber || '尚未編號' }}</strong><Tag :value="caseStatusLabel(item.status)" severity="secondary" /></header><p>{{ categoryLabel(item.category) }} · {{ directionLabel(item.direction) }}</p><div class="customer-cell"><strong>客戶：{{ item.customerDisplayName || '—' }}</strong><small>客戶編號：{{ item.customerNumber || '客戶資料未完整' }}</small></div><span>{{ item.expectedAmount == null ? '金額未定' : formatCurrency(item.expectedAmount) }} · {{ formatDate(item.expectedCloseDate) }}</span></article></div>
    </article>

    <article class="surface-card data-section">
      <header class="section-header"><div><h2>我的客戶</h2><p>管理我的客戶資料、聯絡進度與後續安排</p></div></header>
      <div v-if="loadingCustomers" class="skeleton-list"><Skeleton v-for="i in 4" :key="i" height="3rem" /></div><div v-else-if="customerError" class="state error" role="alert"><span>{{ customerError }}</span><Button label="重試" text @click="loadCustomers" /></div><div v-else-if="!customers.length" class="state"><Icon icon="lucide:users" /><strong>目前沒有客戶</strong></div>
      <DataTable v-else :value="customers" class="desktop-table" striped-rows><Column field="customerNumber" header="客戶編號" /><Column field="displayName" header="客戶名稱" /><Column header="等級"><template #body="{ data }"><Tag :value="data.grade" :severity="gradeSeverity(data.grade)" /></template></Column><Column header="聯絡方式"><template #body="{ data }">{{ contact(data) }}</template></Column><Column header="最近聯絡"><template #body="{ data }">{{ formatDate(data.latestContactAt) }}</template></Column><Column header="下一步"><template #body="{ data }">{{ formatDate(data.nextPlannedAt) }}</template></Column><Column header="案件"><template #body="{ data }">{{ data.hasBusinessCase ? '已有案件' : '尚無案件' }}</template></Column><Column header="備註"><template #body="{ data }">{{ data.note || '—' }}</template></Column></DataTable>
      <div v-if="!loadingCustomers && customers.length" class="mobile-cards"><article v-for="item in customers" :key="item.id"><header><div><strong>{{ item.displayName }}</strong><small>{{ item.customerNumber }}</small></div><Tag :value="item.grade" :severity="gradeSeverity(item.grade)" /></header><p>{{ contact(item) }}</p><span>{{ item.hasBusinessCase ? '已有案件' : '尚無案件' }} · 下一步 {{ formatDate(item.nextPlannedAt) }}</span><small>備註：{{ item.note || '—' }}</small></article></div>
    </article>

    <Dialog v-model:visible="createCustomerVisible" modal header="新增客戶" :style="{ width: '48rem', maxWidth: 'calc(100vw - 2rem)' }" :content-style="{ maxHeight: '70vh', overflowY: 'auto' }" @hide="createCustomerError = ''">
      <form id="create-customer-form" class="customer-form" @submit.prevent="submitCustomer">
        <label class="field"><span>客戶類型 *</span><select v-model="customerForm.customerType" required aria-required="true"><option value="PERSON">個人</option><option value="COMPANY">公司</option></select></label>
        <label v-if="customerForm.customerType === 'PERSON'" class="field"><span>客戶姓名 *</span><input v-model="customerForm.name" required aria-required="true" autocomplete="name" /></label>
        <template v-else>
          <label class="field"><span>公司名稱 *</span><input v-model="customerForm.companyName" required aria-required="true" /></label>
          <label class="field"><span>統一編號</span><input v-model="customerForm.taxId" inputmode="numeric" /></label>
          <label class="field"><span>負責人</span><input v-model="customerForm.representative" /></label>
          <label class="field"><span>聯絡人</span><input v-model="customerForm.contactPerson" autocomplete="name" /></label>
        </template>
        <label class="field"><span>電話</span><input v-model="customerForm.phone" type="tel" autocomplete="tel" /></label>
        <label class="field"><span>行動電話</span><input v-model="customerForm.mobile" type="tel" autocomplete="tel" /></label>
        <label class="field"><span>Email</span><input v-model="customerForm.email" type="email" autocomplete="email" /></label>
        <label class="field"><span>地址</span><input v-model="customerForm.address" autocomplete="street-address" /></label>
        <label class="field"><span>客戶等級</span><select v-model="customerForm.grade"><option v-for="grade in ['A', 'B', 'C', 'D']" :key="grade" :value="grade">{{ grade }}</option></select></label>
        <label class="field field-wide"><span>備註</span><textarea v-model="customerForm.note" maxlength="5000" rows="5" /><small>{{ customerForm.note.length }} / 5000</small></label>
        <p v-if="customerFormError" class="form-error field-wide" role="alert">{{ customerFormError }}</p>
        <p v-if="createCustomerError" class="form-error field-wide" role="alert">{{ createCustomerError }}</p>
      </form>
      <template #footer><Button label="取消" severity="secondary" outlined :disabled="creatingCustomer" @click="createCustomerVisible = false" /><Button type="submit" form="create-customer-form" label="建立客戶" :loading="creatingCustomer" :disabled="Boolean(customerFormError) || creatingCustomer" /></template>
    </Dialog>
  </section>
</template>

<style scoped lang="scss">
.my-business{display:grid;max-width:1600px;margin:0 auto;gap:18px;color:var(--text-main)}.page-header,.section-header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.page-header h1,.section-header h2{margin:0}.page-header p,.section-header p{margin:5px 0 0;color:var(--text-muted)}.eyebrow{color:var(--accent-active)!important;font-size:.74rem;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.header-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.surface-card{padding:18px;border:1px solid var(--border-grey);border-radius:14px;background:var(--bg-card);box-shadow:var(--shadow-sm)}.agenda-section,.calendar-section,.data-section{display:grid;gap:14px}.section-header>svg{width:28px;height:28px;color:var(--accent-active)}.timeline{display:grid;margin:0;padding:0;list-style:none}.timeline li{display:grid;grid-template-columns:3.5rem 12px 1fr;gap:10px;padding:10px 0}.timeline time{color:var(--accent-active);font-weight:750}.timeline-dot{width:10px;height:10px;margin-top:5px;border:2px solid var(--accent-active);border-radius:50%}.timeline li:not(:last-child) .timeline-dot::after{display:block;width:1px;height:55px;margin:8px 0 0 2.5px;background:var(--border-grey);content:""}.timeline div{display:grid;gap:3px}.timeline small,.timeline p{margin:0;color:var(--text-muted)}.claim-card,.kpi-card{display:flex;align-items:center;gap:13px}.claim-card p{margin:4px 0 0;color:var(--text-muted)}.claim-card strong,.kpi-card strong{display:block;margin-top:3px;font-size:1.3rem}.claim-card small,.kpi-card small{color:var(--text-muted)}.icon-box{display:grid;width:42px;height:42px;flex:0 0 42px;place-items:center;border-radius:10px;background:var(--bg-active);color:var(--accent-active)}.icon-box svg{width:21px;height:21px}.kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.calendar-list{display:grid;gap:8px}.calendar-list article{display:grid;grid-template-columns:5rem 8px 1fr;align-items:center;gap:10px;padding:11px;border:1px solid var(--border-grey);border-radius:10px;background:var(--bg-main)}.calendar-list time,.calendar-list article>div{display:grid;gap:2px}.calendar-list time span,.calendar-list article span,.calendar-list article small{color:var(--text-muted)}.activity-mark{width:8px;height:32px;border-radius:999px;background:var(--accent-active)}.desktop-table :deep(td){vertical-align:top}.mobile-cards{display:none}.mobile-cards article{display:grid;gap:8px;padding:13px;border:1px solid var(--border-grey);border-radius:10px;background:var(--bg-main)}.mobile-cards header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.mobile-cards header div{display:grid}.mobile-cards p{margin:0}.mobile-cards small,.mobile-cards span{color:var(--text-muted)}.skeleton-list{display:grid;gap:8px}.state{display:flex;min-height:7rem;align-items:center;justify-content:center;gap:8px;color:var(--text-muted);text-align:center}.state>svg{width:24px;height:24px}.state.error{min-height:auto;justify-content:flex-start;padding:11px;border:1px solid var(--danger);border-radius:10px;background:var(--danger-bg)}.state.error .p-button{margin-left:auto}
.customer-cell{display:grid;gap:2px}.customer-cell small{color:var(--text-muted)}.customer-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field{display:grid;gap:6px;font-weight:650}.field input,.field select,.field textarea{width:100%;padding:.7rem .75rem;border:1px solid var(--border-grey);border-radius:8px;background:var(--bg-main);color:var(--text-main);font:inherit}.field textarea{resize:vertical}.field small{justify-self:end;color:var(--text-muted);font-weight:400}.field-wide{grid-column:1/-1}.form-error{margin:0;color:var(--danger)}.success-message{margin:0;padding:11px 14px;border:1px solid var(--success);border-radius:10px;background:var(--success-bg);color:var(--text-main)}
@media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.desktop-table{display:block;overflow-x:auto}}
@media(max-width:767px){.my-business{gap:13px}.page-header{flex-direction:column}.header-actions{display:grid;width:100%;grid-template-columns:1fr 1fr}.header-actions .p-button:last-child{grid-column:1/-1}.surface-card{padding:14px}.kpi-grid,.customer-form{grid-template-columns:1fr}.calendar-list article{grid-template-columns:4.5rem 7px 1fr}.desktop-table{display:none}.mobile-cards{display:grid;gap:9px}.section-header{align-items:center}.timeline li{grid-template-columns:3rem 10px 1fr}}
</style>
