// D2D-B1B — KQC Quick Import Parser
// Deterministically converts reviewed KQC import text into the existing
// structuredContent contract. No fuzzy parsing, AI calls, or backend fields.

export class ArticleQuickImportError extends Error {}

const fail = (message) => { throw new ArticleQuickImportError(message) }
const segments = (text) => [{ text, marks: [] }]
const bulletPattern = /^[-•](?:\s+|$)(.*)$/
const numberedPattern = /^\d+\.(?:\s+|$)(.*)$/

const normalizeLines = (input) => String(input ?? '')
  .replace(/\r\n?/g, '\n')
  .trim()
  .split('\n')
  .filter((line) => !['【文章匯入本文開始】', '【文章匯入本文結束】'].includes(line.trim()))

const parseBlocks = (lines, owner) => {
  const blocks = []
  let index = 0
  const add = (block) => {
    blocks.push(block)
    if (blocks.length > 10) fail(`${owner}共有 ${blocks.length} 個內容區塊，最多只能有 10 個。`)
  }
  while (index < lines.length) {
    const current = lines[index].trim()
    if (!current) { index += 1; continue }
    if (current === '【重點提醒】') {
      index += 1
      const content = []
      while (index < lines.length) {
        const line = lines[index].trim()
        if (!line || line === '【重點提醒】' || bulletPattern.test(line) || numberedPattern.test(line)) break
        content.push(line); index += 1
      }
      if (!content.length) fail(`${owner}的「【重點提醒】」後沒有內容。`)
      add({ type: 'CALLOUT', title: null, content: segments(content.join('\n')) })
      continue
    }
    const bullet = current.match(bulletPattern)
    if (bullet) {
      const items = []
      while (index < lines.length) {
        const match = lines[index].trim().match(bulletPattern)
        if (!match) break
        if (!match[1].trim()) fail(`${owner}的項目符號清單含有空白項目。`)
        items.push(segments(match[1].trim())); index += 1
      }
      if (items.length > 10) fail(`${owner}的項目符號清單共有 ${items.length} 項，最多只能有 10 項。`)
      add({ type: 'BULLET_LIST', items }); continue
    }
    const numbered = current.match(numberedPattern)
    if (numbered) {
      const items = []
      while (index < lines.length) {
        const match = lines[index].trim().match(numberedPattern)
        if (!match) break
        if (!match[1].trim()) fail(`${owner}的編號清單含有空白項目。`)
        items.push(segments(match[1].trim())); index += 1
      }
      if (items.length > 10) fail(`${owner}的編號清單共有 ${items.length} 項，最多只能有 10 項。`)
      add({ type: 'NUMBERED_LIST', items }); continue
    }
    if (/^[-•](?:\s|$)/.test(current)) fail(`${owner}的項目符號清單含有空白項目。`)
    if (/^\d+\.(?:\s|$)/.test(current)) fail(`${owner}的編號清單含有空白項目。`)
    const paragraph = []
    while (index < lines.length) {
      const line = lines[index].trim()
      if (!line || line === '【重點提醒】' || bulletPattern.test(line) || numberedPattern.test(line)) break
      paragraph.push(line); index += 1
    }
    add({ type: 'PARAGRAPH', content: segments(paragraph.join('\n')) })
  }
  return blocks
}

const safeHttpUrl = (value) => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol) }
  catch { return false }
}

export const parseKqcArticleImport = (input) => {
  const lines = normalizeLines(input)
  const regions = []
  let active = null
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/)
    if (heading) {
      active = { heading: heading[1].trim(), lines: [] }
      if (!active.heading) fail('無法辨識文章結構：章節標題不可空白。')
      regions.push(active); continue
    }
    if (!active) {
      if (line.trim()) fail('無法辨識文章結構：內容必須放在以「## 」開頭的標題之後。')
      continue
    }
    active.lines.push(line)
  }

  const newsRegions = regions.filter(({ heading }) => heading === '新聞摘要')
  const advisorRegions = regions.filter(({ heading }) => heading === 'KQC 顧問建議')
  if (newsRegions.length > 1) fail('「## 新聞摘要」只能出現一次。')
  if (advisorRegions.length > 1) fail('「## KQC 顧問建議」只能出現一次。')

  let newsSummary = { enabled: false, content: null, sourceName: null, sourceUrl: null }
  if (newsRegions.length) {
    const region = newsRegions[0]
    const sourceLine = region.lines.find((line) => line.trim().startsWith('來源：'))
    const urlLine = region.lines.find((line) => line.trim().startsWith('網址：'))
    const content = region.lines.filter((line) => line !== sourceLine && line !== urlLine).join('\n').trim()
    const sourceName = sourceLine?.trim().slice('來源：'.length).trim() || ''
    const sourceUrl = urlLine?.trim().slice('網址：'.length).trim() || ''
    if (!content) fail('新聞摘要已啟用，但缺少摘要內容。')
    if (!sourceName) fail('新聞摘要已啟用，但缺少「來源：」。')
    if (!sourceUrl) fail('新聞摘要已啟用，但缺少「網址：」。')
    if (!safeHttpUrl(sourceUrl)) fail('新聞摘要的「網址：」必須是 http 或 https 網址。')
    newsSummary = { enabled: true, content, sourceName, sourceUrl }
  }

  const normalRegions = regions.filter(({ heading }) => !['新聞摘要', 'KQC 顧問建議'].includes(heading))
  if (!normalRegions.length) fail('無法辨識文章結構：至少需要 1 個以「## 」開頭的正文章節。')
  if (normalRegions.length > 5) fail(`正文章節共有 ${normalRegions.length} 個，最多只能有 5 個。`)
  const sections = normalRegions.map((region, index) => {
    const blocks = parseBlocks(region.lines, `第 ${index + 1} 個章節`)
    if (!blocks.length) fail(`第 ${index + 1} 個章節「${region.heading}」沒有內容。`)
    return { heading: region.heading, blocks }
  })

  let advisorAdvice = { enabled: false, title: 'KQC 顧問建議', blocks: [] }
  if (advisorRegions.length) {
    const blocks = parseBlocks(advisorRegions[0].lines, 'KQC 顧問建議')
    if (!blocks.length) fail('KQC 顧問建議標題存在，但沒有內容。')
    advisorAdvice = { enabled: true, title: 'KQC 顧問建議', blocks }
  }
  return { newsSummary, sections, advisorAdvice }
}

export const hasMeaningfulStructuredContent = (value) => {
  if (value.newsSummary.enabled || value.advisorAdvice.enabled) return true
  if (value.sections.length !== 1 || value.sections[0].blocks.length !== 1) return true
  const section = value.sections[0]
  const block = section.blocks[0]
  return Boolean(section.heading.trim() || block.type !== 'PARAGRAPH' || block.content.some(({ text }) => text.trim()))
}
