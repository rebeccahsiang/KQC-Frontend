<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import CaseShowcase from '@/components/showcase/CaseShowcase.vue'
import MarketplaceProcessInfo from '@/components/showcase/MarketplaceProcessInfo.vue'
import { useCaseStore } from '@/stores/useCaseStore'
import { publicAdvertisementsApi, type PublicAdvertisement } from '@/api/publicAdvertisements'

const heroTruckImage = new URL('../assets/images/categories/freight-truck.jpg', import.meta.url).href

const caseStore = useCaseStore()
const publishedAdvertisements = ref<PublicAdvertisement[]>([])
const activeFilter = ref<'ALL' | 'BUY' | 'SELL'>('ALL')
const isMarketplaceSidebarCollapsed = ref(false)
const expandedMarketplaceGroups = ref(new Set(['asset-matching', 'transport-operations']))
const tabs: ReadonlyArray<{ value: 'ALL' | 'BUY' | 'SELL'; label: string }> = [
  { value: 'ALL', label: '全部' }, { value: 'BUY', label: '買方需求' }, { value: 'SELL', label: '精選待售' },
]
const marketplaceGroups = [
  { id: 'asset-matching', title: '資產買賣媒合', icon: 'lucide:handshake', items: [['誠意｜買家委託', true], ['精選｜賣家案件', true], ['特約公證處', true], ['代書流程把關', true]] },
  { id: 'transport-operations', title: '交通運輸運營服務', icon: 'lucide:truck', items: [['車位申請', true], ['營業車額代辦', true], ['專業車險與產險顧問對接', true]] },
  { id: 'websites', title: '專屬形象網站', icon: 'lucide:monitor-smartphone', items: [['靜態網頁', false], ['動態網頁', false], ['後台管理', false]] },
  { id: 'dispatch', title: '智慧派遣導入', icon: 'lucide:route', items: [['派遣平台建置', false], ['派遣平台導入', false]] },
  { id: 'driver-recruiting', title: '司機召募', icon: 'lucide:contact-round', items: [['立即卡位黃金職缺', false], ['最新職缺', false]] },
  { id: 'owner-services', title: '業主專區', icon: 'lucide:building-2', items: [['營業車額徵求', false], ['停車場徵求', false], ['方案 A：精選職缺刊登', false], ['方案 B：顧問委託招募', false], ['方案 C：企業專屬招募系統', false]] },
  { id: 'industry-analysis', title: '產業分析報告', icon: 'lucide:chart-no-axes-column-increasing', items: [['企業價值評估報告', false], ['產業併購策略規劃', false], ['事業轉讓／承購顧問', false], ['協助制定中長期轉型策略規劃', false]] },
] as const

