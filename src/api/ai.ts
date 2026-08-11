// src/api/ai.ts
import apiClient from './axios'

export interface SentimentAnalysisResponse {
  sentiment: 'positive' | 'neutral' | 'negative'
  confidence_score: number
  positive_intent: string
}

export interface AnalyzePayload {
  prompt: string
}   

/**
 * 送出傳產車行老闆的口語需求，透過 Qwen2.5 進行情緒分析與正向商業意圖轉化
 * @param userPrompt 草根口語需求 (例如: 「我這台貨櫃車不要了啦！虧錢做不下去...」)
 */
export const analyzeCustomerIntent = (userPrompt: string) => {
  return apiClient.post<SentimentAnalysisResponse>('/analyze', {
    prompt: userPrompt
  })
}