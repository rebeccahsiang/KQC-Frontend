<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface SupportFeature { icon: string; title: string; description: string }
interface SupportContent { eyebrow: string; heading: string; intro: string; features: readonly SupportFeature[] }
const props = defineProps<{ step: number }>()

// CONTACT-R1A-3 — Step-aware Consultant Support / copy changes without changing Contact workflow authority.
const supportByStep: Record<number, SupportContent> = {
  1: { eyebrow: 'CONSULTANT SUPPORT', heading: '一對一專業顧問諮詢', intro: '由專業顧問理解您的實際需求，協助整理下一步方向，不只是一般留言信箱。', features: [
    { icon: 'lucide:users-round', title: '專業顧問團隊', description: '依服務需求安排合適的溝通方向。' },
    { icon: 'lucide:timer', title: '快速回應機制', description: '可在需求中指定希望聯繫的時程。' },
    { icon: 'lucide:shield-check', title: '資料安全保密', description: '僅蒐集本次聯繫所需的必要資訊。' },
  ] },
  2: { eyebrow: 'CONTACT SUPPORT', heading: '留下方便聯繫的方式', intro: '填寫基本聯絡資訊，讓 KQC 顧問能依您方便的方式與時段進一步聯繫。', features: [
    { icon: 'lucide:phone', title: '電話聯繫', description: '提供手機或聯絡方式，方便顧問後續與您確認需求。' },
    { icon: 'lucide:message-circle', title: 'LINE 官方帳號', description: '也可透過 LINE 與 KQC 保持聯繫。' },
    { icon: 'lucide:shield-check', title: '個資用途透明', description: '聯絡資料僅供本次諮詢與後續聯繫使用。' },
  ] },
  3: { eyebrow: 'CONSULTATION DETAILS', heading: '讓顧問更快掌握需求', intro: '需求描述越清楚，KQC 越能在首次聯繫前整理適合的服務方向。', features: [
    { icon: 'lucide:list-checks', title: '需求重點', description: '說明目前遇到的問題、預計辦理事項或希望達成的目標。' },
    { icon: 'lucide:clock-3', title: '聯繫時程', description: '可填寫希望 KQC 與您聯繫的時間或急迫程度。' },
    { icon: 'lucide:notebook-pen', title: '補充資訊', description: '如有其他背景或特殊需求，可一併提供給顧問參考。' },
  ] },
  4: { eyebrow: 'THANK YOU', heading: '感謝您的諮詢', intro: '您的諮詢需求已成功送出；後續將依您提供的聯絡方式與需求內容進行聯繫。', features: [
    { icon: 'lucide:contact', title: '確認聯絡資訊', description: '如需立即聯繫，也可直接使用電話或 LINE 官方帳號。' },
    { icon: 'lucide:clipboard-check', title: '保留需求摘要', description: '本頁可協助您確認先前填寫的諮詢內容。' },
    { icon: 'lucide:messages-square', title: '直接聯繫 KQC', description: '如有急迫需求，可直接與 KQC 顧問聯繫。' },
  ] },
}
const content = computed(() => supportByStep[props.step] || supportByStep[1])
</script>

<template>
  <aside id="contact-line-support" class="trust-panel" tabindex="-1" aria-labelledby="contact-trust-title">
    <p>{{ content.eyebrow }}</p><h2 id="contact-trust-title">{{ content.heading }}</h2><span>{{ content.intro }}</span>
    <ul><li v-for="feature in content.features" :key="feature.title"><Icon :icon="feature.icon" aria-hidden="true" /><div><strong>{{ feature.title }}</strong><small>{{ feature.description }}</small></div></li></ul>
    <!-- CONTACT-R1A-3 — Official Contact Methods / approved telephone and unchanged LINE QR remain direct alternatives. -->
    <div class="contact-methods">
      <section class="phone-support" aria-labelledby="contact-phone-title"><Icon icon="lucide:phone-call" aria-hidden="true" /><div><strong id="contact-phone-title">電話諮詢</strong><a href="tel:032755094">(03) 275-5094</a><small>需要直接說明需求，也可來電與 KQC 顧問聯繫。</small></div></section>
      <section class="line-support" aria-labelledby="contact-line-title"><div><strong id="contact-line-title">LINE 官方帳號</strong><small>也可掃描 QR Code 與 KQC 聯繫。</small></div><img src="/images/services/kqc-line-official-qr.png" alt="KQC LINE 官方帳號 QR Code"></section>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.trust-panel{position:sticky;top:6.5rem;display:grid;padding:1.5rem;gap:.75rem;border-radius:1rem;color:#fff;background:linear-gradient(145deg,#152c42,#1b5b69);box-shadow:0 16px 35px rgba(15,43,58,.14)}.trust-panel>p{margin:0;color:#e2bd5d;font-size:.75rem;font-weight:900;letter-spacing:.13em}.trust-panel h2{margin:0;color:#fff;font-size:1.4rem}.trust-panel>span{color:#e0edf1;font-size:1rem;line-height:1.7}.trust-panel ul{display:grid;margin:.75rem 0;padding:0;gap:1rem;list-style:none}.trust-panel li{display:flex;gap:.7rem}.trust-panel li>svg{width:1.25rem;height:1.25rem;flex:0 0 auto;color:#e2bd5d}.trust-panel li div{display:grid;gap:.2rem}.trust-panel li strong{color:#fff;font-size:1rem}.trust-panel li small{color:#d5e5ea;font-size:.94rem;line-height:1.55}.contact-methods{display:grid;gap:.65rem}.phone-support,.line-support{border-radius:.7rem;background:#fff}.phone-support{display:flex;padding:1rem;align-items:flex-start;gap:.7rem;color:#1d3449}.phone-support>svg{width:1.3rem;height:1.3rem;flex:0 0 auto;color:#247188}.phone-support div{display:grid;gap:.2rem}.phone-support strong,.line-support strong{color:#1d3449;font-size:1rem}.phone-support a{width:max-content;color:#17657b;font-size:1.15rem;font-weight:850;text-decoration:none}.phone-support small,.line-support small{color:#68788b;font-size:.9rem;line-height:1.5}.phone-support a:focus-visible{outline:3px solid rgba(36,113,136,.3);outline-offset:3px}.line-support{display:flex;padding:1rem;align-items:center;justify-content:space-between;gap:.75rem;color:#1d3449}.line-support div{display:grid;gap:.25rem}.line-support img{width:7rem;height:7rem;object-fit:contain}@media(max-width:900px){.trust-panel{position:static}.contact-methods{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}@media(max-width:600px){.contact-methods{grid-template-columns:1fr}}@media(max-width:480px){.line-support{align-items:flex-start;flex-direction:column}.line-support img{align-self:center}}
</style>
