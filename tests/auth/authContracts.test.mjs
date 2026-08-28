import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

const filesUnder = (path) => {
  const base = fileURLToPath(new URL(path, root))
  const walk = (directory) => readdirSync(directory).flatMap((name) => {
    const target = join(directory, name)
    return statSync(target).isDirectory() ? walk(target) : [target]
  })
  return walk(base).filter((pathName) => /\.(ts|vue)$/.test(pathName))
}

test('Auth state is memory-only and legacy Auth storage keys are absent', () => {
  const violations = filesUnder('src/').flatMap((file) => {
    const source = readFileSync(file, 'utf8')
    if (file.endsWith('themeStore.ts')) return []
    return /localStorage|sessionStorage|kqc_admin_token|kqc_admin_user|mock-jwt-auth-token/.test(source)
      ? [relative(fileURLToPath(new URL('.', root)), file)]
      : []
  })
  assert.deepEqual(violations, [])
  assert.match(read('src/stores/authStore.ts'), /accessToken = ref<string \| null>\(null\)/)
})

test('Auth API uses the approved v1 endpoints and never models a refresh token response', () => {
  const source = read('src/api/auth.ts')
  for (const endpoint of ['login', 'refresh', 'me', 'logout', 'logout-all', 'activity', 'change-password']) {
    assert.match(source, new RegExp(`/v1/auth/${endpoint}`))
  }
  assert.doesNotMatch(source, /refreshToken\s*:/)
  assert.doesNotMatch(source, /document\.cookie/)
})

test('Axios gets Bearer credentials only from the runtime bridge and enables HttpOnly cookie transport', () => {
  const source = read('src/api/axios.ts')
  assert.match(source, /const portal = config\.authPortal \|\| getRuntimeAuthPortal\(\)/)
  assert.match(source, /config\.authPortal = portal/)
  assert.match(source, /const token = getRuntimeAccessToken\(portal\)/)
  assert.match(source, /withCredentials:\s*true/)
  assert.match(source, /Authorization = `Bearer \$\{token\}`/)
  assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie/)
})

test('Refresh is single-flight and retry recursion is explicitly blocked', () => {
  const store = read('src/stores/authStore.ts')
  const client = read('src/api/axios.ts')
  assert.match(store, /let refreshPromise: Promise<string> \| null = null/)
  assert.match(store, /if \(!refreshPromise\)/)
  assert.match(client, /!original\.skipAuthRefresh/)
  assert.match(client, /!original\._authRetry/)
  assert.match(client, /original\._authRetry = true/)
})

test('Session hydration performs refresh then me and always resolves initialized state', () => {
  const source = read('src/stores/authStore.ts')
  assert.match(source, /await refreshAccessToken\(\)/)
  assert.match(source, /await fetchIdentity\(\)/)
  assert.match(source, /initialized\.value = true/)
})

test('Router waits for initialization and uses only Auth Store identity and roles', () => {
  const source = read('src/router/index.ts')
  assert.match(source, /await authStore\.initialize\(\)/)
  assert.match(source, /authStore\.isAuthenticated/)
  assert.match(source, /authStore\.user\.role/)
  assert.doesNotMatch(source, /localStorage|sessionStorage|decode/)
})

