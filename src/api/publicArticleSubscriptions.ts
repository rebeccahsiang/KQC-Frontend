import api from './axios'

interface Envelope<T> { success: true; data: T }
export type ArticleSubscriptionStatus = 'NONE' | 'PENDING' | 'ACTIVE'
export interface ArticleSubscriptionState { status: ArticleSubscriptionStatus }

// D2E-C2 — Email Subscription Public API / Privacy Boundary
export const publicArticleSubscriptionsApi = {
  state: () => api.get<Envelope<ArticleSubscriptionState>>('/public/article-subscriptions/state'),
  subscribe: (email: string) => api.post<Envelope<ArticleSubscriptionState>>('/public/article-subscriptions/subscribe', { email }),
  verify: (token: string) => api.post<Envelope<ArticleSubscriptionState>>('/public/article-subscriptions/verify', { token }),
  unsubscribe: () => api.post<Envelope<ArticleSubscriptionState>>('/public/article-subscriptions/unsubscribe', {}),
}
