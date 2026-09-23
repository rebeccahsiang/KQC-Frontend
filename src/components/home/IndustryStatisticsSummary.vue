<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import carRentalImage from '@/assets/images/industry/industry-car-rental.png'
import truckingImage from '@/assets/images/industry/industry-trucking.png'
import containerTruckingImage from '@/assets/images/industry/industry-container-trucking.png'
import {
  industryStatisticsApi,
  type IndustryStatisticsCategoryKey,
  type IndustryStatisticsCategorySummary,
  type IndustryStatisticsStatus,
  type IndustryStatisticsSummary,
} from '@/api/industryStatistics'

const loading = ref(true)
const requestError = ref<string | null>(null)
const status = ref<IndustryStatisticsStatus | null>(null)
const refreshInFlight = ref(false)
const summary = ref<IndustryStatisticsSummary | null>(null)

const categoryPresentation: ReadonlyArray<{ key: IndustryStatisticsCategoryKey; icon: string; tone: string }> = [
  { key: 'CAR_RENTAL', icon: 'lucide:car-front', tone: 'blue' },
  { key: 'TRUCKING', icon: 'lucide:truck', tone: 'green' },
  { key: 'CONTAINER_TRUCKING', icon: 'lucide:container', tone: 'orange' },
]
const categoryImages: Record<IndustryStatisticsCategoryKey, string> = { CAR_RENTAL: carRentalImage, TRUCKING: truckingImage, CONTAINER_TRUCKING: containerTruckingImage }

const categoryCards = computed(() => categoryPresentation.map((presentation) => ({
  ...presentation,
  category: summary.value?.categories.find(({ categoryKey }) => categoryKey === presentation.key) ?? null,
})))

const formatNumber = (value: number) => new Intl.NumberFormat('zh-TW').format(value)
const formatChange = (value: number | null, unit: string) => {
  if (value === null) return `暫無${unit}資料`
  if (value === 0) return '持平'
  return `${value > 0 ? '+' : ''}${formatNumber(value)} ${unit}`
}
const formatPercent = (value: number | null) => value === null ? null : `${value > 0 ? '+' : ''}${value}%`
const changeTone = (value: number | null) => value === null ? 'neutral' : value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
const changeIcon = (value: number | null) => value === null || value === 0 ? 'lucide:minus' : value > 0 ? 'lucide:trending-up' : 'lucide:trending-down'
const categoryChange = (category: IndustryStatisticsCategorySummary) => {
  const company = category.change.companiesAbsolute
  const vehicle = category.change.vehiclesAbsolute
  return {
    company: formatChange(company, '家'),
    vehicle: formatChange(vehicle, '輛'),
    companyPercent: formatPercent(category.change.companiesPercent),
    vehiclePercent: formatPercent(category.change.vehiclesPercent),
    tone: changeTone(company ?? vehicle),
    icon: changeIcon(company ?? vehicle),
  }
}

const loadSummary = async () => {
  loading.value = true
  requestError.value = null

  try {
    const response = await industryStatisticsApi.getSummary()
    status.value = response.data.status
    refreshInFlight.value = response.data.refreshInFlight
    summary.value = response.data.summary
  } catch {
    status.value = null
    refreshInFlight.value = false
    summary.value = null
    requestError.value = '產業統計資料暫時無法取得，請稍後再試。'
  } finally {
    loading.value = false
  }
}

onMounted(loadSummary)
</script>

<template>
  <section class="industry-statistics-summary" aria-label="產業統計摘要">

    <p v-if="loading" aria-live="polite">正在取得產業統計資料…</p>

    <p v-else-if="requestError" role="alert">{{ requestError }}</p>

    <p v-else-if="status === 'UNAVAILABLE'" aria-live="polite">目前沒有可用的產業統計資料。</p>

    <div v-else-if="summary" class="industry-statistics-summary__data">
      <div class="summary-meta">
        <span class="summary-meta__source">交通部公路局・機動車輛登記數統計</span>
        <span class="summary-meta__period">至 {{ summary.source.officialPeriod }}</span>
        <span v-if="status === 'CACHED'" class="summary-meta__cached">目前顯示最近一次成功取得的官方資料</span>
        <span v-else-if="refreshInFlight" class="summary-meta__refresh">資料更新中</span>
      </div>

      <div class="category-grid">
        <template v-for="card in categoryCards" :key="card.key">
          <article v-if="card.category" class="category-card" :class="`category-card--${card.tone}`">
          <img class="category-card__image" :src="categoryImages[card.key]" :alt="`${card.category.categoryLabel}產業照片`">
          <header class="category-card__header">
            <span class="category-card__icon" aria-hidden="true"><Icon :icon="card.icon" /></span>
            <h3>{{ card.category.categoryLabel }}</h3>
          </header>
          <div class="category-card__metrics">
            <div><span>業者家數</span><strong>{{ formatNumber(card.category.latest.companies) }} <small>家</small></strong></div>
            <div><span>營業車輛</span><strong>{{ formatNumber(card.category.latest.vehicles) }} <small>輛</small></strong></div>
          </div>
          <div class="category-card__changes">
            <div class="category-card__change" :class="`category-card__change--${changeTone(card.category.change.companiesAbsolute)}`">
              <span>業者較上月</span><Icon :icon="changeIcon(card.category.change.companiesAbsolute)" aria-hidden="true" /><strong>{{ categoryChange(card.category).company }}</strong><small v-if="categoryChange(card.category).companyPercent">{{ categoryChange(card.category).companyPercent }}</small>
            </div>
            <div class="category-card__change" :class="`category-card__change--${changeTone(card.category.change.vehiclesAbsolute)}`">
              <span>車輛較上月</span><Icon :icon="changeIcon(card.category.change.vehiclesAbsolute)" aria-hidden="true" /><strong>{{ categoryChange(card.category).vehicle }}</strong><small v-if="categoryChange(card.category).vehiclePercent">{{ categoryChange(card.category).vehiclePercent }}</small>
            </div>
          </div>
          </article>
        </template>
      </div>

    </div>
  </section>
