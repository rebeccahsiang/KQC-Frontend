<script setup lang="ts">
import { computed } from 'vue'
import KqcCard from '@/components/ui/KqcCard.vue'
import KqcButton from '@/components/ui/KqcButton.vue'

// 定義案件資料介面
export interface CaseItem {
  id: string
  caseNumber: string
  caseType: 'buyer_request' | 'seller_listing'
  title: string
  targetArea: string
  capitalAmount: number
  requirementCore: string
  status: 'active' | 'completed'
  categoryName: string
}

interface Props {
  caseData: CaseItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click-action', caseData: CaseItem): void
}>()

const isBuyer = computed(() => props.caseData.caseType === 'buyer_request')

const formattedCapital = computed(() => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(props.caseData.capitalAmount)
})
</script>

<template>
  <KqcCard hoverable headerBorder footerBorder class="h-full">
    <!-- Header: 案件編號與標籤 -->
    <template #header>
      <div class="flex items-center gap-2">
        <span
          :class="[
            'text-xs font-bold px-2.5 py-1 rounded-md',
            isBuyer
              ? 'bg-[#1E293B] text-white'
              : 'bg-[#EAB308] text-[#1E293B]',
          ]"
        >
          {{ isBuyer ? '誠意買家委託' : '精選待售資產' }}
        </span>
        <span class="text-xs font-medium text-gray-400">
          {{ caseData.caseNumber }}
        </span>
      </div>
      <span class="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
        {{ caseData.categoryName }}
      </span>
    </template>

    <!-- Body: 標題與核心需求細節 -->
    <div class="space-y-4">
      <h3 class="font-bold text-lg text-[#1E293B] dark:text-white line-clamp-2 leading-snug">
        {{ caseData.title }}
      </h3>

      <div class="space-y-2 text-sm bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-lg border border-gray-100 dark:border-gray-800">
        <div class="flex justify-between items-center">
          <span class="text-gray-500 text-xs">目標區域：</span>
          <span class="font-semibold text-gray-800 dark:text-gray-200">{{ caseData.targetArea }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-500 text-xs">{{ isBuyer ? '預算資本額：' : '預定轉讓價：' }}</span>
          <span class="font-bold text-[#EAB308]">{{ formattedCapital }}</span>
        </div>
      </div>

      <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
        {{ caseData.requirementCore }}
      </p>
    </div>

    <!-- Footer: 按鈕觸發 -->
    <template #footer>
      <div class="w-full flex items-center justify-between gap-3">
        <span class="text-xs text-emerald-600 font-semibold flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          AI 媒合中
        </span>
        <KqcButton
          variant="accent"
          size="sm"
          @click="emit('click-action', caseData)"
        >
          {{ isBuyer ? '我有匹配案件' : '立即預約諮詢' }}
        </KqcButton>
      </div>
    </template>
  </KqcCard>
</template>