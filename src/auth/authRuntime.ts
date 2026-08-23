export interface AuthRuntimeBridge {
  getAccessToken: (portal: AuthPortal) => string | null
  refreshAccessToken: (portal: AuthPortal) => Promise<string>
  clearAuth: (portal: AuthPortal) => void
  requirePasswordChange: () => void
}

export type AuthPortal = 'frontend' | 'admin'
let activePortal: AuthPortal = 'frontend'

let bridge: AuthRuntimeBridge | null = null

export const configureAuthRuntime = (nextBridge: AuthRuntimeBridge) => {
  bridge = nextBridge
}

export const setRuntimeAuthPortal = (portal: AuthPortal) => { activePortal = portal }
export const getRuntimeAuthPortal = () => activePortal
export const getRuntimeAccessToken = (portal: AuthPortal = activePortal) => bridge?.getAccessToken(portal) ?? null

export const refreshRuntimeAccessToken = (portal: AuthPortal = activePortal) => {
  if (!bridge) return Promise.reject(new Error('Auth runtime is not initialized'))
  return bridge.refreshAccessToken(portal)
}

export const clearRuntimeAuth = (portal: AuthPortal = activePortal) => bridge?.clearAuth(portal)
export const signalPasswordChangeRequired = () => bridge?.requirePasswordChange()
