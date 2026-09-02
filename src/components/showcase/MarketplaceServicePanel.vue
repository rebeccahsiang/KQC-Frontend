<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface MarketplaceServicePanelData {
  id: 'commercial-vehicle-quota' | 'parking-space-application' | 'commercial-insurance-advisory'
  title: string
  summary: string
  icon: string
  planned?: boolean
}

defineProps<{ service: MarketplaceServicePanelData }>()

// PRODUCT-SIDEBAR-R4F-8B — Real Service Detail Content / local presentation data owns no workflow authority.
const vehicleQuotaTypes = [
  ['租賃小客（貨）車', 'lucide:car-front'], ['營業小貨車', 'lucide:truck'],
  ['營業小客車', 'lucide:car-taxi-front'], ['營業大貨車（含貨運曳引車）', 'lucide:container'],
  ['營業拖車', 'lucide:panels-top-left'],
] as const
const vehicleQuotaProcess = ['需求確認', '媒合／報價', '確認交易', '簽署文件／訂金', '過戶辦理', '完成交付']
const sellerDocuments = ['車額表', '車牌價格', '公司准登記表', '變更登記表', '運輸執照', '公會證明書', '公司大小章']
const buyerDocuments = ['車輛行照', '預購時間', '預算金額', '預計購買車牌／車額需求']
const parkingChecks = [
  { title: '地區', detail: '確認申辦所在地區', icon: 'lucide:map-pin' },
  { title: '車位需求', detail: '小型／大型車位・需求格數', icon: 'lucide:square-parking' },
  { title: '租期', detail: '兩年／三年', icon: 'lucide:calendar-range' },
] as const
const parkingProcess = ['資料確認', '提供報價', '確認委託', '資料／用印', '申請作業', '核准函取得']
const parkingDocuments = ['運輸業營業執照', '公司登記核准函', '變更登記表', '運輸公會證書']

// PRODUCT-SIDEBAR-R4F-8D — Real Asset Activation / approved same-origin binaries are direct presentation authority.
const parkingAssets = {
  authorizationPdf: '/downloads/授權刻印同意書.pdf',
  lineQr: '/images/services/kqc-line-official-qr.png',
} as const
</script>

