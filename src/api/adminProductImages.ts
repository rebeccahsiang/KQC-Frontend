import api from './axios'

export type ProductBusinessCategory = 'CA' | 'CB' | 'TX' | 'LT' | 'MV' | 'FT' | 'CT'
export type ProductTransactionType = 'BUY' | 'SELL'

export interface ProductImageRepresentativeImage {
  id: string
  name: string
  altText: string
  imageUrl: string
  originalName: string
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  fileSize: number
}
export interface ProductImageRepresentativeSlot {
  businessCategory: ProductBusinessCategory
  transactionType: ProductTransactionType
  productImage: ProductImageRepresentativeImage | null
  updatedAt: string | null
}

interface Envelope<T> { success: true; data: T }
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const productImageUrl = (path: string) => {
  if (!path || /^https?:\/\//i.test(path)) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  return /^https?:\/\//i.test(apiBase) ? new URL(path, apiBase).toString() : path
}

// PRODUCT-IMG-A2 — Representative Backend Authority / paths own canonical slot identity.
export const adminProductImagesApi = {
  getProductImageRepresentatives: () => api.get<Envelope<{ slots: ProductImageRepresentativeSlot[] }>>('/v1/admin/product-image-representatives'),
  uploadProductImageRepresentative: (businessCategory: ProductBusinessCategory, transactionType: ProductTransactionType, input: { image: File; name: string; altText: string }) => {
    const body = new FormData()
    body.append('image', input.image)
    body.append('name', input.name)
    body.append('altText', input.altText)
    return api.post<Envelope<{ slot: ProductImageRepresentativeSlot }>>(`/v1/admin/product-image-representatives/${encodeURIComponent(businessCategory)}/${encodeURIComponent(transactionType)}/image`, body, { headers: { 'Content-Type': undefined } })
  },
}
