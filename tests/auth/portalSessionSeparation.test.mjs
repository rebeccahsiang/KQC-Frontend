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
  assert.match(router, /authPortal: 'admin'/)
  assert.match(router, /!authStore\.isAuthenticated \|\| !authStore\.isAdminPortalUser/)
  assert.match(router, /authStore\.ensureAdminSession\(\)/)
  assert.match(router, /setRuntimeAuthPortal\(portal\)/)
})

test('first elevation is passwordless, re-entry supports password, and failure preserves frontend auth', () => {
  const store = read('src/stores/authStore.ts')
  assert.match(store, /return \(await elevateAdmin\(\)\)\.success/)
  assert.match(store, /const elevateAdmin = async \(password\?: string\)/)
  assert.match(store, /authApi\.adminElevation\(password\)/)
  assert.match(store, /if \(\(credentials\.portal \|\| 'frontend'\) === 'admin'\) clearAdminAuth\(\)/)
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
