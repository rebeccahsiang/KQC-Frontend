import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('Customer create uses the canonical shared admin-portal API contract', () => {
  const api = read('src/api/crm.ts')
  assert.match(api, /^import api from ['"]\.\/axios['"]/m)
  assert.match(api, /createCustomer: \(input: CreateCustomerInput\) => api\.post<Envelope<CustomerDetail>>\('\/v1\/crm\/customers', input, adminRequest\)/)
  assert.match(api, /authPortal: 'admin'/)
  assert.doesNotMatch(api, /axios\.create|localStorage|sessionStorage|document\.cookie|Authorization/)
})

test('Customer Number and ownership remain exclusively backend-owned', () => {
  const api = read('src/api/crm.ts')
  const view = read('src/views/admin/crm/MyBusinessView.vue')
  const input = api.slice(api.indexOf('export interface CreateCustomerInput'), api.indexOf('export interface BusinessCaseListItem'))
  for (const field of ['customerNumber', 'primarySalesId', 'createdBy', 'updatedBy']) assert.doesNotMatch(input, new RegExp(`${field}[?]?:`))
  assert.doesNotMatch(view, /Date\.now|Math\.random|generateCustomer|YYMMDD|localSequence/i)
  assert.doesNotMatch(view, /v-model="customerForm\.(customerNumber|primarySalesId|createdBy|updatedBy)"/)
  assert.match(view, /created\.customerNumber/)
})

test('Create form dynamically enforces canonical PERSON and COMPANY fields', () => {
  const view = read('src/views/admin/crm/MyBusinessView.vue')
  assert.match(view, /value="PERSON">個人/)
  assert.match(view, /value="COMPANY">公司/)
  assert.match(view, /customerType === 'PERSON'.*!customerForm\.value\.name\.trim\(\)/)
  assert.match(view, /customerType === 'COMPANY'.*!customerForm\.value\.companyName\.trim\(\)/)
  for (const field of ['name', 'companyName', 'taxId', 'representative', 'contactPerson', 'phone', 'mobile', 'email', 'address', 'grade', 'note']) assert.match(view, new RegExp(`customerForm\\.${field}`))
  assert.match(view, /\['A', 'B', 'C', 'D'\]/)
  assert.match(view, /maxlength="5000"/)
  assert.match(view, /customerForm\.value\.note\.trim\(\) \|\| null/)
})

test('Submit is single-flight, preserves failure input, and refreshes Customers after success', () => {
  const view = read('src/views/admin/crm/MyBusinessView.vue')
  assert.match(view, /if \(creatingCustomer\.value \|\| customerFormError\.value\) return/)
  assert.match(view, /await crmApi\.createCustomer\(input\)/)
  assert.match(view, /await loadCustomers\(\)/)
  assert.match(view, /resetCustomerForm\(\)/)
  assert.match(view, /catch \{ createCustomerError\.value =/)
  assert.doesNotMatch(view, /catch[^}]*resetCustomerForm/s)
  assert.match(view, /:loading="creatingCustomer"/)
})

test('Create remains Customer-only with no mock, matching, Case, FollowUp, or Finance side effect', () => {
  const view = read('src/views/admin/crm/MyBusinessView.vue')
  const submit = view.slice(view.indexOf('const submitCustomer'), view.indexOf('onMounted(refresh)'))
  assert.doesNotMatch(submit, /businessCase|followUp|finance|matchCustomer|duplicate/i)
  assert.doesNotMatch(view, /mockCustomer|fixtureCustomer|FIN-DEMO|createBusinessCase|createFollowUp|createFinance/i)
  assert.match(view, /label="新增業務" disabled/)
})
