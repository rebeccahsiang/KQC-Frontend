<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Message from 'primevue/message'

import { adminInvitationsApi, type AdminInvitation } from '@/api/adminInvitations'
import { adminOrganizationsApi, type AssignmentRole, type OrganizationUnit } from '@/api/adminOrganizations'
import { CAPABILITY_LABELS, type Capability } from '@/config/capabilities'

const invitations = ref<AdminInvitation[]>([])
const organizations = ref<OrganizationUnit[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const feedback = ref('')
const errorMessage = ref('')
const form = reactive<{ email: string; name: string; capabilities: Capability[]; organizationUnitId: string; assignmentRole: AssignmentRole }>({ email: '', name: '', capabilities: [], organizationUnitId: '', assignmentRole: 'member' })
const staffOptions = (Object.keys(CAPABILITY_LABELS) as Capability[]).filter((item) => item !== 'MEMBER').map((value) => ({ value, label: CAPABILITY_LABELS[value] }))
const supportsSales = computed(() => form.capabilities.includes('SALES') || form.capabilities.includes('SALES_SUPERVISOR'))
const organizationOptions = computed(() => organizations.value
  .filter((item) => item.status === 'active' && (
    (item.domain === 'platform' && form.capabilities.includes('PLATFORM_MANAGER')) ||
    (item.domain === 'sales' && supportsSales.value)
  ))
  .map((item) => ({ value: item.id, label: `${item.name}（${item.domain}）`, domain: item.domain })))
const selectedOrganization = computed(() => organizations.value.find((item) => item.id === form.organizationUnitId) || null)
const assignmentRoleOptions = computed(() => {
  if (selectedOrganization.value?.domain === 'platform') return [{ label: '主管', value: 'supervisor' as const }]
  if (selectedOrganization.value?.domain !== 'sales') return []
  return [
    ...(supportsSales.value ? [{ label: '成員', value: 'member' as const }] : []),
    ...(form.capabilities.includes('SALES_SUPERVISOR') ? [{ label: '主管', value: 'supervisor' as const }] : [])
  ]
})

const resetForm = () => {
  form.email = ''; form.name = ''; form.capabilities = []
  form.organizationUnitId = ''; form.assignmentRole = 'member'
}
const reconcileOrganizationSelection = () => {
  if (!form.organizationUnitId) { form.assignmentRole = 'member'; return }
  if (!organizationOptions.value.some((option) => option.value === form.organizationUnitId)) {
    form.organizationUnitId = ''; form.assignmentRole = 'member'; return
  }
  const roles = assignmentRoleOptions.value.map((option) => option.value)
  if (!roles.includes(form.assignmentRole)) form.assignmentRole = roles[0] || 'member'
}
const openInvitationDialog = () => { resetForm(); dialogVisible.value = true }
const closeInvitationDialog = () => { dialogVisible.value = false }

watch(() => [...form.capabilities], reconcileOrganizationSelection)
watch(() => form.organizationUnitId, reconcileOrganizationSelection)

const backendMessage = (error: unknown) => isAxiosError(error)
  ? (error.response?.data as { error?: { message?: string } })?.error?.message || '邀請操作失敗。'
  : '無法連線至伺服器。'

const load = async () => {
  loading.value = true; errorMessage.value = ''
  try {
    const [invitationResponse, organizationResponse] = await Promise.all([adminInvitationsApi.list(), adminOrganizationsApi.list()])
    invitations.value = invitationResponse.data.invitations
    organizations.value = organizationResponse.data.organizations
  } catch (error) { errorMessage.value = backendMessage(error) } finally { loading.value = false }
}

const createInvitation = async () => {
  if (!form.capabilities.length || submitting.value) return
  submitting.value = true; errorMessage.value = ''; feedback.value = ''
  try {
    const response = await adminInvitationsApi.create({ email: form.email, name: form.name,
      capabilities: form.capabilities, ...(form.organizationUnitId ? { organizationUnitId: form.organizationUnitId, assignmentRole: form.assignmentRole } : {}) })
    feedback.value = response.data.mailDelivered ? '邀請已建立並完成寄送。' : '邀請已建立，但郵件未送達；請勿重複建立。'
    resetForm()
    dialogVisible.value = false
    await load()
  } catch (error) { errorMessage.value = backendMessage(error) } finally { submitting.value = false }
}

const resend = async (id: string) => { try { const response = await adminInvitationsApi.resend(id); feedback.value = response.data.mailDelivered ? '邀請已重新寄送。' : '替代邀請已建立，但郵件未送達。'; await load() } catch (error) { errorMessage.value = backendMessage(error) } }
const revoke = async (id: string) => { try { await adminInvitationsApi.revoke(id); feedback.value = '邀請已撤銷。'; await load() } catch (error) { errorMessage.value = backendMessage(error) } }
onMounted(load)
</script>

<template>
  <section class="management-view">
    <header><div><p class="eyebrow">帳號治理</p><h1>員工邀請</h1></div><Button label="建立邀請" icon="pi pi-plus" @click="openInvitationDialog" /></header>
    <Message v-if="feedback" severity="success" :closable="false">{{ feedback }}</Message>
    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <p class="safe-note">同一 Email 若已是會員，接受邀請時會沿用既有帳號並增加 Staff Capability，不會建立重複 User。</p>
    <DataTable :value="invitations" :loading="loading" striped-rows empty-message="目前沒有員工邀請。">
      <Column field="name" header="姓名" /><Column field="email" header="Email" />
      <Column header="Staff Capabilities"><template #body="{ data }"><Tag v-for="item in data.capabilities" :key="item" :value="CAPABILITY_LABELS[item as Capability]" class="tag" /></template></Column>
      <Column field="status" header="狀態" /><Column field="expiresAt" header="到期時間" />
      <Column header="操作"><template #body="{ data }"><Button label="重寄" text :disabled="!['pending', 'expired'].includes(data.status)" @click="resend(data.id)" /><Button label="撤銷" text severity="danger" :disabled="data.status !== 'pending'" @click="revoke(data.id)" /></template></Column>
    </DataTable>
    <Dialog v-model:visible="dialogVisible" modal header="建立 Staff Invitation" :style="{ width: 'min(38rem, calc(100vw - 2rem))' }" @hide="resetForm">
      <div class="form-grid"><label>姓名<InputText v-model="form.name" /></label><label>Email<InputText v-model="form.email" type="email" /></label>
        <fieldset><legend>Staff Capabilities</legend><label v-for="option in staffOptions" :key="option.value"><input v-model="form.capabilities" type="checkbox" :value="option.value" />{{ option.label }}</label></fieldset>
        <label>組織（選填）<Select v-model="form.organizationUnitId" :options="organizationOptions" option-label="label" option-value="value" show-clear /></label>
        <label v-if="form.organizationUnitId">組織角色<Select v-model="form.assignmentRole" :options="assignmentRoleOptions" option-label="label" option-value="value" /></label>
        <small>主管指派所需 Capability 由 Backend 依組織 domain 驗證。</small></div>
      <template #footer><Button label="取消" severity="secondary" @click="closeInvitationDialog" /><Button label="建立並寄送" :loading="submitting" :disabled="!form.capabilities.length" @click="createInvitation" /></template>
    </Dialog>
  </section>
</template>

<style scoped>.management-view{display:grid;gap:16px}header{display:flex;align-items:center;justify-content:space-between}.eyebrow{color:var(--accent-active);font-weight:700}.safe-note{padding:12px;border:1px solid var(--border-grey);border-radius:10px;color:var(--text-muted)}.tag{margin:2px}.form-grid{display:grid;gap:14px}.form-grid label{display:grid;gap:6px}.form-grid fieldset{display:flex;flex-wrap:wrap;gap:12px;border:1px solid var(--border-grey);border-radius:10px;padding:12px}.form-grid fieldset label{display:flex;align-items:center;gap:6px}</style>
