<script setup lang="ts">
import IndustryStatisticsSummary from '@/components/home/IndustryStatisticsSummary.vue'
import IndustryWeatherPulse from '@/components/home/IndustryWeatherPulse.vue'
</script>

<template>
  <section class="home-industry-weather" aria-labelledby="home-weather-title">
    <div class="home-industry-weather__intro"><IndustryWeatherPulse /></div>
    <div class="home-industry-weather__card"><IndustryStatisticsSummary /></div>
  </section>
</template>
