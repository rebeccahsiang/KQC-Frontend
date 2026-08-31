<script setup lang="ts">
import CaseShowcase from '@/components/showcase/CaseShowcase.vue'
import type { PublicMarketplaceCase } from '@/api/publicMarketplace'
defineProps<{ cases: PublicMarketplaceCase[]; loading?: boolean; error?: string | null }>()
</script>
<template><section class="kqc-card-block"><h2 class="block-section-title">💼 即時資產買賣與委託櫥窗</h2><CaseShowcase :cases="cases" :loading="loading" :error="error" /></section></template>
