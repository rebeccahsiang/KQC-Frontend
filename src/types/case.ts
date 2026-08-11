// =========================================================================
// 💡 三爵資訊 (KQC) 智慧案源全端 TypeScript 型別定義檔
// =========================================================================

/*車種與資產租賃分類 (對齊 Mongoose Enum 7 大車種)*/
export type LeaseType =
| '甲種小客車'
| '乙種小客車'
| '計程車'
| '小貨車'
| '搬家公司'
| '汽車貨運'
| '貨櫃貨運';

/*目標區域分類*/
export type TargetArea = '北部地區' | '中部地區' | '南部地區' | '東部地區';

/*公司登記類型*/
export type CompanyType = '有限公司' | '股份有限公司' | '車行';

/* 案件交易類型：出讓賣方 (seller) / 尋求買收 (buyer)*/
export type CaseType = 'seller' | 'buyer';

/*案件生命週期狀態*/
export type CaseStatus = 'selling' | 'preparation' | 'closed';

/*機密 CRM 客戶個資結構 (僅限後台存取，前台物理隔離剔除)*/
export interface CrmData {
clientCompany?: string;
clientName?: string;
clientPhone?: string;
clientMobile?: string;
clientAddress?: string;
clientEmail?: string;
internal_notes?: string
}

/*核心案源資料結構 (Case Item)*/
export interface CaseItem {
_id: string;
caseId: string;
caseType: CaseType;
isPriority?: boolean;
title: string;
companyType: CompanyType;
leaseType: LeaseType;
capitalAmount: number;
targetArea: TargetArea;
price: number;
coreNeed: string;
caseStatus: CaseStatus;
createdAt?: string;
updatedAt?: string;

// 🔒 物理隔離欄位：前台撈取時不包含此欄位，管理者模式下可讀取
crmData?: CrmData;
}

/*供需晴雨窗看板數據結構*/
export interface SupplyDemandStats {
sellerCount: number;
buyerCount: number;
demandRatio: number; // 買家比例百分比 (0~100)
}

/*  AI 語意匹配意圖提取結構 (Gemini 2.5 分析結果)*/
export interface AiMatchIntent {
caseType?: CaseType;
leaseType?: LeaseType;
targetArea?: TargetArea;
}

/*AI 語意匹配 API Response 回應包裝*/
export interface AiMatchResponse {
success: boolean;
isMocked: boolean;
intentDetected: AiMatchIntent;
count: number;
data: CaseItem[];
note?: string;
}
export interface CaseDetails {
  target_area: string
  capital_amount: number
  requirement_core: string
}

export interface MarketplaceCase {
  _id: string
  case_number: string
  case_type: 'buyer_request' | 'seller_listing'
  title: string
  details: CaseDetails
  status: 'active' | 'completed'
  crmData?: CrmData // 前台 API 經 .select('-crmData') 過濾後此欄位為 undefined
  createdAt?: string
  updatedAt?: string
}