<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import Skeleton from 'primevue/skeleton'
import ArticleLike from '@/components/insights/ArticleLike.vue'
import ArticleShare from '@/components/insights/ArticleShare.vue'
import StructuredArticleContent from '@/components/insights/StructuredArticleContent.vue'
import {
  publicArticleCoverUrl,
  publicArticlesApi,
  type PublicArticleCategory,
  type PublicArticleDetail,
} from '@/api/publicArticles'

// ============================================================
// Industry Insights — Public Article Detail Request Guard
// WEB-1F-D2C
// ============================================================
const route = useRoute()
const article = ref<PublicArticleDetail | null>(null)
const loading = ref(true)
const unavailable = ref(false)
const hero = ref<HTMLElement | null>(null)
const heroImagePosition = ref('50%')
let requestEpoch = 0
let motionFrame = 0
let reducedMotion: MediaQueryList | null = null

const categoryLabels: Record<PublicArticleCategory, string> = {
  BUSINESS_MANAGEMENT: '經營管理', TRANSPORT_KNOWLEDGE: '運輸小知識', MARKET_TREND: '市場趨勢',
  BUSINESS_TRANSFORMATION: '事業轉型', POLICY_REGULATION: '政策法規', KQC_NEWS: 'KQC 快訊',
}
// ============================================================
// Article Hero Category Copy / WEB-1F-D2C-P2 / WEB-1F-D2C-P2.3
// The API's first category is the sole Hero presentation owner.
// ============================================================
const heroCopyByCategory: Record<PublicArticleCategory, { label: string; copy: string }> = {
  BUSINESS_MANAGEMENT: { label: '經營管理', copy: '掌握經營關鍵，讓每一步決策更有方向' },
  TRANSPORT_KNOWLEDGE: { label: '運輸小知識', copy: '懂運輸多一點，經營路上更從容' },
  MARKET_TREND: { label: '市場趨勢', copy: '看懂市場變化，提前掌握下一步商機' },
  POLICY_REGULATION: { label: '政策法規', copy: '掌握政策脈動，讓經營因應更有準備' },
  KQC_NEWS: { label: 'KQC 快訊', copy: '掌握 KQC 最新動態，與您分享重要消息' },
  BUSINESS_TRANSFORMATION: { label: '事業轉型', copy: '看見轉型契機，為事業開啟更多可能' },
}
const heroCopy = computed(() => {
  const firstCategory = article.value?.categories[0]
  return firstCategory ? heroCopyByCategory[firstCategory] : null
})
const genericTitle = '產業文章 - 三爵資訊 KQC'
const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
  : '日期待定'

// ============================================================
// Industry Insights — Article Hero Scroll Motion
// WEB-1F-D2C / WEB-1F-D2C-P2 / WEB-1F-D2C-P2.1
// ============================================================
const updateHeroMotion = () => {
  motionFrame = 0
  if (!hero.value || reducedMotion?.matches) { heroImagePosition.value = '50%'; return }
  const bounds = hero.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  if (bounds.bottom <= 0 || bounds.top >= viewportHeight) return
  const progress = Math.min(1, Math.max(0, -bounds.top / bounds.height))
  heroImagePosition.value = `${(30 + progress * 40).toFixed(2)}%`
}
const scheduleHeroMotion = () => {
  if (motionFrame || reducedMotion?.matches) return
  motionFrame = window.requestAnimationFrame(updateHeroMotion)
}
const handleMotionPreference = () => { heroImagePosition.value = '50%'; scheduleHeroMotion() }

const loadArticle = async (slugValue: unknown) => {
  const epoch = ++requestEpoch
  const slug = typeof slugValue === 'string' ? slugValue : ''
  loading.value = true; unavailable.value = false; article.value = null; document.title = genericTitle
  if (!slug) { loading.value = false; unavailable.value = true; return }
  try {
    const response = await publicArticlesApi.detail(slug)
    if (epoch !== requestEpoch) return
    article.value = response.data.article
    document.title = `${article.value.title} - 三爵資訊 KQC`
    await nextTick(); updateHeroMotion()
  } catch {
    if (epoch !== requestEpoch) return
    unavailable.value = true
  } finally {
    if (epoch === requestEpoch) loading.value = false
  }
}

watch(() => route.params.slug, loadArticle, { immediate: true })
onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.addEventListener('change', handleMotionPreference)
  window.addEventListener('scroll', scheduleHeroMotion, { passive: true })
  window.addEventListener('resize', scheduleHeroMotion, { passive: true })
  scheduleHeroMotion()
})
onBeforeUnmount(() => {
  requestEpoch += 1
  window.removeEventListener('scroll', scheduleHeroMotion)
  window.removeEventListener('resize', scheduleHeroMotion)
  reducedMotion?.removeEventListener('change', handleMotionPreference)
  if (motionFrame) window.cancelAnimationFrame(motionFrame)
})
</script>

