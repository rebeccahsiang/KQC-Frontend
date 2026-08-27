<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

type ServicePanel = 'ai' | 'quick-service' | 'human'
type FutureAction = { id: string; label: string; action: 'future' | 'route'; target?: string; enabled: boolean }

const props = defineProps<{ activePanel: ServicePanel | null }>()
const emit = defineEmits<{ 'update:activePanel': [panel: ServicePanel | null] }>()
const dockItems: { id: ServicePanel; icon: string; label: string }[] = [
  { id: 'ai', icon: '🤖', label: 'AI 助理' },
  { id: 'quick-service', icon: '💬', label: '快速服務' },
  { id: 'human', icon: '📞', label: '真人諮詢' },
]
const aiPrompts = ['不確定是否符合設立條件？', '想了解牌照買賣流程？', '想獲得 24 小時即時解答']
const quickServiceActions: FutureAction[] = [
  { id: 'consultation', label: '預約諮詢', action: 'future', enabled: false },
  { id: 'services', label: '服務介紹', action: 'future', enabled: false },
  { id: 'question', label: '提出問題', action: 'future', enabled: false },
  { id: 'faq', label: '常見問題解答', action: 'future', enabled: false },
  { id: 'offers', label: '尋找優惠', action: 'future', enabled: false },
  { id: 'events', label: '近期活動訊息', action: 'future', enabled: false },
]
const humanServiceCategories = ['資產買賣', '網站架設', '車額買賣', '停車位證明']
const humanContactActions: FutureAction[] = [
  { id: 'call', label: '直接撥打', action: 'future', enabled: false },
  { id: 'callback', label: '請與我聯絡', action: 'future', enabled: false },
]
const panelTitle = computed(() => dockItems.find((item) => item.id === props.activePanel)?.label ?? '')
const togglePanel = (panel: ServicePanel) => { emit('update:activePanel', props.activePanel === panel ? null : panel) }
const closePanel = () => { emit('update:activePanel', null) }
const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') closePanel() }

onMounted(() => window.addEventListener('keydown', handleEscape))
onUnmounted(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <div class="home-service-workspace">
    <aside class="fixed-right-widget-panel" aria-label="浮動服務導覽">
      <div class="widget-icon-bar">
        <button v-for="item in dockItems" :key="item.id" type="button" class="widget-tab-btn" :class="{ active: props.activePanel === item.id }" :aria-expanded="props.activePanel === item.id" aria-controls="home-service-panel" @click="togglePanel(item.id)">
          <span class="tab-icon" aria-hidden="true">{{ item.icon }}</span><span class="tab-label">{{ item.label }}</span>
        </button>
      </div>
    </aside>

    <Transition name="service-panel">
      <section v-if="props.activePanel" id="home-service-panel" class="home-service-panel" :aria-labelledby="`home-service-panel-${props.activePanel}-title`">
        <header class="home-service-panel__header">
          <h2 :id="`home-service-panel-${props.activePanel}-title`">{{ panelTitle }}</h2>
          <button type="button" class="home-service-panel__close" aria-label="關閉服務面板" @click="closePanel">×</button>
        </header>
        <div class="home-service-panel__body">
          <template v-if="props.activePanel === 'ai'">
            <p class="home-service-panel__intro">您好！<br>請使用 AI 助理協助您：</p>
            <div class="home-service-panel__actions"><button v-for="prompt in aiPrompts" :key="prompt" type="button" disabled>{{ prompt }}</button></div>
            <div class="ai-foundation-input" aria-label="AI 助理尚未連線"><input type="text" disabled placeholder="AI 服務將於後續版本開放" aria-label="AI 服務尚未開放"><button type="button" disabled>傳送</button></div>
            <p class="home-service-panel__status">互動介面準備中，目前不會送出資料。</p>
          </template>
          <template v-else-if="props.activePanel === 'quick-service'">
            <p class="home-service-panel__intro">您好！<br>我可以幫您：</p>
            <div class="home-service-panel__actions home-service-panel__actions--grid"><button v-for="action in quickServiceActions" :key="action.id" type="button" :disabled="!action.enabled">{{ action.label }}</button></div>
            <p class="home-service-panel__status">服務入口將於對應功能完成後開放。</p>
          </template>
          <template v-else>
            <p class="home-service-panel__intro">您好！<br>請選擇您需要的服務：</p>
            <fieldset class="human-service-categories"><legend>服務類別</legend><button v-for="category in humanServiceCategories" :key="category" type="button" disabled>{{ category }}</button></fieldset>
            <div class="human-contact-actions" aria-label="聯絡方式"><button v-for="action in humanContactActions" :key="action.id" type="button" :disabled="!action.enabled">{{ action.label }}</button></div>
            <p class="home-service-panel__status">真人聯絡方式尚待正式資料與流程串接。</p>
          </template>
        </div>
      </section>
    </Transition>
  </div>
</template>
