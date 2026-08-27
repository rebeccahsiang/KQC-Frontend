import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('human consultation owns exactly four approved typed multi-select services', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  const api = read('src/api/publicHumanConsultations.ts')
  const options = dock.slice(dock.indexOf('const humanServiceOptions'), dock.indexOf('const selectedServices'))

  assert.match(api, /type HumanConsultationServiceType = 'asset-trade' \| 'website' \| 'vehicle-quota' \| 'parking-proof'/)
  assert.match(dock, /type HumanServiceId = HumanConsultationServiceType/)
  assert.equal((options.match(/\{ id:/g) ?? []).length, 4)
  for (const label of ['資產買賣', '網站架設', '車額買賣', '停車位證明']) assert.ok(options.includes(label))
  assert.match(dock, /const selectedServices = ref<HumanServiceId\[]>\(\[\]\)/)
  assert.match(dock, /:aria-pressed="selectedServices\.includes\(service\.id\)"/)
  assert.match(dock, /selectedServices\.value = selectedServices\.value\.includes\(id\)[\s\S]*\.filter\([\s\S]*:\s*\[\.\.\.selectedServices\.value, id\]/)
})

test('direct call is independent from service selection and uses public phone config', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  const config = read('src/config/publicContact.ts')
  const envExample = read('.env.example')
  const directCall = dock.match(/<a :href="publicContact\.consultationPhoneHref"[^>]*>直接撥打<\/a>/)?.[0] ?? ''

  assert.ok(directCall)
  assert.doesNotMatch(directCall, /selectedServices/)
  assert.doesNotMatch(directCall, /@click/)
  assert.doesNotMatch(directCall, /router/)
  assert.doesNotMatch(directCall, /(?:^|\s)disabled(?:\s|=|>|$)/)
  assert.match(directCall, /:aria-disabled="!publicContact\.consultationPhoneHref"/)
  assert.match(directCall, /:tabindex="publicContact\.consultationPhoneHref \? undefined : -1"/)
  assert.match(config, /import\.meta\.env\.VITE_PUBLIC_CONSULTATION_PHONE/)
  assert.match(config, /consultationPhoneHref: consultationPhone \? `tel:\$\{consultationPhone\}` : ''/)
  assert.match(envExample, /^VITE_PUBLIC_CONSULTATION_PHONE=0908939319$/m)
  assert.doesNotMatch(dock, /0908939319|tel:0908939319/)
})

test('callback requires a service and remains a local same-panel flow', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')

  assert.match(dock, /type ConsultationStep = 'selection' \| 'callback' \| 'complete'/)
  assert.match(dock, /if \(selectedServices\.value\.length === 0\)/)
  assert.match(dock, /請至少選擇一項服務需求/)
  assert.match(dock, /consultationStep\.value = 'callback'/)
  assert.match(dock, /v-else-if="consultationStep === 'callback'"/)
  assert.equal((dock.match(/id="home-service-panel"/g) ?? []).length, 1)
  assert.doesNotMatch(dock, /modal|dialog|router\.push\([^)]*callback/i)
})

test('callback form validates bounded name and phone fields and exposes selected services', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  const callbackTemplate = dock.slice(dock.indexOf('<template v-else-if="consultationStep === \'callback\'">'), dock.indexOf('<template v-else>', dock.indexOf('consultationStep === \'callback\'')))
  const returnHandler = dock.slice(dock.indexOf('const returnToSelection'), dock.indexOf('const finishConsultation'))

  assert.match(dock, /v-model="callbackName"[^>]*maxlength="80"[^>]*autocomplete="name"/)
  assert.match(dock, /v-model="callbackPhone"[^>]*maxlength="24"[^>]*autocomplete="tel"/)
  assert.match(dock, /callbackName\.value\.trim\(\)/)
  assert.match(dock, /phone\.replace\(\/\[\\s\(\)\+\.\-\]\//)
  assert.match(dock, /\^\\d\{7,15\}\$/)
  assert.match(dock, /請輸入姓名/)
  assert.match(dock, /請輸入有效的聯絡電話/)
  assert.match(dock, /class="human-selected-services" aria-label="已選需求"/)
  assert.match(callbackTemplate, /type="button" @click="returnToSelection">返回/)
  assert.match(returnHandler, /consultationStep\.value = 'selection'/)
  assert.doesNotMatch(returnHandler, /resetHumanConsultation|closePanel|selectedServices|callbackName|callbackPhone/)
  assert.match(dock, /type="submit" class="is-primary" :disabled="submissionState === 'submitting'"/)
})

// ============================================================
// Human Consultation — Public Submission Integration
// WEB-1F-C2B regression protection
// ============================================================
test('validated callback submits once and reaches completion only after Backend success', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  const config = read('src/config/publicContact.ts')
  const completionTemplate = dock.slice(dock.indexOf('<div class="human-consultation-complete"'), dock.indexOf('</template>', dock.indexOf('human-consultation-complete')))
  const finishHandler = dock.slice(dock.indexOf('const finishConsultation'), dock.indexOf('const submitCallbackRequest'))
  const submitHandler = dock.slice(dock.indexOf('const submitCallbackRequest'), dock.indexOf('const scrollToFeaturedServices'))

  assert.ok(submitHandler.indexOf('if (nameValidation.value || phoneValidation.value) return') < submitHandler.indexOf('await createHumanConsultationRequest'))
  assert.match(submitHandler, /if \(submissionState\.value === 'submitting'\) return/)
  assert.match(submitHandler, /await createHumanConsultationRequest\(\{ name, phone, serviceTypes: \[\.\.\.selectedServices\.value\] \}\)/)
  assert.ok(submitHandler.indexOf('await createHumanConsultationRequest') < submitHandler.indexOf("consultationStep.value = 'complete'"))
  assert.match(dock, /已收到您的聯絡需求/)
  assert.match(dock, /我們已收到您留下的聯絡資料，後續將由服務人員依需求與您聯繫。/)
  assert.doesNotMatch(dock, /正式送出功能將於後續版本串接。/)
  assert.match(completionTemplate, /type="button" @click="finishConsultation">返回/)
  assert.match(finishHandler, /resetHumanConsultation\(\)[\s\S]*closePanel\(\)/)
  assert.doesNotMatch(dock, /立即回覆|24 小時內一定聯絡/)
  assert.doesNotMatch(`${dock}\n${config}`, /\/admin\/|localStorage|sessionStorage|openai|line\.me/i)
})

