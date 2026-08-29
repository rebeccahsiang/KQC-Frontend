import api from './axios'

interface Envelope<T> { success: true; data: T }
export interface ArticleImageItem {
  id: string
  name: string
  altText: string
  path: string
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  size: number
  usageCount: number
  createdAt: string
}

export const ARTICLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const articleImageUrl = (path: string) => {
  if (!path || /^https?:\/\//i.test(path)) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  return /^https?:\/\//i.test(apiBase) ? new URL(path, apiBase).toString() : path
}

// D2F-B — Article Image API / Backend identity and multipart fields remain bounded.
export const adminArticleImagesApi = {
  list: () => api.get<Envelope<{ images: ArticleImageItem[] }>>('/v1/admin/article-images'),
  upload: (image: File, name: string, altText: string) => {
    const body = new FormData()
    body.append('image', image)
    body.append('name', name)
    body.append('altText', altText)
    return api.post<Envelope<{ image: ArticleImageItem }>>('/v1/admin/article-images', body, { headers: { 'Content-Type': undefined } })
  },
  remove: (id: string) => api.delete<Envelope<{ deleted: true }>>(`/v1/admin/article-images/${encodeURIComponent(id)}`),
}
