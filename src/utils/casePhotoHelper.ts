// src/utils/casePhotoHelper.ts

// 依據資產類別提供預設的高解析度圖檔 (預防沒上傳圖片時破圖)
export const CATEGORY_DEFAULT_PHOTOS: Record<string, string> = {
  '汽車貨運 (FT)': 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
  '甲種運輸業': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
  '貨櫃貨運': 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
  '小客車租賃': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80',
  '預設': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
}

/**
 * 取得案件照片：若案件未設定 photoUrl，自動根據資產類別帶入預設圖
 */
export const getCasePhoto = (customPhoto?: string, category?: string): string => {
  if (customPhoto && customPhoto.trim() !== '') {
    return customPhoto
  }
  if (category && CATEGORY_DEFAULT_PHOTOS[category]) {
    return CATEGORY_DEFAULT_PHOTOS[category]
  }
  return CATEGORY_DEFAULT_PHOTOS['預設']
}