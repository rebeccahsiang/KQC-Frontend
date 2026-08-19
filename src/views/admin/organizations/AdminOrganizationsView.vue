<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Message from 'primevue/message'

import {
  adminOrganizationsApi,
  type AssignmentCandidate,
  type AssignmentRole,
  type OrganizationAssignment,
  type OrganizationDomain,
  type OrganizationUnit
} from '@/api/adminOrganizations'
import { CAPABILITY_LABELS, type Capability } from '@/config/capabilities'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const organizations = ref<OrganizationUnit[]>([])
const selected = ref<OrganizationUnit | null>(null)
const assignments = ref<OrganizationAssignment[]>([])
const loading = ref(false)
const detailLoading = ref(false)
const errorMessage = ref('')
const feedback = ref('')
const createVisible = ref(false)
const assignVisible = ref(false)
const moveVisible = ref(false)
const createForm = reactive<{ name: string; domain: OrganizationDomain; parentId: string }>({ name: '', domain: 'sales', parentId: '' })
const assignForm = reactive<{ assignmentRole: AssignmentRole }>({ assignmentRole: 'member' })
const moveForm = reactive({ userId: '', destinationOrganizationUnitId: '' })
const candidateSearch = ref('')
const candidates = ref<AssignmentCandidate[]>([])
const selectedCandidate = ref<AssignmentCandidate | null>(null)
const candidateLoading = ref(false)
const candidateError = ref('')
const candidatePage = ref(1)
const candidatePagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })
const assignmentSubmitting = ref(false)
let candidateRequestId = 0
let candidateSearchTimer: ReturnType<typeof setTimeout> | undefined

const canMutateSelected = computed(() => selected.value?.status === 'active')
const parentName = (parentId: string | null) => organizations.value.find((item) => item.id === parentId)?.name || '—'
const capabilityLabel = (capability: Capability) => CAPABILITY_LABELS[capability]
const destinationOptions = computed(() => organizations.value.filter((item) => item.status === 'active' && item.domain === selected.value?.domain && item.id !== selected.value?.id))
const assignmentRoleOptions = computed(() => selected.value?.domain === 'platform'
  ? [{ label: '部門主管', value: 'supervisor' as AssignmentRole }]
  : [
      { label: '部門成員', value: 'member' as AssignmentRole },
      { label: '部門主管', value: 'supervisor' as AssignmentRole }
    ])

const explainError = (error: unknown) => {
  if (!isAxiosError(error)) return '無法連線至伺服器。'
  const status = error.response?.status
  const message = (error.response?.data as { error?: { message?: string } })?.error?.message
  if (status === 403) return '沒有此組織的管理範圍。'
  if (status === 409) return message || '指派或同 domain primary 組織發生衝突。'
  if (status === 422) return message || '組織資料驗證失敗。'
  return message || '組織操作失敗。'
}
const explainCandidateError = (error: unknown) => {
  if (!isAxiosError(error)) return '無法載入符合條件的使用者，請稍後再試。'
  if (error.response?.status === 403) return '你沒有搜尋此組織指派候選人的權限。'
  if (error.response?.status === 409) return '此組織目前無法新增指派，請重新載入後再試。'
  if (error.response?.status === 422) return '目前的組織與指派角色不支援候選人搜尋。'
  return '無法載入符合條件的使用者，請稍後再試。'
}

const loadOrganizations = async () => {
  loading.value = true; errorMessage.value = ''
  try { organizations.value = (await adminOrganizationsApi.list()).data.organizations }
  catch (error) { errorMessage.value = explainError(error) } finally { loading.value = false }
}
const loadAssignments = async (organization: OrganizationUnit) => {
  selected.value = organization; detailLoading.value = true; errorMessage.value = ''
  try { const response = await adminOrganizationsApi.assignments(organization.id); selected.value = response.data.organization; assignments.value = response.data.assignments }
  catch (error) { assignments.value = []; errorMessage.value = explainError(error) } finally { detailLoading.value = false }
}
const reloadAuthoritative = async () => { const id = selected.value?.id; await loadOrganizations(); if (id) { const current = organizations.value.find((item) => item.id === id); if (current) await loadAssignments(current) } }
const createOrganization = async () => { try { await adminOrganizationsApi.create({ name: createForm.name, domain: createForm.domain, ...(createForm.parentId ? { parentId: createForm.parentId } : {}) }); createVisible.value = false; feedback.value = '組織已建立。'; await loadOrganizations() } catch (error) { errorMessage.value = explainError(error) } }
const toggleDisabled = async () => { if (!selected.value) return; try { await adminOrganizationsApi.update(selected.value.id, { status: selected.value.status === 'active' ? 'disabled' : 'active' }); feedback.value = '組織狀態已更新。'; await reloadAuthoritative() } catch (error) { errorMessage.value = explainError(error) } }

