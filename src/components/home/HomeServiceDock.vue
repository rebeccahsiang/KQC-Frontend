<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePublicFaq } from '@/composables/usePublicFaq'
import { publicContact } from '@/config/publicContact'

type ServicePanel = 'ai' | 'quick-service' | 'human'
type HumanServiceId = 'asset-trade' | 'website' | 'vehicle-quota' | 'parking-proof'
type ConsultationStep = 'selection' | 'callback' | 'complete'
interface HumanServiceOption { id: HumanServiceId; label: string }
interface HumanConsultationRequest { name: string; phone: string; serviceTypes: HumanServiceId[] }
type QuickServiceAction = {
  id: string
  label: string
  type: 'route' | 'home-anchor' | 'panel' | 'faq' | 'unavailable'
  target?: string
  panel?: ServicePanel
  enabled: boolean
}

const props = defineProps<{ activePanel: ServicePanel | null }>()
const emit = defineEmits<{ 'update:activePanel': [panel: ServicePanel | null] }>()
const route = useRoute()
const router = useRouter()
const { openFaq } = usePublicFaq()
const dockItems: { id: ServicePanel; icon: string; label: string }[] = [
  { id: 'ai', icon: '🤖', label: 'AI 助理' },
  { id: 'quick-service', icon: '💬', label: '快速服務' },
  { id: 'human', icon: '📞', label: '真人諮詢' },
]
const aiPrompts = ['不確定是否符合設立條件？', '想了解牌照買賣流程？', '想獲得 24 小時即時解答']
const quickServiceActions: QuickServiceAction[] = [
  { id: 'consultation', label: '預約諮詢', type: 'route', target: '/contact', enabled: true },
  { id: 'services', label: '服務介紹', type: 'home-anchor', target: '#featured-services', enabled: true },
  { id: 'question', label: '提出問題', type: 'panel', panel: 'ai', enabled: true },
  { id: 'faq', label: '常見問題解答', type: 'faq', enabled: true },
  { id: 'offers', label: '尋找優惠', type: 'unavailable', enabled: false },
  { id: 'events', label: '近期活動訊息', type: 'route', target: '/insights', enabled: true },
]
const humanServiceOptions: HumanServiceOption[] = [
  { id: 'asset-trade', label: '資產買賣' },
  { id: 'website', label: '網站架設' },
  { id: 'vehicle-quota', label: '車額買賣' },
  { id: 'parking-proof', label: '停車位證明' },
]
const selectedServices = ref<HumanServiceId[]>([])
const consultationStep = ref<ConsultationStep>('selection')
const callbackName = ref('')
const callbackPhone = ref('')
const serviceValidation = ref('')
const nameValidation = ref('')
const phoneValidation = ref('')
const panelTitle = computed(() => dockItems.find((item) => item.id === props.activePanel)?.label ?? '')
const selectedServiceOptions = computed(() => humanServiceOptions.filter(({ id }) => selectedServices.value.includes(id)))
const togglePanel = (panel: ServicePanel) => { emit('update:activePanel', props.activePanel === panel ? null : panel) }
const closePanel = () => { emit('update:activePanel', null) }
const resetHumanConsultation = () => {
  selectedServices.value = []
  consultationStep.value = 'selection'
  callbackName.value = ''
  callbackPhone.value = ''
  serviceValidation.value = ''
  nameValidation.value = ''
  phoneValidation.value = ''
}
const toggleHumanService = (id: HumanServiceId) => {
  selectedServices.value = selectedServices.value.includes(id)
    ? selectedServices.value.filter((serviceId) => serviceId !== id)
    : [...selectedServices.value, id]
  serviceValidation.value = ''
}
const openCallbackForm = () => {
  if (selectedServices.value.length === 0) {
    serviceValidation.value = '請至少選擇一項服務需求'
    return
  }
  serviceValidation.value = ''
  consultationStep.value = 'callback'
}
const returnToSelection = () => {
  consultationStep.value = 'selection'
  nameValidation.value = ''
  phoneValidation.value = ''
}
const finishConsultation = () => {
  resetHumanConsultation()
  closePanel()
}
const submitCallbackRequest = () => {
  const name = callbackName.value.trim()
  const phone = callbackPhone.value.trim()
  const normalizedPhone = phone.replace(/[\s()+.-]/g, '')
  nameValidation.value = name ? '' : '請輸入姓名'
  phoneValidation.value = /^\d{7,15}$/.test(normalizedPhone) ? '' : '請輸入有效的聯絡電話'
  if (nameValidation.value || phoneValidation.value) return

  const futureRequest: HumanConsultationRequest = { name, phone, serviceTypes: [...selectedServices.value] }
  void futureRequest
  consultationStep.value = 'complete'
}
const scrollToFeaturedServices = async () => {
  closePanel()
  if (route.path !== '/' || route.hash !== '#featured-services') await router.push({ path: '/', hash: '#featured-services' })
  await nextTick()
  window.requestAnimationFrame(() => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    document.getElementById('featured-services')?.scrollIntoView({ behavior, block: 'start' })
  })
}
const handleQuickServiceAction = (action: QuickServiceAction) => {
  if (!action.enabled) return
  if (action.type === 'route' && action.target) {
    closePanel()
    void router.push(action.target)
  } else if (action.type === 'home-anchor') {
    void scrollToFeaturedServices()
  } else if (action.type === 'panel' && action.panel) {
    emit('update:activePanel', action.panel)
  } else if (action.type === 'faq') {
    closePanel()
    openFaq()
  }
}
const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') closePanel() }

