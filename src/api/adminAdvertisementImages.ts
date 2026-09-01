import api from './axios'

interface Envelope<T> { success: true; data: T }
export interface AdvertisementImageItem {
  id: string
  name: string
  altText: string
  imageUrl: string
  originalName: string
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  fileSize: number
  usageCount: number
  isInUse: boolean
  createdAt: string
  updatedAt: string
}

export const ADVERTISEMENT_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const advertisementImageUrl = (path: string) => {
  if (!path || /^https?:\/\//i.test(path)) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  return /^https?:\/\//i.test(apiBase) ? new URL(path, apiBase).toString() : path
}

/* PRODUCT-ADVERTISEMENT-R2A — Advertisement Photo API / dedicated UI authority reuses the bounded ProductImage DTO. */
export const adminAdvertisementImagesApi = {
  list: () => api.get<Envelope<{ images: AdvertisementImageItem[] }>>('/v1/admin/advertisement-images'),
  upload: (image: File, name: string, altText: string) => {
    const body = new FormData()
    body.append('image', image); body.append('name', name); body.append('altText', altText)
    return api.post<Envelope<{ image: AdvertisementImageItem }>>('/v1/admin/advertisement-images', body, { headers: { 'Content-Type': undefined } })
  },
  update: (id: string, input: { name: string; altText: string }) => api.patch<Envelope<{ image: AdvertisementImageItem }>>(`/v1/admin/advertisement-images/${encodeURIComponent(id)}`, input),
  remove: (id: string) => api.delete<Envelope<{ deleted: true }>>(`/v1/admin/advertisement-images/${encodeURIComponent(id)}`),
}
