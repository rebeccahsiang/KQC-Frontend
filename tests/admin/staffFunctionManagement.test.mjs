import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('permission is ADMIN-only and loads complete authoritative state independent of list filter', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /v-if="authStore\.isAdmin"[^>]+openCapabilityEditor/)
  assert.match(view, /adminUsersApi\.get\(userId\)/)
  assert.match(view, /adminUsersApi\.assignments\(userId\)/)
  assert.match(view, /adminOrganizationsApi\.list\(\)/)
  assert.match(view, /完整權限狀態不受目前帳號分類限制/)
  assert.match(view, /你沒有權限執行此操作/)
})

test('pure MEMBER is guided to existing invitation and never directly gains first staff identity', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /some\(\(item\) => item !== 'MEMBER'\)/)
  assert.match(view, /v-if="!isEstablishedStaff"/)
  assert.match(view, /capability === 'ADMIN' && \(isEstablishedStaff \|\| capabilityTarget\.capabilities\.includes\('ADMIN'\)\)/)
  assert.match(view, /請先透過「員工邀請」完成第一次後台身份驗證/)
  assert.match(view, /router\.push\('\/admin\/invitations'\)/)
  assert.doesNotMatch(view, /停用.*會員|暫停.*會員|suspend MEMBER/i)
})

test('staff function API exposes only the three supported functions and minimal ADD payload', () => {
  const api = read('src/api/adminUsers.ts')
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(api, /StaffFunctionCapability = Extract<Capability, 'SALES' \| 'SALES_SUPERVISOR' \| 'PLATFORM_MANAGER'>/)
  assert.match(api, /\/staff-functions`, input/)
  assert.match(api, /\/staff-functions\/\$\{encodeURIComponent\(capability\)\}/)
  const call = view.slice(view.indexOf('await adminUsersApi.addStaffFunction'), view.indexOf('addFunctionVisible.value = false'))
  assert.match(call, /capability: selectedStaffFunction\.value/)
  assert.match(call, /organizationUnitId: selectedFunctionOrganizationId\.value/)
  assert.doesNotMatch(call, /domain|assignmentRole|isPrimary/)
})

test('row-level ADD preselects the missing function and filters active Organizations by required domain', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /label="新增"[^>]+openAddFunction\(capability as StaffFunctionCapability\)/)
  assert.match(view, /const openAddFunction = \(capability: StaffFunctionCapability\)[\s\S]{0,100}selectedStaffFunction\.value = capability/)
  assert.match(view, /:header="selectedStaffFunction \? `新增\$\{CAPABILITY_LABELS\[selectedStaffFunction\]\}`/)
  assert.match(view, /selectedStaffFunction\.value === 'PLATFORM_MANAGER' \? 'platform' : 'sales'/)
  assert.match(view, /item\.status === 'active' && item\.domain === domain/)
  assert.match(view, /目前尚無可指派的.*組織/)
  assert.match(view, /router\.push\('\/admin\/organizations'\)/)
})

test('staff function ADD and REMOVE use confirmations/errors and authoritative reload', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /window\.confirm\(`確定卸任/)
  assert.match(view, /await adminUsersApi\.removeStaffFunction/)
  assert.match(view, /仍有需要此職能的組織職務/)
  assert.match(view, /待重新分配工作/)
  assert.match(view, /await reloadGovernance\(`已新增/)
  assert.match(view, /await reloadGovernance\(`已卸任/)
  assert.doesNotMatch(view, /splice\(|capabilityTarget\.value\.capabilities\s*=/)
})

test('ADMIN remains a special privileged capability workflow with last-admin guidance', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  const handler = view.slice(view.indexOf('const toggleAdminCapability'), view.indexOf('const openAddAssignment'))
  assert.match(handler, /adminUsersApi\.changeCapabilities/)
  assert.doesNotMatch(handler, /addStaffFunction|removeStaffFunction/)
  assert.match(view, /系統至少必須保留一位可使用的最高管理者/)
  assert.match(view, /capability === 'ADMIN'/)
})

test('MEMBER is basic identity and is absent from staff function mutation options', () => {
  const api = read('src/api/adminUsers.ts')
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /identityCapabilities: Capability\[\] = \['MEMBER'/)
  assert.match(api, /Extract<Capability, 'SALES' \| 'SALES_SUPERVISOR' \| 'PLATFORM_MANAGER'>/)
  assert.match(view, /capability === 'MEMBER'.*基本帳號身份/)
  assert.match(view, /capability !== 'MEMBER'.*卸任/)
})

test('ADD failure is visible inside the active child dialog and cannot be silent', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /const addFunctionError = ref\(''\)/)
  assert.match(view, /catch \(error\) \{ addFunctionError\.value = addFunctionErrorMessage\(error\) \}/)
  assert.match(view, /<Message v-if="addFunctionError"[^>]*>\{\{ addFunctionError \}\}<\/Message>/)
  assert.match(view, /status === 409 && existingAssignment/)
  assert.match(view, /已在「\$\{selectedOrganization\?\.name/)
  assert.match(view, /無法以新增方式再次建立/)
  assert.match(view, /status === 422[\s\S]{0,100}所選職能與組織不相容/)
  assert.match(view, /新增職能失敗，請稍後再試/)
})

