import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const api = fs.readFileSync(new URL('../../src/api/crm.ts', import.meta.url), 'utf8')
const view = fs.readFileSync(new URL('../../src/views/admin/crm/MyBusinessView.vue', import.meta.url), 'utf8')
const config = fs.readFileSync(new URL('../../src/config/crm.ts', import.meta.url), 'utf8')
const slice = (source, from, to) => source.slice(source.indexOf(from), source.indexOf(to, source.indexOf(from)))

test('Planned Activity canonical DTOs exclude display-only OVERDUE status', () => {
  assert.match(api, /PlannedActivitySubjectType = 'PROSPECT' \| 'CUSTOMER' \| 'BUSINESS_CASE'/)
  assert.match(api, /PlannedActivityStatus = 'PENDING' \| 'COMPLETED' \| 'CANCELLED'/)
  assert.doesNotMatch(api, /PlannedActivityStatus[^\n]*OVERDUE/)
  for (const type of ['PHONE', 'LINE', 'MEETING', 'QUOTATION', 'CUSTOMER_RESPONSE', 'REQUIREMENT_CHANGE']) assert.match(api, new RegExp(`PlannedActivityType[^\\n]*${type}`))
})

test('Prospect Planned Activity API uses canonical paths and shared Admin portal Axios', () => {
  const create = slice(api, 'createMyProspectPlannedActivity:', 'myProspectPlannedActivities:')
  const list = slice(api, 'myProspectPlannedActivities:', 'myProspectPlannedActivity:')
  const detail = slice(api, 'myProspectPlannedActivity:', 'updateMyProspectPlannedActivity:')
  const update = slice(api, 'updateMyProspectPlannedActivity:', 'cancelMyProspectPlannedActivity:')
  const cancel = slice(api, 'cancelMyProspectPlannedActivity:', 'completeMyProspectPlannedActivity:')
  const methods = [create, list, detail, update, cancel]

  assert.match(create, /api\.post[\s\S]*`\/v1\/crm\/my-prospects\/\$\{prospectId\}\/planned-activities`/)
  assert.match(list, /api\.get[\s\S]*`\/v1\/crm\/my-prospects\/\$\{prospectId\}\/planned-activities`/)
  assert.match(detail, /api\.get[\s\S]*`\/v1\/crm\/my-prospects\/\$\{prospectId\}\/planned-activities\/\$\{activityId\}`/)
  assert.match(update, /api\.patch[\s\S]*`\/v1\/crm\/my-prospects\/\$\{prospectId\}\/planned-activities\/\$\{activityId\}`/)
  assert.match(cancel, /api\.post[\s\S]*`\/v1\/crm\/my-prospects\/\$\{prospectId\}\/planned-activities\/\$\{activityId\}\/cancel`/)
  assert.match(api, /import api from '\.\/axios'/)
  assert.match(api, /const adminRequest = \{ authPortal: 'admin' as const \}/)
  for (const method of methods) assert.match(method, /adminRequest/)
  const plannedActivityApi = methods.join('\n')
  assert.doesNotMatch(plannedActivityApi, /localStorage|sessionStorage|Authorization|Bearer|token/i)
  assert.doesNotMatch(plannedActivityApi, /api\.delete|deleteMyProspectPlannedActivity/i)
})

test('Detail information architecture and approved labels are present', () => {
  const detail = slice(view, '<Dialog v-model:visible="detailProspectVisible"', '<Dialog v-model:visible="prospectFormVisible"')
  const basic = detail.indexOf('基本資料'); const planned = detail.indexOf('預定行程'); const followUp = detail.indexOf('聯絡紀錄')
  assert.ok(basic >= 0 && basic < planned && planned < followUp)
  for (const text of ['待執行', '過期未執行', '全部行程', '＋新增行程', '取消原因']) assert.match(detail, new RegExp(text))
  assert.match(detail, /label="完成"[\s\S]*@click="openCompleteActivity\(item\)"/)
  for (const text of ['電話', 'LINE', '面談', '報價', '客戶回覆', '需求變化']) assert.match(config, new RegExp(text))
})

