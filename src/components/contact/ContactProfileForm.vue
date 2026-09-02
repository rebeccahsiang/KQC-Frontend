<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { ContactProfileData } from '@/config/contactServices'

defineProps<{ profile: ContactProfileData; errors: Record<string, string> }>()
const emit = defineEmits<{ update: [key: keyof ContactProfileData, value: string | boolean]; privacy: []; back: []; next: [] }>()
</script>

<template>
  <section aria-labelledby="contact-profile-title">
    <header class="step-heading"><p>STEP 2</p><h2 id="contact-profile-title">關於您</h2><span>填寫聯絡與公司資訊；登入資料僅協助預填，仍可修改。</span></header>
    <div class="profile-grid">
      <label>稱呼<span aria-hidden="true">*</span><select :value="profile.salutation" :aria-invalid="Boolean(errors.salutation)" @change="emit('update','salutation',($event.target as HTMLSelectElement).value)"><option value="">請選擇</option><option>先生</option><option>女士</option><option>其他</option></select><small v-if="errors.salutation">{{ errors.salutation }}</small></label>
      <label>姓名<span aria-hidden="true">*</span><input :value="profile.name" autocomplete="name" :aria-invalid="Boolean(errors.name)" @input="emit('update','name',($event.target as HTMLInputElement).value)"><small v-if="errors.name">{{ errors.name }}</small></label>
      <label>公司名稱／個人<input :value="profile.companyName" autocomplete="organization" @input="emit('update','companyName',($event.target as HTMLInputElement).value)"></label>
      <label>職稱<input :value="profile.jobTitle" autocomplete="organization-title" @input="emit('update','jobTitle',($event.target as HTMLInputElement).value)"></label>
      <label>手機<span aria-hidden="true">*</span><input :value="profile.mobile" inputmode="tel" autocomplete="tel" :aria-invalid="Boolean(errors.mobile)" @input="emit('update','mobile',($event.target as HTMLInputElement).value)"><small v-if="errors.mobile">{{ errors.mobile }}</small></label>
      <label>Email<input :value="profile.email" type="email" autocomplete="email" :aria-invalid="Boolean(errors.email)" @input="emit('update','email',($event.target as HTMLInputElement).value)"><small v-if="errors.email">{{ errors.email }}</small></label>
      <label class="wide">LINE ID<input :value="profile.lineId" autocomplete="off" @input="emit('update','lineId',($event.target as HTMLInputElement).value)"></label>
    </div>
    <div class="consent"><input id="contact-privacy-consent" type="checkbox" :checked="profile.privacyAccepted" :aria-invalid="Boolean(errors.privacyAccepted)" @change="emit('update','privacyAccepted',($event.target as HTMLInputElement).checked)"><span><label for="contact-privacy-consent">我已閱讀並同意</label><button type="button" @click="emit('privacy')">個人資料蒐集與聯繫使用說明</button><small v-if="errors.privacyAccepted">{{ errors.privacyAccepted }}</small></span></div>
    <footer><button type="button" class="secondary" @click="emit('back')"><Icon icon="lucide:arrow-left" aria-hidden="true" />上一步</button><button type="button" class="primary" @click="emit('next')">下一步：需求內容 <Icon icon="lucide:arrow-right" aria-hidden="true" /></button></footer>
  </section>
</template>

<style scoped lang="scss">
.step-heading p{margin:0;color:#a0781d;font-size:.75rem;font-weight:900;letter-spacing:.13em}.step-heading h2{margin:.3rem 0;color:#172b43;font-size:1.65rem}.step-heading span{color:#68788b;font-size:.96rem;line-height:1.6}.profile-grid{display:grid;margin-top:1.35rem;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.profile-grid label{display:grid;gap:.4rem;color:#405369;font-size:.96rem;font-weight:750}.profile-grid label>span{color:#b42318}.profile-grid .wide{grid-column:1/-1}input,select{width:100%;min-height:2.9rem;padding:.65rem .75rem;box-sizing:border-box;border:1px solid #ccd8df;border-radius:.5rem;color:#24374e;background:#fff;font:inherit;font-size:1rem}input:focus-visible,select:focus-visible,button:focus-visible{outline:3px solid rgba(36,113,136,.26);outline-offset:2px}small{color:#b42318;font-size:.88rem;font-weight:500}.consent{display:flex;margin-top:1.1rem;align-items:flex-start;gap:.6rem;color:#526378;font-size:.95rem;line-height:1.6}.consent input{width:1.1rem;min-height:auto;margin-top:.2rem}.consent>span{min-width:0}.consent label{font-weight:500}.consent button{padding:0;border:0;color:#17657b;background:transparent;font:inherit;font-weight:800;text-align:left;text-decoration:underline;text-underline-offset:.15rem;cursor:pointer}.consent small{display:block}footer{display:flex;margin-top:1.3rem;justify-content:space-between;gap:.7rem}.primary,.secondary{display:inline-flex;min-height:2.9rem;padding:0 1.1rem;align-items:center;justify-content:center;gap:.45rem;border-radius:.55rem;font:inherit;font-size:.95rem;font-weight:800;cursor:pointer}.primary{border:0;color:#fff;background:#174f63}.secondary{border:1px solid #cbd7de;color:#405369;background:#fff}@media(max-width:620px){.profile-grid{grid-template-columns:1fr}.profile-grid .wide{grid-column:auto}footer{flex-direction:column-reverse}.primary,.secondary{width:100%}}
</style>
