<script setup lang="ts">import CaseShowcase from '@/components/showcase/CaseShowcase.vue'; defineProps<{cases: any[]}>()</script>
<template><section class="kqc-card-block"><h2 class="block-section-title">💼 即時資產買賣與委託櫥窗</h2><CaseShowcase :cases="cases" /></section></template>
