export const ACTIVITY_LABELS: Record<string, string> = { PHONE: '電話', LINE: 'LINE', MEETING: '會議', QUOTATION: '報價', CUSTOMER_RESPONSE: '客戶回覆', REQUIREMENT_CHANGE: '需求變更' }
export const CASE_STATUS_LABELS: Record<string, string> = { PREPARING: '準備中', PENDING_APPROVAL: '待核准', OPERATING: '進行中', PAUSED: '暫停', ADMINISTRATIVE_ASSISTANCE: '行政協助', FAILED: '未成交', CLOSED: '已結案' }
export const CATEGORY_LABELS: Record<string, string> = { EQUITY: '股權', PARKING: '停車位', LICENSE: '牌照', NETWORK: '網路' }
export const activityLabel = (value: string | null) => value ? ACTIVITY_LABELS[value] || value : '待辦事項'
export const caseStatusLabel = (value: string) => CASE_STATUS_LABELS[value] || value
export const categoryLabel = (value: string) => CATEGORY_LABELS[value] || value
export const directionLabel = (value: string) => value === 'BUY' ? '買方' : value === 'SELL' ? '賣方' : value
export const formatCurrency = (value: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(value)
export const formatDate = (value: string | null, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }) => value ? new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', ...options }).format(new Date(value)) : '—'
