<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'

// 💡 1. 運用 TypeScript 定義嚴謹的介面接收外層資料 (Props)
interface CaseProps {
  caseId: string
  caseType: 'buyer' | 'seller'
  isPriority: boolean
  title: string
  leaseType: string
  companyType: string
  capitalAmount: number
  targetArea: string
  price: number
  coreNeed: string
}

// 接收來自父組件傳進來的物件資料
defineProps<{ data: CaseProps }>()
</script>

<template>
  <Card class="shadow-xl rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
    <template #header>
      <div class="w-full h-48 overflow-hidden relative">
        <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover" alt="案件圖片" />
        <span v-if="data.isPriority" 
          :class="data.caseType === 'seller' ? 'bg-red-500' : 'bg-blue-500'"
          class="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
          {{ data.caseType === 'seller' ? '🔥 市場詢問度高' : '💰 買家資金已到位' }}
        </span>
      </div>
    </template>
    
    <template #title>
      <div class="px-2 pt-2">
        <span :class="data.caseType === 'seller' ? 'text-red-500' : 'text-blue-500'" class="text-xs font-bold tracking-wider">
          {{ data.caseId }}
        </span>
        <h3 class="text-xl font-black text-surface-900 dark:text-surface-0 mt-1">{{ data.title }}</h3>
      </div>
    </template>

    <template #content>
      <div class="px-2 space-y-4 flex-grow flex flex-col justify-between">
        <p class="text-surface-600 dark:text-surface-400 text-sm leading-relaxed line-clamp-3 mb-4">
          {{ data.coreNeed }}
        </p>
        
        <div class="flex flex-wrap gap-2 pt-2">
          <span class="bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-xs px-2.5 py-1 rounded-md font-semibold">{{ data.companyType }}</span>
          <span class="bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-xs px-2.5 py-1 rounded-md font-semibold">{{ data.leaseType }}</span>
          <span class="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-1 rounded-md font-bold">資本額 {{ data.capitalAmount }}萬</span>
          <span class="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-md font-bold">{{ data.targetArea }}</span>
        </div>
        
        <!--  2.0 覆蓋版：完美對齊三爵資訊 (KQC) 的高階商務防呆格式化 -->
<div class="border-t border-surface-100 dark:border-surface-800 pt-4 mt-4 flex items-center justify-between">
  <span class="text-sm font-medium text-surface-500">
    {{ data.caseType === 'seller' ? '銷售金額' : '收購預算' }}
  </span>
  <!-- 💡 解決痛點：利用條件判斷，當金額為 0 時，優雅呈現「金額電議」，完美隱藏 0萬 的突兀感 -->
  <span 
    :class="[
      data.price === 0 ? 'text-amber-500 font-bold' : (data.caseType === 'seller' ? 'text-red-500' : 'text-blue-500'),
      'text-xl font-black'
    ]"
  >
    <template v-if="data.price === 0">
      金額電議
    </template>
    <template v-else>
      新台幣 {{ data.price }} 萬{{ data.caseType === 'seller' ? '' : '左右' }}
    </template>
  </span>
</div>
        
        <Button 
          :label="data.caseType === 'seller' ? '點選洽詢' : '我是符合的賣家'" 
          :severity="data.caseType === 'seller' ? 'danger' : 'primary'" 
          class="w-full mt-4" 
          raised 
        />
      </div>
    </template>
  </Card>
</template>