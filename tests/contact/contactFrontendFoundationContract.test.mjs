import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const view = read('src/views/ContactView.vue')
const config = read('src/config/contactServices.ts')
const router = read('src/router/index.ts')
const selection = read('src/components/contact/ContactServiceSelection.vue')
const profile = read('src/components/contact/ContactProfileForm.vue')
const privacy = read('src/components/contact/ContactPrivacyDialog.vue')
const needs = read('src/components/contact/ContactNeedsForm.vue')
const trust = read('src/components/contact/ContactTrustPanel.vue')
const success = read('src/components/contact/ContactSuccessState.vue')
const publicContactApi = read('src/api/publicContactInquiries.ts')

test('CONTACT-R1A keeps the canonical Contact route and local four-state flow', () => {
  assert.match(router, /path: '\/contact', name: 'Contact'/)
  for (const component of ['ContactStepper', 'ContactServiceSelection', 'ContactProfileForm', 'ContactNeedsForm', 'ContactSuccessState']) {
    assert.match(view, new RegExp(`<${component}`))
  }
  assert.match(view, /currentStep === 1[\s\S]*currentStep === 2[\s\S]*currentStep === 3[\s\S]*ContactSuccessState/)
  assert.match(view, /請至少選擇 1 項諮詢服務/)
  assert.match(selection, /emit\('next'\)/)
  assert.match(success, /送出完成[\s\S]*感謝您的填寫！/)
})

test('approved service pillars and service configuration remain explicit frontend authority', () => {
  for (const pillar of ['事業價值實現', '營運效能優化', '專業網絡支援', '其他']) assert.match(config, new RegExp(pillar))
  for (const service of ['事業出售／轉讓', '事業購買／投資', '企業價值評估', '智慧車隊派遣系統', '停車位證明申辦', '車險／產險顧問轉介', '其他（請說明）']) assert.match(config, new RegExp(service))
  assert.match(view, /selectedServices\.value\.length < 5/)
  assert.match(selection, /aria-pressed="selected\(service\.code\)"/)
})

test('profile remains guest-accessible and autofill is bounded to editable auth name and email', () => {
  assert.match(view, /useAuthStore\(\)/)
  assert.match(view, /profile\.name = user\.name/)
  assert.match(view, /profile\.email = user\.email/)
  assert.doesNotMatch(view, /user\.(?:phone|mobile|lineId|companyName)/)
  assert.doesNotMatch(view, /isAuthenticated[\s\S]*(?:v-if|return)|openAuthModal|requireAuth/)
  assert.match(profile, /autocomplete="tel"/)
  assert.match(profile, /privacyAccepted/)
})

test('dynamic questions preserve service mapping and distinct completion/contact timing', () => {
  assert.match(view, /questionsForServices\(selectedServices\.value\)/)
  for (const group of ["'business-sale': 'SALE'", "'business-buy': 'BUY'", "'fleet-dispatch': 'DISPATCH'", "'transport-website': 'WEBSITE'", "'parking-proof': 'PARKING'"]) assert.ok(config.includes(group))
  assert.match(config, /key: 'completionTimeframe'/)
  assert.match(config, /key: 'contactUrgency'/)
  assert.match(needs, /v-for="question in questions"/)
})

test('real LINE support remains and persisted success adds no CRM or client-owned inquiry authority', () => {
  assert.match(trust, /import lineOfficialQrImage from '@\/assets\/images\/services\/kqc-line-official-qr\.png'/)
  assert.match(trust, /<img :src="lineOfficialQrImage"/)
  assert.match(trust, /alt="KQC LINE 官方帳號 QR Code"/)
  assert.doesNotMatch(success, /正式送出功能將於後續系統串接後啟用。/)
  const contactBoundary = [view, config, selection, profile, needs, trust, success, publicContactApi].join('\n')
  assert.doesNotMatch(contactBoundary, /crmApi\.|CrmLead|adminContact|localStorage\.|sessionStorage\./)
})

