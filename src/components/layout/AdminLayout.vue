<script setup lang="ts">
import AdminHeader from '@/components/layout/AdminHeader.vue'
import SidebarNav from '@/components/layout/sidebar/SidebarNav.vue'
</script>

<template>
  <div class="admin-layout">
    <SidebarNav />
    <div class="admin-workspace">
      <AdminHeader />
      <main class="admin-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  min-height: 100dvh;
  background: var(--bg-main);
  color: var(--text-main);
  font-family: var(--kqc-font-family);
}

.admin-workspace {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.admin-main {
  flex: 1;
  min-width: 0;
  padding: 24px;
  overflow: auto;
  background: var(--bg-main);
}
</style>
