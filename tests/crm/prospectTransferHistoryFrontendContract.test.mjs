import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const api = readFileSync(new URL('../../src/api/crm.ts', import.meta.url), 'utf8')
const view = readFileSync(new URL('../../src/views/admin/crm/MyBusinessView.vue', import.meta.url), 'utf8')
const between = (source, start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)))

test('handoff reads use canonical Admin portal GET surfaces and minimized DTOs', () => {
  assert.match(api, /getProspectTransferHistory:[\s\S]*api\.get<Envelope<ProspectTransferHistoryItem\[\]>>\(`\/v1\/crm\/my-prospects\/\$\{prospectId\}\/transfer-history`, adminRequest\)/)
  assert.match(api, /getOutgoingProspectTransfers:[\s\S]*api\.get<Envelope<OutgoingProspectTransferReceipt\[\]>>\('\/v1\/crm\/my-prospects\/transfers\/outgoing', adminRequest\)/)
  const receipt = between(api, 'export interface OutgoingProspectTransferReceipt', '\n\nconst adminRequest')
  for (const forbidden of ['phone', 'mobile', 'email', 'address', 'note', 'followUps', 'plannedActivities']) assert.doesNotMatch(receipt, new RegExp(forbidden))
})

test('current-owner history loads with Detail and has isolated loading, error, retry, empty, and name-only presentation', () => {
  const loader = between(view, 'const loadProspectTransferHistory', 'const loadProspectDetail')
  for (const state of ['loadingProspectTransferHistory', 'prospectTransferHistoryError', 'prospectTransferHistory']) assert.match(loader, new RegExp(`${state}\\.value`))
  assert.match(view, /Promise\.all\(\[loadPlannedActivities\(prospectId\), loadFollowUps\(prospectId\), loadProspectTransferHistory\(prospectId\)\]\)/)
  const section = between(view, '<section class="detail-block transfer-history-section"', '</section>')
  for (const text of ['轉交紀錄', '尚無轉交紀錄', '重試', '自行轉交']) assert.ok(section.includes(text))
  assert.match(section, /fromResponsibleSales\.displayName.*→.*toResponsibleSales\.displayName/)
  assert.doesNotMatch(section, /\.id\s*}}|responsibleSalesId/)
})

test('outgoing receipts are isolated, non-navigating, and refreshed after successful transfer', () => {
  const loader = between(view, 'const loadOutgoingProspectTransfers', 'const refresh')
  for (const state of ['loadingOutgoingProspectTransfers', 'outgoingProspectTransfersError', 'outgoingProspectTransfers']) assert.match(loader, new RegExp(`${state}\\.value`))
  const section = between(view, '<article class="surface-card data-section outgoing-transfer-section"', '</article>')
  for (const text of ['最近轉出', '尚無轉出紀錄', '已轉交給', '重試']) assert.ok(section.includes(text))
  assert.match(section, /item\.prospect\.displayName/); assert.match(section, /item\.toResponsibleSales\.displayName/)
  const receipts = between(section, '<ol v-else class="handoff-list outgoing-receipts">', '</ol>')
  assert.ok(receipts.length > 0, 'bounded outgoing receipt list markup must exist')
  assert.match(receipts, /<li v-for="item in outgoingProspectTransfers"/)
  assert.match(receipts, /formatDate\(item\.occurredAt/)
  for (const navigation of [/RouterLink/, /<a(?:\s|>)/, /@click/, /loadProspectDetail/, /openProspectDetail/, /router\.push/, /router\.replace/]) {
    assert.doesNotMatch(receipts, navigation)
  }
  assert.match(view, /Promise\.all\(\[loadProspects\(\), loadOutgoingProspectTransfers\(\)\]\)/)
})

test('handoff presentation uses theme tokens and responsive layout without polling or mock data', () => {
  const style = view.slice(view.indexOf('.handoff-list'))
  assert.match(style, /var\(--border-grey\)/); assert.match(style, /var\(--bg-main\)/); assert.match(style, /var\(--text-muted\)/)
  assert.match(style, /@media\(max-width:767px\)[\s\S]*handoff-list/)
  const handoff = between(view, 'const prospectTransferHistory', 'const plannedActivities')
  assert.doesNotMatch(handoff, /setInterval|setTimeout|mock/i)
})
