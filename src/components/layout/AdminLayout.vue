<script setup lang="ts">
import SidebarNav from './sidebar/SidebarNav.vue'
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="flex min-h-screen bg-[#0B0F19] text-slate-100 font-sans">
    <!-- 1. 左側選單：SidebarNav -->
    <SidebarNav />

    <!-- 2. 右側主要視區 -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
      <!-- 頂部 Header 工具列 -->
      <AppHeader />

      <!-- 主要內容掛載區 (帶有舒服的 p-6 到 p-8 外距) -->
      <main class="flex-1 p-6 lg:p-8 overflow-y-auto custom-main-scroll">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.custom-main-scroll {
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    &:hover {
      background: #EAB308;
    }
  }
}
</style>