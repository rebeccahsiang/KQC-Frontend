import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

// ============================================================
// Human Consultation — Public API Contract
// WEB-1F-C2B regression protection
// ============================================================
test('public client posts only the canonical consultation payload', () => {
  const api = read('src/api/publicHumanConsultations.ts')
  const post = api.slice(api.indexOf('export const createHumanConsultationRequest'), api.length)

  assert.match(api, /baseURL: import\.meta\.env\.VITE_API_BASE_URL \|\| '\/api'/)
  assert.match(api, /withCredentials: false/)
  assert.match(api, /type HumanConsultationCreateResponse = Envelope<HumanConsultationCreated>/)
  assert.match(post, /publicApi\.post<AxiosResponse<HumanConsultationCreateResponse>>\([\s\S]*'\/public\/human-consultations'/)
  assert.match(post, /\{ name: payload\.name, phone: payload\.phone, serviceTypes: payload\.serviceTypes \}/)
  assert.doesNotMatch(post, /source|createdAt:\s*payload|status:\s*payload|email|company|notes|userId/)
})

test('public client is isolated from Admin, CRM, auth, and personal-data logging', () => {
  const api = read('src/api/publicHumanConsultations.ts')
  assert.doesNotMatch(api, /adminHumanConsultations|\/v1\/admin|CRM|Customer|BusinessCase|Lead|Authorization|withCredentials:\s*true/i)
  assert.doesNotMatch(api, /console\.|localStorage|sessionStorage/)
  assert.doesNotMatch(api, /from '\.\/axios'/)
})

test('public response type exposes only the bounded Backend receipt', () => {
  const api = read('src/api/publicHumanConsultations.ts')
  const responseType = api.slice(api.indexOf('export interface HumanConsultationCreated'), api.indexOf('interface Envelope'))
  assert.deepEqual(
    [...responseType.matchAll(/^\s+(\w+):/gm)].map((match) => match[1]),
    ['id', 'status', 'createdAt'],
  )
  assert.doesNotMatch(responseType, /name|phone|serviceTypes|source|_id/)
})
