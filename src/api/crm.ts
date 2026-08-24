import api from './axios'

interface Envelope<T> { success: true; data: T }
export interface CalendarItem { id: string; startAt: string; activityType: string | null; content: string | null; customerId: string | null; customerName: string | null; businessCaseId: string; caseNumber: string | null }
export interface MyBusinessSummary { today: { from: string; to: string; upcoming: CalendarItem[] }; metrics: { claimPendingCount: number | null; operatingCount: number; followUpDueCount: number; monthlyClosedCount: number; monthlyClosedAmount: number }; gaps?: string[]; semantics?: unknown }
export interface CustomerListItem { id: string; customerNumber: string; customerType: 'PERSON' | 'COMPANY'; displayName: string; grade: 'A' | 'B' | 'C' | 'D'; phone: string | null; mobile: string | null; email: string | null; primarySalesId: string | null; note: string | null; hasBusinessCase: boolean; latestContactAt: string | null; nextPlannedAt: string | null }
export interface CustomerDetail extends Omit<CustomerListItem, 'hasBusinessCase' | 'latestContactAt' | 'nextPlannedAt'> { name: string | null; companyName: string | null; taxId: string | null; representative: string | null; contactPerson: string | null; address: string | null; status: string }
export interface CreateCustomerInput { customerType: 'PERSON' | 'COMPANY'; name?: string; companyName?: string; taxId?: string; representative?: string; contactPerson?: string; phone?: string; mobile?: string; email?: string; address?: string; grade: 'A' | 'B' | 'C' | 'D'; note: string | null }
export interface BusinessCaseListItem { id: string; caseNumber: string | null; customerId: string; customerNumber: string | null; customerDisplayName: string | null; category: string; assetCategory: string; direction: string; caseSource: string; assignedTo: string; expectedAmount: number | null; expectedCloseDate: string | null; status: string }
export type ProspectType = 'PERSON' | 'COMPANY'
export type ProspectGrade = 'HIGH' | 'NORMAL' | 'LOW'
export type ProspectDevelopmentStatus = 'NEW_CONTACT' | 'CULTIVATING' | 'INTERESTED' | 'ON_HOLD' | 'CONVERTED'
export type ActiveProspectDevelopmentStatus = Exclude<ProspectDevelopmentStatus, 'CONVERTED'>
export interface ProspectListItem { id: string; prospectType: ProspectType; displayName: string; prospectGrade: ProspectGrade; developmentStatus: ProspectDevelopmentStatus; phone: string | null; mobile: string | null; email: string | null; responsibleSalesId: string; revision: number; createdAt: string; updatedAt: string }
export interface ProspectDetail extends ProspectListItem { name: string | null; companyName: string | null; taxId: string | null; representative: string | null; contactPerson: string | null; address: string | null; note: string | null; convertedCustomerId: string | null; convertedBusinessCaseId: string | null; convertedAt: string | null }
export interface CreateProspectInput { prospectType: ProspectType; name?: string; companyName?: string; taxId?: string; representative?: string; contactPerson?: string; phone?: string; mobile?: string; email?: string; address?: string; prospectGrade: ProspectGrade; developmentStatus: ActiveProspectDevelopmentStatus; note: string | null }
export interface UpdateProspectInput extends Omit<CreateProspectInput, 'prospectType'> { revision: number }
export type PlannedActivitySubjectType = 'PROSPECT' | 'CUSTOMER' | 'BUSINESS_CASE'
export type PlannedActivityType = 'PHONE' | 'LINE' | 'MEETING' | 'QUOTATION' | 'CUSTOMER_RESPONSE' | 'REQUIREMENT_CHANGE'
export type PlannedActivityStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'
export interface ProspectPlannedActivityListItem { id: string; subjectType: PlannedActivitySubjectType; subjectId: string; activityType: PlannedActivityType; title: string; content: string | null; startAt: string; status: PlannedActivityStatus; responsibleSalesId: string; revision: number; completedAt: string | null; cancelledAt: string | null; cancellationReason: string | null; createdAt: string; updatedAt: string }
export interface ProspectPlannedActivityDetail extends ProspectPlannedActivityListItem { completedBy: string | null; cancelledBy: string | null }
export interface CreateProspectPlannedActivityInput { activityType: PlannedActivityType; title: string; content: string | null; startAt: string }
export interface UpdateProspectPlannedActivityInput { revision: number; activityType: PlannedActivityType; title: string; content: string | null; startAt: string }
export interface CancelProspectPlannedActivityInput { revision: number; cancellationReason: string }
export type ProspectFollowUpOutcome = 'INTERESTED' | 'CONTINUE_FOLLOW_UP' | 'AWAITING_RESPONSE' | 'NOT_INTERESTED_NOW' | 'UNREACHABLE'
export interface ProspectFollowUpListItem { id: string; occurredAt: string; activityType: PlannedActivityType; content: string; outcome: ProspectFollowUpOutcome; outcomeNote: string | null; plannedActivityId: string | null; responsibleSalesId: string; createdAt: string; updatedAt: string; revision: number }
export type ProspectFollowUpDetail = ProspectFollowUpListItem
export interface CreateProspectFollowUpInput { occurredAt: string; activityType: PlannedActivityType; content: string; outcome: ProspectFollowUpOutcome; outcomeNote: string | null }
export interface UpdateProspectFollowUpInput extends CreateProspectFollowUpInput { revision: number }
export interface CompleteProspectPlannedActivityInput extends CreateProspectFollowUpInput { revision: number; nextActivity?: CreateProspectPlannedActivityInput }
export interface CompleteProspectPlannedActivityResult { completedActivity: ProspectPlannedActivityDetail; followUp: ProspectFollowUpDetail; nextActivity: ProspectPlannedActivityDetail | null }

