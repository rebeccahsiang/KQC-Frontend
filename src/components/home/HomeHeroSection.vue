<script setup lang="ts">
defineProps<{ modelValue: string; loading: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; submit: [] }>()
const updateValue = (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value)
</script>

<template>
  <section class="hero-banner-card" aria-labelledby="home-hero-title">
    <div class="hero-visual" aria-hidden="true">
      <span class="hero-grid" />
      <span class="hero-orbit hero-orbit--one" />
      <span class="hero-orbit hero-orbit--two" />
      <span class="hero-route-line" />
    </div>
    <div class="hero-text-left">
      <span class="hero-badge-gold">三爵資訊 KQC 智慧運輸與 AI 轉型平台</span>
      <h1 id="home-hero-title" class="hero-main-title">傳統產能的數位賦能：<br>打造 B2B 資產交易的科技戰情室</h1>
      <p class="hero-sub-desc">擺脫傳統套版受限與昂貴維護費，專為台灣交通運輸業打造的高保密、毫秒級資產交易戰情室。</p>
      <form class="ai-search-input-group" role="search" aria-label="AI 案件語意匹配" @submit.prevent="emit('submit')">
        <label class="sr-only" for="home-ai-match">輸入案件需求</label>
        <input id="home-ai-match" :value="modelValue" type="text" placeholder="請輸入需求，例如：北部有兩台計程車牌想轉讓" class="kqc-input-field" :disabled="loading" @input="updateValue">
        <button type="submit" class="btn-match-gold" :disabled="loading">{{ loading ? '匹配中…' : 'AI 語意匹配' }}</button>
      </form>
      <p class="hero-search-note">快速描述需求，系統會協助整理相關案件。</p>
    </div>
    <div class="hero-industry-cue" aria-hidden="true"><span class="hero-industry-cue__label">TRANSPORT INTELLIGENCE</span><span class="hero-industry-cue__line" /><span class="hero-industry-cue__marker" /></div>
  </section>
</template>
