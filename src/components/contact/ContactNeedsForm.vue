<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { ContactQuestion } from '@/config/contactServices'

defineProps<{ questions: readonly ContactQuestion[]; answers: Record<string, string>; errors: Record<string, string> }>()
const emit = defineEmits<{ update: [key: string, value: string]; back: []; complete: [] }>()
</script>

<template>
  <section aria-labelledby="contact-needs-title">
    <header class="step-heading"><p>STEP 3</p><h2 id="contact-needs-title">告訴我們您的需求</h2><span>以下問題依您選擇的服務產生，可回上一步調整。</span></header>
    <div class="needs-grid">
      <label v-for="question in questions" :key="question.key" :class="{ wide: question.type === 'textarea' }">{{ question.label }}<span v-if="question.required" aria-hidden="true">*</span>
        <select v-if="question.type === 'select'" :value="answers[question.key] || ''" :aria-invalid="Boolean(errors[question.key])" @change="emit('update',question.key,($event.target as HTMLSelectElement).value)"><option value="">請選擇</option><option v-for="option in question.options" :key="option">{{ option }}</option></select>
        <textarea v-else-if="question.type === 'textarea'" :value="answers[question.key] || ''" rows="4" :maxlength="question.maxlength" :aria-invalid="Boolean(errors[question.key])" @input="emit('update',question.key,($event.target as HTMLTextAreaElement).value)"></textarea>
        <input v-else :type="question.type" :value="answers[question.key] || ''" :min="question.type === 'number' ? 1 : undefined" :aria-invalid="Boolean(errors[question.key])" @input="emit('update',question.key,($event.target as HTMLInputElement).value)">
        <small v-if="question.maxlength && question.type === 'textarea'">{{ (answers[question.key] || '').length }} / {{ question.maxlength }}</small><small v-if="errors[question.key]" class="error">{{ errors[question.key] }}</small>
      </label>
    </div>
    <footer><button type="button" class="secondary" @click="emit('back')"><Icon icon="lucide:arrow-left" aria-hidden="true" />上一步</button><button type="button" class="primary" @click="emit('complete')">確認內容 <Icon icon="lucide:check" aria-hidden="true" /></button></footer>
  </section>
</template>

<style scoped lang="scss">
.step-heading p{margin:0;color:#a0781d;font-size:.75rem;font-weight:900;letter-spacing:.13em}.step-heading h2{margin:.3rem 0;color:#172b43;font-size:1.65rem}.step-heading span{color:#68788b;font-size:.96rem;line-height:1.6}.needs-grid{display:grid;margin-top:1.35rem;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.needs-grid label{display:grid;gap:.4rem;color:#405369;font-size:.96rem;font-weight:750}.needs-grid label>span{color:#b42318}.needs-grid .wide{grid-column:1/-1}input,select,textarea{width:100%;min-height:2.9rem;padding:.65rem .75rem;box-sizing:border-box;border:1px solid #ccd8df;border-radius:.5rem;color:#24374e;background:#fff;font:inherit;font-size:1rem}textarea{resize:vertical}input:focus-visible,select:focus-visible,textarea:focus-visible,button:focus-visible{outline:3px solid rgba(36,113,136,.26);outline-offset:2px}small{color:#7a8795;font-size:.88rem;font-weight:500;text-align:right}.error{color:#b42318;text-align:left}footer{display:flex;margin-top:1.3rem;justify-content:space-between;gap:.7rem}.primary,.secondary{display:inline-flex;min-height:2.9rem;padding:0 1.1rem;align-items:center;justify-content:center;gap:.45rem;border-radius:.55rem;font:inherit;font-size:.95rem;font-weight:800;cursor:pointer}.primary{border:0;color:#fff;background:#174f63}.secondary{border:1px solid #cbd7de;color:#405369;background:#fff}@media(max-width:620px){.needs-grid{grid-template-columns:1fr}.needs-grid .wide{grid-column:auto}footer{flex-direction:column-reverse}.primary,.secondary{width:100%}}
</style>
