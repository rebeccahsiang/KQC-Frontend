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
  assert.match(source, /getRuntimeAccessToken\(\)/)
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
  assert.match(adminLogin, /redirect:\s*['"]\/admin\/dashboard['"]/)
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
