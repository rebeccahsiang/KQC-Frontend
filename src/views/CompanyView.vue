<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y, EffectCards, Keyboard, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/effect-cards'
import 'swiper/css/pagination'
import aboutHeroImage from '@/assets/images/about/about-hero.png'
import businessJourneyImage from '@/assets/images/about/business-journey.png'
import crossIndustryResourcesImage from '@/assets/images/about/cross-industry-resources.png'
import digitalThinkingImage from '@/assets/images/about/digital-thinking.png'
import fullJourneySupportImage from '@/assets/images/about/full-journey-support.png'
import industryExpertiseImage from '@/assets/images/about/industry-expertise.png'
import industryInsightImage from '@/assets/images/about/industry-insight.png'
import professionalMatchingImage from '@/assets/images/about/professional-matching.png'
import riskControlImage from '@/assets/images/about/risk-control.png'
import aboutBrandVideo from '@/assets/videos/about/about-brand.mp4'

const industryCapabilities = [
  { icon: 'lucide:truck', label: '交通運輸產業需求理解' },
  { icon: 'lucide:briefcase-business', label: '事業交易與營運需求整合' },
  { icon: 'lucide:landmark', label: '市場、法規與專業資訊整理' },
] as const
const journeyValues = [
  { icon: 'lucide:messages-square', label: '先理解需求，再提出方案' },
  { icon: 'lucide:network', label: '從交易延伸至營運與資源整合' },
  { icon: 'lucide:handshake', label: '陪伴事業傳承、創業與轉型' },
] as const
const supportSteps = [
  { number: '01', icon: 'lucide:scan-search', title: '理解需求', description: '先釐清客戶目前的事業階段、問題與目標。' },
  { number: '02', icon: 'lucide:blocks', title: '整合方案', description: '依需求串聯交易、營運與相關專業服務。' },
  { number: '03', icon: 'lucide:route', title: '陪伴執行', description: '從評估到後續執行，讓每一步更清楚、更安心。' },
] as const
const brandValues = [
  { image: industryInsightImage, icon: 'lucide:chart-no-axes-combined', title: '產業洞察', lead: '懂技術，更懂交通運輸產業真正面對的問題。', description: '深耕交通運輸產業，從靠行生態、牌照法規到營運管理與市場需求，以產業視角整理複雜資訊，協助經營者更清楚地判斷下一步。' },
  { image: professionalMatchingImage, icon: 'lucide:handshake', title: '專業媒合', lead: '精準連結需求，讓事業價值找到合適的承接者。', description: '透過產業網絡與需求理解，協助有意出售的業主與誠意買家進行媒合，提升溝通與交易效率。' },
  { image: riskControlImage, icon: 'lucide:shield-check', title: '風險把關', lead: '專業把關，讓重要決定更安心。', description: '透過產業法規理解、交易資訊整理與必要的專業協作，協助客戶掌握重要事項，降低複雜交易過程中的不確定性。' },
  { image: digitalThinkingImage, icon: 'lucide:monitor-cog', title: '數位思維', lead: '用數據與科技，讓決策更有依據。', description: '將數據分析與數位工具融入市場判斷、企業價值評估與需求媒合，讓重要決策建立在更清楚的資訊基礎上。' },
  { image: crossIndustryResourcesImage, icon: 'lucide:network', title: '跨界資源', lead: '串聯產業資源，開創更多合作可能。', description: '依照不同經營需求，串聯交通運輸上下游與跨領域專業資源，協助企業建立合作橋樑，探索新的商業可能。' },
  { image: fullJourneySupportImage, icon: 'lucide:route', title: '全程陪伴', lead: '陪伴的，不只是一筆交易，而是一段事業。', description: '從理解需求、整理方向到後續執行，我們以夥伴關係陪伴客戶面對事業傳承、轉型與下一階段的重要決定。' },
] as const

const brandValueSwiper = ref<SwiperInstance | null>(null)
const brandValueModules = [A11y, EffectCards, Keyboard, Pagination]
const captureBrandValueSwiper = (swiper: SwiperInstance) => { brandValueSwiper.value = swiper }
const previousValue = () => brandValueSwiper.value?.slidePrev()
const nextValue = () => brandValueSwiper.value?.slideNext()
</script>

