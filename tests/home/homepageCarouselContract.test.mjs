import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const root = new URL('../../', import.meta.url); const read = (path) => readFileSync(new URL(path, root), 'utf8')
const api = read('src/api/homepageCarousel.ts'); const admin = read('src/views/admin/frontend/CarouselImagesView.vue'); const carousel = read('src/components/home/HomeCarouselSection.vue'); const home = read('src/views/HomeView.vue'); const sidebar = read('src/config/sidebarMenu.ts'); const router = read('src/router/index.ts')

// D2G-B — Carousel Admin/Public and Homepage Swiper contract.
test('Admin navigation and route expose exactly one canonical Carousel Image surface', () => {
  assert.equal((sidebar.match(/title: '輪播圖片'/g) ?? []).length, 1)
  assert.match(sidebar, /id: 'frontend'[^\n]*title: '前台管理'[^\n]*capabilities: \['PLATFORM_MANAGER', 'ADMIN'\]/)
  assert.match(sidebar, /id: 'carousel-images'[^\n]*path: '\/admin\/frontend\/carousel-images'[^\n]*capabilities: \['PLATFORM_MANAGER', 'ADMIN'\]/)
  assert.match(router, /path: 'carousel-images'[^\n]*CarouselImagesView\.vue[^\n]*capabilities: \['PLATFORM_MANAGER', 'ADMIN'\]/)
})

