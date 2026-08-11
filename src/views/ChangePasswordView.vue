<script setup lang="ts">
import { reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Password from 'primevue/password'

import KqcCard from '@/components/ui/KqcCard.vue'
import { useAuthStore } from '@/stores/authStore'

interface AuthErrorPayload {
  error?: {
    code?: string
    message?: string
  }
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const submitting = ref(false)
const errorMessage = ref('')

const clearPasswords = () => {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
}

const destinationAfterChange = () => {
  const requested = route.query.redirect
  if (
    typeof requested === 'string' &&
    requested.startsWith('/') &&
    !requested.startsWith('//') &&
    requested !== '/change-password' &&
    router.resolve(requested).matched.length > 0
  ) {
    return requested
  }
  return authStore.user?.role === 'user' ? '/' : '/admin/dashboard'
}

const messageForError = (error: unknown): string => {
  if (!isAxiosError<AuthErrorPayload>(error)) return '密碼變更失敗，請稍後再試。'

  const code = error.response?.data?.error?.code
  const backendMessage = error.response?.data?.error?.message
  if (code === 'INVALID_CURRENT_PASSWORD' || code === 'INVALID_CREDENTIALS') {
    return '目前密碼不正確，請重新輸入。'
  }
  if (code === 'UNAUTHENTICATED') return '登入狀態已失效，請重新登入。'
  if (code === 'PASSWORD_CHANGE_REQUIRED') return '請先完成密碼變更。'
  if (code === 'VALIDATION_ERROR') return backendMessage || '密碼格式不符合要求。'
  return backendMessage || '密碼變更失敗，請稍後再試。'
}

const validate = (): string | null => {
  if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
    return '請完整填寫目前密碼、新密碼與確認密碼。'
  }
  if (form.newPassword.length < 8) return '新密碼至少需要 8 個字元。'
  if (form.currentPassword === form.newPassword) return '新密碼必須與目前密碼不同。'
  if (form.newPassword !== form.confirmPassword) return '新密碼與確認密碼不一致。'
  return null
}

const handleSubmit = async () => {
  errorMessage.value = validate() || ''
  if (errorMessage.value) return

  submitting.value = true
  try {
    await authStore.changePassword(form.currentPassword, form.newPassword)
    clearPasswords()
    await router.replace(destinationAfterChange())
  } catch (error: unknown) {
    errorMessage.value = messageForError(error)
    clearPasswords()
    if (!authStore.isAuthenticated) {
      await router.replace({ name: 'Login', query: { redirect: '/change-password' } })
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="change-password-view min-h-screen flex items-center justify-center px-4 py-12">
    <KqcCard padding="lg" :hoverable="false" class="w-full max-w-md border">
      <div class="space-y-6">
        <header class="text-center space-y-2">
          <span class="inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-[var(--kqc-accent)]/20 text-[var(--kqc-accent)]">
            三爵資訊 KQC
          </span>
          <h1 class="text-2xl font-bold text-[var(--kqc-text-main)]">變更登入密碼</h1>
          <p class="text-sm text-[var(--kqc-text-muted)]">
            為保護帳號安全，請設定新密碼後再繼續使用平台。
          </p>
        </header>

        <Message v-if="errorMessage" severity="error" :closable="false" role="alert">
          {{ errorMessage }}
        </Message>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="password-field">
            <label for="current-password">目前密碼</label>
            <Password
              v-model="form.currentPassword"
              input-id="current-password"
              autocomplete="current-password"
              :feedback="false"
              toggle-mask
              fluid
              required
            />
          </div>

          <div class="password-field">
            <label for="new-password">新密碼</label>
            <Password
              v-model="form.newPassword"
              input-id="new-password"
              autocomplete="new-password"
              :feedback="false"
              toggle-mask
              fluid
              required
            />
            <small>至少 8 個字元，且不得與目前密碼相同。</small>
          </div>

          <div class="password-field">
            <label for="confirm-password">確認新密碼</label>
            <Password
              v-model="form.confirmPassword"
              input-id="confirm-password"
              autocomplete="new-password"
              :feedback="false"
              toggle-mask
              fluid
              required
            />
          </div>

          <Button
            type="submit"
            label="儲存新密碼"
            :loading="submitting"
            class="w-full"
          />
        </form>
      </div>
    </KqcCard>
  </main>
</template>

<style lang="scss" scoped>
.change-password-view {
  background-color: var(--kqc-bg-main);
}

.password-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    color: var(--kqc-text-main);
    font-size: 0.8rem;
    font-weight: 700;
  }

  small {
    color: var(--kqc-text-muted);
    font-size: 0.75rem;
  }
}
</style>
