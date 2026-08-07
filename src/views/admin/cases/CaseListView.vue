<!-- src/views/admin/cases/CaseListView.vue -->
<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { getCasePhoto } from '@/utils/casePhotoHelper'

interface CaseItem {
  id: string
  caseNumber: string
  title: string
  caseType: 'seller_listing' | 'buyer_request'
  assetCategory: string
  region: string
  capitalAmount: number
  status: 'active' | 'hidden' | 'closed'
  photoUrl?: string
}

// Mock Data
const caseList = ref<CaseItem[]>([
  {
    id: '1',
    caseNumber: 'KQC-SFT260814',
    title: '隊長創業：貨櫃貨運業特許牌照讓渡',
    caseType: 'seller_listing',
    assetCategory: '貨櫃貨運',
    region: '北部地區',
    capitalAmount: 850,
    status: 'active'
  },
  {
    id: '2',
    caseNumber: 'KQC-SFT260815',
    title: '控股公司指定收購：汽車貨運公司',
    caseType: 'buyer_request',
    assetCategory: '汽車貨運 (FT)',
    region: '中部地區',
    capitalAmount: 1200,
    status: 'active'
  },
  {
    id: '3',
    caseNumber: 'KQC-SFT260810',
    title: '老牌物流企業圓滿退場讓渡',
    caseType: 'seller_listing',
    assetCategory: '甲種運輸業',
    region: '南部地區',
    capitalAmount: 500,
    status: 'closed'
  }
])

// 狀態篩選控制
const selectedStatusFilter = ref<string>('all')

const filteredCases = computed(() => {
  if (selectedStatusFilter.value === 'all') return caseList.value
  return caseList.value.filter(item => item.status === selectedStatusFilter.value)
})

// 修改彈窗 (Modal) 狀態控制
const isEditModalOpen = ref(false)
const editingForm = reactive({
  id: '',
  caseNumber: '',
  title: '',
  capitalAmount: 0,
  status: 'active' as 'active' | 'hidden' | 'closed'
})

const openEditModal = (item: CaseItem) => {
  editingForm.id = item.id
  editingForm.caseNumber = item.caseNumber
  editingForm.title = item.title
  editingForm.capitalAmount = item.capitalAmount
  editingForm.status = item.status
  isEditModalOpen.value = true
}

const handleSaveEdit = () => {
  const target = caseList.value.find(c => c.id === editingForm.id)
  if (target) {
    target.title = editingForm.title
    target.capitalAmount = editingForm.capitalAmount
    target.status = editingForm.status
  }
  isEditModalOpen.value = false
}
</script>

<template>
  <div class="case-list-page p-6 bg-[var(--bg-main)] min-h-screen text-white">
    <!-- 頂部控制列：標題與狀態篩選條件清單 -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-800 pb-4">
      <div>
        <h1 class="text-2xl font-bold text-[var(--accent)] flex items-center gap-2">
          <span>📋</span> 案件列表管理
        </h1>
        <p class="text-xs text-gray-400 mt-1">即時檢視、篩選與修改平台跨區資產仲介案件</p>
      </div>

      <!-- 狀態選擇清單選項 -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-400">案件狀態篩選：</label>
        <select
          v-model="selectedStatusFilter"
          class="bg-[var(--primary)] border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="all">全部分類 (All)</option>
          <option value="active">🟢 仲介中 (Active)</option>
          <option value="hidden">🟡 暫停/隱藏 (Hidden)</option>
          <option value="closed">🔴 已結案 (Closed)</option>
        </select>
      </div>
    </div>

    <!-- 案件 Table 資料列表 -->
    <div class="bg-[var(--bg-card)] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      <table class="w-full text-left border-collapse">
        <thead class="bg-[var(--primary)] text-gray-300 text-xs uppercase">
          <tr>
            <th class="p-4">案件視覺/預設照片</th>
            <th class="p-4">案件編號</th>
            <th class="p-4">案件標題與類別</th>
            <th class="p-4">區域 / 交易金額</th>
            <th class="p-4">狀態</th>
            <th class="p-4 text-center">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800 text-sm">
          <tr v-for="item in filteredCases" :key="item.id" class="hover:bg-[#1F2937]/50 transition-colors">
            <!-- 案件照片帶入 -->
            <td class="p-4">
              <img
                :src="getCasePhoto(item.photoUrl, item.assetCategory)"
                :alt="item.title"
                class="w-16 h-12 object-cover rounded border border-gray-700"
              />
            </td>
            <td class="p-4 font-mono font-bold text-amber-500">{{ item.caseNumber }}</td>
            <td class="p-4">
              <div class="font-bold text-gray-100">{{ item.title }}</div>
              <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-slate-800 text-gray-400 border border-gray-700">
                {{ item.assetCategory }}
              </span>
            </td>
            <td class="p-4">
              <div class="text-gray-300">{{ item.region }}</div>
              <div class="text-xs text-amber-400 font-semibold">{{ item.capitalAmount }} 萬 NT</div>
            </td>
            <td class="p-4">
              <span v-if="item.status === 'active'" class="px-2 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                仲介中
              </span>
              <span v-else-if="item.status === 'hidden'" class="px-2 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
                已隱藏
              </span>
              <span v-else class="px-2 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                已結案
              </span>
            </td>
            <td class="p-4 text-center">
              <button
                @click="openEditModal(item)"
                class="bg-[var(--accent)] hover:bg-[#CA8A04] text-gray-900 font-bold px-3 py-1.5 rounded text-xs transition-colors"
              >
                ✏️ 修改內容
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 編輯案件對話框 Modal -->
    <div v-if="isEditModalOpen" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-[var(--bg-card)] border border-gray-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <div class="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
          <h3 class="text-lg font-bold text-[var(--accent)]">修改案件資料：{{ editingForm.caseNumber }}</h3>
          <button @click="isEditModalOpen = false" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">案件標題：</label>
            <input
              v-model="editingForm.title"
              type="text"
              class="w-full bg-[var(--primary)] border border-gray-700 rounded p-2 text-white focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">金額 (萬 NT)：</label>
            <input
              v-model.number="editingForm.capitalAmount"
              type="number"
              class="w-full bg-[var(--primary)] border border-gray-700 rounded p-2 text-white focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">案件生命週期狀態：</label>
            <select
              v-model="editingForm.status"
              class="w-full bg-[var(--primary)] border border-gray-700 rounded p-2 text-white focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="active">🟢 仲介中 (Active)</option>
              <option value="hidden">🟡 暫停/隱藏 (Hidden)</option>
              <option value="closed">🔴 已結案 (Closed)</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
          <button
            @click="isEditModalOpen = false"
            class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-medium"
          >
            取消
          </button>
          <button
            @click="handleSaveEdit"
            class="px-4 py-2 bg-[var(--accent)] hover:bg-[#CA8A04] text-gray-900 rounded text-xs font-bold"
          >
            儲存變更
          </button>
        </div>
      </div>
    </div>
  </div>
</template>