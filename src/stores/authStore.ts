import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

// ----------------------------------------------------
// 1. TypeScript 介面定義
// ----------------------------------------------------
export type AuthMode = 'login' | 'register' | 'forgot'

export interface AdminUser {
  _id: string
  username: string
  name: string
  role: 'admin' | 'superadmin' | 'user'
  email?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AdminUser
}

export interface ActionResult {
  success: boolean
  message: string
}

/**
 * KQC 三爵資訊 - 全域身份驗證與彈窗狀態 Store
 */
export const useAuthStore = defineStore('auth', () => {
  // ----------------------------------------------------
  // 2. 彈窗狀態管理 (Modal State)
  // ----------------------------------------------------
  const isAuthModalOpen = ref<boolean>(false)
  const authMode = ref<AuthMode>('login')

  const openAuthModal = (mode: AuthMode = 'login') => {
    authMode.value = mode
    isAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    isAuthModalOpen.value = false
  }

  // ----------------------------------------------------
  // 3. 身份驗證狀態 (Auth State)
  // ----------------------------------------------------
  const token = ref<string>(localStorage.getItem('kqc_admin_token') || '')

  const getInitialUser = (): AdminUser | null => {
    const savedUser = localStorage.getItem('kqc_admin_user')
    if (!savedUser) return null
    try {
      return JSON.parse(savedUser) as AdminUser
    } catch (e) {
      console.error('[AuthStore] 無法解析本地使用者快取:', e)
      localStorage.removeItem('kqc_admin_user')
      return null
    }
  }

  const user = ref<AdminUser | null>(getInitialUser())
  const isLoading = ref<boolean>(false)
  const errorMessage = ref<string>('')

  // ----------------------------------------------------
  // 4. Getters
  // ----------------------------------------------------
  const isAuthenticated = computed<boolean>(() => !!token.value)
  const isAdmin = computed<boolean>(
    () => user.value?.role === 'admin' || user.value?.role === 'superadmin'
  )
  const adminName = computed<string>(() => user.value?.name || '未登入使用者')

  // ----------------------------------------------------
  // 5. Actions
  // ----------------------------------------------------

  /** 設定認證資料並自動關閉彈窗 */
  function setAuthData(userData: AdminUser, jwtToken: string) {
    token.value = jwtToken
    user.value = userData
    localStorage.setItem('kqc_admin_token', jwtToken)
    localStorage.setItem('kqc_admin_user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`
    closeAuthModal()
  }

  /** 管理員/會員登入 API */
  async function login(credentials: LoginCredentials): Promise<ActionResult> {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const response = (await api.post<LoginResponse>('/auth/login', credentials)) as unknown as LoginResponse
      const { token: jwtToken, user: userData } = response

      setAuthData(userData, jwtToken)

      return { success: true, message: '登入成功，歡迎回到三爵資產戰情室' }
    } catch (error: any) {
      console.error('[AuthStore Login Error]:', error)
      const msg = error.response?.data?.message || error.message || '登入失敗，請檢查帳號密碼或網路連線'
      errorMessage.value = msg
      return { success: false, message: msg }
    } finally {
      isLoading.value = false
    }
  }

  /** 校驗 Token 有效性 */
  async function checkAuth(): Promise<boolean> {
    if (!token.value) return false

    try {
      const response = (await api.get<{ user: AdminUser }>('/auth/me')) as unknown as { user: AdminUser }
      user.value = response.user
      localStorage.setItem('kqc_admin_user', JSON.stringify(response.user))
      return true
    } catch (error) {
      console.warn('[AuthStore CheckAuth Failed]: Token 已過期或失效，自動清除登入狀態')
      logout()
      return false
    }
  }

  /** 安全登出 */
  function logout(): void {
    token.value = ''
    user.value = null
    errorMessage.value = ''

    localStorage.removeItem('kqc_admin_token')
    localStorage.removeItem('kqc_admin_user')

    delete api.defaults.headers.common['Authorization']
  }

  return {
    // Modal State & Actions
    isAuthModalOpen,
    authMode,
    openAuthModal,
    closeAuthModal,
    setAuthData,
    // Auth State & Actions
    token,
    user,
    isLoading,
    errorMessage,
    isAuthenticated,
    isAdmin,
    adminName,
    login,
    checkAuth,
    logout
  }
})