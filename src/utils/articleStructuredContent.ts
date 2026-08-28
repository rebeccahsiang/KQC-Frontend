import { toRaw } from 'vue'
import type {
  ArticleContentBlock, ArticleSection, RichTextSegment, StructuredArticleContent,
} from '@/api/adminArticles'

export const ARTICLE_SECTION_MAX = 5
export const ARTICLE_BLOCK_MAX = 10
export const ARTICLE_LIST_ITEM_MAX = 10

const plainSegment = (text = ''): RichTextSegment[] => [{ text, marks: [] }]
export const richTextPlainText = (segments: RichTextSegment[]) => segments.map(({ text }) => text).join('')

// ============================================================
// Structured Content Mapping — preserve controlled marks until text changes.
// WEB-1F-D2D-B1
// ============================================================
export const updateRichText = (segments: RichTextSegment[], text: string): RichTextSegment[] =>
  richTextPlainText(segments) === text ? segments : plainSegment(text)

export const createArticleBlock = (type: ArticleContentBlock['type'] = 'PARAGRAPH'): ArticleContentBlock => {
  if (type === 'BULLET_LIST' || type === 'NUMBERED_LIST') return { type, items: [plainSegment()] }
  if (type === 'CALLOUT') return { type, title: null, content: plainSegment() }
  return { type: 'PARAGRAPH', content: plainSegment() }
}

export const createArticleSection = (): ArticleSection => ({ heading: '', blocks: [createArticleBlock()] })

export const createStructuredArticleContent = (): StructuredArticleContent => ({
  newsSummary: { enabled: false, content: null, sourceName: null, sourceUrl: null },
  sections: [createArticleSection()],
  advisorAdvice: { enabled: false, title: 'KQC 顧問建議', blocks: [] },
})

// D2D-B1B — Article Create Round Trip / Structured Article Save
// Unwrap Vue form proxies before payload cloning so Create reaches the API.
export const cloneStructuredArticleContent = (value: StructuredArticleContent): StructuredArticleContent =>
  structuredClone(toRaw(value))

// WEB-1F-D2D-B1 Build Gate R2 — Discriminated Union mapping.
const blockLines = (block: ArticleContentBlock) => {
  switch (block.type) {
    case 'PARAGRAPH':
      return [richTextPlainText(block.content).trim()]
    case 'BULLET_LIST':
      return block.items.map((item) => `- ${richTextPlainText(item).trim()}`)
    case 'NUMBERED_LIST':
      return block.items.map((item, index) => `${index + 1}. ${richTextPlainText(item).trim()}`)
    case 'CALLOUT':
      return [block.title?.trim() || '', richTextPlainText(block.content).trim()].filter(Boolean)
  }
}

// ============================================================
// Legacy Content Fallback — deterministic Backend compatibility text.
// WEB-1F-D2D-B1
// ============================================================
export const buildLegacyContentFallback = (value: StructuredArticleContent) => {
  const groups: string[] = []
  if (value.newsSummary.enabled) groups.push(['新聞摘要', value.newsSummary.content?.trim() || ''].filter(Boolean).join('\n'))
  for (const section of value.sections) {
    groups.push([section.heading.trim(), ...section.blocks.flatMap(blockLines)].filter(Boolean).join('\n'))
  }
  if (value.advisorAdvice.enabled) {
    groups.push([value.advisorAdvice.title.trim() || 'KQC 顧問建議', ...value.advisorAdvice.blocks.flatMap(blockLines)].filter(Boolean).join('\n'))
  }
  return groups.filter(Boolean).join('\n\n')
}

export const validateStructuredArticleContent = (value: StructuredArticleContent): string[] => {
  const errors: string[] = []
  const validateBlocks = (blocks: ArticleContentBlock[], owner: string) => {
    if (blocks.length < 1 || blocks.length > ARTICLE_BLOCK_MAX) errors.push(`${owner}必須有 1–10 個內容區塊。`)
    blocks.forEach((block, index) => {
      const label = `${owner}第 ${index + 1} 個區塊`
      if (block.type === 'PARAGRAPH' && !richTextPlainText(block.content).trim()) errors.push(`${label}的段落內容不可空白。`)
      if (block.type === 'CALLOUT' && !richTextPlainText(block.content).trim()) errors.push(`${label}的重點提醒內容不可空白。`)
      if (block.type === 'BULLET_LIST' || block.type === 'NUMBERED_LIST') {
        if (block.items.length < 1 || block.items.length > ARTICLE_LIST_ITEM_MAX) errors.push(`${label}必須有 1–10 個清單項目。`)
        if (block.items.some((item) => !richTextPlainText(item).trim())) errors.push(`${label}的清單項目不可空白。`)
      }
    })
  }
  if (value.sections.length < 1 || value.sections.length > ARTICLE_SECTION_MAX) errors.push('正文必須有 1–5 個文章段落。')
  value.sections.forEach((section, index) => {
    if (!section.heading.trim()) errors.push(`章節 ${index + 1} 的段落標題不可空白。`)
    validateBlocks(section.blocks, `章節 ${index + 1} `)
  })
  if (value.newsSummary.enabled) {
    if (!value.newsSummary.content?.trim()) errors.push('新聞摘要內容不可空白。')
    if (!value.newsSummary.sourceName?.trim()) errors.push('新聞來源名稱不可空白。')
    const sourceUrl = value.newsSummary.sourceUrl?.trim() || ''
    if (!sourceUrl) errors.push('新聞來源網址不可空白。')
    else {
      try { if (!['http:', 'https:'].includes(new URL(sourceUrl).protocol)) throw new Error() }
      catch { errors.push('新聞來源網址必須使用 http 或 https。') }
    }
  }
  if (value.advisorAdvice.enabled) {
    if (!value.advisorAdvice.title.trim()) errors.push('KQC 顧問建議標題不可空白。')
    validateBlocks(value.advisorAdvice.blocks, 'KQC 顧問建議')
  }
  return errors
}
