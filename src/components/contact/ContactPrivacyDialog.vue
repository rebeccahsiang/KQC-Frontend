<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null

// CONTACT-R1A-3 — Privacy Explanation Dialog / informational access remains independent from explicit consent.
const close = () => emit('close')
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') { event.preventDefault(); close(); return }
  if (event.key !== 'Tab' || !dialog.value) return
  const controls = [...dialog.value.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')]
  if (!controls.length) return
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
onMounted(() => { void nextTick(() => closeButton.value?.focus()) })
onBeforeUnmount(() => previousFocus?.focus())
</script>

<template>
  <div class="privacy-overlay" @click.self="close" @keydown="handleKeydown">
    <section ref="dialog" class="privacy-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-privacy-title" aria-describedby="contact-privacy-intro">
      <header><div><p>CONTACT PRIVACY</p><h2 id="contact-privacy-title">個人資料蒐集與聯繫使用說明</h2></div><button ref="closeButton" type="button" aria-label="關閉個人資料說明" @click="close"><Icon icon="lucide:x" aria-hidden="true" /></button></header>
      <div class="privacy-dialog__body">
        <p id="contact-privacy-intro">為協助 KQC 顧問了解您的諮詢需求並進行後續聯繫，本頁將蒐集您主動提供的基本聯絡資料與需求內容。</p>
        <section><h3>蒐集目的</h3><p>用於本次服務諮詢、需求確認及後續聯繫。</p></section>
        <section><h3>可能蒐集的資料</h3><p>稱呼、姓名、公司名稱／個人、職稱、手機、Email、LINE ID，以及您主動填寫的需求內容。</p></section>
        <section><h3>使用方式</h3><p>KQC 僅於處理本次諮詢與必要後續聯繫範圍內使用。</p></section>
        <section><h3>您的選擇</h3><p>若您不同意本說明，可不提供資料並停止本次線上諮詢流程，也可直接透過公開聯絡方式洽詢 KQC。</p></section>
        <section><h3>聯繫方式</h3><p>電話：<a href="tel:032755094">(03) 275-5094</a><br>並可透過 LINE 官方帳號聯繫。</p></section>
      </div>
      <footer><button type="button" @click="close">關閉</button></footer>
    </section>
  </div>
</template>

<style scoped lang="scss">
.privacy-overlay{position:fixed;inset:0;z-index:1400;display:grid;padding:1rem;place-items:center;background:rgba(11,25,39,.68);backdrop-filter:blur(3px)}.privacy-dialog{display:grid;width:min(42rem,100%);max-height:calc(100dvh - 2rem);overflow:hidden;border-radius:1rem;color:#2d4055;background:#fff;box-shadow:0 24px 60px rgba(10,25,39,.32)}.privacy-dialog>header{display:flex;padding:1.2rem 1.35rem;align-items:flex-start;justify-content:space-between;gap:1rem;border-bottom:1px solid #dce5ea}.privacy-dialog header p{margin:0;color:#98721c;font-size:.75rem;font-weight:900;letter-spacing:.12em}.privacy-dialog h2{margin:.25rem 0 0;color:#172b43;font-size:1.45rem}.privacy-dialog header button{display:grid;width:2.5rem;height:2.5rem;flex:0 0 auto;place-items:center;border:0;border-radius:.5rem;color:#405369;background:#edf2f4;cursor:pointer}.privacy-dialog__body{padding:1.2rem 1.35rem;overflow-y:auto;font-size:1rem;line-height:1.7}.privacy-dialog__body>p{margin:0 0 1rem}.privacy-dialog__body section{margin-top:1rem}.privacy-dialog__body h3{margin:0 0 .25rem;color:#1c5265;font-size:1rem}.privacy-dialog__body p{margin:0;color:#596c80}.privacy-dialog__body a{color:#17657b;font-weight:800}.privacy-dialog footer{display:flex;padding:1rem 1.35rem;justify-content:flex-end;border-top:1px solid #dce5ea}.privacy-dialog footer button{min-height:2.8rem;padding:0 1.2rem;border:0;border-radius:.55rem;color:#fff;background:#174f63;font:inherit;font-weight:800;cursor:pointer}.privacy-dialog button:focus-visible,.privacy-dialog a:focus-visible{outline:3px solid rgba(36,113,136,.3);outline-offset:2px}@media(max-width:560px){.privacy-overlay{padding:.6rem}.privacy-dialog{max-height:calc(100dvh - 1.2rem)}.privacy-dialog>header,.privacy-dialog__body,.privacy-dialog footer{padding-left:1rem;padding-right:1rem}.privacy-dialog h2{font-size:1.25rem}.privacy-dialog footer button{width:100%}}
</style>
