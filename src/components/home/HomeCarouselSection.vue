<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { A11y, Autoplay, EffectCoverflow, Keyboard, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { homepageCarouselImageUrl, publicHomepageCarouselApi, type HomepageCarouselImage } from '@/api/homepageCarousel'

const images = ref<HomepageCarouselImage[]>([]); const loading = ref(true); const reducedMotion = ref(false); const failedImages = reactive(new Set<string>()); let requestEpoch = 0; let motionQuery: MediaQueryList | null = null
const previewImage = ref<HomepageCarouselImage | null>(null)
let previousBodyOverflow = ''
const visibleImages = computed(() => images.value.filter((image) => !failedImages.has(image.id)))
const hasMultiple = computed(() => visibleImages.value.length > 1)
const modules = [EffectCoverflow, Navigation, Pagination, A11y, Autoplay, Keyboard]
const coverflowEffect = { rotate: 4, stretch: 64, depth: 125, scale: 1, modifier: 1, slideShadows: false }
const carouselBreakpoints = {
  640: { slidesPerView: 1.55, spaceBetween: 18 },
  960: { slidesPerView: 2.05, spaceBetween: 0 },
}

// D2G-B — Homepage Carousel Empty / Failure Boundary / late failures never block Home.
const loadImages = async () => { const epoch = ++requestEpoch; loading.value = true; try { const response = await publicHomepageCarouselApi.list(); if (epoch === requestEpoch) images.value = response.data.images } catch { if (epoch === requestEpoch) images.value = [] } finally { if (epoch === requestEpoch) loading.value = false } }
const markUnavailable = (id: string) => failedImages.add(id)
const updateMotion = (event: MediaQueryListEvent | MediaQueryList) => { reducedMotion.value = event.matches }
const closePreview = () => {
  if (!previewImage.value) return
  previewImage.value = null
  document.body.style.overflow = previousBodyOverflow
}
const openPreview = (image: HomepageCarouselImage) => {
  console.log('[Carousel Lightbox] openPreview', image)
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  previewImage.value = image
}
const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') closePreview() }
onMounted(() => { motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)'); updateMotion(motionQuery); motionQuery.addEventListener('change', updateMotion); void loadImages() })
onMounted(() => window.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => { requestEpoch += 1; motionQuery?.removeEventListener('change', updateMotion); window.removeEventListener('keydown', handleEscape); if (previewImage.value) document.body.style.overflow = previousBodyOverflow })
</script>

<template>
  <!-- D2G-B — Homepage Carousel Swiper / Accessibility / Autoplay / Reduced Motion -->
  <section v-if="loading || visibleImages.length" class="home-carousel-section" aria-label="首頁輪播圖片" :aria-busy="loading">
    <div v-if="loading" class="home-carousel-loading" role="status">正在載入輪播圖片…</div>
    <!-- D2G-B-R2 — Carousel Coverflow Presentation exposes neighboring images without duplicate slides. -->
    <Swiper v-else class="home-carousel-swiper" :modules="modules" :effect="hasMultiple ? 'coverflow' : 'slide'" :centered-slides="hasMultiple" :slides-per-view="hasMultiple ? 1.08 : 1" :space-between="hasMultiple ? 12 : 0" :breakpoints="hasMultiple ? carouselBreakpoints : undefined" :coverflow-effect="coverflowEffect" :navigation="hasMultiple" :pagination="hasMultiple ? { clickable: true } : false" :autoplay="hasMultiple && !reducedMotion ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true } : false" :watch-overflow="true" :grab-cursor="hasMultiple" :keyboard="{ enabled: true }">
      <SwiperSlide v-for="image in visibleImages" :key="image.id" class="home-carousel-slide"><button type="button" class="home-carousel-slide__action" :aria-label="`放大檢視${image.altText}`" @click.stop="openPreview(image)"><img :src="homepageCarouselImageUrl(image.path)" :alt="image.altText" @error="markUnavailable(image.id)"><span class="home-carousel-slide__zoom" aria-hidden="true">放大</span></button></SwiperSlide>
    </Swiper>
    <Teleport to="body"><div v-if="previewImage" class="home-carousel-lightbox" role="dialog" aria-modal="true" aria-label="輪播圖片預覽" @click.self="closePreview"><button type="button" class="home-carousel-lightbox__close" aria-label="關閉圖片預覽" @click="closePreview">×</button><img :src="homepageCarouselImageUrl(previewImage.path)" :alt="previewImage.altText"></div></Teleport>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.home-carousel-section { width:min(100%,90rem);margin-inline:auto;padding:clamp(2.5rem,5vw,4.5rem) 1rem;overflow:hidden }.home-carousel-loading { width:100%;height:clamp(4rem,8vw,7rem);display:grid;place-items:center;border-radius:$kqc-radius-lg;background:var(--bg-card);color:var(--text-muted) }.home-carousel-swiper { overflow:visible;background:transparent }.home-carousel-slide { z-index:1;aspect-ratio:16/9;overflow:visible;border-radius:$kqc-radius-xl;opacity:.9 }.home-carousel-slide__action { position:relative;display:block;width:100%;height:100%;padding:0;overflow:hidden;border:0;border-radius:inherit;background:#111827;box-shadow:0 .55rem 1.4rem rgb(15 23 42 / .13);cursor:zoom-in;pointer-events:auto;transform:scale(.82);transition:transform .32s ease,box-shadow .32s ease,opacity .32s ease }.home-carousel-swiper :deep(.swiper-slide-prev),.home-carousel-swiper :deep(.swiper-slide-next) { z-index:2;opacity:.9 }.home-carousel-swiper :deep(.swiper-slide-prev) .home-carousel-slide__action { transform:translateX(9%) scale(.82) }.home-carousel-swiper :deep(.swiper-slide-next) .home-carousel-slide__action { transform:translateX(-9%) scale(.82) }.home-carousel-swiper :deep(.swiper-slide-active) { z-index:4;opacity:1 }.home-carousel-swiper :deep(.swiper-slide-active) .home-carousel-slide__action { cursor:zoom-in;transform:scale(1.16);box-shadow:0 1.2rem 3rem rgb(15 23 42 / .32) }.home-carousel-swiper :deep(.swiper-slide-active) .home-carousel-slide__action:hover { transform:scale(1.18) }.home-carousel-slide__action:focus-visible { outline:3px solid #fff;outline-offset:-5px }.home-carousel-slide img { display:block;width:100%;height:100%;object-fit:contain }.home-carousel-slide__zoom { position:absolute;top:.65rem;right:.65rem;margin:0;padding:.3rem .5rem;border:1px solid rgb(255 255 255 / .55);border-radius:999px;color:#fff;background:rgb(15 23 42 / .7);font-size:.7rem;font-weight:800;line-height:1;pointer-events:none }.home-carousel-swiper :deep(.swiper-button-prev),.home-carousel-swiper :deep(.swiper-button-next) { z-index:6;color:#fff;text-shadow:0 1px 4px rgb(0 0 0 / .55) }.home-carousel-swiper :deep(.swiper-button-prev:focus-visible),.home-carousel-swiper :deep(.swiper-button-next:focus-visible) { outline:3px solid #fff;outline-offset:2px }.home-carousel-swiper :deep(.swiper-pagination) { bottom:-2.25rem }.home-carousel-swiper :deep(.swiper-pagination-bullet) { width:.7rem;height:.7rem;background:#fff;opacity:.65;box-shadow:0 0 0 1px rgb(0 0 0 / .35) }.home-carousel-swiper :deep(.swiper-pagination-bullet-active) { opacity:1;transform:scale(1.18) }
.home-carousel-lightbox { position:fixed;inset:0;z-index:4000;display:grid;padding:clamp(1rem,4vw,3rem);place-items:center;background:rgb(3 12 24 / .88);cursor:zoom-out;pointer-events:auto }.home-carousel-lightbox img { display:block;max-width:90vw;max-height:90vh;object-fit:contain;box-shadow:0 1.5rem 4rem rgb(0 0 0 / .45);cursor:default }.home-carousel-lightbox__close { position:fixed;top:1rem;right:1rem;z-index:1;display:grid;width:2.75rem;height:2.75rem;padding:0;place-items:center;border:1px solid rgb(255 255 255 / .5);border-radius:50%;color:#fff;background:rgb(15 23 42 / .72);font-size:1.75rem;line-height:1;cursor:pointer }.home-carousel-lightbox__close:focus-visible { outline:3px solid #fff;outline-offset:3px }
@media(min-width:960px){.home-carousel-swiper{perspective:1000px}.home-carousel-swiper :deep(.swiper-slide:not(.swiper-slide-active,.swiper-slide-prev,.swiper-slide-next)){opacity:0;visibility:hidden;pointer-events:none}.home-carousel-swiper :deep(.swiper-slide-prev) .home-carousel-slide__action{transform:translateX(9%) scale(.82) rotateY(15deg);transform-origin:right center}.home-carousel-swiper :deep(.swiper-slide-next) .home-carousel-slide__action{transform:translateX(-9%) scale(.82) rotateY(-15deg);transform-origin:left center}.home-carousel-swiper :deep(.swiper-slide-active) .home-carousel-slide__action{transform:scale(1.16) rotateY(0deg)}.home-carousel-swiper :deep(.swiper-slide-active) .home-carousel-slide__action:hover{transform:scale(1.18) rotateY(0deg)}}
@media(max-width:959px){.home-carousel-slide__action,.home-carousel-swiper :deep(.swiper-slide-prev) .home-carousel-slide__action,.home-carousel-swiper :deep(.swiper-slide-next) .home-carousel-slide__action{transform:scale(.86)}.home-carousel-swiper :deep(.swiper-slide-active) .home-carousel-slide__action{transform:scale(1.04)}.home-carousel-swiper :deep(.swiper-slide-active) .home-carousel-slide__action:hover{transform:scale(1.055)}}
@media(max-width:600px){.home-carousel-section{width:min(100% - 1.25rem,90rem);padding-block:1.75rem}.home-carousel-slide__action,.home-carousel-swiper :deep(.swiper-slide-prev) .home-carousel-slide__action,.home-carousel-swiper :deep(.swiper-slide-next) .home-carousel-slide__action,.home-carousel-swiper :deep(.swiper-slide-active) .home-carousel-slide__action,.home-carousel-swiper :deep(.swiper-slide-active) .home-carousel-slide__action:hover{transform:none}.home-carousel-swiper :deep(.swiper-button-prev),.home-carousel-swiper :deep(.swiper-button-next){display:none}.home-carousel-swiper :deep(.swiper-pagination){bottom:.35rem}}
@media(prefers-reduced-motion:reduce){.home-carousel-swiper *{scroll-behavior:auto!important}}
</style>
