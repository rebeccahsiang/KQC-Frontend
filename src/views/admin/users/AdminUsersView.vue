<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import { useRoute } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Paginator from 'primevue/paginator'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'

import { adminUsersApi, type AccountStatus, type AdminUser } from '@/api/adminUsers'
import { ADMIN_USER_SECTIONS, ROLE_LABELS, STATUS_LABELS, STATUS_SEVERITY, formatAdminDate } from '@/config/adminUsers'

const route = useRoute()
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

// Route meta is the only UI-to-backend canonical role boundary for this reusable view.
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
    const response = await adminUsersApi.list({ page: page.value, limit, role: section.value.role, search: search.value || undefined, status: status.value })
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
    const response = await adminUsersApi.get(userId)
    if (currentDetailRequest !== detailRequestId || selectedUserId.value !== userId) return
    detail.value = response.data.user
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
  detailError.value = ''
  detailLoading.value = false
}

watch([section, status], () => { page.value = 1; void loadUsers() }, { immediate: true })
watch(search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; void loadUsers() }, 300) })
onBeforeUnmount(() => { requestId += 1; detailRequestId += 1; clearTimeout(searchTimer) })
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
      <Column header="角色"><template #body="{ data }"><Tag :value="ROLE_LABELS[data.role as keyof typeof ROLE_LABELS]" /></template></Column>
      <Column header="帳號狀態"><template #body="{ data }"><Tag :value="STATUS_LABELS[data.accountStatus as AccountStatus]" :severity="STATUS_SEVERITY[data.accountStatus as AccountStatus]" /></template></Column>
      <Column header="建立日期"><template #body="{ data }">{{ formatAdminDate(data.createdAt) }}</template></Column>
      <Column header="最後登入"><template #body="{ data }">{{ formatAdminDate(data.lastLoginAt) }}</template></Column>
      <!-- Future Risk extension point: B2-2 不呈現 Risk 欄位、假資料或操作。 -->
      <Column header="操作"><template #body="{ data }"><button type="button" class="detail-button" @click="openUserDetail(data.id)">查看</button></template></Column>
    </DataTable>
    <Paginator v-if="total > limit" :first="(page - 1) * limit" :rows="limit" :total-records="total" @page="page = $event.page + 1; loadUsers()" />

    <Dialog v-model:visible="detailVisible" modal header="帳號詳細資料" :style="{ width: 'min(42rem, calc(100vw - 2rem))' }" @hide="resetUserDetail">
      <div v-if="detailLoading" class="detail-state"><ProgressSpinner /><span>載入帳號詳細資料中…</span></div>
      <div v-else-if="detailError" class="detail-state detail-error" role="alert">{{ detailError }}</div>
      <dl v-else-if="detail" class="detail-grid">
        <div><dt>姓名</dt><dd>{{ detail.name }}</dd></div>
        <div><dt>Email</dt><dd>{{ detail.email }}</dd></div>
        <div><dt>角色</dt><dd><Tag :value="ROLE_LABELS[detail.role]" /></dd></div>
        <div><dt>帳號狀態</dt><dd><Tag :value="STATUS_LABELS[detail.accountStatus]" :severity="STATUS_SEVERITY[detail.accountStatus]" /></dd></div>
        <div><dt>Email 驗證</dt><dd><Tag :value="detail.emailVerifiedAt ? '已驗證' : '尚未驗證'" :severity="detail.emailVerifiedAt ? 'success' : 'warn'" /> <span>{{ formatAdminDate(detail.emailVerifiedAt, '尚未驗證') }}</span></dd></div>
        <div><dt>建立日期</dt><dd>{{ formatAdminDate(detail.createdAt, '—') }}</dd></div>
        <div><dt>最後登入</dt><dd>{{ formatAdminDate(detail.lastLoginAt) }}</dd></div>
        <div><dt>最後更新時間</dt><dd>{{ formatAdminDate(detail.updatedAt, '—') }}</dd></div>
      </dl>
    </Dialog>
  </section>
</template>

<style scoped lang="scss">
.users-view { display: grid; gap: 18px; } header { display: flex; align-items: center; justify-content: space-between; } .eyebrow { margin: 0 0 4px; color: var(--accent-active); font-size: .75rem; font-weight: 700; } h1 { margin: 0; color: var(--text-main); font-size: 1.5rem; } .filters { display: flex; gap: 12px; flex-wrap: wrap; padding: 16px; border: 1px solid var(--border-grey); border-radius: 12px; background: var(--bg-card); } .filters > :first-child { min-width: 260px; flex: 1; } .search-control { position: relative; display: flex; } .search-control :deep(input) { width: 100%; padding-right: 38px; } .clear-search { position: absolute; top: 50%; right: 8px; width: 28px; height: 28px; padding: 0; transform: translateY(-50%); border: 0; border-radius: 6px; background: transparent; color: var(--text-muted); font-size: 1.25rem; cursor: pointer; } .clear-search:hover, .clear-search:focus-visible { background: var(--bg-hover); color: var(--text-main); outline: 2px solid var(--accent-active); outline-offset: 1px; } .state { display: flex; min-height: 180px; align-items: center; justify-content: center; gap: 12px; border: 1px solid var(--border-grey); border-radius: 12px; background: var(--bg-card); color: var(--text-muted); } .state.error { color: var(--kqc-danger); } .state button, .detail-button { padding: 6px 10px; border: 1px solid var(--border-grey); border-radius: 7px; background: var(--bg-card); color: var(--text-main); } .detail-state { display: flex; min-height: 12rem; align-items: center; justify-content: center; gap: 12px; color: var(--text-muted); } .detail-error { color: var(--kqc-danger); } .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 0; } .detail-grid > div { padding: 12px; border: 1px solid var(--border-grey); border-radius: 10px; background: var(--bg-main); } .detail-grid dt { margin-bottom: 6px; color: var(--text-muted); font-size: .78rem; font-weight: 700; } .detail-grid dd { margin: 0; color: var(--text-main); overflow-wrap: anywhere; } .detail-grid dd span { margin-left: 6px; } .users-table { border: 1px solid var(--border-grey); border-radius: 12px; overflow: hidden; } @media (max-width: 640px) { .detail-grid { grid-template-columns: 1fr; } }
</style>
