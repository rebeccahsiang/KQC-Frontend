import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('Auth DTO and store keep member and canonical staff names separate', () => {
  const api = read('src/api/auth.ts')
  const store = read('src/stores/authStore.ts')
  assert.match(api, /name: string[\s\S]{0,240}staffIdentity: \{ displayName: string \} \| null/)
  assert.match(store, /user\.value\?\.staffIdentity\?\.displayName \|\| '後台使用者'/)
  assert.match(store, /memberName = computed\(\(\) => user\.value\?\.name \|\| '未登入使用者'\)/)
  assert.doesNotMatch(store, /adminName = computed\(\(\) => user\.value\?\.name/)
  assert.match(store, /user\.value = response\.data\.user/)
})

test('Admin Header renders canonical staff presentation and no raw role', () => {
  const header = read('src/components/layout/AdminHeader.vue')
  assert.match(header, /<strong>\{\{ authStore\.adminName \}\}<\/strong>/)
  assert.match(header, /<small>\{\{ authStore\.adminRoleLabel \}\}<\/small>/)
  assert.doesNotMatch(header, /authStore\.user\?\.role|roleLabel/)
})

test('highest capability presentation is ordered and localized without mutating capabilities', () => {
  const source = read('src/config/capabilities.ts')
  const precedence = source.slice(
    source.indexOf('ADMIN_CAPABILITY_PRESENTATION_PRECEDENCE'),
    source.indexOf('const LEGACY_ROLE_CAPABILITIES')
  )
  const entries = precedence.match(/CAPABILITIES\.(?:ADMIN|PLATFORM_MANAGER|SALES_SUPERVISOR|SALES)\b/g) || []
  assert.deepEqual(entries, [
    'CAPABILITIES.ADMIN',
    'CAPABILITIES.PLATFORM_MANAGER',
    'CAPABILITIES.SALES_SUPERVISOR',
    'CAPABILITIES.SALES'
  ])
  for (const label of ['最高管理者', '平台管理者', '業務主管', '業務']) assert.match(source, new RegExp(label))
  assert.match(source, /find\(\(capability\) => hasCapability\(user, capability\)\)/)
  assert.doesNotMatch(source, /capabilities\s*=\s*\[\.\.\.ADMIN_CAPABILITY_PRESENTATION_PRECEDENCE/)
})

test('presentation change does not touch public identity, CRM, bell, or notifications', () => {
  const store = read('src/stores/authStore.ts')
  const header = read('src/components/layout/AdminHeader.vue')
  const publicHeader = read('src/components/layout/FrontHeader.vue')
  assert.match(store, /const user = ref<AuthUser \| null>\(null\)/)
  assert.match(publicHeader, /authStore\.memberName/)
  assert.doesNotMatch(publicHeader, /authStore\.adminName/)
  assert.doesNotMatch(header, /crmApi|notificationApi|poll|setInterval/)
  assert.match(header, /lucide:bell/)
})
