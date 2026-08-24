<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import { crmApi, type ActiveProspectDevelopmentStatus, type BusinessCaseListItem, type CalendarItem, type CreateCustomerInput, type CreateProspectInput, type CustomerListItem, type MyBusinessSummary, type PlannedActivityType, type ProspectDetail, type ProspectFollowUpDetail, type ProspectFollowUpListItem, type ProspectFollowUpOutcome, type ProspectGrade, type ProspectListItem, type ProspectPlannedActivityDetail, type ProspectPlannedActivityListItem, type ProspectType, type UpdateProspectInput } from '@/api/crm'
import { activityLabel, caseStatusLabel, categoryLabel, directionLabel, formatCurrency, formatDate, PLANNED_ACTIVITY_TYPE_LABELS, PROSPECT_FOLLOW_UP_OUTCOME_LABELS, PROSPECT_GRADE_PRESENTATION, PROSPECT_STATUS_LABELS, prospectStatusLabel } from '@/config/crm'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const summary = ref<MyBusinessSummary | null>(null)
const calendar = ref<CalendarItem[]>([])
const customers = ref<CustomerListItem[]>([])
const businessCases = ref<BusinessCaseListItem[]>([])
const prospects = ref<ProspectListItem[]>([])
const loadingSummary = ref(true)
const loadingCalendar = ref(true)
const loadingCustomers = ref(true)
const loadingCases = ref(true)
const loadingProspects = ref(true)
const summaryError = ref('')
const calendarError = ref('')
const customerError = ref('')
const caseError = ref('')
const prospectError = ref('')
const prospectSuccess = ref('')
const prospectDetail = ref<ProspectDetail | null>(null)
const detailProspectVisible = ref(false)
const loadingProspectDetail = ref(false)
const prospectFormVisible = ref(false)
const editingProspect = ref(false)
const savingProspect = ref(false)
const prospectFormError = ref('')
const prospectConflict = ref(false)
const plannedActivities = ref<ProspectPlannedActivityListItem[]>([])
const loadingPlannedActivities = ref(false)
const plannedActivityError = ref('')
const plannedActivityMessage = ref('')
const plannedActivityFilter = ref<'upcoming' | 'overdue' | 'all'>('upcoming')
const plannedActivityNow = ref(Date.now())
let plannedActivityClockTimer: ReturnType<typeof setInterval> | null = null
const activityFormVisible = ref(false)
const editingActivity = ref(false)
const savingActivity = ref(false)
const activityFormError = ref('')
const activityConflict = ref(false)
const selectedActivity = ref<ProspectPlannedActivityDetail | null>(null)
const cancelActivityVisible = ref(false)
const cancellingActivity = ref(false)
const cancelActivityError = ref('')
const cancelActivityConflict = ref(false)
const cancellationReason = ref('')
/* Follow-up request state is intentionally independent from Prospect and Planned Activity loaders. */
const followUps = ref<ProspectFollowUpListItem[]>([])
const loadingFollowUps = ref(false)
const followUpError = ref('')
const followUpMessage = ref('')
const followUpFormVisible = ref(false)
const editingFollowUp = ref(false)
const savingFollowUp = ref(false)
const followUpFormError = ref('')
const followUpConflict = ref(false)
const selectedFollowUp = ref<ProspectFollowUpDetail | null>(null)
const deleteFollowUpVisible = ref(false)
const deletingFollowUp = ref(false)
const deleteFollowUpError = ref('')
const completeActivityVisible = ref(false)
const completingActivity = ref(false)
const completeActivityError = ref('')
const completeActivityConflict = ref(false)
const createCustomerVisible = ref(false)
const creatingCustomer = ref(false)
const createCustomerError = ref('')
const createCustomerSuccess = ref('')
const emptyCustomerForm = () => ({ customerType: 'PERSON' as 'PERSON' | 'COMPANY', name: '', companyName: '', taxId: '', representative: '', contactPerson: '', phone: '', mobile: '', email: '', address: '', grade: 'C' as 'A' | 'B' | 'C' | 'D', note: '' })
const customerForm = ref(emptyCustomerForm())
const emptyProspectForm = () => ({ prospectType: 'PERSON' as ProspectType, name: '', companyName: '', taxId: '', representative: '', contactPerson: '', phone: '', mobile: '', email: '', address: '', prospectGrade: 'NORMAL' as ProspectGrade, developmentStatus: 'NEW_CONTACT' as ActiveProspectDevelopmentStatus, note: '', revision: 0 })
const prospectForm = ref(emptyProspectForm())
const activeProspectStatuses = ['NEW_CONTACT', 'CULTIVATING', 'INTERESTED', 'ON_HOLD'] as const
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
const loadProspects = async () => { loadingProspects.value = true; prospectError.value = ''; try { prospects.value = (await crmApi.listMyProspects()).data } catch { prospectError.value = safeError } finally { loadingProspects.value = false } }
const refresh = () => { void Promise.all([loadSummary(), loadCalendar(), loadCustomers(), loadCases(), loadProspects()]) }
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
const prospectContact = (prospect: ProspectListItem) => prospect.mobile || prospect.phone || prospect.email || '—'
const prospectGrade = (grade: ProspectGrade) => PROSPECT_GRADE_PRESENTATION[grade]
const prospectTypeLabel = (type: ProspectType) => type === 'PERSON' ? '個人' : '公司'
const prospectValidation = computed(() => {
  if (prospectForm.value.prospectType === 'PERSON' && !prospectForm.value.name.trim()) return '請填寫開發客戶姓名。'
  if (prospectForm.value.prospectType === 'COMPANY' && !prospectForm.value.companyName.trim()) return '請填寫公司名稱。'
  if (prospectForm.value.email.trim() && !emailPattern.test(prospectForm.value.email.trim())) return '請填寫有效的 Email。'
  return ''
})
const resetProspectForm = () => { prospectForm.value = emptyProspectForm(); prospectFormError.value = ''; prospectConflict.value = false; editingProspect.value = false }
const openCreateProspect = () => { resetProspectForm(); prospectSuccess.value = ''; prospectFormVisible.value = true }
const fillProspectForm = (detail: ProspectDetail) => {
  prospectForm.value = {
    prospectType: detail.prospectType, name: detail.name || '', companyName: detail.companyName || '',
    taxId: detail.taxId || '', representative: detail.representative || '', contactPerson: detail.contactPerson || '',
    phone: detail.phone || '', mobile: detail.mobile || '', email: detail.email || '', address: detail.address || '',
    prospectGrade: detail.prospectGrade,
    developmentStatus: detail.developmentStatus === 'CONVERTED' ? 'ON_HOLD' : detail.developmentStatus,
    note: detail.note || '', revision: detail.revision
  }
}
const emptyActivityForm = () => ({ activityType: 'PHONE' as PlannedActivityType, title: '', startAt: '', content: '', revision: 0 })
const activityForm = ref(emptyActivityForm())
const activityIsOverdue = (item: ProspectPlannedActivityListItem) => item.status === 'PENDING' && new Date(item.startAt).getTime() < plannedActivityNow.value
const activityStatusLabel = (item: ProspectPlannedActivityListItem) => item.status === 'COMPLETED' ? '已完成' : item.status === 'CANCELLED' ? '已取消' : activityIsOverdue(item) ? '過期未執行' : '待執行'
const filteredPlannedActivities = computed(() => plannedActivities.value.filter((item) => plannedActivityFilter.value === 'all' || (plannedActivityFilter.value === 'overdue' ? activityIsOverdue(item) : item.status === 'PENDING' && !activityIsOverdue(item))))
const activityCounts = computed(() => ({ upcoming: plannedActivities.value.filter((item) => item.status === 'PENDING' && !activityIsOverdue(item)).length, overdue: plannedActivities.value.filter(activityIsOverdue).length, all: plannedActivities.value.length }))
const activityEmptyMessage = computed(() => plannedActivityFilter.value === 'upcoming' ? '目前沒有待執行行程' : plannedActivityFilter.value === 'overdue' ? '目前沒有過期未執行行程' : '目前沒有行程紀錄')
const plannedActivityDateTime = (value: string) => {
  const parts = new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).formatToParts(new Date(value))
  const part = (type: 'year' | 'month' | 'day' | 'dayPeriod' | 'hour' | 'minute') => parts.find((item) => item.type === type)?.value || ''
  return `${part('year')}/${part('month')}/${part('day')} ${part('dayPeriod')} ${part('hour')}:${part('minute')}`
}
/* One view-local clock drives overdue and edit-window presentation only; it never schedules network work. */
const stopPlannedActivityClock = () => {
  if (plannedActivityClockTimer !== null) { clearInterval(plannedActivityClockTimer); plannedActivityClockTimer = null }
}
const startPlannedActivityClock = () => {
  stopPlannedActivityClock()
  plannedActivityNow.value = Date.now()
  plannedActivityClockTimer = setInterval(() => { plannedActivityNow.value = Date.now() }, 30000)
}
const toLocalDateTimeInput = (value: string) => {
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
const localNowInput = () => toLocalDateTimeInput(new Date().toISOString())
const emptyFollowUpForm = () => ({ occurredAt: localNowInput(), activityType: 'PHONE' as PlannedActivityType, content: '', outcome: '' as ProspectFollowUpOutcome | '', outcomeNote: '', revision: 0 })
const followUpForm = ref(emptyFollowUpForm())
/* Optional next-activity fields remain dormant until explicitly enabled and are submitted inside completion. */
const emptyCompletionForm = () => ({ occurredAt: localNowInput(), activityType: 'PHONE' as PlannedActivityType, content: '', outcome: '' as ProspectFollowUpOutcome | '', outcomeNote: '', revision: 0, nextEnabled: false, nextActivityType: 'PHONE' as PlannedActivityType, nextTitle: '', nextStartAt: '', nextContent: '' })
const completionForm = ref(emptyCompletionForm())
const followUpValidation = computed(() => {
  if (!followUpForm.value.content.trim()) return '請輸入聯絡內容。'
  if (!followUpForm.value.outcome) return '請選擇聯絡結果。'
  const occurredAt = new Date(followUpForm.value.occurredAt)
  if (!followUpForm.value.occurredAt || Number.isNaN(occurredAt.getTime()) || occurredAt.getTime() > Date.now()) return '聯絡時間不可晚於現在。'
  return ''
})
const completionValidation = computed(() => {
  if (!completionForm.value.content.trim()) return '請輸入聯絡內容。'
  if (!completionForm.value.outcome) return '請選擇聯絡結果。'
  const occurredAt = new Date(completionForm.value.occurredAt)
  if (!completionForm.value.occurredAt || Number.isNaN(occurredAt.getTime()) || occurredAt.getTime() > Date.now()) return '聯絡時間不可晚於現在。'
  if (completionForm.value.nextEnabled && (!completionForm.value.nextTitle.trim() || !completionForm.value.nextStartAt || new Date(completionForm.value.nextStartAt).getTime() < Date.now())) return '請輸入未來的下一步行程時間與標題。'
  return ''
})
/* Eligibility is presentation-only: immutable createdAt, original author DTO, and the shared local clock; Backend remains authoritative. */
const followUpCanMutate = (item: ProspectFollowUpListItem) => prospectDetail.value?.developmentStatus !== 'CONVERTED'
  && Boolean(authStore.user?._id)
  && item.responsibleSalesId === authStore.user?._id
  && plannedActivityNow.value < new Date(item.createdAt).getTime() + 24 * 60 * 60 * 1000
const loadFollowUps = async (prospectId: string) => {
  loadingFollowUps.value = true; followUpError.value = ''; plannedActivityNow.value = Date.now()
  try { followUps.value = (await crmApi.myProspectFollowUps(prospectId)).data } catch { followUpError.value = '聯絡紀錄載入失敗，請稍後再試。' } finally { loadingFollowUps.value = false }
}
const resetFollowUpForm = () => { followUpForm.value = emptyFollowUpForm(); selectedFollowUp.value = null; editingFollowUp.value = false; followUpFormError.value = ''; followUpConflict.value = false }
const openCreateFollowUp = () => { resetFollowUpForm(); followUpMessage.value = ''; followUpFormVisible.value = true }
const openEditFollowUp = async (item: ProspectFollowUpListItem) => {
  if (!prospectDetail.value || !followUpCanMutate(item)) return
  savingFollowUp.value = true; followUpFormError.value = ''; followUpConflict.value = false
  try {
    const detail = (await crmApi.myProspectFollowUp(prospectDetail.value.id, item.id)).data
    if (!followUpCanMutate(detail)) { followUpMessage.value = '這筆聯絡紀錄屬於歷史紀錄，目前只能查看。'; await loadFollowUps(prospectDetail.value.id); return }
    selectedFollowUp.value = detail
    followUpForm.value = { occurredAt: toLocalDateTimeInput(detail.occurredAt), activityType: detail.activityType, content: detail.content, outcome: detail.outcome, outcomeNote: detail.outcomeNote || '', revision: detail.revision }
    editingFollowUp.value = true; followUpFormVisible.value = true
  } catch { followUpError.value = '聯絡紀錄載入失敗，請稍後再試。' } finally { savingFollowUp.value = false }
}
const submitFollowUp = async () => {
  if (!prospectDetail.value || savingFollowUp.value || followUpValidation.value || !followUpForm.value.outcome) return
  const outcome = followUpForm.value.outcome
  savingFollowUp.value = true; followUpFormError.value = ''; followUpConflict.value = false
  const input = { occurredAt: new Date(followUpForm.value.occurredAt).toISOString(), activityType: followUpForm.value.activityType, content: followUpForm.value.content.trim(), outcome, outcomeNote: followUpForm.value.outcomeNote.trim() || null }
  try {
    if (editingFollowUp.value && selectedFollowUp.value) await crmApi.updateMyProspectFollowUp(prospectDetail.value.id, selectedFollowUp.value.id, { ...input, revision: followUpForm.value.revision })
    else await crmApi.createMyProspectFollowUp(prospectDetail.value.id, input)
    const message = editingFollowUp.value ? '聯絡紀錄已更新。' : '聯絡紀錄已新增。'
    followUpFormVisible.value = false; resetFollowUpForm(); followUpMessage.value = message; await loadFollowUps(prospectDetail.value.id)
  } catch (error) {
    const code = backendErrorCode(error)
    if (code === 'PROSPECT_FOLLOW_UP_REVISION_CONFLICT') { followUpConflict.value = true; followUpFormError.value = '這筆聯絡紀錄已在其他地方更新，請重新載入後再編輯。' }
    else if (code === 'PROSPECT_FOLLOW_UP_EDIT_WINDOW_EXPIRED') { followUpFormVisible.value = false; followUpMessage.value = '這筆聯絡紀錄已超過 24 小時修改期限，現在只能查看。'; await loadFollowUps(prospectDetail.value.id) }
    else if (code === 'PROSPECT_FOLLOW_UP_READ_ONLY') { followUpFormVisible.value = false; followUpMessage.value = '這筆聯絡紀錄屬於歷史紀錄，目前只能查看。'; await loadFollowUps(prospectDetail.value.id) }
    else followUpFormError.value = '聯絡紀錄儲存失敗，請確認資料後再試。'
  } finally { savingFollowUp.value = false }
}
const reloadFollowUpForEdit = async () => { if (selectedFollowUp.value) await openEditFollowUp(selectedFollowUp.value) }
const openDeleteFollowUp = (item: ProspectFollowUpListItem) => { if (!followUpCanMutate(item)) return; selectedFollowUp.value = item; deleteFollowUpError.value = ''; deleteFollowUpVisible.value = true }
const submitDeleteFollowUp = async () => {
  if (!prospectDetail.value || !selectedFollowUp.value || deletingFollowUp.value) return
  deletingFollowUp.value = true; deleteFollowUpError.value = ''
  try { await crmApi.deleteMyProspectFollowUp(prospectDetail.value.id, selectedFollowUp.value.id, selectedFollowUp.value.revision); deleteFollowUpVisible.value = false; followUpMessage.value = '聯絡紀錄已刪除。'; await loadFollowUps(prospectDetail.value.id) }
  catch (error) {
    const code = backendErrorCode(error)
    deleteFollowUpError.value = code === 'PROSPECT_FOLLOW_UP_REVISION_CONFLICT' ? '這筆聯絡紀錄已在其他地方更新，請重新載入後再編輯。' : code === 'PROSPECT_FOLLOW_UP_EDIT_WINDOW_EXPIRED' ? '這筆聯絡紀錄已超過 24 小時修改期限，現在只能查看。' : '這筆聯絡紀錄屬於歷史紀錄，目前只能查看。'
    if (code !== 'PROSPECT_FOLLOW_UP_REVISION_CONFLICT') { deleteFollowUpVisible.value = false; followUpMessage.value = deleteFollowUpError.value; await loadFollowUps(prospectDetail.value.id) }
  } finally { deletingFollowUp.value = false }
}
/* Completion is one atomic API command; optional next activity is nested in that same request. */
const openCompleteActivity = (item: ProspectPlannedActivityListItem) => { selectedActivity.value = { ...item, completedBy: null, cancelledBy: null }; completionForm.value = { ...emptyCompletionForm(), activityType: item.activityType, revision: item.revision }; completeActivityError.value = ''; completeActivityConflict.value = false; completeActivityVisible.value = true }
const submitCompleteActivity = async () => {
  if (!prospectDetail.value || !selectedActivity.value || completingActivity.value || completionValidation.value || !completionForm.value.outcome) return
  const outcome = completionForm.value.outcome
  completingActivity.value = true; completeActivityError.value = ''; completeActivityConflict.value = false
  const nextActivity = completionForm.value.nextEnabled ? { activityType: completionForm.value.nextActivityType, title: completionForm.value.nextTitle.trim(), content: completionForm.value.nextContent.trim() || null, startAt: new Date(completionForm.value.nextStartAt).toISOString() } : undefined
  try {
    await crmApi.completeMyProspectPlannedActivity(prospectDetail.value.id, selectedActivity.value.id, { revision: completionForm.value.revision, occurredAt: new Date(completionForm.value.occurredAt).toISOString(), activityType: completionForm.value.activityType, content: completionForm.value.content.trim(), outcome, outcomeNote: completionForm.value.outcomeNote.trim() || null, ...(nextActivity ? { nextActivity } : {}) })
    completeActivityVisible.value = false; plannedActivityMessage.value = '行程已完成並建立聯絡紀錄。'; await Promise.all([loadPlannedActivities(prospectDetail.value.id), loadFollowUps(prospectDetail.value.id)])
  } catch (error) {
    const code = backendErrorCode(error)
    if (code === 'PLANNED_ACTIVITY_REVISION_CONFLICT') { completeActivityConflict.value = true; completeActivityError.value = '這筆行程已在其他地方更新，請重新載入後再操作。' }
    else if (code === 'PLANNED_ACTIVITY_READ_ONLY') { completeActivityVisible.value = false; plannedActivityMessage.value = '這筆行程目前已無法完成，資料已重新載入。'; await loadPlannedActivities(prospectDetail.value.id) }
    else completeActivityError.value = '完成行程失敗，請確認資料後再試。'
  } finally { completingActivity.value = false }
}
const reloadCompletionActivity = async () => { if (!prospectDetail.value) return; completeActivityVisible.value = false; await loadPlannedActivities(prospectDetail.value.id) }
const loadPlannedActivities = async (prospectId: string) => {
  loadingPlannedActivities.value = true; plannedActivityError.value = ''; plannedActivityNow.value = Date.now()
  try { plannedActivities.value = (await crmApi.myProspectPlannedActivities(prospectId)).data } catch { plannedActivityError.value = '行程資料載入失敗，請稍後再試。' } finally { loadingPlannedActivities.value = false }
}
const resetActivityForm = () => { activityForm.value = emptyActivityForm(); activityFormError.value = ''; activityConflict.value = false; editingActivity.value = false; selectedActivity.value = null }
const openCreateActivity = () => { resetActivityForm(); plannedActivityMessage.value = ''; activityFormVisible.value = true }
const openEditActivity = async (item: ProspectPlannedActivityListItem) => {
  if (!prospectDetail.value || item.status !== 'PENDING') return
  savingActivity.value = true; activityFormError.value = ''; activityConflict.value = false; plannedActivityMessage.value = ''
  try {
    const detail = (await crmApi.myProspectPlannedActivity(prospectDetail.value.id, item.id)).data
    if (detail.status !== 'PENDING') { activityFormVisible.value = false; plannedActivityMessage.value = '這筆行程目前已無法編輯，資料已重新載入。'; await loadPlannedActivities(prospectDetail.value.id); return }
    selectedActivity.value = detail
    activityForm.value = { activityType: detail.activityType, title: detail.title, startAt: toLocalDateTimeInput(detail.startAt), content: detail.content || '', revision: detail.revision }
    editingActivity.value = true; activityFormVisible.value = true
  } catch { plannedActivityError.value = '行程資料載入失敗，請稍後再試。' } finally { savingActivity.value = false }
}
const activityValidation = computed(() => {
  if (!activityForm.value.title.trim()) return '請輸入行程標題。'
  const startAt = new Date(activityForm.value.startAt)
  if (!activityForm.value.startAt || Number.isNaN(startAt.getTime())) return '請選擇有效的行程時間。'
  if (startAt.getTime() < Date.now()) return '行程時間不可早於目前時間。'
  return ''
})
const submitActivity = async () => {
  if (!prospectDetail.value || savingActivity.value || activityValidation.value) return
  savingActivity.value = true; activityFormError.value = ''; activityConflict.value = false
  const input = { activityType: activityForm.value.activityType, title: activityForm.value.title.trim(), content: activityForm.value.content.trim() || null, startAt: new Date(activityForm.value.startAt).toISOString() }
  try {
    if (editingActivity.value && selectedActivity.value) await crmApi.updateMyProspectPlannedActivity(prospectDetail.value.id, selectedActivity.value.id, { ...input, revision: activityForm.value.revision })
    else await crmApi.createMyProspectPlannedActivity(prospectDetail.value.id, input)
    const successMessage = editingActivity.value ? '行程已更新。' : '行程已新增。'
    activityFormVisible.value = false; resetActivityForm(); plannedActivityMessage.value = successMessage; await loadPlannedActivities(prospectDetail.value.id)
  } catch (error) {
    const code = backendErrorCode(error)
    if (code === 'PLANNED_ACTIVITY_REVISION_CONFLICT') { activityConflict.value = true; activityFormError.value = '這筆行程已在其他地方更新，請重新載入後再編輯。' }
    else if (code === 'PLANNED_ACTIVITY_READ_ONLY') { activityFormVisible.value = false; plannedActivityMessage.value = '這筆行程目前已無法編輯，資料已重新載入。'; await loadPlannedActivities(prospectDetail.value.id) }
    else if (code === 'PROSPECT_CONVERTED_READ_ONLY') { activityFormVisible.value = false; await loadProspectDetail(prospectDetail.value.id) }
    else activityFormError.value = '行程儲存失敗，請檢查資料後再試。'
  } finally { savingActivity.value = false }
}
const reloadActivityForEdit = async () => { if (selectedActivity.value) await openEditActivity(selectedActivity.value) }
const openCancelActivity = (item: ProspectPlannedActivityListItem) => { selectedActivity.value = { ...item, completedBy: null, cancelledBy: null }; cancellationReason.value = ''; cancelActivityError.value = ''; cancelActivityConflict.value = false; cancelActivityVisible.value = true }
const submitCancelActivity = async () => {
  if (!prospectDetail.value || !selectedActivity.value || cancellingActivity.value || !cancellationReason.value.trim()) return
  cancellingActivity.value = true; cancelActivityError.value = ''; cancelActivityConflict.value = false
  try {
    await crmApi.cancelMyProspectPlannedActivity(prospectDetail.value.id, selectedActivity.value.id, { revision: selectedActivity.value.revision, cancellationReason: cancellationReason.value.trim() })
    cancelActivityVisible.value = false; plannedActivityMessage.value = '行程已取消。'; await loadPlannedActivities(prospectDetail.value.id)
  } catch (error) {
    const code = backendErrorCode(error)
    if (code === 'PLANNED_ACTIVITY_REVISION_CONFLICT') { cancelActivityConflict.value = true; cancelActivityError.value = '這筆行程已在其他地方更新，請重新載入後再操作。' }
    else if (code === 'PLANNED_ACTIVITY_READ_ONLY') { cancelActivityVisible.value = false; plannedActivityMessage.value = '這筆行程目前已無法編輯，資料已重新載入。'; await loadPlannedActivities(prospectDetail.value.id) }
    else if (code === 'PROSPECT_CONVERTED_READ_ONLY') { cancelActivityVisible.value = false; await loadProspectDetail(prospectDetail.value.id) }
    else cancelActivityError.value = '取消行程失敗，請稍後再試。'
  } finally { cancellingActivity.value = false }
}
const reloadCancelActivity = async () => {
  if (!prospectDetail.value || !selectedActivity.value) return
  try {
    const detail = (await crmApi.myProspectPlannedActivity(prospectDetail.value.id, selectedActivity.value.id)).data
    if (detail.status !== 'PENDING') { cancelActivityVisible.value = false; plannedActivityMessage.value = '這筆行程目前已無法編輯，資料已重新載入。' } else selectedActivity.value = detail
    cancelActivityError.value = ''; cancelActivityConflict.value = false; await loadPlannedActivities(prospectDetail.value.id)
  } catch { cancelActivityError.value = '行程資料載入失敗，請稍後再試。' }
}
const loadProspectDetail = async (prospectId: string) => {
  loadingProspectDetail.value = true; prospectFormError.value = ''; prospectDetail.value = null; detailProspectVisible.value = true
  try { prospectDetail.value = (await crmApi.getMyProspect(prospectId)).data; void Promise.all([loadPlannedActivities(prospectId), loadFollowUps(prospectId)]) } catch { detailProspectVisible.value = false; prospectError.value = safeError } finally { loadingProspectDetail.value = false }
}
const openEditProspect = async (prospectId: string) => {
  loadingProspectDetail.value = true; prospectFormError.value = ''; prospectConflict.value = false; prospectSuccess.value = ''
  try {
    const detail = (await crmApi.getMyProspect(prospectId)).data
    prospectDetail.value = detail
    if (detail.developmentStatus === 'CONVERTED') { detailProspectVisible.value = true; return }
    fillProspectForm(detail); editingProspect.value = true; prospectFormVisible.value = true
  } catch { prospectError.value = safeError } finally { loadingProspectDetail.value = false }
}
const prospectPayload = (): CreateProspectInput => {
  const shared = { phone: optional(prospectForm.value.phone), mobile: optional(prospectForm.value.mobile), email: optional(prospectForm.value.email), address: optional(prospectForm.value.address), prospectGrade: prospectForm.value.prospectGrade, developmentStatus: prospectForm.value.developmentStatus, note: prospectForm.value.note.trim() || null }
  return prospectForm.value.prospectType === 'PERSON'
    ? { prospectType: 'PERSON', name: prospectForm.value.name.trim(), ...shared }
    : { prospectType: 'COMPANY', companyName: prospectForm.value.companyName.trim(), taxId: optional(prospectForm.value.taxId), representative: optional(prospectForm.value.representative), contactPerson: optional(prospectForm.value.contactPerson), ...shared }
}
const backendErrorCode = (error: unknown) => (error as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code
const submitProspect = async () => {
  if (savingProspect.value || prospectValidation.value) return
  savingProspect.value = true; prospectFormError.value = ''
  try {
    if (editingProspect.value && prospectDetail.value) {
      const { prospectType: _immutableType, ...changes } = prospectPayload()
      void _immutableType
      const input: UpdateProspectInput = { ...changes, revision: prospectForm.value.revision }
      prospectDetail.value = (await crmApi.updateMyProspect(prospectDetail.value.id, input)).data
      prospectSuccess.value = '開發客戶資料已更新。'
    } else {
      prospectDetail.value = (await crmApi.createMyProspect(prospectPayload())).data
      prospectSuccess.value = '開發客戶已新增。'
    }
    prospectFormVisible.value = false; resetProspectForm(); await loadProspects()
  } catch (error) {
    if (backendErrorCode(error) === 'PROSPECT_REVISION_CONFLICT') { prospectConflict.value = true; prospectFormError.value = '這筆開發客戶資料已在其他地方更新，請重新載入後再編輯。' }
    else if (backendErrorCode(error) === 'PROSPECT_CONVERTED_READ_ONLY' && prospectDetail.value) {
      prospectFormError.value = '此開發客戶已轉正式客戶，無法再編輯。'
      const prospectId = prospectDetail.value.id
      prospectFormVisible.value = false
      await loadProspectDetail(prospectId)
      await loadProspects()
    }
    else prospectFormError.value = '開發客戶資料儲存失敗，請確認內容後再試一次。'
  } finally { savingProspect.value = false }
}

onMounted(refresh)
watch(detailProspectVisible, (visible) => { if (visible) startPlannedActivityClock(); else stopPlannedActivityClock() })
onUnmounted(stopPlannedActivityClock)
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

    <article class="surface-card data-section prospect-section">
      <header class="section-header"><div><p class="eyebrow">Prospects</p><h2>開發客戶</h2><p>管理尚未轉為正式客戶的潛在對象與開發狀態</p></div><Button label="＋新增開發客戶" @click="openCreateProspect"><template #icon><Icon icon="lucide:user-round-plus" /></template></Button></header>
      <p v-if="prospectSuccess" class="success-message" role="status">{{ prospectSuccess }}</p>
      <div v-if="loadingProspects" class="skeleton-list"><Skeleton v-for="i in 4" :key="i" height="3rem" /></div>
      <div v-else-if="prospectError" class="state error" role="alert"><span>{{ prospectError }}</span><Button label="重新載入" text @click="loadProspects" /></div>
      <div v-else-if="!prospects.length" class="state"><Icon icon="lucide:user-search" /><strong>目前沒有開發客戶</strong><Button label="＋新增開發客戶" text @click="openCreateProspect" /></div>
      <DataTable v-else :value="prospects" class="desktop-table prospect-table" striped-rows>
        <Column field="displayName" header="名稱" /><Column header="類型"><template #body="{ data }">{{ prospectTypeLabel(data.prospectType) }}</template></Column>
        <Column header="等級"><template #body="{ data }"><Tag :value="prospectGrade(data.prospectGrade).label" :severity="prospectGrade(data.prospectGrade).severity" :title="prospectGrade(data.prospectGrade).title" /></template></Column>
        <Column header="開發狀態"><template #body="{ data }"><Tag :value="prospectStatusLabel(data.developmentStatus)" :severity="data.developmentStatus === 'CONVERTED' ? 'success' : 'secondary'" /></template></Column>
        <Column header="聯絡方式"><template #body="{ data }">{{ prospectContact(data) }}</template></Column><Column header="更新時間"><template #body="{ data }">{{ formatDate(data.updatedAt) }}</template></Column>
        <Column header="操作"><template #body="{ data }"><Button label="查看" text @click="loadProspectDetail(data.id)" /><Button label="編輯" text :disabled="data.developmentStatus === 'CONVERTED'" :aria-disabled="data.developmentStatus === 'CONVERTED'" :title="data.developmentStatus === 'CONVERTED' ? '已轉正式客戶，無法編輯' : '編輯開發客戶'" @click="openEditProspect(data.id)" /></template></Column>
      </DataTable>
      <div v-if="!loadingProspects && prospects.length" class="mobile-cards prospect-cards"><article v-for="item in prospects" :key="item.id"><header><div><strong>{{ item.displayName }}</strong><small>{{ prospectTypeLabel(item.prospectType) }}</small></div><Tag :value="prospectGrade(item.prospectGrade).label" :severity="prospectGrade(item.prospectGrade).severity" :title="prospectGrade(item.prospectGrade).title" /></header><p>{{ prospectContact(item) }}</p><span>{{ prospectStatusLabel(item.developmentStatus) }} · 更新於 {{ formatDate(item.updatedAt) }}</span><div class="card-actions"><Button label="查看" text @click="loadProspectDetail(item.id)" /><Button label="編輯" text :disabled="item.developmentStatus === 'CONVERTED'" :aria-disabled="item.developmentStatus === 'CONVERTED'" :title="item.developmentStatus === 'CONVERTED' ? '已轉正式客戶，無法編輯' : '編輯開發客戶'" @click="openEditProspect(item.id)" /></div></article></div>
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

    <Dialog v-model:visible="detailProspectVisible" modal header="開發客戶詳細資料" :style="{ width: 'min(72rem, calc(100vw - 2rem))' }" :content-style="{ maxHeight: '78vh', overflowY: 'auto' }">
      <div v-if="loadingProspectDetail" class="skeleton-list"><Skeleton v-for="i in 5" :key="i" height="2.5rem" /></div>
      <div v-else-if="prospectDetail" class="prospect-detail">
        <h4>基本資料</h4>
        <header><div><small>{{ prospectTypeLabel(prospectDetail.prospectType) }}</small><h3>{{ prospectDetail.displayName }}</h3></div><Tag :value="prospectStatusLabel(prospectDetail.developmentStatus)" :severity="prospectDetail.developmentStatus === 'CONVERTED' ? 'success' : 'secondary'" /></header>
        <dl><div><dt>等級</dt><dd><Tag :value="prospectGrade(prospectDetail.prospectGrade).label" :title="prospectGrade(prospectDetail.prospectGrade).title" /></dd></div><div v-if="prospectDetail.companyName"><dt>公司名稱</dt><dd>{{ prospectDetail.companyName }}</dd></div><div v-if="prospectDetail.taxId"><dt>統一編號</dt><dd>{{ prospectDetail.taxId }}</dd></div><div v-if="prospectDetail.representative"><dt>負責人</dt><dd>{{ prospectDetail.representative }}</dd></div><div v-if="prospectDetail.contactPerson"><dt>聯絡人</dt><dd>{{ prospectDetail.contactPerson }}</dd></div><div><dt>電話</dt><dd>{{ prospectDetail.phone || '—' }}</dd></div><div><dt>行動電話</dt><dd>{{ prospectDetail.mobile || '—' }}</dd></div><div><dt>Email</dt><dd>{{ prospectDetail.email || '—' }}</dd></div><div><dt>地址</dt><dd>{{ prospectDetail.address || '—' }}</dd></div><div class="detail-wide"><dt>備註</dt><dd>{{ prospectDetail.note || '—' }}</dd></div><div><dt>建立時間</dt><dd>{{ formatDate(prospectDetail.createdAt) }}</dd></div><div><dt>更新時間</dt><dd>{{ formatDate(prospectDetail.updatedAt) }}</dd></div></dl>
        <section v-if="prospectDetail.developmentStatus === 'CONVERTED'" class="converted-notice"><strong>已轉正式客戶</strong><span>轉換時間：{{ formatDate(prospectDetail.convertedAt) }}</span><small v-if="prospectDetail.convertedCustomerId">正式客戶參照：{{ prospectDetail.convertedCustomerId }}</small><small v-if="prospectDetail.convertedBusinessCaseId">案件參照：{{ prospectDetail.convertedBusinessCaseId }}</small></section>
        <div class="deferred-actions"><Button label="轉為正式客戶" disabled aria-disabled="true" title="此功能尚未開放" /><Button label="新增業務案件" disabled aria-disabled="true" title="此功能尚未開放" /></div>
        <section class="detail-block planned-activity-section" aria-labelledby="planned-activity-title">
          <header class="activity-heading"><div><h4 id="planned-activity-title">預定行程</h4><small v-if="prospectDetail.developmentStatus === 'CONVERTED'">已轉正式客戶，僅供查看歷史行程。</small></div><Button v-if="prospectDetail.developmentStatus !== 'CONVERTED'" label="＋新增行程" size="small" @click="openCreateActivity" /></header>
          <p v-if="plannedActivityMessage" class="success-message" role="status">{{ plannedActivityMessage }}</p>
          <nav class="activity-filters" aria-label="行程篩選"><Button :label="`待執行 (${activityCounts.upcoming})`" size="small" :outlined="plannedActivityFilter !== 'upcoming'" @click="plannedActivityFilter = 'upcoming'" /><Button :label="`過期未執行 (${activityCounts.overdue})`" size="small" :outlined="plannedActivityFilter !== 'overdue'" @click="plannedActivityFilter = 'overdue'" /><Button :label="`全部行程 (${activityCounts.all})`" size="small" :outlined="plannedActivityFilter !== 'all'" @click="plannedActivityFilter = 'all'" /></nav>
          <div v-if="loadingPlannedActivities" class="skeleton-list"><Skeleton v-for="i in 3" :key="i" height="5rem" /></div>
          <div v-else-if="plannedActivityError" class="state error" role="alert"><span>{{ plannedActivityError }}</span><Button label="重試" text @click="loadPlannedActivities(prospectDetail.id)" /></div>
          <div v-else-if="!filteredPlannedActivities.length" class="state">{{ activityEmptyMessage }}</div>
          <div v-else class="activity-list">
            <article v-for="item in filteredPlannedActivities" :key="item.id" :class="['activity-card', { cancelled: item.status === 'CANCELLED' }]">
              <header><div class="activity-when"><strong>{{ plannedActivityDateTime(item.startAt) }}</strong></div><Tag :value="activityStatusLabel(item)" :severity="item.status === 'CANCELLED' ? 'secondary' : activityIsOverdue(item) ? 'warn' : item.status === 'COMPLETED' ? 'success' : 'info'" /></header>
              <div><small>{{ PLANNED_ACTIVITY_TYPE_LABELS[item.activityType] }}</small><h5>{{ item.title }}</h5><p v-if="item.content">{{ item.content }}</p><p v-if="item.status === 'CANCELLED' && item.cancellationReason" class="cancellation-reason">取消原因：{{ item.cancellationReason }}</p></div>
              <footer v-if="item.status === 'PENDING' && prospectDetail.developmentStatus !== 'CONVERTED'"><Button label="完成" size="small" @click="openCompleteActivity(item)" /><Button label="編輯／改期" text size="small" @click="openEditActivity(item)" /><Button label="取消" text size="small" severity="danger" @click="openCancelActivity(item)" /></footer>
            </article>
          </div>
        </section>
        <section class="detail-block follow-up-section" aria-labelledby="follow-up-title">
          <header class="activity-heading"><div><h4 id="follow-up-title">聯絡紀錄</h4><small v-if="prospectDetail.developmentStatus === 'CONVERTED'">已轉正式客戶，僅供查看歷史紀錄。</small></div><Button v-if="prospectDetail.developmentStatus !== 'CONVERTED'" label="＋新增聯絡紀錄" size="small" @click="openCreateFollowUp" /></header>
          <p v-if="followUpMessage" class="success-message" role="status">{{ followUpMessage }}</p>
          <div v-if="loadingFollowUps" class="skeleton-list"><Skeleton v-for="i in 3" :key="i" height="6rem" /></div>
          <div v-else-if="followUpError" class="state error" role="alert"><span>{{ followUpError }}</span><Button label="重試" text @click="loadFollowUps(prospectDetail.id)" /></div>
          <div v-else-if="!followUps.length" class="state">目前沒有聯絡紀錄</div>
          <ol v-else class="follow-up-timeline">
            <li v-for="item in followUps" :key="item.id">
              <span class="follow-up-dot" aria-hidden="true" />
              <article class="activity-card follow-up-card">
                <header><div><strong>{{ plannedActivityDateTime(item.occurredAt) }}</strong><small>{{ PLANNED_ACTIVITY_TYPE_LABELS[item.activityType] }}</small></div><div class="follow-up-tags"><Tag :value="PROSPECT_FOLLOW_UP_OUTCOME_LABELS[item.outcome]" /><Tag v-if="item.plannedActivityId" value="由預定行程完成" severity="info" /></div></header>
                <p>{{ item.content }}</p><small v-if="item.outcomeNote">結果補充：{{ item.outcomeNote }}</small>
                <footer v-if="followUpCanMutate(item)"><Button label="編輯" text size="small" @click="openEditFollowUp(item)" /><Button label="刪除" text size="small" severity="danger" @click="openDeleteFollowUp(item)" /></footer>
              </article>
            </li>
          </ol>
        </section>
      </div>
      <template #footer><Button v-if="prospectDetail && prospectDetail.developmentStatus !== 'CONVERTED'" label="編輯" @click="detailProspectVisible = false; prospectDetail && openEditProspect(prospectDetail.id)" /><Button label="關閉" severity="secondary" outlined @click="detailProspectVisible = false" /></template>
    </Dialog>

    <Dialog v-model:visible="prospectFormVisible" modal :header="editingProspect ? '編輯開發客戶' : '＋新增開發客戶'" :style="{ width: '48rem', maxWidth: 'calc(100vw - 2rem)' }" :content-style="{ maxHeight: '70vh', overflowY: 'auto' }" @hide="prospectFormError = ''">
      <form id="prospect-form" class="customer-form" @submit.prevent="submitProspect">
        <label class="field"><span>類型 *</span><select v-model="prospectForm.prospectType" required aria-required="true" :disabled="editingProspect"><option value="PERSON">個人</option><option value="COMPANY">公司</option></select><small v-if="editingProspect">建立後不可變更</small></label>
        <label v-if="prospectForm.prospectType === 'PERSON'" class="field"><span>姓名 *</span><input v-model="prospectForm.name" required aria-required="true" autocomplete="name" /></label>
        <template v-else><label class="field"><span>公司名稱 *</span><input v-model="prospectForm.companyName" required aria-required="true" /></label><label class="field"><span>統一編號</span><input v-model="prospectForm.taxId" inputmode="numeric" /></label><label class="field"><span>負責人</span><input v-model="prospectForm.representative" /></label><label class="field"><span>聯絡人</span><input v-model="prospectForm.contactPerson" autocomplete="name" /></label></template>
        <label class="field"><span>電話</span><input v-model="prospectForm.phone" type="tel" autocomplete="tel" /></label><label class="field"><span>行動電話</span><input v-model="prospectForm.mobile" type="tel" autocomplete="tel" /></label><label class="field"><span>Email</span><input v-model="prospectForm.email" type="email" autocomplete="email" /></label><label class="field"><span>地址</span><input v-model="prospectForm.address" autocomplete="street-address" /></label>
        <label class="field"><span>開發等級</span><select v-model="prospectForm.prospectGrade"><option v-for="(item, key) in PROSPECT_GRADE_PRESENTATION" :key="key" :value="key">{{ item.label }}－{{ item.title }}</option></select></label>
        <label class="field"><span>開發狀態</span><select v-model="prospectForm.developmentStatus"><option v-for="status in activeProspectStatuses" :key="status" :value="status">{{ PROSPECT_STATUS_LABELS[status] }}</option></select></label>
        <label class="field field-wide"><span>備註</span><textarea v-model="prospectForm.note" maxlength="5000" rows="5" /><small>{{ prospectForm.note.length }} / 5000</small></label>
        <p v-if="prospectValidation" class="form-error field-wide" role="alert">{{ prospectValidation }}</p><div v-if="prospectFormError" class="conflict-row field-wide" role="alert"><span>{{ prospectFormError }}</span><Button v-if="prospectConflict && prospectDetail" label="重新載入資料" text type="button" @click="openEditProspect(prospectDetail.id)" /></div>
      </form>
      <template #footer><Button label="取消" severity="secondary" outlined :disabled="savingProspect" @click="prospectFormVisible = false" /><Button type="submit" form="prospect-form" :label="editingProspect ? '儲存變更' : '建立開發客戶'" :loading="savingProspect" :disabled="Boolean(prospectValidation) || savingProspect" /></template>
    </Dialog>

    <Dialog v-model:visible="activityFormVisible" modal :header="editingActivity ? '編輯／改期行程' : '＋新增行程'" :style="{ width: '34rem', maxWidth: 'calc(100vw - 2rem)' }" :content-style="{ maxHeight: '70vh', overflowY: 'auto' }" @hide="activityFormError = ''">
      <form id="planned-activity-form" class="activity-form" @submit.prevent="submitActivity">
        <label class="field"><span>行程類型 *</span><select v-model="activityForm.activityType" required><option v-for="(label, key) in PLANNED_ACTIVITY_TYPE_LABELS" :key="key" :value="key">{{ label }}</option></select></label>
        <label class="field"><span>標題 *</span><input v-model="activityForm.title" required maxlength="200" /></label>
        <label class="field"><span>日期與時間 *</span><input v-model="activityForm.startAt" type="datetime-local" required /></label>
        <label class="field"><span>內容</span><textarea v-model="activityForm.content" maxlength="5000" rows="4" /><small>{{ activityForm.content.length }} / 5000</small></label>
        <p v-if="activityValidation && activityForm.startAt" class="form-error" role="alert">{{ activityValidation }}</p>
        <div v-if="activityFormError" class="conflict-row" role="alert"><span>{{ activityFormError }}</span><Button v-if="activityConflict" label="重新載入資料" text type="button" @click="reloadActivityForEdit" /></div>
      </form>
      <template #footer><Button label="取消" severity="secondary" outlined :disabled="savingActivity" @click="activityFormVisible = false" /><Button type="submit" form="planned-activity-form" :label="editingActivity ? '儲存變更' : '新增行程'" :loading="savingActivity" :disabled="Boolean(activityValidation) || savingActivity" /></template>
    </Dialog>

    <Dialog v-model:visible="cancelActivityVisible" modal header="取消預定行程" :style="{ width: '32rem', maxWidth: 'calc(100vw - 2rem)' }" @hide="cancelActivityError = ''">
      <form v-if="selectedActivity" id="cancel-activity-form" class="activity-form" @submit.prevent="submitCancelActivity">
        <dl class="cancel-summary"><div><dt>類型</dt><dd>{{ PLANNED_ACTIVITY_TYPE_LABELS[selectedActivity.activityType] }}</dd></div><div><dt>標題</dt><dd>{{ selectedActivity.title }}</dd></div><div><dt>時間</dt><dd>{{ plannedActivityDateTime(selectedActivity.startAt) }}</dd></div></dl>
        <label class="field"><span>取消原因 *</span><textarea v-model="cancellationReason" required maxlength="1000" rows="4" /><small>{{ cancellationReason.length }} / 1000</small></label>
        <div v-if="cancelActivityError" class="conflict-row" role="alert"><span>{{ cancelActivityError }}</span><Button v-if="cancelActivityConflict" label="重新載入資料" text type="button" @click="reloadCancelActivity" /></div>
      </form>
      <template #footer><Button label="返回" severity="secondary" outlined :disabled="cancellingActivity" @click="cancelActivityVisible = false" /><Button type="submit" form="cancel-activity-form" label="確認取消行程" severity="danger" :loading="cancellingActivity" :disabled="!cancellationReason.trim() || cancellingActivity" /></template>
    </Dialog>

    <Dialog v-model:visible="followUpFormVisible" modal :header="editingFollowUp ? '編輯聯絡紀錄' : '新增聯絡紀錄'" :style="{ width: '38rem', maxWidth: 'calc(100vw - 2rem)' }" @hide="followUpFormError = ''">
      <form id="follow-up-form" class="activity-form" @submit.prevent="submitFollowUp">
        <label class="field"><span>聯絡時間 *</span><input v-model="followUpForm.occurredAt" type="datetime-local" required /></label>
        <label class="field"><span>聯絡方式 *</span><select v-model="followUpForm.activityType"><option v-for="(label, key) in PLANNED_ACTIVITY_TYPE_LABELS" :key="key" :value="key">{{ label }}</option></select></label>
        <label class="field"><span>聯絡結果 *</span><select v-model="followUpForm.outcome" required><option value="" disabled>請選擇</option><option v-for="(label, key) in PROSPECT_FOLLOW_UP_OUTCOME_LABELS" :key="key" :value="key">{{ label }}</option></select></label>
        <label class="field"><span>聯絡內容 *</span><textarea v-model="followUpForm.content" required maxlength="5000" rows="5" /><small>{{ followUpForm.content.length }} / 5000</small></label>
        <label class="field"><span>結果補充</span><textarea v-model="followUpForm.outcomeNote" maxlength="5000" rows="3" /><small>{{ followUpForm.outcomeNote.length }} / 5000</small></label>
        <p v-if="followUpValidation" class="form-error" role="alert">{{ followUpValidation }}</p>
        <div v-if="followUpFormError" class="conflict-row" role="alert"><span>{{ followUpFormError }}</span><Button v-if="followUpConflict" label="重新載入資料" text type="button" @click="reloadFollowUpForEdit" /></div>
      </form>
      <template #footer><Button label="取消" severity="secondary" outlined :disabled="savingFollowUp" @click="followUpFormVisible = false" /><Button type="submit" form="follow-up-form" :label="editingFollowUp ? '儲存變更' : '新增紀錄'" :loading="savingFollowUp" :disabled="Boolean(followUpValidation) || savingFollowUp" /></template>
    </Dialog>

    <Dialog v-model:visible="deleteFollowUpVisible" modal header="刪除聯絡紀錄" :style="{ width: '30rem', maxWidth: 'calc(100vw - 2rem)' }">
      <template v-if="selectedFollowUp"><dl class="cancel-summary"><div><dt>方式</dt><dd>{{ PLANNED_ACTIVITY_TYPE_LABELS[selectedFollowUp.activityType] }}</dd></div><div><dt>結果</dt><dd>{{ PROSPECT_FOLLOW_UP_OUTCOME_LABELS[selectedFollowUp.outcome] }}</dd></div><div><dt>時間</dt><dd>{{ plannedActivityDateTime(selectedFollowUp.occurredAt) }}</dd></div><div><dt>內容</dt><dd>{{ selectedFollowUp.content }}</dd></div></dl><p>刪除後將不再顯示於一般聯絡紀錄中。</p></template><p v-if="deleteFollowUpError" class="form-error" role="alert">{{ deleteFollowUpError }}</p>
      <template #footer><Button label="取消" severity="secondary" outlined :disabled="deletingFollowUp" @click="deleteFollowUpVisible = false" /><Button label="確認刪除" severity="danger" :loading="deletingFollowUp" @click="submitDeleteFollowUp" /></template>
    </Dialog>

    <Dialog v-model:visible="completeActivityVisible" modal header="完成預定行程" :style="{ width: '42rem', maxWidth: 'calc(100vw - 2rem)' }" :content-style="{ maxHeight: '72vh', overflowY: 'auto' }">
      <form id="complete-activity-form" class="activity-form" @submit.prevent="submitCompleteActivity">
        <dl v-if="selectedActivity" class="cancel-summary"><div><dt>行程</dt><dd>{{ selectedActivity.title }}</dd></div><div><dt>時間</dt><dd>{{ plannedActivityDateTime(selectedActivity.startAt) }}</dd></div></dl>
        <label class="field"><span>實際聯絡時間 *</span><input v-model="completionForm.occurredAt" type="datetime-local" required /></label>
        <label class="field"><span>實際聯絡方式 *</span><select v-model="completionForm.activityType"><option v-for="(label, key) in PLANNED_ACTIVITY_TYPE_LABELS" :key="key" :value="key">{{ label }}</option></select></label>
        <label class="field"><span>聯絡結果 *</span><select v-model="completionForm.outcome" required><option value="" disabled>請選擇</option><option v-for="(label, key) in PROSPECT_FOLLOW_UP_OUTCOME_LABELS" :key="key" :value="key">{{ label }}</option></select></label>
        <label class="field"><span>聯絡內容 *</span><textarea v-model="completionForm.content" required maxlength="5000" rows="4" /></label>
        <label class="field"><span>結果補充</span><textarea v-model="completionForm.outcomeNote" maxlength="5000" rows="3" /></label>
        <label class="next-activity-toggle"><input v-model="completionForm.nextEnabled" type="checkbox" /> 建立下一筆預定行程</label>
        <fieldset v-if="completionForm.nextEnabled" class="next-activity-fields"><legend>下一步行程</legend><label class="field"><span>類型 *</span><select v-model="completionForm.nextActivityType"><option v-for="(label, key) in PLANNED_ACTIVITY_TYPE_LABELS" :key="key" :value="key">{{ label }}</option></select></label><label class="field"><span>標題 *</span><input v-model="completionForm.nextTitle" maxlength="200" required /></label><label class="field"><span>日期與時間 *</span><input v-model="completionForm.nextStartAt" type="datetime-local" required /></label><label class="field"><span>內容</span><textarea v-model="completionForm.nextContent" maxlength="5000" rows="3" /></label></fieldset>
        <p v-if="completionValidation" class="form-error" role="alert">{{ completionValidation }}</p>
        <div v-if="completeActivityError" class="conflict-row" role="alert"><span>{{ completeActivityError }}</span><Button v-if="completeActivityConflict" label="重新載入資料" text type="button" @click="reloadCompletionActivity" /></div>
      </form>
      <template #footer><Button label="取消" severity="secondary" outlined :disabled="completingActivity" @click="completeActivityVisible = false" /><Button type="submit" form="complete-activity-form" label="完成並儲存" :loading="completingActivity" :disabled="Boolean(completionValidation) || completingActivity" /></template>
    </Dialog>
  </section>
</template>

<style scoped lang="scss">
.my-business{display:grid;max-width:1600px;margin:0 auto;gap:18px;color:var(--text-main)}.page-header,.section-header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.page-header h1,.section-header h2{margin:0}.page-header p,.section-header p{margin:5px 0 0;color:var(--text-muted)}.eyebrow{color:var(--accent-active)!important;font-size:.74rem;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.header-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.surface-card{padding:18px;border:1px solid var(--border-grey);border-radius:14px;background:var(--bg-card);box-shadow:var(--shadow-sm)}.agenda-section,.calendar-section,.data-section{display:grid;gap:14px}.section-header>svg{width:28px;height:28px;color:var(--accent-active)}.timeline{display:grid;margin:0;padding:0;list-style:none}.timeline li{display:grid;grid-template-columns:3.5rem 12px 1fr;gap:10px;padding:10px 0}.timeline time{color:var(--accent-active);font-weight:750}.timeline-dot{width:10px;height:10px;margin-top:5px;border:2px solid var(--accent-active);border-radius:50%}.timeline li:not(:last-child) .timeline-dot::after{display:block;width:1px;height:55px;margin:8px 0 0 2.5px;background:var(--border-grey);content:""}.timeline div{display:grid;gap:3px}.timeline small,.timeline p{margin:0;color:var(--text-muted)}.claim-card,.kpi-card{display:flex;align-items:center;gap:13px}.claim-card p{margin:4px 0 0;color:var(--text-muted)}.claim-card strong,.kpi-card strong{display:block;margin-top:3px;font-size:1.3rem}.claim-card small,.kpi-card small{color:var(--text-muted)}.icon-box{display:grid;width:42px;height:42px;flex:0 0 42px;place-items:center;border-radius:10px;background:var(--bg-active);color:var(--accent-active)}.icon-box svg{width:21px;height:21px}.kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.calendar-list{display:grid;gap:8px}.calendar-list article{display:grid;grid-template-columns:5rem 8px 1fr;align-items:center;gap:10px;padding:11px;border:1px solid var(--border-grey);border-radius:10px;background:var(--bg-main)}.calendar-list time,.calendar-list article>div{display:grid;gap:2px}.calendar-list time span,.calendar-list article span,.calendar-list article small{color:var(--text-muted)}.activity-mark{width:8px;height:32px;border-radius:999px;background:var(--accent-active)}.desktop-table :deep(td){vertical-align:top}.mobile-cards{display:none}.mobile-cards article{display:grid;gap:8px;padding:13px;border:1px solid var(--border-grey);border-radius:10px;background:var(--bg-main)}.mobile-cards header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.mobile-cards header div{display:grid}.mobile-cards p{margin:0}.mobile-cards small,.mobile-cards span{color:var(--text-muted)}.skeleton-list{display:grid;gap:8px}.state{display:flex;min-height:7rem;align-items:center;justify-content:center;gap:8px;color:var(--text-muted);text-align:center}.state>svg{width:24px;height:24px}.state.error{min-height:auto;justify-content:flex-start;padding:11px;border:1px solid var(--danger);border-radius:10px;background:var(--danger-bg)}.state.error .p-button{margin-left:auto}
.customer-cell{display:grid;gap:2px}.customer-cell small{color:var(--text-muted)}.customer-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field{display:grid;gap:6px;font-weight:650}.field input,.field select,.field textarea{width:100%;padding:.7rem .75rem;border:1px solid var(--border-grey);border-radius:8px;background:var(--bg-main);color:var(--text-main);font:inherit}.field textarea{resize:vertical}.field small{justify-self:end;color:var(--text-muted);font-weight:400}.field-wide{grid-column:1/-1}.form-error{margin:0;color:var(--danger)}.success-message{margin:0;padding:11px 14px;border:1px solid var(--success);border-radius:10px;background:var(--success-bg);color:var(--text-main)}
.prospect-section{border-color:color-mix(in srgb,var(--accent-active) 28%,var(--border-grey));background:color-mix(in srgb,var(--bg-card) 92%,var(--bg-active))}.prospect-cards article{background:color-mix(in srgb,var(--bg-main) 88%,var(--bg-active))}.card-actions,.deferred-actions{display:flex;flex-wrap:wrap;gap:8px}.prospect-detail{display:grid;gap:16px}.prospect-detail>header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.prospect-detail h3{margin:3px 0 0}.prospect-detail small{color:var(--text-muted)}.prospect-detail dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0}.prospect-detail dl>div{padding:11px;border:1px solid var(--border-grey);border-radius:9px;background:var(--bg-main)}.prospect-detail dt{color:var(--text-muted);font-size:.82rem}.prospect-detail dd{margin:4px 0 0;overflow-wrap:anywhere}.prospect-detail .detail-wide{grid-column:1/-1}.converted-notice{display:grid;gap:4px;padding:13px;border:1px solid var(--success);border-radius:10px;background:var(--success-bg)}.conflict-row{display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--danger)}
.prospect-detail h4{margin:0}.detail-block{display:grid;gap:12px;padding-top:16px;border-top:1px solid var(--border-grey)}.activity-heading,.activity-card>header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.activity-filters{display:flex;flex-wrap:wrap;gap:8px}.activity-list{display:grid;gap:10px}.activity-card{display:grid;gap:9px;padding:13px;border:1px solid var(--border-grey);border-radius:10px;background:var(--bg-main)}.activity-card.cancelled{opacity:.72}.activity-card h5,.activity-card p{margin:3px 0 0}.activity-card footer{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:4px}.activity-when{display:flex;flex-wrap:wrap;gap:7px}.activity-when span,.cancellation-reason,.follow-up-placeholder p{color:var(--text-muted)}.activity-form{display:grid;gap:14px}.cancel-summary{display:grid;gap:8px;margin:0}.cancel-summary>div{display:grid;grid-template-columns:4rem 1fr;gap:8px}.cancel-summary dt{color:var(--text-muted)}.cancel-summary dd{margin:0;overflow-wrap:anywhere}
/* Shared CRM detail grammar: section dividers, record cards, semantic tags, and responsive action rows use theme tokens only. */
.follow-up-timeline{display:grid;gap:0;margin:0;padding:0;list-style:none}.follow-up-timeline li{position:relative;display:grid;grid-template-columns:18px minmax(0,1fr);gap:9px;padding-bottom:12px}.follow-up-timeline li:not(:last-child)::before{position:absolute;top:18px;bottom:-2px;left:5px;width:1px;background:var(--border-grey);content:""}.follow-up-dot{z-index:1;width:11px;height:11px;margin-top:16px;border:2px solid var(--accent-active);border-radius:50%;background:var(--bg-card)}.follow-up-card>header>div:first-child{display:grid;gap:3px}.follow-up-card>header small,.follow-up-card>small{color:var(--text-muted)}.follow-up-tags{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}.next-activity-toggle{display:flex;align-items:center;gap:8px;font-weight:650}.next-activity-fields{display:grid;gap:12px;margin:0;padding:13px;border:1px solid var(--border-grey);border-radius:10px;background:var(--bg-main)}.next-activity-fields legend{padding:0 6px;font-weight:750;color:var(--text-main)}
@media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.desktop-table{display:block;overflow-x:auto}}
@media(max-width:767px){.my-business{gap:13px}.page-header{flex-direction:column}.header-actions{display:grid;width:100%;grid-template-columns:1fr 1fr}.header-actions .p-button:last-child{grid-column:1/-1}.surface-card{padding:14px}.kpi-grid,.customer-form,.prospect-detail dl{grid-template-columns:1fr}.calendar-list article{grid-template-columns:4.5rem 7px 1fr}.desktop-table{display:none}.mobile-cards{display:grid;gap:9px}.section-header{align-items:center;flex-wrap:wrap}.timeline li{grid-template-columns:3rem 10px 1fr}.prospect-detail .detail-wide{grid-column:auto}.conflict-row{align-items:flex-start;flex-direction:column}.activity-heading,.activity-card>header{align-items:stretch;flex-direction:column}.follow-up-tags{justify-content:flex-start}.activity-card footer{justify-content:flex-start}}
</style>
