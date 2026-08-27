import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('member and admin access state are independent inside the existing store', () => {
  const store = read('src/stores/authStore.ts')
  assert.match(store, /const accessToken = ref<string \| null>/)
  assert.match(store, /const adminAccessToken = ref<string \| null>/)
  assert.match(store, /const adminStatus = ref<AuthStatus>/)
  assert.match(store, /const clearAdminAuth =/)
  assert.match(store, /clearAuth[\s\S]*clearAdminAuth\(\)/)
  assert.match(store, /clearAuth: \(portal\) => portal === 'admin' \? clearAdminAuth\(\) : clearAuth\(\)/)
})

test('ordinary backend leave preserves the reusable Admin session while explicit revocation stays bounded', () => {
  const store = read('src/stores/authStore.ts')
  const header = read('src/components/layout/AdminHeader.vue')
  const flow = store.slice(store.indexOf('const exitAdminPortal = async'), store.indexOf('const logoutAll'))
  assert.match(flow, /await authApi\.logout\('admin'\)/)
  assert.match(flow, /finally \{\s*clearAdminAuth\(\)/)
  assert.doesNotMatch(flow, /clearAuth\(|logout\('frontend'\)/)
  const leave = header.slice(header.indexOf('const leaveBackend = async'), header.indexOf('const logoutAccount'))
  assert.match(leave, /await router\.replace\('\/'\)/)
  assert.doesNotMatch(leave, /exitAdminPortal|logout|clearAdminAuth/)
  assert.match(store, /exitAdminPortal,/)
})

test('portal-aware Auth API keeps refresh, logout, elevation, and activity separated', () => {
  const api = read('src/api/auth.ts')
  assert.match(api, /refresh: \(portal: Portal = 'frontend'\)/)
  assert.match(api, /'\/v1\/auth\/refresh', \{ portal \}/)
  assert.match(api, /adminElevation:[\s\S]*'\/v1\/auth\/admin-elevation'/)
  assert.match(api, /logout: \(portal: Portal = 'frontend'\)/)
  assert.match(api, /activity: \(portal: Portal = 'frontend'\)/)
})

test('admin routes require an admin portal session, not frontend capability alone', () => {
  const router = read('src/router/index.ts')
  const capabilities = read('src/config/capabilities.ts')
  assert.match(router, /authPortal: 'admin'/)
  assert.match(router, /!authStore\.isAuthenticated \|\| !authStore\.isAdminPortalUser/)
  assert.match(router, /authStore\.ensureAdminSession\(\)/)
  assert.match(router, /setRuntimeAuthPortal\(portal\)/)
  assert.match(router, /redirect: \{ name: 'AdminLanding' \}/)
  assert.match(router, /to\.name === 'AdminLanding'[^\n]+adminLandingPath\(authStore\.user\)/)
  assert.match(capabilities, /\['SALES', 'SALES_SUPERVISOR'\][\s\S]{0,80}'\/admin\/crm\/my-business'/)
  assert.match(capabilities, /user\?\.role === 'admin' \|\| user\?\.role === 'manager'[\s\S]{0,80}'\/admin\/dashboard'/)
})

test('public staff entry is navigation-only and still passes through admin elevation', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  const router = read('src/router/index.ts')
  assert.match(header, /v-if="authStore\.isAdminPortalUser"/)
  assert.match(header, /to="\/admin"/)
  assert.match(header, />進入後台</)
  assert.doesNotMatch(header, /adminAccessToken|adminStatus|adminLandingPath|adminElevation|crm\/my-business/)
  assert.match(router, /authStore\.ensureAdminSession\(\)/)
})

test('first elevation is passwordless, re-entry supports password, and failure preserves frontend auth', () => {
  const store = read('src/stores/authStore.ts')
  assert.match(store, /return \(await elevateAdmin\(\)\)\.success/)
  assert.match(store, /const elevateAdmin = async \(password\?: string\)/)
  assert.match(store, /authApi\.adminElevation\(password\)/)
  assert.match(store, /if \(\(credentials\.portal \|\| 'frontend'\) === 'admin'\) clearAdminAuth\(\)/)
})

// ============================================================
// Admin Handoff — Reuse Valid Admin Session
// WEB-1F-C2A regression protection
// ============================================================
test('Admin Handoff reuses a valid Admin Session before any login redirect', () => {
  const router = read('src/router/index.ts')
  const store = read('src/stores/authStore.ts')
  const sidebar = read('src/config/sidebarMenu.ts')
  const adminGuard = router.slice(
    router.indexOf("if (portal === 'admin')"),
    router.indexOf('setRuntimeAuthPortal(portal)'),
  )
  const ensureSession = store.slice(
    store.indexOf('const ensureAdminSession = async () => {'),
    store.indexOf('const initialize = () => {'),
  )

  assert.ok(adminGuard.indexOf('ensureAdminSession()') < adminGuard.indexOf("return { name: 'Login'"))
  assert.match(ensureSession, /if \(isAdminAuthenticated\.value\) return true/)
  assert.match(ensureSession, /await refreshAdminAccessToken\(\); return true/)
  assert.match(ensureSession, /catch \{ clearAdminAuth\(\) \}[\s\S]*return \(await elevateAdmin\(\)\)\.success/)
  assert.doesNotMatch(`${router}\n${store}`, /localStorage|sessionStorage|adminSessionKey/)

  assert.match(router, /path: 'human-consultations'[\s\S]{0,220}capabilities: \['ADMIN'\]/)
  assert.match(sidebar, /id: 'human-consultations'[^\n]*capabilities: \['ADMIN'\]/)
  assert.doesNotMatch(
    router.match(/path: 'human-consultations'[^\n]*/)?.[0] ?? '',
    /SALES|SALES_SUPERVISOR|PLATFORM_MANAGER/,
  )
})

test('Admin login surface has bounded desktop scale and responsive controls', () => {
  const login = read('src/views/LoginView.vue')
  assert.match(login, /class="admin-login-card w-full border space-y-8"/)
  assert.match(login, /\.admin-login-card \{ max-width: 34rem; \}/)
  assert.match(login, /\.admin-login-form input \{ min-height: 3rem; \}/)
  assert.match(login, /@media \(max-width: 640px\).*admin-login-card/s)
})

test('Axios refresh failure clears only the request portal and activity follows the active portal', () => {
  const axios = read('src/api/axios.ts')
  const store = read('src/stores/authStore.ts')
  assert.match(axios, /clearRuntimeAuth\(original\.authPortal \|\| getRuntimeAuthPortal\(\)\)/)
  assert.match(store, /authApi\.activity\(getRuntimeAuthPortal\(\)\)/)
})

test('Finance routes remain present behind the admin portal boundary', () => {
  const router = read('src/router/index.ts')
  assert.match(router, /path: 'finance'.*AdminFinanceCenter/)
  assert.match(router, /path: 'finance\/:businessCaseId'.*AdminFinanceDetail/)
})
