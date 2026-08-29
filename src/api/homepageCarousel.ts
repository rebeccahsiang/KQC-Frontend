import api from './axios'

interface Envelope<T> { success: true; data: T }
export interface HomepageCarouselImage {
  id: string; name: string; altText: string; path: string; sortOrder: number
}
export interface AdminHomepageCarouselImage extends HomepageCarouselImage {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'; size: number; enabled: boolean; createdAt: string; updatedAt: string
}
export const HOMEPAGE_CAROUSEL_MAX_BYTES = 5 * 1024 * 1024
export const homepageCarouselImageUrl = (path: string) => {
  if (!path || /^https?:\/\//i.test(path)) return path
  const base = import.meta.env.VITE_API_BASE_URL || '/api'
  return /^https?:\/\//i.test(base) ? new URL(path, base).toString() : path
}

// D2G-B — Carousel Image Admin API / immutable storage authority is never submitted.
export const adminHomepageCarouselApi = {
  list: () => api.get<Envelope<{ images: AdminHomepageCarouselImage[] }>>('/v1/admin/homepage-carousel-images'),
  upload: (image: File, name: string, altText: string) => { const body = new FormData(); body.append('image', image); body.append('name', name); body.append('altText', altText); return api.post<Envelope<{ image: AdminHomepageCarouselImage }>>('/v1/admin/homepage-carousel-images', body, { headers: { 'Content-Type': undefined } }) },
  update: (id: string, input: { name?: string; altText?: string; enabled?: boolean; sortOrder?: number }) => api.patch<Envelope<{ image: AdminHomepageCarouselImage }>>(`/v1/admin/homepage-carousel-images/${encodeURIComponent(id)}`, input),
  remove: (id: string) => api.delete<Envelope<{ deleted: true }>>(`/v1/admin/homepage-carousel-images/${encodeURIComponent(id)}`),
}

// D2G-B — Homepage Carousel Public API / public rendering never reads Admin authority.
export const publicHomepageCarouselApi = {
  list: () => api.get<Envelope<{ images: HomepageCarouselImage[] }>>('/public/homepage-carousel-images'),
}
