<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { CONTACT_SERVICE_PILLARS, type ContactServiceCode } from '@/config/contactServices'

const props = defineProps<{ selected: readonly ContactServiceCode[]; error: string }>()
const emit = defineEmits<{ toggle: [code: ContactServiceCode]; next: [] }>()
const selected = (code: ContactServiceCode) => props.selected.includes(code)
</script>

<template>
  <section aria-labelledby="contact-services-title">
    <header class="step-heading"><p>STEP 1</p><h2 id="contact-services-title">我想諮詢什麼</h2><span>選擇需要的服務類型（最多 5 項）</span></header>
    <div class="pillar-list">
      <section v-for="pillar in CONTACT_SERVICE_PILLARS" :key="pillar.code" class="pillar"><h3><Icon :icon="pillar.icon" aria-hidden="true" />{{ pillar.title }}</h3><div class="service-grid"><button v-for="service in pillar.services" :key="service.code" type="button" :class="{ selected: selected(service.code) }" :aria-pressed="selected(service.code)" @click="emit('toggle', service.code)"><Icon :icon="service.icon" aria-hidden="true" /><span>{{ service.label }}</span><Icon v-if="selected(service.code)" icon="lucide:check" aria-hidden="true" /></button></div></section>
    </div>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <footer><button type="button" class="primary" @click="emit('next')">下一步：關於您 <Icon icon="lucide:arrow-right" aria-hidden="true" /></button></footer>
  </section>
</template>

<style scoped lang="scss">
.step-heading p{margin:0;color:#a0781d;font-size:.75rem;font-weight:900;letter-spacing:.13em}.step-heading h2{margin:.3rem 0;color:#172b43;font-size:1.65rem}.step-heading span{color:#68788b;font-size:.96rem;line-height:1.6}.pillar-list{display:grid;margin-top:1.35rem;gap:1rem}.pillar{padding:1.1rem;border:1px solid #dce5ea;border-radius:.8rem;background:#fff}.pillar h3{display:flex;margin:0 0 .8rem;align-items:center;gap:.55rem;color:#294057;font-size:1rem}.pillar h3 svg{color:#9a741c}.service-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem}.service-grid button{display:flex;min-height:3.35rem;padding:.75rem .85rem;align-items:center;gap:.6rem;border:1px solid #d8e2e8;border-radius:.6rem;color:#526378;background:#f9fbfc;font:inherit;font-size:1rem;line-height:1.45;text-align:left;cursor:pointer}.service-grid button>span{min-width:0;flex:1}.service-grid button>svg{width:1.1rem;height:1.1rem;flex:0 0 auto;color:#247188}.service-grid button.selected{border-color:#247188;color:#174f63;background:#eaf5f7;font-weight:750}.service-grid button:focus-visible,.primary:focus-visible{outline:3px solid rgba(36,113,136,.28);outline-offset:2px}.form-error{color:#b42318;font-size:.94rem}footer{display:flex;margin-top:1.1rem;justify-content:flex-end}.primary{display:inline-flex;min-height:2.9rem;padding:0 1.1rem;align-items:center;gap:.45rem;border:0;border-radius:.55rem;color:#fff;background:#174f63;font:inherit;font-size:.95rem;font-weight:800;cursor:pointer}@media(max-width:560px){.service-grid{grid-template-columns:1fr}.primary{width:100%;justify-content:center}}
</style>