const loadCandidates = async () => {
  if (!assignVisible.value || !selected.value) return
  const request = ++candidateRequestId
  const organizationId = selected.value.id
  const assignmentRole = assignForm.assignmentRole
  const search = candidateSearch.value
  const page = candidatePage.value
  candidateLoading.value = true; candidateError.value = ''
  try {
    const response = await adminOrganizationsApi.assignmentCandidates(organizationId, {
      assignmentRole, search: search || undefined, page, limit: candidatePagination.value.limit
    })
    // 只有最後一次且條件仍相同的回應可以更新畫面，避免較慢的舊搜尋覆蓋新結果。
    if (request !== candidateRequestId || selected.value?.id !== organizationId ||
      assignForm.assignmentRole !== assignmentRole || candidateSearch.value !== search || candidatePage.value !== page) return
    candidates.value = response.data.candidates
    candidatePagination.value = response.data.pagination
  } catch (error) {
    if (request !== candidateRequestId) return
    candidates.value = []; candidateError.value = explainCandidateError(error)
  } finally {
    if (request === candidateRequestId) candidateLoading.value = false
  }
}
const resetCandidateState = () => {
  candidateRequestId += 1; clearTimeout(candidateSearchTimer)
  candidateSearch.value = ''; candidates.value = []; selectedCandidate.value = null
  candidatePage.value = 1; candidatePagination.value = { page: 1, limit: 10, total: 0, totalPages: 0 }
  candidateLoading.value = false; candidateError.value = ''
}
const openAssignmentDialog = () => {
  resetCandidateState()
  assignForm.assignmentRole = selected.value?.domain === 'platform' ? 'supervisor' : 'member'
  assignVisible.value = true
  void loadCandidates()
}
const changeAssignmentRole = (role: AssignmentRole) => {
  assignForm.assignmentRole = role
  selectedCandidate.value = null; candidates.value = []; candidatePage.value = 1
  void loadCandidates()
}
const selectCandidate = (candidate: AssignmentCandidate) => { selectedCandidate.value = candidate }
const clearSelectedCandidate = () => { selectedCandidate.value = null }
const changeCandidatePage = (page: number) => {
  if (page < 1 || page > candidatePagination.value.totalPages || page === candidatePage.value) return
  candidatePage.value = page; selectedCandidate.value = null; void loadCandidates()
}
const addAssignment = async () => {
  if (!selected.value || !selectedCandidate.value || assignmentSubmitting.value) return
  assignmentSubmitting.value = true
  try {
    await adminOrganizationsApi.assign(selected.value.id, {
      userId: selectedCandidate.value.id,
      assignmentRole: assignForm.assignmentRole
    })
    assignVisible.value = false; feedback.value = '組織指派已新增。'; resetCandidateState()
    await reloadAuthoritative()
  } catch (error) { errorMessage.value = explainError(error) } finally { assignmentSubmitting.value = false }
}
const removeAssignment = async (userId: string) => { if (!selected.value) return; try { await adminOrganizationsApi.remove(selected.value.id, userId); feedback.value = '組織指派已移除。'; await reloadAuthoritative() } catch (error) { errorMessage.value = explainError(error) } }
const moveAssignment = async () => { if (!selected.value) return; try { await adminOrganizationsApi.move(selected.value.id, moveForm); moveVisible.value = false; feedback.value = '成員已移動。'; await reloadAuthoritative() } catch (error) { errorMessage.value = explainError(error) } }

