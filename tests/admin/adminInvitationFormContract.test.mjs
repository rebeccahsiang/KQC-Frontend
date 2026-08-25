import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('invitation payload keeps organization placement optional and sends no client domain authority', () => {
  const view = read('src/views/admin/invitations/AdminInvitationsView.vue')
  const api = read('src/api/adminInvitations.ts')
  assert.match(view, /\.\.\.\(form\.organizationUnitId \? \{ organizationUnitId: form\.organizationUnitId, assignmentRole: form\.assignmentRole \} : \{\}\)/)
  assert.doesNotMatch(view.slice(view.indexOf('adminInvitationsApi.create'), view.indexOf('feedback.value')), /domain:/)
  assert.match(api, /organizationUnitId\?: string; assignmentRole\?: AssignmentRole/)
})

test('organization options are active, capability-aware, and preserve multi-capability input', () => {
  const view = read('src/views/admin/invitations/AdminInvitationsView.vue')
  assert.match(view, /item\.status === 'active'/)
  assert.match(view, /item\.domain === 'platform' && form\.capabilities\.includes\('PLATFORM_MANAGER'\)/)
  assert.match(view, /item\.domain === 'sales' && supportsSales\.value/)
  assert.match(view, /capabilities: form\.capabilities/)
})

test('platform placement is supervisor-only while sales supports its canonical roles', () => {
  const view = read('src/views/admin/invitations/AdminInvitationsView.vue')
  assert.match(view, /domain === 'platform'\) return \[\{ label: '主管', value: 'supervisor' as const \}\]/)
  assert.match(view, /supportsSales\.value \? \[\{ label: '成員', value: 'member' as const \}\]/)
  assert.match(view, /capabilities\.includes\('SALES_SUPERVISOR'\) \? \[\{ label: '主管', value: 'supervisor' as const \}\]/)
  assert.match(view, /if \(!roles\.includes\(form\.assignmentRole\)\) form\.assignmentRole = roles\[0\] \|\| 'member'/)
})

test('capability changes clear incompatible placement and dialog lifecycle resets stale state', () => {
  const view = read('src/views/admin/invitations/AdminInvitationsView.vue')
  assert.match(view, /watch\(\(\) => \[\.\.\.form\.capabilities\], reconcileOrganizationSelection\)/)
  assert.match(view, /watch\(\(\) => form\.organizationUnitId, reconcileOrganizationSelection\)/)
  assert.match(view, /if \(!form\.organizationUnitId\) \{ form\.assignmentRole = 'member'; return \}/)
  assert.match(view, /form\.organizationUnitId = ''; form\.assignmentRole = 'member'; return/)
  assert.match(view, /openInvitationDialog = \(\) => \{ resetForm\(\); dialogVisible\.value = true \}/)
  assert.match(view, /@hide="resetForm"/)
  const createStart = view.indexOf('const createInvitation = async () => {')
  const createEnd = view.indexOf('\nconst resend = async', createStart)
  assert.ok(createStart >= 0 && createEnd > createStart)
  const createInvitation = view.slice(createStart, createEnd)
  assert.match(createInvitation, /resetForm\(\)[\s\S]*dialogVisible\.value = false/)
})
