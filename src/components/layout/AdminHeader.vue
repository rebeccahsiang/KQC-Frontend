<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const pageTitle = computed(() => String(route.meta.title || '後台管理'))
const roleLabel = computed(() => authStore.user?.role || 'admin')
const accountMenuOpen = ref(false)
const accountTrigger = ref<HTMLButtonElement | null>(null)
const accountMenu = ref<HTMLElement | null>(null)

const closeAccountMenu = ({ restoreFocus = false } = {}) => {
  accountMenuOpen.value = false
  if (restoreFocus) void nextTick(() => accountTrigger.value?.focus())
}

const openAccountMenu = async () => {
  accountMenuOpen.value = true
  await nextTick()
  accountMenu.value?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()
}

const toggleAccountMenu = () => accountMenuOpen.value ? closeAccountMenu() : void openAccountMenu()

const handleDocumentPointer = (event: PointerEvent) => {
  const target = event.target as Node
  if (!accountMenu.value?.contains(target) && !accountTrigger.value?.contains(target)) closeAccountMenu()
}

const handleDocumentKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && accountMenuOpen.value) closeAccountMenu({ restoreFocus: true })
}

const handleTriggerKey = (event: KeyboardEvent) => {
  if (event.key !== 'ArrowDown') return
  event.preventDefault()
  void openAccountMenu()
}

const leaveBackend = async () => {
  closeAccountMenu()
  try {
    await authStore.exitAdminPortal()
  } finally {
    await router.replace('/')
  }
}

const logoutAccount = async () => {
  closeAccountMenu()
  await authStore.logout()
  await router.replace('/')
}

onMounted(() => {
  themeStore.initTheme()
  document.addEventListener('pointerdown', handleDocumentPointer)
  document.addEventListener('keydown', handleDocumentKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointer)
  document.removeEventListener('keydown', handleDocumentKey)
})
</script>

<template>
  <header class="admin-header">
    <div class="breadcrumb" aria-label="目前位置">
      <Icon icon="lucide:house" aria-hidden="true" />
      <span>後台管理</span>
      <Icon icon="lucide:chevron-right" aria-hidden="true" />
      <strong>{{ pageTitle }}</strong>
    </div>

    <div class="header-actions">
      <button
        class="icon-button"
        type="button"
        :title="themeStore.isDark ? '切換至淺色模式' : '切換至深色模式'"
        :aria-label="themeStore.isDark ? '切換至淺色模式' : '切換至深色模式'"
        @click="themeStore.toggleTheme"
      >
        <Icon :icon="themeStore.isDark ? 'lucide:sun' : 'lucide:moon'" />
      </button>
      <button class="icon-button notification" type="button" title="通知" aria-label="通知">
        <Icon icon="lucide:bell" />
        <span class="notification-dot" aria-hidden="true"></span>
      </button>
      <div class="admin-account">
        <button
          ref="accountTrigger"
          class="admin-identity"
          type="button"
          aria-haspopup="menu"
          :aria-expanded="accountMenuOpen"
          aria-label="帳號選單"
          @click="toggleAccountMenu"
          @keydown="handleTriggerKey"
        >
          <span class="avatar">{{ authStore.adminName.slice(0, 1) }}</span>
          <span class="identity-copy">
            <strong>{{ authStore.adminName }}</strong>
            <small>{{ roleLabel }}</small>
          </span>
          <Icon icon="lucide:chevron-down" class="account-chevron" aria-hidden="true" />
        </button>
        <div v-if="accountMenuOpen" ref="accountMenu" class="account-menu" role="menu" aria-label="帳號操作">
          <button type="button" role="menuitem" @click="leaveBackend">
            <Icon icon="lucide:door-open" aria-hidden="true" />
            <span>離開後台</span>
          </button>
          <button type="button" role="menuitem" class="danger" @click="logoutAccount">
            <Icon icon="lucide:log-out" aria-hidden="true" />
            <span>登出帳號</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.admin-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-grey);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.breadcrumb,
.header-actions,
.admin-identity,
.identity-copy {
  display: flex;
  align-items: center;
}

.breadcrumb {
  gap: 8px;
  color: var(--text-muted);
  font-size: 0.875rem;

  svg { width: 16px; height: 16px; }
  strong { color: var(--text-main); font-weight: 600; }
}

.header-actions { gap: 10px; }

.icon-button {
  position: relative;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--border-grey);
  border-radius: 9px;
  background: var(--bg-card);
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition-fast);

  svg { width: 18px; height: 18px; }
  &:hover { background: var(--bg-hover); color: var(--text-main); border-color: var(--accent); }
}

.notification-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--danger);
}

.admin-identity {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  gap: 9px;
  padding-left: 10px;
  border-left: 1px solid var(--border-grey);
}

.admin-account { position: relative; }
.admin-identity:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.account-chevron { width: 14px; height: 14px; color: var(--text-muted); }
.account-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  display: grid;
  min-width: 10rem;
  padding: 6px;
  border: 1px solid var(--border-grey);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: var(--shadow-lg);
}
.account-menu button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-main);
  cursor: pointer;
  text-align: left;
}
.account-menu button:hover, .account-menu button:focus-visible { background: var(--bg-hover); outline: none; }
.account-menu button.danger { color: var(--danger); }
.account-menu svg { width: 16px; height: 16px; }

.avatar {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  background: var(--accent);
  color: #1e293b;
  font-weight: 700;
}

.identity-copy {
  align-items: flex-start;
  flex-direction: column;
  line-height: 1.25;
  strong { color: var(--text-main); font-size: 0.8rem; }
  small { color: var(--text-muted); font-size: 0.7rem; text-transform: capitalize; }
}

@media (max-width: 720px) {
  .identity-copy, .breadcrumb span { display: none; }
  .admin-header { padding: 0 14px; }
}
</style>
