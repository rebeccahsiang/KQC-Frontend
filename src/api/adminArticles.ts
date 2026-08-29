import api from './axios'

// ============================================================
// Industry Insights — Admin Article API
// WEB-1F-D2A
// ============================================================
interface Envelope<T> { success: true; data: T }
export type ArticleCategory = 'BUSINESS_MANAGEMENT' | 'TRANSPORT_KNOWLEDGE' | 'MARKET_TREND' | 'BUSINESS_TRANSFORMATION' | 'POLICY_REGULATION' | 'KQC_NEWS'
export type ArticleStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED'
export type RichTextMark =
  | { type: 'BOLD' | 'ITALIC' | 'EMPHASIS' }
  | { type: 'LINK'; href: string }
export interface RichTextSegment { text: string; marks: RichTextMark[] }
export type ArticleContentBlock =
  | { type: 'PARAGRAPH'; content: RichTextSegment[] }
  | { type: 'BULLET_LIST' | 'NUMBERED_LIST'; items: RichTextSegment[][] }
  | { type: 'CALLOUT'; title: string | null; content: RichTextSegment[] }
export interface ArticleSection { heading: string; blocks: ArticleContentBlock[] }
export interface NewsSummary { enabled: boolean; content: string | null; sourceName: string | null; sourceUrl: string | null }
export interface AdvisorAdvice { enabled: boolean; title: string; blocks: ArticleContentBlock[] }
export interface StructuredArticleContent { newsSummary: NewsSummary; sections: ArticleSection[]; advisorAdvice: AdvisorAdvice }
export interface ArticleAdminItem {
  id: string; title: string; slug: string; categories: ArticleCategory[]; summary: string; content: string
  structuredContent: StructuredArticleContent | null
  coverImage: string | null; coverImageId: string | null; tags: string[]; status: ArticleStatus; isFeatured: boolean
  publishedAt: string | null; scheduledAt: string | null; createdAt: string; updatedAt: string; creatorDisplayName: string
}
export interface ArticleWriteInput {
  title: string; slug?: string; categories: ArticleCategory[]; summary: string; content: string
  structuredContent?: StructuredArticleContent
  coverImage: string | null; coverImageId: string | null; tags: string[]; status: ArticleStatus; isFeatured: boolean; scheduledAt: string | null
}
export interface ArticleListResponse {
  articles: ArticleAdminItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}
export const ARTICLE_COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const articleCoverImageUrl = (path: string) => {
  if (!path || /^https?:\/\//i.test(path)) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  return /^https?:\/\//i.test(apiBase) ? new URL(path, apiBase).toString() : path
}
export const adminArticlesApi = {
  list: (params: { page?: number; limit?: number; category?: ArticleCategory; status?: ArticleStatus; featured?: boolean } = {}) =>
    api.get<Envelope<ArticleListResponse>>('/v1/admin/articles', { params }),
  get: (id: string) => api.get<Envelope<{ article: ArticleAdminItem }>>(`/v1/admin/articles/${encodeURIComponent(id)}`),
  create: (input: ArticleWriteInput) => api.post<Envelope<{ article: ArticleAdminItem }>>('/v1/admin/articles', input),
  update: (id: string, input: Partial<ArticleWriteInput>) => api.patch<Envelope<{ article: ArticleAdminItem }>>(`/v1/admin/articles/${encodeURIComponent(id)}`, input),
  remove: (id: string) => api.delete<Envelope<{ deleted: true }>>(`/v1/admin/articles/${encodeURIComponent(id)}`),
  // ============================================================
  // Article Cover Image — Browser Multipart Upload
  // WEB-1F-D2A-1
  // ============================================================
  uploadCoverImage: (file: File) => {
    const body = new FormData()
    body.append('image', file)
    return api.post<Envelope<{ path: string }>>('/v1/admin/articles/cover-images', body, {
      // Clear the shared JSON default so the browser owns multipart boundary generation.
      headers: { 'Content-Type': undefined },
    })
  },
}