test('submission failure remains retryable and stale responses cannot leak across panel sessions', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  const submitHandler = dock.slice(dock.indexOf('const submitCallbackRequest'), dock.indexOf('const scrollToFeaturedServices'))

  assert.match(dock, /type SubmissionState = 'idle' \| 'submitting' \| 'success' \| 'error'/)
  assert.match(submitHandler, /catch \{[\s\S]*submissionState\.value = 'error'[\s\S]*submissionError\.value = '送出失敗，請稍後再試。'/)
  assert.doesNotMatch(submitHandler.match(/catch \{[\s\S]*?\n  \}/)?.[0] ?? '', /callbackName\.value\s*=|callbackPhone\.value\s*=|selectedServices\.value\s*=/)
  assert.match(submitHandler, /const requestEpoch = \+\+submissionEpoch/)
  assert.equal((submitHandler.match(/if \(requestEpoch !== submissionEpoch\) return/g) ?? []).length, 2)
  assert.match(dock, /v-if="submissionError"[^>]*role="alert"/)
  assert.match(dock, /submissionState === 'submitting' \? '送出中…' : '送出需求'/)
})

test('closing or switching away resets personal consultation state', () => {
  const dock = read('src/components/home/HomeServiceDock.vue')
  const reset = dock.slice(dock.indexOf('const resetHumanConsultation'), dock.indexOf('const toggleHumanService'))

  for (const resetValue of [
    "selectedServices.value = []",
    "consultationStep.value = 'selection'",
    "callbackName.value = ''",
    "callbackPhone.value = ''",
    "serviceValidation.value = ''",
    "nameValidation.value = ''",
    "phoneValidation.value = ''",
    "submissionState.value = 'idle'",
    "submissionError.value = ''",
  ]) assert.ok(reset.includes(resetValue))
  assert.match(reset, /submissionEpoch \+= 1/)
  assert.match(dock, /watch\(\(\) => props\.activePanel, \(activePanel, previousPanel\) => \{[\s\S]*previousPanel === 'human' && activePanel !== 'human'[\s\S]*resetHumanConsultation\(\)/)
  assert.match(dock, /event\.key === 'Escape'/)
})

test('existing panel ownership and desktop-only boundary remain intact', () => {
  const home = read('src/views/HomeView.vue')
  const dock = read('src/components/home/HomeServiceDock.vue')
  const styles = read('src/components/home/_homeSections.scss')
  const mobile = styles.slice(styles.lastIndexOf('@media (max-width: 768px)'), styles.lastIndexOf('@media (max-width: 480px)'))

  assert.match(home, /const activePanel = ref<ServicePanel \| null>\(null\)/)
  assert.match(home, /<HomeServiceDock :active-panel="activePanel" @update:active-panel="activePanel = \$event"/)
  assert.equal((dock.match(/v-if="props\.activePanel"/g) ?? []).length, 1)
  assert.match(mobile, /\.home-service-workspace\s*\{\s*display:\s*none;/)
  assert.doesNotMatch(`${home}\n${dock}`, /MobileServiceDock|BottomServiceDock/)
})
