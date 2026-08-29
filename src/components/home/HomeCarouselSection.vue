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
const visibleImages = computed(() => images.value.filter((image) => !failedImages.has(image.id)))
const hasMultiple = computed(() => visibleImages.value.length > 1)
const modules = [EffectCoverflow, Navigation, Pagination, A11y, Autoplay, Keyboard]
const coverflowEffect = { rotate: 12, stretch: 0, depth: 110, modifier: 1, slideShadows: false }
const carouselBreakpoints = {
  640: { slidesPerView: 1.55, spaceBetween: 18 },
  960: { slidesPerView: 2.15, spaceBetween: 24 },
}

// D2G-B — Homepage Carousel Empty / Failure Boundary / late failures never block Home.
const loadImages = async () => { const epoch = ++requestEpoch; loading.value = true; try { const response = await publicHomepageCarouselApi.list(); if (epoch === requestEpoch) images.value = response.data.images } catch { if (epoch === requestEpoch) images.value = [] } finally { if (epoch === requestEpoch) loading.value = false } }
const markUnavailable = (id: string) => failedImages.add(id)
const updateMotion = (event: MediaQueryListEvent | MediaQueryList) => { reducedMotion.value = event.matches }
onMounted(() => { motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)'); updateMotion(motionQuery); motionQuery.addEventListener('change', updateMotion); void loadImages() })
onBeforeUnmount(() => { requestEpoch += 1; motionQuery?.removeEventListener('change', updateMotion) })
</script>

<template>
  <!-- D2G-B — Homepage Carousel Swiper / Accessibility / Autoplay / Reduced Motion -->
  <section v-if="loading || visibleImages.length" class="home-carousel-section" aria-label="首頁輪播圖片" :aria-busy="loading">
    <div v-if="loading" class="home-carousel-loading" role="status">正在載入輪播圖片…</div>
    <!-- D2G-B-R2 — Carousel Coverflow Presentation exposes neighboring images without duplicate slides. -->
    <Swiper v-else class="home-carousel-swiper" :modules="modules" :effect="hasMultiple ? 'coverflow' : 'slide'" :centered-slides="hasMultiple" :slides-per-view="hasMultiple ? 1.08 : 1" :space-between="hasMultiple ? 12 : 0" :breakpoints="hasMultiple ? carouselBreakpoints : undefined" :coverflow-effect="coverflowEffect" :navigation="hasMultiple" :pagination="hasMultiple ? { clickable: true } : false" :autoplay="hasMultiple && !reducedMotion ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true } : false" :watch-overflow="true" :grab-cursor="hasMultiple" :keyboard="{ enabled: true }">
      <SwiperSlide v-for="image in visibleImages" :key="image.id" class="home-carousel-slide"><img :src="homepageCarouselImageUrl(image.path)" :alt="image.altText" @error="markUnavailable(image.id)"></SwiperSlide>
    </Swiper>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.home-carousel-section { width:min(100%,90rem);margin-inline:auto;padding:clamp(1.5rem,3vw,2.5rem) 1rem;overflow:hidden }.home-carousel-loading { width:100%;height:clamp(4rem,8vw,7rem);display:grid;place-items:center;border-radius:$kqc-radius-lg;background:var(--bg-card);color:var(--text-muted) }.home-carousel-swiper { overflow:visible;background:transparent }.home-carousel-slide { aspect-ratio:16/9;overflow:hidden;border-radius:$kqc-radius-xl;background:var(--bg-card);box-shadow:0 .75rem 2rem rgb(15 23 42 / .16) }.home-carousel-slide img { display:block;width:100%;height:100%;object-fit:cover }.home-carousel-swiper :deep(.swiper-button-prev),.home-carousel-swiper :deep(.swiper-button-next) { color:#fff;text-shadow:0 1px 4px rgb(0 0 0 / .55) }.home-carousel-swiper :deep(.swiper-button-prev:focus-visible),.home-carousel-swiper :deep(.swiper-button-next:focus-visible) { outline:3px solid #fff;outline-offset:2px }.home-carousel-swiper :deep(.swiper-pagination) { bottom:.75rem }.home-carousel-swiper :deep(.swiper-pagination-bullet) { width:.7rem;height:.7rem;background:#fff;opacity:.65;box-shadow:0 0 0 1px rgb(0 0 0 / .35) }.home-carousel-swiper :deep(.swiper-pagination-bullet-active) { opacity:1;transform:scale(1.18) }
@media(max-width:600px){.home-carousel-section{width:min(100% - 1.25rem,90rem);padding-block:1.25rem}.home-carousel-swiper :deep(.swiper-button-prev),.home-carousel-swiper :deep(.swiper-button-next){display:none}}
@media(prefers-reduced-motion:reduce){.home-carousel-swiper *{scroll-behavior:auto!important}}
</style>