<template>
  <main class="company-view">
    <!-- ABOUT-R1B — Brand Hero Visual / the approved image is the sole visible headline authority. -->
    <header class="company-hero" aria-labelledby="company-title">
      <h1 id="company-title" class="company-sr-only">我們不只理解交易，更理解一段事業的重量</h1>
      <div class="company-hero__frame"><img :src="aboutHeroImage" alt="三爵資訊 KQC 品牌主視覺"></div>
    </header>

    <div class="company-shell company-content">
      <!-- ABOUT-R1B — Our Beginning / editorial brand context without chronology or unsupported milestones. -->
      <section class="company-origin" aria-labelledby="origin-title">
        <div class="company-origin__marker" aria-hidden="true"></div>
        <div><span class="company-section-label">OUR BEGINNING</span><h2 id="origin-title">我們的起點：看見運輸業的時代十字路口</h2></div>
        <div class="company-origin__story">
          <p>三爵資訊的起點，來自我們看見交通運輸產業正在面對一個重要的轉折。</p>
          <p>許多第一代經營者，開始思考事業如何交棒、如何讓多年累積的成果被延續；另一方面，新的經營者正在尋找進入產業的機會，既有業者也面臨法規、營運效率與數位轉型帶來的新挑戰。</p>
          <p>我們相信，真正需要被連結的，不只是買方與賣方，而是不同事業階段中的需求、經驗與專業資源。</p>
          <p>因此，三爵資訊希望建立一個更清楚、更有效率的服務平台，讓事業傳承、創業、營運與轉型，都能找到適合下一步的方向。</p>
        </div>
      </section>

      <!-- ABOUT-R1B — Brand Film / native controls preserve user playback authority with browser-compatible MP4. -->
      <section class="company-film" aria-labelledby="film-title">
        <div class="company-section-heading"><span class="company-section-label">KQC STORY</span><h2 id="film-title">用一分鐘，認識我們想做的事</h2><p>從理解產業到理解每位經營者所處的階段，我們希望用更清楚的方式，連結需求、專業與下一步。</p></div>
        <div class="company-film__frame"><video controls playsinline preload="metadata"><source :src="aboutBrandVideo" type="video/mp4">目前瀏覽器無法播放此影片。</video></div>
      </section>

      <!-- ABOUT-R1A — Industry Expertise / approved imagery supports evidence-free capability statements. -->
      <section class="company-pillar" aria-labelledby="industry-title">
        <div class="company-pillar__media"><img :src="industryExpertiseImage" alt="三爵資訊專業團隊討論交通運輸營運與產業資料"></div>
        <div class="company-pillar__copy"><span class="company-section-label">INDUSTRY EXPERTISE</span><h2 id="industry-title">我們懂這個產業</h2><p>交通運輸業的每一項決策，往往不只是單純的買與賣。從營業資格、車輛與場地，到公司營運、法規、成本與市場需求，每一個環節都彼此牽動。</p><p>三爵資訊希望把複雜的產業資訊整理得更清楚，讓經營者在重要決策前，能更快掌握問題、理解選項，找到適合自己的方向。</p><ul class="company-points"><li v-for="item in industryCapabilities" :key="item.label"><Icon :icon="item.icon" aria-hidden="true" /><span>{{ item.label }}</span></li></ul></div>
      </section>

      <!-- ABOUT-R1A — Business Journey / long-term partnership without unverifiable claims. -->
      <section class="company-pillar company-pillar--reverse" aria-labelledby="journey-title">
        <div class="company-pillar__copy"><span class="company-section-label">BUSINESS JOURNEY</span><h2 id="journey-title">我們陪的是一段事業</h2><p>對經營者而言，一家公司往往不只是一項資產。它可能是一生累積的成果，也可能是一位新經營者準備開始的下一段旅程。</p><p>因此，我們重視的不只是案件是否完成，而是先理解每一位客戶所處的階段與真正需求，再協助整理交易、營運與後續所需的專業資源。</p><p>無論是準備交棒、尋找新機會，或希望讓既有事業走向下一個階段，我們希望成為客戶可以長期信任的產業夥伴。</p><ul class="company-points"><li v-for="item in journeyValues" :key="item.label"><Icon :icon="item.icon" aria-hidden="true" /><span>{{ item.label }}</span></li></ul></div>
        <div class="company-pillar__media"><img :src="businessJourneyImage" alt="三爵資訊顧問與客戶討論交通運輸事業規劃"></div>
      </section>

      <!-- ABOUT-R1A — Advisory Process / three compact steps explain the service relationship. -->
      <section class="company-support" aria-labelledby="support-title">
        <div class="company-section-heading"><span class="company-section-label">HOW WE SUPPORT</span><h2 id="support-title">我們如何協助</h2><p>從理解需求開始，整合合適資源，陪伴重要決策逐步落實。</p></div>
        <ol class="company-support__grid"><li v-for="step in supportSteps" :key="step.number"><span class="company-support__number">{{ step.number }}</span><Icon :icon="step.icon" aria-hidden="true" /><div><h3>{{ step.title }}</h3><p>{{ step.description }}</p></div></li></ol>
      </section>

      <!-- ABOUT-R1C — Brand Value Swiper Cards / official Cards Effect presents six evidence-safe values with circular user authority and no autoplay. -->
      <section class="company-values" aria-labelledby="values-title">
        <div class="company-section-heading"><span class="company-section-label">OUR PHILOSOPHY</span><h2 id="values-title">我們的經營理念</h2><strong>以夥伴之心，行專業之事，創三贏之局</strong><p>我們不將自己視為單純的服務供應商，而是客戶事業發展過程中的夥伴。<br>我們重視的不只是一次交易的完成，而是透過專業、信任與長期合作，<br>為客戶、合作夥伴與產業生態創造共榮共好的價值。</p></div>
        <div class="company-values__stage">
          <Swiper class="company-values__swiper" effect="cards" :modules="brandValueModules" :cards-effect="{ perSlideOffset: 36, perSlideRotate: 2, rotate: true, slideShadows: false }" :pagination="{ clickable: true, bulletElement: 'button' }" :keyboard="{ enabled: true }" :grab-cursor="true" :rewind="true" @swiper="captureBrandValueSwiper">
            <SwiperSlide v-for="(item, index) in brandValues" :key="item.title" class="company-value-card" :class="`company-value-card--${index + 1}`">
              <article><div class="company-value-card__image"><img :src="item.image" :alt="`${item.title}品牌價值視覺`"></div><div class="company-value-card__body"><div class="company-value-card__heading"><Icon :icon="item.icon" aria-hidden="true" /><span>{{ String(index + 1).padStart(2, '0') }}</span></div><h3>{{ item.title }}</h3><strong>{{ item.lead }}</strong><p>{{ item.description }}</p></div></article>
            </SwiperSlide>
          </Swiper>
        </div>
        <div class="company-values__navigation"><button type="button" aria-label="上一項品牌價值" @click="previousValue"><Icon icon="lucide:arrow-left" aria-hidden="true" /></button><button type="button" aria-label="下一項品牌價值" @click="nextValue"><Icon icon="lucide:arrow-right" aria-hidden="true" /></button></div>
      </section>

      <!-- ABOUT-R1A — Consultation CTA / existing named public routes remain navigation authority. -->
      <section class="company-closing" aria-labelledby="closing-title"><span class="company-section-label">START A CONVERSATION</span><h2 id="closing-title">每一段事業，都值得被好好理解</h2><p>如果您正在思考事業交棒、尋找新的經營機會，或希望改善目前的營運方式，三爵資訊願意先從理解您的需求開始。</p><div class="company-closing__actions"><RouterLink :to="{ name: 'Contact' }" class="company-action company-action--primary">與我們聊聊<Icon icon="lucide:arrow-right" aria-hidden="true" /></RouterLink><RouterLink :to="{ name: 'Products' }" class="company-action company-action--secondary">查看服務</RouterLink></div></section>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.company-view { min-height: 100vh; overflow: hidden; background: #f4f7fa; color: #1d2939; }
.company-shell { width: min(calc(100% - 4rem), 82rem); margin-inline: auto; }
.company-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.company-hero { padding: clamp(1.5rem, 3vw, 2.75rem) 2rem; border-bottom: 1px solid #dce4eb; background: linear-gradient(120deg, #f9fbfd, #edf4f7); }
.company-hero__frame { width: min(100%, 90rem); margin-inline: auto; overflow: hidden; border: 1px solid #d7e1e8; border-radius: 1.15rem; background: #10243b; box-shadow: 0 18px 45px rgba(23, 43, 67, 0.14); }
.company-hero__frame img { display: block; width: 100%; height: auto; }
.company-content { display: grid; gap: clamp(3.25rem, 5.5vw, 5.5rem); padding-block: clamp(3.5rem, 5.5vw, 5.5rem); }
.company-section-label { color: #97701c; font-size: 0.7rem; font-weight: 850; letter-spacing: 0.15em; }
.company-origin { display: grid; max-width: 72rem; margin-inline: auto; grid-template-columns: 0.3rem minmax(16rem, 0.8fr) minmax(0, 1.2fr); align-items: start; gap: clamp(1.5rem, 4vw, 3.5rem); }
.company-origin__marker { width: 0.3rem; height: 7rem; border-radius: 99px; background: linear-gradient(#c6942d, #1d718e); }
.company-origin h2, .company-section-heading h2, .company-pillar h2, .company-closing h2 { margin: 0.55rem 0 0.8rem; color: #172b43; font-size: clamp(1.7rem, 2.6vw, 2.45rem); line-height: 1.2; letter-spacing: -0.025em; }
.company-origin__story { display: grid; gap: 0.7rem; }
.company-origin__story p, .company-pillar__copy > p { margin: 0; color: #627386; line-height: 1.72; }
.company-film { text-align: center; }
.company-section-heading { max-width: 44rem; margin: 0 auto 1.6rem; text-align: center; }
.company-section-heading > p { margin: 0; color: #627386; line-height: 1.65; }
.company-section-heading > strong { display: block; margin: -0.15rem 0 0.7rem; color: #a57818; font-size: clamp(1rem, 1.8vw, 1.2rem); }
.company-film__frame { width: min(100%, 55rem); aspect-ratio: 16 / 9; margin-inline: auto; overflow: hidden; border: 1px solid #d6e0e7; border-radius: 1.25rem; background: #0f2238; box-shadow: 0 16px 38px rgba(23, 43, 67, 0.13); }
.company-film video { display: block; width: 100%; height: 100%; object-fit: contain; background: #0f2238; }
.company-pillar { display: grid; grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr); align-items: center; gap: clamp(2rem, 4vw, 4rem); }
.company-pillar--reverse { grid-template-columns: minmax(0, 0.98fr) minmax(0, 1.02fr); }
.company-pillar__media { width: min(100%, 41rem); aspect-ratio: 4 / 3; overflow: hidden; border: 1px solid #d9e2e9; border-radius: 1rem; background: #dce8ed; box-shadow: 0 14px 34px rgba(23, 43, 67, 0.11); }
.company-pillar__media img { display: block; width: 100%; height: 100%; object-fit: cover; }
.company-pillar__copy { min-width: 0; }
.company-pillar__copy > p + p { margin-top: 0.7rem; }
.company-points { display: grid; margin: 1.2rem 0 0; padding: 0; gap: 0.5rem; list-style: none; }
.company-points li { display: flex; min-height: 4rem; padding: 0.55rem 0.8rem; box-sizing: border-box; align-items: center; gap: 0.7rem; border: 1px solid #dde5eb; border-radius: 0.65rem; background: rgba(255, 255, 255, 0.84); color: #31465b; font-weight: 700; }
.company-points svg { width: 1.1rem; height: 1.1rem; flex: 0 0 auto; color: #a57818; }
.company-support { padding: clamp(1.75rem, 3vw, 2.5rem); border: 1px solid #dbe4eb; border-radius: 1rem; background: #fff; box-shadow: 0 12px 32px rgba(23, 43, 67, 0.07); }
.company-support__grid { display: grid; margin: 0; padding: 0; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.8rem; list-style: none; }
.company-support__grid li { display: grid; min-width: 0; padding: 1.1rem; grid-template-columns: auto 1fr; align-items: start; gap: 0.3rem 0.8rem; border: 1px solid #e0e7ed; border-radius: 0.75rem; background: #f8fafc; }
.company-support__grid svg { width: 1.4rem; height: 1.4rem; grid-row: 2; color: #1d718e; }
.company-support__number { grid-column: 1 / -1; color: #b18428; font: 850 0.68rem ui-monospace, monospace; letter-spacing: 0.12em; }
.company-support__grid h3 { margin: 0 0 0.25rem; color: #22364c; font-size: 1.02rem; }
.company-support__grid p { margin: 0; color: #69798b; line-height: 1.55; }
.company-values { text-align: center; }
.company-values__stage { width: 100%; padding: 0.6rem 3rem 2.7rem; box-sizing: border-box; overflow: hidden; }
.company-values__swiper { width: clamp(22.5rem, 30vw, 24.5rem); height: clamp(31.25rem, 42vw, 34rem); overflow: visible; }
.company-value-card { overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 1.2rem; background: #18344a; box-shadow: 0 20px 45px rgba(16, 36, 59, 0.2); color: #fff; text-align: left; }
.company-value-card--2 { background: #29445a; }
.company-value-card--3 { background: #263d46; }
.company-value-card--4 { background: #1e4760; }
.company-value-card--5 { background: #30483f; }
.company-value-card--6 { background: #263d53; }
.company-value-card article { display: grid; height: 100%; grid-template-rows: 20% 1fr; }
.company-value-card__image { overflow: hidden; background: #29465c; }
.company-value-card__image img { display: block; width: 100%; height: 100%; object-fit: cover; }
.company-value-card__body { display: grid; padding: clamp(1.35rem, 2.4vw, 1.8rem); align-content: start; }
.company-value-card__heading { display: flex; margin-bottom: 1rem; align-items: center; justify-content: space-between; }
.company-value-card__heading svg { width: 2rem; height: 2rem; color: #e0b75d; }
.company-value-card__heading span { color: #e0b75d; font: 800 0.72rem ui-monospace, monospace; letter-spacing: 0.12em; }
.company-value-card h3 { margin: 0 0 0.65rem; color: #fff; font-size: 1.45rem; }
.company-value-card__body > strong { color: #f0d99f; font-size: 1rem; line-height: 1.55; }
.company-value-card p { margin: 0.85rem 0 0; color: #d5e0e8; font-size: 0.94rem; line-height: 1.68; }
.company-values__swiper :deep(.swiper-pagination) { bottom: -2rem; }
.company-values__swiper :deep(.swiper-pagination-bullet) { width: 0.58rem; height: 0.58rem; border: 0; background: #9aaab7; opacity: 0.65; }
.company-values__swiper :deep(.swiper-pagination-bullet-active) { width: 1.5rem; border-radius: 99px; background: #a57818; opacity: 1; }
.company-values__navigation { display: flex; align-items: center; justify-content: center; gap: 1rem; }
.company-values__navigation > button { display: grid; width: 2.65rem; height: 2.65rem; place-items: center; border: 1px solid #ccd8e1; border-radius: 50%; background: #fff; color: #29425a; cursor: pointer; }
.company-values__navigation button:focus-visible, .company-action:focus-visible { outline: 3px solid rgba(177, 132, 40, 0.4); outline-offset: 3px; }
.company-closing { padding: clamp(2.1rem, 4vw, 3.5rem); border-radius: 1rem; background: linear-gradient(125deg, #10243b, #183d56); color: #fff; text-align: center; box-shadow: 0 16px 40px rgba(15, 35, 55, 0.18); }
.company-closing .company-section-label { color: #dfbc6a; }
.company-closing h2 { color: #fff; }
.company-closing > p { max-width: 45rem; margin: 0 auto; color: #d3dee7; line-height: 1.65; }
.company-closing__actions { display: flex; margin-top: 1.25rem; align-items: center; justify-content: center; gap: 0.8rem; flex-wrap: wrap; }
.company-action { display: inline-flex; min-height: 3rem; padding: 0.6rem 1.15rem; box-sizing: border-box; align-items: center; justify-content: center; gap: 0.5rem; border: 1px solid transparent; border-radius: 0.55rem; font-weight: 800; text-decoration: none; transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease; }
.company-action--primary { background: #d6a84b; color: #172b43; }
.company-action--primary:hover { background: #e2bb6d; }
.company-action--secondary { border-color: rgba(255, 255, 255, 0.45); color: #fff; }
.company-action--secondary:hover { border-color: #fff; background: rgba(255, 255, 255, 0.08); }
@media (max-width: 900px) {
  .company-shell { width: min(calc(100% - 2rem), 82rem); }
  .company-origin { grid-template-columns: 0.25rem 1fr; }
  .company-origin__story { grid-column: 2; }
  .company-pillar, .company-pillar--reverse { grid-template-columns: 1fr; gap: 1.75rem; }
  .company-pillar--reverse .company-pillar__media { grid-row: 1; }
  .company-pillar__media { width: 100%; max-height: 30rem; }
  .company-support__grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .company-shell { width: min(calc(100% - 1.25rem), 82rem); }
  .company-hero { padding: 0.75rem 0.625rem; }
  .company-hero__frame { border-radius: 0.75rem; }
  .company-content { gap: 3rem; padding-block: 3rem; }
  .company-origin { gap: 1rem; }
  .company-origin__marker { height: 5rem; }
  .company-pillar__media { aspect-ratio: 4 / 3; }
  .company-support { padding: 1rem; }
  .company-values__stage { padding-inline: 1.2rem; }
  .company-values__swiper { width: min(20rem, calc(100vw - 3rem)); height: 32rem; }
  .company-closing { padding: 1.9rem 1.1rem; }
  .company-closing__actions { align-items: stretch; flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) { .company-values__swiper :deep(.swiper-wrapper), .company-value-card, .company-action { transition-duration: 0ms !important; } }
</style>
