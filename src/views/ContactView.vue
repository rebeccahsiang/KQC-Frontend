<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import ContactNeedsForm from '@/components/contact/ContactNeedsForm.vue'
import ContactPrivacyDialog from '@/components/contact/ContactPrivacyDialog.vue'
import ContactProfileForm from '@/components/contact/ContactProfileForm.vue'
import ContactServiceSelection from '@/components/contact/ContactServiceSelection.vue'
import ContactStepper from '@/components/contact/ContactStepper.vue'
import ContactSuccessState from '@/components/contact/ContactSuccessState.vue'
import ContactTrustPanel from '@/components/contact/ContactTrustPanel.vue'
import { questionsForServices, type ContactProfileData, type ContactServiceCode } from '@/config/contactServices'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const currentStep = ref(1)
const isComplete = ref(false)
const selectedServices = ref<ContactServiceCode[]>([])
const selectionError = ref('')
const profileErrors = ref<Record<string, string>>({})
const needsErrors = ref<Record<string, string>>({})
const needsAnswers = reactive<Record<string, string>>({})
const sourceUrl = ref('')
const workflowPanel = ref<HTMLElement | null>(null)
const isPrivacyDialogOpen = ref(false)
const profile = reactive<ContactProfileData>({
  salutation: '', name: '', companyName: '', jobTitle: '', mobile: '', email: '', lineId: '', privacyAccepted: false,
})

const questions = computed(() => questionsForServices(selectedServices.value))

// CONTACT-R1A — Member Contact Prefill / only bounded public identity fields are copied and remain editable.
watch(() => authStore.user, (user) => {
  if (!user) return
  if (!profile.name) profile.name = user.name || ''
  if (!profile.email) profile.email = user.email || ''
}, { immediate: true })

onMounted(() => { sourceUrl.value = window.location.href })

const focusWorkflow = async () => {
  await nextTick()
  workflowPanel.value?.focus()
}
const changeStep = async (step: number) => {
  currentStep.value = step
  await focusWorkflow()
}
const toggleService = (code: ContactServiceCode) => {
  const index = selectedServices.value.indexOf(code)
  if (index >= 0) {
    selectedServices.value.splice(index, 1)
    selectionError.value = ''
  } else if (selectedServices.value.length < 5) {
    selectedServices.value.push(code)
    selectionError.value = ''
  } else selectionError.value = '最多可選擇 5 項服務。'
}
const continueFromServices = () => {
  if (!selectedServices.value.length) {
    selectionError.value = '請至少選擇 1 項諮詢服務。'
    return
  }
  void changeStep(2)
}
const updateProfile = (key: keyof ContactProfileData, value: string | boolean) => {
  Object.assign(profile, { [key]: value })
  delete profileErrors.value[key]
}
const validateProfile = () => {
  const errors: Record<string, string> = {}
  if (!profile.salutation) errors.salutation = '請選擇稱呼。'
  if (!profile.name.trim()) errors.name = '請填寫姓名。'
  const mobile = profile.mobile.replace(/[\s()-]/g, '')
  if (!mobile) errors.mobile = '請填寫手機號碼。'
  else if (!/^\+?\d{7,15}$/.test(mobile)) errors.mobile = '請輸入有效的手機號碼。'
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errors.email = '請輸入有效的 Email。'
  if (!profile.privacyAccepted) errors.privacyAccepted = '送出前請同意個人資料使用說明。'
  profileErrors.value = errors
  if (!Object.keys(errors).length) void changeStep(3)
}
const updateAnswer = (key: string, value: string) => {
  needsAnswers[key] = value
  delete needsErrors.value[key]
}

// CONTACT-R1A — Demo-safe Completion / validates locally without API, CRM, or persistence authority.
const completeLocally = async () => {
  const errors: Record<string, string> = {}
  questions.value.forEach((question) => {
    const answer = (needsAnswers[question.key] || '').trim()
    if (question.required && !answer) errors[question.key] = `請填寫「${question.label}」。`
    if (question.maxlength && answer.length > question.maxlength) errors[question.key] = `最多 ${question.maxlength} 字。`
  })
  needsErrors.value = errors
  if (Object.keys(errors).length) return
  isComplete.value = true
  await focusWorkflow()
}
const focusLineSupport = () => document.querySelector<HTMLElement>('#contact-line-support')?.focus()
</script>

