<script setup lang="ts">
import { toRaw } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import ArticleContentBlocksEditor from './ArticleContentBlocksEditor.vue'
import type { StructuredArticleContent } from '@/api/adminArticles'
import { ARTICLE_SECTION_MAX, createArticleBlock, createArticleSection } from '@/utils/articleStructuredContent'

const props = defineProps<{ modelValue: StructuredArticleContent; errors: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: StructuredArticleContent] }>()
const eventText = (event: Event) => (event.target as HTMLInputElement | HTMLTextAreaElement).value
const eventChecked = (event: Event) => (event.target as HTMLInputElement).checked
// Structured Article Editor — Optional Content Toggles
// WEB-1F-D2D-B1 Browser Review R3
const update = (change: (draft: StructuredArticleContent) => void) => {
  const draft = structuredClone(toRaw(props.modelValue)); change(draft); emit('update:modelValue', draft)
}
const toggleNews = (enabled: boolean) => update((draft) => {
  draft.newsSummary = enabled
    ? { enabled: true, content: '', sourceName: '', sourceUrl: '' }
    : { enabled: false, content: null, sourceName: null, sourceUrl: null }
})
const toggleAdvisor = (enabled: boolean) => update((draft) => {
  draft.advisorAdvice.enabled = enabled
  if (enabled && !draft.advisorAdvice.blocks.length) draft.advisorAdvice.blocks = [createArticleBlock()]
  if (!enabled) draft.advisorAdvice.blocks = []
})
const addSection = () => update((draft) => { if (draft.sections.length < ARTICLE_SECTION_MAX) draft.sections.push(createArticleSection()) })
const moveSection = (index: number, offset: number) => update((draft) => {
  const target = index + offset
  if (target < 0 || target >= draft.sections.length) return
  ;[draft.sections[index], draft.sections[target]] = [draft.sections[target], draft.sections[index]]
})
const removeSection = (index: number) => update((draft) => { if (draft.sections.length > 1) draft.sections.splice(index, 1) })
</script>

