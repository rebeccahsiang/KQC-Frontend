<script setup lang="ts">
import KqcButton from '@/components/ui/KqcButton.vue'

export interface ServiceCardProps {
  displaySubtitle?: string
  displayDescription?: string
  displayButtonText?: string
  variant?: 'primary' | 'accent' | 'outline' | 'text' | 'danger'
}

const props = withDefaults(defineProps<ServiceCardProps>(), {
  displaySubtitle: '',
  displayDescription: '',
  displayButtonText: '了解更多',
  variant: 'primary',
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<template>
  <div
    class="flex flex-col h-full p-6 bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
  >
    <!-- 上半部內文 -->
    <div class="flex-1 flex flex-col">
      <p
        v-if="displaySubtitle"
        class="mb-3 text-xs font-semibold text-gray-400 dark:text-gray-500"
      >
        {{ displaySubtitle }}
      </p>

      <p
        class="mb-6 text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300 flex-1"
      >
        {{ displayDescription }}
      </p>
    </div>

    <!-- 底部按鈕：自訂平齊 -->
    <div class="flex justify-center pt-2 mt-auto">
      <KqcButton
        :variant="variant"
        size="md"
        class="px-8"
        @click="handleClick"
      >
        {{ displayButtonText }}
      </KqcButton>
    </div>
  </div>
</template>