test('Overdue is derived from pending startAt and backend order is preserved', () => {
  const derived = slice(view, 'const activityIsOverdue', 'const activityDate')
  assert.match(derived, /item\.status === 'PENDING'/)
  assert.match(derived, /new Date\(item\.startAt\)\.getTime\(\) < plannedActivityNow\.value/)
  assert.match(derived, /plannedActivities\.value\.filter/)
  assert.doesNotMatch(derived, /\.sort\(/)
})

test('Planned Activity read-only time uses one 12-hour 上午／下午 formatter', () => {
  const formatter = slice(view, 'const plannedActivityDateTime', 'const stopPlannedActivityClock')
  assert.match(formatter, /Intl\.DateTimeFormat\('zh-TW'/)
  assert.match(formatter, /hour12: true/)
  assert.match(formatter, /part\('dayPeriod'\)/)
  assert.match(formatter, /part\('hour'\).*part\('minute'\)/)
  const detail = slice(view, '<section class="detail-block planned-activity-section"', '<section class="detail-block follow-up-section"')
  const cancelDialog = slice(view, '<Dialog v-model:visible="cancelActivityVisible"', '</Dialog>')
  assert.match(detail, /plannedActivityDateTime\(item\.startAt\)/)
  assert.match(cancelDialog, /plannedActivityDateTime\(selectedActivity\.startAt\)/)
  assert.match(view, /new Date\(activityForm\.value\.startAt\)\.toISOString\(\)/)
})

test('Open Prospect Detail refreshes only the local overdue comparison clock', () => {
  const clock = slice(view, 'const stopPlannedActivityClock', 'const toLocalDateTimeInput')
  assert.match(clock, /clearInterval\(plannedActivityClockTimer\)/)
  assert.match(clock, /plannedActivityClockTimer = null/)
  assert.match(clock, /setInterval\(\(\) => \{ plannedActivityNow\.value = Date\.now\(\) \}, 30000\)/)
  assert.doesNotMatch(clock, /crmApi|loadPlannedActivities|fetch|axios/)
  const lifecycle = slice(view, 'onMounted(refresh)', '</script>')
  assert.match(lifecycle, /watch\(detailProspectVisible,[\s\S]*startPlannedActivityClock\(\)[\s\S]*stopPlannedActivityClock\(\)/)
  assert.match(lifecycle, /onUnmounted\(stopPlannedActivityClock\)/)
  assert.match(view, /item\.status === 'PENDING' && new Date\(item\.startAt\)\.getTime\(\) < plannedActivityNow\.value/)
  assert.doesNotMatch(api, /PlannedActivityStatus[^\n]*OVERDUE/)
})

test('Create and edit serialize local datetime explicitly and preserve backend revision', () => {
  const mutation = slice(view, 'const activityValidation', 'const openCancelActivity')
  assert.match(mutation, /new Date\(activityForm\.value\.startAt\)\.toISOString\(\)/)
  assert.match(mutation, /startAt\.getTime\(\) < Date\.now\(\)/)
  assert.match(mutation, /revision: activityForm\.value\.revision/)
  assert.doesNotMatch(mutation, /revision\s*\+|revision\+\+/)
  assert.match(mutation, /PLANNED_ACTIVITY_REVISION_CONFLICT/)
  assert.match(mutation, /這筆行程已在其他地方更新，請重新載入後再編輯。/)
  assert.match(mutation, /這筆行程目前已無法編輯，資料已重新載入。/)
})

test('Cancel uses a dialog, reason and revision without delete semantics', () => {
  const cancel = slice(view, 'const openCancelActivity', 'const loadProspectDetail')
  assert.match(cancel, /cancelMyProspectPlannedActivity/)
  assert.match(cancel, /revision: selectedActivity\.value\.revision/)
  assert.match(cancel, /cancellationReason: cancellationReason\.value\.trim\(\)/)
  assert.match(cancel, /這筆行程已在其他地方更新，請重新載入後再操作。/)
  assert.doesNotMatch(cancel, /confirm\(|\.delete\(/)
  const dialog = slice(view, '<Dialog v-model:visible="cancelActivityVisible"', '</Dialog>')
  assert.match(dialog, /maxlength="1000"/)
  assert.match(dialog, /重新載入資料/)
})

test('Converted and terminal activities expose no mutation actions', () => {
  const detail = slice(view, '<section class="detail-block planned-activity-section"', '<section class="detail-block follow-up-section"')
  assert.match(detail, /v-if="prospectDetail\.developmentStatus !== 'CONVERTED'" label="＋新增行程"/)
  assert.match(detail, /v-if="item\.status === 'PENDING' && prospectDetail\.developmentStatus !== 'CONVERTED'"/)
  assert.match(view, /code === 'PROSPECT_CONVERTED_READ_ONLY'/)
})

test('Planned Activity request failures remain isolated from existing dataset errors', () => {
  const activity = slice(view, 'const loadPlannedActivities', 'const resetActivityForm')
  assert.match(activity, /plannedActivityError\.value/)
  for (const state of ['summaryError', 'calendarError', 'customerError', 'caseError', 'prospectError']) assert.doesNotMatch(activity, new RegExp(`${state}\\.value\\s*=`))
  assert.doesNotMatch(activity, /detailProspectVisible\.value\s*=\s*false/)
})

test('Mutation success reloads only the activity collection', () => {
  const activity = slice(view, 'const submitActivity', 'const reloadActivityForEdit')
  assert.match(activity, /await loadPlannedActivities/)
  for (const loader of ['loadSummary', 'loadCalendar', 'loadCustomers', 'loadCases', 'loadProspects']) assert.doesNotMatch(activity, new RegExp(`await ${loader}\\(`))
})
