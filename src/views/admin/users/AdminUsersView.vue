<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Paginator from 'primevue/paginator'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Message from 'primevue/message'

import { adminUsersApi, type AccountStatus, type AdminUser, type StaffFunctionCapability } from '@/api/adminUsers'
import { adminOrganizationsApi, type AssignmentRole, type OrganizationAssignment, type OrganizationUnit } from '@/api/adminOrganizations'
import { ADMIN_USER_SECTIONS, ROLE_LABELS, STATUS_LABELS, STATUS_SEVERITY, formatAdminDate } from '@/config/adminUsers'
import { CAPABILITY_LABELS, type Capability } from '@/config/capabilities'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const users = ref<AdminUser[]>([])
const loading = ref(false)
const errorMessage = ref('')
const search = ref('')
const status = ref<AccountStatus | undefined>()
const page = ref(1)
const limit = 20
const total = ref(0)
let requestId = 0
let searchTimer: ReturnType<typeof setTimeout> | undefined
const detailVisible = ref(false)
const selectedUserId = ref<string | null>(null)
const detail = ref<AdminUser | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
let detailRequestId = 0
const detailAssignments = ref<OrganizationAssignment[]>([])
const capabilityVisible = ref(false)
const capabilityTarget = ref<AdminUser | null>(null)
const governanceLoading = ref(false)
const governanceAssignments = ref<OrganizationAssignment[]>([])
const organizations = ref<OrganizationUnit[]>([])
const mutationLoading = ref(false)
const mutationError = ref('')
const mutationSuccess = ref('')
const addFunctionVisible = ref(false)
const addFunctionError = ref('')
const selectedStaffFunction = ref<StaffFunctionCapability | null>(null)
const selectedFunctionOrganizationId = ref('')
const addAssignmentVisible = ref(false)
const selectedAssignmentKey = ref('')
const moveAssignmentVisible = ref(false)
const movingAssignment = ref<OrganizationAssignment | null>(null)
const moveDestinationId = ref('')
const roleChangeVisible = ref(false)
const roleChangeAssignment = ref<OrganizationAssignment | null>(null)
const requestedAssignmentRole = ref<AssignmentRole | null>(null)
const roleChangeError = ref('')
let governanceRequestId = 0

const identityCapabilities: Capability[] = ['MEMBER', 'SALES', 'SALES_SUPERVISOR', 'PLATFORM_MANAGER', 'ADMIN']
const isEstablishedStaff = computed(() => capabilityTarget.value?.capabilities.some((item) => item !== 'MEMBER') === true)
const compatibleFunctionOrganizations = computed(() => {
  const domain = selectedStaffFunction.value === 'PLATFORM_MANAGER' ? 'platform' : 'sales'
  return organizations.value.filter((item) => item.status === 'active' && item.domain === domain)
})
const assignmentChoices = computed(() => organizations.value.flatMap((organization) => {
  if (organization.status !== 'active' || governanceAssignments.value.some((item) => item.organizationUnitId === organization.id)) return []
  const capabilities = capabilityTarget.value?.capabilities || []
  const roles: AssignmentRole[] = organization.domain === 'platform'
    ? (capabilities.includes('PLATFORM_MANAGER') ? ['supervisor'] : [])
    : [
        ...(capabilities.includes('SALES') ? ['member' as AssignmentRole] : []),
        ...(capabilities.includes('SALES_SUPERVISOR') ? ['supervisor' as AssignmentRole] : [])
      ]
  return roles.map((assignmentRole) => ({ organization, assignmentRole, key: `${organization.id}:${assignmentRole}` }))
}))
const moveDestinations = computed(() => organizations.value.filter((item) =>
  item.status === 'active' && item.domain === movingAssignment.value?.domain && item.id !== movingAssignment.value?.organizationUnitId
))

// sales member ↔ supervisor 是 Organization Assignment role 變更；platform/member 刻意不支援。
// Staff capability 與 Primary/Secondary 是不同治理維度，因此此處只判斷是否顯示明確的角色操作。
const roleChangeTargetFor = (assignment: OrganizationAssignment): AssignmentRole | null => {
  if (assignment.domain !== 'sales') return null
  if (assignment.assignmentRole === 'supervisor') return 'member'
  return capabilityTarget.value?.capabilities.includes('SALES_SUPERVISOR') ? 'supervisor' : null
}

// Route meta maps each account category to the Backend authoritative capability filter.
const section = computed(() => ADMIN_USER_SECTIONS[route.meta.userSection as keyof typeof ADMIN_USER_SECTIONS] || ADMIN_USER_SECTIONS.members)
const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))

