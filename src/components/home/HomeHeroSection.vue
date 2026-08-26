<script setup lang="ts">
defineProps<{ modelValue: string; loading: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; submit: [] }>()
</script>
<template><section class="hero-banner-card"><div class="hero-text-left"><span class="hero-badge-gold">三爵資訊 KQC 智慧運輸與 AI 轉型平台</span><h1 class="hero-main-title">傳統產能的數位賦能：<br>打造 B2B 資產交易的科技戰情室</h1><p class="hero-sub-desc">擺脫傳統套版受限與昂貴維護費，專為台灣交通運輸業打造的高保密、毫秒級資產交易戰情室。</p><div class="ai-search-input-group"><input :value="modelValue" type="text" placeholder="請隨意輸入需求（例如：我北部有兩台計程車牌想轉讓...）" class="kqc-input-field" :disabled="loading" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" @keyup.enter="emit('submit')"><button class="btn-match-gold" :disabled="loading" @click="emit('submit')">{{ loading ? '匹配中...' : 'AI 語意匹配' }}</button></div></div></section></template>
