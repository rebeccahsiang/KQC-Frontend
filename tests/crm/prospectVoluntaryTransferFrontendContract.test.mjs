import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const api = readFileSync(new URL('../../src/api/crm.ts', import.meta.url), 'utf8')
const view = readFileSync(new URL('../../src/views/admin/crm/MyBusinessView.vue', import.meta.url), 'utf8')
const between = (source, start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)))

test('canonical candidate and transfer APIs use the bounded Prospect owner surface', () => {
  assert.match(api, /ProspectTransferCandidate \{ id: string; displayName: string \}/)
  assert.match(api, /ProspectTransferInput \{ recipientSalesId: string; revision: number \}/)
  const methods = between(api, 'getProspectTransferCandidates:', 'createMyProspectPlannedActivity:')
  assert.match(methods, /api\.get<Envelope<ProspectTransferCandidate\[\]>>\(`\/v1\/crm\/my-prospects\/\$\{prospectId\}\/transfer-candidates`, adminRequest\)/)
  assert.match(methods, /api\.post<Envelope<ProspectDetail>>\(`\/v1\/crm\/my-prospects\/\$\{prospectId\}\/transfer`, input, adminRequest\)/)
  for (const forbidden of ['/admin/users', 'organization/assignments', 'assignment-candidates', 'localStorage', 'sessionStorage']) assert.doesNotMatch(methods, new RegExp(forbidden))
})

test('transfer presentation is owner, source, and converted bounded without supervisor bypass', () => {
  const eligibility = between(view, 'const canPresentProspectTransfer', 'const prospectValidation')
  assert.match(eligibility, /prospectDetail\.value\?\.source === 'SELF_DEVELOPED'/)
  assert.match(eligibility, /developmentStatus !== 'CONVERTED'/)
  assert.match(eligibility, /responsibleSalesId === authStore\.user\?\._id/)
  assert.doesNotMatch(eligibility, /SALES_SUPERVISOR|supervisor|role|capabilit/i)
  assert.match(view, /v-if="canPresentProspectTransfer" label="轉交"/)
})

test('dialog has canonical copy, isolated candidate states, retry, empty, and required recipient', () => {
  const dialog = between(view, '<Dialog v-model:visible="transferDialogVisible"', '</Dialog>')
  for (const text of ['轉交潛在客戶', '轉交給 *', '目前沒有可轉交的業務。', '確認轉交', '取消']) assert.ok(dialog.includes(text))
  assert.match(dialog, /transferCandidateLoading/); assert.match(dialog, /transferCandidateError/)
  assert.match(dialog, /@click="loadProspectTransferCandidates"/)
  assert.match(dialog, /candidate\.displayName/); assert.match(dialog, /:value="candidate\.id"/)
  assert.match(dialog, /v-model="transferRecipientId" required aria-required="true"/)
  assert.match(dialog, /:loading="transferSubmitting"/); assert.match(dialog, /:disabled="!transferRecipientId[^\"]*transferSubmitting"/)
})

test('candidate discovery is isolated, canonical, reset between Prospects, and never mock-derived', () => {
  const discovery = between(view, 'const resetProspectTransfer', 'const submitProspectTransfer')
  assert.match(discovery, /crmApi\.getProspectTransferCandidates\(prospectId\)/)
  assert.match(discovery, /transferCandidateLoading\.value/); assert.match(discovery, /transferCandidateError\.value/)
  assert.match(discovery, /transferCandidates\.value/); assert.match(discovery, /resetProspectTransfer\(\)/)
  assert.match(discovery, /requestId === transferCandidateRequestId/)
  for (const unrelated of ['plannedActivityError', 'followUpError', 'prospectError', 'summaryError', 'calendarError']) assert.doesNotMatch(discovery, new RegExp(`${unrelated}\\.value\\s*=`))
  assert.doesNotMatch(discovery, /mock|adminUsers|adminOrganizations|FollowUp|plannedActivities/i)
})

test('one guarded POST sends only recipient and current revision, then closes stale owner scope', () => {
  const submit = between(view, 'const submitProspectTransfer', 'const submitProspect =')
  assert.match(submit, /if \(!prospectDetail\.value \|\| !transferRecipientId\.value \|\| transferSubmitting\.value\) return/)
  assert.equal((submit.match(/crmApi\.transferProspect/g) || []).length, 1)
  assert.match(submit, /\{ recipientSalesId: transferRecipientId\.value, revision \}/)
  assert.match(submit, /transferDialogVisible\.value = false/); assert.match(submit, /detailProspectVisible\.value = false/)
  assert.match(submit, /prospectDetail\.value = null/); assert.match(submit, /await loadProspects\(\)/)
  assert.doesNotMatch(submit, /responsibleSalesId\s*=|plannedActivities\.value\s*=|followUps\.value\s*=/)
})

test('all canonical transfer errors have bounded safe presentation', () => {
  const submit = between(view, 'const submitProspectTransfer', 'const submitProspect =')
  for (const code of ['PROSPECT_REVISION_CONFLICT', 'PROSPECT_NOT_FOUND', 'PROSPECT_TRANSFER_RECIPIENT_INVALID', 'PROSPECT_TRANSFER_ORGANIZATION_SCOPE_FORBIDDEN', 'PROSPECT_TRANSFER_SOURCE_FORBIDDEN', 'PROSPECT_CONVERTED_READ_ONLY']) assert.ok(submit.includes(code))
  for (const message of ['此潛在客戶資料已更新，請重新整理後再試。', '此潛在客戶已不在目前可操作範圍，請重新整理。', '所選業務目前無法接手此潛在客戶，請重新選擇。', '所選業務不在目前可轉交的組織範圍內。', '此潛在客戶不適用自行轉交流程。']) assert.ok(submit.includes(message))
  assert.equal((submit.match(/crmApi\.transferProspect/g) || []).length, 1)
})

test('visual grammar retains wide Detail, semantic tokens, responsiveness, and no forbidden transfer surfaces', () => {
  assert.match(view, /width: 'min\(72rem, calc\(100vw - 2rem\)\)'/)
  const style = view.slice(view.indexOf('<style'))
  assert.match(style, /transfer-explanation[\s\S]*var\(--border-grey\)[\s\S]*var\(--bg-main\)[\s\S]*var\(--text-muted\)/)
  assert.match(style, /@media\(max-width:767px\)/)
  assert.doesNotMatch(style.slice(style.indexOf('.transfer-explanation'), style.indexOf('@media')), /#[0-9a-f]{3,8}|rgba?\(|hsla?\(/i)
  assert.doesNotMatch(view, /supervisorApproval|approvalStatus|forceAssign|organizationStatus|transferCustomer|transferBusinessCase|mockRecipient/i)
})
