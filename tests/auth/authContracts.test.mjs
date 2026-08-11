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
