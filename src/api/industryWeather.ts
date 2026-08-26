import api from './axios'

export type IndustryWeatherStatus = 'HOT' | 'STABLE' | 'COOLING' | 'UNKNOWN'
export type IndustryWeatherSourceStatus = 'LIVE' | 'FALLBACK' | 'UNAVAILABLE'
export type IndustryWeatherDirection = 'UP' | 'FLAT' | 'DOWN' | 'UNKNOWN'
export interface IndustryWeatherIndicator { key: string; label: string; value: number; unit: string; direction: IndustryWeatherDirection; changePercent: number | null; dataAsOf: string }
export interface IndustryWeatherSource { name: string; publisher: string; url: string; dataAsOf: string | null }
export interface IndustryWeather { status: IndustryWeatherStatus; generatedAt: string; dataAsOf: string | null; sourceStatus: IndustryWeatherSourceStatus; indicators: IndustryWeatherIndicator[]; sources: IndustryWeatherSource[] }
interface Envelope<T> { success: boolean; data: T }

export const industryWeatherApi = {
  get: () => api.get<Envelope<IndustryWeather>>('/public/industry-weather') as unknown as Promise<Envelope<IndustryWeather>>
}