// 只清除搜尋文字並回到第一頁；目前角色與狀態篩選會原樣保留。
const clearSearch = () => {
  search.value = ''
  page.value = 1
}

const loadUsers = async () => {
  const currentRequest = ++requestId
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await adminUsersApi.list({ page: page.value, limit, capability: section.value.capability, search: search.value || undefined, status: status.value })
    if (currentRequest !== requestId) return
    users.value = response.data.users
    total.value = response.data.pagination.total
  } catch (error) {
    if (currentRequest !== requestId) return
    const code = isAxiosError(error) ? (error.response?.data as { error?: { code?: string } })?.error?.code : null
    errorMessage.value = code === 'MANAGEMENT_TARGET_FORBIDDEN' ? '您沒有權限查看此帳號範圍。' : '無法載入帳號資料，請稍後再試。'
    users.value = []
    total.value = 0
  } finally { if (currentRequest === requestId) loading.value = false }
}

const detailErrorMessage = (error: unknown) => {
  const response = isAxiosError(error) ? error.response : null
  const code = (response?.data as { error?: { code?: string } } | undefined)?.error?.code
  if (response?.status === 403 || code === 'MANAGEMENT_TARGET_FORBIDDEN') return '您沒有權限查看此帳號資料。'
  if (response?.status === 404 || code === 'ADMIN_USER_NOT_FOUND') return '找不到此帳號，資料可能已不存在。'
  if (response?.status === 401) return '登入狀態已失效，請重新登入。'
  return '無法載入帳號詳細資料，請稍後再試。'
}

// 詳細資料一律重新向後端取得；request id 防止較舊回應覆蓋目前選取的帳號。
const openUserDetail = async (userId: string) => {
  const currentDetailRequest = ++detailRequestId
  selectedUserId.value = userId
  detail.value = null
  detailError.value = ''
  detailLoading.value = true
  detailVisible.value = true
  try {
    const [response, assignmentResponse] = await Promise.all([
      adminUsersApi.get(userId),
      authStore.isAdmin ? adminUsersApi.assignments(userId) : Promise.resolve(null)
    ])
    if (currentDetailRequest !== detailRequestId || selectedUserId.value !== userId) return
    detail.value = response.data.user
    detailAssignments.value = assignmentResponse?.data.assignments || []
  } catch (error) {
    if (currentDetailRequest !== detailRequestId || selectedUserId.value !== userId) return
    detailError.value = detailErrorMessage(error)
  } finally {
    if (currentDetailRequest === detailRequestId) detailLoading.value = false
  }
}

// 關閉時清除 target 與 detail 狀態，避免下次開啟短暫顯示前一位使用者資料。
const resetUserDetail = () => {
  detailRequestId += 1
  selectedUserId.value = null
  detail.value = null
  detailAssignments.value = []
  detailError.value = ''
  detailLoading.value = false
}

const governanceErrorMessage = (error: unknown, action: 'function' | 'assignment') => {
  const response = isAxiosError(error) ? error.response : null
  const backend = (response?.data as { error?: { code?: string } } | undefined)?.error
  if (response?.status === 403) return '你沒有權限執行此操作。'
  if (backend?.code === 'LAST_USABLE_ADMIN') return '系統至少必須保留一位可使用的最高管理者。'
  if (response?.status === 409 && action === 'function') return '目前無法卸任此職能；帳號仍有需要此職能的組織職務，請先移除或調整相關指派。若仍有待重新分配工作，也請先完成工作移交。'
  if (response?.status === 409) return '目前無法變更此組織職務。若要移除主要組織職務，請先處理同 Domain 的次要職務。'
  if (response?.status === 422) return '送出的職能或組織職務組合不符合規則，請重新選擇。'
  return '操作失敗，請稍後再試。'
}

// 權限視窗永遠重新讀取完整使用者與跨 Domain 指派，不受目前列表入口限制。
const loadGovernance = async (userId: string) => {
  const currentRequest = ++governanceRequestId
  governanceLoading.value = true
  mutationError.value = ''
  try {
    const [userResponse, assignmentResponse, organizationResponse] = await Promise.all([
      adminUsersApi.get(userId), adminUsersApi.assignments(userId), adminOrganizationsApi.list()
    ])
    if (currentRequest !== governanceRequestId || capabilityTarget.value?.id !== userId) return
    capabilityTarget.value = userResponse.data.user
    governanceAssignments.value = assignmentResponse.data.assignments
    organizations.value = organizationResponse.data.organizations
  } catch (error) {
    if (currentRequest === governanceRequestId) mutationError.value = governanceErrorMessage(error, 'assignment')
  } finally { if (currentRequest === governanceRequestId) governanceLoading.value = false }
}

