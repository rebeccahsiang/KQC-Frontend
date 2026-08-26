<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

const visible = ref(false)
const updateVisibility = () => { visible.value = window.scrollY > 320 }
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
onMounted(() => window.addEventListener('scroll', updateVisibility, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', updateVisibility))
</script>

<template>
  <button v-show="visible" type="button" class="back-to-top" aria-label="回到頁首" title="回到頁首" @click="scrollToTop">
    <Icon icon="lucide:arrow-up" aria-hidden="true" />
  </button>
</template>

<style scoped lang="scss">
.back-to-top {
  position: fixed; right: clamp(1rem, 3vw, 2rem); bottom: clamp(1rem, 3vw, 2rem); z-index: 40;
  display: grid; width: 2.75rem; height: 2.75rem; place-items: center; border: 1px solid var(--border-grey);
  border-radius: 999px; background: var(--bg-card); color: var(--text-main); box-shadow: 0 0.5rem 1.5rem rgb(15 23 42 / 18%); cursor: pointer;
}
.back-to-top:hover, .back-to-top:focus-visible { color: var(--accent); border-color: var(--accent); }
.back-to-top svg { width: 1.1rem; height: 1.1rem; }
@media (prefers-reduced-motion: reduce) { .back-to-top { scroll-behavior: auto; } }
</style>
