<script setup lang="ts">
import IndustryWeatherCard from '@/components/home/IndustryWeatherCard.vue'
</script>

<template>
  <section class="home-industry-weather" aria-labelledby="home-weather-title">
    <div class="home-industry-weather__intro">
      <span>INDUSTRY PULSE</span>
      <h2 id="home-weather-title">交通運輸產業晴雨圖</h2>
      <p>以公開資料掌握近期產業動向。</p>
    </div>
    <div class="home-industry-weather__card"><IndustryWeatherCard /></div>
  </section>
</template>
