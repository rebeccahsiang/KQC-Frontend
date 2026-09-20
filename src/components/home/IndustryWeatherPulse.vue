<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { industryStatisticsApi, type IndustryStatisticsHistory, type IndustryStatisticsStatus } from '@/api/industryStatistics'
import IndustryWeatherTrend from '@/components/home/IndustryWeatherTrend.vue'
import { useAuthStore } from '@/stores/authStore'
import pulseHeroImage from '@/assets/images/industry/industry-pulse-hero.png'

const isDialogOpen = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const dialog = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const historyRequested = ref(false)
const historyLoading = ref(false)
const historyRequestError = ref<string | null>(null)
const historyStatus = ref<IndustryStatisticsStatus | null>(null)
const historyRefreshInFlight = ref(false)
const history = ref<IndustryStatisticsHistory | null>(null)
const selectedCategoryKey = ref<'CAR_RENTAL' | 'TRUCKING' | 'CONTAINER_TRUCKING'>('CAR_RENTAL')
const selectedMetric = ref<'companies' | 'vehicles'>('companies')
const categoryOptions = computed(() => history.value?.series ?? [])
const selectedSeries = computed(() => history.value?.series.find((series) => series.categoryKey === selectedCategoryKey.value) ?? null)
const authStore = useAuthStore()
const openRegistration = () => {
  closeDialog()
  void nextTick(() => authStore.openAuthModal('register'))
}

const loadHistory = async () => {
  historyLoading.value = true
  historyRequestError.value = null
  try {
    const response = await industryStatisticsApi.getHistory()
    historyStatus.value = response.data.status
    historyRefreshInFlight.value = response.data.refreshInFlight
    history.value = response.data.history
  } catch {
    historyRequestError.value = '近期產業趨勢資料讀取失敗，請稍後再試。'
  } finally {
    historyLoading.value = false
  }
}

const openDialog = () => {
  isDialogOpen.value = true
  if (!historyRequested.value) {
    historyRequested.value = true
    void loadHistory()
  }
  void nextTick(() => closeButton.value?.focus())
}

