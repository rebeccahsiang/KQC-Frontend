<script setup lang="ts">
import KqcCard from '@/components/ui/KqcCard.vue'
</script>

<template>
  <div class="insights-view min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
    <KqcCard padding="lg" class="border space-y-6">
      <div class="border-b border-[var(--kqc-border)] pb-4">
        <h1 class="text-3xl font-extrabold text-[var(--kqc-text-main)]">
          產業洞察與趨勢分析
        </h1>
        <p class="text-xs text-[var(--kqc-text-muted)] mt-1">
          掌握全台特許車牌交易行情、監理法規演進與大數據報告
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KqcCard variant="flat" padding="md" class="border">
          <h3 class="font-bold text-[var(--kqc-text-main)] mb-2">
            📊 2026 運輸業市場供需晴雨窗
          </h3>
          <p class="text-xs text-[var(--kqc-text-muted)]">
            分析北部與南部地區貨櫃貨運及甲種小客車之資本額異動趨勢。
          </p>
        </KqcCard>

        <KqcCard variant="flat" padding="md" class="border">
          <h3 class="font-bold text-[var(--kqc-text-main)] mb-2">
            ⚖️ 特許牌照讓渡法規實務
          </h3>
          <p class="text-xs text-[var(--kqc-text-muted)]">
            代書流程把關與特約公證處股權移轉合約安全指南。
          </p>
        </KqcCard>
      </div>
    </KqcCard>
  </div>
</template>

<style lang="scss" scoped>
.insights-view {
  background-color: var(--kqc-bg-main);
}
</style>