watch(() => props.activePanel, (activePanel, previousPanel) => {
  if (previousPanel === 'human' && activePanel !== 'human') resetHumanConsultation()
})

onMounted(() => window.addEventListener('keydown', handleEscape))
onUnmounted(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <div class="home-service-workspace">
    <aside class="fixed-right-widget-panel" aria-label="浮動服務導覽">
      <div class="widget-icon-bar">
        <button v-for="item in dockItems" :key="item.id" type="button" class="widget-tab-btn" :class="{ active: props.activePanel === item.id }" :aria-expanded="props.activePanel === item.id" aria-controls="home-service-panel" @click="togglePanel(item.id)">
          <span class="tab-icon" aria-hidden="true">{{ item.icon }}</span><span class="tab-label">{{ item.label }}</span>
        </button>
      </div>
    </aside>

    <Transition name="service-panel">
      <section v-if="props.activePanel" id="home-service-panel" class="home-service-panel" :aria-labelledby="`home-service-panel-${props.activePanel}-title`">
        <header class="home-service-panel__header">
          <h2 :id="`home-service-panel-${props.activePanel}-title`">{{ panelTitle }}</h2>
          <button type="button" class="home-service-panel__close" aria-label="關閉服務面板" @click="closePanel">×</button>
        </header>
        <div class="home-service-panel__body">
          <template v-if="props.activePanel === 'ai'">
            <p class="home-service-panel__intro">您好！<br>請使用 AI 助理協助您：</p>
            <div class="home-service-panel__actions"><button v-for="prompt in aiPrompts" :key="prompt" type="button" disabled>{{ prompt }}</button></div>
            <div class="ai-foundation-input" aria-label="AI 助理尚未連線"><input type="text" disabled placeholder="AI 服務將於後續版本開放" aria-label="AI 服務尚未開放"><button type="button" disabled>傳送</button></div>
            <p class="home-service-panel__status">互動介面準備中，目前不會送出資料。</p>
          </template>
          <template v-else-if="props.activePanel === 'quick-service'">
            <p class="home-service-panel__intro">您好！<br>我可以幫您：</p>
            <div class="home-service-panel__actions home-service-panel__actions--grid"><button v-for="action in quickServiceActions" :key="action.id" type="button" :disabled="!action.enabled" @click="handleQuickServiceAction(action)">{{ action.label }}</button></div>
            <p class="home-service-panel__status">「尋找優惠」將於正式活動資料完成後開放。</p>
          </template>
          <template v-else-if="consultationStep === 'selection'">
            <p class="home-service-panel__intro">您好！<br>請選擇您需要的服務：</p>
            <fieldset class="human-service-categories">
              <legend>服務類別 <small>可複選</small></legend>
              <button v-for="service in humanServiceOptions" :key="service.id" type="button" :class="{ 'is-selected': selectedServices.includes(service.id) }" :aria-pressed="selectedServices.includes(service.id)" @click="toggleHumanService(service.id)">{{ service.label }}</button>
            </fieldset>
            <p v-if="serviceValidation" id="human-service-error" class="human-consultation-error" role="alert">{{ serviceValidation }}</p>
            <div class="human-contact-actions" aria-label="聯絡方式">
              <a :href="publicContact.consultationPhoneHref" :aria-disabled="!publicContact.consultationPhoneHref" :tabindex="publicContact.consultationPhoneHref ? undefined : -1">直接撥打</a>
              <button type="button" :aria-describedby="serviceValidation ? 'human-service-error' : undefined" @click="openCallbackForm">請與我聯絡</button>
            </div>
          </template>
          <template v-else-if="consultationStep === 'callback'">
            <p class="home-service-panel__intro">請留下聯絡資料</p>
            <div class="human-selected-services" aria-label="已選需求">
              <strong>已選需求：</strong><span v-for="service in selectedServiceOptions" :key="service.id">{{ service.label }}</span>
            </div>
            <form class="human-callback-form" novalidate @submit.prevent="submitCallbackRequest">
              <label for="human-callback-name">姓名</label>
              <input id="human-callback-name" v-model="callbackName" type="text" maxlength="80" autocomplete="name" :aria-invalid="Boolean(nameValidation)" :aria-describedby="nameValidation ? 'human-callback-name-error' : undefined">
              <p v-if="nameValidation" id="human-callback-name-error" class="human-consultation-error">{{ nameValidation }}</p>
              <label for="human-callback-phone">電話</label>
              <input id="human-callback-phone" v-model="callbackPhone" type="tel" maxlength="24" autocomplete="tel" inputmode="tel" :aria-invalid="Boolean(phoneValidation)" :aria-describedby="phoneValidation ? 'human-callback-phone-error' : undefined">
              <p v-if="phoneValidation" id="human-callback-phone-error" class="human-consultation-error">{{ phoneValidation }}</p>
              <div class="human-callback-form__actions"><button type="button" @click="returnToSelection">返回</button><button type="submit" class="is-primary">送出需求</button></div>
            </form>
          </template>
          <template v-else>
            <div class="human-consultation-complete" role="status">
              <h3>聯絡資料填寫完成</h3>
              <p>已選服務：{{ selectedServiceOptions.map(({ label }) => label).join('、') }}</p>
              <p>正式送出功能將於後續版本串接。</p>
              <button type="button" @click="finishConsultation">返回</button>
            </div>
          </template>
        </div>
      </section>
    </Transition>
  </div>
</template>
