<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{ title: string; summary: string }>()
const sharing = ref(false)
const feedback = ref('')

// D2E-A — Clipboard Share Fallback / Article Share Feedback
const copyArticleUrl = async (url: string) => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
    await navigator.clipboard.writeText(url)
    feedback.value = '文章連結已複製'
  } catch {
    feedback.value = '無法複製連結，請從瀏覽器網址列複製。'
  }
}

// D2E-A — Article Share / Native Web Share
const shareArticle = async () => {
  if (sharing.value) return
  sharing.value = true
  feedback.value = ''
  const url = window.location.href
  try {
    if (!navigator.share) { await copyArticleUrl(url); return }
    try {
      await navigator.share({ title: props.title, text: props.summary, url })
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') return
      await copyArticleUrl(url)
    }
  } finally {
    sharing.value = false
  }
}
</script>

<template>
  <!-- D2E-A — Article Share Accessibility -->
  <section class="article-share" aria-labelledby="article-share-title">
    <div>
      <span id="article-share-title">分享文章</span>
      <small>將這篇產業洞察分享給更多人</small>
    </div>
    <button type="button" :disabled="sharing" aria-label="分享這篇文章" @click="shareArticle">
      <Icon icon="lucide:share-2" aria-hidden="true" />
      <span>{{ sharing ? '分享中…' : '分享這篇文章' }}</span>
    </button>
    <p class="article-share__feedback" role="status" aria-live="polite">{{ feedback }}</p>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.article-share { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: $kqc-spacing-sm $kqc-spacing-lg; padding-block: $kqc-spacing-lg; border-block: 1px solid var(--border-grey); }
.article-share > div { display: grid; gap: $kqc-spacing-2xs; }
.article-share > div span { font-size: $kqc-type-body-emphasis; font-weight: 750; }
.article-share > div small { color: var(--text-muted); font-size: $kqc-type-metadata; }
.article-share button { display: inline-flex; min-height: 2.75rem; align-items: center; justify-content: center; gap: $kqc-spacing-xs; padding: $kqc-spacing-sm $kqc-spacing-lg; border: 1px solid var(--accent-active); border-radius: $kqc-radius-full; background: transparent; color: var(--accent-active); font: inherit; font-weight: 700; cursor: pointer; }
.article-share button:hover:not(:disabled) { background: var(--accent-active); color: var(--text-on-accent, #fff); }
.article-share button:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent-active) 35%, transparent); outline-offset: 3px; }
.article-share button:disabled { cursor: wait; opacity: 0.6; }
.article-share__feedback { grid-column: 1 / -1; min-height: 1.5em; margin: 0; color: var(--text-muted); font-size: $kqc-type-metadata; }
@media (max-width: $breakpoint-sm) {
  .article-share { grid-template-columns: 1fr; }
  .article-share button { width: 100%; }
}
</style>
