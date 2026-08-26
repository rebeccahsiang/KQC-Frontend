<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { industryWeatherApi, type IndustryWeather } from '@/api/industryWeather'

const weather = ref<IndustryWeather | null>(null)
const loading = ref(true)
const statusPresentation = computed(() => ({
  HOT: { label: '產業升溫', icon: 'lucide:trending-up', tone: 'hot' }, STABLE: { label: '走勢穩定', icon: 'lucide:minus', tone: 'stable' },
  COOLING: { label: '動能降溫', icon: 'lucide:trending-down', tone: 'cooling' }, UNKNOWN: { label: '資料不足', icon: 'lucide:circle-help', tone: 'unknown' }
}[weather.value?.status || 'UNKNOWN']))
const load = async () => {
  loading.value = true
  try { weather.value = (await industryWeatherApi.get()).data }
  catch { weather.value = { status: 'UNKNOWN', generatedAt: new Date().toISOString(), dataAsOf: null, sourceStatus: 'UNAVAILABLE', indicators: [], sources: [] } }
  finally { loading.value = false }
}
const value = (number: number) => new Intl.NumberFormat('zh-TW').format(number)
const change = (number: number | null) => number == null ? '—' : `${number > 0 ? '+' : ''}${number}%`
const directionIcon = (direction: string) => direction === 'UP' ? 'lucide:arrow-up-right' : direction === 'DOWN' ? 'lucide:arrow-down-right' : direction === 'FLAT' ? 'lucide:arrow-right' : 'lucide:minus'
onMounted(load)
</script>

<template>
  <section class="industry-weather" :class="`industry-weather--${statusPresentation.tone}`" aria-labelledby="industry-weather-title">
    <header><div><span class="eyebrow">政府開放資料</span><h2 id="industry-weather-title">運輸產業景氣</h2></div><div class="weather-status"><Icon :icon="statusPresentation.icon" />{{ statusPresentation.label }}</div></header>
    <div v-if="loading" class="weather-state" aria-live="polite">正在取得產業資料…</div>
    <div v-else-if="!weather?.indicators.length" class="weather-state" aria-live="polite"><Icon icon="lucide:cloud-off" /><span>產業資料暫時無法取得，請稍後再試。</span></div>
    <div v-else class="indicator-grid"><article v-for="indicator in weather.indicators" :key="indicator.key"><span>{{ indicator.label }}</span><strong>{{ value(indicator.value) }} <small>{{ indicator.unit }}</small></strong><em :class="`direction--${indicator.direction.toLowerCase()}`"><Icon :icon="directionIcon(indicator.direction)" />{{ change(indicator.changePercent) }}</em></article></div>
    <footer v-if="weather"><span v-if="weather.sourceStatus === 'FALLBACK'" class="fallback-note">目前顯示備援資料，非即時資料。</span><span v-else-if="weather.sourceStatus === 'LIVE'">資料期間：{{ weather.dataAsOf }}</span><a v-if="weather.sources[0]" :href="weather.sources[0].url" target="_blank" rel="noopener noreferrer">{{ weather.sources[0].publisher }}・{{ weather.sources[0].name }}</a></footer>
  </section>
</template>

<style scoped lang="scss">
.industry-weather { height: 100%; padding: 1.25rem; border: 1px solid var(--border-line); border-radius: 1rem; background: var(--bg-card); color: var(--text-primary); }
header, footer, .weather-status, em { display: flex; align-items: center; } header { justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
h2 { margin: .2rem 0 0; font-size: 1.15rem; } .eyebrow { color: var(--accent-gold); font-size: .72rem; font-weight: 700; letter-spacing: .08em; }
.weather-status { gap: .35rem; padding: .4rem .65rem; border-radius: 999px; font-size: .78rem; font-weight: 700; background: var(--bg-main); }
.indicator-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .65rem; } article { min-width: 0; padding: .75rem; border-radius: .75rem; background: var(--bg-main); }
article > span { display: block; min-height: 2.2em; color: var(--text-muted); font-size: .72rem; } strong { display: block; margin: .35rem 0; font-size: 1.05rem; } small { color: var(--text-muted); font-size: .7rem; }
em { gap: .2rem; width: fit-content; font-size: .75rem; font-style: normal; } .direction--up { color: #dc2626; } .direction--down { color: #2563eb; } .direction--flat, .direction--unknown { color: var(--text-muted); }
.weather-state { display: flex; min-height: 7rem; align-items: center; justify-content: center; gap: .5rem; color: var(--text-muted); text-align: center; }
footer { justify-content: space-between; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; color: var(--text-muted); font-size: .68rem; } footer a { color: var(--accent-gold); } .fallback-note { font-weight: 700; }
@media (max-width: 640px) { .indicator-grid { grid-template-columns: 1fr; } article > span { min-height: auto; } }
</style>
