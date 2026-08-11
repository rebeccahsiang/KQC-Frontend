// src/api/axios.ts
import axios, { 
  type AxiosInstance, 
  type AxiosResponse, 
  type InternalAxiosRequestConfig 
} from 'axios'

/**
 * 企業級 API 響應資料包裝介面 (對齊 Express API 輸出規範)
 */
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

// 建立 Axios 實例，優先讀取 Vite 環境變數，保底指向 http://localhost:3000/api
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 秒逾時防護
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 🔒 Request 攔截器：發送請求前自動夾帶後台 JWT Admin Token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('kqc_admin_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) => Promise.reject(error)
)

/**
 * 🛡️ Response 攔截器：解構解包 response.data 並進行全域資安與狀態處置
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 業界標準：解包後端 response.data 直吐給業務層使用
    return response.data
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || '伺服器連線異常，請檢查後端 API 狀態'

    if (status === 401) {
      console.warn('🔒 權限不足或 Token 過期，已為您安全登出並清除存取憑證')
      localStorage.removeItem('kqc_admin_token')
      
      // 避免在非路由環境拋錯，若在 Vue SPA 可引導至登入頁
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login'
      }
    } else if (status === 403) {
      console.warn('⛔ 存取被拒：您沒有存取該後台機密資產的權限')
    }

    return Promise.reject(new Error(message))
  }
)

export default apiClient