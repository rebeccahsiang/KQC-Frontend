<script setup lang="ts">
import { RouterView } from 'vue-router'
import FrontHeader from '@/components/layout/FrontHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import PublicBreadcrumb from '@/components/layout/PublicBreadcrumb.vue'
import BackToTop from '@/components/layout/BackToTop.vue'
</script>

<template>
  <div class="public-layout">
    <FrontHeader />
    <PublicBreadcrumb />
    <div class="public-layout__content"><RouterView /></div>
    <BackToTop />
    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
.public-layout { min-height: 100vh; padding-top: 1rem; display: flex; flex-direction: column; background: var(--bg-main); color: var(--text-main); }
.public-layout__content { flex: 1; min-width: 0; }
</style>
