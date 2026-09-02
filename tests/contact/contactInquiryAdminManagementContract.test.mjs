import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const view = read('src/views/admin/messages/ContactInquiriesView.vue')
const api = read('src/api/adminContactInquiries.ts')
const router = read('src/router/index.ts')
const sidebar = read('src/config/sidebarMenu.ts')

// CONTACT-R1B-2 — Admin Contact Inquiry Frontend Contract / ADMIN-only bounded management.
test('ADMIN navigation and route expose the dedicated Contact Inquiry management view', () => {
  assert.match(sidebar, /contact-inquiries[\s\S]*聯絡我們諮詢[\s\S]*\/admin\/messages\/contact-inquiries[\s\S]*capabilities: \['ADMIN'\]/)
  assert.match(router, /path: 'contact-inquiries'[\s\S]*ContactInquiriesView\.vue[\s\S]*capabilities: \['ADMIN'\]/)
})

test('typed API owns list detail and strict status endpoints through shared transport', () => {
  assert.match(api, /import api from ['"]\.\/axios['"]/)
  assert.match(api, /'\/v1\/admin\/contact-inquiries'/)
  assert.match(api, /`\/v1\/admin\/contact-inquiries\/\$\{encodeURIComponent\(id\)\}`/)
  assert.match(api, /`\/v1\/admin\/contact-inquiries\/\$\{encodeURIComponent\(id\)\}\/status`[\s\S]*\{ status \}/)
  assert.match(api, /'PENDING' \| 'IN_PROGRESS' \| 'COMPLETED' \| 'CLOSED'/)
  assert.doesNotMatch(api, /\bany\b|crm|Lead|Customer/)
})

test('table keeps seven bounded columns, backend status reconciliation, and disabled assignment planning', () => {
  assert.equal((view.match(/<Column\b/g) || []).length, 7)
  for (const label of ['送出時間', '姓名／公司', '服務需求', '急迫度', '狀態', '負責人', '操作']) assert.match(view, new RegExp(`header="${label}"`))
  for (const label of ['待處理', '處理中', '已完成', '已關閉']) assert.match(view, new RegExp(label))
  assert.doesNotMatch(view, /header="(?:諮詢編號|需求服務|聯絡急迫度|指派)"|已結案/)
  assert.match(view, /header="送出時間"[\s\S]*formatDate\(data\.createdAt\)/)
  const statusColumn = view.slice(view.indexOf('<Column header="狀態">'), view.indexOf('<Column header="負責人">'))
  const ownerColumn = view.slice(view.indexOf('<Column header="負責人">'), view.indexOf('<Column header="操作">'))
  const actionColumn = view.slice(view.indexOf('<Column header="操作">'), view.indexOf('</DataTable>'))
  assert.match(statusColumn, /<Select[\s\S]*:model-value="data\.status"[\s\S]*@update:model-value="updateStatus\(data, \$event\)"/)
  assert.doesNotMatch(statusColumn, /openDetail|pi-user-plus/)
  assert.match(ownerColumn, /data\.assignedTo \|\| '未指派'/)
  assert.doesNotMatch(ownerColumn, /<Select|<Button/)
  assert.match(actionColumn, /label="查看"[\s\S]*icon="pi pi-eye"[\s\S]*@click="openDetail\(data\)"/)
  assert.doesNotMatch(actionColumn, /<Select|updateStatus/)
  assert.match(view, /adminContactInquiriesApi\.updateStatus\(item\.id, status\)/)
  assert.match(view, /inquiries\.value\[index\] = [\s\S]*status: updated\.status/)
  assert.match(actionColumn, /label="指派"[\s\S]*icon="pi pi-user-plus"[\s\S]*disabled[\s\S]*title="規劃中"[\s\S]*aria-label="指派負責人（規劃中）"/)
  assert.doesNotMatch(view, /assign(?:ed)?To\s*=|adminContactInquiriesApi\.assign|crmApi|Lead/)
})

test('detail uses dedicated GET and renders approved contact, service, answer, privacy, and assignment fields', () => {
  assert.match(view, /adminContactInquiriesApi\.detail\(item\.id\)/)
  assert.match(view, /<Drawer[\s\S]*聯絡諮詢詳細資料[\s\S]*detail\.profile\.mobile[\s\S]*detail\.profile\.email[\s\S]*detail\.profile\.lineId/)
  assert.match(view, /CONTACT_SERVICE_PILLARS[\s\S]*questionsForServices/)
  assert.match(view, /detail\.answers\[question\.key\]/)
  assert.match(view, /detail\.privacyAcceptedAt/)
  assert.match(view, /detail\.assignedTo[\s\S]*detail\.assignedAt/)
  assert.doesNotMatch(view, /v-html|_id|crmData|BusinessCase|Customer/)
})

test('list handles loading empty error pagination and compact primary plus-N service presentation', () => {
  assert.match(view, /:loading="loading"/)
  assert.match(view, /empty-message="目前沒有聯絡諮詢。"/)
  assert.match(view, /<Message v-if="errorMessage"/)
  assert.match(view, /<Paginator v-if="pagination\.totalPages > 1"/)
  assert.match(view, /Math\.max\(0, types\.length - 1\)/)
  assert.match(view, />\+\{\{ serviceSummary\(data\.serviceTypes\)\.extra \}\}</)
})
