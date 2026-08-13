<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const pageTitle = computed(() => String(route.meta.title || '後台管理'))
const roleLabel = computed(() => authStore.user?.role || 'admin')

onMounted(themeStore.initTheme)
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
      <div class="admin-identity">
        <span class="avatar">{{ authStore.adminName.slice(0, 1) }}</span>
        <span class="identity-copy">
          <strong>{{ authStore.adminName }}</strong>
          <small>{{ roleLabel }}</small>
        </span>
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
  gap: 9px;
  padding-left: 10px;
  border-left: 1px solid var(--border-grey);
}

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
