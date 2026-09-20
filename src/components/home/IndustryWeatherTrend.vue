<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IndustryStatisticsHistorySeries } from '@/api/industryStatistics'
type Range = { from: string; to: string | null }
const props = defineProps<{ series: IndustryStatisticsHistorySeries; metric: 'companies' | 'vehicles'; range?: Range; availableRange?: { from: string | null; to: string | null } }>()
const emit = defineEmits<{ memberRegister: [] }>()
const hoveredIndex = ref<number | null>(null)
const recentPoints = computed(() => [...props.series.points].sort((a, b) => a.period.localeCompare(b.period)).slice(-36))
const formatNumber = (value: number) => new Intl.NumberFormat('zh-TW').format(value)
const niceStep = (range: number) => { const raw = range / 4; const power = 10 ** Math.floor(Math.log10(raw || 1)); const normalized = raw / power; const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10; return factor * power }
const shortPeriod = (period: string) => period.slice(2)
const chart = computed(() => {
  const points = recentPoints.value; const values = points.map(point => point[props.metric]); const actualMin = Math.min(...values); const actualMax = Math.max(...values); const step = niceStep(actualMax - actualMin); const axisMin = Math.floor(actualMin / step) * step; const axisMax = Math.ceil(actualMax / step) * step + (axisMin === actualMax ? step : 0); const ticks = Array.from({ length: Math.max(2, Math.round((axisMax - axisMin) / step) + 1) }, (_, i) => axisMin + i * step)
  const width = 640; const height = 166; const left = 48; const right = 24; const top = 16; const bottom = 32; const plotWidth = width - left - right; const plotHeight = height - top - bottom; const x = (index: number) => left + (points.length > 1 ? index * plotWidth / (points.length - 1) : plotWidth / 2); const y = (value: number) => top + plotHeight - ((value - axisMin) / (axisMax - axisMin || 1)) * plotHeight
  const labels = points.map((point, index) => ({ period: point.period, index })).filter((label, index, all) => index === 0 || index === all.length - 1 || label.period.endsWith('-01') || label.period.endsWith('-07'))
  const selected = hoveredIndex.value === null ? null : points[hoveredIndex.value]
  const selectedX = selected && hoveredIndex.value !== null ? x(hoveredIndex.value) : 0
  const selectedY = selected ? y(selected[props.metric]) : 0
  const tooltipWidth = 142; const tooltipHeight = 34
  const tooltipX = Math.max(4, Math.min(width - tooltipWidth - 4, selectedX < 72 ? selectedX + 8 : selectedX > width - 72 ? selectedX - tooltipWidth - 8 : selectedX - tooltipWidth / 2))
  const tooltipY = Math.max(4, Math.min(height - tooltipHeight - 4, selectedY > 58 ? selectedY - tooltipHeight - 8 : selectedY + 8))
  return { points, axisMin, axisMax, ticks, polyline: points.map((point, i) => `${x(i)},${y(point[props.metric])}`).join(' '), labels, x, y, selected, selectedIndex: hoveredIndex.value, tooltipX, tooltipY, unit: props.metric === 'companies' ? '家' : '輛', label: props.metric === 'companies' ? '業者家數' : '營業車輛數', title: props.metric === 'companies' ? '業者家數趨勢' : '營業車輛數趨勢', latest: points.at(-1) ?? null }
})
const selectPoint = (event: PointerEvent) => { const svg = event.currentTarget as SVGElement; const box = svg.getBoundingClientRect(); const ratio = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)); hoveredIndex.value = Math.round(ratio * (recentPoints.value.length - 1)) }
</script>
<template>
  <div class="industry-weather-trend">
    <figure class="trend-card">
      <div class="trend-card__header">
        <div><figcaption>{{ chart.title }}（{{ chart.unit }}）</figcaption></div>
        <div class="trend-kpi"><strong>{{ chart.latest?.[metric] !== undefined ? formatNumber(chart.latest[metric]) : '—' }} {{ chart.unit }}</strong><span>{{ chart.latest?.period ?? '' }}</span></div>
      </div>
      <svg viewBox="0 0 640 166" role="img" :aria-label="`${chart.title}（${chart.unit}）`" :aria-describedby="`trend-desc-${metric}`" @pointerenter="selectPoint" @pointermove="selectPoint" @pointerleave="hoveredIndex = null">
        <desc :id="`trend-desc-${metric}`">近{{ recentPoints.length }}個月{{ chart.label }}趨勢，最新值 {{ chart.latest?.[metric] ?? null }}</desc>
        <g v-for="tick in chart.ticks" :key="tick"><line :x1="48" :x2="616" :y1="chart.y(tick)" :y2="chart.y(tick)" class="grid-line" /><text x="4" :y="chart.y(tick) + 3" class="axis-label">{{ formatNumber(tick) }}</text></g>
        <polyline :points="chart.polyline" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
        <g v-for="label in chart.labels" :key="label.period"><text :x="chart.x(label.index)" y="160" text-anchor="middle" class="axis-label">{{ shortPeriod(label.period) }}</text></g>
        <g v-if="chart.selected" class="trend-callout"><circle :cx="chart.x(chart.selectedIndex!)" :cy="chart.y(chart.selected[metric])" r="4.5" class="trend-point" /><rect :x="chart.tooltipX" :y="chart.tooltipY" width="142" height="34" rx="4" /><text :x="chart.tooltipX + 7" :y="chart.tooltipY + 14">{{ chart.selected.period }}</text><text :x="chart.tooltipX + 7" :y="chart.tooltipY + 27">{{ chart.label }} {{ formatNumber(chart.selected[metric]) }} {{ chart.unit }}</text></g>
      </svg>
      <div class="trend-info-strip"><span class="trend-period-label">顯示期間：{{ recentPoints[0]?.period ?? '' }} 至 {{ recentPoints.at(-1)?.period ?? '' }}（{{ recentPoints.length }} 個月）</span><div class="trend-member"><span>會員專屬產業資訊</span><button type="button" @click="emit('memberRegister')">立即註冊會員</button></div></div>
      <div v-if="availableRange?.from && availableRange.to" class="trend-meta">官方資料涵蓋：{{ availableRange.from }} 至 {{ availableRange.to }}</div>
    </figure>
  </div>
