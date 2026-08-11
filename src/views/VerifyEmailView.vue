<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { isAxiosError } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'

import KqcCard from '@/components/ui/KqcCard.vue'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

type VerificationStatus = 'verifying' | 'success' | 'error'

interface AuthErrorPayload {
  error?: {
    code?: string
  }
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const status = ref<VerificationStatus>('verifying')
const statusMessage = ref('正在驗證您的電子郵件…')
const resendEmail = ref('')
const resendPending = ref(false)
const resendMessage = ref('')

const verificationErrorMessage = (error: unknown): string => {
  if (isAxiosError<AuthErrorPayload>(error)) {
    const code = error.response?.data?.error?.code
    if (code === 'VERIFICATION_TOKEN_INVALID' || code === 'INVALID_TOKEN' || code === 'TOKEN_EXPIRED') {
      return '驗證連結無效、已使用或已過期，請重新寄送驗證信。'
    }
    if (code === 'VALIDATION_ERROR') return '驗證連結格式不正確，請確認連結是否完整。'
  }
  return '目前無法完成電子郵件驗證，請稍後再試。'
}

const verify = async () => {
  const queryToken = route.query.token
  const token = typeof queryToken === 'string' ? queryToken : ''
  await router.replace({ name: 'VerifyEmail' })

  if (!token) {
    status.value = 'error'
    statusMessage.value = '缺少電子郵件驗證資訊，請使用驗證信中的完整連結。'
    return
  }

  try {
    await authApi.verifyEmail(token)
    status.value = 'success'
    statusMessage.value = '電子郵件驗證完成，現在可以登入會員帳號。'
  } catch (error: unknown) {
    status.value = 'error'
    statusMessage.value = verificationErrorMessage(error)
  }
}

const resend = async () => {
  const email = resendEmail.value.trim().toLowerCase()
  resendMessage.value = ''
  if (!email) {
    resendMessage.value = '請輸入註冊時使用的 Email。'
    return
  }

  resendPending.value = true
  try {
    await authApi.resendVerification(email)
    resendMessage.value = '若此 Email 可進行驗證，我們會寄出新的驗證信，請稍後檢查信箱。'
  } catch {
    resendMessage.value = '目前無法受理重新寄送，請稍後再試。'
  } finally {
    resendPending.value = false
  }
}

const openFrontendLogin = async () => {
  await router.push({ name: 'Home' })
  authStore.openAuthModal('login')
}

onMounted(verify)
</script>

<template>
  <main class="lifecycle-view min-h-screen flex items-center justify-center px-4 py-12">
    <KqcCard padding="lg" :hoverable="false" class="w-full max-w-md border">
      <div class="space-y-6">
        <header class="text-center space-y-2">
          <span class="brand-badge">三爵資訊 KQC</span>
          <h1 class="text-2xl font-bold text-[var(--kqc-text-main)]">電子郵件驗證</h1>
        </header>

        <Message
          :severity="status === 'success' ? 'success' : status === 'error' ? 'error' : 'info'"
          :closable="false"
          role="status"
        >
          {{ statusMessage }}
        </Message>

        <Button
          v-if="status === 'success'"
          label="前往會員登入"
          class="w-full"
          @click="openFrontendLogin"
        />

        <form v-if="status === 'error'" class="space-y-4" @submit.prevent="resend">
          <div class="field-group">
            <label for="resend-email">重新寄送驗證信</label>
            <InputText
              id="resend-email"
              v-model="resendEmail"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
              fluid
              required
            />
          </div>
          <Message v-if="resendMessage" severity="info" :closable="false" role="status">
            {{ resendMessage }}
          </Message>
          <Button
            type="submit"
            label="重新寄送驗證信"
            :loading="resendPending"
            :disabled="resendPending"
            class="w-full"
          />
        </form>
      </div>
    </KqcCard>
  </main>
</template>

<style lang="scss" scoped>
.lifecycle-view {
  background-color: var(--kqc-bg-main);
}

.brand-badge {
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--kqc-accent) 20%, transparent);
  color: var(--kqc-accent);
  font-size: 0.75rem;
  font-weight: 700;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    color: var(--kqc-text-main);
    font-size: 0.8rem;
    font-weight: 700;
  }
}
</style>
