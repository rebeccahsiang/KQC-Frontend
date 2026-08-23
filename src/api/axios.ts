import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'

import {
  clearRuntimeAuth,
  getRuntimeAuthPortal,
  getRuntimeAccessToken,
  refreshRuntimeAccessToken,
  signalPasswordChangeRequired
} from '@/auth/authRuntime'

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const portal = config.authPortal || getRuntimeAuthPortal()
    config.authPortal = portal
    const token = getRuntimeAccessToken(portal)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error: unknown) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError<{ error?: { code?: string; message?: string } }>) => {
    const status = error.response?.status
    const code = error.response?.data?.error?.code
    const original = error.config

    if (status === 403 && code === 'PASSWORD_CHANGE_REQUIRED') {
      signalPasswordChangeRequired()
    }

    if (
      status === 401 &&
      code === 'UNAUTHENTICATED' &&
      original &&
      !original.skipAuthRefresh &&
      !original._authRetry
    ) {
      original._authRetry = true
      try {
        const portal = original.authPortal || getRuntimeAuthPortal()
        const accessToken = await refreshRuntimeAccessToken(portal)
        original.headers.Authorization = `Bearer ${accessToken}`
        return apiClient.request(original)
      } catch {
        clearRuntimeAuth(original.authPortal || getRuntimeAuthPortal())
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
