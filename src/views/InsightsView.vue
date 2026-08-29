<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import Skeleton from 'primevue/skeleton'
import { publicArticleCoverUrl, publicArticlesApi, type PublicArticleCategory, type PublicArticleListItem } from '@/api/publicArticles'
import { publicArticleSubscriptionsApi } from '@/api/publicArticleSubscriptions'

// ============================================================
// Industry Insights — Public Article List
// WEB-1F-D2B
// ============================================================
const PAGE_SIZE = 8
const filters: ReadonlyArray<{ label: string; category?: PublicArticleCategory }> = [
  { label: '全部文章' },
  { label: '經營管理', category: 'BUSINESS_MANAGEMENT' },
  { label: '運輸小知識', category: 'TRANSPORT_KNOWLEDGE' },
  { label: '市場趨勢', category: 'MARKET_TREND' },
  { label: '政策法規', category: 'POLICY_REGULATION' },
  { label: 'KQC 快訊', category: 'KQC_NEWS' },
  { label: '事業轉型', category: 'BUSINESS_TRANSFORMATION' },
]
const categoryLabels: Record<PublicArticleCategory, string> = {
  BUSINESS_MANAGEMENT: '經營管理', TRANSPORT_KNOWLEDGE: '運輸小知識', MARKET_TREND: '市場趨勢',
  BUSINESS_TRANSFORMATION: '事業轉型', POLICY_REGULATION: '政策法規', KQC_NEWS: 'KQC 快訊',
}
const canonicalCategories = new Set<PublicArticleCategory>(filters.flatMap((filter) => filter.category ? [filter.category] : []))
// D2H — Category Query Validation / only canonical enum values may become public Article filter authority.
const categoryFromQuery = (value: unknown): PublicArticleCategory | undefined =>
  typeof value === 'string' && canonicalCategories.has(value as PublicArticleCategory)
    ? value as PublicArticleCategory
    : undefined
const route = useRoute()
const router = useRouter()
// D2H — Insights Category Deep Link / initial state comes from the URL so direct open and refresh remain deterministic.
const activeCategory = ref<PublicArticleCategory | undefined>(categoryFromQuery(route.query.category))
const page = ref(1)
const total = ref(0)
const articles = ref<PublicArticleListItem[]>([])
const loading = ref(false)
const initialLoadComplete = ref(false)
const errorMessage = ref('')
let requestEpoch = 0
const verificationFeedback = ref('')
const verificationBusy = ref(false)
let verificationStarted = false
const articleScrollTarget = ref<HTMLElement | null>(null)
let articleScrollHandled = false

const loadArticles = async () => {
  const epoch = ++requestEpoch
  loading.value = true; errorMessage.value = ''
  try {
    const response = await publicArticlesApi.list({ page: page.value, limit: PAGE_SIZE, category: activeCategory.value })
    if (epoch !== requestEpoch) return
    articles.value = response.data.articles; total.value = response.data.pagination.total
  } catch {
    if (epoch !== requestEpoch) return
    articles.value = []; total.value = 0; errorMessage.value = '文章載入失敗，請稍後再試。'
  } finally {
    if (epoch === requestEpoch) {
      loading.value = false
      initialLoadComplete.value = true
    }
  }
}
// ============================================================
// Industry Insights — Article Category Filter
// WEB-1F-D2B: no category parameter represents 全部文章.
// ============================================================
// D2H — Category Route Synchronization / tabs update Vue Router while preserving unrelated query state.
const selectCategory = (category?: PublicArticleCategory) => {
  if (activeCategory.value === category) {
    if (page.value !== 1) { page.value = 1; void loadArticles() }
    return
  }
  const query = { ...route.query }
  if (category) query.category = category
  else delete query.category
  void router.push({ name: 'Insights', query, hash: route.hash })
}
const changePage = (event: PageState) => { page.value = Math.max(1, event.page + 1); void loadArticles() }
const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
  : '日期待定'
// D2E-C2 — Verification Callback / Route / Stale Response Guard
// D2H — Verification Query Compatibility / token cleanup preserves the independent category query.
const verifySubscription = async () => {
  if (verificationStarted || typeof route.query.token !== 'string' || !route.query.token) return
  verificationStarted = true
  verificationBusy.value = true
  const token = route.query.token
  try {
    await publicArticleSubscriptionsApi.verify(token)
    verificationFeedback.value = '信箱驗證成功，已完成 KQC 產業洞察訂閱。'
  } catch {
    verificationFeedback.value = '驗證連結無效或已過期，請重新訂閱。'
  } finally {
    verificationBusy.value = false
    const query = { ...route.query }
    delete query.token
    await router.replace({ name: 'Insights', query, hash: route.hash })
  }
}
// D2H — Route / Stale Response Guard / route changes reuse the existing request epoch authority.
watch(() => route.query.category, (value) => {
  const category = categoryFromQuery(value)
  if (value !== undefined && category === undefined) {
    const query = { ...route.query }
    delete query.category
    void router.replace({ name: 'Insights', query, hash: route.hash })
  }
  if (activeCategory.value === category && page.value === 1) return
  activeCategory.value = category
  page.value = 1
  void loadArticles()
})
onMounted(async () => {
  await verifySubscription()
  if (route.query.category !== undefined && categoryFromQuery(route.query.category) === undefined) {
    const query = { ...route.query }
    delete query.category
    await router.replace({ name: 'Insights', query, hash: route.hash })
  }
  await loadArticles()
  // D2H-R2 — One-shot Scroll Coordination / reactive list, pagination, and category updates never pull the visitor back.
  if (!articleScrollHandled && route.hash === '#insights-articles') {
    articleScrollHandled = true
    await nextTick()
    window.requestAnimationFrame(() => {
      // D2H-R2 — Reduced Motion / Header Offset / CSS owns clearance while motion preference owns animation.
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      articleScrollTarget.value?.scrollIntoView({ behavior, block: 'start' })
    })
  }
})
</script>

