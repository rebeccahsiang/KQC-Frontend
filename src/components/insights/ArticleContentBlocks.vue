<script setup lang="ts">
import ArticleRichText from './ArticleRichText.vue'
import type { ArticleContentBlock } from '@/api/adminArticles'

defineProps<{ blocks: ArticleContentBlock[] }>()
const calloutTitle = (block: ArticleContentBlock) => block.type === 'CALLOUT' && block.title?.trim() ? block.title : '重點提醒'
</script>

<template>
  <!-- D2D-B2 — Controlled Article Content Blocks -->
  <template v-for="(block, blockIndex) in blocks" :key="blockIndex">
    <p v-if="block.type === 'PARAGRAPH'" class="article-blocks__paragraph"><ArticleRichText :segments="block.content" /></p>
    <ul v-else-if="block.type === 'BULLET_LIST'" class="article-blocks__list"><li v-for="(item, itemIndex) in block.items" :key="itemIndex"><ArticleRichText :segments="item" /></li></ul>
    <ol v-else-if="block.type === 'NUMBERED_LIST'" class="article-blocks__list"><li v-for="(item, itemIndex) in block.items" :key="itemIndex"><ArticleRichText :segments="item" /></li></ol>
    <aside v-else-if="block.type === 'CALLOUT'" class="article-blocks__callout">
      <h3>{{ calloutTitle(block) }}</h3><p><ArticleRichText :segments="block.content" /></p>
    </aside>
  </template>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.article-blocks__paragraph { margin: 0; white-space: pre-wrap; }
/* D2D-B2 R9 — Public Structured List Markers */
.article-blocks__list { display: grid; gap: $kqc-spacing-xs; margin: 0; padding-inline-start: 1.5rem; }
ul.article-blocks__list { list-style-type: disc; }
ol.article-blocks__list { list-style-type: decimal; }
.article-blocks__list li { padding-inline-start: $kqc-spacing-xs; }
.article-blocks__callout { display: grid; gap: $kqc-spacing-xs; padding: $kqc-spacing-md $kqc-spacing-lg; border: 1px solid color-mix(in srgb, var(--accent-active) 30%, var(--border-grey)); border-inline-start: 4px solid var(--accent-active); border-radius: $kqc-radius-md; background: color-mix(in srgb, var(--accent-active) 5%, var(--bg-card)); }
.article-blocks__callout h3, .article-blocks__callout p { margin: 0; }
.article-blocks__callout h3 { color: var(--accent-active); font-size: $kqc-type-body-emphasis; }
@media (max-width: $breakpoint-sm) {
  .article-blocks__callout { padding: $kqc-spacing-md; }
  .article-blocks__list { padding-inline-start: 1.25rem; }
}
</style>