</template>
<style scoped lang="scss">
.industry-weather-trend { display: grid; color: var(--accent-active); }
.trend-card { margin: 0; padding: .5rem .75rem .45rem; border: 1px solid color-mix(in srgb, var(--border-grey) 72%, var(--accent-active)); border-radius: .8rem; background: color-mix(in srgb, var(--bg-card) 88%, var(--bg-main)); }
.trend-period-label { display: block; margin: 0; white-space: nowrap; line-height: 1.3; }
.trend-card__header { display: flex; align-items: flex-start; justify-content: space-between; gap: .65rem; margin-bottom: .15rem; }
figcaption { color: var(--text-main); font-size: var(--public-type-label, .9rem); font-weight: 800; }
.trend-kpi { display: grid; justify-items: end; gap: .12rem; color: var(--text-muted); font-size: .7rem; }
.trend-kpi strong { color: var(--text-main); font-size: 1.15rem; line-height: 1.15; }
svg { display: block; width: 100%; height: 9.75rem; min-height: 0; border: 1px solid color-mix(in srgb, var(--border-grey) 62%, transparent); border-radius: .55rem; background: var(--bg-main); overflow: visible; }
.axis-label { fill: var(--text-muted); font-size: 8px; }.grid-line { stroke: color-mix(in srgb, var(--border-grey) 52%, transparent); stroke-width: 1; }.trend-point { fill: var(--bg-card); stroke: var(--accent-active); stroke-width: 3; }.trend-callout rect { fill: #172b3d; stroke: #28455d; filter: drop-shadow(0 3px 5px rgb(10 25 39 / 18%)); }.trend-callout text { fill: #f5f8fb; font-size: 11px; }.trend-callout text:last-child { font-weight: 700; }.trend-info-strip { display: flex; align-items: center; justify-content: space-between; gap: .65rem; margin-top: .15rem; padding: .3rem .5rem; border: 1px solid color-mix(in srgb, #b7791f 28%, var(--border-grey)); border-radius: .6rem; color: #7b5b2b; background: #fff9ed; font-size: .7rem; line-height: 1.3; }.trend-member { display: flex; align-items: center; gap: .45rem; color: #526579; white-space: nowrap; line-height: 1.3; }.trend-member span { display: block; margin: 0; line-height: 1.3; }.trend-member button { min-height: 2rem; padding: .3rem .55rem; border: 1px solid #b7791f; border-radius: .45rem; color: #76551f; background: transparent; font: inherit; font-weight: 800; cursor: pointer; white-space: nowrap; line-height: 1.3; }.trend-member button:hover { color: #fff; background: #b7791f; }.trend-meta { margin: .1rem 0 0; padding-bottom: .1rem; color: #526579; font-size: .68rem; }
@media (max-width: 640px) { .trend-card__header { flex-direction: column; }.trend-kpi { justify-items: start; } svg { height: auto; min-height: 8.75rem; }.trend-info-strip { align-items: stretch; flex-direction: column; }.trend-period-label { white-space: normal; }.trend-member { align-items: stretch; flex-direction: column; }.trend-member button { width: 100%; }.trend-meta { font-size: .68rem; } }
@media (min-width: 641px) { .trend-card { padding-block: .25rem; }.trend-card__header { gap: .5rem; margin-bottom: 0; }.trend-info-strip { gap: .5rem; margin-top: 0; padding-block: .2rem; }.trend-meta { margin-top: 0; padding-bottom: 0; } }
</style>





