import api from './axios'

interface Envelope<T> { success: true; data: T }
export type MarqueeStatus = 'ACTIVE' | 'INACTIVE'
export interface PublicMarquee { id: string; content: string; sortOrder: number }
export interface AdminMarquee extends PublicMarquee { status: MarqueeStatus; createdAt: string; updatedAt: string }
export interface MarqueeInput { content: string; status: MarqueeStatus; sortOrder: number }

// MARQUEE-R1 — Frontend Marquee API / bounded Admin mutation and anonymous public-read contracts.
export const getAdminMarquees = () => api.get<Envelope<{ marquees: AdminMarquee[] }>>('/v1/admin/marquees')
export const createMarquee = (input: MarqueeInput) => api.post<Envelope<{ marquee: AdminMarquee }>>('/v1/admin/marquees', input)
export const updateMarquee = (id: string, input: Partial<MarqueeInput>) => api.patch<Envelope<{ marquee: AdminMarquee }>>(`/v1/admin/marquees/${encodeURIComponent(id)}`, input)
export const deleteMarquee = (id: string) => api.delete<Envelope<{ deleted: true }>>(`/v1/admin/marquees/${encodeURIComponent(id)}`)
export const getPublicMarquees = () => api.get<Envelope<{ marquees: PublicMarquee[] }>>('/public/marquees')
