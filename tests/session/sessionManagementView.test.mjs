import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const source = readFileSync(new URL('src/views/account/SessionManagementView.vue', root), 'utf8')

test('Session Management loads the approved read-only session list', () => {
  assert.match(source, /onMounted\(loadSessions\)/)
  assert.match(source, /await authApi\.sessions\(\)/)
  assert.match(source, /response\.data\.sessions/)
  assert.match(source, /v-for="session in sessions"/)
})

test('Session Management exposes loading, loaded, empty, error, and reload states', () => {
  assert.match(source, /v-if="loading"/)
  assert.match(source, /v-else-if="loadError"/)
  assert.match(source, /v-else-if="sessions\.length === 0"/)
  assert.match(source, /<section v-else/)
  assert.match(source, /@click="loadSessions"/)
})

test('Session items present only approved DTO fields with safe fallbacks', () => {
  for (const field of ['deviceName', 'isCurrent', 'lastActiveAt', 'createdAt']) {
    assert.match(source, new RegExp(`session\\.${field}`))
  }
  assert.match(source, /未知的裝置/)
  assert.match(source, /目前的裝置/)
  assert.match(source, /Intl\.DateTimeFormat\('zh-TW'/)
  assert.match(source, /Number\.isNaN\(date\.getTime\(\)\)/)
  assert.match(source, /無法顯示/)
  assert.doesNotMatch(source, /userId|location|userAgent|User-Agent|token|expiresAt|revoke metadata|audit metadata/i)
})

test('Session Management keeps routing, logout, and browser credential side effects out of the view', () => {
  assert.doesNotMatch(source, /api\.delete|\.logout\(|useRouter|router\.|location\.(?:assign|replace)|localStorage|sessionStorage/)
  assert.doesNotMatch(source, /session\.id\s*\}\}/)
})

test('Session revoke requires confirmation and cancel never sends a request', () => {
  assert.match(source, /openRevokeConfirmation\(session\)/)
  assert.match(source, /selectedSession\.value = session\s+confirmVisible\.value = true/)
  assert.match(source, /撤銷目前的登入？/)
  assert.match(source, /撤銷此登入？/)
  assert.match(source, /const cancelRevoke = \(\) => \{[\s\S]*confirmVisible\.value = false[\s\S]*selectedSession\.value = null[\s\S]*\}/)
  const cancelBody = source.slice(source.indexOf('const cancelRevoke'), source.indexOf('const confirmRevoke'))
  assert.doesNotMatch(cancelBody, /revokeSession/)
})

test('Session revoke is target-scoped and protected against duplicate submission', () => {
  assert.match(source, /if \(!target \|\| pendingSessionId\.value\) return/)
  assert.match(source, /pendingSessionId\.value = target\.id/)
  assert.match(source, /await authApi\.revokeSession\(target\.id\)/)
  assert.match(source, /pendingSessionId\.value = null/)
  assert.match(source, /:loading="pendingSessionId === session\.id"/)
  assert.match(source, /:disabled="pendingSessionId !== null"/)
})

test('Backend isCurrent is authoritative for post-revoke local authentication cleanup', () => {
  assert.match(source, /if \(response\.data\.isCurrent\) \{\s*authStore\.clearAuth\(\)/)
  assert.doesNotMatch(source, /if \(target\.isCurrent\)[\s\S]*clearAuth/)
  assert.doesNotMatch(source, /authStore\.logout\(|authApi\.logout\(/)
  assert.doesNotMatch(source, /useRouter|router\.(?:push|replace)|location\.(?:assign|replace)/)
})

test('Other-session success reloads the authoritative list without local filtering', () => {
  const successFlow = source.slice(source.indexOf('if (response.data.isCurrent)'), source.indexOf('} catch (error: unknown)'))
  assert.match(successFlow, /message: '已撤銷該裝置的登入。'/)
  assert.match(successFlow, /const reloaded = await loadSessions\(\)/)
  assert.match(successFlow, /登入已撤銷，但清單更新失敗/)
  assert.doesNotMatch(successFlow, /\.filter\(|\.splice\(/)
})

test('SESSION_NOT_FOUND is distinct, reloads the list, and never clears authentication', () => {
  const notFoundFlow = source.slice(source.indexOf("if (status === 404"), source.indexOf("} else if (status === 401)"))
  assert.match(notFoundFlow, /code === 'SESSION_NOT_FOUND'/)
  assert.match(notFoundFlow, /該登入已不存在/)
  assert.match(notFoundFlow, /await loadSessions\(\)/)
  assert.doesNotMatch(notFoundFlow, /clearAuth|logout/)
})

test('401, server, and network failures preserve the list and use distinct safe feedback', () => {
  assert.match(source, /else if \(status === 401\)/)
  assert.match(source, /登入狀態已失效，無法撤銷此登入。/)
  assert.match(source, /無法撤銷此登入，請稍後再試。/)
  const catchFlow = source.slice(source.indexOf('} catch (error: unknown)'), source.indexOf('} finally'))
  assert.doesNotMatch(catchFlow, /sessions\.value\s*=|clearAuth|logout|router/)
})

test('Session Management reuses the existing FrontHeader without adding a frontend layout', () => {
  assert.match(source, /import FrontHeader from ['"]@\/components\/layout\/FrontHeader\.vue['"]/)
  assert.match(source, /<FrontHeader\s*\/>/)
  assert.doesNotMatch(source, /FrontendLayout|AccountLayout/)
})
