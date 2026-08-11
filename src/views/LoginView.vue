<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import KqcCard from '@/components/ui/KqcCard.vue'
import KqcButton from '@/components/ui/KqcButton.vue'

const router = useRouter()
const username = ref('')
const password = ref('')

function handleLogin() {
  // 模擬登入驗證成功：寫入本地 Token 並跳轉至後台戰情室
  localStorage.setItem('token', 'mock-jwt-auth-token')
  router.push('/admin/dashboard')
}
</script>

<template>
  <div class="login-view min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <KqcCard padding="lg" class="w-full max-w-md border space-y-6">
      <div class="text-center space-y-2">
        <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-[var(--kqc-accent)]/20 text-[var(--kqc-accent)]">
          三爵資訊 KQC
        </span>
        <h1 class="text-2xl font-bold text-[var(--kqc-text-main)]">
          會員與戰情室登入
        </h1>
        <p class="text-xs text-[var(--kqc-text-muted)]">
          輸入權限帳號進入高階數據與 CRM 管理後台
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-[var(--kqc-text-main)] mb-1">
            帳號 / Email
          </label>
          <input
            v-model="username"
            type="text"
            required
            placeholder="admin@kqc.com.tw"
            class="w-full px-3 py-2 border rounded-lg bg-[var(--kqc-bg-card)] text-[var(--kqc-text-main)] text-sm border-[var(--kqc-border)] focus:outline-none focus:border-[var(--kqc-accent)] transition-colors"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-[var(--kqc-text-main)] mb-1">
            密碼
          </label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3 py-2 border rounded-lg bg-[var(--kqc-bg-card)] text-[var(--kqc-text-main)] text-sm border-[var(--kqc-border)] focus:outline-none focus:border-[var(--kqc-accent)] transition-colors"
          />
        </div>

        <KqcButton variant="accent" size="lg" block class="font-bold shadow-md">
          登入平台戰情室
        </KqcButton>
      </form>
    </KqcCard>
  </div>
</template>

<style lang="scss" scoped>
.login-view {
  background-color: var(--kqc-bg-main);
}
</style>