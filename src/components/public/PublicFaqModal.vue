<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePublicFaq } from '@/composables/usePublicFaq'

interface PublicFaqItem {
  id: string
  question: string
  answer: string
}

const publicFaqItems: PublicFaqItem[] = [
  {
    id: 'getting-started',
    question: '如何開始使用三爵資訊的服務？',
    answer: '您可以先從產品櫥窗了解目前提供的服務內容，也可以透過聯絡我們提出需求，由服務人員協助您確認後續方向。',
  },
  {
    id: 'learn-before-consulting',
    question: '可以先了解服務內容再決定是否諮詢嗎？',
    answer: '可以。您可以先瀏覽首頁精選服務與產品櫥窗，了解服務方向後，再依實際需求選擇是否進一步諮詢。',
  },
  {
    id: 'transport-service',
    question: '如何尋找適合我的交通運輸相關服務？',
    answer: '您可以從網站的服務內容開始瀏覽，或透過快速服務與聯絡我們說明需求，協助您找到較合適的服務入口。',
  },
  {
    id: 'industry-information',
    question: '產業資訊與最新動態可以在哪裡查看？',
    answer: '您可以前往「產業洞察」，查看平台整理的交通運輸產業資訊、趨勢與相關內容。',
  },
  {
    id: 'ai-assistant',
    question: 'AI 助理目前可以提供哪些協助？',
    answer: 'AI 助理目前先作為網站互動功能的展示與基礎入口；正式服務能力與回答範圍將於後續版本逐步完善。',
  },
]

const router = useRouter()
const { isFaqOpen, closeFaq } = usePublicFaq()
const query = ref('')
const expandedId = ref<string | null>(publicFaqItems[0].id)
const dialogRef = ref<HTMLElement | null>(null)
let previousFocusedElement: HTMLElement | null = null

const filteredFaqItems = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase()
  if (!keyword) return publicFaqItems
  return publicFaqItems.filter(({ question, answer }) =>
    `${question} ${answer}`.toLocaleLowerCase().includes(keyword),
  )
})

const toggleFaq = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id
}

const goToContact = async () => {
  closeFaq()
  await router.push('/contact')
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFaqOpen.value) closeFaq()
}

watch(query, () => {
  expandedId.value = filteredFaqItems.value[0]?.id ?? null
})

watch(isFaqOpen, async (isOpen) => {
  if (isOpen) {
    previousFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
    query.value = ''
    expandedId.value = publicFaqItems[0].id
    await nextTick()
    dialogRef.value?.focus()
    return
  }

  await nextTick()
  previousFocusedElement?.focus()
  previousFocusedElement = null
})

onMounted(() => window.addEventListener('keydown', handleEscape))
onUnmounted(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <Transition name="public-faq-modal">
    <div v-if="isFaqOpen" class="public-faq-overlay" @click.self="closeFaq">
      <section
        ref="dialogRef"
        class="public-faq-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-faq-title"
        aria-describedby="public-faq-description"
        tabindex="-1"
      >
        <header class="public-faq-modal__header">
          <div>
            <h2 id="public-faq-title">常見問題</h2>
            <p id="public-faq-description">快速找到您需要的服務資訊</p>
          </div>
          <button type="button" class="public-faq-modal__close" aria-label="關閉常見問題" @click="closeFaq">×</button>
        </header>

        <div class="public-faq-modal__content">
          <label class="public-faq-modal__search-label" for="public-faq-search">搜尋常見問題</label>
          <input
            id="public-faq-search"
            v-model="query"
            class="public-faq-modal__search"
            type="search"
            placeholder="搜尋問題或答案"
          >

          <div v-if="filteredFaqItems.length" class="public-faq-list">
            <article v-for="item in filteredFaqItems" :key="item.id" class="public-faq-item">
              <h3>
                <button
                  type="button"
                  :id="`public-faq-question-${item.id}`"
                  class="public-faq-item__trigger"
                  :aria-expanded="expandedId === item.id"
                  :aria-controls="`public-faq-answer-${item.id}`"
                  @click="toggleFaq(item.id)"
                >
                  <span>{{ item.question }}</span>
                  <span aria-hidden="true">{{ expandedId === item.id ? '−' : '+' }}</span>
                </button>
              </h3>
              <div
                v-show="expandedId === item.id"
                :id="`public-faq-answer-${item.id}`"
                class="public-faq-item__answer"
                role="region"
                :aria-labelledby="`public-faq-question-${item.id}`"
              >
                <p>{{ item.answer }}</p>
              </div>
            </article>
          </div>
          <p v-else class="public-faq-modal__empty">找不到符合的常見問題。</p>
        </div>

        <footer class="public-faq-modal__footer">
          <p>找不到答案？</p>
          <div class="public-faq-modal__footer-actions">
            <button type="button" disabled title="真人諮詢功能將於後續版本開放">真人諮詢</button>
            <button type="button" class="public-faq-modal__contact" @click="goToContact">聯絡我們</button>
          </div>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.public-faq-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: $kqc-spacing-xl;
  background: rgb(15 23 42 / 48%);
}