const openCapabilityEditor = (user: AdminUser) => {
  capabilityTarget.value = user
  governanceAssignments.value = []
  mutationError.value = ''
  mutationSuccess.value = ''
  capabilityVisible.value = true
  void loadGovernance(user.id)
}
const resetGovernance = () => {
  governanceRequestId += 1
  capabilityTarget.value = null
  governanceAssignments.value = []
  organizations.value = []
  mutationError.value = ''
  mutationSuccess.value = ''
}
const reloadGovernance = async (success: string) => {
  if (!capabilityTarget.value) return
  const userId = capabilityTarget.value.id
  await Promise.all([loadGovernance(userId), loadUsers()])
  mutationSuccess.value = success
}
const goToInvitations = () => { capabilityVisible.value = false; void router.push('/admin/invitations') }
const goToOrganizations = () => { capabilityVisible.value = false; void router.push('/admin/organizations') }

const openAddFunction = (capability: StaffFunctionCapability) => {
  selectedStaffFunction.value = capability
  selectedFunctionOrganizationId.value = ''
  addFunctionError.value = ''
  addFunctionVisible.value = true
}
const addFunctionErrorMessage = (error: unknown) => {
  const response = isAxiosError(error) ? error.response : null
  if (response?.status === 403) return '你沒有權限執行此操作。'
  const selectedOrganization = organizations.value.find((item) => item.id === selectedFunctionOrganizationId.value)
  const existingAssignment = governanceAssignments.value.some((item) => item.organizationUnitId === selectedFunctionOrganizationId.value)
  // Backend 以 409 拒絕同一 User／Organization 的第二筆 assignment；在子 Dialog 直接提供可行處理方向。
  if (response?.status === 409 && existingAssignment) {
    return `此帳號已在「${selectedOrganization?.name || '所選組織'}」具有組織職務，無法以新增方式再次建立。請先調整現有組織職務，或選擇其他相容組織。`
  }
  if (response?.status === 409) return '目前無法新增此職能，請確認帳號與組織目前狀態。'
  if (response?.status === 422) return '所選職能與組織不相容，請重新選擇。'
  return '新增職能失敗，請稍後再試。'
}
const addStaffFunction = async () => {
  if (!capabilityTarget.value || !selectedStaffFunction.value || !selectedFunctionOrganizationId.value || mutationLoading.value) return
  mutationLoading.value = true; addFunctionError.value = ''
  try {
    const label = CAPABILITY_LABELS[selectedStaffFunction.value]
    await adminUsersApi.addStaffFunction(capabilityTarget.value.id, {
      capability: selectedStaffFunction.value,
      organizationUnitId: selectedFunctionOrganizationId.value
    })
    addFunctionVisible.value = false
    await reloadGovernance(`已新增「${label}」職能。`)
  } catch (error) { addFunctionError.value = addFunctionErrorMessage(error) }
  finally { mutationLoading.value = false }
}
const removeStaffFunction = async (capability: StaffFunctionCapability) => {
  if (!capabilityTarget.value || mutationLoading.value || !window.confirm(`確定卸任「${CAPABILITY_LABELS[capability]}」職能？`)) return
  mutationLoading.value = true; mutationError.value = ''
  try {
    await adminUsersApi.removeStaffFunction(capabilityTarget.value.id, capability)
    await reloadGovernance(`已卸任「${CAPABILITY_LABELS[capability]}」職能。`)
  } catch (error) { mutationError.value = governanceErrorMessage(error, 'function') }
  finally { mutationLoading.value = false }
}
const toggleAdminCapability = async () => {
  if (!capabilityTarget.value || mutationLoading.value) return
  const hasAdmin = capabilityTarget.value.capabilities.includes('ADMIN')
  if (!window.confirm(`確定${hasAdmin ? '移除' : '授予'}「最高管理者」權限？`)) return
  mutationLoading.value = true; mutationError.value = ''
  const capabilities = hasAdmin
    ? capabilityTarget.value.capabilities.filter((item) => item !== 'ADMIN')
    : [...capabilityTarget.value.capabilities, 'ADMIN' as Capability]
  try {
    // ADMIN 維持既有 privileged capability endpoint，不送入 Staff Function API。
    await adminUsersApi.changeCapabilities(capabilityTarget.value.id, capabilities)
    await reloadGovernance(hasAdmin ? '已移除最高管理者權限。' : '已授予最高管理者權限。')
  } catch (error) { mutationError.value = governanceErrorMessage(error, 'function') }
  finally { mutationLoading.value = false }
}