<template>
  <main class="article-detail" :aria-busy="loading">
    <template v-if="loading">
      <div class="article-detail__loading" aria-label="文章載入中">
        <Skeleton class="article-detail__hero-skeleton" />
        <div class="article-detail__reading"><Skeleton width="35%" /><Skeleton width="90%" height="3rem" /><Skeleton width="100%" /><Skeleton width="95%" /><Skeleton width="80%" /></div>
      </div>
    </template>

    <section v-else-if="unavailable || !article" class="article-detail__state" role="alert">
      <p>Industry Insights</p><h1>找不到這篇文章</h1>
      <span>這篇文章可能尚未發布、已下架，或網址不存在。</span>
      <RouterLink to="/insights">返回產業洞察</RouterLink>
    </section>

    <article v-else>
      <nav class="article-detail__breadcrumb" aria-label="麵包屑導覽">
        <ol><li><RouterLink to="/">首頁</RouterLink></li><li aria-hidden="true">/</li><li><RouterLink to="/insights">產業洞察</RouterLink></li><li aria-hidden="true">/</li><li aria-current="page">{{ article.title }}</li></ol>
      </nav>

      <!-- Article Detail Hero / WEB-1F-D2C -->
      <div ref="hero" class="article-detail__hero">
        <img v-if="article.coverImage" :src="publicArticleCoverUrl(article.coverImage)" :alt="`${article.title}封面`" :style="{ '--article-hero-position': heroImagePosition }">
        <div v-else class="article-detail__hero-fallback" aria-hidden="true"><span>KQC</span></div>
        <div class="article-detail__hero-shade" aria-hidden="true"></div>
        <div v-if="heroCopy" class="article-detail__hero-copy"><span>{{ heroCopy.label }}</span><strong>{{ heroCopy.copy }}</strong></div>
      </div>

      <div class="article-detail__reading">
        <header class="article-detail__header">
          <div class="article-detail__categories"><span v-for="category in article.categories" :key="category">{{ categoryLabels[category] }}</span></div>
          <h1>{{ article.title }}</h1>
          <time :datetime="article.publishedAt || undefined">{{ formatDate(article.publishedAt) }}</time>
          <div v-if="article.tags.length" class="article-detail__tags"><span v-for="tag in article.tags" :key="tag">#{{ tag }}</span></div>
        </header>

        <!-- D2D-B2 — Legacy Article Fallback:
             Structured articles render once; pre-structured articles remain readable. -->
        <StructuredArticleContent v-if="article.structuredContent" :content="article.structuredContent" />
        <div v-else class="article-detail__body">{{ article.content }}</div>
        <div class="article-detail__engagement">
          <ArticleLike :slug="article.slug" />
          <ArticleShare :title="article.title" :summary="article.summary" />
        </div>
        <RouterLink class="article-detail__return" to="/insights">返回產業洞察</RouterLink>
      </div>
    </article>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.article-detail { width: min(100% - 2rem, 90rem); min-width: 0; min-height: 60vh; margin-inline: auto; padding: $kqc-spacing-xl 0 clamp(3rem, 7vw, 6rem); color: var(--text-main); }
