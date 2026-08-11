<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import Sidebar from '@/components/layout/Sidebar.vue'

const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<template>
  <div class="admin-layout">
    <!-- 全域頂部導覽列 -->
    <AppHeader />

    <!-- 主體：側欄 + 內容 -->
    <div class="admin-body">
      <Sidebar :is-collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />

      <main class="admin-main" :class="{ 'sidebar-expanded': !isSidebarCollapsed }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F8FAFC; /* 70% 雲霧極光白 */
}

.admin-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.admin-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0; /* 防止 flex 溢出 */
}
</style>