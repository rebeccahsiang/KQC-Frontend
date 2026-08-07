<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

// 跑馬燈播報測試數據（呼應專題中前台公開廣播需求）
const marquees = ref([
  { id: 'MQ-001', content: '🚀 [熱銷中] 北部地區甲種貨運牌照現成公司讓渡，洽詢熱烈！', isPinned: true },
  { id: 'MQ-002', content: '💡 [需求強烈] 誠意買家急尋中部地區貨櫃車隊，預算 500 萬內。', isPinned: false }
])
</script>

<template>
  <div class="space-y-6">
    <!-- 頁面標頭 -->
    <div class="flex items-center justify-between pb-2 border-b border-slate-800">
      <h2 class="text-xl font-bold tracking-wide text-white flex items-center gap-2.5">
        <span class="w-1.5 h-6 bg-[var(--accent)] rounded-full"></span>
        前台公告與跑馬燈廣播管理
      </h2>
      <button class="px-4 py-2 bg-[var(--accent)] hover:bg-[#FACC15] text-slate-900 font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 shadow-md">
        <Icon icon="lucide:plus" class="w-4 h-4" />
        新增廣播公告
      </button>
    </div>

    <!-- 跑馬燈清單卡片區域 -->
    <div class="bg-[var(--primary)]/60 border border-slate-700/50 rounded-xl p-6 shadow-xl space-y-4">
      <div v-for="item in marquees" :key="item.id" class="flex items-center justify-between p-4 bg-slate-800/80 rounded-lg border border-slate-700/40">
        <div class="flex items-center gap-3">
          <span class="text-xs px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded font-mono">
            {{ item.id }}
          </span>
          <span class="text-sm text-slate-200">{{ item.content }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-amber-400 rounded transition-colors" title="編輯">
            <Icon icon="lucide:edit-3" class="w-4 h-4" />
          </button>
          <button class="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded transition-colors" title="刪除">
            <Icon icon="lucide:trash-2" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>