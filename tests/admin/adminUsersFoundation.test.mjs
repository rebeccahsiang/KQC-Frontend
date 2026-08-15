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
  assert.doesNotMatch(source, /patch\(|post\(|delete\(|invitation|risk|notification|localStorage|sessionStorage|document\.cookie|decode/i)
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
