<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'

import { sidebarMenu } from '@/config/sidebarMenu'
import { useAuthStore } from '@/stores/authStore'
import SidebarMenuItem from './SidebarMenuItem.vue'
import { hasAnyCapability } from '@/config/capabilities'

const authStore = useAuthStore()
const isCollapsed = ref(false)
const visibleMenu = computed(() => {
  const role = authStore.user?.role
  return sidebarMenu.filter((item) =>
    (!item.roles || (role && item.roles.includes(role))) &&
    (!item.capabilities || hasAnyCapability(authStore.user, item.capabilities)))
})
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-brand">
      <div class="brand-lockup">
        <div class="logo-block">KQC</div>
        <span v-if="!isCollapsed" class="brand-title">三爵後台管理</span>
      </div>
      <button
        class="collapse-button"
        type="button"
        :title="isCollapsed ? '展開側邊欄' : '收合側邊欄'"
        :aria-label="isCollapsed ? '展開側邊欄' : '收合側邊欄'"
        @click="isCollapsed = !isCollapsed"
      >
        <Icon :icon="isCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" />
      </button>
    </div>

    <nav class="sidebar-menu" aria-label="後台主要導覽">
      <SidebarMenuItem
        v-for="item in visibleMenu"
        :key="item.id"
        :item="item"
        :is-collapsed="isCollapsed"
      />
    </nav>

    <div class="sidebar-footer">
      <div class="footer-avatar"><Icon icon="lucide:user-check" /></div>
      <div v-if="!isCollapsed" class="footer-copy">
        <strong>{{ authStore.adminName }}</strong>
        <span>{{ authStore.user?.email || 'admin@kqc.com.tw' }}</span>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.sidebar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  width: 256px;
  height: 100vh;
  flex: 0 0 256px;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  background: #1e293b;
  color: #e2e8f0;
  box-shadow: var(--shadow-lg);
  transition: width 0.25s ease, flex-basis 0.25s ease;

  &.collapsed { width: 76px; flex-basis: 76px; }
}

.sidebar-brand {
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.brand-lockup { display: flex; min-width: 0; align-items: center; gap: 10px; }
.logo-block {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  border-radius: 8px;
  background: var(--accent);
  color: #172033;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}
.brand-title { overflow: hidden; color: #fff; font-weight: 700; white-space: nowrap; }
.collapse-button {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.45);
  color: #cbd5e1;
  cursor: pointer;
  svg { width: 16px; height: 16px; }
  &:hover { border-color: var(--accent); color: var(--accent); }
}
.collapsed .sidebar-brand { justify-content: center; padding: 0 10px; flex-direction: column; gap: 2px; }
.collapsed .logo-block { width: 30px; height: 26px; flex-basis: 26px; }
.collapsed .collapse-button { height: 24px; }
.sidebar-menu { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 12px 10px; }
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px;
  padding: 10px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.38);
}
.footer-avatar { display: grid; width: 32px; height: 32px; flex: 0 0 32px; place-items: center; border-radius: 50%; color: var(--accent); background: #334155; }
.footer-avatar svg { width: 16px; height: 16px; }
.footer-copy { display: flex; min-width: 0; flex-direction: column; line-height: 1.3; }
.footer-copy strong { overflow: hidden; color: #fff; font-size: 0.75rem; text-overflow: ellipsis; white-space: nowrap; }
.footer-copy span { overflow: hidden; color: #94a3b8; font-size: 0.65rem; text-overflow: ellipsis; white-space: nowrap; }
.collapsed .sidebar-footer { justify-content: center; padding: 8px; }
</style>
