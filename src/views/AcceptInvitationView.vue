<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Password from 'primevue/password'

import KqcCard from '@/components/ui/KqcCard.vue'
import { authApi } from '@/api/auth'

type InvitationStatus = 'ready' | 'success' | 'error'

interface AuthErrorPayload {
  error?: {
    code?: string
    message?: string
  }
}

const route = useRoute()
const router = useRouter()
const invitationToken = ref('')
const status = ref<InvitationStatus>('ready')
const statusMessage = ref('')
const submitting = ref(false)
const form = reactive({ password: '', confirmPassword: '' })

const clearPasswords = () => {
  form.password = ''
  form.confirmPassword = ''
}

const invitationErrorMessage = (error: unknown): string => {
  if (isAxiosError<AuthErrorPayload>(error)) {
    const code = error.response?.data?.error?.code
    if (code === 'INVITATION_TOKEN_INVALID' || code === 'INVALID_TOKEN' || code === 'TOKEN_EXPIRED') {
      return '邀請連結無效、已使用或已過期，請聯絡系統管理員重新邀請。'
    }
    if (code === 'REGISTRATION_UNAVAILABLE') return '此邀請目前無法接受，請聯絡系統管理員。'
    if (code === 'VALIDATION_ERROR') {
      return error.response?.data?.error?.message || '密碼格式不符合要求。'
    }
  }
  return '目前無法接受邀請，請稍後再試。'
}

const initializeToken = async () => {
  const queryToken = route.query.token
  invitationToken.value = typeof queryToken === 'string' ? queryToken : ''
  await router.replace({ name: 'AcceptInvitation' })
  if (!invitationToken.value) {
    status.value = 'error'
    statusMessage.value = '缺少邀請資訊，請使用邀請信中的完整連結。'
  }
}

const validate = (): string | null => {
  if (!form.password || !form.confirmPassword) return '請輸入並確認新密碼。'
  if (form.password.length < 8) return '密碼至少需要 8 個字元。'
  if (form.password !== form.confirmPassword) return '密碼與確認密碼不一致。'
  return null
}

const acceptInvitation = async () => {
  statusMessage.value = validate() || ''
  if (statusMessage.value || !invitationToken.value) return

  submitting.value = true
  try {
    await authApi.acceptInvitation(invitationToken.value, form.password)
    invitationToken.value = ''
    clearPasswords()
    status.value = 'success'
    statusMessage.value = '後台帳號已啟用，請使用新密碼登入。'
  } catch (error: unknown) {
    clearPasswords()
    status.value = 'error'
    statusMessage.value = invitationErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

onMounted(initializeToken)
</script>

<template>
  <main class="lifecycle-view min-h-screen flex items-center justify-center px-4 py-12">
    <KqcCard padding="lg" :hoverable="false" class="w-full max-w-md border">
      <div class="space-y-6">
        <header class="text-center space-y-2">
          <span class="brand-badge">三爵資訊 KQC</span>
          <h1 class="text-2xl font-bold text-[var(--kqc-text-main)]">接受後台帳號邀請</h1>
          <p class="text-sm text-[var(--kqc-text-muted)]">設定登入密碼以啟用您的 KQC 後台帳號。</p>
        </header>

        <Message v-if="statusMessage" :severity="status === 'success' ? 'success' : 'error'" :closable="false" role="status">
          {{ statusMessage }}
        </Message>

        <form v-if="status === 'ready'" class="space-y-4" @submit.prevent="acceptInvitation">
          <div class="field-group">
            <label for="invitation-password">登入密碼</label>
            <Password
              v-model="form.password"
              input-id="invitation-password"
              autocomplete="new-password"
              :feedback="false"
              toggle-mask
              fluid
              required
            />
            <small>至少 8 個字元。</small>
          </div>

          <div class="field-group">
            <label for="invitation-confirm-password">確認密碼</label>
            <Password
              v-model="form.confirmPassword"
              input-id="invitation-confirm-password"
              autocomplete="new-password"
              :feedback="false"
              toggle-mask
              fluid
              required
            />
          </div>

          <Button
            type="submit"
            label="啟用後台帳號"
            :loading="submitting"
            :disabled="submitting"
            class="w-full"
          />
        </form>

        <Button
          v-if="status === 'success'"
          label="前往後台登入"
          class="w-full"
          @click="router.push({ name: 'Login' })"
        />
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

  small {
    color: var(--kqc-text-muted);
    font-size: 0.75rem;
  }
}
</style>
