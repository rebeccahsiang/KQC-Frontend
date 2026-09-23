<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import footerLogo from '@/assets/images/brand/kqj-footer-logo-gold.png'
const expanded = ref(true)
const email = 'service@kqj.com.tw'
const phone = '(03) 275-5094'
const phoneHref = 'tel:032755094'
const address = '333011 桃園市龜山區文化一路10巷7號2樓'
const serviceHours = '週一至週五，早上9點至下午5點'
</script>
<template>
  <footer class="public-footer" :class="{ 'public-footer--compact': !expanded }">
    <div class="public-footer__inner">
      <div class="public-footer__main">
        <section class="public-footer__brand" aria-label="KQJ 三瑝資訊">
          <div class="public-footer__identity"><img class="public-footer__logo" :src="footerLogo" alt="KQJ 三瑝資訊" /><div><strong class="public-footer__wordmark">KQJ</strong><strong class="public-footer__company">三瑝資訊</strong><p v-if="expanded">智慧運輸與資產交易平台</p></div></div>
        </section>
        <span class="public-footer__divider" aria-hidden="true"></span>
        <section v-if="expanded" class="public-footer__contact" aria-label="聯絡資訊">
          <a :href="`mailto:${email}`"><Icon icon="lucide:mail" aria-hidden="true" /><span><b>Email</b>{{ email }}</span></a>
          <a :href="phoneHref"><Icon icon="lucide:phone" aria-hidden="true" /><span><b>電話</b>{{ phone }}</span></a>
          <span><Icon icon="lucide:map-pin" aria-hidden="true" /><span><b>地址</b>{{ address }}</span></span>
          <span><Icon icon="lucide:clock-3" aria-hidden="true" /><span><b>服務時間</b>{{ serviceHours }}</span></span>
        </section>
      </div>
      <div v-if="expanded" class="public-footer__utility">
        <small class="public-footer__copyright">© 2026 三瑝資訊／KQJ. All Rights Reserved.</small>
        <nav class="public-footer__legal" aria-label="法律資訊"><span>隱私政策</span><span>使用條款</span></nav>
        <div class="public-footer__social" aria-label="社群連結">
          <a href="https://www.facebook.com/KQJTW" target="_blank" rel="noopener noreferrer" aria-label="KQJ Facebook"><Icon icon="lucide:facebook" aria-hidden="true" /></a>
          <a href="https://line.me/R/ti/p/@326msffc?from=page&amp;searchId=326msffc" target="_blank" rel="noopener noreferrer" aria-label="KQJ LINE 官方帳號"><Icon icon="lucide:message-circle" aria-hidden="true" /></a>
          <a href="https://www.instagram.com/kqj_tw/" target="_blank" rel="noopener noreferrer" aria-label="KQJ Instagram"><Icon icon="lucide:instagram" aria-hidden="true" /></a>
        </div>
      </div>
      <button type="button" class="public-footer__toggle" :aria-expanded="expanded" :aria-label="expanded ? '收合 Footer' : '展開 Footer'" :title="expanded ? '收合 Footer' : '展開 Footer'" @click="expanded = !expanded"><Icon :icon="expanded ? 'lucide:chevrons-down' : 'lucide:chevrons-up'" aria-hidden="true" /></button>
    </div>
  </footer>
