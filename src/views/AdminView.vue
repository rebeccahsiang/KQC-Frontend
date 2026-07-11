<template>
  <div class="admin-container">
    <h2 class="title">三瑝資訊 (KQJ) - 全端智慧控制台戰情室</h2>
    
    <!-- 區塊一：即時供需晴雨窗儀表板 -->
    <div class="stats-dashboard">
      <div class="stat-card">
        <h3>📊 供需晴雨窗 (買家比例)</h3>
        <div class="circle-progress">
          <span class="ratio-text">{{ stats.demandRatio }}%</span>
        </div>
      </div>
      <div class="stat-card">
        <h3>🟥 出讓賣方 (Supply)</h3>
        <p class="stat-num text-red-400">{{ stats.sellerCount }} 筆</p>
      </div>
      <div class="stat-card">
        <h3>🟩 買收買方 (Demand)</h3>
        <p class="stat-num text-green-400">{{ stats.buyerCount }} 筆</p>
      </div>
    </div>

    <!-- 區塊二：新增案件表單（整合昨天的防呆優化） -->
    <!-- 為了排版乾淨，此處省略表單 HTML，與昨天的表單大統一程式碼完全相同 -->

    <!-- 區塊三：後台管理清單數據桌（關鍵字搜尋、排序、案件生命週期操作） -->
    <div class="management-table-section">
      <div class="table-toolbar">
        <h3 class="section-subtitle">📋 全站案件實時維護清單</h3>
        
        <div class="filter-controls">
          <!-- 關鍵字模糊搜尋 -->
          <input v-model="searchQuery" type="text" placeholder="🔍 輸入標題、編號模糊搜尋..." class="search-input" />
          
          <!-- 類型與時間排序選擇器 -->
          <select v-model="sortBy" class="sort-select">
            <option value="newest">📅 時間：由新到舊</option>
            <option value="oldest">📅 時間：由舊到新</option>
            <option value="priceHigh">💰 金額：由高到低</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>案件編號</th>
              <th>性質</th>
              <th>案件標題</th>
              <th>資產種類</th>
              <th>金額(萬)</th>
              <th>目前狀態</th>
              <th>建立日期</th>
              <th>權限操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredAndSortedCases" :key="item._id" :class="{ 'opacity-50': item.caseStatus === 'closed' }">
              <td class="font-mono text-brand-gold">{{ item.caseId }}</td>
              <td>
                <span :class="['badge', item.caseType === 'seller' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400']">
                  {{ item.caseType === 'seller' ? '出讓' : '買收' }}
                </span>
              </td>
              <td class="text-left font-medium">{{ item.title }}</td>
              <td>{{ item.leaseType }}</td>
              <td class="font-mono text-amber-500">{{ item.price === 0 ? '不限' : item.price + '萬' }}</td>
              <td>
                <span :class="['status-dot', item.caseStatus]">
                  {{ statusTextMap[item.caseStatus] }}
                </span>
              </td>
              <td class="text-xs text-slate-400">{{ formatDate(item.createdAt) }}</td>
              <!-- ⚡ 核心操作鈕：修改、隱藏、下架、結案 -->
              <td class="action-buttons">
                <button v-if="item.caseStatus === 'selling'" @click="handleStatusUpdate(item._id, 'closed')" class="btn-action close-btn" title="配對成功/結案">🤝 結案</button>
                <button v-if="item.caseStatus === 'selling'" @click="handleStatusUpdate(item._id, 'preparation')" class="btn-action hide-btn" title="前台隱藏">👁️ 隱藏</button>
                <button v-if="item.caseStatus === 'preparation'" @click="handleStatusUpdate(item._id, 'selling')" class="btn-action show-btn" title="重新上架">🚀 上架</button>
                <button @click="handleDelete(item._id)" class="btn-action delete-btn" title="徹底物理刪除">🗑️ 刪除</button>
              </td>
            </tr>
            <tr v-if="filteredAndSortedCases.length === 0">
              <td colspan="8" class="text-slate-500 py-8">🔍 沒有找到任何符合篩選條件的運輸案件。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// 數據載入狀態
const casesList = ref<any[]>([])
const searchQuery = ref('')
const sortBy = ref('newest')
const stats = ref({ sellerCount: 0, buyerCount: 0, demandRatio: 50 })

const statusTextMap: Record<string, string> = {
  'selling': '🟢 銷售中',
  'preparation': '🟡 草稿隱藏',
  'closed': '🏁 配對結案'
}

// 💡 1. 初始化讀取：同時撈取列表與晴雨窗統計
const fetchDashboardData = async () => {
  try {
    const listRes = await axios.get('http://localhost:3000/api/cases') // 這裡後台會回傳所有資料
    casesList.value = listRes.data.data
    
    const statsRes = await axios.get('http://localhost:3000/api/cases/stats/supply-demand')
    stats.value = statsRes.data
  } catch (err) {
    console.error('數據同步加載失敗:', err)
  }
}

