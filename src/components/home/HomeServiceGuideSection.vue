<script setup lang="ts">
import { ref } from 'vue'

type ServicePanel = 'ai' | 'quick-service' | 'human'

defineProps<{ activePanel: ServicePanel | null }>()
const emit = defineEmits<{ 'open-panel': [panel: ServicePanel] }>()
const active = ref<number | null>(0)
const placeholderItems = [
  { title: 'WordPress 套版網站 vs KQC 數位平台', content: '以現有平台架構呈現服務與資料整合方向。' },
  { title: '產業資料與案件管理', content: '保留既有資料流程與後續擴充空間。' },
  { title: 'LINE Bot + AI 語意服務', content: '未來服務方向，本階段僅保留介紹。' },
]
const serviceEntries: { id: ServicePanel; icon: string; label: string; description: string }[] = [
  { id: 'ai', icon: '🤖', label: 'AI 助理', description: 'AI 智慧協助與常見需求引導，目前為前端互動基礎。' },
  { id: 'quick-service', icon: '💬', label: '快速服務', description: '快速查看預約、服務介紹與常見問題等服務入口。' },
  { id: 'human', icon: '📞', label: '真人諮詢', description: '依需求類型查看人工協助與後續聯繫選項。' },
]
</script>

<template>
  <section class="home-service-guide">
    <div class="kqc-card-block">
      <h2 class="block-section-title text-center">📋 核心服務模組對照</h2>
      <div class="accordion-centered-box">
        <div v-for="(item, index) in placeholderItems" :key="item.title" class="accordion-item-row" :class="{ active: active === index }">
          <button class="accordion-head-bar" :aria-expanded="active === index" @click="active = active === index ? null : index">
            <span class="head-title">{{ item.title }}</span><span class="arrow-icon">{{ active === index ? '▲' : '▼' }}</span>
          </button>
          <div v-if="active === index" class="accordion-body-text"><p>{{ item.content }}</p></div>
        </div>
      </div>
    </div>

    <aside class="home-service-entry-column" aria-label="首頁服務入口">
      <div class="home-service-entry-grid">
        <button
          v-for="entry in serviceEntries"
          :key="entry.id"
          type="button"
          class="home-service-entry-card"
          :class="{ active: activePanel === entry.id }"
          :aria-expanded="activePanel === entry.id"
          aria-controls="home-service-panel"
          @click="emit('open-panel', entry.id)"
        >
          <span class="home-service-entry-card__icon" aria-hidden="true">{{ entry.icon }}</span>
          <strong>{{ entry.label }}</strong>
          <span>{{ entry.description }}</span>
        </button>
      </div>
    </aside>
  </section>
</template>
