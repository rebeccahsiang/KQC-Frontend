<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute, useRouter } from 'vue-router'

import type { SidebarMenuItem } from '@/config/sidebarMenu'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{ item: SidebarMenuItem; isCollapsed?: boolean }>()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isOpen = ref(true)
const visibleChildren = computed(() => props.item.children?.filter((child) =>
  !child.roles || (authStore.user?.role && child.roles.includes(authStore.user.role))
) || [])
const isActive = computed(() => props.item.path
  ? route.path === props.item.path
  : visibleChildren.value.some((child) => child.path === route.path))

const activate = () => {
  // 預留項目只呈現資訊架構，不允許展開或觸發 router navigation。
  if (props.item.disabled) return
  if (visibleChildren.value.length) isOpen.value = !isOpen.value
  else if (props.item.path) void router.push(props.item.path)
}
</script>

<template>
  <div class="menu-item">
    <button
      type="button"
      class="menu-button"
      :class="{ active: isActive, compact: isCollapsed, reserved: item.disabled }"
      :disabled="item.disabled"
      :aria-disabled="item.disabled ? 'true' : undefined"
      :title="isCollapsed ? `${item.title}${item.disabled ? '（尚未開放）' : ''}` : undefined"
      :aria-expanded="visibleChildren.length ? isOpen : undefined"
      @click="activate"
    >
      <Icon :icon="item.icon" class="menu-icon" aria-hidden="true" />
      <span v-if="!isCollapsed" class="menu-title">{{ item.title }}</span>
      <span v-if="item.disabled && !isCollapsed" class="reserved-badge">尚未開放</span>
      <Icon
        v-if="visibleChildren.length && !isCollapsed"
        icon="lucide:chevron-down"
        class="chevron"
        :class="{ open: isOpen }"
        aria-hidden="true"
      />
    </button>

    <div v-if="visibleChildren.length && isOpen && !isCollapsed" class="submenu">
      <SidebarMenuItem
        v-for="child in visibleChildren"
        :key="child.id"
        :item="child"
        :is-collapsed="false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-item + .menu-item { margin-top: 4px; }
.menu-button {
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  gap: 11px;
  padding: 9px 11px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #cbd5e1;
  font-family: var(--kqc-font-family);
  font-size: 0.82rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;

  &:hover { background: rgba(51, 65, 85, 0.85); color: #fff; }
  &.active { background: var(--accent); color: #172033; font-weight: 700; }
  &.compact { justify-content: center; padding-inline: 8px; }
  &.reserved, &.reserved:hover {
    background: transparent;
    color: #64748b;
    cursor: not-allowed;
    opacity: 0.72;
  }
}
.menu-icon { width: 18px; height: 18px; flex: 0 0 18px; color: #facc15; }
.active .menu-icon { color: #172033; }
.menu-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.reserved-badge { padding: 2px 6px; border: 1px solid rgba(148, 163, 184, 0.3); border-radius: 999px; color: #94a3b8; font-size: 0.62rem; white-space: nowrap; }
.chevron { width: 15px; height: 15px; transition: transform 0.18s ease; }
.chevron.open { transform: rotate(180deg); }
.submenu { margin: 4px 0 6px 17px; padding-left: 9px; border-left: 1px solid rgba(148, 163, 184, 0.22); }
.submenu :deep(.menu-button) { min-height: 36px; padding-block: 7px; font-size: 0.78rem; }
</style>