const adminRequest = { authPortal: 'admin' as const }
export const crmApi = {
  myBusinessSummary: () => api.get<Envelope<MyBusinessSummary>>('/v1/crm/my-business/summary', adminRequest),
  myBusinessCalendar: (from: string, to: string) => api.get<Envelope<CalendarItem[]>>('/v1/crm/my-business/calendar', { ...adminRequest, params: { from, to } }),
  customers: () => api.get<Envelope<CustomerListItem[]>>('/v1/crm/customers', adminRequest),
  createCustomer: (input: CreateCustomerInput) => api.post<Envelope<CustomerDetail>>('/v1/crm/customers', input, adminRequest),
  businessCases: () => api.get<Envelope<BusinessCaseListItem[]>>('/v1/crm/business-cases', adminRequest),
  createMyProspect: (input: CreateProspectInput) => api.post<Envelope<ProspectDetail>>('/v1/crm/my-prospects', input, adminRequest),
  listMyProspects: () => api.get<Envelope<ProspectListItem[]>>('/v1/crm/my-prospects', adminRequest),
  getMyProspect: (prospectId: string) => api.get<Envelope<ProspectDetail>>(`/v1/crm/my-prospects/${prospectId}`, adminRequest),
  updateMyProspect: (prospectId: string, input: UpdateProspectInput) => api.patch<Envelope<ProspectDetail>>(`/v1/crm/my-prospects/${prospectId}`, input, adminRequest),
  createMyProspectPlannedActivity: (prospectId: string, input: CreateProspectPlannedActivityInput) => api.post<Envelope<ProspectPlannedActivityDetail>>(`/v1/crm/my-prospects/${prospectId}/planned-activities`, input, adminRequest),
  myProspectPlannedActivities: (prospectId: string) => api.get<Envelope<ProspectPlannedActivityListItem[]>>(`/v1/crm/my-prospects/${prospectId}/planned-activities`, adminRequest),
  myProspectPlannedActivity: (prospectId: string, activityId: string) => api.get<Envelope<ProspectPlannedActivityDetail>>(`/v1/crm/my-prospects/${prospectId}/planned-activities/${activityId}`, adminRequest),
  updateMyProspectPlannedActivity: (prospectId: string, activityId: string, input: UpdateProspectPlannedActivityInput) => api.patch<Envelope<ProspectPlannedActivityDetail>>(`/v1/crm/my-prospects/${prospectId}/planned-activities/${activityId}`, input, adminRequest),
  cancelMyProspectPlannedActivity: (prospectId: string, activityId: string, input: CancelProspectPlannedActivityInput) => api.post<Envelope<ProspectPlannedActivityDetail>>(`/v1/crm/my-prospects/${prospectId}/planned-activities/${activityId}/cancel`, input, adminRequest),
  completeMyProspectPlannedActivity: (prospectId: string, activityId: string, input: CompleteProspectPlannedActivityInput) => api.post<Envelope<CompleteProspectPlannedActivityResult>>(`/v1/crm/my-prospects/${prospectId}/planned-activities/${activityId}/complete`, input, adminRequest),
  createMyProspectFollowUp: (prospectId: string, input: CreateProspectFollowUpInput) => api.post<Envelope<ProspectFollowUpDetail>>(`/v1/crm/my-prospects/${prospectId}/follow-ups`, input, adminRequest),
  myProspectFollowUps: (prospectId: string) => api.get<Envelope<ProspectFollowUpListItem[]>>(`/v1/crm/my-prospects/${prospectId}/follow-ups`, adminRequest),
  myProspectFollowUp: (prospectId: string, followUpId: string) => api.get<Envelope<ProspectFollowUpDetail>>(`/v1/crm/my-prospects/${prospectId}/follow-ups/${followUpId}`, adminRequest),
  updateMyProspectFollowUp: (prospectId: string, followUpId: string, input: UpdateProspectFollowUpInput) => api.patch<Envelope<ProspectFollowUpDetail>>(`/v1/crm/my-prospects/${prospectId}/follow-ups/${followUpId}`, input, adminRequest),
  deleteMyProspectFollowUp: (prospectId: string, followUpId: string, revision: number) => api.delete<Envelope<{ deleted: true }>>(`/v1/crm/my-prospects/${prospectId}/follow-ups/${followUpId}`, { ...adminRequest, data: { revision } })
}
