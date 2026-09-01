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
@use '@/assets/styles/variables' as *;
.advertisement-preview { position:relative; display:grid; min-width:0; overflow:hidden; border:1px solid var(--border-grey); border-radius:$kqc-radius-xl; background:var(--bg-card); box-shadow:0 0.75rem 1.8rem rgb(15 23 42 / 10%); }
.advertisement-preview__media { min-height:0; background:color-mix(in srgb, var(--accent-active) 9%, var(--bg-main)); }
.advertisement-preview__media img,.advertisement-preview__placeholder { display:grid; width:100%; aspect-ratio:16/9; place-items:center; object-fit:cover; }
.advertisement-preview__placeholder { color:var(--text-muted); font-size:2rem; }
.advertisement-preview__copy { z-index:1; display:grid; align-content:end; gap:$kqc-spacing-sm; padding:$kqc-spacing-lg; }
h3,p { margin:0; } h3 { font-size:clamp(1.15rem,2vw,1.5rem); line-height:1.25; } p { line-height:1.55; opacity:.9; }
.advertisement-preview__cta { justify-self:start; padding:.55rem .9rem; border-radius:$kqc-radius-full; background:var(--accent-active); color:#fff; font-weight:750; }
.advertisement-preview--overlay-left,.advertisement-preview--overlay-center { min-height:20rem; grid-template:1fr/1fr; }
.advertisement-preview--overlay-left>* ,.advertisement-preview--overlay-center>* { grid-area:1/1; }
.advertisement-preview--overlay-left .advertisement-preview__media img,.advertisement-preview--overlay-center .advertisement-preview__media img { height:100%; aspect-ratio:auto; }
.advertisement-preview--overlay-left::after,.advertisement-preview--overlay-center::after { content:''; z-index:0; grid-area:1/1; background:linear-gradient(180deg,transparent 10%,rgb(3 12 24 / 80%) 100%); pointer-events:none; }
.advertisement-preview--overlay-center .advertisement-preview__copy { justify-items:center; align-content:center; padding:2rem; text-align:center; }
.advertisement-preview--type-brand h3 { font-family:var(--kqc-font-family); font-weight:750; }
.advertisement-preview--type-bold h3 { font-family:var(--kqc-font-family); font-weight:900; letter-spacing:-.035em; text-transform:uppercase; }
.advertisement-preview--type-elegant h3 { font-family:var(--kqc-font-family); font-style:italic; font-weight:600; letter-spacing:.08em; }
.advertisement-preview--tone-white .advertisement-preview__copy { color:#fff; }
/* PRODUCT-ADVERTISEMENT-R2B-4 — DARK Computed Color / explicit copy descendants remain dark across the Admin theme cascade. */
.advertisement-preview--tone-dark { --advertisement-dark-copy:#0f172a; }
.advertisement-preview--tone-dark .advertisement-preview__copy,.advertisement-preview--tone-dark .advertisement-preview__copy h3,.advertisement-preview--tone-dark .advertisement-preview__copy p { color:var(--advertisement-dark-copy); }
.advertisement-preview--tone-brand-gold .advertisement-preview__copy { color:#c99b3d; }
.advertisement-preview--tone-brand-blue .advertisement-preview__copy { color:#4b9bd8; }
.advertisement-preview--tone-brand-green .advertisement-preview__copy { color:#42a57a; }
/* PRODUCT-ADVERTISEMENT-R2B-3 — DARK Overlay Local Contrast / the photo stays intact while only the copy owns a restrained light surface. */
.advertisement-preview--overlay-left.advertisement-preview--tone-dark::after,.advertisement-preview--overlay-center.advertisement-preview--tone-dark::after { background:transparent; }
.advertisement-preview--overlay-left.advertisement-preview--tone-dark .advertisement-preview__copy,.advertisement-preview--overlay-center.advertisement-preview--tone-dark .advertisement-preview__copy { box-sizing:border-box; }
.advertisement-preview--overlay-left.advertisement-preview--tone-dark .advertisement-preview__copy { width:min(78%,30rem); justify-self:start; align-self:end; margin:$kqc-spacing-lg; padding:$kqc-spacing-lg; border-radius:$kqc-radius-lg; background:linear-gradient(105deg,rgb(255 255 255 / 88%),rgb(255 255 255 / 68%)); }
.advertisement-preview--overlay-center.advertisement-preview--tone-dark .advertisement-preview__copy { width:min(82%,30rem); justify-self:center; align-self:center; padding:$kqc-spacing-lg; border-radius:$kqc-radius-lg; background:rgb(255 255 255 / 78%); box-shadow:0 .5rem 1.5rem rgb(3 12 24 / 12%); }
@media (prefers-reduced-motion:no-preference) { .advertisement-preview { transition:transform 180ms ease,box-shadow 180ms ease; } }
</style>
