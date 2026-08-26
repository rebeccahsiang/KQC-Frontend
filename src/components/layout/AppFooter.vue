<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
const expanded = ref(true)
</script>

<template>
  <footer class="public-footer" :class="{ 'public-footer--compact': !expanded }">
    <div class="public-footer__inner">
      <div class="public-footer__brand">
        <span class="public-footer__logo">KQC</span>
        <div><strong>中華汽車資訊交流協會</strong><p v-if="expanded">商用車資訊與產業服務平台</p></div>
      </div>
      <div v-if="expanded" class="public-footer__details">
        <RouterLink to="/contact">聯絡我們</RouterLink>
        <a href="#privacy" aria-label="隱私政策">隱私政策</a>
        <small>© 2026 KQC. All Rights Reserved.</small>
      </div>
      <button type="button" class="public-footer__toggle" :aria-expanded="expanded" :aria-label="expanded ? '縮小頁尾' : '展開頁尾'" :title="expanded ? '縮小頁尾' : '展開頁尾'" @click="expanded = !expanded">
        <Icon :icon="expanded ? 'lucide:chevrons-down' : 'lucide:chevrons-up'" />
      </button>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.public-footer { margin-top: auto; border-top: 1px solid var(--border-grey); background: var(--bg-card); color: var(--text-muted); transition: padding 0.2s ease; }
.public-footer__inner { position: relative; width: min(100% - 2rem, 80rem); margin: 0 auto; padding: 1.75rem 3.5rem 1.75rem 0; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
.public-footer--compact .public-footer__inner { padding-block: 0.65rem; }
.public-footer__brand { display: flex; align-items: center; gap: 0.75rem; }
.public-footer__brand strong { color: var(--text-main); }
.public-footer__brand p { margin: 0.2rem 0 0; font-size: 0.8rem; }
.public-footer__logo { display: grid; width: 2.25rem; height: 2.25rem; place-items: center; border-radius: 0.5rem; background: var(--accent); color: #1e293b; font-weight: 900; }
.public-footer__details { display: flex; align-items: center; justify-content: flex-end; gap: 1rem; flex-wrap: wrap; font-size: 0.8rem; }
.public-footer__details a { color: var(--text-main); text-decoration: none; }
.public-footer__details a:hover { color: var(--accent); }
.public-footer__toggle { position: absolute; top: 0.75rem; right: 0; display: grid; width: 2.25rem; height: 2.25rem; place-items: center; border: 1px solid var(--border-grey); border-radius: 0.5rem; background: var(--bg-main); color: var(--text-main); cursor: pointer; }
.public-footer__toggle:hover, .public-footer__toggle:focus-visible { border-color: var(--accent); color: var(--accent); }
@media (max-width: 640px) { .public-footer__inner { align-items: flex-start; flex-direction: column; } .public-footer__details { align-items: flex-start; flex-direction: column; gap: 0.5rem; } }
@media (prefers-reduced-motion: reduce) { .public-footer { transition: none; } }
</style>
