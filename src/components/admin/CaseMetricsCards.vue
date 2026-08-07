<!-- src/components/admin/CaseMetricsCards.vue -->
<script setup lang="ts">
interface MetricsData {
  ratio: number;
  sellerCount: number;
  buyerCount: number;
}

// 預設可透過 props 從父組件傳入最新 API 數據，或使用預設 mockup 數據
withDefaults(defineProps<{ metrics?: MetricsData }>(), {
  metrics: () => ({
    ratio: 50,
    sellerCount: 3,
    buyerCount: 3
  })
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- Card 1: 供需晴雨窗 -->
    <div class="metric-card bg-[var(--bg-card)] border border-gray-800 rounded-xl p-5 shadow-lg">
      <div class="flex items-center justify-center gap-2 text-gray-300 font-medium mb-4">
        <span>📊 供需晴雨窗 (買家比例)</span>
      </div>
      <div class="flex justify-center items-center">
        <div class="relative w-24 h-24 rounded-full border-4 border-[var(--accent)] flex items-center justify-center">
          <span class="text-xl font-bold text-[var(--accent)]">{{ metrics.ratio }}%</span>
        </div>
      </div>
    </div>

    <!-- Card 2: 出讓賣方 (供應) -->
    <div class="metric-card bg-[var(--bg-card)] border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div class="flex items-center justify-center gap-2 text-gray-300 font-medium">
        <span class="w-3 h-3 bg-red-500 inline-block rounded-sm"></span>
        <span>出讓賣方 ( 供應 )</span>
      </div>
      <div class="text-center my-auto py-3">
        <span class="text-4xl font-extrabold text-red-500">{{ metrics.sellerCount }}</span>
        <span class="text-red-500 font-bold ml-1">筆</span>
      </div>
    </div>

    <!-- Card 3: 購買接收請求 (需求) -->
    <div class="metric-card bg-[var(--bg-card)] border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div class="flex items-center justify-center gap-2 text-gray-300 font-medium">
        <span class="w-3 h-3 bg-emerald-500 inline-block rounded-sm"></span>
        <span>購買接收請求 ( 需求 )</span>
      </div>
      <div class="text-center my-auto py-3">
        <span class="text-4xl font-extrabold text-emerald-500">{{ metrics.buyerCount }}</span>
        <span class="text-emerald-500 font-bold ml-1">筆</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.metric-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
}
</style>