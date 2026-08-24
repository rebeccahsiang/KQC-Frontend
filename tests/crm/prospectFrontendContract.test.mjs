import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const between = (source, start, end) => source.slice(source.indexOf(start), source.indexOf(end))

test('My Prospect API uses canonical paths, shared admin-portal Axios, and no token authority', () => {
  const source = read('src/api/crm.ts')
  assert.match(source, /^import api from ['"]\.\/axios['"]/m)
  assert.match(source, /authPortal: 'admin'/)
  assert.match(source, /createMyProspect:.*api\.post<.*>\('\/v1\/crm\/my-prospects', input, adminRequest\)/)
  assert.match(source, /listMyProspects:.*api\.get<.*>\('\/v1\/crm\/my-prospects', adminRequest\)/)
  const getDetail = between(source, 'getMyProspect:', 'updateMyProspect:')
  const update = source.slice(source.indexOf('updateMyProspect:'))
  assert.ok(getDetail.includes('api.get<Envelope<ProspectDetail>>'))
  assert.ok(getDetail.includes('`/v1/crm/my-prospects/${prospectId}`'))
  assert.ok(getDetail.includes('adminRequest'))
  assert.ok(update.includes('api.patch<Envelope<ProspectDetail>>'))
  assert.ok(update.includes('`/v1/crm/my-prospects/${prospectId}`'))
  assert.ok(update.includes('adminRequest'))
  assert.doesNotMatch(source, /axios\.create|localStorage|sessionStorage|document\.cookie|Authorization|refreshToken/)
})

test('Prospect types match Backend DTOs without Customer, Case, or activity inventions', () => {
  const source = read('src/api/crm.ts')
  assert.match(source, /ProspectType = 'PERSON' \| 'COMPANY'/)
  assert.match(source, /ProspectGrade = 'HIGH' \| 'NORMAL' \| 'LOW'/)
  assert.match(source, /ProspectDevelopmentStatus = 'NEW_CONTACT' \| 'CULTIVATING' \| 'INTERESTED' \| 'ON_HOLD' \| 'CONVERTED'/)
  const prospectDtos = source.slice(source.indexOf('export type ProspectType'), source.indexOf('export interface CreateProspectInput'))
  const prospectInputs = source.slice(source.indexOf('export interface CreateProspectInput'), source.indexOf('export type PlannedActivitySubjectType'))
  for (const field of ['customerNumber', 'customerId', 'businessCaseId', 'latestContactAt', 'nextPlannedAt']) assert.doesNotMatch(prospectDtos, new RegExp(`${field}[?]?:`))
  for (const field of ['responsibleSalesId', 'createdBy', 'updatedBy', 'convertedCustomerId', 'convertedAt', 'customerNumber', 'customerId', 'businessCaseId', 'activityType', 'startAt', 'status']) assert.doesNotMatch(prospectInputs, new RegExp(`${field}[?]?:`))
})

test('presentation maps canonical grades and statuses to approved user-facing wording', () => {
  const config = read('src/config/crm.ts')
  for (const value of ['HIGH', 'NORMAL', 'LOW']) assert.match(config, new RegExp(`${value}:`))
  for (const copy of ['優', '普', '劣', '高潛力', '一般潛力', '低潛力', '新接觸', '培養中', '有意願', '暫緩', '已轉正式客戶']) assert.ok(config.includes(copy))
  for (const stale of ['高開發潛力', '一般開發潛力', '低開發潛力', '初次接觸', '持續培養', '已有興趣', '暫緩開發', '已轉為正式客戶']) assert.ok(!config.includes(stale))
})

test('My Business hosts an independent Prospect section with desktop, mobile, loading, error, empty, and retry states', () => {
  const source = read('src/views/admin/crm/MyBusinessView.vue')
  assert.match(source, /<h2>開發客戶<\/h2>/)
  assert.match(source, /class="surface-card data-section prospect-section"/)
  for (const state of ['prospects', 'loadingProspects', 'prospectError', 'loadProspects']) assert.match(source, new RegExp(state))
  assert.match(source, /目前沒有開發客戶/)
  assert.match(source, /@click="loadProspects"/)
  assert.match(source, /class="desktop-table prospect-table"/)
  assert.match(source, /class="mobile-cards prospect-cards"/)
  assert.match(source, /color-mix\(in srgb,var\(--bg-card\)/)
  assert.doesNotMatch(source, /prospect\.(customerNumber|businessCaseId|latestContactAt|nextPlannedAt)/)
})

test('Prospect request state is isolated from existing My Business datasets', () => {
  const source = read('src/views/admin/crm/MyBusinessView.vue')
  const loadList = between(source, 'const loadProspects =', 'const refresh =')
  const loadDetail = between(source, 'const loadProspectDetail =', 'const openEditProspect =')
  const openEdit = between(source, 'const openEditProspect =', 'const prospectPayload =')
  const submit = between(source, 'const submitProspect =', 'onMounted(refresh)')
  assert.ok(loadList.includes('crmApi.listMyProspects()'))
  assert.ok(loadList.includes('prospectError.value = safeError'))
  assert.ok(loadDetail.includes('crmApi.getMyProspect(prospectId)'))
  assert.ok(loadDetail.includes('prospectError.value = safeError'))
  assert.ok(openEdit.includes('crmApi.getMyProspect(prospectId)'))
  assert.ok(openEdit.includes('prospectError.value = safeError'))
  assert.ok(submit.includes('crmApi.createMyProspect(prospectPayload())'))
  assert.ok(submit.includes('crmApi.updateMyProspect('))
  assert.ok(submit.includes('prospectFormError.value ='))
  for (const existing of ['loadingSummary', 'loadingCalendar', 'loadingCustomers', 'loadingCases']) assert.match(source, new RegExp(existing))
  const prospectRequestBodies = [loadList, loadDetail, openEdit, submit].join('\n')
  for (const unrelatedError of ['summaryError', 'calendarError', 'customerError', 'caseError']) {
    assert.doesNotMatch(prospectRequestBodies, new RegExp(`${unrelatedError}\\.value\\s*=`))
  }
})

test('create form is type-specific, canonical-defaulted, single-flight, and reloads only Prospect data', () => {
  const source = read('src/views/admin/crm/MyBusinessView.vue')
  assert.match(source, /label="＋新增開發客戶" @click="openCreateProspect"/)
  assert.match(source, /prospectType: 'PERSON'/)
  assert.match(source, /prospectGrade: 'NORMAL'/)
  assert.match(source, /developmentStatus: 'NEW_CONTACT'/)
  assert.match(source, /prospectType === 'PERSON'.*!prospectForm\.value\.name\.trim\(\)/)
  assert.match(source, /prospectType === 'COMPANY'.*!prospectForm\.value\.companyName\.trim\(\)/)
  assert.match(source, /activeProspectStatuses = \['NEW_CONTACT', 'CULTIVATING', 'INTERESTED', 'ON_HOLD'\]/)
  assert.match(source, /maxlength="5000"/)
  assert.match(source, /if \(savingProspect\.value \|\| prospectValidation\.value\) return/)
  assert.match(source, /await crmApi\.createMyProspect\(prospectPayload\(\)\)/)
  assert.match(source, /await loadProspects\(\)/)
  assert.doesNotMatch(source.slice(source.indexOf('const submitProspect'), source.indexOf('onMounted(refresh)')), /loadCustomers|loadCases|createCustomer|businessCase|followUp|calendar/i)
})

test('detail comes from canonical API and exposes conversion metadata only when supplied', () => {
  const source = read('src/views/admin/crm/MyBusinessView.vue')
  assert.match(source, /await crmApi\.getMyProspect\(prospectId\)/)
  for (const field of ['displayName', 'companyName', 'taxId', 'representative', 'contactPerson', 'phone', 'mobile', 'email', 'address', 'note', 'createdAt', 'updatedAt']) assert.match(source, new RegExp(`prospectDetail\.${field}`))
  assert.match(source, /v-if="prospectDetail\.developmentStatus === 'CONVERTED'"/)
  assert.match(source, /v-if="prospectDetail\.convertedCustomerId"/)
  assert.match(source, /v-if="prospectDetail\.convertedBusinessCaseId"/)
  assert.doesNotMatch(source, /customers\.find|customerLookup|customersById/)
})

test('edit keeps type immutable, sends current revision, trusts Backend response, and never auto-overwrites', () => {
  const source = read('src/views/admin/crm/MyBusinessView.vue')
  assert.match(source, /:disabled="editingProspect"/)
  assert.match(source, /const \{ prospectType: _immutableType, \.\.\.changes \} = prospectPayload\(\)/)
  assert.match(source, /revision: prospectForm\.value\.revision/)
  assert.match(source, /prospectDetail\.value = \(await crmApi\.updateMyProspect\(prospectDetail\.value\.id, input\)\)\.data/)
  assert.doesNotMatch(source, /revision\s*\+\+|revision\s*\+\s*1|revision:\s*.*revision\s*\+/)
  assert.match(source, /PROSPECT_REVISION_CONFLICT/)
  assert.match(source, /這筆開發客戶資料已在其他地方更新，請重新載入後再編輯。/)
  assert.match(source, /label="重新載入資料"/)
  assert.doesNotMatch(source, /PROSPECT_REVISION_CONFLICT[^}]*updateMyProspect/s)
})

test('converted Prospects are read-only and deferred conversion/Case actions cannot navigate or mutate', () => {
  const source = read('src/views/admin/crm/MyBusinessView.vue')
  assert.match(source, /developmentStatus === 'CONVERTED'.*disabled/s)
  assert.match(source, /PROSPECT_CONVERTED_READ_ONLY/)
  assert.match(source, /label="轉為正式客戶" disabled aria-disabled="true" title="此功能尚未開放"/)
  assert.match(source, /label="新增業務案件" disabled aria-disabled="true" title="此功能尚未開放"/)
  assert.doesNotMatch(source, /convertProspect|createBusinessCase|createFollowUp|prospectCalendar|MarketplaceCase|mockProspect/i)
})

test('A3 leaves sidebar, router, Customer Create, and non-Prospect architecture intact', () => {
  const sidebar = read('src/config/sidebarMenu.ts'); const router = read('src/router/index.ts'); const view = read('src/views/admin/crm/MyBusinessView.vue')
  assert.doesNotMatch(sidebar, /my-prospect|prospect/i)
  assert.doesNotMatch(router, /my-prospect|prospect/i)
  assert.match(view, /crmApi\.createCustomer\(input\)/)
  assert.match(view, /created\.customerNumber/)
  assert.match(view, /v-model:visible="createCustomerVisible"/)
})