const closeDialog = () => {
  isDialogOpen.value = false
  void nextTick(() => trigger.value?.focus())
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeDialog()
    return
  }
  if (event.key !== 'Tab' || !dialog.value) return
  const controls = [...dialog.value.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')]
  if (!controls.length) return
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onBeforeUnmount(() => {
  if (isDialogOpen.value) trigger.value?.focus()
})
</script>

<template>
  <div class="industry-weather-pulse">
    <img class="pulse-hero-image" :src="pulseHeroImage" alt="交通運輸產業脈動" />
    <div class="pulse-hero-overlay" aria-hidden="true"></div>
    <div class="pulse-editorial-copy">
      <span class="pulse-eyebrow">INDUSTRY PULSE</span>
      <h2 id="home-weather-title"><span>交通運輸產業</span><span>晴雨圖</span></h2>
      <p class="pulse-subtitle">以公開資料掌握近期產業動向。</p>
      <button ref="trigger" type="button" class="pulse-cta" @click="openDialog">
        查看近期產業趨勢
        <Icon icon="lucide:arrow-right" aria-hidden="true" />
      </button>
    </div>

    <div v-if="isDialogOpen" class="pulse-overlay" @click.self="closeDialog" @keydown="handleKeydown">
      <section ref="dialog" class="pulse-dialog" role="dialog" aria-modal="true" aria-labelledby="industry-pulse-dialog-title">
        <header class="pulse-dialog__header">
          <div>
            <span>INDUSTRY PULSE</span>
            <h3 id="industry-pulse-dialog-title">近期產業趨勢</h3>
          </div>
          <button ref="closeButton" type="button" class="pulse-dialog__close" aria-label="關閉近期產業趨勢" @click="closeDialog">
            <Icon icon="lucide:x" aria-hidden="true" />
          </button>
        </header>
        <div class="pulse-dialog__body">
          <p v-if="historyLoading" role="status">正在取得近期官方趨勢資料…</p>
          <p v-else-if="historyRequestError" role="alert">{{ historyRequestError }}</p>
          <p v-else-if="historyStatus === 'UNAVAILABLE' || !history">目前沒有可用的歷史趨勢資料。</p>
          <template v-else>
            <p v-if="historyStatus === 'CACHED'" class="pulse-dialog__cached">目前顯示最近一次成功取得的官方資料</p>
            <p v-if="historyRefreshInFlight" class="pulse-dialog__incomplete">資料更新中</p>
            <p v-if="!history.complete" class="pulse-dialog__incomplete">資料期間可能不完整，僅顯示實際取得的月份。</p>
            <div class="pulse-dialog__controls">
              <div class="pulse-dialog__selector pulse-dialog__selector--industry" aria-label="選擇產業類別">
                <button v-for="category in categoryOptions" :key="category.categoryKey" type="button" :aria-pressed="selectedCategoryKey === category.categoryKey" @click="selectedCategoryKey = category.categoryKey">{{ category.categoryLabel }}</button>
              </div>
              <div class="pulse-dialog__selector pulse-dialog__selector--metric" aria-label="選擇統計指標">
                <button type="button" :aria-pressed="selectedMetric === 'companies'" @click="selectedMetric = 'companies'">業者家數</button>
                <button type="button" :aria-pressed="selectedMetric === 'vehicles'" @click="selectedMetric = 'vehicles'">營業車輛數</button>
              </div>
            </div>
            <p v-if="!selectedSeries || !selectedSeries.points.length" class="pulse-dialog__empty">目前沒有此產業的歷史資料。</p>
            <IndustryWeatherTrend v-else :series="selectedSeries" :metric="selectedMetric" :range="history.range" :available-range="history.availableRange" @member-register="openRegistration" />
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.industry-weather-pulse { position: relative; display: grid; height: 100%; min-height: 0; margin-top: 0; overflow: hidden; border: 0; border-radius: .75rem; background: transparent; box-shadow: none; }
.pulse-hero-image { position: absolute; z-index: 0; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 58%; }
.pulse-hero-overlay { position: absolute; z-index: 1; inset: 0; background: linear-gradient(180deg, rgb(255 255 255 / 94%) 0%, rgb(255 255 255 / 72%) 18%, rgb(255 255 255 / 24%) 42%, rgb(255 255 255 / 0%) 64%); }
.pulse-editorial-copy { position: relative; z-index: 2; display: flex; min-height: 100%; align-items: flex-start; padding: 1.25rem 1.1rem; flex-direction: column; gap: .35rem; }
.pulse-eyebrow { color: var(--accent-active); font-size: var(--public-type-caption, .75rem); font-weight: 900; letter-spacing: .14em; }
.industry-weather-pulse .pulse-editorial-copy h2 { margin: .35rem 0 0; color: var(--accent-active); font-size: 21px; font-weight: 700; line-height: 1.18; white-space: nowrap; }
.industry-weather-pulse .pulse-editorial-copy h2 > span { display: inline; font-size: inherit; font-weight: inherit; line-height: inherit; color: inherit; }
.pulse-subtitle { max-width: none; margin: .2rem 0 0; color: var(--text-muted); font-size: .86rem; line-height: 1.45; white-space: nowrap; }
.pulse-cta { position: absolute; bottom: 1.25rem; left: 1.1rem; display: inline-flex; width: fit-content; min-height: 2.3rem; align-items: center; gap: .4rem; padding: .35rem .8rem; border: 1px solid var(--accent-active); border-radius: .65rem; color: var(--bg-card); background: var(--accent-active); font: inherit; font-size: var(--public-type-label, .84rem); font-weight: 800; white-space: nowrap; cursor: pointer; }
.pulse-cta:hover { color: var(--bg-card); background: var(--accent-active); }
.pulse-cta:focus-visible, .pulse-dialog button:focus-visible { outline: 3px solid rgb(var(--accent-rgb) / 34%); outline-offset: 3px; }
.pulse-overlay { position: fixed; inset: 0; z-index: 1400; display: grid; padding: 1rem; place-items: center; background: rgb(11 25 39 / 68%); backdrop-filter: blur(3px); }
.pulse-dialog { display: grid; width: min(46rem, calc(100vw - 3rem)); max-height: calc(100dvh - 3rem); overflow: hidden; border: 1px solid var(--border-grey); border-radius: 1rem; color: var(--text-main); background: var(--bg-card); box-shadow: 0 24px 60px rgb(10 25 39 / 32%); }
.pulse-dialog__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: .6rem 1rem; border-bottom: 1px solid var(--border-grey); }
.pulse-dialog__header span { color: var(--accent-active); font-size: var(--public-type-caption, .7rem); font-weight: 900; letter-spacing: .12em; }
.pulse-dialog h3 { margin: .2rem 0 0; font-size: var(--public-type-card-title, 1.25rem); }
.pulse-dialog__close { display: grid; width: 2.4rem; height: 2.4rem; flex: 0 0 auto; place-items: center; border: 0; border-radius: .5rem; color: var(--text-muted); background: var(--bg-main); font: inherit; cursor: pointer; }
.pulse-dialog__body { display: grid; min-height: 10rem; align-content: start; gap: .85rem; padding: 1.5rem; overflow-y: auto; color: var(--text-muted); }
.pulse-dialog__body > svg { color: var(--accent-active); font-size: 2rem; }
.pulse-dialog__body p { max-width: 28rem; margin: 0; line-height: 1.7; }
.pulse-dialog__cached, .pulse-dialog__incomplete { max-width: none !important; font-size: var(--public-type-caption, .75rem); }
.pulse-dialog__selector { display: flex; flex-wrap: wrap; gap: .4rem; }
.pulse-dialog__controls { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.pulse-dialog__selector button { min-height: 2.5rem; padding: .45rem .7rem; border: 1px solid var(--border-grey); border-radius: .55rem; color: var(--text-main); background: var(--bg-main); font: inherit; font-size: var(--public-type-caption, .75rem); cursor: pointer; }
.pulse-dialog__selector button[aria-pressed="true"] { border-color: var(--accent-active); color: var(--bg-card); background: var(--accent-active); }
.pulse-dialog__selector--metric button[aria-pressed="true"] { border-color: #3b6f9f; background: #3b6f9f; }

@media (max-width: 640px) { .industry-weather-pulse { height: auto; min-height: 24rem; margin-top: 0; } .pulse-editorial-copy { padding: 1rem; } .industry-weather-pulse .pulse-editorial-copy h2 { white-space: normal; }.industry-weather-pulse .pulse-editorial-copy h2 > span { display: block; }.pulse-subtitle { white-space: normal; }.pulse-cta { position: static; margin-top: .8rem; } .pulse-overlay { padding: .6rem; } .pulse-dialog { max-height: calc(100dvh - 1.2rem); } .pulse-dialog__header, .pulse-dialog__body { padding-right: 1rem; padding-left: 1rem; } .pulse-dialog__controls { flex-direction: column; } .pulse-cta { min-height: 3rem; } }
@media (prefers-reduced-motion: reduce) { .pulse-cta { transition: none; } }
.pulse-dialog__body { gap: .4rem; padding: .55rem 1rem; }
.pulse-dialog__controls { padding: .4rem .65rem; border: 1px solid color-mix(in srgb, var(--border-grey) 70%, transparent); border-radius: .7rem; background: var(--bg-main); gap: .65rem; }
@media (min-width: 641px) { .pulse-dialog__header { padding-block: .35rem; }.pulse-dialog__body { gap: .2rem; padding-block: .3rem; }.pulse-dialog__controls { padding-block: .2rem; } }
.pulse-dialog__selector { gap: .3rem; }
.pulse-dialog__selector button { min-height: 2.3rem; padding: .4rem .65rem; border-radius: .5rem; transition: background .18s ease, border-color .18s ease, color .18s ease; }
.pulse-dialog__selector button:hover { border-color: color-mix(in srgb, var(--accent-active) 55%, var(--border-grey)); }
.pulse-dialog__selector--metric button[aria-pressed="true"] { border-color: #3b6f9f; color: #fff; background: #3b6f9f; }
@media (prefers-reduced-motion: reduce) { .pulse-dialog__selector button { transition: none; } }</style>