test('row-level ADD remains a setup flow and never mutates on the first click', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  const opener = view.slice(view.indexOf('const openAddFunction'), view.indexOf('const addFunctionErrorMessage'))
  assert.match(opener, /addFunctionVisible\.value = true/)
  assert.doesNotMatch(opener, /adminUsersApi|\.post\(|addStaffFunction\(/)
  assert.match(view, /相容組織/)
  assert.match(view, /label="確認新增"/)
  assert.doesNotMatch(view, /type="checkbox"/)
})

test('person-centric dialog shows all assignments and Backend-authoritative Primary labels', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /此帳號跨所有 Domain 的完整組織指派/)
  assert.match(view, /v-for="assignment in governanceAssignments"/)
  assert.match(view, /assignment\.isPrimary \? 'Primary' : 'Secondary'/)
  assert.match(view, /目前尚無組織職務/)
  assert.doesNotMatch(view, /v-model="[^"]*isPrimary/)
})

test('person-centric assignment add derives valid combinations and does not re-add capability', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /organization\.domain === 'platform'/)
  assert.match(view, /capabilities\.includes\('PLATFORM_MANAGER'\) \? \['supervisor'\]/)
  assert.match(view, /capabilities\.includes\('SALES'\).*'member'/s)
  assert.match(view, /capabilities\.includes\('SALES_SUPERVISOR'\).*'supervisor'/s)
  const handler = view.slice(view.indexOf('const addAssignment ='), view.indexOf('const openMoveAssignment'))
  assert.match(handler, /adminOrganizationsApi\.assign/)
  assert.doesNotMatch(handler, /addStaffFunction/)
  assert.doesNotMatch(handler, /isPrimary/)
})