test('CONTACT-R1A-1 uses the approved local consultant visual and explicit dark-panel contrast', () => {
  assert.match(view, /import consultantSupportImage from '@\/assets\/images\/contact\/kqc-consultant-support\.png'/)
  assert.match(view, /<img :src="consultantSupportImage" alt="KQC 專業顧問提供一對一諮詢服務">/)
  assert.doesNotMatch(view, /https?:\/\/[^'"\s]+(?:consult|support)/i)
  assert.match(view, /\.contact-hero\{[^}]*grid-template-columns:/)
  const mobileRulesStart = view.indexOf('@media(max-width:640px)')
  assert.notEqual(mobileRulesStart, -1)
  const mobileRules = view.slice(mobileRulesStart, view.indexOf('</style>', mobileRulesStart))
  assert.match(mobileRules, /\.contact-hero\{grid-template-columns:1fr\}/)
  assert.match(trust, /\.trust-panel h2\{[^}]*color:#fff/)
  assert.match(trust, /\.trust-panel li strong\{color:#fff/)
  assert.match(trust, /\.trust-panel li small\{color:#d5e5ea/)
  assert.match(trust, /<img :src="lineOfficialQrImage"/)
})

test('CONTACT-R1A-2 aligns to public width authority and raises local readability', () => {
  assert.match(view, /\.contact-hero\{[^}]*width:min\(calc\(100% - 2rem\),90rem\)/)
  assert.match(view, /\.contact-layout\{[^}]*width:min\(calc\(100% - 2rem\),90rem\)/)
  assert.match(view, /grid-template-columns:minmax\(0,2\.65fr\) minmax\(20rem,1fr\)/)
  assert.match(selection, /\.service-grid button\{[^}]*font-size:1rem/)
  assert.match(trust, /\.trust-panel li strong\{[^}]*font-size:1rem/)
  assert.match(trust, /\.trust-panel li small\{[^}]*font-size:\.94rem/)
})

test('CONTACT-R1A-3 keeps support contextual while exposing approved phone and unchanged LINE channels', () => {
  assert.match(view, /<ContactTrustPanel :step="isComplete \? 4 : currentStep"/)
  for (const heading of ['一對一專業顧問諮詢', '留下方便聯繫的方式', '讓顧問更快掌握需求', '感謝您的諮詢']) assert.match(trust, new RegExp(heading))
  assert.match(trust, /\(03\) 275-5094/)
  assert.match(trust, /href="tel:032755094"/)
  assert.match(trust, /<img :src="lineOfficialQrImage"/)
})

test('CONTACT-R1A-3 privacy explanation is interactive and independent from required consent', () => {
  assert.match(profile, /id="contact-privacy-consent" type="checkbox"/)
  assert.match(profile, /<button type="button" @click="emit\('privacy'\)">個人資料蒐集與聯繫使用說明<\/button>/)
  assert.match(view, /<ContactPrivacyDialog v-if="isPrivacyDialogOpen" @close="isPrivacyDialogOpen = false"/)
  assert.match(privacy, /role="dialog" aria-modal="true"/)
  assert.match(privacy, /個人資料蒐集與聯繫使用說明/)
  assert.match(privacy, /event\.key === 'Escape'/)
  assert.doesNotMatch(privacy, /privacyAccepted|emit\('update'|checked\s*=/)
  assert.match(view, /if \(!profile\.privacyAccepted\) errors\.privacyAccepted/)
})

test('CONTACT-R1B-1 submits only bounded form authority and waits for persistence before success', () => {
  assert.match(publicContactApi, /'\/public\/contact-inquiries'/)
  assert.match(publicContactApi, /import api from ['"]\.\/axios['"]/)
  assert.match(publicContactApi, /await api\.post<Envelope<\{ inquiry: PublicContactInquiryCreated \}>>/)
  assert.match(publicContactApi, /return response\.data\.inquiry/)
  assert.doesNotMatch(publicContactApi, /response\.status|response\.data\.data/)
  assert.match(view, /await publicContactInquiriesApi\.create\(/)
  assert.match(view, /createdInquiry\.value = await[\s\S]*isComplete\.value = true/)
  assert.match(view, /if \(isSubmitting\.value\) return/)
  assert.match(needs, /:disabled="submitting"[\s\S]*:aria-busy="submitting"/)
  assert.match(view, /serviceTypes: \[\.\.\.selectedServices\.value\][\s\S]*privacyAccepted: true, answers/)
  const payloadBoundary = publicContactApi.slice(publicContactApi.indexOf('export interface PublicContactInquiryPayload'), publicContactApi.indexOf('export interface PublicContactInquiryCreated'))
  assert.doesNotMatch(payloadBoundary, /inquiryNo:|source:|assignedTo:|assignedAt:|privacyAcceptedAt:|status:/)
})

test('CONTACT-R1B-1 failure remains retryable on Step 3 without clearing entered state', () => {
  const catchBoundary = view.slice(view.indexOf('} catch {'), view.indexOf('} finally {'))
  assert.match(catchBoundary, /submitError\.value = '目前無法送出您的諮詢需求/)
  assert.doesNotMatch(catchBoundary, /isComplete\.value = true|selectedServices\.value =|Object\.assign\(profile|needsAnswers\[/)
  assert.match(view, /finally \{\s*isSubmitting\.value = false/)
  assert.match(success, /您的諮詢需求已成功送出/)
  assert.match(success, /諮詢編號：\{\{ inquiryNo \}\}/)
})
