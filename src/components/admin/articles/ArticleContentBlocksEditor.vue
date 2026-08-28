<script setup lang="ts">
import { toRaw } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import type { ArticleContentBlock } from '@/api/adminArticles'
import {
  ARTICLE_BLOCK_MAX, ARTICLE_LIST_ITEM_MAX, createArticleBlock, richTextPlainText, updateRichText,
} from '@/utils/articleStructuredContent'

const props = defineProps<{ modelValue: ArticleContentBlock[]; ownerLabel: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: ArticleContentBlock[]] }>()
// Structured Article Editor — Article Content Blocks / Continuous Text Editing
// WEB-1F-D2D-B1 Browser Review R5
const clone = () => structuredClone(toRaw(props.modelValue))
const eventText = (event: Event) => (event.target as HTMLInputElement | HTMLTextAreaElement).value
const commit = (blocks: ArticleContentBlock[]) => emit('update:modelValue', blocks)
const addBlock = (type: ArticleContentBlock['type']) => {
  if (props.modelValue.length >= ARTICLE_BLOCK_MAX) return
  commit([...clone(), createArticleBlock(type)])
}
const moveBlock = (index: number, offset: number) => {
  const blocks = clone(); const target = index + offset
  if (target < 0 || target >= blocks.length) return
  ;[blocks[index], blocks[target]] = [blocks[target], blocks[index]]; commit(blocks)
}
const removeBlock = (index: number) => {
  if (props.modelValue.length <= 1) return
  const blocks = clone(); blocks.splice(index, 1); commit(blocks)
}
const updateContent = (index: number, text: string) => {
  const blocks = clone(); const block = blocks[index]
  if (block.type === 'PARAGRAPH' || block.type === 'CALLOUT') block.content = updateRichText(block.content, text)
  commit(blocks)
}
const updateCalloutTitle = (index: number, title: string) => {
  const blocks = clone(); const block = blocks[index]
  if (block.type === 'CALLOUT') block.title = title || null
  commit(blocks)
}
const updateItem = (blockIndex: number, itemIndex: number, text: string) => {
  const blocks = clone(); const block = blocks[blockIndex]
  if (block.type === 'BULLET_LIST' || block.type === 'NUMBERED_LIST') block.items[itemIndex] = updateRichText(block.items[itemIndex], text)
  commit(blocks)
}
const addItem = (blockIndex: number) => {
  const blocks = clone(); const block = blocks[blockIndex]
  if ((block.type === 'BULLET_LIST' || block.type === 'NUMBERED_LIST') && block.items.length < ARTICLE_LIST_ITEM_MAX) block.items.push([{ text: '', marks: [] }])
  commit(blocks)
}
const removeItem = (blockIndex: number, itemIndex: number) => {
  const blocks = clone(); const block = blocks[blockIndex]
  if ((block.type === 'BULLET_LIST' || block.type === 'NUMBERED_LIST') && block.items.length > 1) block.items.splice(itemIndex, 1)
  commit(blocks)
}
</script>

