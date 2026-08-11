// src/types/ai.ts
export interface ChatLogMessage {
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: string
  sentimentTag?: 'positive' | 'neutral' | 'negative'
}