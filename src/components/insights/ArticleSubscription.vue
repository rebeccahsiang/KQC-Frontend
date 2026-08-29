<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { publicArticleSubscriptionsApi, type ArticleSubscriptionStatus } from '@/api/publicArticleSubscriptions'

const status = ref<ArticleSubscriptionStatus | null>(null)
const email = ref('')
const loading = ref(true)
const busy = ref(false)
const feedback = ref('')
const isCorrectingEmail = ref(false)
let requestEpoch = 0

// D2E-C2 — Subscription State / Route / Stale Response Guard
const loadState = async () => {
  const epoch = ++requestEpoch
  loading.value = true; feedback.value = ''
  try {
    const response = await publicArticleSubscriptionsApi.state()
    if (epoch !== requestEpoch) return
    status.value = response.data.status
    isCorrectingEmail.value = false
  } catch {
    if (epoch !== requestEpoch) return
    status.value = null; feedback.value = '目前無法取得訂閱狀態，請稍後再試。'
  } finally { if (epoch === requestEpoch) loading.value = false }
}
void loadState()

// D2E-C2 — Subscribe / Email Subscription UI
// D2E-C2-R1 — Pending Email Correction UX
const correctPendingEmail = () => {
  isCorrectingEmail.value = true
  feedback.value = ''
}
const subscribe = async () => {
  if (busy.value || loading.value) return
  const requestedEmail = email.value.trim()
  if (!requestedEmail) { feedback.value = '請輸入 Email。'; return }
  busy.value = true; feedback.value = ''
  try {
    const response = await publicArticleSubscriptionsApi.subscribe(requestedEmail)
    status.value = response.data.status
    isCorrectingEmail.value = false
    email.value = ''
    feedback.value = response.data.status === 'ACTIVE' ? '已完成 KQC 產業洞察訂閱。' : ''
  } catch { feedback.value = '目前無法完成訂閱，請稍後再試。' }
  finally { busy.value = false }
}

// D2E-C2 — Unsubscribe / Email Subscription Feedback
const unsubscribe = async () => {
  if (busy.value || loading.value) return
  busy.value = true; feedback.value = ''
  try {
    const response = await publicArticleSubscriptionsApi.unsubscribe()
    status.value = response.data.status
    isCorrectingEmail.value = false
    feedback.value = '已取消 KQC 產業洞察訂閱。'
  } catch { feedback.value = '目前無法取消訂閱，請稍後再試。' }
  finally { busy.value = false }
}
</script>

<template>
  <!-- D2E-C2 — Email Subscription Accessibility -->
  <section class="article-subscription" aria-labelledby="article-subscription-title" :aria-busy="loading || busy">
    <div class="article-subscription__copy">
      <Icon icon="lucide:mail" aria-hidden="true" />
      <div><span id="article-subscription-title">訂閱產業洞察</span><small>接收 KQC 最新產業文章與重要資訊</small></div>
    </div>
    <div v-if="loading" class="article-subscription__loading" role="status">正在確認訂閱狀態…</div>
    <form v-else-if="status === 'NONE' || (status === 'PENDING' && isCorrectingEmail)" @submit.prevent="subscribe">
      <label for="article-subscription-email">Email</label>
      <input id="article-subscription-email" v-model="email" type="email" autocomplete="email" placeholder="name@example.com" :disabled="busy" required>
      <button type="submit" :disabled="busy">{{ busy ? '處理中…' : '訂閱' }}</button>
    </form>
    <div v-else-if="status === 'PENDING'" class="article-subscription__state">
      <div><strong>請確認您的信箱</strong><span>請開啟驗證信完成 KQC 產業洞察訂閱。</span></div>
      <button type="button" class="article-subscription__correction" :disabled="busy" @click="correctPendingEmail">重新輸入 Email</button>
    </div>
    <div v-else-if="status === 'ACTIVE'" class="article-subscription__state article-subscription__state--active">
      <strong><Icon icon="lucide:circle-check" aria-hidden="true" />已訂閱 KQC 產業洞察</strong>
      <button type="button" :disabled="busy" @click="unsubscribe">{{ busy ? '處理中…' : '取消訂閱' }}</button>
    </div>
    <button v-else type="button" class="article-subscription__retry" :disabled="busy" @click="loadState">重新載入訂閱狀態</button>
    <p class="article-subscription__feedback" role="status" aria-live="polite">{{ feedback }}</p>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.article-subscription { display: grid; gap: $kqc-spacing-md; padding-block: $kqc-spacing-lg; border-bottom: 1px solid var(--border-grey); }
.article-subscription__copy { display: flex; align-items: center; gap: $kqc-spacing-sm; }
.article-subscription__copy > svg { width: 1.35rem; height: 1.35rem; color: var(--accent-active); }
.article-subscription__copy > div { display: grid; gap: $kqc-spacing-2xs; }
.article-subscription__copy span { font-size: $kqc-type-body-emphasis; font-weight: 750; }
.article-subscription__copy small, .article-subscription__loading, .article-subscription__state span { color: var(--text-muted); font-size: $kqc-type-metadata; }
.article-subscription form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: $kqc-spacing-sm; }
.article-subscription label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.article-subscription input, .article-subscription button { min-height: 2.75rem; border: 1px solid var(--border-grey); border-radius: $kqc-radius-md; font: inherit; }
.article-subscription input { min-width: 0; padding-inline: $kqc-spacing-md; background: var(--bg-card); color: var(--text-main); }
.article-subscription button { padding-inline: $kqc-spacing-lg; background: transparent; color: var(--accent-active); font-weight: 700; cursor: pointer; }
.article-subscription button:hover:not(:disabled) { border-color: var(--accent-active); }
.article-subscription button:focus-visible, .article-subscription input:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent-active) 30%, transparent); outline-offset: 2px; }
.article-subscription button:disabled, .article-subscription input:disabled { cursor: wait; opacity: 0.6; }
.article-subscription__state { display: flex; align-items: center; justify-content: space-between; gap: $kqc-spacing-md; }
.article-subscription__state > div { display: grid; gap: $kqc-spacing-2xs; }
.article-subscription__state strong { display: inline-flex; align-items: center; gap: $kqc-spacing-xs; }
.article-subscription__state--active button { min-height: 2.25rem; padding-inline: $kqc-spacing-sm; border-radius: $kqc-radius-full; font-size: $kqc-type-metadata; }
.article-subscription button.article-subscription__correction { min-height: 2.25rem; padding-inline: $kqc-spacing-sm; border-radius: $kqc-radius-full; font-size: $kqc-type-metadata; }
.article-subscription__feedback { min-height: 1.5em; margin: 0; color: var(--text-muted); font-size: $kqc-type-metadata; }
@media (max-width: $breakpoint-sm) {
  .article-subscription form { grid-template-columns: 1fr; }
  .article-subscription form button { width: 100%; }
  .article-subscription__state { align-items: flex-start; flex-direction: column; }
}
</style>