test('Logout clears memory state and PASSWORD_CHANGE_REQUIRED has a centralized signal', () => {
  const store = read('src/stores/authStore.ts')
  const client = read('src/api/axios.ts')
  assert.match(store, /finally \{\s*clearAuth\(\)/)
  assert.match(store, /passwordChangeRequired = ref\(false\)/)
  assert.match(client, /code === 'PASSWORD_CHANGE_REQUIRED'/)
  assert.match(client, /signalPasswordChangeRequired\(\)/)
})

test('Logout sends the memory Access Token through the shared interceptor before deterministic local cleanup', () => {
  const store = read('src/stores/authStore.ts')
  const client = read('src/api/axios.ts')
  const logoutFlow = store.slice(store.indexOf('const logout = async'), store.indexOf('const logoutAll'))

  assert.match(logoutFlow, /if \(isAdminAuthenticated\.value\) await authApi\.logout\('admin'\)\.catch\(\(\) => undefined\)/)
  assert.match(logoutFlow, /await authApi\.logout\('frontend'\)/)
  assert.ok(logoutFlow.indexOf("await authApi.logout('admin')") < logoutFlow.indexOf("await authApi.logout('frontend')"))
  assert.match(logoutFlow, /finally \{\s*clearAuth\(\)/)
  assert.ok(logoutFlow.indexOf("await authApi.logout('frontend')") < logoutFlow.indexOf('clearAuth()'))
  assert.match(logoutFlow, /catch \{[\s\S]*server is unreachable[\s\S]*\}\s*finally \{\s*clearAuth\(\)/)
  assert.match(client, /withCredentials: true/)
  assert.match(client, /const portal = config\.authPortal \|\| getRuntimeAuthPortal\(\)/)
  assert.match(client, /config\.authPortal = portal/)
  assert.match(client, /const token = getRuntimeAccessToken\(portal\)/)
  assert.match(client, /config\.headers\.Authorization = `Bearer \$\{token\}`/)
  assert.doesNotMatch(client, /localStorage|sessionStorage/)
})

test('public header hydrates identity before exposing capability-aware staff entry', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  assert.match(header, /onMounted\([\s\S]{0,320}void authStore\.initialize\(\)/)
  assert.match(header, /v-if="authStore\.initialized && !authStore\.isAuthenticated"/)
  assert.match(header, /v-else-if="authStore\.initialized" class="user-profile-menu"/)
  assert.match(header, /v-if="authStore\.isAdminPortalUser"/)
  assert.match(header, /to="\/admin"/)
  assert.match(header, /aria-label="進入後台"/)
})

test('AdminHeader account menu separates backend exit from full account logout accessibly', () => {
  const header = read('src/components/layout/AdminHeader.vue')
  const menuStart = header.indexOf('<div v-if="accountMenuOpen"')
  const menuEnd = header.indexOf('</div>', menuStart)
  assert.ok(menuStart >= 0 && menuEnd > menuStart, 'account menu template slice must be non-empty')
  const accountMenu = header.slice(menuStart, menuEnd + '</div>'.length)
  assert.match(header, /aria-haspopup="menu"/)
  assert.match(header, /:aria-expanded="accountMenuOpen"/)
  assert.match(accountMenu, /role="menu"/)
  assert.equal((accountMenu.match(/<button\b[^>]*\brole="menuitem"[^>]*>/g) || []).length, 2)
  assert.match(accountMenu, />離開後台</)
  assert.match(accountMenu, />登出帳號</)
  assert.match(accountMenu, /@click="leaveBackend"/)
  assert.match(accountMenu, /@click="logoutAccount"/)
  // ============================================================
  // Regression Gate — Admin Portal Exit / Account Logout
  // REGRESSION-GATE-R1: navigation-only exit must stay distinct from full logout.
  // ============================================================
  const leaveStart = header.indexOf('const leaveBackend = async () => {')
  const logoutStart = header.indexOf('const logoutAccount = async () => {')
  const logoutEnd = header.indexOf('\nonMounted(', logoutStart)
  assert.ok(leaveStart >= 0 && logoutStart > leaveStart && logoutEnd > logoutStart, 'account action function slices must be bounded')
  const leaveBackend = header.slice(leaveStart, logoutStart)
  const logoutAccount = header.slice(logoutStart, logoutEnd)
  assert.match(leaveBackend, /closeAccountMenu\(\)/)
  assert.match(leaveBackend, /await router\.replace\('\/'\)/)
  assert.doesNotMatch(leaveBackend, /authStore\.(?:logout|exitAdminPortal)\(/)
  assert.match(logoutAccount, /closeAccountMenu\(\)/)
  assert.match(logoutAccount, /await authStore\.logout\(\)/)
  assert.match(logoutAccount, /await router\.replace\('\/'\)/)
  assert.match(header, /event\.key === 'Escape'/)
  assert.match(header, /document\.addEventListener\('pointerdown'/)
})

test('Frontend Auth and routing contain only the four approved roles', () => {
  const source = [
    read('src/api/auth.ts'),
    read('src/stores/authStore.ts'),
    read('src/router/index.ts'),
    read('src/config/sidebarMenu.ts')
  ].join('\n')
  assert.doesNotMatch(source, /\beditor\b|\bsuperadmin\b|\bcustomer\b/)
  for (const role of ['user', 'sales', 'manager', 'admin']) assert.match(source, new RegExp(`['"]${role}['"]`))
})

test('Admin governance routes use authoritative capability metadata', () => {
  const source = read('src/router/index.ts')
  for (const path of ['members', 'sales', 'managers']) {
    assert.match(source, new RegExp(`path:\\s*['"]${path}['"][^}]+capabilities:\\s*\\[['"]PLATFORM_MANAGER['"],\\s*['"]ADMIN['"]\\]`))
  }
  assert.match(source, /path:\s*['"]admins['"][^}]+capabilities:\s*\[['"]ADMIN['"]\]/)
  assert.match(source, /path:\s*['"]users['"][\s\S]{0,180}capabilities:\s*\[['"]PLATFORM_MANAGER['"],\s*['"]ADMIN['"]\]/)
  assert.match(source, /const allowedRoles = to\.meta\.roles/)
  assert.match(source, /const requiredCapabilities = to\.meta\.capabilities/)
})

test('backend landing is capability-aware without weakening child authorization', () => {
  const capabilities = read('src/config/capabilities.ts')
  const router = read('src/router/index.ts')
  const login = read('src/views/LoginView.vue')
  const password = read('src/views/ChangePasswordView.vue')
  assert.match(capabilities, /export const adminLandingPath/)
  assert.match(capabilities, /'\/admin\/crm\/my-business'/)
  assert.match(capabilities, /'\/admin\/dashboard'/)
  assert.match(router, /redirect: \{ name: 'AdminLanding' \}/)
  assert.match(router, /to\.name === 'AdminLanding'[^\n]+adminLandingPath\(authStore\.user\)/)
  assert.match(login, /adminLandingPath\(authStore\.user\)/)
  assert.match(password, /adminLandingPath\(authStore\.user\)/)
  assert.match(router, /path: 'crm\/my-business'[\s\S]{0,180}capabilities: \['SALES', 'SALES_SUPERVISOR'\]/)
  assert.match(router, /path: 'invitations'[\s\S]{0,180}capabilities: \['ADMIN'\]/)
})

test('Restored admin shell uses Lucide navigation and the canonical data-theme contract', () => {
  const menu = read('src/config/sidebarMenu.ts')
  const sidebar = read('src/components/layout/sidebar/SidebarNav.vue')
  const header = read('src/components/layout/AdminHeader.vue')
  const theme = read('src/stores/themeStore.ts')

  for (const route of [
    '/admin/users/members', '/admin/users/sales',
    '/admin/users/managers', '/admin/users/admins'
  ]) assert.match(menu, new RegExp(route.replaceAll('/', '\\/')))
  for (const label of ['帳號管理', '一般帳號管理', '會員', '業務', '平台管理者', '最高管理', '最高管理者']) {
    assert.match(menu, new RegExp(label))
  }
  assert.doesNotMatch(`${menu}\n${sidebar}\n${header}`, /document\.documentElement\.classList|dark-mode/)
  assert.match(theme, /document\.documentElement\.dataset\.theme = theme/)
  assert.match(theme, /localStorage\.setItem\(STORAGE_KEY, theme\)/)
  assert.match(header, /lucide:sun/)
  assert.match(header, /lucide:moon/)
  assert.match(header, /lucide:bell/)
  assert.match(sidebar, /lucide:panel-left-open/)
  assert.match(sidebar, /lucide:panel-left-close/)
  assert.doesNotMatch(`${menu}\n${sidebar}\n${header}`, /[😀-🙏🌀-🫿]/u)
})

test('Sidebar reserved items are visibly disabled, accessible, and never navigate', () => {
  const menu = read('src/config/sidebarMenu.ts')
  const item = read('src/components/layout/sidebar/SidebarMenuItem.vue')
  assert.match(menu, /disabled\?: boolean/)
  assert.match(item, /if \(props\.item\.disabled\) return/)
  assert.ok(item.indexOf('if (props.item.disabled) return') < item.indexOf('router.push(props.item.path)'))
  assert.match(item, /:disabled="item\.disabled"/)
  assert.match(item, /:aria-disabled="item\.disabled \? 'true' : undefined"/)
  assert.match(item, /class="reserved-badge">尚未開放/)
  assert.match(item, /&\.reserved, &\.reserved:hover[\s\S]{0,160}cursor: not-allowed/)
  assert.match(item, /else if \(props\.item\.path\) void router\.push\(props\.item\.path\)/)
  assert.match(menu, /id: 'crm-management'.*title: 'CRM 業務管理'/)
  const myBusiness = menu.slice(menu.indexOf("id: 'crm-my-business'"), menu.indexOf("id: 'crm-business-management'"))
  const businessManagement = menu.slice(menu.indexOf("id: 'crm-business-management'"), menu.indexOf("id: 'crm-business-reports'"))
  const businessWarRoom = menu.slice(menu.indexOf("id: 'crm-business-reports'"), menu.indexOf(']', menu.indexOf("id: 'crm-business-reports'")))
  assert.match(myBusiness, /title: '我的業務'/)
  assert.match(myBusiness, /path: '\/admin\/crm\/my-business'/)
  assert.doesNotMatch(myBusiness, /disabled: true/)
  assert.match(businessManagement, /title: '業務管理'/)
  assert.match(businessManagement, /disabled: true/)
  assert.doesNotMatch(businessManagement, /path:/)
  assert.match(businessWarRoom, /title: '業務戰情室'/)
  assert.match(businessWarRoom, /disabled: true/)
  assert.doesNotMatch(businessWarRoom, /path:/)
  assert.doesNotMatch(menu, /績效戰情室|業務主管/)
})

test('Change Password route requires authentication and forced accounts cannot enter protected routes', () => {
  const source = read('src/router/index.ts')
  assert.match(source, /path:\s*['"]\/change-password['"]/)
  assert.match(source, /name:\s*['"]ChangePassword['"]/)
  assert.match(source, /meta:\s*\{\s*requiresAuth:\s*true/)
  assert.match(source, /passwordChangeRequired\s*&&\s*!isPasswordChangeRoute/)
  assert.match(source, /name:\s*['"]ChangePassword['"],\s*query:\s*\{\s*redirect:\s*to\.fullPath/)
  assert.doesNotMatch(source, /passwordChangeRequired[\s\S]{0,100}name:\s*['"]Login['"]/)
})

test('Admin and frontend login flows route forced accounts to Change Password', () => {
  const adminLogin = read('src/views/LoginView.vue')
  const frontendLogin = read('src/components/auth/AuthModal.vue')
  for (const source of [adminLogin, frontendLogin]) {
    assert.match(source, /result\.passwordChangeRequired/)
    assert.match(source, /name:\s*['"]ChangePassword['"]/)
  }
  assert.match(adminLogin, /redirect:\s*adminLandingPath\(authStore\.user\)/)
  assert.match(frontendLogin, /redirect:\s*['"]\/['"]/)
})

test('Password change replaces the old runtime token before clearing the gate and fetching identity', () => {
  const source = read('src/stores/authStore.ts')
  const actionStart = source.indexOf('const changePassword = async')
  const actionEnd = source.indexOf('const recordActivity', actionStart)
  const action = source.slice(actionStart, actionEnd)
  const request = action.indexOf('authApi.changePassword')
  const replaceToken = action.indexOf('accessToken.value = response.data.accessToken')
  const clearGate = action.indexOf('passwordChangeRequired.value = false')
  const identity = action.indexOf('await fetchIdentity()')
  assert.ok(request >= 0 && request < replaceToken)
  assert.ok(replaceToken < clearGate)
  assert.ok(clearGate < identity)
  assert.doesNotMatch(action, /localStorage|sessionStorage|document\.cookie|refreshToken/)
})

test('Reload hydration preserves the forced-password lifecycle without requiring me', () => {
  const source = read('src/stores/authStore.ts')
  assert.match(source, /await refreshAccessToken\(\)/)
  assert.match(source, /if \(!passwordChangeRequired\.value\) await fetchIdentity\(\)/)
  assert.match(source, /passwordChangeRequired\.value = response\.data\.passwordChangeRequired/)
  assert.match(source, /authStatus\.value = ['"]authenticated['"]/)
})

test('Change Password form validates and clears sensitive fields without browser persistence', () => {
  const source = read('src/views/ChangePasswordView.vue')
  for (const field of ['currentPassword', 'newPassword', 'confirmPassword']) {
    assert.match(source, new RegExp(`${field}:?`))
  }
  assert.match(source, /form\.newPassword\.length < 8/)
  assert.match(source, /form\.currentPassword === form\.newPassword/)
  assert.match(source, /form\.newPassword !== form\.confirmPassword/)
  assert.match(source, /authStore\.changePassword\(form\.currentPassword, form\.newPassword\)/)
  assert.match(source, /clearPasswords\(\)/)
  assert.match(source, /requested !== ['"]\/change-password['"]/)
  assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie|refreshToken|console\.log|console\.error/)
})

test('Email verification and invitation acceptance are public lifecycle routes', () => {
  const source = read('src/router/index.ts')
  const verifyStart = source.indexOf("path: '/verify-email'")
  const invitationStart = source.indexOf("path: '/accept-invitation'")
  const changePasswordStart = source.indexOf("path: '/change-password'")
  assert.ok(verifyStart >= 0 && invitationStart > verifyStart && changePasswordStart > invitationStart)
  for (const routeStart of [verifyStart, invitationStart]) {
    const routeRecord = source.slice(routeStart, source.indexOf('},', routeStart) + 2)
    assert.doesNotMatch(routeRecord, /requiresAuth|roles/)
  }
  assert.match(source, /const requiresAuth = to\.matched\.some/)
  assert.match(source, /if \(!requiresAuth\) return true/)
})

test('Lifecycle tokens are consumed from navigation memory and removed from the URL before API submission', () => {
  const cases = [
    ['src/views/VerifyEmailView.vue', 'authApi.verifyEmail(token)'],
    ['src/views/AcceptInvitationView.vue', 'authApi.acceptInvitation(invitationToken.value, form.password)']
  ]
  for (const [path, requestExpression] of cases) {
    const source = read(path)
    const readToken = source.indexOf('route.query.token')
    const clearQuery = source.indexOf('await router.replace')
    const submit = source.indexOf(requestExpression)
    assert.ok(readToken >= 0 && readToken < clearQuery && clearQuery < submit)
    assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie|decode|console\.log|console\.error/)
  }
})

test('Verification and invitation success do not invent a session or frontend identity', () => {
  const verification = read('src/views/VerifyEmailView.vue')
  const invitation = read('src/views/AcceptInvitationView.vue')
  assert.match(verification, /await authApi\.verifyEmail\(token\)/)
  assert.match(verification, /authStore\.openAuthModal\(['"]login['"]\)/)
  assert.match(invitation, /await authApi\.acceptInvitation\(invitationToken\.value, form\.password\)/)
  assert.match(invitation, /name:\s*['"]Login['"]/)
  for (const source of [verification, invitation]) {
    assert.doesNotMatch(source, /accessToken\.value|fetchIdentity\(|authStatus\.value|passwordChangeRequired\.value|decode|jwt|JWT/)
  }
  assert.match(read('src/stores/authStore.ts'), /const fetchIdentity = async[\s\S]*authApi\.me\(\)/)
})

test('Resend verification is generic, single-flight at the form level, and creates no auth state', () => {
  const source = read('src/views/VerifyEmailView.vue')
  const request = source.indexOf('await authApi.resendVerification(email)')
  const pendingStart = source.lastIndexOf('resendPending.value = true', request)
  const pendingEnd = source.indexOf('resendPending.value = false', request)
  assert.ok(pendingStart >= 0 && pendingStart < request && request < pendingEnd)
  assert.match(source, /若此 Email 可進行驗證/)
  assert.match(source, /:disabled="resendPending"/)
  assert.doesNotMatch(source, /user\.value|accessToken\.value|authStatus\.value/)
})

test('Invitation validation follows the backend password contract and preserves Step 2A routing security', () => {
  const invitation = read('src/views/AcceptInvitationView.vue')
  const router = read('src/router/index.ts')
  assert.match(invitation, /form\.password\.length < 8/)
  assert.match(invitation, /form\.password !== form\.confirmPassword/)
  assert.match(invitation, /clearPasswords\(\)/)
  assert.doesNotMatch(invitation, /form\.(name|email|role|currentPassword)/)
  assert.match(router, /passwordChangeRequired\s*&&\s*!isPasswordChangeRoute/)
  assert.match(read('src/views/ChangePasswordView.vue'), /!requested\.startsWith\(['"]\/\/['"]\)/)
})

test('Activity uses the existing Auth API client with portal-selected access-token identity only', () => {
  const api = read('src/api/auth.ts')
  const store = read('src/stores/authStore.ts')
  assert.match(api, /activity:\s*\(portal: Portal = 'frontend'\)\s*=>\s*api\.post<Envelope<\{ activityRecorded: boolean \}>>\(['"]\/v1\/auth\/activity['"], undefined, \{ authPortal: portal \}\)/)
  assert.doesNotMatch(api, /activity:[\s\S]{0,220}(userId|sessionId|role|email)/)
  assert.match(store, /const recordActivity = \(\) => authApi\.activity\(getRuntimeAuthPortal\(\)\)/)
})

test('Activity tracker accepts only explicit human interaction events and has no heartbeat', () => {
  const source = read('src/auth/activityTracker.ts')
  const eventMatch = source.match(/HUMAN_ACTIVITY_EVENTS = \[([^\]]+)\]/)
  assert.ok(eventMatch)
  const events = [...eventMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1])
  assert.deepEqual(events, ['pointerdown', 'keydown', 'touchstart'])
  assert.doesNotMatch(source, /mousemove|scroll|focus|blur|visibilitychange|setInterval|setTimeout|heartbeat|keepAlive|polling/i)
  assert.equal((source.match(/auth\.recordActivity\(\)/g) || []).length, 1)
})

test('Activity network sends are gated by auth readiness and a minimum sixty-second interval', () => {
  const source = read('src/auth/activityTracker.ts')
  const intervalMatch = source.match(/AUTH_ACTIVITY_SEND_INTERVAL_MS = ([\d_]+)/)
  assert.ok(intervalMatch)
  assert.ok(Number(intervalMatch[1].replaceAll('_', '')) >= 60_000)

  const handlerStart = source.indexOf('const handleHumanActivity')
  const request = source.indexOf('auth.recordActivity()', handlerStart)
  for (const guard of ['!auth.initialized', '!auth.isAuthenticated', 'auth.passwordChangeRequired']) {
    const guardIndex = source.indexOf(guard, handlerStart)
    assert.ok(guardIndex >= handlerStart && guardIndex < request)
  }
  assert.ok(source.indexOf('document.visibilityState', handlerStart) < request)
  assert.ok(source.indexOf('requestInFlight', handlerStart) < request)
  assert.ok(source.indexOf('currentTime - lastAttemptAt < AUTH_ACTIVITY_SEND_INTERVAL_MS', handlerStart) < request)
})

test('Activity listeners initialize once at the App root and always support cleanup', () => {
  const tracker = read('src/auth/activityTracker.ts')
  const app = read('src/App.vue')
  assert.match(tracker, /activeCleanup\?\.\(\)/)
  assert.match(tracker, /eventTarget\.addEventListener\(eventName, handleHumanActivity, LISTENER_OPTIONS\)/)
  assert.match(tracker, /eventTarget\.removeEventListener\(eventName, handleHumanActivity, LISTENER_OPTIONS\)/)
  assert.match(app, /onMounted\(\(\) => \{\s*stopAuthActivityTracker = startAuthActivityTracker\(authStore\)/)
  assert.match(app, /onUnmounted\(\(\) => \{\s*stopAuthActivityTracker\?\.\(\)/)
  assert.equal((app.match(/startAuthActivityTracker\(/g) || []).length, 1)
})

test('Activity is never emitted by login, hydration, lifecycle pages, or logout code paths', () => {
  const store = read('src/stores/authStore.ts')
  for (const [startMarker, endMarker] of [
    ['const initialize =', 'const login ='],
    ['const login =', 'const register ='],
    ['const logout =', 'const logoutAll ='],
    ['const logoutAll =', 'const changePassword =']
  ]) {
    const section = store.slice(store.indexOf(startMarker), store.indexOf(endMarker))
    assert.doesNotMatch(section, /recordActivity|authApi\.activity/)
  }
  for (const page of ['src/views/VerifyEmailView.vue', 'src/views/AcceptInvitationView.vue', 'src/views/ChangePasswordView.vue']) {
    assert.doesNotMatch(read(page), /activityTracker|recordActivity|authApi\.activity/)
  }
  assert.match(store, /finally \{\s*clearAuth\(\)/)
})

test('Session API types expose only the approved frontend DTO and result fields', () => {
  const source = read('src/api/auth.ts')
  const sessionType = source.slice(
    source.indexOf('export interface AuthSession'),
    source.indexOf('export interface SessionListResult')
  )
  const listType = source.slice(
    source.indexOf('export interface SessionListResult'),
    source.indexOf('export interface RevokeSessionResult')
  )
  const revokeType = source.slice(
    source.indexOf('export interface RevokeSessionResult'),
    source.indexOf('interface Envelope')
  )

  assert.deepEqual(
    [...sessionType.matchAll(/^\s{2}(\w+):/gm)].map((match) => match[1]),
    ['id', 'deviceName', 'isCurrent', 'lastActiveAt', 'createdAt']
  )
  assert.match(sessionType, /deviceName: string \| null/)
  assert.match(listType, /sessions: AuthSession\[\]/)
  assert.deepEqual(
    [...revokeType.matchAll(/^\s{2}(\w+):/gm)].map((match) => match[1]),
    ['revoked', 'isCurrent']
  )
  assert.doesNotMatch(sessionType, /userId|ip|location|userAgent|token|expires|revoke|audit/i)
})

test('Session APIs use the existing Axios client without identity authority, body, cookie, or JWT logic', () => {
  const source = read('src/api/auth.ts')
  const methods = source.slice(
    source.indexOf('sessions: ()'),
    source.indexOf('logout: ()')
  )

  assert.match(methods, /sessions: \(\) => api\.get<Envelope<SessionListResult>>\(['"]\/v1\/auth\/sessions['"]\)/)
  assert.match(methods, /revokeSession: \(sessionId: string\) =>\s*api\.delete<Envelope<RevokeSessionResult>>\(`\/v1\/auth\/sessions\/\$\{encodeURIComponent\(sessionId\)\}`\)/)
  assert.doesNotMatch(methods, /userId|owner|isCurrent|revokeReason|body|params|cookie|localStorage|sessionStorage|decode|jwt/i)
  assert.equal((source.match(/axios\.create\(/g) || []).length, 0)
  assert.match(source, /^import api from ['"]\.\/axios['"]/m)
})
