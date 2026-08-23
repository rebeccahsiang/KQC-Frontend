import api from './axios'

interface Envelope<T> { success: true; data: T }
export interface CalendarItem { id: string; startAt: string; activityType: string | null; content: string | null; customerId: string | null; customerName: string | null; businessCaseId: string; caseNumber: string | null }
export interface MyBusinessSummary { today: { from: string; to: string; upcoming: CalendarItem[] }; metrics: { claimPendingCount: number | null; operatingCount: number; followUpDueCount: number; monthlyClosedCount: number; monthlyClosedAmount: number }; gaps?: string[]; semantics?: unknown }
export interface CustomerListItem { id: string; customerNumber: string; customerType: 'PERSON' | 'COMPANY'; displayName: string; grade: 'A' | 'B' | 'C' | 'D'; phone: string | null; mobile: string | null; email: string | null; primarySalesId: string | null; note: string | null; hasBusinessCase: boolean; latestContactAt: string | null; nextPlannedAt: string | null }
export interface BusinessCaseListItem { id: string; caseNumber: string | null; customerId: string; category: string; assetCategory: string; direction: string; caseSource: string; assignedTo: string; expectedAmount: number | null; expectedCloseDate: string | null; status: string }

const adminRequest = { authPortal: 'admin' as const }
export const crmApi = {
  myBusinessSummary: () => api.get<Envelope<MyBusinessSummary>>('/v1/crm/my-business/summary', adminRequest),
  myBusinessCalendar: (from: string, to: string) => api.get<Envelope<CalendarItem[]>>('/v1/crm/my-business/calendar', { ...adminRequest, params: { from, to } }),
  customers: () => api.get<Envelope<CustomerListItem[]>>('/v1/crm/customers', adminRequest),
  businessCases: () => api.get<Envelope<BusinessCaseListItem[]>>('/v1/crm/business-cases', adminRequest)
}
