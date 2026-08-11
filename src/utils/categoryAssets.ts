// src/utils/categoryAssets.ts

/** 預設 7 大特許車種線上圖片 (Unsplash CDN 備援，防止本地圖片遺失破圖) */
const ONLINE_CATEGORY_MAP: Record<string, string> = {
  甲種小客車: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
  乙種小客車: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
  計程車: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800',
  小貨車: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
  搬家公司: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&q=80&w=800',
  汽車貨運: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800',
  貨櫃貨運: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
}

/** 預設萬用封面圖 */
const DEFAULT_FALLBACK_COVER = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800'

/**
 * 智慧匹配封面圖助手函數 (對接 CaseCard.vue)
 * 判斷優先級：
 * 1. DB/後台專屬上傳圖片 (customUrl)
 * 2. 依案件標題關鍵字匹配 7 大特許車種圖
 * 3. 萬用預設圖
 */
export function getCaseCoverImage(title: string = '', customUrl?: string): string {
  // 1. 若後台/API 有傳入自訂照片且不為空，優先使用
  if (customUrl && customUrl.trim() !== '') {
    return customUrl
  }

  // 2. 自動匹配標題關鍵字
  for (const key in ONLINE_CATEGORY_MAP) {
    if (title.includes(key)) {
      return ONLINE_CATEGORY_MAP[key]
    }
  }

  // 3. 預設圖備援
  return DEFAULT_FALLBACK_COVER
}