import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const between = (source, start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)))
const api = read('src/api/crm.ts')
const view = read('src/views/admin/crm/MyBusinessView.vue')
const config = read('src/config/crm.ts')

test('Follow-up DTO, outcome vocabulary and nested canonical API are exact', () => {
  for (const value of ['INTERESTED', 'CONTINUE_FOLLOW_UP', 'AWAITING_RESPONSE', 'NOT_INTERESTED_NOW', 'UNREACHABLE']) assert.match(api, new RegExp(value))
  for (const label of ['有興趣', '持續跟進', '等待回覆', '暫無興趣', '未聯繫上']) assert.ok(config.includes(label))
  const methods = between(api, 'createMyProspectFollowUp:', '\n}')
  assert.match(methods, /api\.post[\s\S]*`\/v1\/crm\/my-prospects\/\$\{prospectId\}\/follow-ups`/)
  assert.match(methods, /api\.get[\s\S]*`\/v1\/crm\/my-prospects\/\$\{prospectId\}\/follow-ups`/)
  assert.match(methods, /api\.patch[\s\S]*`\/v1\/crm\/my-prospects\/\$\{prospectId\}\/follow-ups\/\$\{followUpId\}`/)
  assert.match(methods, /api\.delete[\s\S]*data: \{ revision \}/)
  assert.match(methods, /adminRequest/)
  assert.doesNotMatch(methods, /localStorage|sessionStorage|Authorization|Bearer|token/i)
})

test('Detail renders independent Follow-up timeline states and approved mutations', () => {
  const detail = between(view, '<section class="detail-block follow-up-section"', '</section>')
  for (const text of ['聯絡紀錄', '＋新增聯絡紀錄', '目前沒有聯絡紀錄', '由預定行程完成', '編輯', '刪除']) assert.ok(detail.includes(text))
  assert.match(detail, /v-if="loadingFollowUps"/)
  assert.match(detail, /v-else-if="followUpError"/)
  assert.match(detail, /loadFollowUps\(prospectDetail\.id\)/)
  assert.doesNotMatch(detail, /\.sort\(/)
})

test('24-hour controls are conservative and reuse the local non-polling clock', () => {
  const eligibility = between(view, 'const followUpCanMutate', 'const loadFollowUps')
  assert.match(eligibility, /authStore\.user\?\._id/)
  assert.match(eligibility, /item\.responsibleSalesId === authStore\.user\?\._id/)
  assert.match(eligibility, /new Date\(item\.createdAt\)\.getTime\(\) \+ 24 \* 60 \* 60 \* 1000/)
  const clock = between(view, 'const stopPlannedActivityClock', 'const toLocalDateTimeInput')
  assert.match(clock, /setInterval[\s\S]*plannedActivityNow\.value = Date\.now\(\)/)
  assert.doesNotMatch(clock, /crmApi|loadFollowUps|loadPlannedActivities/)
})

test('Completion is one atomic command with optional nested next activity', () => {
  const apiMethod = between(api, 'completeMyProspectPlannedActivity:', 'createMyProspectFollowUp:')
  assert.match(apiMethod, /api\.post[\s\S]*\/complete`/)
  const submit = between(view, 'const submitCompleteActivity', 'const reloadCompletionActivity')
  assert.equal((submit.match(/completeMyProspectPlannedActivity/g) || []).length, 1)
  assert.match(submit, /nextActivity/)
  assert.match(submit, /Promise\.all\(\[loadPlannedActivities[\s\S]*loadFollowUps/)
  assert.doesNotMatch(submit, /createMyProspectFollowUp|createMyProspectPlannedActivity/)
})

test('Follow-up conflict, edit-window and read-only semantics remain explicit', () => {
  for (const copy of ['這筆聯絡紀錄已在其他地方更新，請重新載入後再編輯。', '這筆聯絡紀錄已超過 24 小時修改期限，現在只能查看。', '這筆聯絡紀錄屬於歷史紀錄，目前只能查看。', '這筆行程已在其他地方更新，請重新載入後再操作。', '這筆行程目前已無法完成，資料已重新載入。']) assert.ok(view.includes(copy))
  assert.match(view, /prospectDetail\.developmentStatus !== 'CONVERTED'/)
})