<template>
  <!-- Article Content Blocks — shared by正文 and KQC Advisor Advice / WEB-1F-D2D-B1 -->
  <div class="block-editor">
    <article v-for="(block, blockIndex) in modelValue" :key="blockIndex" class="content-block">
      <header>
        <strong>{{ block.type === 'PARAGRAPH' ? '段落' : block.type === 'BULLET_LIST' ? '項目符號' : block.type === 'NUMBERED_LIST' ? '編號清單' : '重點提醒' }}</strong>
        <div v-if="modelValue.length > 1" class="compact-actions">
          <Button type="button" text size="small" label="↑" :aria-label="`${ownerLabel}第 ${blockIndex + 1} 個區塊上移`" :title="`${ownerLabel}第 ${blockIndex + 1} 個區塊上移`" :disabled="blockIndex === 0" @click="moveBlock(blockIndex, -1)" />
          <Button type="button" text size="small" label="↓" :aria-label="`${ownerLabel}第 ${blockIndex + 1} 個區塊下移`" :title="`${ownerLabel}第 ${blockIndex + 1} 個區塊下移`" :disabled="blockIndex === modelValue.length - 1" @click="moveBlock(blockIndex, 1)" />
          <Button type="button" text size="small" severity="danger" label="刪除" :aria-label="`${ownerLabel}第 ${blockIndex + 1} 個區塊刪除`" :title="`${ownerLabel}第 ${blockIndex + 1} 個區塊刪除`" :disabled="modelValue.length === 1" @click="removeBlock(blockIndex)" />
        </div>
      </header>
      <label v-if="block.type === 'CALLOUT'">標題（選填）<InputText :value="block.title || ''" maxlength="120" @input="updateCalloutTitle(blockIndex, eventText($event))" /></label>
      <label v-if="block.type === 'PARAGRAPH' || block.type === 'CALLOUT'">
        {{ block.type === 'CALLOUT' ? '內容' : '段落內容' }}
        <Textarea :value="richTextPlainText(block.content)" rows="3" maxlength="4000" @input="updateContent(blockIndex, eventText($event))" />
      </label>
      <div v-else class="list-items">
        <label v-for="(item, itemIndex) in block.items" :key="itemIndex">
          項目 {{ itemIndex + 1 }}
          <span class="list-item-row">
            <InputText :value="richTextPlainText(item)" maxlength="4000" @input="updateItem(blockIndex, itemIndex, eventText($event))" />
            <Button type="button" text severity="danger" label="刪除項目" :aria-label="`${ownerLabel}第 ${blockIndex + 1} 個區塊刪除項目 ${itemIndex + 1}`" :disabled="block.items.length === 1" @click="removeItem(blockIndex, itemIndex)" />
          </span>
        </label>
        <Button type="button" outlined size="small" label="＋ 新增項目" :disabled="block.items.length >= ARTICLE_LIST_ITEM_MAX" @click="addItem(blockIndex)" />
        <small>{{ block.items.length }} / {{ ARTICLE_LIST_ITEM_MAX }}</small>
      </div>
    </article>
    <div class="add-blocks" role="group" :aria-label="`${ownerLabel}新增內容區塊`">
      <Button type="button" outlined size="small" label="＋ 段落" :disabled="modelValue.length >= ARTICLE_BLOCK_MAX" @click="addBlock('PARAGRAPH')" />
      <Button type="button" outlined size="small" label="＋ 項目符號" :disabled="modelValue.length >= ARTICLE_BLOCK_MAX" @click="addBlock('BULLET_LIST')" />
      <Button type="button" outlined size="small" label="＋ 編號清單" :disabled="modelValue.length >= ARTICLE_BLOCK_MAX" @click="addBlock('NUMBERED_LIST')" />
      <Button type="button" outlined size="small" label="＋ 重點提醒" :disabled="modelValue.length >= ARTICLE_BLOCK_MAX" @click="addBlock('CALLOUT')" />
      <small>{{ modelValue.length }} / {{ ARTICLE_BLOCK_MAX }}</small>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.block-editor, .list-items { display: grid; gap: $kqc-spacing-xs; }
.content-block { display: grid; gap: $kqc-spacing-xs; padding: $kqc-spacing-sm; border: 1px solid color-mix(in srgb, var(--border-grey) 68%, transparent); border-radius: $kqc-radius-sm; background: color-mix(in srgb, var(--bg-card) 94%, black); }
.content-block > header, .compact-actions, .add-blocks, .list-item-row { display: flex; align-items: center; gap: $kqc-spacing-xs; }
.content-block > header { justify-content: space-between; flex-wrap: wrap; }
.content-block label { display: grid; gap: $kqc-spacing-xs; }
.list-item-row > :first-child { flex: 1; min-width: 0; }
.compact-actions :deep(.p-button) { min-width: 2.5rem; padding-inline: $kqc-spacing-xs; }
.add-blocks { flex-wrap: wrap; row-gap: $kqc-spacing-xs; }
.add-blocks small { margin-left: auto; color: var(--text-muted); }
</style>