</template>

<style scoped lang="scss">
.industry-statistics-summary { min-width: 0; color: var(--text-primary, var(--text-main)); }
.industry-statistics-summary > h2 { margin: 0 0 .75rem; color: var(--text-main); font-size: var(--public-type-card-title, 1.15rem); }
.summary-meta { display: flex; width: 100%; align-items: center; gap: .65rem; margin-bottom: .65rem; color: var(--text-muted); font-size: var(--public-type-caption, .75rem); line-height: 1.35; flex-wrap: wrap; }
.summary-meta__period { font-weight: 800; color: var(--text-main); }
.summary-meta__source { color: var(--accent-active); font-weight: 800; }
.summary-meta__cached, .summary-meta__refresh { color: var(--accent-active); }
.category-grid { display: grid; width: 100%; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
.category-card { --category-accent: #256e86; --category-surface: #edf8fb; display: grid; min-width: 0; gap: .4rem; padding: .5rem; border: 1px solid color-mix(in srgb, var(--category-accent) 18%, var(--border-grey)); border-radius: .85rem; background: var(--bg-card); box-shadow: 0 6px 14px rgb(15 23 42 / 6%); transition: transform .2s ease, box-shadow .2s ease; }
.category-card__image { width: 100%; aspect-ratio: 16 / 5.25; object-fit: cover; border-radius: .55rem; }
.category-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgb(15 23 42 / 10%), 0 3px 6px rgb(15 23 42 / 5%); }
.category-card--green { --category-accent: #28745b; --category-surface: #eef9f2; }
.category-card--orange { --category-accent: #ae6d1f; --category-surface: #fff6e8; }
.category-card__header { display: flex; min-width: 0; align-items: center; gap: .55rem; }
.category-card__icon { display: grid; width: 2.5rem; height: 2.5rem; flex: 0 0 auto; place-items: center; border: 0; border-radius: 0; color: var(--category-accent); background: transparent; font-size: 1.55rem; }
.category-card h3 { min-width: 0; margin: 0; color: var(--text-main); font-size: var(--public-type-label, .85rem); line-height: 1.35; }
.category-card__metrics { display: grid; gap: .25rem; padding-top: .5rem; border-top: 1px solid color-mix(in srgb, var(--category-accent) 16%, var(--border-grey)); }
.category-card__metrics div { display: flex; align-items: baseline; justify-content: space-between; gap: .4rem; }
.category-card__metrics span { color: var(--text-muted); font-size: var(--public-type-caption, .72rem); }
.category-card__metrics strong { color: var(--text-main); font-size: var(--public-type-card-title, .98rem); line-height: 1; white-space: nowrap; }
.category-card__metrics small { color: var(--text-muted); font-size: var(--public-type-caption, .68rem); font-weight: 700; }
.category-card__changes { display: grid; gap: .2rem; padding-top: .35rem; border-top: 1px solid var(--border-grey); }
.category-card__change { display: grid; min-width: 0; align-items: center; grid-template-columns: 5.2rem auto minmax(0, 1fr) auto; gap: .3rem; color: var(--category-accent); font-size: var(--public-type-caption, .7rem); line-height: 1.35; }
.category-card__change > span { color: var(--text-muted); }
.category-card__change strong { overflow: hidden; color: inherit; font-size: inherit; text-overflow: ellipsis; white-space: nowrap; }
.category-card__change small { color: inherit; font-size: inherit; font-weight: 800; white-space: nowrap; }
.category-card__change--negative { color: #256e86; }
.category-card__change--positive { color: #28745b; }
.category-card__change--neutral { color: var(--text-muted); }
@media (max-width: 640px) { .category-grid { grid-template-columns: 1fr; } .category-card:last-child { grid-column: auto; } .category-card__metrics strong { font-size: var(--public-type-card-title, .98rem); } }
@media (prefers-reduced-motion: reduce) { .category-card { transition: none; } .category-card:hover { transform: none; } }
</style>
