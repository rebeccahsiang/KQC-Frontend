<script setup lang="ts">
import ArticleContentBlocks from './ArticleContentBlocks.vue'
import type { StructuredArticleContent } from '@/api/adminArticles'

defineProps<{ content: StructuredArticleContent }>()
const safeSourceUrl = (value: string | null) => {
  if (!value) return null
  try { return ['http:', 'https:'].includes(new URL(value).protocol) ? value : null }
  catch { return null }
}
</script>

<template>
  <!-- D2D-B2 — Public Structured Article Renderer
       Structured Content Public Rendering without arbitrary HTML. -->
  <div class="structured-article">
    <aside v-if="content.newsSummary.enabled && content.newsSummary.content" class="structured-article__news" aria-labelledby="news-summary-title">
      <h2 id="news-summary-title">新聞摘要</h2>
      <p>{{ content.newsSummary.content }}</p>
      <div v-if="content.newsSummary.sourceName" class="structured-article__source">
        <span>來源：{{ content.newsSummary.sourceName }}</span>
        <a v-if="safeSourceUrl(content.newsSummary.sourceUrl)" :href="safeSourceUrl(content.newsSummary.sourceUrl) || undefined" target="_blank" rel="noopener noreferrer">查看原始資料 ↗</a>
      </div>
    </aside>

    <section v-for="(section, sectionIndex) in content.sections" :key="sectionIndex" class="structured-article__section">
      <h2>{{ section.heading }}</h2>
      <ArticleContentBlocks :blocks="section.blocks" />
    </section>

    <aside v-if="content.advisorAdvice.enabled && content.advisorAdvice.blocks.length" class="structured-article__advisor">
      <h2>{{ content.advisorAdvice.title }}</h2>
      <ArticleContentBlocks :blocks="content.advisorAdvice.blocks" />
    </aside>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.structured-article { display: grid; min-width: 0; gap: clamp(2rem, 4vw, 3.5rem); overflow-wrap: anywhere; color: var(--text-main); font-size: $kqc-type-body-emphasis; line-height: 1.9; }
.structured-article__section { display: grid; gap: $kqc-spacing-md; }
.structured-article h2 { margin: 0; font-size: clamp(1.45rem, 3vw, 2rem); line-height: 1.4; }
.structured-article p { margin: 0; }
.structured-article__news { display: grid; gap: $kqc-spacing-sm; padding: $kqc-spacing-md $kqc-spacing-lg; border-inline-start: 3px solid color-mix(in srgb, var(--accent-active) 70%, transparent); background: color-mix(in srgb, var(--accent-active) 6%, transparent); }
.structured-article__news h2 { font-size: $kqc-type-section-title; }
.structured-article__source { display: flex; min-width: 0; flex-wrap: wrap; align-items: center; gap: $kqc-spacing-xs $kqc-spacing-md; color: var(--text-muted); font-size: $kqc-type-metadata; }
.structured-article__source a { color: var(--accent-active); font-weight: 650; text-decoration: none; overflow-wrap: anywhere; }
.structured-article__advisor { display: grid; gap: $kqc-spacing-md; padding: clamp(1.25rem, 3vw, 2rem); border-block: 1px solid color-mix(in srgb, var(--accent-active) 38%, var(--border-grey)); background: color-mix(in srgb, var(--accent-active) 4%, transparent); }
.structured-article__advisor > h2 { color: var(--accent-active); }
@media (max-width: $breakpoint-sm) {
  .structured-article { gap: $kqc-spacing-xl; font-size: $kqc-type-body; line-height: 1.8; }
  .structured-article__news, .structured-article__advisor { padding: $kqc-spacing-md; }
}
</style>
