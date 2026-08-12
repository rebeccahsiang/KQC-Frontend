import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'

import { authApi, type AuthUser, type LoginInput, type Portal } from '@/api/auth'
import { configureAuthRuntime } from '@/auth/authRuntime'

export type AuthMode = 'login' | 'register' | 'forgot'
export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

export interface ActionResult {
  success: boolean
  message: string
  passwordChangeRequired?: boolean
}

const errorMessageFrom = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback
  const payload = error.response?.data as { error?: { message?: string } } | undefined
  return payload?.error?.message || fallback
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthModalOpen = ref(false)
  const authMode = ref<AuthMode>('login')
  const authPromptMessage = ref('')
  const user = ref<AuthUser | null>(null)
  const accessToken = ref<string | null>(null)
  const authStatus = ref<AuthStatus>('unknown')
  const initialized = ref(false)
  const passwordChangeRequired = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref('')

  let refreshPromise: Promise<string> | null = null
  let initializationPromise: Promise<void> | null = null
  let authEpoch = 0

  const isAuthenticated = computed(() => authStatus.value === 'authenticated')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isAdminPortalUser = computed(() =>
    user.value != null && ['sales', 'manager', 'admin'].includes(user.value.role)
  )
  const adminName = computed(() => user.value?.name || '未登入使用者')

  const openAuthModal = (mode: AuthMode = 'login', message = '') => {
    authMode.value = mode
    authPromptMessage.value = message
    isAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    isAuthModalOpen.value = false
    authPromptMessage.value = ''
  }

  const clearAuth = () => {
    authEpoch += 1
    accessToken.value = null
    user.value = null
    authStatus.value = 'unauthenticated'
    passwordChangeRequired.value = false
    errorMessage.value = ''
  }

  const markPasswordChangeRequired = () => {
    passwordChangeRequired.value = true
  }

  const fetchIdentity = async () => {
    const response = await authApi.me()
    user.value = response.data.user
    authStatus.value = 'authenticated'
    passwordChangeRequired.value = response.data.user.mustChangePassword
    return response.data.user
  }

  const refreshAccessToken = () => {
    if (!refreshPromise) {
      const requestEpoch = authEpoch
      refreshPromise = authApi.refresh()
        .then((response) => {
          if (requestEpoch !== authEpoch) throw new Error('Auth state changed during refresh')
          accessToken.value = response.data.accessToken
          passwordChangeRequired.value = response.data.passwordChangeRequired
          authStatus.value = 'authenticated'
          return response.data.accessToken
        })
        .finally(() => {
          refreshPromise = null
        })
    }
    return refreshPromise
  }

  const initialize = () => {
    if (initialized.value) return Promise.resolve()
    if (!initializationPromise) {
      initializationPromise = (async () => {
        authStatus.value = 'unknown'
        try {
          await refreshAccessToken()
          if (!passwordChangeRequired.value) await fetchIdentity()
        } catch {
          clearAuth()
        } finally {
          initialized.value = true
          initializationPromise = null
        }
      })()
    }
    return initializationPromise
  }

  const login = async (credentials: Omit<LoginInput, 'portal'> & { portal?: Portal }): Promise<ActionResult> => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      if (!initialized.value) await initialize()
      const response = await authApi.login({ ...credentials, portal: credentials.portal || 'frontend' })
      accessToken.value = response.data.accessToken
      passwordChangeRequired.value = response.data.passwordChangeRequired
      authStatus.value = 'authenticated'

      if (!passwordChangeRequired.value) {
        await fetchIdentity()
        closeAuthModal()
      }

      return {
        success: true,
        message: '登入成功',
        passwordChangeRequired: passwordChangeRequired.value
      }
    } catch (error) {
      clearAuth()
      const message = errorMessageFrom(error, '登入失敗，請確認帳號與密碼')
      errorMessage.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (input: { email: string; password: string; name: string }): Promise<ActionResult> => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      await authApi.register(input)
      return { success: true, message: '註冊完成，請至信箱完成驗證' }
    } catch (error) {
      const message = errorMessageFrom(error, '註冊失敗，請稍後再試')
      errorMessage.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Local credentials must be cleared even when the server is unreachable.
    } finally {
      clearAuth()
    }
  }

  const logoutAll = async () => {
    try {
      await authApi.logoutAll()
    } catch {
      // Keep the local result deterministic; server revocation can be retried after a new login.
    } finally {
      clearAuth()
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await authApi.changePassword(currentPassword, newPassword)
    accessToken.value = response.data.accessToken
    passwordChangeRequired.value = false
    await fetchIdentity()
    return response.data
  }

  const recordActivity = () => authApi.activity()

  configureAuthRuntime({
    getAccessToken: () => accessToken.value,
    refreshAccessToken,
    clearAuth,
    requirePasswordChange: markPasswordChangeRequired
  })

  return {
    isAuthModalOpen,
    authMode,
    authPromptMessage,
    user,
    accessToken,
    authStatus,
    initialized,
    passwordChangeRequired,
    isLoading,
    errorMessage,
    isAuthenticated,
    isAdmin,
    isAdminPortalUser,
    adminName,
    openAuthModal,
    closeAuthModal,
    clearAuth,
    initialize,
    login,
    register,
    logout,
    logoutAll,
    changePassword,
    recordActivity,
    fetchIdentity,
    refreshAccessToken
  }
})
