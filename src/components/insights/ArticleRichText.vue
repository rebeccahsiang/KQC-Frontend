<script lang="ts">
import { Fragment, defineComponent, h, type PropType, type VNodeChild } from 'vue'
import type { RichTextMark, RichTextSegment } from '@/api/adminArticles'

const safeHttpUrl = (value: string | undefined) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? value : null
  } catch { return null }
}

// D2D-B2 — Controlled Rich Text Rendering / Article Content Safety
// Applies only the canonical mark allowlist with deterministic nesting.
// Segment text always remains an escaped Vue text node.
export default defineComponent({
  name: 'ArticleRichText',
  props: { segments: { type: Array as PropType<RichTextSegment[]>, required: true } },
  setup(props) {
    const renderSegment = (segment: RichTextSegment, index: number) => {
      const firstByType = new Map<RichTextMark['type'], RichTextMark>()
      for (const mark of segment.marks || []) {
        if (['BOLD', 'ITALIC', 'EMPHASIS', 'LINK'].includes(mark.type) && !firstByType.has(mark.type)) firstByType.set(mark.type, mark)
      }
      let node: VNodeChild = segment.text
      const link = firstByType.get('LINK')
      if (link?.type === 'LINK') {
        const href = safeHttpUrl(link.href)
        if (href) node = h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, [node])
      }
      if (firstByType.has('EMPHASIS')) node = h('span', { class: 'article-rich-text__emphasis' }, [node])
      if (firstByType.has('ITALIC')) node = h('em', null, [node])
      if (firstByType.has('BOLD')) node = h('strong', null, [node])
      return h(Fragment, { key: index }, [node])
    }
    return () => h(Fragment, null, props.segments.map(renderSegment))
  },
})
</script>

<style scoped lang="scss">
.article-rich-text__emphasis { color: var(--accent-active); font-weight: 600; }
:deep(a) { color: var(--accent-active); text-decoration: underline; text-decoration-thickness: 0.08em; text-underline-offset: 0.18em; overflow-wrap: anywhere; }
</style>