test('assignment move is same-domain and removal requires explicit confirmation', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /item\.domain === movingAssignment\.value\?\.domain/)
  assert.match(view, /item\.status === 'active'/)
  assert.match(view, /adminOrganizationsApi\.move/)
  assert.match(view, /window\.confirm\(`確定移除/)
  assert.match(view, /adminOrganizationsApi\.remove/)
  assert.match(view, /同 Domain 的次要職務/)
  assert.doesNotMatch(view, /auto.?promote|promotePrimary/i)
})

test('every governance mutation reloads target, assignments, Organizations and account list', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /const reloadGovernance[\s\S]{0,260}Promise\.all\(\[loadGovernance\(userId\), loadUsers\(\)\]\)/)
  for (const message of ['已新增', '已卸任', '已授予', '已移除最高管理者', '組織職務已移動', '組織職務已移除']) assert.match(view, new RegExp(message))
})

test('Staff Invitation is nested under Organization governance without a Staff Function page', () => {
  const menu = read('src/config/sidebarMenu.ts')
  const router = read('src/router/index.ts')
  assert.match(menu, /id: 'organization-governance'[\s\S]{0,420}id: 'invitations'[\s\S]{0,220}id: 'organizations'/)
  assert.match(menu, /path: '\/admin\/invitations'/)
  assert.match(menu, /path: '\/admin\/organizations'/)
  assert.doesNotMatch(`${menu}\n${router}`, /staff-functions|職務管理/)
})

test('assignment role actions expose only eligible sales transitions to ADMIN', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  const eligibility = view.slice(view.indexOf('const roleChangeTargetFor'), view.indexOf('// Route meta maps'))
  assert.match(eligibility, /assignment\.domain !== 'sales'\) return null/)
  assert.match(eligibility, /assignment\.assignmentRole === 'supervisor'\) return 'member'/)
  assert.match(eligibility, /capabilities\.includes\('SALES_SUPERVISOR'\) \? 'supervisor' : null/)
  assert.match(view, /v-if="authStore\.isAdmin && roleChangeTargetFor\(assignment\)"/)
  assert.match(view, /assignment\.assignmentRole === 'supervisor' \? '降為成員' : '升為主管'/)
  assert.doesNotMatch(eligibility, /platform.*member|PLATFORM_MANAGER/s)
})

test('assignment role PATCH sends only authoritative role input and never mutates capabilities or Primary', () => {
  const api = read('src/api/adminOrganizations.ts')
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(api, /changeAssignmentRole: \(organizationId: string, assignmentId: string, assignmentRole: AssignmentRole\)/)
  assert.match(api, /assignments\/\$\{encodeURIComponent\(assignmentId\)\}\/role`[\s\S]{0,80}\{ assignmentRole \}/)
  const handler = view.slice(view.indexOf('const changeAssignmentRole ='), view.indexOf('watch(['))
  assert.match(handler, /adminOrganizationsApi\.changeAssignmentRole/)
  assert.match(handler, /assignment\.organizationUnitId[\s\S]{0,80}assignment\.id[\s\S]{0,80}targetRole/)
  assert.doesNotMatch(handler, /addStaffFunction|removeStaffFunction|changeCapabilities|assignmentRole\s*=|isPrimary\s*=|capabilities\s*=/)
  assert.match(handler, /await reloadGovernance/)
})

test('assignment role change requires confirmation and surfaces every safe failure class', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  assert.match(view, /roleChangeVisible\.value = true/)
  assert.match(view, /確定將「\{\{ roleChangeAssignment\.organization\?\.name/)
  assert.match(view, /確認升職.*確認降職/)
  assert.match(view, /label="取消"[^>]+roleChangeVisible = false/)
  assert.match(view, /不會自動增刪業務主管職能/)
  for (const message of [
    '你沒有權限執行此操作。',
    '找不到此組織職務，請重新載入後再試。',
    '目前狀態已變更，請重新載入後再試。',
    '目前帳號職能不符合此組織職務調整條件。',
    '調整組織職務失敗，請稍後再試。'
  ]) assert.match(view, new RegExp(message))
  assert.match(view, /<Message v-if="roleChangeError"/)
})

test('role-change success preserves person-centric actions and reloads all assignments', () => {
  const view = read('src/views/admin/users/AdminUsersView.vue')
  for (const action of ['新增組織職務', '移動', '移除']) assert.match(view, new RegExp(action))
  assert.match(view, /v-for="assignment in governanceAssignments"/)
  assert.match(view, /assignment\.isPrimary \? 'Primary' : 'Secondary'/)
  assert.match(view, /roleChangeVisible\.value = false[\s\S]{0,260}await reloadGovernance/)
  assert.match(view, /已將「\$\{organizationName\}」調整為/)
})
