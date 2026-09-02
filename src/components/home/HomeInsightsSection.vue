<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { publicArticleCoverUrl, publicArticlesApi, type PublicArticleCategory, type PublicArticleListItem } from '@/api/publicArticles'

const articles = ref<PublicArticleListItem[]>([])
const loading = ref(true)
const errorMessage = ref('')
const categoryLabels: Record<PublicArticleCategory, string> = {
  BUSINESS_MANAGEMENT: '經營管理', TRANSPORT_KNOWLEDGE: '運輸小知識', MARKET_TREND: '市場趨勢',
  BUSINESS_TRANSFORMATION: '事業轉型', POLICY_REGULATION: '政策法規', KQC_NEWS: 'KQC 快訊',
}
const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
  : '日期待定'

// HOME-R1D — Real Latest Insights Authority / the public API already owns publication visibility and newest-first ordering.
onMounted(async () => {
  try {
    const response = await publicArticlesApi.list({ page: 1, limit: 2 })
    articles.value = response.data.articles.slice(0, 2)
  } catch {
    errorMessage.value = '最新文章載入失敗，請前往產業洞察查看。'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="kqc-card-block home-insights" aria-labelledby="home-insights-title">
    <div class="block-header-between home-insights__header">
      <h2 id="home-insights-title" class="block-section-title"><Icon icon="lucide:newspaper" aria-hidden="true" />最新產業洞察</h2>
      <RouterLink to="/insights" class="link-gold-more">查看更多文章 ❯</RouterLink>
    </div>
    <div class="insights-2col-grid">
      <article v-for="article in articles" :key="article.id" class="insight-article-card">
        <div class="insight-article-card__media">
          <img v-if="article.coverImage" :src="publicArticleCoverUrl(article.coverImage)" :alt="`${article.title}封面`" />
          <div v-else class="insight-article-card__fallback" aria-hidden="true"><span>KQC</span></div>
        </div>
        <div class="insight-article-card__body">
          <span v-if="article.categories[0]" class="category-chip">{{ categoryLabels[article.categories[0]] }}</span>
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-summary">{{ article.summary }}</p>
          <div class="article-footer-bar">
            <time class="article-date" :datetime="article.publishedAt || undefined">{{ formatDate(article.publishedAt) }}</time>
            <RouterLink :to="{ name: 'InsightDetail', params: { slug: article.slug } }" class="btn-read-full">閱讀全文 →</RouterLink>
          </div>
        </div>
      </article>
    </div>
    <p v-if="loading" class="home-insights__state" role="status">正在載入最新文章…</p>
    <p v-else-if="errorMessage" class="home-insights__state" role="alert">{{ errorMessage }}</p>
  </section>
</template>