<template>
  <!-- PRODUCT-SIDEBAR-R4F — Public Service Panel / no API, persistence, Marketplace filter or router authority. -->
  <article class="marketplace-service-panel" :aria-labelledby="`marketplace-service-${service.id}`">
    <header class="service-hero">
      <span class="service-hero__icon" aria-hidden="true"><Icon :icon="service.icon" /></span>
      <div class="service-hero__copy"><p>TRANSPORT SERVICE</p><h2 :id="`marketplace-service-${service.id}`">{{ service.title }}</h2><p class="service-hero__summary">{{ service.summary }}</p></div>
      <span v-if="service.planned" class="service-status">規劃中</span>
    </header>

    <section v-if="service.planned" class="planning-card" aria-label="規劃中服務">
      <Icon icon="lucide:calendar-clock" aria-hidden="true" /><div><h3>服務規劃中</h3><p>此服務仍在規劃階段，正式內容與合作方式將於確認後公告。</p></div>
    </section>

    <template v-else-if="service.id === 'commercial-vehicle-quota'">
      <section class="service-section" aria-labelledby="quota-intent-title">
        <div class="section-heading"><p>SERVICE INTENT</p><h3 id="quota-intent-title">選擇您的車額需求</h3></div>
        <div class="intent-grid">
          <article class="intent-card"><Icon icon="lucide:search" aria-hidden="true" /><h4>我要購買車額</h4><p>正在尋找適合營運需求的營業用車額。</p><router-link to="/contact">提出購買需求 <Icon icon="lucide:arrow-right" aria-hidden="true" /></router-link></article>
          <article class="intent-card intent-card--gold"><Icon icon="lucide:badge-dollar-sign" aria-hidden="true" /><h4>我要出售車額</h4><p>已有營業用車額，希望委託媒合出售。</p><router-link to="/contact">委託出售 <Icon icon="lucide:arrow-right" aria-hidden="true" /></router-link></article>
        </div>
      </section>
      <section class="service-section" aria-labelledby="quota-types-title"><div class="section-heading"><p>VEHICLE QUOTA TYPES</p><h3 id="quota-types-title">可協助媒合的營業用車額</h3></div><div class="compact-card-grid compact-card-grid--five"><article v-for="([label, icon]) in vehicleQuotaTypes" :key="label" class="compact-card"><Icon :icon="icon" aria-hidden="true" /><span>{{ label }}</span></article></div></section>
      <section class="service-section" aria-labelledby="quota-process-title"><div class="section-heading"><p>SERVICE PROCESS</p><h3 id="quota-process-title">辦理流程</h3></div><ol class="process-grid"><li v-for="(step, index) in vehicleQuotaProcess" :key="step"><span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ step }}</strong></li></ol></section>
      <section class="service-section" aria-labelledby="quota-documents-title"><div class="section-heading"><p>DOCUMENT CHECKLIST</p><h3 id="quota-documents-title">交易資料準備</h3></div><div class="document-grid"><article><h4>出售方</h4><ul><li v-for="item in sellerDocuments" :key="item"><Icon icon="lucide:check" aria-hidden="true" />{{ item }}</li></ul></article><article><h4>購買方</h4><ul><li v-for="item in buyerDocuments" :key="item"><Icon icon="lucide:check" aria-hidden="true" />{{ item }}</li></ul></article></div></section>
      <aside class="support-card"><Icon icon="lucide:route" aria-hidden="true" /><div><h3>白牌司機靠行服務</h3><p>有靠行／掛牌需求，也可由 KQC 協助媒合營業車額、報價及後續掛牌流程。</p></div></aside>
      <section class="final-cta"><div><p>有車額買賣需求？</p><h3>讓 KQC 顧問協助確認下一步</h3></div><router-link to="/contact">聯絡 KQC 顧問 <Icon icon="lucide:arrow-right" aria-hidden="true" /></router-link></section>
    </template>

    <template v-else>
      <section class="service-section" aria-labelledby="parking-check-title"><div class="section-heading"><p>APPLICATION CHECK</p><h3 id="parking-check-title">申辦前需求確認</h3></div><div class="compact-card-grid"><article v-for="item in parkingChecks" :key="item.title" class="compact-card compact-card--detail"><Icon :icon="item.icon" aria-hidden="true" /><div><h4>{{ item.title }}</h4><p>{{ item.detail }}</p></div></article></div></section>
      <section class="service-section" aria-labelledby="parking-process-title"><div class="section-heading"><p>APPLICATION PROCESS</p><h3 id="parking-process-title">申辦流程</h3></div><ol class="process-grid"><li v-for="(step, index) in parkingProcess" :key="step"><span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ step }}</strong><small v-if="step === '提供報價'">不同意報價 → 日後取得合適價格再通知</small></li></ol></section>
      <section class="service-section" aria-labelledby="parking-documents-title">
        <div class="section-heading"><p>DOCUMENT CHECKLIST</p><h3 id="parking-documents-title">申辦資料</h3></div>
        <div class="parking-resource-grid">
          <article class="document-card"><ul><li v-for="item in parkingDocuments" :key="item"><Icon icon="lucide:file-check-2" aria-hidden="true" />{{ item }}</li></ul><h4>公司大小章／授權文件</h4><a :href="parkingAssets.authorizationPdf" download class="resource-action"><Icon icon="lucide:download" aria-hidden="true" />下載授權刻印同意書</a></article>
          <article class="line-card"><div><h4>透過 LINE 官方帳號提供資料</h4><p>備妥申辦資料後，可透過官方帳號與顧問確認。</p><small>註：計程車業者另有資料須提供。</small></div><img :src="parkingAssets.lineQr" alt="KQC LINE 官方帳號 QR Code"></article>
        </div>
      </section>
      <aside class="timing-card"><Icon icon="lucide:clock-3" aria-hidden="true" /><div><h3>預估作業時間</h3><p>依申辦地區及案件狀況，約 5–14 個工作天取得核准函。</p></div></aside>
      <section class="final-cta"><div><p>停車場合作提案</p><h3>若您有經營停車場，歡迎洽詢 KQC 停車位服務合作。</h3></div><router-link to="/contact">聯絡 KQC 顧問 <Icon icon="lucide:arrow-right" aria-hidden="true" /></router-link></section>
    </template>
  </article>