watch(candidateSearch, () => {
  if (!assignVisible.value) return
  clearTimeout(candidateSearchTimer)
  candidateSearchTimer = setTimeout(() => {
    candidatePage.value = 1; selectedCandidate.value = null; void loadCandidates()
  }, 300)
})
onMounted(loadOrganizations)
onBeforeUnmount(() => { candidateRequestId += 1; clearTimeout(candidateSearchTimer) })
</script>

<template>
  <section class="organization-view">
    <header><div><p class="eyebrow">組織治理</p><h1>組織管理</h1></div><Button v-if="authStore.isAdmin" label="新增組織" @click="createVisible = true" /></header>
    <Message v-if="feedback" severity="success" :closable="false">{{ feedback }}</Message><Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <div class="workspace">
      <DataTable :value="organizations" :loading="loading" selection-mode="single" data-key="id" @row-select="loadAssignments($event.data)">
        <Column field="name" header="名稱" /><Column header="上層"><template #body="{ data }">{{ parentName(data.parentId) }}</template></Column><Column field="domain" header="Domain" /><Column header="狀態"><template #body="{ data }"><Tag :value="data.status === 'active' ? '使用中' : '已停用'" :severity="data.status === 'active' ? 'success' : 'secondary'" /></template></Column><Column header="操作"><template #body="{ data }"><Button label="查看" text @click="loadAssignments(data)" /></template></Column>
      </DataTable>
      <article v-if="selected" class="detail-panel"><header><div><h2>{{ selected.name }}</h2><p>{{ selected.domain }} · {{ selected.status }}</p></div><div><Button v-if="authStore.isAdmin" :label="selected.status === 'active' ? '停用' : '重新啟用'" severity="secondary" @click="toggleDisabled" /><Button label="新增指派" :disabled="!canMutateSelected" @click="openAssignmentDialog" /></div></header>
        <p v-if="selected.status === 'disabled'" class="disabled-note">此組織已停用；既有指派保留供治理查閱，但不可新增成員、主管或作為移動目的地。</p>
        <DataTable :value="assignments" :loading="detailLoading" empty-message="此組織目前沒有指派。"><Column header="使用者"><template #body="{ data }"><strong>{{ data.user?.name }}</strong><small>{{ data.user?.email }}</small></template></Column><Column header="角色"><template #body="{ data }">{{ data.assignmentRole === 'supervisor' ? '主管' : '成員' }}</template></Column><Column header="Capabilities"><template #body="{ data }"><Tag v-for="item in data.user?.capabilities" :key="item" :value="capabilityLabel(item)" /></template></Column><Column header="Primary"><template #body="{ data }">{{ data.isPrimary ? '是' : '否' }}</template></Column><Column header="操作"><template #body="{ data }"><Button label="移除" text severity="danger" @click="removeAssignment(data.userId)" /><Button v-if="authStore.isAdmin" label="移動" text :disabled="!canMutateSelected" @click="moveForm.userId = data.userId; moveVisible = true" /></template></Column></DataTable>
      </article>
    </div>
    <Dialog v-model:visible="createVisible" modal header="新增組織"><div class="form-grid"><label>名稱<InputText v-model="createForm.name" /></label><label>Domain<Select v-model="createForm.domain" :options="['sales', 'platform']" /></label><label>上層組織（選填）<Select v-model="createForm.parentId" :options="organizations.filter(item => item.status === 'active' && item.domain === createForm.domain)" option-label="name" option-value="id" show-clear /></label></div><template #footer><Button label="建立" @click="createOrganization" /></template></Dialog>
    <Dialog v-model:visible="assignVisible" modal header="新增組織指派" :style="{ width: 'min(42rem, calc(100vw - 2rem))' }" @hide="resetCandidateState">
      <div class="form-grid candidate-picker">
        <label>指派角色<Select :model-value="assignForm.assignmentRole" :options="assignmentRoleOptions" option-label="label" option-value="value" aria-label="指派角色" @update:model-value="changeAssignmentRole" /></label>
        <small v-if="selected?.domain === 'platform'">平台組織目前僅支援部門主管指派。</small>
        <label>選擇使用者<InputText v-model="candidateSearch" placeholder="搜尋姓名或 Email" aria-label="搜尋指派候選人姓名或 Email" /></label>
        <div v-if="selectedCandidate" class="selected-candidate">
          <div><strong>{{ selectedCandidate.name }}</strong><small>{{ selectedCandidate.email }}</small><div class="candidate-capabilities"><Tag v-for="item in selectedCandidate.capabilities" :key="item" :value="capabilityLabel(item)" /></div></div>
          <Button label="清除選擇" text severity="secondary" aria-label="清除已選使用者" @click="clearSelectedCandidate" />
        </div>
        <div v-if="candidateLoading" class="candidate-state" aria-live="polite">正在載入符合條件的使用者…</div>
        <Message v-else-if="candidateError" severity="error" :closable="false">{{ candidateError }}</Message>
        <div v-else-if="!candidates.length" class="candidate-state">找不到符合目前指派條件的使用者。</div>
        <div v-else class="candidate-results" role="listbox" aria-label="指派候選人">
          <button v-for="candidate in candidates" :key="candidate.id" type="button" class="candidate-option" :class="{ selected: selectedCandidate?.id === candidate.id }" role="option" :aria-selected="selectedCandidate?.id === candidate.id" @click="selectCandidate(candidate)">
            <span><strong>{{ candidate.name }}</strong><small>{{ candidate.email }}</small></span>
            <span class="candidate-capabilities"><Tag v-for="item in candidate.capabilities" :key="item" :value="capabilityLabel(item)" /></span>
          </button>
        </div>
        <div v-if="candidatePagination.totalPages > 1" class="candidate-pagination">
          <Button label="上一頁" text :disabled="candidatePage <= 1 || candidateLoading" @click="changeCandidatePage(candidatePage - 1)" />
          <span>第 {{ candidatePage }} / {{ candidatePagination.totalPages }} 頁</span>
          <Button label="下一頁" text :disabled="candidatePage >= candidatePagination.totalPages || candidateLoading" @click="changeCandidatePage(candidatePage + 1)" />
        </div>
      </div>
      <template #footer><Button label="新增指派" :loading="assignmentSubmitting" :disabled="!canMutateSelected || !selectedCandidate || assignmentSubmitting" @click="addAssignment" /></template>
    </Dialog>
    <Dialog v-model:visible="moveVisible" modal header="移動成員"><Select v-model="moveForm.destinationOrganizationUnitId" :options="destinationOptions" option-label="name" option-value="id" /><template #footer><Button label="移動" :disabled="!moveForm.destinationOrganizationUnitId" @click="moveAssignment" /></template></Dialog>
  </section>
