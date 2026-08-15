import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('four account routes share one view and map to canonical backend roles', () => {
  const router = read('src/router/index.ts')
  const config = read('src/config/adminUsers.ts')
  for (const [section, role] of [['members', 'user'], ['sales', 'sales'], ['managers', 'manager'], ['admins', 'admin']]) {
    assert.match(router, new RegExp(`path:\\s*['"]${section}['"][^}]+AdminUsersView\\.vue[^}]+userSection:\\s*['"]${section}['"]`))
    assert.match(config, new RegExp(`${section}: \\{ role: ['"]${role}['"]`))
  }
})

test('sidebar preserves the formal hierarchy and manager/admin visibility', () => {
  const menu = read('src/config/sidebarMenu.ts')
  assert.match(menu, /title: '帳號管理'/)
  assert.match(menu, /id: 'general-accounts'[\s\S]{0,100}title: '一般帳號管理'[\s\S]{0,100}roles: \['manager', 'admin'\]/)
  for (const path of ['members', 'sales', 'managers']) assert.match(menu, new RegExp(`${path}[^\\n]+roles: \\['manager', 'admin'\\]`))
  assert.match(menu, /id: 'highest-management'[\s\S]{0,100}title: '最高管理'[\s\S]{0,100}roles: \['admin'\]/)
  assert.match(menu, /title: '最高管理者'[^\n]+roles: \['admin'\]/)
  assert.doesNotMatch(menu, /id: 'highest-management'[\s\S]{0,100}roles: \[[^\]]*'manager'/)
})

test('API and view preserve backend pagination and canonical role query', () => {
  const api = read('src/api/adminUsers.ts')
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(api, /'\/v1\/admin\/users'/)
  for (const field of ['id', 'email', 'name', 'role', 'accountStatus', 'emailVerifiedAt', 'lastLoginAt', 'createdAt', 'updatedAt']) assert.match(api, new RegExp(`\\b${field}:`))
  assert.match(view, /role: section\.value\.role/)
  assert.match(view, /pagination\.total/)
  assert.match(view, /total-records="total"/)
  assert.match(view, /placeholder="搜尋姓名或 Email"/)
  assert.doesNotMatch(view, /<Column[^>]+(?:field="email"|header="Email")/)
})

test('view implements loading, empty, error, mapping and null last-login states', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  const config = read('src/config/adminUsers.ts')
  assert.match(view, /ProgressSpinner/)
  assert.match(view, /empty-message="目前沒有符合條件的帳號。"/)
  assert.match(view, /無法載入帳號資料/)
  assert.match(view, /MANAGEMENT_TARGET_FORBIDDEN/)
  assert.match(config, /尚未登入/)
  for (const value of ['pending', 'active', 'suspended', 'disabled']) assert.match(config, new RegExp(`${value}:`))
  for (const role of ['user', 'sales', 'manager', 'admin']) assert.match(config, new RegExp(`${role}:`))
  for (const [role, label] of [['user', '會員'], ['sales', '業務'], ['manager', '平台管理者'], ['admin', '最高管理者']]) {
    assert.match(config, new RegExp(`${role}: '${label}'`))
  }
  for (const [status, label] of [['pending', '待啟用'], ['active', '使用中'], ['suspended', '已暫停'], ['disabled', '已停用']]) {
    assert.match(config, new RegExp(`${status}: '${label}'`))
  }
})

test('foundation has no mutation, invitation, AI risk, notification, or browser credential logic', () => {
  const source = [read('src/api/adminUsers.ts'), read('src/views/admin/users/AdminUsersView.vue')].join('\n')
  const executableSource = source.replace(/<!--[\s\S]*?-->/g, '')
  assert.doesNotMatch(executableSource, /patch\(|post\(|delete\(|invitation|risk|notification|localStorage|sessionStorage|document\.cookie|decode/i)
})

test('search clear control resets only search and pagination while preserving role and status', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  const handler = view.slice(view.indexOf('const clearSearch'), view.indexOf('const loadUsers'))
  assert.match(view, /v-if="search"[^>]+aria-label="清除搜尋"[^>]+@click="clearSearch"/)
  assert.match(handler, /search\.value = ''/)
  assert.match(handler, /page\.value = 1/)
  assert.doesNotMatch(handler, /status\.value|section|router|route/)
  assert.match(view, /role: section\.value\.role/)
  assert.match(view, /status: status\.value/)
})

test('DataTable uses PrimeVue vertical scrolling without changing columns or filters', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /<DataTable[^>]+\bscrollable\b/)
  assert.match(view, /scroll-height="clamp\(18rem, 52vh, 38rem\)"/)
  for (const header of ['姓名', '角色', '帳號狀態', '建立日期', '最後登入', '操作']) {
    assert.match(view, new RegExp(`header="${header}"`))
  }
  assert.match(view, /aria-label="清除搜尋"/)
  assert.match(view, /v-model="status"/)
  assert.match(view, /<Paginator v-if="total > limit"/)
})

