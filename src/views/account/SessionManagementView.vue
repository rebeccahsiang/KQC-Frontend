<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { isAxiosError } from 'axios'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

import { authApi, type AuthSession } from '@/api/auth'
import FrontHeader from '@/components/layout/FrontHeader.vue'
import KqcButton from '@/components/ui/KqcButton.vue'
import KqcCard from '@/components/ui/KqcCard.vue'
import { useAuthStore } from '@/stores/authStore'

type FeedbackSeverity = 'success' | 'info' | 'error'

interface Feedback {
  severity: FeedbackSeverity
  message: string
}

interface AuthErrorPayload {
  error?: {
    code?: string
  }
}

const authStore = useAuthStore()
const sessions = ref<AuthSession[]>([])
const loading = ref(true)
const loadError = ref(false)
const selectedSession = ref<AuthSession | null>(null)
const confirmVisible = ref(false)
const pendingSessionId = ref<string | null>(null)
const feedback = ref<Feedback | null>(null)

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '無法顯示'

  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

const loadSessions = async (): Promise<boolean> => {
  loading.value = true
  loadError.value = false

  try {
    const response = await authApi.sessions()
    sessions.value = response.data.sessions
    return true
  } catch {
    sessions.value = []
    loadError.value = true
    return false
  } finally {
    loading.value = false
  }
}

const openRevokeConfirmation = (session: AuthSession) => {
  if (pendingSessionId.value) return
  selectedSession.value = session
  confirmVisible.value = true
}

const cancelRevoke = () => {
  if (pendingSessionId.value) return
  confirmVisible.value = false
  selectedSession.value = null
}

const confirmRevoke = async () => {
  const target = selectedSession.value
  if (!target || pendingSessionId.value) return

  pendingSessionId.value = target.id
  feedback.value = null

  try {
    const response = await authApi.revokeSession(target.id)
    confirmVisible.value = false
    selectedSession.value = null

    if (response.data.isCurrent) {
      authStore.clearAuth()
      feedback.value = {
        severity: 'success',
        message: '目前的登入已撤銷。'
      }
      return
    }

    feedback.value = {
      severity: 'success',
      message: '已撤銷該裝置的登入。'
    }
    const reloaded = await loadSessions()
    if (!reloaded) {
      feedback.value = {
        severity: 'info',
        message: '登入已撤銷，但清單更新失敗，請重新載入。'
      }
    }
  } catch (error: unknown) {
    confirmVisible.value = false
    selectedSession.value = null

    const status = isAxiosError<AuthErrorPayload>(error) ? error.response?.status : undefined
    const code = isAxiosError<AuthErrorPayload>(error) ? error.response?.data?.error?.code : undefined

    if (status === 404 && code === 'SESSION_NOT_FOUND') {
      feedback.value = {
        severity: 'info',
        message: '該登入已不存在，清單將重新整理。'
      }
      const reloaded = await loadSessions()
      if (!reloaded) {
        feedback.value = {
          severity: 'info',
          message: '該登入已不存在，但清單更新失敗，請重新載入。'
        }
      }
    } else if (status === 401) {
      feedback.value = {
        severity: 'error',
        message: '登入狀態已失效，無法撤銷此登入。'
      }
    } else {
      feedback.value = {
        severity: 'error',
        message: '無法撤銷此登入，請稍後再試。'
      }
    }
  } finally {
    pendingSessionId.value = null
  }
}

onMounted(loadSessions)
</script>