onMounted(() => {
  fetchDashboardData()
})

// 💡 2. 核心黑科技：計算屬性（Computed）實時處理模糊搜尋與加權排序
const filteredAndSortedCases = computed(() => {
  let result = [...casesList.value]
  
  // 模糊關鍵字篩選 (編號、標題、種類)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.caseId.toLowerCase().includes(q) ||
      item.leaseType.includes(q)
    )
  }
  
  // 動態多條件排序
  result.sort((a, b) => {
    if (sortBy.value === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy.value === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    if (sortBy.value === 'priceHigh') return b.price - a.price
    return 0
  })
  
  return result
})

// 💡 3. 物件 Lifecycle 一鍵原子更新（下架、隱藏、結案）
const handleStatusUpdate = async (id: string, newStatus: string) => {
  try {
    await axios.patch(`http://localhost:3000/api/cases/${id}`, { caseStatus: newStatus })
    await fetchDashboardData() // 實時重整戰情室數據與晴雨窗
  } catch (err) {
    alert('雲端狀態變更失敗')
  }
}

// 💡 4. 徹底刪除
const handleDelete = async (id: string) => {
  if (!confirm('⚠️ 警告：此操作將徹底從雲端資料庫抹除該客戶的所有案源與個資，確定執行？')) return
  try {
    await axios.delete(`http://localhost:3000/api/cases/${id}`)
    await fetchDashboardData()
  } catch (err) {
    alert('物理刪除失敗')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<style lang="scss" scoped>
/* 為了維護視覺美感，以下對齊昨天的全域 Tailwind v4 變數系統 */
.admin-container { padding: 2rem; max-width: 1200px; margin: 0 auto; color: var(--color-brand-text); font-family: 'Microsoft JhengHei', sans-serif; }
.title { text-align: center; margin-bottom: 2rem; color: var(--color-brand-gold); font-weight: bold; }

/* 儀表板排版 */
.stats-dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.stat-card {
  background: var(--color-brand-card); border: 1px solid #27272a; border-radius: 12px; padding: 1.5rem; text-align: center;
  h3 { font-size: 0.9rem; color: #94a3b8; margin-bottom: 1rem; }
  .stat-num { font-size: 2rem; font-weight: bold; font-family: monospace; }
}
.circle-progress {
  width: 80px; height: 80px; border-radius: 50%; border: 6px solid #22c55e; margin: 0 auto; display: flex; align-items: center; justify-content: center;
  .ratio-text { font-weight: bold; color: #fff; font-size: 1.2rem; }
}

/* 戰情數據桌樣式 */
.management-table-section { background: var(--color-brand-card); border: 1px solid #27272a; border-radius: 16px; padding: 2rem; margin-top: 2rem; }
.table-toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid #334155; padding-bottom: 1rem; }
.section-subtitle { font-size: 1.2rem; font-weight: bold; color: var(--color-brand-gold); }
.filter-controls { display: flex; gap: 1rem; flex-wrap: wrap; }
.search-input { background: var(--color-brand-bg); border: 1px solid #334155; padding: 0.6rem 1rem; border-radius: 8px; color: #fff; width: 260px; }
.sort-select { background: var(--color-brand-bg); border: 1px solid #334155; padding: 0.6rem; border-radius: 8px; color: #fff; }

.table-responsive { overflow-x: auto; }
.admin-table {
  width: 100%; border-collapse: collapse; text-align: center; font-size: 0.9rem;
  th { background: #0b0f19; padding: 1rem; color: #94a3b8; font-weight: bold; border-bottom: 2px solid #1e293b; }
  td { padding: 1rem; border-bottom: 1px solid #1e293b; color: #e2e8f0; vertical-align: middle; }
  tr:hover td { background: rgba(255,255,255,0.02); }
}

/* 狀態圓點與徽章 */
.badge { padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: bold; font-size: 0.8rem; }
.status-dot {
  font-size: 0.85rem; font-weight: 500;
  &.selling { color: #34d399; }
  &.preparation { color: #ffb703; }
  &.closed { color: #94a3b8; text-decoration: line-through; }
}

/* 操作鈕控管 */
.action-buttons { display: flex; gap: 0.5rem; justify-content: center; }
.btn-action {
  padding: 0.4rem 0.7rem; border-radius: 6px; font-size: 0.8rem; font-weight: bold; cursor: pointer; border: none; transition: background 0.2s;
  &.close-btn { background: #2563eb; color: #fff; &:hover { background: #1d4ed8; } }
  &.hide-btn { background: #4b5563; color: #fff; &:hover { background: #374151; } }
  &.show-btn { background: #d97706; color: #fff; &:hover { background: #b45309; } }
  &.delete-btn { 
    background: rgba(220, 38, 38, 0.2); 
    color: #ef4444; 
    border: 1px solid rgba(220, 38, 38, 0.3); 
    &:hover { 
    background: #dc2626; 
    color: #fff; 
  } }
}
</style>