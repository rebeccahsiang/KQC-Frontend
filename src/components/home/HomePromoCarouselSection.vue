<script setup lang="ts">
import { reactive } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { A11y, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface PromoItem {
  id: string
  title: string
  description: string
  imageUrl: string | null
  imageAlt: string
  category?: string
  target?: string
}

const localImage = (name: string) => new URL(`../../assets/images/categories/${name}`, import.meta.url).href

// Temporary frontend-owned content. This shape can be replaced by a future public Promo API.
const placeholderPromos: PromoItem[] = [
  { id: 'transport-services', category: '產業服務', title: '交通運輸業買賣與服務', description: '快速了解現有服務與商用車相關資訊。', imageUrl: localImage('freight-truck.jpg'), imageAlt: '行駛中的大型貨運車輛', target: '/products' },
  { id: 'advisor-services', category: '顧問協助', title: '專業顧問服務', description: '從需求整理到流程說明，找到適合的協助入口。', imageUrl: localImage('container-truck.jpg'), imageAlt: '貨櫃運輸車輛與物流場景', target: '/contact' },
  { id: 'digital-services', category: '數位服務', title: '產業資訊數位化', description: '透過公開資料與平台工具掌握產業動向。', imageUrl: localImage('light-truck.jpg'), imageAlt: '城市道路上的商用小貨車', target: '/company' }
]

const failedImages = reactive(new Set<string>())
const markImageUnavailable = (id: string) => failedImages.add(id)
const swiperModules = [Navigation, Pagination, A11y]
</script>

<template>
  <section id="featured-services" class="home-promo-section" aria-labelledby="home-promo-title">
    <div class="home-promo-heading">
      <div><span>FEATURED</span><h2 id="home-promo-title">精選服務</h2></div>
      <p>從交通運輸需求出發，快速前往相關服務。</p>
    </div>

    <Swiper
      class="home-promo-swiper"
      :modules="swiperModules"
      :slides-per-view="1"
      :space-between="16"
      :navigation="true"
      :pagination="{ clickable: true }"
      :watch-overflow="true"
      :grab-cursor="true"
      :breakpoints="{ 640: { slidesPerView: 2, spaceBetween: 18 }, 1100: { slidesPerView: 3, spaceBetween: 20 } }"
    >
      <SwiperSlide v-for="promo in placeholderPromos" :key="promo.id" class="home-promo-slide">
        <component :is="promo.target ? 'RouterLink' : 'article'" :to="promo.target" class="home-promo-card">
          <div class="home-promo-media">
            <img v-if="promo.imageUrl && !failedImages.has(promo.id)" :src="promo.imageUrl" :alt="promo.imageAlt" @error="markImageUnavailable(promo.id)">
            <div v-else class="home-promo-fallback" aria-hidden="true"><span>KQC</span><i /></div>
          </div>
          <div class="home-promo-copy">
            <span v-if="promo.category">{{ promo.category }}</span>
            <h3>{{ promo.title }}</h3>
            <p>{{ promo.description }}</p>
            <em v-if="promo.target">了解更多 <span aria-hidden="true">→</span></em>
          </div>
        </component>
      </SwiperSlide>
    </Swiper>
  </section>
</template>
