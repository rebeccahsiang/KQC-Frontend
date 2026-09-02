<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { CONTACT_SERVICE_PILLARS, type ContactPillarCode, type ContactServicePillar } from '@/config/contactServices'

type ServicePanel = 'ai' | 'quick-service' | 'human'

defineProps<{ activePanel: ServicePanel | null }>()
const emit = defineEmits<{ 'open-panel': [panel: ServicePanel] }>()
type HomeAccordionPillarCode = Exclude<ContactPillarCode, 'OTHER'>
const active = ref<HomeAccordionPillarCode | null>('VALUE')
const descriptions: Record<HomeAccordionPillarCode, string> = {
  VALUE: '從事業出售、承購到價值評估，我們協助交通運輸業經營者釐清交易需求、評估條件，並媒合合適的市場機會。',
  OPERATIONS: '從車隊營運、數位工具到營業所需資源，協助業者改善日常營運效率，並為企業數位轉型建立可持續擴充的基礎。',
  NETWORK: '整合法務、保險、維修、人力與轉型資源，讓企業在交易、營運與後續發展過程中，都能找到適合的專業協作服務。',
}
// HOME-R1B — Contact Service Authority / homepage recognition derives labels and icons from the Contact taxonomy.
const isHomeAccordionPillar = (pillar: ContactServicePillar): pillar is ContactServicePillar & { code: HomeAccordionPillarCode } => pillar.code !== 'OTHER'
const servicePillars = CONTACT_SERVICE_PILLARS.filter(isHomeAccordionPillar)
const serviceEntries: { id: ServicePanel; icon: string; label: string; description: string }[] = [
  { id: 'ai', icon: 'lucide:bot', label: 'AI 助理', description: 'AI 智慧協助與常見需求引導，目前為前端互動基礎。' },
  { id: 'quick-service', icon: 'lucide:messages-square', label: '快速服務', description: '快速查看預約、服務介紹與常見問題等服務入口。' },
  { id: 'human', icon: 'lucide:phone-call', label: '真人諮詢', description: '依需求類型查看人工協助與後續聯繫選項。' },
]
</script>

<template>
  <section class="home-service-guide">
    <div class="kqc-card-block">
      <h2 class="block-section-title text-center core-services-heading"><Icon icon="lucide:clipboard-list" aria-hidden="true" />核心服務模組對照</h2>
      <div class="accordion-centered-box">
        <div v-for="pillar in servicePillars" :key="pillar.code" class="accordion-item-row" :class="{ active: active === pillar.code }">
          <button class="accordion-head-bar" type="button" :aria-expanded="active === pillar.code" :aria-controls="`home-service-${pillar.code}`" @click="active = active === pillar.code ? null : pillar.code">
            <Icon :icon="pillar.icon" class="accordion-head-icon" aria-hidden="true" />
            <span class="head-title">{{ pillar.title }}</span>
            <Icon :icon="active === pillar.code ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="arrow-icon" aria-hidden="true" />
          </button>
          <Transition name="home-accordion">
            <div v-show="active === pillar.code" :id="`home-service-${pillar.code}`" class="accordion-body-text">
              <div class="accordion-category"><Icon :icon="pillar.icon" aria-hidden="true" /><strong>{{ pillar.title }}</strong></div>
              <div class="accordion-service-content"><p>{{ descriptions[pillar.code] }}</p><ul><li v-for="service in pillar.services" :key="service.code"><Icon icon="lucide:circle-check" aria-hidden="true" /><span>{{ service.label }}</span></li></ul></div>
            </div>
          </Transition>
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
          <Icon :icon="entry.icon" class="home-service-entry-card__icon" aria-hidden="true" />
          <strong>{{ entry.label }}</strong>
          <span>{{ entry.description }}</span>
        </button>
      </div>
    </aside>
  </section>
</template>
