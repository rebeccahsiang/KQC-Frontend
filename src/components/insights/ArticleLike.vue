<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { publicArticlesApi, type ArticleLikeState } from '@/api/publicArticles'

const props = defineProps<{ slug: string }>()
const confirmedState = ref<ArticleLikeState | null>(null)
const loading = ref(false)
const toggling = ref(false)
const feedback = ref('')
let requestEpoch = 0

const liked = computed(() => confirmedState.value?.liked ?? false)
const accessibleLabel = computed(() => confirmedState.value
  ? (liked.value ? '取消這篇文章的按讚' : '按讚這篇文章')
  : '重新載入按讚狀態')

// D2E-B2 — Article Like Public State / Article Like Route Guard
const loadLikeState = async (slug: string, epoch: number) => {
  loading.value = true
  feedback.value = ''
  try {
    const response = await publicArticlesApi.likeState(slug)
    if (epoch !== requestEpoch || slug !== props.slug) return
    confirmedState.value = response.data
  } catch {
    if (epoch !== requestEpoch || slug !== props.slug) return
    feedback.value = '目前無法取得按讚狀態，請稍後再試。'
  } finally {
    if (epoch === requestEpoch && slug === props.slug) loading.value = false
  }
}

watch(() => props.slug, (slug) => {
  const epoch = ++requestEpoch
  confirmedState.value = null
  loading.value = false
  toggling.value = false
  feedback.value = ''
  void loadLikeState(slug, epoch)
}, { immediate: true })

// D2E-B2 — Article Like Toggle / Article Like Feedback
const toggleLike = async () => {
  if (loading.value || toggling.value) return
  if (!confirmedState.value) { await loadLikeState(props.slug, requestEpoch); return }
  const slug = props.slug
  const epoch = requestEpoch
  toggling.value = true
  feedback.value = ''
  try {
    const response = await publicArticlesApi.toggleLike(slug)
    if (epoch !== requestEpoch || slug !== props.slug) return
    confirmedState.value = response.data
  } catch {
    if (epoch !== requestEpoch || slug !== props.slug) return
    feedback.value = '按讚狀態暫時無法更新，請稍後再試。'
  } finally {
    if (epoch === requestEpoch && slug === props.slug) toggling.value = false
  }
}
</script>

<template>
  <!-- D2E-B2 — Article Like Accessibility -->
  <section class="article-like" aria-labelledby="article-like-title">
    <div>
      <span id="article-like-title">喜歡這篇文章嗎？</span>
      <small>按讚支持我們持續分享產業洞察</small>
    </div>
    <button
      type="button"
      :class="{ 'is-liked': liked }"
      :aria-pressed="confirmedState ? liked : false"
      :aria-label="accessibleLabel"
      :disabled="loading || toggling"
      @click="toggleLike"
    >
      <!-- D2E-B2 R12 — Article Like Active Visual -->
      <Icon :icon="liked ? 'mdi:heart' : 'lucide:heart'" aria-hidden="true" />
      <span>{{ confirmedState ? confirmedState.likeCount : '—' }}</span>
    </button>
    <p class="article-like__feedback" role="status" aria-live="polite">{{ feedback }}</p>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.article-like { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: $kqc-spacing-sm $kqc-spacing-lg; padding-block: $kqc-spacing-lg; border-top: 1px solid var(--border-grey); }
.article-like > div { display: grid; gap: $kqc-spacing-2xs; }
.article-like > div span { font-size: $kqc-type-body-emphasis; font-weight: 750; }
.article-like > div small { color: var(--text-muted); font-size: $kqc-type-metadata; }
.article-like button { display: inline-flex; min-width: 5rem; min-height: 2.75rem; align-items: center; justify-content: center; gap: $kqc-spacing-xs; padding: $kqc-spacing-sm $kqc-spacing-lg; border: 1px solid var(--border-grey); border-radius: $kqc-radius-full; background: transparent; color: var(--text-muted); font: inherit; font-weight: 750; cursor: pointer; }
.article-like button svg { width: 1.2rem; height: 1.2rem; }
.article-like button.is-liked { border-color: var(--accent-active); color: var(--accent-active); }
.article-like button:hover:not(:disabled) { border-color: var(--accent-active); color: var(--accent-active); }
.article-like button:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent-active) 35%, transparent); outline-offset: 3px; }
.article-like button:disabled { cursor: wait; opacity: 0.6; }
.article-like__feedback { grid-column: 1 / -1; min-height: 1.5em; margin: 0; color: var(--text-muted); font-size: $kqc-type-metadata; }
@media (max-width: $breakpoint-sm) {
  .article-like { grid-template-columns: 1fr; }
  .article-like button { width: 100%; }
}
</style>