test('API clients use exact bounded Admin and public endpoints', () => {
  assert.match(api, /api\.get[^\n]+\('\/v1\/admin\/homepage-carousel-images'\)/)
  assert.match(api, /api\.post[^\n]+\('\/v1\/admin\/homepage-carousel-images'/)
  assert.match(api, /api\.patch[^\n]+\/v1\/admin\/homepage-carousel-images\/\$\{encodeURIComponent\(id\)\}/)
  assert.match(api, /api\.delete[^\n]+\/v1\/admin\/homepage-carousel-images\/\$\{encodeURIComponent\(id\)\}/)
  for (const field of ['image', 'name', 'altText']) assert.match(api, new RegExp(`body\\.append\\('${field}',`))
  assert.doesNotMatch(api, /body\.append\(['"](?:path|filename|mimeType|size|createdBy|enabled|sortOrder)/)
  assert.match(api, /api\.get[^\n]+\('\/public\/homepage-carousel-images'\)/)
})

test('Admin page owns bounded upload edit enable order and confirmed delete UX', () => {
  for (const text of ['輪播圖片', '正在載入輪播圖片', '目前尚無輪播圖片', '重試', '新增輪播圖片', '圖片名稱', 'ALT 文字', '顯示順序', '啟用']) assert.ok(admin.includes(text))
  assert.match(admin, /image\/jpeg[^\n]+image\/png[^\n]+image\/webp/); assert.match(admin, /HOMEPAGE_CAROUSEL_MAX_BYTES/); assert.match(admin, /不支援 SVG/)
  // D2G-B-R2 — Carousel Image Picker UX keeps the real input while the explicit control owns selection and replacement.
  assert.match(admin, /<Button type="button" :label="upload\.image \? '更換圖片' : '選擇圖片'"[^>]+@click="fileInput\?\.click\(\)"/)
  assert.match(admin, /<input id="carousel-file" ref="fileInput" class="carousel-file-input" type="file" accept="image\/jpeg,image\/png,image\/webp" required/)
  assert.match(admin, /upload\.image\?\.name \|\| '尚未選擇檔案'/)
  assert.match(admin, /adminHomepageCarouselApi\.update\(edit\.id, \{ name:[^}]+altText:[^}]+enabled:[^}]+sortOrder:/)
  assert.match(admin, /import InputNumber from 'primevue\/inputnumber'/)
  assert.match(admin, /<InputNumber v-model="edit\.sortOrder" :min="0" :max="100000" :step="1" :min-fraction-digits="0" :max-fraction-digits="0" required/)
  assert.doesNotMatch(admin.slice(admin.indexOf('const saveEdit'), admin.indexOf('// D2G-B — Carousel Image Delete')), /filename|mimeType|size|publicPath|createdBy/)
  assert.match(admin, /window\.confirm/); assert.match(admin, /if \(deletingId\.value \|\| mutating\.value/)
})

test('Homepage owns a separate accessible Swiper with bounded autoplay behavior', () => {
  assert.match(carousel, /from 'swiper\/vue'/); for (const module of ['EffectCoverflow', 'Navigation', 'Pagination', 'A11y', 'Autoplay', 'Keyboard']) assert.ok(carousel.includes(module))
  // D2G-B-R2 — Carousel Coverflow Presentation protects neighboring-slide context without pinning decorative tuning.
  assert.match(carousel, /swiper\/css\/effect-coverflow/)
  assert.match(carousel, /:effect="hasMultiple \? 'coverflow' : 'slide'"/)
  assert.match(carousel, /:centered-slides="hasMultiple"/)
  assert.match(carousel, /960: \{ slidesPerView: (?:1\.[1-9]|[2-9])/)
  assert.match(carousel, /:slides-per-view="hasMultiple \? 1\.08 : 1"/); assert.match(carousel, /delay: 5000/); assert.match(carousel, /disableOnInteraction: false/)
  assert.match(carousel, /:loop="hasMultiple"/); assert.match(carousel, /:navigation="hasMultiple"/); assert.match(carousel, /:pagination="hasMultiple \? \{ clickable: true \} : false"/)
  assert.match(carousel, /hasMultiple && !reducedMotion/); assert.match(carousel, /prefers-reduced-motion: reduce/)
  assert.match(carousel, /v-if="loading \|\| visibleImages\.length"/); assert.match(carousel, /@error="markUnavailable\(image\.id\)"/)
  assert.match(carousel, /960: \{ slidesPerView: 2\.05, spaceBetween: 0 \}/)
  assert.match(carousel, /coverflowEffect = \{[^}]*stretch: 64[^}]*scale: 1/)
  assert.match(carousel, /@click\.stop="openPreview\(image\)"/)
  assert.match(carousel, /console\.log\('\[Carousel Lightbox\] openPreview', image\)[\s\S]*previewImage\.value = image/)
  assert.doesNotMatch(carousel, /swiperInstance|activeIndex|clickedIndex|classList\.contains\('swiper-slide-active'\)|selectSlide/)
  assert.match(carousel, /:deep\(\.swiper-slide-prev\),[^}]*:deep\(\.swiper-slide-next\)[^{]*\{[^}]*z-index:2[^}]*opacity:\.9/)
  assert.match(carousel, /:deep\(\.swiper-slide-prev\)[^{]*\{[^}]*translateX\(9%\) scale\(\.82\)/)
  assert.match(carousel, /:deep\(\.swiper-slide-next\)[^{]*\{[^}]*translateX\(-9%\) scale\(\.82\)/)
  assert.match(carousel, /:deep\(\.swiper-slide-active\)[^{]*\{[^}]*z-index:4[^}]*opacity:1/)
  assert.match(carousel, /:deep\(\.swiper-slide-active\) \.home-carousel-slide__action\s*\{[^}]*cursor:zoom-in[^}]*scale\(1\.16\)/)
  assert.match(carousel, /@media\(min-width:960px\)\{\.home-carousel-swiper\{perspective:1000px\}/)
  assert.match(carousel, /:deep\(\.swiper-slide:not\(\.swiper-slide-active,\.swiper-slide-prev,\.swiper-slide-next\)\)\{[^}]*opacity:0[^}]*visibility:hidden[^}]*pointer-events:none/)
  assert.match(carousel, /:deep\(\.swiper-slide-prev\) \.home-carousel-slide__action\{[^}]*translateX\(9%\) scale\(\.82\) rotateY\(15deg\)[^}]*transform-origin:right center/)
  assert.match(carousel, /:deep\(\.swiper-slide-next\) \.home-carousel-slide__action\{[^}]*translateX\(-9%\) scale\(\.82\) rotateY\(-15deg\)[^}]*transform-origin:left center/)
  assert.match(carousel, /:deep\(\.swiper-slide-active\) \.home-carousel-slide__action\{[^}]*scale\(1\.16\) rotateY\(0deg\)/)
  assert.match(carousel, /\.home-carousel-slide__action\s*\{[^}]*cursor:zoom-in[^}]*pointer-events:auto/)
  assert.match(carousel, /\.home-carousel-slide img\s*\{[^}]*object-fit:contain/)
  assert.match(carousel, /role="dialog"[^>]*aria-modal="true"[^>]*@click\.self="closePreview"/)
  assert.match(carousel, /aria-label="關閉圖片預覽"[^>]*@click="closePreview"/)
  assert.match(carousel, /\.home-carousel-lightbox\s*\{[^}]*z-index:4000[^}]*display:grid[^}]*pointer-events:auto/)
  assert.match(carousel, /\.home-carousel-lightbox img\s*\{[^}]*max-width:90vw[^}]*max-height:90vh[^}]*object-fit:contain/)
  assert.match(carousel, /event\.key === 'Escape'/); assert.match(carousel, /document\.body\.style\.overflow = 'hidden'/)
  assert.doesNotMatch(carousel, /placeholderPromos|setInterval|setTimeout|localStorage|visitor|analytics|ArticleImage|adminHomepageCarouselApi/i)
})

test('Homepage placement is Weather then Carousel then existing Featured Services', () => {
  const weather = home.indexOf('<HomeIndustryWeatherSection')
  const carouselIndex = home.indexOf('<HomeCarouselSection')
  const promo = home.indexOf('<HomePromoCarouselSection')
  assert.ok(weather >= 0 && weather < carouselIndex && carouselIndex < promo)
  assert.equal((home.match(/<HomePromoCarouselSection/g) ?? []).length, 1)
})
