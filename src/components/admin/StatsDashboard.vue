<script setup lang="ts">
defineProps<{
  stats: {
    sellerCount: number
    buyerCount: number
    demandRatio: number
  }
}>()
</script>

<template>
  <div class="stats-dashboard">
    <div class="stat-card">
      <h3>📊 供需晴雨窗 (買家比例)</h3>
      <div class="circle-progress">
        <span class="ratio-text">{{ stats.demandRatio }}%</span>
      </div>
    </div>
    <div class="stat-card">
      <h3>🟥 出讓賣方 (供應)</h3>
      <p class="stat-num text-red">{{ stats.sellerCount }} 筆</p>
    </div>
    <div class="stat-card">
      <h3>🟩 購買接收請求 (需求)</h3>
      <p class="stat-num text-green">{{ stats.buyerCount }} 筆</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.stats-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: var(--bg-surface, #1e293b);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid var(--color-border, #334155);
  
  h3 {
    font-size: 0.95rem;
    color: var(--color-text-main, #f8fafc);
    margin-bottom: 1rem;
  }
}

.circle-progress {
  width: 70px;
  height: 70px;
  border: 4px solid var(--color-accent, #eab308);
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: var(--color-accent, #eab308);
}

.stat-num {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  
  &.text-red { color: #ef4444; }
  &.text-green { color: #10b981; }
}
</style>