export type ContactPillarCode = 'VALUE' | 'OPERATIONS' | 'NETWORK' | 'OTHER'
export type ContactServiceCode =
  | 'business-sale' | 'business-buy' | 'valuation' | 'cross-industry-brokerage'
  | 'fleet-dispatch' | 'transport-website' | 'other-website' | 'parking-proof'
  | 'parking-partnership' | 'vehicle-quota-buy' | 'vehicle-quota-sell' | 'corporate-transport'
  | 'insurance-referral' | 'notary-conveyancing' | 'maintenance-network'
  | 'driver-referral' | 'transformation-support' | 'other'

export interface ContactServiceOption { code: ContactServiceCode; label: string; icon: string }
export interface ContactServicePillar { code: ContactPillarCode; title: string; icon: string; services: readonly ContactServiceOption[] }
export type ContactQuestionType = 'text' | 'number' | 'select' | 'textarea'
export interface ContactQuestion { key: string; label: string; type: ContactQuestionType; required?: boolean; options?: readonly string[]; maxlength?: number; placeholder?: string }
export interface ContactProfileData { salutation: string; name: string; companyName: string; jobTitle: string; mobile: string; email: string; lineId: string; privacyAccepted: boolean }

// CONTACT-R1A — Contact Service Authority / frontend-only taxonomy does not create Backend domain values.
export const CONTACT_SERVICE_PILLARS: readonly ContactServicePillar[] = [
  { code: 'VALUE', title: '事業價值實現', icon: 'lucide:gem', services: [
    { code: 'business-sale', label: '事業出售／轉讓', icon: 'lucide:building-2' },
    { code: 'business-buy', label: '事業購買／投資', icon: 'lucide:landmark' },
    { code: 'valuation', label: '企業價值評估', icon: 'lucide:chart-no-axes-combined' },
    { code: 'cross-industry-brokerage', label: '跨領域事業仲介', icon: 'lucide:handshake' },
  ] },
  { code: 'OPERATIONS', title: '營運效能優化', icon: 'lucide:gauge', services: [
    { code: 'fleet-dispatch', label: '智慧車隊派遣系統', icon: 'lucide:route' },
    { code: 'transport-website', label: '運輸業專屬網站設計', icon: 'lucide:monitor-smartphone' },
    { code: 'other-website', label: '其他行業網站設計', icon: 'lucide:panels-top-left' },
    { code: 'parking-proof', label: '停車位證明申辦', icon: 'lucide:square-parking' },
    { code: 'parking-partnership', label: '停車場業者合作', icon: 'lucide:parking-meter' },
    { code: 'vehicle-quota-buy', label: '營業用車車額購買', icon: 'lucide:badge-plus' },
    { code: 'vehicle-quota-sell', label: '營業用車車額出售', icon: 'lucide:badge-dollar-sign' },
    { code: 'corporate-transport', label: '企業長期叫車等營運服務', icon: 'lucide:car-taxi-front' },
  ] },
  { code: 'NETWORK', title: '專業網絡支援', icon: 'lucide:network', services: [
    { code: 'insurance-referral', label: '車險／產險顧問轉介', icon: 'lucide:shield-check' },
    { code: 'notary-conveyancing', label: '特約公證／代書流程', icon: 'lucide:stamp' },
    { code: 'maintenance-network', label: '維修服務網絡', icon: 'lucide:wrench' },
    { code: 'driver-referral', label: '專業司機轉介', icon: 'lucide:contact-round' },
    { code: 'transformation-support', label: '長期事業轉型支援', icon: 'lucide:waypoints' },
  ] },
  { code: 'OTHER', title: '其他', icon: 'lucide:message-circle-question', services: [
    { code: 'other', label: '其他（請說明）', icon: 'lucide:messages-square' },
  ] },
] as const

const scaleOptions = ['尚未成立／規劃中', '個人事業／5 輛以下', '6–20 輛', '21–50 輛', '50 輛以上', '其他']
const regionOptions = ['北部', '中部', '南部', '全台不拘']
const completionOptions = ['立即', '3 個月內', '半年內', '一年內', '彈性']
const urgencyOptions = ['緊急（1 個工作天內）', '優先（1–2 個工作天）', '一般（3–5 個工作天）', '彈性／無特定截止日期']