<template>
  <!-- Industry Insights — Platform Manager Article Editor
       Structured Article Editor / WEB-1F-D2D-B1 -->
  <section class="structured-editor" aria-labelledby="structured-editor-title">
    <header><div><h2 id="structured-editor-title">文章內容</h2><p>以新聞摘要、正文段落與顧問建議建立文章。</p></div><strong>結構化模式</strong></header>
    <Message v-if="errors.length" severity="error" :closable="false"><ul><li v-for="error in errors" :key="error">{{ error }}</li></ul></Message>

    <fieldset class="editor-group">
      <legend>新聞摘要（可選）</legend>
      <label class="toggle"><input type="checkbox" :checked="modelValue.newsSummary.enabled" @change="toggleNews(eventChecked($event))">加入新聞摘要</label>
      <small>「文章摘要」用於文章列表；此處「新聞摘要」只顯示於文章詳細內容。</small>
      <div v-if="modelValue.newsSummary.enabled" class="group-fields">
        <label>新聞摘要內容<Textarea :value="modelValue.newsSummary.content || ''" rows="5" maxlength="5000" @input="update((draft) => { draft.newsSummary.content = eventText($event) })" /></label>
        <label>新聞來源名稱<InputText :value="modelValue.newsSummary.sourceName || ''" maxlength="200" @input="update((draft) => { draft.newsSummary.sourceName = eventText($event) })" /></label>
        <label>新聞來源網址<InputText :value="modelValue.newsSummary.sourceUrl || ''" type="url" maxlength="2000" placeholder="https://" @input="update((draft) => { draft.newsSummary.sourceUrl = eventText($event) })" /></label>
      </div>
    </fieldset>

    <section class="editor-group" aria-labelledby="article-sections-title">
      <header><div><h3 id="article-sections-title">正文</h3><small>{{ modelValue.sections.length }} / {{ ARTICLE_SECTION_MAX }}</small></div><Button type="button" outlined size="small" label="＋ 新增章節" :disabled="modelValue.sections.length >= ARTICLE_SECTION_MAX" @click="addSection" /></header>
      <article v-for="(section, sectionIndex) in modelValue.sections" :key="sectionIndex" class="article-section">
        <header><strong>章節 {{ sectionIndex + 1 }}</strong><div class="section-actions"><Button type="button" text size="small" label="↑" :aria-label="`章節 ${sectionIndex + 1} 上移`" :title="`章節 ${sectionIndex + 1} 上移`" :disabled="sectionIndex === 0" @click="moveSection(sectionIndex, -1)" /><Button type="button" text size="small" label="↓" :aria-label="`章節 ${sectionIndex + 1} 下移`" :title="`章節 ${sectionIndex + 1} 下移`" :disabled="sectionIndex === modelValue.sections.length - 1" @click="moveSection(sectionIndex, 1)" /><Button type="button" text size="small" severity="danger" label="刪除" :aria-label="`刪除章節 ${sectionIndex + 1}`" :title="`刪除章節 ${sectionIndex + 1}`" :disabled="modelValue.sections.length === 1" @click="removeSection(sectionIndex)" /></div></header>
        <label>段落標題<InputText :value="section.heading" maxlength="120" @input="update((draft) => { draft.sections[sectionIndex].heading = eventText($event) })" /></label>
        <ArticleContentBlocksEditor :model-value="section.blocks" :owner-label="`章節 ${sectionIndex + 1}`" @update:model-value="update((draft) => { draft.sections[sectionIndex].blocks = $event })" />
      </article>
    </section>

    <fieldset class="editor-group">
      <legend>KQC 顧問建議（可選）</legend>
      <label class="toggle"><input type="checkbox" :checked="modelValue.advisorAdvice.enabled" @change="toggleAdvisor(eventChecked($event))">加入 KQC 顧問建議</label>
      <div v-if="modelValue.advisorAdvice.enabled" class="group-fields">
        <label>顧問建議標題<InputText :value="modelValue.advisorAdvice.title" maxlength="120" @input="update((draft) => { draft.advisorAdvice.title = eventText($event) })" /></label>
        <ArticleContentBlocksEditor :model-value="modelValue.advisorAdvice.blocks" owner-label="KQC 顧問建議" @update:model-value="update((draft) => { draft.advisorAdvice.blocks = $event })" />
      </div>
    </fieldset>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.structured-editor, .group-fields { display: grid; gap: $kqc-spacing-sm; }
.structured-editor > header, .editor-group > header, .article-section > header, .section-actions { display: flex; align-items: center; justify-content: space-between; gap: $kqc-spacing-sm; }
h2, h3, p { margin: 0; }
.structured-editor > header p, small { color: var(--text-muted); }
.editor-group { display: grid; min-width: 0; gap: $kqc-spacing-sm; margin: 0; padding: $kqc-spacing-sm $kqc-spacing-md; border: 1px solid var(--border-grey); border-radius: $kqc-radius-md; }
.editor-group legend { padding: 0 $kqc-spacing-xs; font-weight: 700; }
.toggle { display: inline-flex; width: fit-content; align-items: center; justify-content: flex-start; gap: $kqc-spacing-xs; white-space: nowrap; }
.structured-editor .toggle > input[type='checkbox'] { width: 1rem; max-width: 1rem; height: 1rem; flex: 0 0 1rem; margin: 0; }
.article-section { display: grid; gap: $kqc-spacing-sm; padding: $kqc-spacing-sm; border: 1px solid color-mix(in srgb, var(--border-grey) 75%, transparent); border-radius: $kqc-radius-md; background: var(--bg-card); }
.article-section label, .group-fields label { display: grid; gap: $kqc-spacing-xs; }
.section-actions :deep(.p-button) { min-width: 2.5rem; padding-inline: $kqc-spacing-xs; }
@media (max-width: 48rem) { .editor-group > header, .article-section > header { align-items: flex-start; flex-direction: column; } .section-actions { width: 100%; flex-wrap: wrap; justify-content: flex-start; } }
</style>