</template>

<style lang="scss" scoped>
.marketplace-service-panel{display:grid;min-width:0;gap:1.5rem;color:#26364b}.service-hero{display:flex;min-width:0;align-items:center;gap:1rem;padding:1.4rem;border:1px solid #d7e3e8;border-left:4px solid #217087;border-radius:.85rem;background:linear-gradient(135deg,#fff,#f1f8f9);box-shadow:0 8px 24px rgba(15,23,42,.05)}.service-hero__icon{display:grid;width:3rem;height:3rem;flex:0 0 3rem;place-items:center;border-radius:.75rem;color:#fff;background:#174e63}.service-hero__icon svg{width:1.4rem;height:1.4rem}.service-hero__copy{min-width:0;flex:1}.service-hero__copy>p:first-child,.section-heading>p{margin:0 0 .25rem;color:#98721c;font-size:.65rem;font-weight:850;letter-spacing:.13em}.service-hero h2,.section-heading h3{margin:0;color:#172b43}.service-hero h2{font-size:1.35rem}.service-hero__summary{max-width:56rem;margin:.4rem 0 0;color:#586a7e;font-size:.9rem;line-height:1.7}.service-status{padding:.35rem .65rem;border-radius:999px;color:#755511;background:#fff1c7;font-size:.72rem;font-weight:800;white-space:nowrap}.service-section{display:grid;gap:.85rem}.section-heading h3{font-size:1.05rem}.intent-grid,.document-grid,.parking-resource-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.9rem}.intent-card,.document-grid article,.document-card,.line-card,.planning-card{min-width:0;padding:1.15rem;border:1px solid #d9e4e8;border-radius:.8rem;background:#fff}.intent-card{display:grid;gap:.5rem;border-top:3px solid #267a91}.intent-card--gold{border-top-color:#b68a27}.intent-card>svg{width:1.35rem;height:1.35rem;color:#267a91}.intent-card--gold>svg{color:#a87c1c}.intent-card h4,.document-grid h4,.line-card h4,.compact-card h4,.planning-card h3{margin:0;color:#1e334c}.intent-card p,.compact-card p,.line-card p,.planning-card p{margin:0;color:#657488;font-size:.82rem;line-height:1.65}.intent-card a,.final-cta a,.resource-action{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;width:max-content;margin-top:.2rem;color:#17637a;font-size:.82rem;font-weight:800;text-decoration:none}.intent-card a svg,.final-cta a svg{width:1rem;height:1rem}.compact-card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}.compact-card-grid--five{grid-template-columns:repeat(5,minmax(0,1fr))}.compact-card{display:flex;min-width:0;align-items:center;gap:.65rem;padding:.85rem;border:1px solid #dce6ea;border-radius:.7rem;background:#f8fbfc;font-size:.78rem;font-weight:750}.compact-card>svg{width:1.15rem;height:1.15rem;flex:0 0 auto;color:#217087}.compact-card--detail h4{font-size:.82rem}.compact-card--detail p{margin-top:.15rem;font-size:.75rem}.process-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:.55rem;margin:0;padding:0;list-style:none}.process-grid li{display:grid;align-content:start;gap:.25rem;min-height:5rem;padding:.75rem;border-radius:.65rem;background:#17364b;color:#fff}.process-grid span{color:#d5ad4a;font-size:.65rem;font-weight:900;letter-spacing:.08em}.process-grid strong{font-size:.76rem;line-height:1.4}.process-grid small{color:#cbdde5;font-size:.66rem;line-height:1.45}.document-grid ul,.document-card ul{display:grid;gap:.5rem;margin:.7rem 0 0;padding:0;list-style:none}.document-grid li,.document-card li{display:flex;align-items:flex-start;gap:.4rem;color:#526579;font-size:.78rem}.document-grid li svg,.document-card li svg{width:.95rem;height:.95rem;flex:0 0 auto;color:#238078}.support-card,.timing-card{display:flex;align-items:center;gap:.85rem;padding:1rem 1.15rem;border-radius:.75rem;color:#fff;background:#174f63}.support-card>svg,.timing-card>svg{width:1.4rem;height:1.4rem;flex:0 0 auto;color:#e1bb5c}.support-card h3,.support-card p,.timing-card p{margin:0}.support-card h3{font-size:.92rem}.support-card p,.timing-card p{margin-top:.2rem;font-size:.8rem;line-height:1.6}.parking-resource-grid{align-items:stretch}.document-card{display:grid;align-content:start;gap:.8rem}.resource-action{padding:.65rem .8rem;border:0;border-radius:.55rem;color:#fff;background:#1f7186;font-family:inherit}.resource-action--disabled{width:100%;color:#788795;background:#e8eef1;cursor:not-allowed}.line-card{display:flex;align-items:center;justify-content:space-between;gap:1rem}.line-card small{display:block;margin-top:.6rem;color:#7b5b19}.line-card img,.asset-pending{width:8rem;height:8rem;flex:0 0 8rem;border-radius:.55rem}.line-card img{object-fit:contain}.asset-pending{display:grid;place-items:center;align-content:center;gap:.35rem;color:#687988;background:#eef3f5;text-align:center;font-size:.7rem}.asset-pending svg{width:2rem;height:2rem}.planning-card{display:flex;align-items:center;gap:.9rem}.planning-card>svg{width:1.5rem;height:1.5rem;color:#a87c1c}.final-cta{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.1rem 1.25rem;border-radius:.8rem;color:#fff;background:linear-gradient(120deg,#142f45,#1b5d6d)}.final-cta p,.final-cta h3{margin:0}.final-cta p{color:#e3bb58;font-size:.7rem;font-weight:850;letter-spacing:.08em}.final-cta h3{margin-top:.2rem;font-size:.95rem}.final-cta a{flex:0 0 auto;margin:0;padding:.65rem .85rem;border-radius:.55rem;color:#17354b;background:#f1c85f}a:focus-visible,.resource-action:focus-visible{outline:3px solid rgba(31,113,134,.3);outline-offset:3px}@media(max-width:960px){.compact-card-grid--five{grid-template-columns:repeat(3,minmax(0,1fr))}.process-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:640px){.marketplace-service-panel{gap:1.15rem}.service-hero{align-items:flex-start;flex-wrap:wrap;padding:1rem}.service-status{margin-left:4rem}.intent-grid,.document-grid,.parking-resource-grid,.compact-card-grid,.compact-card-grid--five{grid-template-columns:1fr}.process-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.line-card,.final-cta{align-items:flex-start;flex-direction:column}.final-cta a{width:100%}.line-card img,.asset-pending{width:7rem;height:7rem;flex-basis:7rem}}
.timing-card h3{margin:0;font-size:.92rem}
/* PRODUCT-SIDEBAR-R4F-8E — Dark Service Strip Contrast / explicit foregrounds preserve navy, teal and gold hierarchy. */
.support-card h3,.timing-card h3,.final-cta h3{color:#fff}.support-card p,.timing-card p{color:#e7f1f4}
</style>
