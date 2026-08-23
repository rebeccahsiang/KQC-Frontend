import api from './axios'

interface Envelope<T> { success: true; data: T }
export type FinanceStatus = 'DRAFT' | 'FROZEN'
export type SettlementStatus = 'OPEN' | 'FINALIZED'
export type PaymentProgressFilter = 'NONE' | 'PARTIAL' | 'COMPLETE'
export type BusinessCaseStatus = 'OPERATING' | 'PAUSED' | 'ADMINISTRATIVE_ASSISTANCE' | 'FAILED' | 'CLOSED'

export interface FinanceSummary { caseCount: number; totalServiceFee: number; totalAdministrativeCost: number; totalAccruedCommission: number; totalReleasedCommission: number; totalRiskReserve: number; outstandingEligibleReceivable: number; pendingSettlementCount: number; riskCaseCount: number; finalizedSettlementCount: number }
export interface FinanceBusinessCase { businessCaseId: string; caseNumber: string; category: string; direction: string; status: BusinessCaseStatus; assignedTo: string; dealApprovedAt: string | null; closedApprovedAt: string | null }
export interface PaymentProgress { totalServiceFee: number; eligibleReceived: number; eligibleReceivedAmount: number; depositReceivedAmount: number; remainingEligibleAmount: number; paymentProgressRate: number; settlementStatus: SettlementStatus | null }
export interface FinanceReadModel { businessCase: FinanceBusinessCase; financeStatus: FinanceStatus; settlementStatus: SettlementStatus | null; paymentProgress: PaymentProgress; requiresAdminApproval: boolean; adminApprovalReasonCode?: string; allowedActions: Record<string, boolean>; approvalReadiness: { commissionRate: { allowed: boolean; reasonCode: string | null }; contribution: { allowed: boolean; reasonCode: string | null } }; settlementReadiness: { ready: boolean; blockingReasons: string[] }; finance: { totalServiceFee: number; administrativeCost: number; projectBaseProfit: number; approvedCommissionRate: number | null; baseAccruedCommission: number; status: FinanceStatus; revision: number } }
export interface FinanceDetail extends FinanceReadModel { finance: FinanceReadModel['finance'] & { buyerServiceFee?: number; sellerServiceFee?: number; fixedCostRate?: number; fixedCost?: number; variableCost?: number; actualCost?: number; buyerSalesId?: string; sellerSalesId?: string; buyerContributionRate?: number; sellerContributionRate?: number; baseCommissionAllocations?: Array<{ salesId: string; amount: number; contributionRate: number }>; performanceAdjustmentPreview?: number; contributionApprovedBy?: string; contributionApprovedAt?: string | null; commissionRateApprovedBy?: string; commissionRateApprovedAt?: string | null; calculatedAt?: string | null; frozenAt?: string | null } }
export interface FinancePayment { id?: string; paymentType?: string; amount: number; status: string; reference?: string; note?: string; receivedAt?: string; recordedAt?: string; recordedBy?: string }
export interface FinanceRisk { id?: string; amount: number; reason: string; status?: string; approvedAt?: string; approvedBy?: string }
export interface FinanceSettlement { status: SettlementStatus; eligibleReceived?: number; recognizedBaseCommission?: number; releasedBaseCommission?: number; riskReserveCommission?: number; riskAdjustmentTotal?: number; performanceAdjustment?: number; unresolvedDeficit?: number; finalAllocations?: Array<{ salesId: string; amount: number }>; finalizedAt?: string | null; finalizedBy?: string }
export interface FinanceHistoryEvent { eventType: string; occurredAt: string; actorId?: string; revision?: number; amount?: number }
export interface FinanceHistory { finance: FinanceHistoryEvent[]; settlement: FinanceHistoryEvent[] }
export interface Paginated<T> { items: T[]; page: number; pageSize: number; total: number; totalPages: number }
export interface FinanceListQuery { page: number; pageSize: number; search?: string; financeStatus?: FinanceStatus; settlementStatus?: SettlementStatus; paymentProgress?: PaymentProgressFilter }
export interface DiscoveryQuery { page: number; pageSize: number; search?: string }
export interface InitializeFinanceInput { buyerServiceFee: number; sellerServiceFee: number; variableCost: number; actualCost: number }
export type InitializeFinanceResult = FinanceDetail['finance'] & { businessCaseId: string }

export const financeApi = {
  summary: () => api.get<Envelope<FinanceSummary>>('/v1/crm/finance/summary'),
  list: (params: FinanceListQuery) => api.get<Envelope<Paginated<FinanceReadModel>>>('/v1/crm/finance/business-cases', { params }),
  uninitialized: (params: DiscoveryQuery) => api.get<Envelope<Paginated<FinanceBusinessCase>>>('/v1/crm/finance/uninitialized-business-cases', { params }),
  detail: (businessCaseId: string) => api.get<Envelope<FinanceDetail>>(`/v1/crm/finance/business-cases/${businessCaseId}`),
  payments: (businessCaseId: string) => api.get<Envelope<FinancePayment[]>>(`/v1/crm/finance/business-cases/${businessCaseId}/payments`),
  risks: (businessCaseId: string) => api.get<Envelope<FinanceRisk[]>>(`/v1/crm/finance/business-cases/${businessCaseId}/risks`),
  settlement: (businessCaseId: string) => api.get<Envelope<FinanceSettlement>>(`/v1/crm/finance/business-cases/${businessCaseId}/settlement`),
  history: (businessCaseId: string) => api.get<Envelope<FinanceHistory>>(`/v1/crm/finance/business-cases/${businessCaseId}/history`),
  initialize: (businessCaseId: string, input: InitializeFinanceInput) => api.post<Envelope<InitializeFinanceResult>>(`/v1/crm/finance/business-cases/${businessCaseId}`, input)
}
