import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('MemberSessions route has the approved member-only frontend metadata', () => {
  const router = read('src/router/index.ts')
  const route = router.slice(router.indexOf("path: '/account/sessions'"), router.indexOf("path: '/design-system'"))

  assert.match(route, /name: 'MemberSessions'/)
  assert.match(route, /SessionManagementView\.vue/)
  assert.match(route, /requiresAuth: true/)
  assert.match(route, /roles: \['user'\]/)
  assert.match(route, /authPortal: 'frontend'/)
})

test('Unauthenticated frontend member navigation goes Home and opens the existing login modal', () => {
  const router = read('src/router/index.ts')
  const unauthenticated = router.slice(
    router.indexOf("if (portal === 'frontend' && !authStore.isAuthenticated)"),
    router.indexOf('const isPasswordChangeRoute')
  )

  assert.match(unauthenticated, /to\.meta\.authPortal === 'frontend'/)
  assert.match(unauthenticated, /authStore\.openAuthModal\('login', '請先重新登入。'\)/)
  assert.match(unauthenticated, /return \{ name: 'Home' \}/)
  assert.match(unauthenticated, /return \{ name: 'Login', query: \{ redirect: to\.fullPath \} \}/)
  assert.doesNotMatch(unauthenticated, /redirect.*account\/sessions|returnTo|pendingDestination/)
})

test('The existing App-level AuthModal remains the only AuthModal instance', () => {
  const app = read('src/App.vue')
  const home = read('src/views/HomeView.vue')
  const sessionView = read('src/views/account/SessionManagementView.vue')

  assert.equal((app.match(/<AuthModal\s*\/>/g) || []).length, 1)
  assert.doesNotMatch(home, /AuthModal/)
  assert.doesNotMatch(sessionView, /AuthModal/)
})

test('Auth prompt is transient and is cleared by close and subsequent opens without a message', () => {
  const store = read('src/stores/authStore.ts')

  assert.match(store, /const authPromptMessage = ref\(''\)/)
  assert.match(store, /const openAuthModal = \(mode: AuthMode = 'login', message = ''\)/)
  assert.match(store, /authPromptMessage\.value = message/)
  assert.match(store, /const closeAuthModal = \(\) => \{\s*isAuthModalOpen\.value = false\s*authPromptMessage\.value = ''/)
  assert.doesNotMatch(store, /localStorage|sessionStorage|document\.cookie/)
})

test('AuthModal presents the shared prompt and successful login uses existing close cleanup', () => {
  const modal = read('src/components/auth/AuthModal.vue')
  assert.match(modal, /v-if="authStore\.authPromptMessage"/)
  assert.match(modal, /\{\{ authStore\.authPromptMessage \}\}/)
  assert.match(modal, /authStore\.closeAuthModal\(\)/)
  assert.equal((read('src/App.vue').match(/<AuthModal\s*\/>/g) || []).length, 1)
})

test('Mounted MemberSessions invalidation alone returns Home and opens the frontend login modal', () => {
  const app = read('src/App.vue')
  const watcher = app.slice(app.indexOf('watch('), app.indexOf('onMounted('))

  assert.match(watcher, /wasAuthenticated &&\s*!isAuthenticated/)
  assert.match(watcher, /router\.currentRoute\.value\.name === 'MemberSessions'/)
  assert.match(watcher, /await router\.replace\(\{ name: 'Home' \}\)/)
  assert.match(watcher, /authStore\.openAuthModal\('login', '登入狀態已失效，請重新登入。'\)/)
  assert.doesNotMatch(watcher, /requiresAuth|matched|roles/)
})

test('FrontHeader exposes Session Management only to authenticated user-role members', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  const menuStart = header.indexOf('<div v-else-if="authStore.initialized" class="user-profile-menu">')
  const authenticatedMenu = header.slice(menuStart, header.indexOf('</div>', menuStart))

  assert.match(authenticatedMenu, /authStore\.user\?\.role === 'user'/)
  assert.match(authenticatedMenu, /to="\/account\/sessions"/)
  assert.match(authenticatedMenu, /登入中的裝置/)
  assert.match(authenticatedMenu, /authStore\.logout\(\)/)
  assert.doesNotMatch(header.slice(0, menuStart), /account\/sessions/)
})

test('FrontHeader reuses settled Auth Store capability state for backend entry', () => {
  const header = read('src/components/layout/FrontHeader.vue')
  assert.match(header, /void authStore\.initialize\(\)/)
  assert.match(header, /authStore\.initialized && !authStore\.isAuthenticated/)
  assert.match(header, /v-if="authStore\.isAdminPortalUser"/)
  assert.match(header, /to="\/admin"/)
  assert.doesNotMatch(header, /\['SALES'|\['SALES_SUPERVISOR'|capabilities\.includes/)
})

test('A3-4 adds no return-to, second auth architecture, or credential persistence', () => {
  const sources = [
    read('src/App.vue'),
    read('src/router/index.ts'),
    read('src/stores/authStore.ts'),
    read('src/components/auth/AuthModal.vue')
  ].join('\n')

  assert.doesNotMatch(sources, /returnTo|pendingDestination|redirect=.*account\/sessions/)
  assert.doesNotMatch(sources, /localStorage|sessionStorage/)
  assert.doesNotMatch(sources, /new AuthModal|secondAuth|eventBus/)
})