.public-faq-modal {
  display: flex;
  flex-direction: column;
  width: min(52rem, 100%);
  max-height: calc(100vh - 3rem);
  overflow: hidden;
  color: var(--text-main);
  background: var(--bg-card);
  border: 1px solid var(--border-grey);
  border-radius: $kqc-radius-xl;
  box-shadow: 0 1.5rem 4rem rgb(15 23 42 / 24%);

  &:focus { outline: none; }
}

.public-faq-modal__header,
.public-faq-modal__footer {
  flex: 0 0 auto;
  padding: $kqc-spacing-xl;
}

.public-faq-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $kqc-spacing-lg;
  border-bottom: 1px solid var(--border-grey);

  h2 { margin: 0; font-size: $kqc-type-section-title; }
  p { margin: $kqc-spacing-xs 0 0; color: var(--text-muted); font-size: $kqc-type-body; }
}

.public-faq-modal__close {
  width: $kqc-control-height-md;
  height: $kqc-control-height-md;
  color: var(--text-main);
  background: transparent;
  border: 1px solid var(--border-grey);
  border-radius: $kqc-radius-full;
  font-size: $kqc-type-card-title;
  cursor: pointer;
}

.public-faq-modal__content {
  flex: 1 1 auto;
  min-height: 0;
  padding: $kqc-spacing-xl;
  overflow-y: auto;
}

.public-faq-modal__search-label {
  display: block;
  margin-bottom: $kqc-spacing-sm;
  font-size: $kqc-type-label;
  font-weight: 700;
}

.public-faq-modal__search {
  width: 100%;
  min-height: $kqc-control-height-lg;
  padding: 0 $kqc-spacing-lg;
  color: var(--text-main);
  background: var(--bg-main);
  border: 1px solid var(--border-grey);
  border-radius: $kqc-radius-md;
  font: inherit;
}

.public-faq-list { margin-top: $kqc-spacing-lg; }
.public-faq-item { border-bottom: 1px solid var(--border-grey); }
.public-faq-item h3 { margin: 0; }

.public-faq-item__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $kqc-spacing-lg;
  width: 100%;
  padding: $kqc-spacing-lg 0;
  color: var(--text-main);
  text-align: left;
  background: transparent;
  border: 0;
  font-size: $kqc-type-body-emphasis;
  font-weight: 700;
  cursor: pointer;
}

.public-faq-item__answer {
  padding: 0 $kqc-spacing-2xl $kqc-spacing-lg 0;
  color: var(--text-muted);
  font-size: $kqc-type-body;
  line-height: 1.75;

  p { margin: 0; }
}

.public-faq-modal__empty {
  margin: $kqc-spacing-2xl 0;
  color: var(--text-muted);
  text-align: center;
}

.public-faq-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $kqc-spacing-lg;
  border-top: 1px solid var(--border-grey);

  p { margin: 0; font-weight: 700; }
}

.public-faq-modal__footer-actions { display: flex; gap: $kqc-spacing-sm; }
.public-faq-modal__footer-actions button {
  min-height: $kqc-control-height-md;
  padding: 0 $kqc-spacing-lg;
  border: 1px solid var(--border-grey);
  border-radius: $kqc-radius-md;
  font: inherit;
}
.public-faq-modal__footer-actions button:disabled { cursor: not-allowed; opacity: 0.55; }
.public-faq-modal__contact { color: var(--text-on-brand, white); background: var(--brand-primary); cursor: pointer; }

.public-faq-modal-enter-active,
.public-faq-modal-leave-active { transition: opacity 0.22s ease; }
.public-faq-modal-enter-active .public-faq-modal,
.public-faq-modal-leave-active .public-faq-modal { transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1); }
.public-faq-modal-enter-from,
.public-faq-modal-leave-to { opacity: 0; }
.public-faq-modal-enter-from .public-faq-modal,
.public-faq-modal-leave-to .public-faq-modal { opacity: 0; transform: translateY(0.75rem); }

@media (max-width: $breakpoint-sm) {
  .public-faq-overlay { padding: $kqc-spacing-md; }
  .public-faq-modal { max-height: calc(100vh - 1.5rem); }
  .public-faq-modal__header,
  .public-faq-modal__content,
  .public-faq-modal__footer { padding: $kqc-spacing-lg; }
  .public-faq-modal__footer { align-items: stretch; flex-direction: column; }
  .public-faq-modal__footer-actions { display: grid; grid-template-columns: 1fr 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .public-faq-modal-enter-active,
  .public-faq-modal-leave-active,
  .public-faq-modal-enter-active .public-faq-modal,
  .public-faq-modal-leave-active .public-faq-modal { transition: none; }
}
</style>
