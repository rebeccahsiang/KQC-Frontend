import api from './axios'
import type { StructuredArticleContent } from './adminArticles'

// ============================================================
// Industry Insights — Public Article List API
// WEB-1F-D2B
// ============================================================
interface Envelope<T> { success: true; data: T }
export type PublicArticleCategory = 'BUSINESS_MANAGEMENT' | 'TRANSPORT_KNOWLEDGE' | 'MARKET_TREND' | 'BUSINESS_TRANSFORMATION' | 'POLICY_REGULATION' | 'KQC_NEWS'
export interface PublicArticleListItem {
  id: string; title: string; slug: string; categories: PublicArticleCategory[]; summary: string
  coverImage: string | null; tags: string[]; isFeatured: boolean; publishedAt: string | null
}
export interface PublicArticleListResponse {
  articles: PublicArticleListItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}
export interface PublicArticleDetail extends PublicArticleListItem {
  content: string
  structuredContent?: StructuredArticleContent | null
}
export interface ArticleLikeState { liked: boolean; likeCount: number }
export const publicArticleCoverUrl = (path: string) => {
  if (!path || /^https?:\/\//i.test(path)) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  return /^https?:\/\//i.test(apiBase) ? new URL(path, apiBase).toString() : path
}
export const publicArticlesApi = {
  list: ({ page, limit, category, featured }: { page: number; limit: number; category?: PublicArticleCategory; featured?: boolean }) =>
    api.get<Envelope<PublicArticleListResponse>>('/public/articles', {
      params: { page, limit, ...(category ? { category } : {}), ...(featured !== undefined ? { featured } : {}) },
    }),
  detail: (slug: string) =>
    api.get<Envelope<{ article: PublicArticleDetail }>>(`/public/articles/${encodeURIComponent(slug)}`),
  likeState: (slug: string) =>
    api.get<Envelope<ArticleLikeState>>(`/public/articles/${encodeURIComponent(slug)}/like`),
  toggleLike: (slug: string) =>
    api.post<Envelope<ArticleLikeState>>(`/public/articles/${encodeURIComponent(slug)}/like`),
}
