export interface AuthRuntimeBridge {
  getAccessToken: () => string | null
  refreshAccessToken: () => Promise<string>
  clearAuth: () => void
  requirePasswordChange: () => void
}

let bridge: AuthRuntimeBridge | null = null

export const configureAuthRuntime = (nextBridge: AuthRuntimeBridge) => {
  bridge = nextBridge
}

export const getRuntimeAccessToken = () => bridge?.getAccessToken() ?? null

export const refreshRuntimeAccessToken = () => {
  if (!bridge) return Promise.reject(new Error('Auth runtime is not initialized'))
  return bridge.refreshAccessToken()
}

export const clearRuntimeAuth = () => bridge?.clearAuth()
export const signalPasswordChangeRequired = () => bridge?.requirePasswordChange()
