import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('Dashboard uses the canonical shared API transport without production localhost authority', () => {
  const dashboard = read('src/views/admin/DashboardView.vue')

  assert.match(dashboard, /import api from '@\/api\/axios'/)
  assert.doesNotMatch(dashboard, /http:\/\/localhost:3000|import axios from 'axios'/)
  assert.match(dashboard, /api\.get<any>\('\/cases\?isAdmin=true'\)/)
  assert.match(dashboard, /api\.patch\(`\/cases\/\$\{currentEditingId\.value\}`,[^)]*sanitizedPayload\)/)
  assert.match(dashboard, /api\.post\('\/cases', form\.value\)/)
  assert.match(dashboard, /api\.patch\(`\/cases\/\$\{id\}`,[^)]*caseStatus: status[^)]*\)/)
  assert.match(dashboard, /api\.delete\(`\/cases\/\$\{id\}`\)/)
})

test('Pages build reads public Vite configuration from Repository Variables without values', () => {
  const workflow = read('.github/workflows/deploy.yml')

  assert.match(workflow, /VITE_PUBLIC_CONSULTATION_PHONE: \$\{\{ vars\.VITE_PUBLIC_CONSULTATION_PHONE \}\}/)
  assert.match(workflow, /VITE_API_BASE_URL: \$\{\{ vars\.VITE_API_BASE_URL \}\}/)
  assert.doesNotMatch(workflow, /secrets\.VITE_(?:PUBLIC_CONSULTATION_PHONE|API_BASE_URL)|https?:\/\/[^\s]+/)
})

test('tracked env example is placeholder-only and ignore rules remain conflict-free', () => {
  const envExample = read('.env.example')
  const gitignore = read('.gitignore')

  assert.match(envExample, /^VITE_PUBLIC_CONSULTATION_PHONE=$/m)
  assert.match(envExample, /^VITE_API_BASE_URL=$/m)
  assert.doesNotMatch(envExample, /\b09\d{8}\b|https?:\/\/|(?:SECRET|PASSWORD|PRIVATE_KEY)\s*=/i)
  assert.match(gitignore, /^\.env$/m)
  assert.match(gitignore, /^\.env\.\*$/m)
  assert.match(gitignore, /^!\.env\.example$/m)
  assert.doesNotMatch(gitignore, /^(?:<<<<<<<|=======|>>>>>>>)/m)
})