</template>

<style scoped>.organization-view{display:grid;gap:16px}.organization-view>header,.detail-panel header{display:flex;align-items:center;justify-content:space-between;gap:12px}.workspace{display:grid;grid-template-columns:minmax(20rem,1fr) minmax(24rem,1.2fr);gap:16px}.detail-panel{padding:16px;border:1px solid var(--border-grey);border-radius:12px;background:var(--bg-card)}small{display:block;color:var(--text-muted)}.disabled-note{padding:10px;border:1px solid var(--border-grey);border-radius:8px;color:var(--text-muted)}.form-grid{display:grid;gap:14px}.form-grid label{display:grid;gap:6px}.candidate-results{display:grid;max-height:18rem;overflow-y:auto;border:1px solid var(--border-grey);border-radius:10px}.candidate-option{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border:0;border-bottom:1px solid var(--border-grey);background:var(--bg-card);color:var(--text-main);text-align:left;cursor:pointer}.candidate-option:last-child{border-bottom:0}.candidate-option:hover,.candidate-option:focus-visible,.candidate-option.selected{background:var(--bg-hover);outline:2px solid var(--accent-active);outline-offset:-2px}.candidate-capabilities{display:flex;flex-wrap:wrap;gap:6px}.selected-candidate{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border:1px solid var(--accent-active);border-radius:10px;background:var(--bg-main)}.candidate-state{padding:20px;text-align:center;color:var(--text-muted)}.candidate-pagination{display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text-muted)}@media(max-width:900px){.workspace{grid-template-columns:1fr}}@media(max-width:640px){.candidate-option,.selected-candidate{align-items:flex-start;flex-direction:column}}</style>
