import api from './axios'

export type IndustryStatisticsStatus = 'LIVE' | 'CACHED' | 'UNAVAILABLE'
export type IndustryStatisticsCategoryKey = 'CAR_RENTAL' | 'TRUCKING' | 'CONTAINER_TRUCKING'

export interface IndustryStatisticsUnits {
  companies: string
  vehicles: string
  percent: '%'
}

export interface IndustryStatisticsMetricPoint {
  period: string
  companies: number
  vehicles: number
}

export interface IndustryStatisticsChange {
  companiesAbsolute: number | null
  companiesPercent: number | null
  vehiclesAbsolute: number | null
  vehiclesPercent: number | null
}

export interface IndustryStatisticsCategorySummary {
  categoryKey: IndustryStatisticsCategoryKey
  categoryLabel: string
  latest: IndustryStatisticsMetricPoint
  previous: IndustryStatisticsMetricPoint | null
  change: IndustryStatisticsChange
}

export interface IndustryStatisticsProvenance {
  method: 'GET'
  format: 'ODS'
  downloadUrl: string
}

export interface IndustryStatisticsSource {
  title: string
  pageUrl: string
  officialPeriod: string | null
  retrievedAt: string | null
  lastSuccessfulAt: string | null
  status: IndustryStatisticsStatus
  provenance: IndustryStatisticsProvenance[]
}

export interface IndustryStatisticsSummary {
  schemaVersion: 1
  frequency: 'MONTHLY'
  comparison: 'PREVIOUS_MONTH'
  units: IndustryStatisticsUnits
  categories: IndustryStatisticsCategorySummary[]
  source: IndustryStatisticsSource
}

export interface IndustryStatisticsHistorySeries {
  categoryKey: IndustryStatisticsCategoryKey
  categoryLabel: string
  points: IndustryStatisticsMetricPoint[]
}

export interface IndustryStatisticsHistory {
  schemaVersion: 1
  frequency: 'MONTHLY'
  range: { from: string; to: string | null }
  availableRange: { from: string | null; to: string | null }
  complete: boolean
  series: IndustryStatisticsHistorySeries[]
  source: IndustryStatisticsSource
}

export interface IndustryStatisticsSummaryData {
  status: IndustryStatisticsStatus
  refreshInFlight: boolean
  summary: IndustryStatisticsSummary | null
}

export interface IndustryStatisticsHistoryData {
  status: IndustryStatisticsStatus
  refreshInFlight: boolean
  history: IndustryStatisticsHistory | null
}

export interface IndustryStatisticsEnvelope<T> {
  success: true
  data: T
}

export interface IndustryStatisticsHistoryQuery {
  from?: string
  to?: string
}

export const industryStatisticsApi = {
  getSummary: () =>
    api.get<IndustryStatisticsEnvelope<IndustryStatisticsSummaryData>>('/public/industry-statistics/summary') as unknown as Promise<IndustryStatisticsEnvelope<IndustryStatisticsSummaryData>>,
  getHistory: ({ from, to }: IndustryStatisticsHistoryQuery = {}) =>
    api.get<IndustryStatisticsEnvelope<IndustryStatisticsHistoryData>>('/public/industry-statistics/history', {
      params: {
        ...(from !== undefined ? { from } : {}),
        ...(to !== undefined ? { to } : {}),
      },
    }) as unknown as Promise<IndustryStatisticsEnvelope<IndustryStatisticsHistoryData>>,
}
