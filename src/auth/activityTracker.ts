export const AUTH_ACTIVITY_SEND_INTERVAL_MS = 60_000

const HUMAN_ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const
const LISTENER_OPTIONS: AddEventListenerOptions = { capture: true, passive: true }

export interface ActivityAuthState {
  initialized: boolean
  isAuthenticated: boolean
  passwordChangeRequired: boolean
  recordActivity: () => Promise<unknown>
}

let activeCleanup: (() => void) | null = null

export const startAuthActivityTracker = (
  auth: ActivityAuthState,
  eventTarget: Window = window,
  now: () => number = Date.now
) => {
  activeCleanup?.()

  let stopped = false
  let requestInFlight = false
  let lastAttemptAt = 0

  const handleHumanActivity = () => {
    if (
      stopped ||
      document.visibilityState !== 'visible' ||
      !auth.initialized ||
      !auth.isAuthenticated ||
      auth.passwordChangeRequired
    ) {
      lastAttemptAt = 0
      return
    }

    const currentTime = now()
    if (requestInFlight || currentTime - lastAttemptAt < AUTH_ACTIVITY_SEND_INTERVAL_MS) return

    lastAttemptAt = currentTime
    requestInFlight = true
    void auth.recordActivity()
      .catch(() => undefined)
      .finally(() => {
        requestInFlight = false
      })
  }

  for (const eventName of HUMAN_ACTIVITY_EVENTS) {
    eventTarget.addEventListener(eventName, handleHumanActivity, LISTENER_OPTIONS)
  }

  const cleanup = () => {
    if (stopped) return
    stopped = true
    for (const eventName of HUMAN_ACTIVITY_EVENTS) {
      eventTarget.removeEventListener(eventName, handleHumanActivity, LISTENER_OPTIONS)
    }
    if (activeCleanup === cleanup) activeCleanup = null
  }

  activeCleanup = cleanup
  return cleanup
}