const common = (overrides: Partial<ContactQuestion> = {}, completionLabel = '希望多久完成'): ContactQuestion[] => [
  { key: 'completionTimeframe', label: completionLabel, type: 'select', required: true, options: completionOptions },
  { key: 'contactUrgency', label: '希望多久聯繫', type: 'select', required: true, options: urgencyOptions },
  { key: 'contactPreference', label: '偏好的聯絡方式', type: 'select', required: true, options: ['電話', 'Email', 'LINE'] },
  { key: 'additionalNotes', label: '補充說明', type: 'textarea', maxlength: 500, ...overrides },
]
const generic: ContactQuestion[] = [
  { key: 'currentNeed', label: '目前需求', type: 'textarea', required: true, maxlength: 300 },
  { key: 'region', label: '地區', type: 'select', options: regionOptions }, ...common(),
]
const questionGroups: Record<'SALE' | 'BUY' | 'DISPATCH' | 'WEBSITE' | 'PARKING' | 'GENERIC', readonly ContactQuestion[]> = {
  SALE: [
    { key: 'businessStatus', label: '目前事業狀況', type: 'select', required: true, options: scaleOptions },
    { key: 'operatingScale', label: '車輛／營運規模', type: 'text', required: true },
    { key: 'region', label: '所在地區', type: 'select', required: true, options: regionOptions },
    { key: 'expectedPrice', label: '預期價格（如適用）', type: 'text' }, ...common({}, '預計出售／轉讓時間'),
  ],
  BUY: [
    { key: 'investmentType', label: '希望購買／投資類型', type: 'text', required: true },
    { key: 'plannedScale', label: '預計經營規模', type: 'select', required: true, options: scaleOptions },
    { key: 'budgetRange', label: '預算區間', type: 'text', required: true },
    { key: 'region', label: '希望地區', type: 'select', required: true, options: regionOptions }, ...common({}, '預計完成時間'),
  ],
  DISPATCH: [
    { key: 'fleetScale', label: '公司／車隊規模', type: 'select', required: true, options: scaleOptions },
    { key: 'vehicleCount', label: '車輛數', type: 'number', required: true },
    { key: 'existingDispatch', label: '是否已有派遣系統', type: 'select', required: true, options: ['是', '否'] },
    { key: 'improvementGoal', label: '最想改善的問題', type: 'textarea', required: true, maxlength: 300 }, ...common({}, '希望導入時間'),
  ],
  WEBSITE: [
    { key: 'brandName', label: '公司／品牌名稱', type: 'text', required: true },
    { key: 'existingWebsite', label: '是否已有網站', type: 'select', required: true, options: ['是', '否'] },
    { key: 'websiteType', label: '希望建置類型', type: 'select', required: true, options: ['企業形象網站', '服務介紹網站', '後台管理網站', '其他'] },
    { key: 'maintenanceNeeded', label: '是否需要後續維護', type: 'select', options: ['需要', '暫不需要', '尚未確定'] }, ...common({ label: '補充需求' }, '預計完成時間'),
  ],
  PARKING: [
    { key: 'companyRegion', label: '公司所在地', type: 'select', required: true, options: regionOptions },
    { key: 'parkingCount', label: '所需車位數', type: 'number', required: true },
    { key: 'applicationStage', label: '目前辦理階段', type: 'select', required: true, options: ['需求確認中', '文件準備中', '已送件待補件', '其他'] }, ...common({}, '希望完成時間'),
  ],
  GENERIC: generic,
}

const groupByService: Partial<Record<ContactServiceCode, keyof typeof questionGroups>> = {
  'business-sale': 'SALE', 'business-buy': 'BUY', 'fleet-dispatch': 'DISPATCH',
  'transport-website': 'WEBSITE', 'other-website': 'WEBSITE', 'parking-proof': 'PARKING',
}

// CONTACT-R1A — Dynamic Needs Questions / selected services compose one de-duplicated, extensible questionnaire.
export const questionsForServices = (services: readonly ContactServiceCode[]) => {
  const groups = [...new Set(services.map((service) => groupByService[service] || 'GENERIC'))]
  const questions = groups.flatMap((group) => questionGroups[group])
  return questions.filter((question, index) => questions.findIndex(({ key }) => key === question.key) === index)
}
