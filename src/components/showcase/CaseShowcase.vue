<!-- src/components/CaseShowcase.vue -->
<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import CaseCard from '@/components/showcase/CaseShowcase.vue'

// 💡 運用 TypeScript 定義嚴謹的 Props 接收外層的案源資料陣列
defineProps<{
  casesData: any[]
}>()
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-black text-surface-900 dark:text-surface-0 border-l-4 border-amber-500 pl-3 tracking-wide">
      三爵精選：業務櫥窗
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
      <!-- 真實動態卡牌渲染區 -->
      <CaseCard v-for="item in casesData" :key="item.caseId" :data="item" />
      
      <!-- 立即委託引導卡牌 -->
      <Card class="shadow-xl rounded-2xl border border-dashed border-amber-500/30 bg-surface-50/5 dark:bg-surface-800/10 text-center flex flex-col justify-center items-center p-6 h-full">
        <template #content>
          <div class="flex flex-col items-center justify-center py-6 space-y-6">
            <div class="w-14 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-2xl shadow-inner animate-pulse">
              <i class="pi pi-plus"></i>
            </div>
            <div class="space-y-2">
              <h4 class="text-xl font-bold text-white tracking-wide">您的事業，價值多少？</h4>
              <p class="text-xs text-surface-400 max-w-xs mx-auto leading-relaxed">
                別讓昂貴的資產與車牌曬太陽。我們有活躍的運輸物流駕駛社群，為您精準媒合讓渡。
              </p>
            </div>
            <Button label="立即委託招募" severity="warning" size="small" rounded raised />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
