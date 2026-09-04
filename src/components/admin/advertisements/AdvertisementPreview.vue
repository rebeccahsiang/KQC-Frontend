<script setup lang="ts">
import { computed } from 'vue'
import type { AdvertisementLayoutStyle, AdvertisementTextTone, AdvertisementTypographyStyle } from '@/api/adminAdvertisements'

const props = withDefaults(defineProps<{
  imageUrl?: string
  imageAlt?: string
  title?: string
  shortDescription?: string
  ctaLabel?: string
  layoutStyle?: AdvertisementLayoutStyle
  typographyStyle?: AdvertisementTypographyStyle
  textTone?: AdvertisementTextTone
}>(), {
  imageUrl: '', imageAlt: '', title: '廣告標題', shortDescription: '用精簡文案傳達活動重點。', ctaLabel: '了解更多',
  layoutStyle: 'STANDARD', typographyStyle: 'BRAND', textTone: 'DARK'
})

const classes = computed(() => [
  `advertisement-preview--${props.layoutStyle.toLowerCase().replace('_', '-')}`,
  `advertisement-preview--type-${props.typographyStyle.toLowerCase()}`,
  `advertisement-preview--tone-${props.textTone.toLowerCase().replace('_', '-')}`
])
</script>

<template>
  <!-- PRODUCT-ADVERTISEMENT-R2B — Shared Advertisement Preview / semantic tokens own every bounded creative variation. -->
  <article class="advertisement-preview" :class="classes">
    <div class="advertisement-preview__media">
      <img v-if="imageUrl" :src="imageUrl" :alt="imageAlt || title" />
      <div v-else class="advertisement-preview__placeholder" aria-hidden="true"><Icon icon="lucide:image" /></div>
    </div>
    <div class="advertisement-preview__copy">
      <h3>{{ title || '廣告標題' }}</h3>
      <p>{{ shortDescription || '用精簡文案傳達活動重點。' }}</p>
      <span class="advertisement-preview__cta">{{ ctaLabel || '了解更多' }}</span>
    </div>
  </article>
</template>

<style scoped lang="scss">
.advertisement-preview { --advertisement-dark-copy:#0f172a; position:relative; display:grid; min-width:0; min-height:26rem; height:100%; overflow:hidden; grid-template-rows:auto 1fr; border:1px solid #dce2e9; border-top:3px solid #66788b; border-radius:.85rem; background:#fff; box-shadow:0 5px 18px rgb(15 23 42 / 5.5%); }
.advertisement-preview__media { min-height:0; background:#dce5eb; }
.advertisement-preview__media img { display:block; width:100%; aspect-ratio:16/9; height:100%; object-fit:cover; }
.advertisement-preview__placeholder { display:grid; width:100%; aspect-ratio:16/9; place-items:center; }
.advertisement-preview__placeholder { color:var(--text-muted); font-size:2rem; }
.advertisement-preview__copy { z-index:1; display:grid; align-content:end; gap:.65rem; padding:1rem; }
.advertisement-preview h3,.advertisement-preview p { margin:0; }
.advertisement-preview h3 { font-size:1.15rem; line-height:1.35; }
.advertisement-preview p { color:var(--advertisement-dark-copy); font-size:.8rem; line-height:1.65; }
.advertisement-preview__cta { justify-self:start; display:inline-flex; min-height:2.35rem; padding:.5rem .85rem; align-items:center; border-radius:999px; color:#fff; background:#1d718e; font-size:.76rem; font-weight:800; }
.advertisement-preview--overlay-left,.advertisement-preview--overlay-center { min-height:26rem; grid-template:1fr/1fr; }
.advertisement-preview--overlay-left>* ,.advertisement-preview--overlay-center>* { grid-area:1/1; }
.advertisement-preview--overlay-left::after,.advertisement-preview--overlay-center::after { content:''; z-index:0; grid-area:1/1; background:linear-gradient(180deg,transparent 8%,rgb(3 12 24 / 82%) 100%); pointer-events:none; }
.advertisement-preview--overlay-center .advertisement-preview__copy { justify-items:center; align-content:center; text-align:center; }
.advertisement-preview--type-brand h3 { font-family:var(--kqc-font-family); font-weight:750; }
.advertisement-preview--type-bold h3 { font-family:var(--kqc-font-family); font-weight:900; letter-spacing:-.035em; text-transform:uppercase; }
.advertisement-preview--type-elegant h3 { font-family:var(--kqc-font-family); font-style:italic; font-weight:600; letter-spacing:.08em; }
.advertisement-preview--tone-white h3 { color:#fff; }
.advertisement-preview--tone-dark h3 { color:var(--advertisement-dark-copy); }
.advertisement-preview--tone-brand-gold h3 { color:#c99b3d; }
.advertisement-preview--tone-brand-blue h3 { color:#4b9bd8; }
.advertisement-preview--tone-brand-green h3 { color:#42a57a; }
.advertisement-preview--overlay-left.advertisement-preview--tone-dark::after,.advertisement-preview--overlay-center.advertisement-preview--tone-dark::after { background:transparent; }
.advertisement-preview--overlay-left.advertisement-preview--tone-dark .advertisement-preview__copy { box-sizing:border-box; width:min(82%,28rem); justify-self:start; align-self:end; margin:1rem; border-radius:.65rem; background:linear-gradient(105deg,rgb(255 255 255 / 88%),rgb(255 255 255 / 68%)); }
.advertisement-preview--overlay-center.advertisement-preview--tone-dark .advertisement-preview__copy { box-sizing:border-box; width:min(84%,28rem); justify-self:center; align-self:center; border-radius:.65rem; background:rgb(255 255 255 / 78%); box-shadow:0 .5rem 1.5rem rgb(3 12 24 / 12%); }
@media (prefers-reduced-motion:no-preference) { .advertisement-preview { transition:transform 180ms ease,box-shadow 180ms ease; } }
</style>