</template>
<style scoped lang="scss">
.public-footer { margin-top:auto; background:#f8fafc; color:#334155; }
.public-footer__inner { position:relative; width:min(100% - 2rem,80rem); margin:0 auto; padding:.7rem 3.5rem .3rem 0; }
.public-footer--compact .public-footer__inner { padding-block:.55rem; }
.public-footer__main { display:grid; grid-template-columns:minmax(18rem,1fr) 1px minmax(24rem,1.2fr); align-items:center; gap:1.25rem; }
.public-footer__identity { display:flex; align-items:center; justify-content:center; gap:1rem; }
.public-footer__logo { width:5.75rem; height:auto; display:block; flex:0 0 auto; }
.public-footer__wordmark { display:block; color:#f2c94c; font-size:1.7rem; line-height:1; letter-spacing:.04em; }
.public-footer__company { display:block; margin-top:.25rem; color:#172b43; font-size:1.15rem; }
.public-footer__brand p { margin:.35rem 0 0; color:#475569; font-size:var(--public-type-body-small,.8rem); }
.public-footer__divider { align-self:stretch; width:1px; background:rgba(234,179,8,.45); }
.public-footer__contact { display:grid; grid-auto-rows:max-content; align-self:center; align-content:start; gap:.1rem; font-size:.85rem; }
.public-footer__contact a,.public-footer__contact > span { display:flex; align-items:flex-start; gap:.65rem; margin:0; padding:0; min-height:0; color:#1f2937; text-decoration:none; line-height:1.22; } .public-footer__contact a > span,.public-footer__contact > span > span { color:#1f2937; }
.public-footer__contact svg { width:1rem; height:1rem; flex:0 0 auto; margin-top:.15rem; color:#f2c94c; }
.public-footer__contact span span { display:block; min-width:0; }
.public-footer__contact b { display:inline-block; min-width:5rem; margin-right:.4rem; color:#64748b; font-size:.8rem; font-weight:700; }
.public-footer__utility { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); align-items:center; gap:1rem; margin-top:.35rem; padding-top:.35rem; color:#64748b; font-size:.72rem; line-height:1.25; }
.public-footer__utility small { justify-self:start; } .public-footer__copyright { margin:0; font-size:inherit; line-height:inherit; font-weight:inherit; }

.public-footer__legal,.public-footer__social { display:flex; align-items:center; gap:.6rem; } .public-footer__legal { justify-self:center; } .public-footer__legal span { flex:0 0 auto; white-space:nowrap; }
.public-footer__social a { display:inline-grid; width:1.75rem; height:1.75rem; place-items:center; color:#334155; text-decoration:none; } .public-footer__social a:focus-visible { outline:2px solid #b8860b; outline-offset:3px; } .public-footer__legal span { color:#334155; }
.public-footer__social { justify-self:end; margin-right:2rem; } .public-footer__social svg { width:.82rem; height:.82rem; }
.public-footer__legal span:hover,.public-footer__social a:hover { border-color:#f2c94c; color:#f2c94c; }
.public-footer__toggle { position:absolute; top:.65rem; right:0; display:grid; width:2.75rem; height:2.75rem; place-items:center; border:1px solid rgba(226,232,240,.3); border-radius:.5rem; background:#ffffff; color:#334155; cursor:pointer; }
.public-footer__toggle:hover,.public-footer__toggle:focus-visible { border-color:#f2c94c; color:#f2c94c; }
.public-footer__contact svg { color:#b8860b; }
[data-theme="dark"] .public-footer { background:#111827; color:#e5e7eb; border-top-color:rgba(234,179,8,.35); }
[data-theme="dark"] .public-footer__company { color:#f8fafc; }
[data-theme="dark"] .public-footer__brand p { color:#cbd5e1; }
[data-theme="dark"] .public-footer__contact a,.public-footer__contact > span,[data-theme="dark"] .public-footer__contact a > span,[data-theme="dark"] .public-footer__contact > span > span { color:#f8fafc; }
[data-theme="dark"] .public-footer__contact b { color:#94a3b8; }
[data-theme="dark"] .public-footer__utility { color:#94a3b8; }
[data-theme="dark"] .public-footer__social a { color:#e5e7eb; } [data-theme="dark"] .public-footer__legal span { color:#e5e7eb; }
[data-theme="dark"] .public-footer__toggle { background:#1f2937; color:#f8fafc; border-color:rgba(226,232,240,.3); }
@media (max-width:1024px) and (min-width:641px) { .public-footer__main { grid-template-columns:minmax(14rem,1fr) 1px minmax(20rem,1.2fr); gap:1rem; } .public-footer__logo { width:4.75rem; } }
@media (max-width:640px) { .public-footer__contact,.public-footer__utility { font-size:.8rem; } .public-footer__main { display:flex; align-items:flex-start; flex-direction:column; gap:1rem; } .public-footer__divider { width:100%; min-height:1px; height:1px; } .public-footer__contact { width:100%; } .public-footer__utility { display:flex; align-items:flex-start; flex-direction:column; } .public-footer__legal,.public-footer__social { justify-self:auto; } .public-footer__social { margin-right:0; } .public-footer__utility small { margin-right:0; } }
@media (prefers-reduced-motion:reduce) { .public-footer { transition:none; } }
</style>`n