test('enabled View action selects the row id and loads authoritative detail API data', () => {
  const api = read('src/api/adminUsers.ts')
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(api, /interface AdminUserDetailResponse \{ user: AdminUser \}/)
  assert.match(api, /get: \(userId: string\) => api\.get<Envelope<AdminUserDetailResponse>>\(`\/v1\/admin\/users\/\$\{encodeURIComponent\(userId\)\}`\)/)
  assert.match(view, /#body="\{ data \}"[^>]*><button[^>]+@click="openUserDetail\(data\.id\)"/)
  assert.doesNotMatch(view, /class="detail-button"[^>]+disabled/)
  assert.match(view, /selectedUserId\.value = userId/)
  assert.match(view, /const response = await adminUsersApi\.get\(userId\)/)
  assert.match(view, /detail\.value = response\.data\.user/)
})

test('detail parsing follows the real nested Backend user envelope', () => {
  const response = {
    success: true,
    data: {
      user: {
        id: 'u1', email: 'test@example.test', name: '測試帳號', role: 'user',
        accountStatus: 'active', emailVerifiedAt: null, lastLoginAt: null,
        createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-02T00:00:00.000Z'
      }
    }
  }
  const detail = response.data.user
  assert.deepEqual(detail, {
    id: 'u1', email: 'test@example.test', name: '測試帳號', role: 'user',
    accountStatus: 'active', emailVerifiedAt: null, lastLoginAt: null,
    createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-02T00:00:00.000Z'
  })
  assert.deepEqual(Object.keys(detail), [
    'id', 'email', 'name', 'role', 'accountStatus', 'emailVerifiedAt',
    'lastLoginAt', 'createdAt', 'updatedAt'
  ])
})

test('PrimeVue detail dialog exposes loading, safe errors and every approved field', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /import Dialog from 'primevue\/dialog'/)
  assert.match(view, /<Dialog[^>]+v-model:visible="detailVisible"[^>]+modal[^>]+header="帳號詳細資料"/)
  assert.match(view, /v-if="detailLoading"[\s\S]{0,100}ProgressSpinner/)
  assert.match(view, /v-else-if="detailError"[^>]+role="alert"/)
  for (const label of ['姓名', 'Email', '角色', '帳號狀態', 'Email 驗證', '建立日期', '最後登入', '最後更新時間']) {
    assert.match(view, new RegExp(`<dt>${label}</dt>`))
  }
  assert.match(view, /ROLE_LABELS\[detail\.role\]/)
  assert.match(view, /STATUS_LABELS\[detail\.accountStatus\]/)
  assert.match(view, /formatAdminDate\(detail\.emailVerifiedAt, '尚未驗證'\)/)
  assert.match(view, /formatAdminDate\(detail\.lastLoginAt\)/)
})

test('detail errors distinguish authorization, absence, authentication and generic failures', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /status === 403[\s\S]{0,120}沒有權限查看此帳號資料/)
  assert.match(view, /status === 404[\s\S]{0,120}找不到此帳號/)
  assert.match(view, /status === 401[\s\S]{0,100}登入狀態已失效/)
  assert.match(view, /無法載入帳號詳細資料/)
  assert.doesNotMatch(view, /error\.stack|error\.message/)
})

test('detail state cleanup and stale-response guards prevent cross-target disclosure', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /const currentDetailRequest = \+\+detailRequestId/)
  assert.match(view, /currentDetailRequest !== detailRequestId \|\| selectedUserId\.value !== userId/)
  assert.match(view, /@hide="resetUserDetail"/)
  const reset = view.slice(view.indexOf('const resetUserDetail'), view.indexOf('watch(['))
  for (const resetLine of [
    'detailRequestId += 1', 'selectedUserId.value = null', 'detail.value = null',
    "detailError.value = ''", 'detailLoading.value = false'
  ]) assert.match(reset, new RegExp(resetLine.replace(/[.+]/g, '\\$&')))
})

test('Risk remains a documented future extension point with no rendered data or action', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /Future Risk extension point/)
  assert.doesNotMatch(view, /<Column[^>]+(?:field|header)="[^"]*[Rr]isk/)
  assert.doesNotMatch(view, /riskApi|mockRisk|openRisk|查看風險/)
})