<template>
  <div class="session-page">
    <FrontHeader />
    <main class="session-view">
    <header class="session-view__header">
      <div>
        <p class="session-view__eyebrow">帳號安全</p>
        <h1>登入中的裝置</h1>
        <p>查看目前仍有效的登入工作階段。</p>
      </div>
    </header>

    <Message
      v-if="feedback"
      :severity="feedback.severity"
      :closable="false"
      role="status"
      class="session-view__feedback"
    >
      {{ feedback.message }}
    </Message>

    <div v-if="loading" class="session-view__state" role="status" aria-live="polite">
      <ProgressSpinner stroke-width="4" aria-label="正在載入登入中的裝置" />
      <span>正在載入登入中的裝置…</span>
    </div>

    <Message v-else-if="loadError" severity="error" :closable="false" role="alert">
      <div class="session-view__error">
        <span>無法載入登入中的裝置，請稍後再試。</span>
        <KqcButton type="button" variant="outline" size="sm" @click="loadSessions">
          重新載入
        </KqcButton>
      </div>
    </Message>

    <KqcCard
      v-else-if="sessions.length === 0"
      :hoverable="false"
      variant="outline"
      class="session-view__empty"
    >
      <h2>目前沒有可顯示的登入工作階段</h2>
      <p>重新整理後仍沒有資料時，請稍後再試。</p>
    </KqcCard>

    <section v-else class="session-list" aria-label="登入中的裝置清單">
      <KqcCard
        v-for="session in sessions"
        :key="session.id"
        :hoverable="false"
        variant="outline"
        class="session-item"
      >
        <div class="session-item__heading">
          <h2>{{ session.deviceName?.trim() || '未知的裝置' }}</h2>
          <span v-if="session.isCurrent" class="session-item__current">目前的裝置</span>
        </div>
        <dl class="session-item__details">
          <div>
            <dt>最後活動時間</dt>
            <dd>{{ formatDate(session.lastActiveAt) }}</dd>
          </div>
          <div>
            <dt>登入時間</dt>
            <dd>{{ formatDate(session.createdAt) }}</dd>
          </div>
        </dl>
        <div class="session-item__actions">
          <KqcButton
            type="button"
            variant="danger"
            size="sm"
            :loading="pendingSessionId === session.id"
            :disabled="pendingSessionId !== null"
            @click="openRevokeConfirmation(session)"
          >
            撤銷此登入
          </KqcButton>
        </div>
      </KqcCard>
    </section>

    <Dialog
      v-model:visible="confirmVisible"
      modal
      :closable="pendingSessionId === null"
      :close-on-escape="pendingSessionId === null"
      :dismissable-mask="pendingSessionId === null"
      :header="selectedSession?.isCurrent ? '撤銷目前的登入？' : '撤銷此登入？'"
      class="session-revoke-dialog"
      @hide="cancelRevoke"
    >
      <p v-if="selectedSession?.isCurrent">
        撤銷目前的登入後，您需要重新登入才能繼續使用會員功能。
      </p>
      <p v-else>撤銷後，該裝置將無法再使用這個登入工作階段。</p>

      <template #footer>
        <KqcButton
          type="button"
          variant="text"
          :disabled="pendingSessionId !== null"
          @click="cancelRevoke"
        >
          取消
        </KqcButton>
        <KqcButton
          type="button"
          variant="danger"
          :loading="pendingSessionId === selectedSession?.id"
          :disabled="pendingSessionId !== null"
          @click="confirmRevoke"
        >
          撤銷此登入
        </KqcButton>
      </template>
    </Dialog>
    </main>
  </div>
</template>

<style scoped lang="scss">
.session-page {
  min-height: 100vh;
  padding-top: 1rem;
  background-color: var(--kqc-bg-main);
}

.session-view {
  width: min(56rem, 100%);
  margin: 0 auto;
  padding: 2rem 1rem;
  color: var(--kqc-text-main);
}

.session-view__header {
  margin-bottom: 1.5rem;

  h1 {
    margin: 0.25rem 0;
    font-size: clamp(1.75rem, 4vw, 2.25rem);
  }

  p {
    margin: 0;
    color: var(--kqc-text-muted);
  }
}

.session-view__eyebrow {
  color: var(--kqc-accent) !important;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.session-view__state {
  display: flex;
  min-height: 12rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--kqc-text-muted);
}

.session-view__feedback {
  margin-bottom: 1rem;
}

.session-view__error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.session-view__empty {
  text-align: center;

  h2 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    color: var(--kqc-text-muted);
  }
}

.session-list {
  display: grid;
  gap: 1rem;
}

.session-item__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  h2 {
    margin: 0;
    font-size: 1.1rem;
  }
}

.session-item__current {
  flex: none;
  border: 1px solid var(--kqc-success);
  border-radius: 9999px;
  padding: 0.25rem 0.65rem;
  color: var(--kqc-success);
  font-size: 0.75rem;
  font-weight: 700;
}

.session-item__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 1rem 0 0;

  dt {
    color: var(--kqc-text-muted);
    font-size: 0.8rem;
  }

  dd {
    margin: 0.25rem 0 0;
    font-weight: 600;
  }
}

.session-item__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

@media (max-width: 40rem) {
  .session-view__error,
  .session-item__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .session-item__details {
    grid-template-columns: 1fr;
  }
}
</style>
