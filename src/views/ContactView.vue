<script setup lang="ts">
import KqcCard from '@/components/ui/KqcCard.vue'
import KqcButton from '@/components/ui/KqcButton.vue'
</script>

<template>
  <div class="contact-view min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <KqcCard padding="lg" class="border max-w-2xl mx-auto space-y-6">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-extrabold text-[var(--kqc-text-main)]">
          聯絡我們與專人諮詢
        </h1>
        <p class="text-xs text-[var(--kqc-text-muted)]">
          三爵顧問團隊提供全程保密之一對一特許資產評估
        </p>
      </div>

      <div class="space-y-4 pt-4">
        <div class="p-4 rounded-xl bg-[var(--kqc-bg-hover)] border border-[var(--kqc-border)] space-y-2">
          <div class="text-sm font-bold text-[var(--kqc-text-main)]">
            💬 LINE 官方帳號快速對接
          </div>
          <p class="text-xs text-[var(--kqc-text-muted)]">
            點選下方按鈕，即可直接透過 LINE 與三爵資深顧問開啟加密對話。
          </p>
        </div>

        <KqcButton variant="success" size="lg" block class="font-bold shadow-md">
          <i class="pi pi-comments mr-2"></i>開啟 LINE 專人對話
        </KqcButton>
      </div>
    </KqcCard>
  </div>
</template>

<style lang="scss" scoped>
.contact-view {
  background-color: var(--kqc-bg-main);
}
</style>