<template>
  <main class="contact-view">
    <!-- CONTACT-R1A-1 — Contact Consultant Hero / approved local consultant asset supports the existing Contact flow. -->
    <header class="contact-hero">
      <div class="contact-hero__copy">
        <p>CONTACT KQC</p>
        <h1>聯絡我們與一對一諮詢</h1>
        <span>從事業媒合、營運數位化到專業網絡支援，讓 KQC 顧問先了解您的需求。</span>
      </div>
      <div class="contact-hero__visual">
        <img src="/images/contact/kqc-consultant-support.png" alt="KQC 專業顧問提供一對一諮詢服務">
      </div>
    </header>
    <!-- CONTACT-R1A-2 — Public Container Alignment / Contact follows the established 90rem public-page authority. -->
    <div class="contact-layout">
      <section ref="workflowPanel" class="workflow-card" tabindex="-1" aria-label="諮詢需求表單">
        <ContactStepper v-if="!isComplete" :current-step="currentStep" :complete="false" />
        <ContactServiceSelection v-if="!isComplete && currentStep === 1" :selected="selectedServices" :error="selectionError" @toggle="toggleService" @next="continueFromServices" />
        <ContactProfileForm v-else-if="!isComplete && currentStep === 2" :profile="profile" :errors="profileErrors" @update="updateProfile" @privacy="isPrivacyDialogOpen = true" @back="changeStep(1)" @next="validateProfile" />
        <ContactNeedsForm v-else-if="!isComplete && currentStep === 3" :questions="questions" :answers="needsAnswers" :errors="needsErrors" @update="updateAnswer" @back="changeStep(2)" @complete="completeLocally" />
        <ContactSuccessState v-else @line="focusLineSupport" />
      </section>
      <ContactTrustPanel :step="isComplete ? 4 : currentStep" />
    </div>
    <span class="source-context" aria-hidden="true">{{ sourceUrl }}</span>
    <ContactPrivacyDialog v-if="isPrivacyDialogOpen" @close="isPrivacyDialogOpen = false" />
  </main>
</template>

<style lang="scss" scoped>
.contact-view{min-height:100vh;padding:3rem 0 4rem;background:linear-gradient(180deg,#f2f7f8 0,#fff 25rem)}
.contact-hero{display:grid;width:min(calc(100% - 2rem),90rem);min-height:17rem;margin:0 auto 1.6rem;grid-template-columns:minmax(0,1.15fr) minmax(18rem,.85fr);align-items:stretch;overflow:hidden;border:1px solid #dce7eb;border-radius:1.2rem;background:#fff;box-shadow:0 16px 38px rgba(22,50,68,.07)}.contact-hero__copy{display:flex;padding:clamp(1.5rem,4vw,3rem);justify-content:center;flex-direction:column}.contact-hero p{margin:0;color:#9a741c;font-size:.75rem;font-weight:900;letter-spacing:.16em}.contact-hero h1{max-width:12ch;margin:.45rem 0;color:#172b43;font-size:clamp(2rem,4vw,3.2rem);line-height:1.12;letter-spacing:-.035em}.contact-hero span{max-width:40rem;color:#627386;font-size:1rem;line-height:1.75}.contact-hero__visual{min-height:17rem;overflow:hidden}.contact-hero__visual img{display:block;width:100%;height:100%;object-fit:cover;object-position:62% center}
.contact-layout{display:grid;width:min(calc(100% - 2rem),90rem);margin:auto;grid-template-columns:minmax(0,2.65fr) minmax(20rem,1fr);align-items:start;gap:1.5rem}.workflow-card{min-width:0;padding:clamp(1.25rem,3vw,2.25rem);border:1px solid #dce5ea;border-radius:1rem;background:#fff;box-shadow:0 16px 38px rgba(22,50,68,.08)}.workflow-card:focus{outline:none}.source-context{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
@media(max-width:900px){.contact-layout{grid-template-columns:1fr}.contact-view{padding-top:2rem}.contact-hero{grid-template-columns:minmax(0,1.1fr) minmax(15rem,.9fr)}.contact-hero__copy{padding:1.5rem}.contact-hero h1{font-size:clamp(1.8rem,5vw,2.6rem)}}
@media(max-width:640px){.contact-hero,.contact-layout{width:min(calc(100% - 1.25rem),90rem)}.contact-hero{grid-template-columns:1fr}.contact-hero__visual{min-height:13rem;max-height:16rem}.contact-hero__visual img{aspect-ratio:16/9;object-position:62% 38%}}
</style>
