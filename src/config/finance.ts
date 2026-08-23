import type { Capability } from './capabilities'

export const FINANCE_NAV_CAPABILITIES = Object.freeze({
  myPerformance: ['SALES', 'SALES_SUPERVISOR', 'ADMIN'] as Capability[],
  teamPerformance: ['SALES_SUPERVISOR', 'ADMIN'] as Capability[],
  financeCenter: ['ADMIN'] as Capability[]
})
export const FINANCE_STATUS_LABELS: Record<string, string> = { DRAFT: '草稿', FROZEN: '已凍結', OPEN: '結算中', FINALIZED: '已結算' }
export const CASE_STATUS_LABELS: Record<string, string> = { OPERATING: '進行中', PAUSED: '暫停', ADMINISTRATIVE_ASSISTANCE: '行政協助', FAILED: '未成交', CLOSED: '已結案' }
export const CATEGORY_LABELS: Record<string, string> = { EQUITY: '股權', PARKING: '停車位', LICENSE: '牌照', NETWORK: '網路' }
export const DIRECTION_LABELS: Record<string, string> = { BUY: '買方', SELL: '賣方' }
export const PAYMENT_STATUS_LABELS: Record<string, string> = { RECEIVED: '已收款', VOIDED: '已作廢' }
export const READINESS_LABELS: Record<string, string> = { FINANCE_NOT_FROZEN: '財務尚未凍結', CASE_NOT_CLOSED: '案件尚未結案', CLOSED_APPROVAL_MISSING: '缺少結案核准', PAYMENT_INCOMPLETE: '服務費尚未收齊', ALREADY_FINALIZED: '結算已完成', UNRESOLVED_DEFICIT: '仍有未解決差額', SUPERVISOR_PARTICIPATES_IN_CASE: '需由最高管理者核准', CONTRIBUTION_REQUIRED: '尚待貢獻比例核准', FINANCE_FROZEN: '財務資料已凍結' }
export const financeStatusLabel = (value: string | null) => value ? FINANCE_STATUS_LABELS[value] || '未知狀態' : '尚未結算'
export const caseStatusLabel = (value: string) => CASE_STATUS_LABELS[value] || '未知狀態'
export const categoryLabel = (value: string) => CATEGORY_LABELS[value] || '其他'
export const directionLabel = (value: string) => DIRECTION_LABELS[value] || '未知方向'
export const paymentStatusLabel = (value: string) => PAYMENT_STATUS_LABELS[value] || '未知狀態'
export const readinessLabel = (value: string) => READINESS_LABELS[value] || '目前不可執行'
export const formatCurrency = (value: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(value)