<template>
  <main class="insights-view insights-view--breadcrumb-compact">
    <header class="insights-hero"><p class="insights-hero__eyebrow">Industry Insights</p><h1>產業洞察</h1><p>掌握運輸產業知識、市場趨勢與重要政策資訊。</p></header>
    <p v-if="verificationBusy || verificationFeedback" class="subscription-verification" role="status" aria-live="polite">{{ verificationBusy ? '正在確認訂閱…' : verificationFeedback }}</p>
    <!-- ============================================================
         Industry Insights — Category Filter Layout
         WEB-1F-D2B
         ============================================================ -->
    <!-- D2H-R2 — Insights Article Scroll Target / groups complete tabs with the immediately following Article results. -->
    <div id="insights-articles" ref="articleScrollTarget" class="insights-article-region">
    <nav class="article-filters" aria-label="文章分類">
      <div class="article-filters__inner">
        <button v-for="filter in filters" :key="filter.label" type="button" :class="{ active: activeCategory === filter.category }" :aria-pressed="activeCategory === filter.category" @click="selectCategory(filter.category)">{{ filter.label }}</button>
      </div>
    </nav>
    <section aria-live="polite" :aria-busy="loading">
      <!-- Industry Insights / Article List Loading State / WEB-1F-D2B -->
      <div v-if="loading && !initialLoadComplete" class="article-grid" aria-label="文章載入中">
        <article v-for="index in PAGE_SIZE" :key="`article-skeleton-${index}`" class="article-card article-card--loading"><Skeleton width="100%" height="100%" class="article-card__skeleton-image" /><div class="article-card__body"><Skeleton width="35%" /><Skeleton width="90%" height="1.5rem" /><Skeleton width="100%" /><Skeleton width="75%" /></div></article>
      </div>
      <div v-else-if="errorMessage" class="article-state" role="alert"><strong>{{ errorMessage }}</strong><Button label="重新載入" outlined @click="loadArticles" /></div>
      <div v-else-if="!articles.length" class="article-state"><strong>目前尚無文章</strong><p>新的產業觀點與實務資訊正在準備中，歡迎稍後再回來看看。</p></div>
      <!-- ============================================================
           Industry Insights — Article Card Grid
           WEB-1F-D2B
           ============================================================ -->
      <div v-else class="article-grid">
        <RouterLink v-for="article in articles" :key="article.id" :to="`/insights/${article.slug}`" class="article-card">
          <div class="article-card__media"><img v-if="article.coverImage" :src="publicArticleCoverUrl(article.coverImage)" :alt="`${article.title}封面`"><div v-else class="article-card__fallback" aria-hidden="true"><span>KQC</span></div></div>
          <div class="article-card__body"><div class="article-card__meta"><div class="article-card__categories"><span v-for="category in article.categories" :key="category">{{ categoryLabels[category] }}</span></div><time :datetime="article.publishedAt || undefined">{{ formatDate(article.publishedAt) }}</time></div><h2>{{ article.title }}</h2><p>{{ article.summary }}</p><span class="article-card__read-more">閱讀全文 →</span></div>
        </RouterLink>
      </div>
      <p v-if="loading && initialLoadComplete" class="article-refresh-status" role="status">正在更新文章…</p>
    </section>
    <Paginator v-if="initialLoadComplete && !errorMessage && total > PAGE_SIZE" :first="(page - 1) * PAGE_SIZE" :rows="PAGE_SIZE" :total-records="total" @page="changePage" />
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.insights-view { width: min(100% - 2rem, 90rem); margin-inline: auto; padding: clamp(2.5rem, 5vw, 5rem) 0; color: var(--text-main); }
.insights-view--breadcrumb-compact { padding-top: $kqc-spacing-xl; }
.insights-hero { max-width: 48rem; margin-bottom: $kqc-spacing-2xl; }
.insights-hero__eyebrow { margin: 0 0 $kqc-spacing-sm; color: var(--accent-active); font-size: $kqc-type-label; font-weight: 750; letter-spacing: 0.08em; text-transform: uppercase; }
.insights-hero h1 { margin: 0; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1; }
.insights-hero > p:last-child { margin: $kqc-spacing-lg 0 0; color: var(--text-muted); font-size: $kqc-type-body-emphasis; line-height: 1.7; }
.subscription-verification { margin: 0 0 $kqc-spacing-xl; padding: $kqc-spacing-md $kqc-spacing-lg; border-inline-start: 3px solid var(--accent-active); background: color-mix(in srgb, var(--accent-active) 7%, transparent); color: var(--text-main); line-height: 1.6; }
/* D2H-R2-2 — Scroll Offset Visual Tuning / balances complete tab visibility with a compact Hero remainder. */
.insights-article-region { scroll-margin-top: 10.5rem; }
.article-filters { max-width: 100%; margin-bottom: $kqc-spacing-2xl; padding-bottom: $kqc-spacing-xs; overflow-x: auto; scrollbar-width: thin; }
.article-filters__inner { display: flex; width: max-content; min-width: 100%; justify-content: center; gap: $kqc-spacing-sm; }
.article-filters button { flex: 0 0 auto; padding: 0.65rem 1rem; border: 1px solid var(--border-grey); border-radius: $kqc-radius-full; background: var(--bg-card); color: var(--text-muted); cursor: pointer; font: inherit; font-weight: 650; }
.article-filters button:hover, .article-filters button:focus-visible { border-color: var(--accent-active); color: var(--text-main); }
.article-filters button:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent-active) 30%, transparent); outline-offset: 2px; }
.article-filters button.active { border-color: var(--accent-active); background: var(--accent-active); color: var(--text-on-accent, #fff); }
.article-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: $kqc-spacing-xl; }
.article-card { display: flex; min-width: 0; overflow: hidden; border: 1px solid var(--border-grey); border-radius: $kqc-radius-xl; background: var(--bg-card); color: inherit; text-decoration: none; flex-direction: column; transition: border-color 180ms ease; }
.article-card:hover, .article-card:focus-visible { border-color: var(--accent-active); }
.article-card:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent-active) 30%, transparent); outline-offset: 2px; }
.article-card__media, :deep(.article-card__skeleton-image) { width: 100%; aspect-ratio: 16 / 9; }
.article-card__media { overflow: hidden; background: var(--bg-main); }
.article-card__media img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 200ms ease; }
.article-card:hover .article-card__media img, .article-card:focus-visible .article-card__media img { transform: scale(1.04); }
.article-card__fallback { display: grid; width: 100%; height: 100%; place-items: center; background: linear-gradient(135deg, color-mix(in srgb, var(--accent-active) 12%, var(--bg-main)), var(--bg-card)); color: var(--text-muted); font-weight: 800; letter-spacing: 0.16em; }
.article-card__body { display: grid; min-width: 0; gap: $kqc-spacing-sm; padding: $kqc-spacing-lg; }
.article-card__meta { display: flex; min-width: 0; align-items: center; justify-content: space-between; gap: $kqc-spacing-sm; color: var(--text-muted); font-size: $kqc-type-metadata; }
.article-card__categories { display: flex; min-width: 0; flex-wrap: wrap; gap: $kqc-spacing-xs; }
.article-card__categories span { padding: $kqc-spacing-2xs $kqc-spacing-xs; border-radius: $kqc-radius-full; background: color-mix(in srgb, var(--accent-active) 12%, transparent); color: var(--accent-active); font-weight: 700; }
.article-card h2 { display: -webkit-box; overflow: hidden; margin: 0; font-size: $kqc-type-card-title; line-height: 1.4; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.article-card__body > p { display: -webkit-box; overflow: hidden; margin: 0; color: var(--text-muted); font-size: $kqc-type-body-small; line-height: 1.65; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.article-card__read-more { margin-top: auto; padding-top: $kqc-spacing-sm; color: var(--accent-active); font-weight: 700; }
.article-state { display: grid; min-height: 18rem; place-items: center; align-content: center; gap: $kqc-spacing-md; padding: $kqc-spacing-2xl; border: 1px dashed var(--border-grey); border-radius: $kqc-radius-xl; color: var(--text-muted); text-align: center; }
.article-state strong { color: var(--text-main); font-size: $kqc-type-card-title; }
.article-state p { max-width: 34rem; margin: 0; line-height: 1.7; }
.article-refresh-status { margin: $kqc-spacing-md 0 0; color: var(--text-muted); font-size: $kqc-type-metadata; text-align: center; }
:deep(.p-paginator) { margin-top: $kqc-spacing-2xl; background: transparent; }
@media (max-width: $breakpoint-lg) { .article-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: $breakpoint-sm) { .insights-view { width: min(100% - 1.25rem, 90rem); } .insights-article-region { scroll-margin-top: 5rem; } .article-grid { grid-template-columns: minmax(0, 1fr); } .article-card__meta { align-items: flex-start; flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { .article-card__media img { transition: none; } .article-card:hover .article-card__media img, .article-card:focus-visible .article-card__media img { transform: none; } }
</style>
