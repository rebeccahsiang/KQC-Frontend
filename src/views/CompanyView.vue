<script setup lang="ts">
import KqcCard from '@/components/ui/KqcCard.vue'
</script>

<template>
  <div class="company-view min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
    <KqcCard padding="lg" class="border space-y-6">
      <div class="border-b border-[var(--kqc-border)] pb-4">
        <span class="text-xs font-semibold px-2.5 py-1 rounded bg-[var(--kqc-accent)]/20 text-[var(--kqc-accent)]">
          品牌理念 & 企業優勢
        </span>
        <h1 class="text-3xl font-extrabold text-[var(--kqc-text-main)] mt-2">
          關於三爵資訊 KQC
        </h1>
      </div>

      <div class="space-y-4 text-sm text-[var(--kqc-text-muted)] leading-relaxed">
        <p>
          三爵資訊（KQC）為全台首創專注於「特許交通運輸業（甲/乙種小客車、汽車貨運、貨櫃物流、計程車）資產讓渡與數位轉型」的科技戰情平台。
        </p>
        <p>
          我們以「誠信、保密、高效」為核心，透過現代化 SPA 單頁架構與物理資安隔離技術，為傳統車行老闆與投資企業打造透明且具備極高防禦力的 B2B 交易環境。
        </p>
      </div>
    </KqcCard>
  </div>
</template>

<style lang="scss" scoped>
.company-view {
  background-color: var(--kqc-bg-main);
}
</style>