.article-detail__breadcrumb { margin-bottom: $kqc-spacing-lg; overflow: hidden; }
.article-detail__breadcrumb ol { display: flex; min-width: 0; align-items: center; gap: $kqc-spacing-xs; margin: 0; padding: 0; color: var(--text-muted); font-size: $kqc-type-metadata; list-style: none; }
.article-detail__breadcrumb li { flex: 0 0 auto; }
.article-detail__breadcrumb li[aria-current='page'] { min-width: 0; max-width: min(42vw, 32rem); overflow: hidden; flex: 1 1 auto; color: var(--text-main); font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.article-detail__breadcrumb a { color: inherit; text-decoration: none; }
.article-detail__breadcrumb a:hover { color: var(--accent-active); }
/* Industry Insights / Article Detail Hero / WEB-1F-D2C / WEB-1F-D2C-P2.3 */
.article-detail__hero, .article-detail__hero-skeleton { width: 100%; height: clamp(18rem, 30vw, 25rem); overflow: hidden; border-radius: $kqc-radius-xl; background: var(--bg-card); }
.article-detail__hero { position: relative; isolation: isolate; }
.article-detail__hero img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; object-position: center var(--article-hero-position, 50%); will-change: object-position; }
.article-detail__hero-fallback { display: grid; width: 100%; height: 100%; place-items: center; background: linear-gradient(135deg, color-mix(in srgb, var(--accent-active) 12%, var(--bg-main)), var(--bg-card)); color: var(--text-muted); font-size: clamp(1.5rem, 5vw, 3rem); font-weight: 800; letter-spacing: 0.18em; }
.article-detail__hero-shade { position: absolute; z-index: 1; inset: 0; background: linear-gradient(90deg, rgb(5 15 28 / 62%) 0%, rgb(5 15 28 / 30%) 55%, rgb(5 15 28 / 12%) 100%); }
.article-detail__hero-copy { position: absolute; z-index: 2; top: 50%; left: 50%; display: grid; width: min(38rem, calc(100% - 3rem)); justify-items: center; gap: $kqc-spacing-sm; color: #fff; text-align: center; transform: translate(-50%, -50%); text-shadow: 0 2px 16px rgb(0 0 0 / 35%); }
.article-detail__hero-copy span { padding: $kqc-spacing-2xs $kqc-spacing-sm; border-radius: $kqc-radius-full; background: rgb(255 255 255 / 14%); color: #fff; opacity: 0.32; font-size: $kqc-type-caption; font-weight: 600; letter-spacing: 0.06em; }
.article-detail__hero-copy strong { font-size: clamp(1.5rem, 3.2vw, 2.75rem); line-height: 1.35; }
.article-detail__reading { display: grid; width: min(100%, 52rem); margin-inline: auto; gap: $kqc-spacing-lg; }
.article-detail__hero + .article-detail__reading { margin-top: clamp(1.5rem, 3vw, 2.75rem); }
.article-detail__header { display: grid; min-width: 0; gap: $kqc-spacing-sm; }
.article-detail__categories, .article-detail__tags { display: flex; flex-wrap: wrap; gap: $kqc-spacing-xs; }
.article-detail__categories span, .article-detail__tags span { padding: $kqc-spacing-2xs $kqc-spacing-sm; border-radius: $kqc-radius-full; background: color-mix(in srgb, var(--accent-active) 12%, transparent); color: var(--accent-active); font-size: $kqc-type-metadata; font-weight: 700; }
.article-detail__header h1 { max-width: 100%; margin: 0; overflow-wrap: anywhere; font-size: clamp(2rem, 4.5vw, 3.25rem); line-height: 1.22; }
.article-detail__header time { color: var(--text-muted); font-size: $kqc-type-metadata; }
/* Industry Insights / Article Detail Body / WEB-1F-D2C / WEB-1F-D2C-P1 */
.article-detail__body { overflow-wrap: anywhere; color: var(--text-main); font-size: $kqc-type-body-emphasis; line-height: 1.9; white-space: pre-wrap; }
.article-detail__engagement { display: grid; min-width: 0; }
.article-detail__return { width: fit-content; padding: $kqc-spacing-sm $kqc-spacing-lg; border: 1px solid var(--accent-active); border-radius: $kqc-radius-full; color: var(--accent-active); font-weight: 700; text-decoration: none; }
.article-detail__return:hover { background: var(--accent-active); color: var(--text-on-accent, #fff); }
.article-detail__loading { display: grid; gap: clamp(2rem, 5vw, 4rem); }
.article-detail__state { display: grid; min-height: 55vh; place-content: center; justify-items: center; gap: $kqc-spacing-md; text-align: center; }
.article-detail__state p, .article-detail__state h1 { margin: 0; }
.article-detail__state p { color: var(--accent-active); font-size: $kqc-type-label; font-weight: 700; }
.article-detail__state span { max-width: 32rem; color: var(--text-muted); line-height: 1.7; }
.article-detail__state a { color: var(--accent-active); font-weight: 700; }
@media (max-width: $breakpoint-sm) {
  .article-detail { width: min(100% - 1.25rem, 90rem); }
  .article-detail__hero, .article-detail__hero-skeleton { height: clamp(12.5rem, 54vw, 16rem); border-radius: $kqc-radius-lg; }
  .article-detail__hero-copy { width: calc(100% - 3rem); }
  .article-detail__hero-copy strong { font-size: clamp(1.35rem, 6.5vw, 2rem); }
  .article-detail__header h1 { font-size: clamp(1.8rem, 8vw, 2.35rem); }
  .article-detail__body { font-size: $kqc-type-body; line-height: 1.8; }
  .article-detail__breadcrumb li[aria-current='page'] { max-width: 42vw; }
}
@media (prefers-reduced-motion: reduce) {
  .article-detail__hero img { object-position: center 50%; will-change: auto; }
}
</style>
