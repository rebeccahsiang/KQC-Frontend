<script setup lang="ts">
import { nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { PublicMarketplaceCase } from '@/api/publicMarketplace'

const props = defineProps<{ visible: boolean; caseData: PublicMarketplaceCase | null }>()
const emit = defineEmits<{ close: [] }>()
const dialogRef = ref<HTMLElement | null>(null)
const submitted = ref(false)
const errors = reactive<Record<string, string>>({})
const form = reactive({ salutation: '', name: '', companyName: '', phone: '', email: '', lineId: '', note: '', consent: false })
let previousFocusedElement: HTMLElement | null = null

const reset = () => {
  Object.assign(form, { salutation: '', name: '', companyName: '', phone: '', email: '', lineId: '', note: '', consent: false })
  Object.keys(errors).forEach((key) => delete errors[key])
  submitted.value = false
}
const close = () => emit('close')
const validate = () => {
  Object.keys(errors).forEach((key) => delete errors[key])
  if (!form.salutation) errors.salutation = '請選擇稱呼。'
  if (!form.name.trim()) errors.name = '請填寫姓名。'
  if (!form.phone.trim()) errors.phone = '請填寫手機號碼。'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = '請填寫有效的電子郵件。'
  if (!form.consent) errors.consent = '請同意個人資料使用說明。'
  return !Object.keys(errors).length
}

/* PRODUCT-SHOWCASE-UI-R3F — Presentation Submission Boundary / 本階段為前端流程展示，不會送出資料或建立 CRM 紀錄。 */
const submit = () => { if (validate()) submitted.value = true }
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) { close(); return }
  if (event.key !== 'Tab' || !dialogRef.value) return
  const focusable = [...dialogRef.value.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')]
  if (!focusable.length) return
  const [first] = focusable
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

watch(() => props.visible, async (visible) => {
  if (visible) {
    previousFocusedElement = document.activeElement as HTMLElement | null
    reset()
    document.addEventListener('keydown', handleKeydown)
    await nextTick(); dialogRef.value?.focus()
  } else {
    document.removeEventListener('keydown', handleKeydown)
    previousFocusedElement?.focus()
  }
})
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="visible && caseData" class="intent-overlay" @click.self="close">
      <section ref="dialogRef" class="intent-modal" :class="caseData.transactionType === 'BUY' ? 'intent-modal--buy' : 'intent-modal--sell'" role="dialog" aria-modal="true" aria-labelledby="marketplace-intent-title" tabindex="-1">
        <header><div><span>{{ caseData.transactionType === 'BUY' ? '提供合適標的' : '洽詢公開案件' }}</span><h2 id="marketplace-intent-title">{{ submitted ? '感謝您的填寫' : (caseData.transactionType === 'BUY' ? '我有合適的標的' : '我有興趣') }}</h2></div><button type="button" aria-label="關閉媒合需求表單" @click="close"><Icon icon="lucide:x" /></button></header>

        <div class="source-case"><span>來源案件</span><strong>{{ caseData.title }}</strong><small>{{ caseData.caseId }} · {{ caseData.transactionType }}</small></div>

        <!-- PRODUCT-SHOWCASE-UI-R3 — Marketplace Intent Form / one reusable accessible form carries canonical source context. -->
        <form v-if="!submitted" novalidate @submit.prevent="submit">
          <!-- PRODUCT-SHOWCASE-UI-R3F-1 — Consent Clearance / scroll content reserves the sticky action surface plus a visible gap. -->
          <div class="intent-form-content">
            <div class="form-grid">
              <!-- PRODUCT-SHOWCASE-UI-R3E — Compact Intent Form / paired desktop fields collapse to one comfortable mobile column. -->
              <label class="form-field" for="intent-salutation"><span>稱呼 *</span><select id="intent-salutation" v-model="form.salutation" required :aria-invalid="Boolean(errors.salutation)" aria-describedby="intent-salutation-error"><option value="" disabled>請選擇</option><option>先生</option><option>女士</option><option>其他</option></select><small id="intent-salutation-error" class="field-error" role="alert">{{ errors.salutation }}</small></label>
              <label class="form-field" for="intent-name"><span>姓名 *</span><input id="intent-name" v-model="form.name" required autocomplete="name" :aria-invalid="Boolean(errors.name)" aria-describedby="intent-name-error" /><small id="intent-name-error" class="field-error" role="alert">{{ errors.name }}</small></label>
              <label class="form-field" for="intent-company"><span>公司名稱</span><input id="intent-company" v-model="form.companyName" autocomplete="organization" /></label>
              <label class="form-field" for="intent-phone"><span>手機號碼 *</span><input id="intent-phone" v-model="form.phone" type="tel" required autocomplete="tel" :aria-invalid="Boolean(errors.phone)" aria-describedby="intent-phone-error" /><small id="intent-phone-error" class="field-error" role="alert">{{ errors.phone }}</small></label>
              <label class="form-field" for="intent-email"><span>電子郵件</span><input id="intent-email" v-model="form.email" type="email" autocomplete="email" :aria-invalid="Boolean(errors.email)" aria-describedby="intent-email-error" /><small id="intent-email-error" class="field-error" role="alert">{{ errors.email }}</small></label>
              <label class="form-field" for="intent-line"><span>LINE ID</span><input id="intent-line" v-model="form.lineId" autocomplete="off" /></label>
              <label class="form-field form-field--wide" for="intent-note"><span>需求補充說明</span><textarea id="intent-note" v-model="form.note" maxlength="300" rows="3" /><small class="character-count">{{ form.note.length }} / 300</small></label>
            </div>
            <label class="consent-field"><input v-model="form.consent" type="checkbox" required :aria-invalid="Boolean(errors.consent)" aria-describedby="intent-consent-error" /><span>我已閱讀並同意個人資料蒐集與聯繫使用說明。</span></label><small id="intent-consent-error" class="field-error" role="alert">{{ errors.consent }}</small>
          </div>
          <footer><button type="button" class="secondary" @click="close">取消</button><button type="submit" class="primary">確認送出</button></footer>
        </form>

        <!-- PRODUCT-SHOWCASE-UI-R3 — Intent Success Presentation / explicit demo completion without fabricated persistence. -->
        <div v-else class="success-state" role="status"><Icon icon="lucide:circle-check-big" /><h3>感謝您的填寫</h3><p>我們已完成本次需求展示。正式服務上線後，資料將依保密原則交由專人聯繫並提供媒合服務。</p><ul><li>資料保密</li><li>專人聯繫</li><li>媒合服務</li></ul><button type="button" class="primary" @click="close">返回商品櫥窗</button></div>
      </section>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.intent-overlay { position: fixed; inset: 0; z-index: 1200; display: grid; padding: 1rem; place-items: center; background: rgba(15,23,42,.68); backdrop-filter: blur(4px); }.intent-modal { --intent-accent: #a66f0a; --intent-soft: #fff7df; --intent-footer-clearance: 4.75rem; width: min(48rem, 100%); max-height: calc(100dvh - 2rem); overflow-y: auto; scroll-padding-bottom: calc(var(--intent-footer-clearance) + .75rem); border-radius: 1rem; color: #26364a; background: #fff; box-shadow: 0 24px 60px rgba(15,23,42,.3); }.intent-modal--buy { --intent-accent: #256e86; --intent-soft: #e9f6f8; }.intent-modal > header { display: flex; padding: .9rem 1.15rem; align-items: flex-start; justify-content: space-between; gap: 1rem; border-bottom: 1px solid #e2e8f0; }.intent-modal header span { color: var(--intent-accent); font-size: .68rem; font-weight: 850; letter-spacing: .08em; }.intent-modal h2 { margin: .15rem 0 0; font-size: 1.3rem; }.intent-modal header button { display: grid; width: 2.2rem; height: 2.2rem; place-items: center; border: 0; border-radius: .45rem; color: #536175; background: #eef2f5; cursor: pointer; }.source-case { display: flex; margin: .75rem 1.15rem 0; padding: .6rem .75rem; flex-direction: column; gap: .15rem; border-left: 3px solid var(--intent-accent); background: var(--intent-soft); }.source-case span, .source-case small { color: #64748b; font-size: .68rem; }.source-case strong { color: #172033; font-size: .86rem; }form { padding: .8rem 1.15rem 0; }.intent-form-content { padding-bottom: calc(var(--intent-footer-clearance) + .75rem); }.form-grid { display: grid; align-items: start; grid-template-columns: repeat(2, minmax(0,1fr)); gap: .6rem .9rem; }.form-field { display: flex; min-width: 0; flex-direction: column; gap: .25rem; color: #34465b; font-size: .78rem; font-weight: 700; }.form-field--wide { grid-column: 1 / -1; }.form-grid input, .form-grid select, .form-grid textarea { width: 100%; min-height: 2.45rem; padding: .48rem .62rem; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: .45rem; color: #26364a; background: #fff; font: inherit; }.form-grid textarea { resize: vertical; }.field-error { display: block; min-height: 1em; color: #b42318; font-size: .66rem; font-weight: 500; }.character-count { display: block; color: #7b8795; font-size: .65rem; font-weight: 500; text-align: right; }.consent-field { display: flex; margin-top: .65rem; align-items: flex-start; gap: .55rem; font-size: .76rem; line-height: 1.45; }.consent-field input { margin-top: .15rem; }.intent-modal footer { position: sticky; bottom: 0; z-index: 2; display: flex; margin: calc(0rem - var(--intent-footer-clearance)) -1.15rem 0; padding: .75rem 1.15rem 1rem; justify-content: flex-end; gap: .65rem; border-top: 1px solid #e2e8f0; background: rgba(255,255,255,.97); box-shadow: 0 -8px 18px rgba(15,23,42,.045); }.intent-modal button { font: inherit; }.primary, .secondary { min-height: 2.4rem; padding: 0 1rem; border-radius: .45rem; font-weight: 800; cursor: pointer; }.primary { border: 1px solid var(--intent-accent); color: #fff; background: var(--intent-accent); }.secondary { border: 1px solid #cbd5e1; color: #405367; background: #fff; }.intent-modal button:focus-visible, .intent-modal input:focus-visible, .intent-modal select:focus-visible, .intent-modal textarea:focus-visible { outline: 3px solid color-mix(in srgb, var(--intent-accent) 32%, transparent); outline-offset: 2px; }.success-state { display: flex; padding: 2rem 1.25rem; align-items: center; flex-direction: column; text-align: center; }.success-state > svg { width: 3rem; height: 3rem; color: #16835d; }.success-state h3 { margin: .75rem 0 .3rem; }.success-state p { max-width: 34rem; color: #64748b; line-height: 1.7; }.success-state ul { display: flex; margin: .5rem 0 1.2rem; padding: 0; gap: .5rem; list-style: none; }.success-state li { padding: .35rem .65rem; border-radius: 999px; color: #17664d; background: #e9f8f1; font-size: .72rem; font-weight: 750; }
@media (max-width: 600px) { .intent-overlay { padding: .6rem; }.intent-modal { --intent-footer-clearance: 8rem; max-height: calc(100dvh - 1.2rem); }.form-grid { grid-template-columns: 1fr; gap: .55rem; }.form-field--wide { grid-column: auto; }.form-grid input, .form-grid select { min-height: 2.75rem; }.success-state ul { flex-direction: column; }.intent-modal footer { align-items: stretch; flex-direction: column-reverse; }.primary, .secondary { width: 100%; min-height: 2.75rem; } }
@media (prefers-reduced-motion: reduce) { .intent-overlay { scroll-behavior: auto; } }
</style>
