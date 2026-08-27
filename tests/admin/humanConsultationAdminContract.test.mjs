import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('ADMIN-only Message Management owns the consultation route and navigation', () => {
  const router = read('src/router/index.ts')
  const sidebar = read('src/config/sidebarMenu.ts')

  assert.match(router, /path: 'human-consultations', name: 'HumanConsultations'/)
  assert.match(router, /HumanConsultationsView\.vue/)
  assert.match(router, /title: '真人諮詢需求', capabilities: \['ADMIN'\]/)
  assert.match(sidebar, /id: 'messages'[^\n]*capabilities: \['ADMIN'\]/)
  assert.match(sidebar, /id: 'human-consultations'[^\n]*title: '真人諮詢需求'[^\n]*path: '\/admin\/messages\/human-consultations'[^\n]*capabilities: \['ADMIN'\]/)
  assert.match(sidebar, /title: 'Email 紀錄'/)
  assert.match(sidebar, /title: '智能客服對答'/)
})

test('admin API uses only authenticated admin list and approved status PATCH', () => {
  const api = read('src/api/adminHumanConsultations.ts')
  assert.match(api, /api\.get<Envelope<HumanConsultationListResponse>>\([\s\S]*'\/v1\/admin\/human-consultations'/)
  assert.match(api, /api\.patch<Envelope<\{ request: HumanConsultationAdminItem \}>>\([\s\S]*\/v1\/admin\/human-consultations\/\$\{encodeURIComponent\(id\)\}\/status/)
  assert.match(api, /type HumanConsultationStatus = 'PENDING_CONTACT' \| 'CONTACTED'/)
  assert.doesNotMatch(api, /\/public\/human-consultations|post\(/i)
})

test('admin view maps service and status values to bounded Chinese presentation', () => {
  const view = read('src/views/admin/messages/HumanConsultationsView.vue')
  for (const mapping of [
    ["'asset-trade'", '資產買賣'], ['website', '網站架設'], ["'vehicle-quota'", '車額買賣'], ["'parking-proof'", '停車位證明'],
    ['PENDING_CONTACT', '待聯絡'], ['CONTACTED', '已聯絡'],
  ]) assert.match(view, new RegExp(`${mapping[0]}:[^\n]*'${mapping[1]}'`))
  for (const column of ['建立時間', '姓名', '電話', '需求類型', '狀態', '操作']) assert.ok(view.includes(`header="${column}"`))
  assert.match(view, /data\.status === 'PENDING_CONTACT'/)
  assert.match(view, /label="標記已聯絡"/)
  assert.match(view, /adminHumanConsultationsApi\.updateStatus\(item\.id, 'CONTACTED'\)/)
  assert.match(view, /requests\.value\[index\] = response\.data\.request/)
})

test('admin view exposes phone to authorized staff without logging personal data', () => {
  const view = read('src/views/admin/messages/HumanConsultationsView.vue')
  assert.match(view, /:href="`tel:\$\{data\.phone\}`"/)
  assert.doesNotMatch(view, /console\.|localStorage|sessionStorage/)
})

test('C2B public submission remains separate from Admin handling and CRM', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  const publicApi = read('src/api/publicHumanConsultations.ts')
  const adminApi = read('src/api/adminHumanConsultations.ts')
  const view = read('src/views/admin/messages/HumanConsultationsView.vue')
  assert.match(dock, /createHumanConsultationRequest/)
  assert.match(publicApi, /'\/public\/human-consultations'/)
  assert.doesNotMatch(`${dock}\n${publicApi}`, /adminHumanConsultations|\/v1\/admin\//i)
  assert.doesNotMatch(`${publicApi}\n${adminApi}\n${view}`, /Customer|BusinessCase|Lead|crm|round.?robin/i)
})
