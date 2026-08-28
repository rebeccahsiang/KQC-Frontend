<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import type { StructuredArticleContent } from '@/api/adminArticles'
import { ArticleQuickImportError, hasMeaningfulStructuredContent, parseKqcArticleImport } from '@/utils/articleQuickImport'

const props = defineProps<{ modelValue: string; currentContent: StructuredArticleContent }>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  apply: [value: StructuredArticleContent]
  close: []
}>()
const parseError = ref('')
const pendingContent = ref<StructuredArticleContent | null>(null)
const needsConfirmation = ref(false)
const rawText = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })

// D2D-B1B — Structured Content Import
// Applies parser output atomically and requires confirmation before replacing
// meaningful editor content. Raw import text remains frontend-session-only.
const convert = () => {
  parseError.value = ''; pendingContent.value = null; needsConfirmation.value = false
  try {
    const parsed = parseKqcArticleImport(rawText.value)
    if (hasMeaningfulStructuredContent(props.currentContent)) {
      pendingContent.value = parsed; needsConfirmation.value = true; return
    }
    emit('apply', parsed)
  } catch (error) {
    parseError.value = error instanceof ArticleQuickImportError ? error.message : '無法辨識文章結構，請檢查匯入格式。'
  }
}
const confirmReplace = () => {
  if (!pendingContent.value) return
  emit('apply', pendingContent.value); pendingContent.value = null; needsConfirmation.value = false
}
const cancelReplace = () => { pendingContent.value = null; needsConfirmation.value = false }
</script>

<template>
  <section class="quick-import" aria-labelledby="quick-import-title">
    <header><div><h2 id="quick-import-title">快速匯入文章</h2><p>貼上 AI 產生並完成審稿的 KQC 文章匯入本文。</p></div><Button type="button" text label="收起" @click="emit('close')" /></header>
    <Textarea v-model="rawText" rows="16" aria-label="KQC 文章匯入本文" placeholder="## 新聞摘要

新聞摘要內容……

來源：交通部
網址：https://example.com/news

## 營運成本變化

正文內容……

- 車輛成本
- 人力成本

## KQC 顧問建議

顧問建議內容……" />
    <details><summary>查看 KQC 匯入格式</summary><p>使用「## 」建立新聞摘要、正文章節與 KQC 顧問建議；支援段落、- 或 • 項目、數字清單，以及【重點提醒】。</p></details>
    <Message v-if="parseError" severity="error" :closable="false">{{ parseError }}</Message>
    <aside v-if="needsConfirmation" class="overwrite-confirmation" role="alertdialog" aria-labelledby="overwrite-title" aria-describedby="overwrite-description">
      <strong id="overwrite-title">目前已有文章內容</strong>
      <p id="overwrite-description">重新匯入將取代目前的新聞摘要、正文與 KQC 顧問建議。已完成的手動修改也會被取代。</p>
      <div><Button type="button" text label="取消" @click="cancelReplace" /><Button type="button" severity="danger" label="確認重新匯入" @click="confirmReplace" /></div>
    </aside>
    <footer><Button type="button" text label="清除" :disabled="!rawText" @click="rawText = ''" /><Button type="button" label="轉為結構化內容" :disabled="!rawText.trim()" @click="convert" /></footer>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.quick-import { display: grid; gap: $kqc-spacing-md; padding: $kqc-spacing-md; border: 1px solid var(--border-grey); border-radius: $kqc-radius-md; }
.quick-import > header, .quick-import > footer, .overwrite-confirmation > div { display: flex; align-items: center; justify-content: space-between; gap: $kqc-spacing-sm; }
h2, p { margin: 0; }
.quick-import > header p, details { color: var(--text-muted); }
.quick-import :deep(textarea) { width: 100%; min-height: 18rem; resize: vertical; }
.overwrite-confirmation { display: grid; gap: $kqc-spacing-sm; padding: $kqc-spacing-md; border: 1px solid var(--danger, #d45b5b); border-radius: $kqc-radius-md; background: color-mix(in srgb, var(--danger, #d45b5b) 10%, var(--bg-card)); }
.overwrite-confirmation > div, .quick-import > footer { justify-content: flex-end; }
@media (max-width: 48rem) { .quick-import > header { align-items: flex-start; flex-direction: column; } .quick-import > footer { flex-wrap: wrap; } }
</style>