const openAddAssignment = () => { selectedAssignmentKey.value = ''; mutationError.value = ''; addAssignmentVisible.value = true }
const addAssignment = async () => {
  if (!capabilityTarget.value || !selectedAssignmentKey.value || mutationLoading.value) return
  const choice = assignmentChoices.value.find((item) => item.key === selectedAssignmentKey.value)
  if (!choice) return
  mutationLoading.value = true; mutationError.value = ''
  try {
    await adminOrganizationsApi.assign(choice.organization.id, { userId: capabilityTarget.value.id, assignmentRole: choice.assignmentRole })
    addAssignmentVisible.value = false
    await reloadGovernance(`已新增「${choice.organization.name}／${choice.assignmentRole === 'supervisor' ? '部門主管' : '部門成員'}」組織職務。`)
  } catch (error) { mutationError.value = governanceErrorMessage(error, 'assignment') }
  finally { mutationLoading.value = false }
}
const openMoveAssignment = (assignment: OrganizationAssignment) => { movingAssignment.value = assignment; moveDestinationId.value = ''; mutationError.value = ''; moveAssignmentVisible.value = true }
const moveAssignment = async () => {
  if (!capabilityTarget.value || !movingAssignment.value || !moveDestinationId.value || mutationLoading.value) return
  mutationLoading.value = true; mutationError.value = ''
  try {
    await adminOrganizationsApi.move(movingAssignment.value.organizationUnitId, {
      userId: capabilityTarget.value.id, destinationOrganizationUnitId: moveDestinationId.value
    })
    moveAssignmentVisible.value = false
    await reloadGovernance('組織職務已移動。')
  } catch (error) { mutationError.value = governanceErrorMessage(error, 'assignment') }
  finally { mutationLoading.value = false }
}
const removeAssignment = async (assignment: OrganizationAssignment) => {
  if (!capabilityTarget.value || mutationLoading.value) return
  const role = assignment.assignmentRole === 'supervisor' ? '部門主管' : '部門成員'
  if (!window.confirm(`確定移除「${assignment.organization?.name || '此組織'}／${role}」的組織職務？`)) return
  mutationLoading.value = true; mutationError.value = ''
  try {
    await adminOrganizationsApi.remove(assignment.organizationUnitId, capabilityTarget.value.id)
    await reloadGovernance('組織職務已移除。')
  } catch (error) { mutationError.value = governanceErrorMessage(error, 'assignment') }
  finally { mutationLoading.value = false }
}

const roleChangeErrorMessage = (error: unknown) => {
  const statusCode = isAxiosError(error) ? error.response?.status : null
  if (statusCode === 403) return '你沒有權限執行此操作。'
  if (statusCode === 404) return '找不到此組織職務，請重新載入後再試。'
  if (statusCode === 409) return '目前狀態已變更，請重新載入後再試。'
  if (statusCode === 422) return '目前帳號職能不符合此組織職務調整條件。'
  return '調整組織職務失敗，請稍後再試。'
}

const openRoleChange = (assignment: OrganizationAssignment) => {
  const targetRole = roleChangeTargetFor(assignment)
  if (!targetRole || !authStore.isAdmin) return
  roleChangeAssignment.value = assignment
  requestedAssignmentRole.value = targetRole
  roleChangeError.value = ''
  roleChangeVisible.value = true
}

// 確認後只 PATCH assignmentRole；不自動增刪 Staff Function，也不改 Primary/Secondary。
// 成功後重新讀取 User、所有 assignments 與列表，避免以本地推測覆蓋 Backend authoritative state。
const changeAssignmentRole = async () => {
  if (!roleChangeAssignment.value || !requestedAssignmentRole.value || mutationLoading.value) return
  mutationLoading.value = true
  roleChangeError.value = ''
  const assignment = roleChangeAssignment.value
  const targetRole = requestedAssignmentRole.value
  try {
    await adminOrganizationsApi.changeAssignmentRole(
      assignment.organizationUnitId,
      assignment.id,
      targetRole
    )
    roleChangeVisible.value = false
    const organizationName = assignment.organization?.name || '此組織'
    await reloadGovernance(`已將「${organizationName}」調整為「${targetRole === 'supervisor' ? '部門主管' : '部門成員'}」。`)
  } catch (error) {
    roleChangeError.value = roleChangeErrorMessage(error)
  } finally { mutationLoading.value = false }
}

