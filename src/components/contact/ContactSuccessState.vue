<script setup lang="ts">
import { Icon } from '@iconify/vue'
defineProps<{ inquiryNo: string }>()
defineEmits<{ line: [] }>()
</script>

<template>
  <!-- CONTACT-R1B-1 — Persisted Success / rendered only after the public API confirms HTTP 201 persistence. -->
  <section class="success-state" role="status" aria-labelledby="contact-success-title"><span><Icon icon="lucide:check" aria-hidden="true" /></span><p>送出完成</p><h2 id="contact-success-title">感謝您的填寫！</h2><div>您的諮詢需求已成功送出，我們將依您提供的聯絡方式與需求內容進行後續聯繫。<strong>諮詢編號：{{ inquiryNo }}</strong></div><nav aria-label="完成後選項"><router-link to="/">返回首頁</router-link><router-link to="/products">繼續瀏覽服務</router-link><button type="button" @click="$emit('line')">加入 LINE 諮詢</button></nav></section>
</template>

<style scoped lang="scss">
.success-state{display:grid;min-height:28rem;padding:2rem;place-items:center;align-content:center;text-align:center}.success-state>span{display:grid;width:4rem;height:4rem;place-items:center;border-radius:50%;color:#fff;background:#20806f}.success-state>span svg{width:2rem;height:2rem}.success-state>p{margin:1rem 0 .25rem;color:#9a741c;font-size:.75rem;font-weight:900;letter-spacing:.12em}.success-state h2{margin:0;color:#172b43;font-size:1.7rem}.success-state>div{margin-top:.65rem;color:#607185;font-size:1rem;line-height:1.7}.success-state>div strong{display:block;margin-top:.4rem;color:#174f63}.success-state nav{display:flex;margin-top:1.3rem;flex-wrap:wrap;justify-content:center;gap:.55rem}.success-state a,.success-state button{display:inline-flex;min-height:2.8rem;padding:0 1rem;align-items:center;border:1px solid #bfd0d8;border-radius:.5rem;color:#174f63;background:#fff;font:inherit;font-size:.95rem;font-weight:800;text-decoration:none;cursor:pointer}.success-state a:first-child{border-color:#174f63;color:#fff;background:#174f63}.success-state :is(a,button):focus-visible{outline:3px solid rgba(36,113,136,.26);outline-offset:2px}@media(max-width:520px){.success-state{padding:1rem}.success-state nav{flex-direction:column}.success-state a,.success-state button{justify-content:center}}
</style>
