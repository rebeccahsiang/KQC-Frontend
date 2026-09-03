import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const view = read('src/views/admin/frontend/MarqueeView.vue')
const api = read('src/api/marquees.ts')
const router = read('src/router/index.ts')
const sidebar = read('src/config/sidebarMenu.ts')

// MARQUEE-R1 — Admin Marquee Contract / the existing UI now delegates every mutation to Backend authority.
test('Admin marquee page loads persisted data without legacy MQ mocks', () => {
  assert.doesNotMatch(view, /MQ-001|MQ-002|跑馬燈播報測試數據/)
  assert.match(view, /onMounted\(loadMarquees\)/)
  assert.match(view, /await getAdminMarquees\(\)/)
  assert.match(view, /marquees\.value = response\.data\.marquees/)
  assert.match(router, /path: 'marquee', name: 'MarqueeManage'/)
})

// MARQUEE-R1A — Platform Manager Authority Alignment / Sidebar and route reuse composable frontend-management capabilities.
test('Marquee Sidebar and route authorize PLATFORM_MANAGER plus ADMIN by capability', () => {
  const sidebarEntry = sidebar.match(/\{ id: 'marquee'[^\n]+\}/)?.[0] || ''
  const routeEntry = router.match(/\{ path: 'marquee', name: 'MarqueeManage'[^\n]+\}/)?.[0] || ''
  for (const authority of [sidebarEntry, routeEntry]) {
    assert.match(authority, /capabilities: \['PLATFORM_MANAGER', 'ADMIN'\]/)
    assert.doesNotMatch(authority, /roles:|role\s*===\s*['"](?:manager|admin)['"]/)
  }
})

test('create and edit share strict content, status and integer sort-order controls', () => {
  assert.match(view, /@click="openCreate"/)
  assert.match(view, /@click="openEdit\(item\)"/)
  assert.match(view, /if \(editingId\.value\) await updateMarquee\(editingId\.value, input\); else await createMarquee\(input\)/)
  assert.match(view, /Textarea[^>]*maxlength="160"[^>]*required/)
  assert.match(view, /\{ label: '啟用', value: 'ACTIVE' \}[^\n]*\{ label: '停用', value: 'INACTIVE' \}/)
  assert.match(view, /InputNumber[^>]*:min="-9999"[^>]*:max="9999"[^>]*:step="1"/)
  assert.match(view, /await loadMarquees\(\)/)
})

test('delete is confirmed, persisted and mutation guarded', () => {
  assert.match(view, /window\.confirm\(`/)
  assert.match(view, /await deleteMarquee\(item\.id\)/)
  assert.match(view, /:disabled="mutating \|\| Boolean\(deletingId\)" @click="removeMarquee\(item\)"/)
  assert.match(view, /deletingId\.value = ''/)
})

test('bounded API module owns CRUD transport and anonymous public read', () => {
  assert.match(api, /export type MarqueeStatus = 'ACTIVE' \| 'INACTIVE'/)
  assert.match(api, /export interface PublicMarquee \{ id: string; content: string; sortOrder: number \}/)
  assert.match(api, /getAdminMarquees[^\n]*'\/v1\/admin\/marquees'/)
  assert.match(api, /createMarquee[^\n]*'\/v1\/admin\/marquees'/)
  assert.match(api, /updateMarquee[^\n]*`\/v1\/admin\/marquees\/\$\{encodeURIComponent\(id\)\}`/)
  assert.match(api, /deleteMarquee[^\n]*`\/v1\/admin\/marquees\/\$\{encodeURIComponent\(id\)\}`/)
  assert.match(api, /getPublicMarquees[^\n]*'\/public\/marquees'/)
  assert.doesNotMatch(api, /Pinia|defineStore|localStorage|sessionStorage|CRM|LINE/i)
})