/* PRODUCT-SHOWCASE-UI-R2D — Marketplace Group Accordion / local state preserves independent group expansion. */
const isMarketplaceGroupExpanded = (id: string) => expandedMarketplaceGroups.value.has(id)
const toggleMarketplaceGroup = (id: string) => {
  const next = new Set(expandedMarketplaceGroups.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedMarketplaceGroups.value = next
}

/* PRODUCT-CASE-B4 — Marketplace Transaction Filter / R2 retains canonical transactionType as the only tab authority. */
const setFilter = (type: 'ALL' | 'BUY' | 'SELL') => { activeFilter.value = type; caseStore.setFilters({ transactionType: type }) }
/* PRODUCT-ADVERTISEMENT-R3 — Public Advertisement Fetch / supplemental creative failure never affects canonical Case browsing. */
const fetchPublicAdvertisements = async () => {
  try { publishedAdvertisements.value = (await publicAdvertisementsApi.list()).data }
  catch { publishedAdvertisements.value = [] }
}
onMounted(() => { void caseStore.fetchPublicCases(); void fetchPublicAdvertisements() })
</script>

<template>
  <main id="main-content" class="product-view">
    <!-- PRODUCT-SHOWCASE-UI-R2A — Approved Marketplace Hero / local commercial-truck visual and presentation-only matching surface. -->
    <section class="marketplace-hero" aria-labelledby="marketplace-title">
      <div class="hero-inner">
        <div class="hero-copy">
          <span class="service-label">三爵資訊 KQC 智慧運輸與 AI 轉型平台</span>
          <h1 id="marketplace-title">傳統產能的數位賦能：<br /><strong>打造 B2B 資產交易的科技戰情室</strong></h1>
          <p>擺脫傳統套版受限與昂貴維護，專為台灣交通運輸業打造的<br />高保密、毫秒級資產交易戰情室。</p>
          <!-- PRODUCT-SHOWCASE-UI-R2A — AI Match Presentation / approved search styling adds no search or matching workflow. -->
          <div class="demand-entry" aria-label="AI 語意匹配功能展示"><span>輸入需求，例如：計程車、北部地區、貨車、委託買賣...</span><button type="button" class="demand-action" disabled>AI 語意匹配</button></div>
          <small>快速描述需求，系統會協助整理相關案件。</small>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <img :src="heroTruckImage" alt="" />
          <div class="hero-visual-tint" />
          <div class="public-total"><strong>{{ caseStore.cases.length }}</strong><span>公開標的</span></div>
        </div>
      </div>
    </section>

    <!-- PRODUCT-SHOWCASE-UI-R2C — Marketplace Sidebar Alignment / Admin-sized collapse state reflows only the public workspace. -->
    <section class="workspace" :class="{ 'sidebar-collapsed': isMarketplaceSidebarCollapsed }" aria-label="商品櫥窗工作區">
      <aside class="marketplace-sidebar" :class="{ collapsed: isMarketplaceSidebarCollapsed }" aria-labelledby="marketplace-services-title">
        <header class="marketplace-sidebar__header">
          <h2 v-if="!isMarketplaceSidebarCollapsed" id="marketplace-services-title">服務分類</h2>
          <span v-else id="marketplace-services-title" class="sr-only">服務分類</span>
          <button type="button" class="sidebar-collapse-button" :title="isMarketplaceSidebarCollapsed ? '展開服務分類' : '收合服務分類'" :aria-label="isMarketplaceSidebarCollapsed ? '展開服務分類' : '收合服務分類'" :aria-expanded="!isMarketplaceSidebarCollapsed" @click="isMarketplaceSidebarCollapsed = !isMarketplaceSidebarCollapsed"><Icon :icon="isMarketplaceSidebarCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" /></button>
        </header>
        <div v-for="group in marketplaceGroups" :key="group.id" class="service-group" :title="isMarketplaceSidebarCollapsed ? group.title : undefined">
          <button v-if="!isMarketplaceSidebarCollapsed" type="button" class="service-group__toggle" :aria-expanded="isMarketplaceGroupExpanded(group.id)" :aria-controls="`marketplace-group-${group.id}`" @click="toggleMarketplaceGroup(group.id)">
            <Icon :icon="group.icon" class="service-group__icon" aria-hidden="true" />
            <span>{{ group.title }}</span>
            <Icon :icon="isMarketplaceGroupExpanded(group.id) ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="service-group__chevron" aria-hidden="true" />
          </button>
          <div v-else class="service-group__compact-icon" aria-hidden="true"><Icon :icon="group.icon" /></div>
          <ul v-if="!isMarketplaceSidebarCollapsed" v-show="isMarketplaceGroupExpanded(group.id)" :id="`marketplace-group-${group.id}`" class="service-group__children"><li v-for="item in group.items" :key="item[0]" :class="{ 'is-current': item[1] }"><span>{{ item[0] }}</span><small v-if="!item[1]">規劃中</small></li></ul>
        </div>
      </aside>

      <div class="product-area">
        <header class="product-toolbar">
          <div><p>PUBLIC MARKETPLACE</p><div class="title-row"><h2>媒合商品案件</h2><span>{{ caseStore.filteredCases.length }} 筆</span></div></div>
          <div class="filter-tabs" role="tablist" aria-label="商品案件分類"><button v-for="tab in tabs" :key="tab.value" type="button" role="tab" :class="{ active: activeFilter === tab.value }" :aria-selected="activeFilter === tab.value" @click="setFilter(tab.value)">{{ tab.label }}</button></div>
          <!-- PRODUCT-SHOWCASE-UI-R4A — Compact Consultant Entry / reuses the existing public contact route without a new workflow. -->
          <router-link to="/contact" class="consultant-entry">
            <Icon icon="lucide:messages-square" aria-hidden="true" />
            <span><strong>聯絡 KQC 顧問</strong><small>精準媒合・加速成交</small></span>
            <Icon icon="lucide:chevron-right" aria-hidden="true" />
          </router-link>
        </header>
        <CaseShowcase :cases="caseStore.filteredCases" :advertisements="publishedAdvertisements" :loading="caseStore.isLoading" :error="caseStore.error" marketplace-mode />
        <MarketplaceProcessInfo />
      </div>

    </section>
  </main>
</template>

<style lang="scss" scoped>
.product-view { min-height: 100vh; color: #1d2939; background: #f4f7fa; }.marketplace-hero { overflow: hidden; border-bottom: 1px solid #d9e2eb; background: linear-gradient(105deg, #f8fbfd 0%, #eef5f9 58%, #d9eaf2 100%); }.hero-inner { display: grid; max-width: 90rem; min-height: 25rem; margin: 0 auto; padding: 2.5rem 2rem; align-items: center; grid-template-columns: minmax(0, 1.14fr) minmax(26rem, .86fr); gap: 2.5rem; }.service-label { position: relative; z-index: 1; display: inline-flex; padding: .4rem .7rem; border: 1px solid #21718d; border-radius: .25rem; color: #155b74; background: rgba(255,255,255,.72); font-size: .68rem; font-weight: 850; letter-spacing: .08em; }.hero-copy h1 { max-width: 48rem; margin: 1rem 0; color: #15243a; font-size: clamp(2.1rem, 2.8vw, 3.1rem); line-height: 1.18; letter-spacing: -.025em; }.hero-copy h1 strong { color: #1d718e; font-weight: 850; white-space: nowrap; }.hero-copy > p { max-width: 41rem; margin: 0 0 1.35rem; color: #5c6b7e; line-height: 1.75; }.hero-copy > small { display: block; margin-top: .55rem; color: #7b8795; font-size: .7rem; }.demand-entry { display: flex; max-width: 39rem; min-height: 3.4rem; padding-left: 1rem; align-items: center; justify-content: space-between; gap: 1rem; border: 1px solid #c9d5df; border-radius: .45rem; color: #7b8795; background: #fff; box-shadow: 0 8px 22px rgba(44, 76, 102, .08); font-size: .84rem; }.demand-action { display: inline-flex; min-height: 3.4rem; padding: 0 1.25rem; align-items: center; flex: 0 0 auto; border: 0; border-radius: 0 .4rem .4rem 0; color: #fff; background: #172b43; font: inherit; font-size: .78rem; font-weight: 800; cursor: default; }
.hero-visual { position: relative; min-height: 20rem; overflow: hidden; border-radius: 1.25rem; background: #b8d2de; box-shadow: inset 0 0 0 1px rgba(80, 137, 158, .15); }.hero-visual > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 58% center; }.hero-visual-tint { position: absolute; inset: 0; background: linear-gradient(115deg, rgba(19, 69, 91, .08), rgba(19, 93, 124, .28)); }.public-total { position: absolute; right: 1.2rem; bottom: 1.1rem; display: flex; min-width: 6.5rem; padding: .8rem 1rem; align-items: center; flex-direction: column; gap: .12rem; border: 1px solid rgba(255,255,255,.9); border-radius: .55rem; color: #fff; background: rgba(15, 39, 58, .94); box-shadow: 0 8px 22px rgba(20,51,70,.28); backdrop-filter: blur(8px); strong { color: #fff; font-size: 1.8rem; line-height: 1; } span { color: #f4f8fb; font-size: .72rem; font-weight: 750; line-height: 1.3; } }
.workspace { display: grid; max-width: 90rem; margin: 0 auto; padding: 1.5rem 2rem 4rem; align-items: start; grid-template-columns: 16rem minmax(0, 1fr); gap: 1.25rem; transition: grid-template-columns .25s ease; }.workspace.sidebar-collapsed { grid-template-columns: 4.75rem minmax(0, 1fr); }.marketplace-sidebar { width: 16rem; padding: .85rem; overflow: hidden; box-sizing: border-box; border: 1px solid #dce4eb; border-radius: .65rem; background: #fff; transition: width .25s ease; }.marketplace-sidebar.collapsed { width: 4.75rem; }.marketplace-sidebar__header { display: flex; min-height: 2rem; margin-bottom: .35rem; align-items: center; justify-content: space-between; gap: .5rem; }.marketplace-sidebar__header h2 { margin: 0; color: #26364a; font-size: .88rem; white-space: nowrap; }.sidebar-collapse-button { display: grid; width: 1.9rem; height: 1.9rem; flex: 0 0 1.9rem; place-items: center; border: 1px solid #d5dee6; border-radius: .42rem; color: #405367; background: #f6f8fa; cursor: pointer; }.sidebar-collapse-button:hover { border-color: #97701c; color: #795914; }.sidebar-collapse-button:focus-visible { outline: 3px solid rgba(151,112,28,.3); outline-offset: 2px; }.sidebar-collapse-button svg { width: 1rem; height: 1rem; }.marketplace-sidebar.collapsed .marketplace-sidebar__header { justify-content: center; }.service-group { padding: .65rem 0; border-top: 1px solid #edf1f4; h3 { display: flex; margin: 0 0 .4rem; align-items: center; gap: .5rem; color: #34465b; font-size: .7rem; line-height: 1.35; } h3 svg { width: 1rem; height: 1rem; flex: 0 0 1rem; color: #97701c; } ul { display: grid; margin: 0; padding: 0 0 0 1.5rem; gap: .28rem; list-style: none; } li { display: flex; align-items: flex-start; justify-content: space-between; gap: .3rem; color: #8792a0; font-size: .64rem; line-height: 1.35; } li.is-current { color: #405367; font-weight: 650; } li.is-current::before { width: .28rem; height: .28rem; margin-top: .3rem; flex: 0 0 auto; border-radius: 50%; background: #c58b18; content: ''; } li span { flex: 1; } li small { color: #a6aeb8; font-size: .55rem; white-space: nowrap; } }.marketplace-sidebar.collapsed .service-group { display: grid; min-height: 2.5rem; padding: .35rem 0; place-items: center; }.marketplace-sidebar.collapsed .service-group h3 { width: 2.35rem; height: 2.35rem; margin: 0; justify-content: center; border-radius: .5rem; background: #f5f7f9; }.marketplace-sidebar.collapsed .service-group h3 svg { width: 1.15rem; height: 1.15rem; }.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); border: 0; white-space: nowrap; }
/* PRODUCT-SHOWCASE-UI-R2D — Sidebar Typography Hierarchy / Admin-scale group controls and readable service entries. */
.service-group__toggle { display: flex; width: 100%; min-height: 2.5rem; padding: .55rem .65rem; align-items: center; gap: .7rem; border: 0; border-radius: .55rem; color: #34465b; background: transparent; font: inherit; font-size: .82rem; font-weight: 600; line-height: 1.35; text-align: left; cursor: pointer; }.service-group__toggle:hover { color: #172b43; background: #f1f5f8; }.service-group__toggle:focus-visible { outline: 3px solid rgba(151,112,28,.3); outline-offset: 1px; }.service-group__toggle span { min-width: 0; flex: 1; }.service-group__icon { width: 1.125rem; height: 1.125rem; flex: 0 0 1.125rem; color: #97701c; }.service-group__chevron { width: .95rem; height: .95rem; flex: 0 0 .95rem; color: #708092; }.service-group .service-group__children { display: grid; margin: .25rem 0 .2rem 1.2rem; padding: .2rem 0 .2rem .85rem; gap: .16rem; border-left: 1px solid #dce4eb; list-style: none; }.service-group .service-group__children li { min-height: 2rem; padding: .38rem .5rem; align-items: center; border-radius: .4rem; color: #657386; font-size: .76rem; line-height: 1.4; }.service-group .service-group__children li.is-current { color: #34465b; background: #f6f8fa; font-weight: 650; }.service-group .service-group__children li.is-current::before { margin-top: 0; }.service-group .service-group__children li small { font-size: .64rem; }.service-group__compact-icon { display: grid; width: 2.35rem; height: 2.35rem; place-items: center; border-radius: .5rem; color: #97701c; background: #f5f7f9; }.service-group__compact-icon svg { width: 1.15rem; height: 1.15rem; }
.product-toolbar { display: grid; margin-bottom: 1rem; align-items: center; grid-template-columns: minmax(max-content, 1fr) auto minmax(max-content, 1fr); gap: 1rem; }.product-toolbar p { margin: 0 0 .25rem; color: #97701c; font-size: .58rem; font-weight: 850; letter-spacing: .12em; }.title-row { display: flex; align-items: center; gap: .55rem; h2 { margin: 0; font-size: 1.3rem; } span { padding: .14rem .45rem; border: 1px solid #d9e1e8; border-radius: 999px; color: #6b7787; background: #fff; font-size: .63rem; } }.filter-tabs { display: flex; max-width: 100%; padding: .22rem; overflow-x: auto; justify-self: center; border: 1px solid #d7e0e7; border-radius: .5rem; background: #e9eef2; }.filter-tabs button { min-height: 2rem; padding: .35rem .7rem; border: 0; border-radius: .36rem; color: #657286; background: transparent; font: inherit; font-size: .68rem; font-weight: 750; white-space: nowrap; cursor: pointer; }.filter-tabs button.active { color: #fff; background: #213148; }.filter-tabs button:focus-visible { outline: 2px solid #b78118; outline-offset: -2px; }
/* PRODUCT-SHOWCASE-UI-R4A — Compact Consultant Entry / header action replaces the former large workspace CTA. */
.consultant-entry { display: flex; min-height: 2.8rem; padding: .4rem .6rem; align-items: center; justify-self: end; gap: .55rem; border: 1px solid #b8cbd4; border-radius: .55rem; color: #24455a; background: #fff; box-shadow: 0 4px 12px rgba(25,72,91,.05); text-decoration: none; }.consultant-entry > svg { width: 1rem; height: 1rem; flex: 0 0 1rem; color: #247188; }.consultant-entry span { display: grid; gap: .08rem; }.consultant-entry strong { font-size: .7rem; line-height: 1.25; }.consultant-entry small { color: #718093; font-size: .58rem; line-height: 1.25; }.consultant-entry:hover { border-color: #247188; background: #f7fbfc; }.consultant-entry:focus-visible { outline: 3px solid rgba(36,113,136,.25); outline-offset: 2px; }
@media (max-width: 960px) { .product-toolbar { grid-template-columns: minmax(0, 1fr) auto; }.filter-tabs { grid-row: 2; grid-column: 1 / -1; justify-self: start; } }
@media (max-width: 820px) { .hero-inner { min-height: auto; padding: 2rem 1rem; grid-template-columns: 1fr; }.hero-copy h1 strong { white-space: normal; }.hero-visual { min-height: 17rem; }.workspace, .workspace.sidebar-collapsed { padding: 1.25rem 1rem 3rem; grid-template-columns: 1fr; }.marketplace-sidebar { width: 100%; max-height: 16rem; overflow-y: auto; }.marketplace-sidebar.collapsed { width: 4.75rem; }.product-toolbar { align-items: stretch; grid-template-columns: 1fr; }.filter-tabs { width: 100%; box-sizing: border-box; grid-row: auto; grid-column: auto; justify-self: stretch; }.filter-tabs button { flex: 1 0 auto; }.consultant-entry { box-sizing: border-box; justify-self: stretch; } }
@media (max-width: 520px) { .hero-copy h1 { font-size: 2rem; }.demand-entry { padding: .65rem; align-items: stretch; flex-direction: column; }.demand-action { min-height: 2.8rem; border-radius: .35rem; justify-content: center; }.hero-visual { min-height: 13rem; }.public-total { right: .7rem; bottom: .7rem; }.marketplace-sidebar { max-height: 13rem; } }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto; } }
</style>
