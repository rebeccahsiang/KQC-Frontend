<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { publicAdvertisementImageUrl, type PublicAdvertisement } from '@/api/publicAdvertisements'

const props = defineProps<{ advertisement: PublicAdvertisement }>()
const classes = computed(() => [
  `advertisement-card--${props.advertisement.layoutStyle.toLowerCase().replace('_', '-')}`,
  `advertisement-card--type-${props.advertisement.typographyStyle.toLowerCase()}`,
  `advertisement-card--tone-${props.advertisement.textTone.toLowerCase().replace('_', '-')}`
])
</script>

<template>
  <!-- PRODUCT-ADVERTISEMENT-R3 — Public Advertisement Creative / Backend semantic tokens drive bounded image, copy and CTA presentation. -->
  <article class="advertisement-card" :class="classes" aria-label="廣告內容">
    <div class="advertisement-card__visual"><img :src="publicAdvertisementImageUrl(advertisement.imageUrl)" :alt="advertisement.title" /></div>
    <div class="advertisement-card__body">
      <h3>{{ advertisement.title }}</h3>
      <p>{{ advertisement.shortDescription }}</p>
      <RouterLink class="advertisement-card__cta" :to="advertisement.ctaDestination">{{ advertisement.ctaLabel }}</RouterLink>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.advertisement-card { --advertisement-dark-copy:#0f172a; position:relative; display:grid; min-width:0; min-height:26rem; height:100%; overflow:hidden; grid-template-rows:auto 1fr; border:1px solid #dce2e9; border-top:3px solid #66788b; border-radius:.85rem; background:#fff; box-shadow:0 5px 18px rgb(15 23 42 / 5.5%); transition:transform .24s ease,box-shadow .24s ease,border-color .24s ease; }
.advertisement-card:hover { border-color:#aebbc6; box-shadow:0 10px 24px rgb(15 23 42 / 8.5%); transform:translateY(-3px); }
.advertisement-card__visual { min-height:0; background:#dce5eb; }.advertisement-card__visual img { display:block; width:100%; aspect-ratio:16/9; height:100%; object-fit:cover; }
.advertisement-card__body { z-index:1; display:grid; align-content:end; gap:.65rem; padding:1rem; }.advertisement-card h3,.advertisement-card p { margin:0; }.advertisement-card h3 { font-size:1.15rem; line-height:1.35; }.advertisement-card p { font-size:.8rem; line-height:1.65; }
.advertisement-card__cta { justify-self:start; display:inline-flex; min-height:2.35rem; padding:.5rem .85rem; align-items:center; border-radius:999px; color:#fff; background:#1d718e; font-size:.76rem; font-weight:800; text-decoration:none; }.advertisement-card__cta:hover { background:#155b74; }.advertisement-card__cta:focus-visible { outline:3px solid rgb(29 113 142 / 38%); outline-offset:3px; }
.advertisement-card--overlay-left,.advertisement-card--overlay-center { min-height:26rem; grid-template:1fr/1fr; }.advertisement-card--overlay-left>* ,.advertisement-card--overlay-center>* { grid-area:1/1; }.advertisement-card--overlay-left::after,.advertisement-card--overlay-center::after { content:''; z-index:0; grid-area:1/1; background:linear-gradient(180deg,transparent 8%,rgb(3 12 24 / 82%) 100%); pointer-events:none; }.advertisement-card--overlay-center .advertisement-card__body { justify-items:center; align-content:center; text-align:center; }
.advertisement-card--type-brand h3 { font-family:var(--kqc-font-family); font-weight:750; }.advertisement-card--type-bold h3 { font-family:var(--kqc-font-family); font-weight:900; letter-spacing:-.035em; text-transform:uppercase; }.advertisement-card--type-elegant h3 { font-family:var(--kqc-font-family); font-style:italic; font-weight:600; letter-spacing:.08em; }
.advertisement-card--tone-white .advertisement-card__body,.advertisement-card--tone-white h3,.advertisement-card--tone-white p { color:#fff; }.advertisement-card--tone-dark .advertisement-card__body,.advertisement-card--tone-dark h3,.advertisement-card--tone-dark p { color:var(--advertisement-dark-copy); }.advertisement-card--tone-brand-gold .advertisement-card__body,.advertisement-card--tone-brand-gold h3,.advertisement-card--tone-brand-gold p { color:#c99b3d; }.advertisement-card--tone-brand-blue .advertisement-card__body,.advertisement-card--tone-brand-blue h3,.advertisement-card--tone-brand-blue p { color:#4b9bd8; }.advertisement-card--tone-brand-green .advertisement-card__body,.advertisement-card--tone-brand-green h3,.advertisement-card--tone-brand-green p { color:#42a57a; }
/* PRODUCT-ADVERTISEMENT-R3 — Public DARK Local Contrast / bounded copy surfaces preserve the photograph and remain theme-independent. */
.advertisement-card--overlay-left.advertisement-card--tone-dark::after,.advertisement-card--overlay-center.advertisement-card--tone-dark::after { background:transparent; }.advertisement-card--overlay-left.advertisement-card--tone-dark .advertisement-card__body { box-sizing:border-box; width:min(82%,28rem); justify-self:start; align-self:end; margin:1rem; border-radius:.65rem; background:linear-gradient(105deg,rgb(255 255 255 / 88%),rgb(255 255 255 / 68%)); }.advertisement-card--overlay-center.advertisement-card--tone-dark .advertisement-card__body { box-sizing:border-box; width:min(84%,28rem); justify-self:center; align-self:center; border-radius:.65rem; background:rgb(255 255 255 / 78%); box-shadow:0 .5rem 1.5rem rgb(3 12 24 / 12%); }
@media (prefers-reduced-motion:reduce) { .advertisement-card { transition:none; }.advertisement-card:hover { transform:none; } }
</style>