watch([section, status], () => { page.value = 1; void loadUsers() }, { immediate: true })
watch(search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; void loadUsers() }, 300) })
watch(selectedStaffFunction, () => { selectedFunctionOrganizationId.value = '' })
onBeforeUnmount(() => { requestId += 1; detailRequestId += 1; governanceRequestId += 1; clearTimeout(searchTimer) })
</script>

<template>
  <section class="users-view">
    <header><div><p class="eyebrow">帳號管理</p><h1>{{ section.label }}</h1></div></header>
    <div class="filters"><div class="search-control"><InputText v-model="search" placeholder="搜尋姓名或 Email" aria-label="搜尋姓名或 Email" /><button v-if="search" type="button" class="clear-search" aria-label="清除搜尋" @click="clearSearch">×</button></div><Select v-model="status" :options="statusOptions" option-label="label" option-value="value" show-clear placeholder="全部狀態" /></div>
    <div v-if="errorMessage" class="state error" role="alert">{{ errorMessage }} <button type="button" @click="loadUsers">重新載入</button></div>
    <div v-else-if="loading" class="state"><ProgressSpinner /><span>載入帳號資料中…</span></div>
    <!-- 帳號列表使用獨立垂直捲動，避免大量資料把整個後台頁面往下撐長。 -->
    <DataTable v-else :value="users" scrollable scroll-height="clamp(18rem, 52vh, 38rem)" striped-rows responsive-layout="scroll" class="users-table" empty-message="目前沒有符合條件的帳號。">
      <Column field="name" header="姓名" />
      <Column header="權限"><template #body="{ data }"><div class="tag-list"><Tag v-for="capability in data.capabilities" :key="capability" :value="CAPABILITY_LABELS[capability as Capability]" /></div></template></Column>
      <Column header="帳號狀態"><template #body="{ data }"><Tag :value="STATUS_LABELS[data.accountStatus as AccountStatus]" :severity="STATUS_SEVERITY[data.accountStatus as AccountStatus]" /></template></Column>
      <Column header="建立日期"><template #body="{ data }">{{ formatAdminDate(data.createdAt) }}</template></Column>
      <Column header="最後登入"><template #body="{ data }">{{ formatAdminDate(data.lastLoginAt) }}</template></Column>
      <!-- Future Risk extension point: B2-2 不呈現 Risk 欄位、假資料或操作。 -->
      <Column header="操作"><template #body="{ data }"><button type="button" class="detail-button" @click="openUserDetail(data.id)">查看</button><button v-if="authStore.isAdmin" type="button" class="detail-button" @click="openCapabilityEditor(data)">權限</button></template></Column>
    </DataTable>
    <Paginator v-if="total > limit" :first="(page - 1) * limit" :rows="limit" :total-records="total" @page="page = $event.page + 1; loadUsers()" />

    <Dialog v-model:visible="detailVisible" modal header="帳號詳細資料" :style="{ width: 'min(42rem, calc(100vw - 2rem))' }" @hide="resetUserDetail">
      <div v-if="detailLoading" class="detail-state"><ProgressSpinner /><span>載入帳號詳細資料中…</span></div>
      <div v-else-if="detailError" class="detail-state detail-error" role="alert">{{ detailError }}</div>
      <dl v-else-if="detail" class="detail-grid">
        <div><dt>姓名</dt><dd>{{ detail.name }}</dd></div>
        <div><dt>Email</dt><dd>{{ detail.email }}</dd></div>
        <div><dt>角色</dt><dd><Tag :value="ROLE_LABELS[detail.role]" /></dd></div>
        <div><dt>Staff Capabilities</dt><dd class="tag-list"><Tag v-for="capability in detail.capabilities" :key="capability" :value="CAPABILITY_LABELS[capability]" /></dd></div>
        <div><dt>帳號狀態</dt><dd><Tag :value="STATUS_LABELS[detail.accountStatus]" :severity="STATUS_SEVERITY[detail.accountStatus]" /></dd></div>
        <div><dt>Email 驗證</dt><dd><Tag :value="detail.emailVerifiedAt ? '已驗證' : '尚未驗證'" :severity="detail.emailVerifiedAt ? 'success' : 'warn'" /> <span>{{ formatAdminDate(detail.emailVerifiedAt, '尚未驗證') }}</span></dd></div>
        <div><dt>建立日期</dt><dd>{{ formatAdminDate(detail.createdAt, '—') }}</dd></div>
        <div><dt>最後登入</dt><dd>{{ formatAdminDate(detail.lastLoginAt) }}</dd></div>
        <div><dt>最後更新時間</dt><dd>{{ formatAdminDate(detail.updatedAt, '—') }}</dd></div>
        <div class="assignment-detail"><dt>組織指派</dt><dd v-if="!authStore.isAdmin">僅最高管理者可查看</dd><dd v-else-if="!detailAssignments.length">尚無組織指派</dd><dd v-else><div v-for="assignment in detailAssignments" :key="assignment.id">{{ assignment.organization?.name }} · {{ assignment.assignmentRole === 'supervisor' ? '主管' : '成員' }} · {{ assignment.domain }}</div></dd></div>
      </dl>
    </Dialog>
    <Dialog v-model:visible="capabilityVisible" modal header="帳號權限" :style="{ width: 'min(52rem, calc(100vw - 2rem))' }" @hide="resetGovernance">
      <Message v-if="mutationError" severity="error" :closable="false">{{ mutationError }}</Message>
      <Message v-if="mutationSuccess" severity="success" :closable="false">{{ mutationSuccess }}</Message>
      <div v-if="governanceLoading" class="detail-state"><ProgressSpinner /><span>正在載入帳號權限…</span></div>
      <div v-else-if="capabilityTarget" class="governance-content">
        <header class="governance-identity"><div><strong>{{ capabilityTarget.name }}</strong><span>{{ capabilityTarget.email }}</span></div></header>
        <section class="governance-section">
          <div class="section-heading"><div><h3>身份 / 職能</h3><p>完整權限狀態不受目前帳號分類限制。</p></div></div>
          <div class="function-list">
            <div v-for="capability in identityCapabilities" :key="capability" class="function-row">
              <div><strong>{{ CAPABILITY_LABELS[capability] }}</strong><small v-if="capability === 'MEMBER'">基本帳號身份</small><small v-else>{{ capabilityTarget.capabilities.includes(capability) ? '已建立' : '尚未建立' }}</small></div>
              <Button v-if="capability === 'ADMIN' && (isEstablishedStaff || capabilityTarget.capabilities.includes('ADMIN'))" :label="capabilityTarget.capabilities.includes('ADMIN') ? '移除' : '授予'" text :severity="capabilityTarget.capabilities.includes('ADMIN') ? 'danger' : 'secondary'" :loading="mutationLoading" @click="toggleAdminCapability" />
              <Button v-else-if="capability !== 'MEMBER' && capabilityTarget.capabilities.includes(capability)" label="卸任" text severity="danger" :loading="mutationLoading" @click="removeStaffFunction(capability as StaffFunctionCapability)" />
              <Button v-else-if="capability !== 'MEMBER' && capability !== 'ADMIN' && isEstablishedStaff" label="新增" text :disabled="mutationLoading" @click="openAddFunction(capability as StaffFunctionCapability)" />
              <Tag v-else-if="capability === 'MEMBER'" value="基本身份" severity="secondary" />
            </div>
          </div>
          <div v-if="!isEstablishedStaff" class="guidance-card">
            <p>此帳號尚未取得後台員工身份。請先透過「員工邀請」完成第一次後台身份驗證。</p>
            <Button label="前往員工邀請" severity="secondary" @click="goToInvitations" />
          </div>
        </section>
        <section class="governance-section">
          <div class="section-heading"><div><h3>目前組織職務</h3><p>此帳號跨所有 Domain 的完整組織指派。</p></div><Button v-if="isEstablishedStaff" label="新增組織職務" icon="pi pi-plus" :disabled="mutationLoading" @click="openAddAssignment" /></div>
          <p v-if="!governanceAssignments.length" class="empty-note">目前尚無組織職務。</p>
          <div v-else class="assignment-list">
            <article v-for="assignment in governanceAssignments" :key="assignment.id" class="assignment-row">
              <div><strong>{{ assignment.organization?.name || '未知組織' }}</strong><small>{{ assignment.domain }} · {{ assignment.assignmentRole === 'supervisor' ? '部門主管' : '部門成員' }}</small></div>
              <Tag :value="assignment.isPrimary ? 'Primary' : 'Secondary'" :severity="assignment.isPrimary ? 'info' : 'secondary'" />
              <div class="row-actions"><Button v-if="authStore.isAdmin && roleChangeTargetFor(assignment)" :label="assignment.assignmentRole === 'supervisor' ? '降為成員' : '升為主管'" text :disabled="mutationLoading" @click="openRoleChange(assignment)" /><Button label="移動" text :disabled="mutationLoading" @click="openMoveAssignment(assignment)" /><Button label="移除" text severity="danger" :disabled="mutationLoading" @click="removeAssignment(assignment)" /></div>
            </article>
          </div>
        </section>
      </div>
    </Dialog>
    <Dialog v-model:visible="addFunctionVisible" modal :header="selectedStaffFunction ? `新增${CAPABILITY_LABELS[selectedStaffFunction]}` : '新增職能'" :style="{ width: 'min(34rem, calc(100vw - 2rem))' }" @hide="addFunctionError = ''">
      <Message v-if="addFunctionError" severity="error" :closable="false">{{ addFunctionError }}</Message>
      <div class="form-grid">
        <label v-if="selectedStaffFunction">相容組織<Select v-model="selectedFunctionOrganizationId" :options="compatibleFunctionOrganizations" option-label="name" option-value="id" placeholder="選擇組織" /></label>
        <div v-if="selectedStaffFunction && !compatibleFunctionOrganizations.length" class="guidance-card"><p>目前尚無可指派的{{ selectedStaffFunction === 'PLATFORM_MANAGER' ? '平台' : '業務' }}組織。請先至「組織管理」建立{{ selectedStaffFunction === 'PLATFORM_MANAGER' ? '平台' : '業務' }}組織。</p><Button label="前往組織管理" severity="secondary" @click="goToOrganizations" /></div>
      </div>
      <template #footer><Button label="取消" severity="secondary" @click="addFunctionVisible = false" /><Button label="確認新增" :loading="mutationLoading" :disabled="!selectedStaffFunction || !selectedFunctionOrganizationId" @click="addStaffFunction" /></template>
    </Dialog>
    <Dialog v-model:visible="addAssignmentVisible" modal header="新增組織職務" :style="{ width: 'min(34rem, calc(100vw - 2rem))' }">
      <div v-if="assignmentChoices.length" class="form-grid"><label>組織與職務<Select v-model="selectedAssignmentKey" :options="assignmentChoices" option-value="key" placeholder="選擇組織職務"><template #option="slotProps">{{ slotProps.option.organization.name }}／{{ slotProps.option.assignmentRole === 'supervisor' ? '部門主管' : '部門成員' }}</template><template #value="slotProps"><span v-if="slotProps.value">{{ assignmentChoices.find(item => item.key === slotProps.value)?.organization.name }}／{{ assignmentChoices.find(item => item.key === slotProps.value)?.assignmentRole === 'supervisor' ? '部門主管' : '部門成員' }}</span><span v-else>選擇組織職務</span></template></Select></label></div>
      <div v-else class="guidance-card"><p>目前沒有符合此帳號職能且尚未指派的 active 組織。請先確認職能或前往組織管理。</p><Button label="前往組織管理" severity="secondary" @click="goToOrganizations" /></div>
      <template #footer><Button label="取消" severity="secondary" @click="addAssignmentVisible = false" /><Button label="新增組織職務" :loading="mutationLoading" :disabled="!selectedAssignmentKey" @click="addAssignment" /></template>
    </Dialog>
    <Dialog v-model:visible="moveAssignmentVisible" modal header="移動組織職務" :style="{ width: 'min(34rem, calc(100vw - 2rem))' }">
      <p v-if="movingAssignment">目前：{{ movingAssignment.organization?.name }}／{{ movingAssignment.assignmentRole === 'supervisor' ? '部門主管' : '部門成員' }}／{{ movingAssignment.isPrimary ? 'Primary' : 'Secondary' }}</p>
      <Select v-model="moveDestinationId" :options="moveDestinations" option-label="name" option-value="id" placeholder="選擇同 Domain 目的組織" class="full-width" />
      <p v-if="!moveDestinations.length" class="empty-note">目前沒有可移動的同 Domain active 組織。</p>
      <template #footer><Button label="取消" severity="secondary" @click="moveAssignmentVisible = false" /><Button label="移動" :loading="mutationLoading" :disabled="!moveDestinationId" @click="moveAssignment" /></template>
    </Dialog>
    <Dialog v-model:visible="roleChangeVisible" modal :header="requestedAssignmentRole === 'supervisor' ? '升為部門主管' : '降為部門成員'" :style="{ width: 'min(34rem, calc(100vw - 2rem))' }" @hide="roleChangeError = ''; roleChangeAssignment = null; requestedAssignmentRole = null">
      <Message v-if="roleChangeError" severity="error" :closable="false">{{ roleChangeError }}</Message>
      <div v-if="roleChangeAssignment && requestedAssignmentRole" class="role-change-confirmation">
        <p>確定將「{{ roleChangeAssignment.organization?.name || '此組織' }}」的組織職務由「{{ roleChangeAssignment.assignmentRole === 'supervisor' ? '部門主管' : '部門成員' }}」調整為「{{ requestedAssignmentRole === 'supervisor' ? '部門主管' : '部門成員' }}」？</p>
        <p class="dialog-note">此操作保留原組織指派與 Primary／Secondary，不會自動增刪業務主管職能或其他組織職務。</p>
      </div>
      <template #footer><Button label="取消" severity="secondary" :disabled="mutationLoading" @click="roleChangeVisible = false" /><Button :label="requestedAssignmentRole === 'supervisor' ? '確認升職' : '確認降職'" :loading="mutationLoading" :disabled="!requestedAssignmentRole || mutationLoading" @click="changeAssignmentRole" /></template>
    </Dialog>
  </section>
