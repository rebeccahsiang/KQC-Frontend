<script setup lang="ts">
import { Icon } from '@iconify/vue'

const values = [
  { icon: 'lucide:badge-check', title: '產業專業', subtitle: '深耕交通運輸' },
  { icon: 'lucide:users-round', title: '專業顧問', subtitle: '專人需求評估' },
  { icon: 'lucide:handshake', title: '全方位', subtitle: '一站式服務' },
  { icon: 'lucide:target', title: '高效媒合', subtitle: '精準需求配對' },
] as const
</script>

<template>
  <section class="hero-banner-card" aria-labelledby="home-hero-title">
    <!-- HOME-R1A — Hero Motion Foundation / decorative SVG motion never owns content or interaction. -->
    <div class="hero-visual" aria-hidden="true">
      <svg class="hero-mesh" viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="hero-mesh-blue" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2563eb" stop-opacity="0"/><stop offset=".35" stop-color="#38bdf8" stop-opacity=".42"/><stop offset="1" stop-color="#2563eb" stop-opacity=".08"/></linearGradient>
          <linearGradient id="hero-mesh-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d6a84b"/><stop offset="1" stop-color="#f4d58a"/></linearGradient>
        </defs>
        <g class="hero-mesh__wave hero-mesh__wave--horizontal" fill="none" stroke="url(#hero-mesh-blue)">
          <path v-for="y in [145, 190, 235, 280, 325, 370]" :key="`h-${y}`" :d="`M40 ${y} C210 ${y - 105}, 410 ${y + 90}, 850 ${y - 35}`"/>
        </g>
        <g class="hero-mesh__wave hero-mesh__wave--vertical" fill="none" stroke="url(#hero-mesh-blue)">
          <path v-for="x in [210, 300, 390, 480, 570, 660, 750]" :key="`v-${x}`" :d="`M${x} 90 C${x - 95} 210, ${x + 80} 330, ${x - 20} 455`"/>
        </g>
        <g class="hero-mesh__wave hero-mesh__wave--cross" fill="none" stroke="url(#hero-mesh-blue)">
          <path class="hero-mesh__cross" d="M245 390 C390 275, 565 205, 820 125"/><path class="hero-mesh__cross" d="M310 440 C485 315, 650 255, 875 205"/><path class="hero-mesh__cross" d="M365 95 C505 175, 650 305, 805 430"/>
        </g>
        <g class="hero-mesh__nodes hero-mesh__nodes--blue" fill="#38bdf8"><circle cx="330" cy="190" r="3"/><circle cx="505" cy="247" r="2.5"/><circle cx="670" cy="198" r="3"/><circle cx="735" cy="335" r="2.5"/><circle cx="430" cy="350" r="2"/></g>
        <g class="hero-mesh__nodes hero-mesh__nodes--gold" fill="url(#hero-mesh-gold)"><circle cx="585" cy="176" r="4"/><circle cx="772" cy="279" r="3.5"/><circle cx="525" cy="365" r="3"/></g>
      </svg>
      <!-- HOME-R1A-2 — Hero Light Trail Motion / a bounded foreground layer makes forward movement immediately legible. -->
      <div class="hero-light-trails">
        <i class="hero-light-trail hero-light-trail--1"></i>
        <i class="hero-light-trail hero-light-trail--2"></i>
        <i class="hero-light-trail hero-light-trail--3"></i>
        <i class="hero-light-trail hero-light-trail--4"></i>
        <i class="hero-light-trail hero-light-trail--5"></i>
        <i class="hero-light-trail hero-light-trail--6"></i>
        <i class="hero-light-trail hero-light-trail--7"></i>
      </div>
    </div>
    <div class="hero-copy">
      <h1 id="home-hero-title" class="hero-main-title"><span>您事業傳承與轉型的</span><strong>最佳夥伴</strong></h1>
      <p class="hero-sub-desc">我們專注於運輸產業，<br>為第一代創業者規劃圓滿退場；<br>為新一代經營者鋪設成功捷徑</p>
    </div>
    <div class="hero-values" aria-label="KQC 企業價值">
      <article v-for="item in values" :key="item.title" class="hero-value"><Icon :icon="item.icon" class="hero-value__icon" aria-hidden="true" /><div><strong>{{ item.title }}</strong><span>{{ item.subtitle }}</span></div></article>
    </div>
  </section>
</template>