</template>

<style scoped lang="scss">
.tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
.assignment-detail { grid-column: 1 / -1; }
.dialog-note { color: var(--text-muted); font-size: .85rem; }
.governance-content, .governance-section, .form-grid { display: grid; gap: 14px; }
.governance-identity span, .function-row small, .assignment-row small { display: block; margin-top: 3px; color: var(--text-muted); }
.governance-section { padding-top: 14px; border-top: 1px solid var(--border-grey); }
.section-heading, .function-row, .assignment-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.section-heading h3, .section-heading p { margin: 0; }
.section-heading p { margin-top: 3px; color: var(--text-muted); font-size: .82rem; }
.function-list, .assignment-list { display: grid; gap: 8px; }
.function-row, .assignment-row, .guidance-card { padding: 12px; border: 1px solid var(--border-grey); border-radius: 10px; background: var(--bg-main); }
.assignment-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; }
.row-actions { display: flex; gap: 4px; }
.guidance-card p, .empty-note { margin: 0; color: var(--text-muted); }
.guidance-card { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.form-grid label { display: grid; gap: 6px; color: var(--text-main); }
.full-width { width: 100%; }
.users-view { display: grid; gap: 18px; } header { display: flex; align-items: center; justify-content: space-between; } .eyebrow { margin: 0 0 4px; color: var(--accent-active); font-size: .75rem; font-weight: 700; } h1 { margin: 0; color: var(--text-main); font-size: 1.5rem; } .filters { display: flex; gap: 12px; flex-wrap: wrap; padding: 16px; border: 1px solid var(--border-grey); border-radius: 12px; background: var(--bg-card); } .filters > :first-child { min-width: 260px; flex: 1; } .search-control { position: relative; display: flex; } .search-control :deep(input) { width: 100%; padding-right: 38px; } .clear-search { position: absolute; top: 50%; right: 8px; width: 28px; height: 28px; padding: 0; transform: translateY(-50%); border: 0; border-radius: 6px; background: transparent; color: var(--text-muted); font-size: 1.25rem; cursor: pointer; } .clear-search:hover, .clear-search:focus-visible { background: var(--bg-hover); color: var(--text-main); outline: 2px solid var(--accent-active); outline-offset: 1px; } .state { display: flex; min-height: 180px; align-items: center; justify-content: center; gap: 12px; border: 1px solid var(--border-grey); border-radius: 12px; background: var(--bg-card); color: var(--text-muted); } .state.error { color: var(--kqc-danger); } .state button, .detail-button { padding: 6px 10px; border: 1px solid var(--border-grey); border-radius: 7px; background: var(--bg-card); color: var(--text-main); } .detail-state { display: flex; min-height: 12rem; align-items: center; justify-content: center; gap: 12px; color: var(--text-muted); } .detail-error { color: var(--kqc-danger); } .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 0; } .detail-grid > div { padding: 12px; border: 1px solid var(--border-grey); border-radius: 10px; background: var(--bg-main); } .detail-grid dt { margin-bottom: 6px; color: var(--text-muted); font-size: .78rem; font-weight: 700; } .detail-grid dd { margin: 0; color: var(--text-main); overflow-wrap: anywhere; } .detail-grid dd span { margin-left: 6px; } .users-table { border: 1px solid var(--border-grey); border-radius: 12px; overflow: hidden; } @media (max-width: 640px) { .detail-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .assignment-row { grid-template-columns: 1fr; } .guidance-card, .section-heading { align-items: flex-start; flex-direction: column; } }
</style>
