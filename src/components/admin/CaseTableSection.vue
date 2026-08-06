<script setup lang="ts">
defineProps<{
  cases: any[]
  filterStatus: string
  searchQuery: string
  sortBy: string
  statusTextMap: Record<string, string>
  currentEditingId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:filterStatus', val: string): void
  (e: 'update:searchQuery', val: string): void
  (e: 'update:sortBy', val: string): void
  (e: 'openDetail', item: any): void
  (e: 'editCase', item: any): void
  (e: 'changeStatus', id: string, status: string): void
  (e: 'deleteCase', id: string): void
}>()
</script>

<template>
  <div class="management-table-section">
    <div class="table-toolbar">
      <h3 class="section-subtitle">📋 全站案件即時維護清單</h3>
      <div class="filter-controls">
        <select 
          :value="filterStatus" 
          @change="emit('update:filterStatus', ($event.target as HTMLSelectElement).value)" 
          class="status-filter-select"
        >
          <option value="all">🌐 檢視：全部案源</option>
          <option value="selling">🟢 檢視：銷售中</option>
          <option value="preparation">🟡 檢視：草稿隱藏</option>
          <option value="closed">🏁 檢視：配對結案 (歷史區)</option>
        </select>
        <input 
          :value="searchQuery" 
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)" 
          type="text" 
          placeholder="🔍 輸入標題、編號搜尋..." 
          class="search-input" 
        />
        <select 
          :value="sortBy" 
          @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value)" 
          class="sort-select"
        >
          <option value="newest">📅 時間：由新到舊</option>
          <option value="oldest">📅 時間：由舊到新</option>
        </select>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>案件編號 (點擊看完整個資)</th>
            <th>性質</th>
            <th>案件標題 (前台櫥窗呈現)</th>
            <th>資產種類</th>
            <th>金額(萬)</th>
            <th>目前狀態</th>
            <th>安全防禦操作</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in cases" 
            :key="item._id" 
            :class="{ 
              'row-closed-style': item.caseStatus === 'closed', 
              'row-hidden-style': item.caseStatus === 'preparation', 
              'editing-active-row': currentEditingId === item._id 
            }"
          >
            <td>
              <button type="button" @click="emit('openDetail', item)" class="btn-case-id-link">
                {{ item.caseId }}
              </button>
            </td>
            <td>
              <span :class="item.caseType === 'seller' ? 'badge-seller' : 'badge-buyer'">
                {{ item.caseType === 'seller' ? '出讓' : '買收' }}
              </span>
            </td>
            <td class="text-left title-cell-container">
              <span class="main-case-title">{{ item.title }}</span>
              <span class="area-badge-text">📍 {{ item.targetArea }}</span>
              <p class="core-need-preview" :title="item.coreNeed">{{ item.coreNeed }}</p>
            </td>
            <td>{{ item.leaseType }}</td>
            <td>{{ item.price === 0 ? '電議' : item.price + '萬' }}</td>
            <td>{{ statusTextMap[item.caseStatus] }}</td>
            <td class="action-buttons">
              <button v-if="item.caseStatus !== 'closed'" @click="emit('editCase', item)" class="btn-action edit-btn">✏️ 修改</button>
              <button v-if="item.caseStatus === 'selling'" @click="emit('changeStatus', item._id, 'closed')" class="btn-action close-btn">🤝 結案</button>
              <button v-if="item.caseStatus === 'selling'" @click="emit('changeStatus', item._id, 'preparation')" class="btn-action hide-btn">👁️ 隱藏</button>
              <button v-if="item.caseStatus === 'preparation'" @click="emit('changeStatus', item._id, 'selling')" class="btn-action restore-btn">🚀 上架</button>
              <button @click="emit('deleteCase', item._id)" class="btn-action delete-btn">🗑️ 刪除</button>
            </td>
          </tr>
          <tr v-if="cases.length === 0">
            <td colspan="7" class="no-data-text">📭 當前篩選條件下無歷史案源數據</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.management-table-section {
  background-color: var(--bg-surface, #1e293b);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--color-border, #334155);
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--color-accent, #eab308);
  font-weight: bold;
  margin: 0;
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-input, .sort-select, .status-filter-select {
  background-color: var(--bg-main, #0b0f19);
  border: 1px solid var(--color-border, #334155);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
}

.status-filter-select {
  border-color: var(--color-accent, #eab308);
  color: var(--color-accent, #eab308);
  font-weight: bold;
}

.table-responsive {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  
  th {
    background-color: var(--bg-main, #0b0f19);
    padding: 1.25rem 1rem;
    color: var(--color-text-muted, #94a3b8);
    font-size: 0.9rem;
  }
  
  td {
    padding: 1.25rem 1rem;
    border-bottom: 1px solid var(--color-border, #334155);
    font-size: 0.9rem;
    vertical-align: middle;
    text-align: center;
  }
  
  .text-left { text-align: left; }
}

.title-cell-container {
  max-width: 320px;
}

.main-case-title {
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 0.25rem;
}

.area-badge-text {
  font-size: 0.75rem;
  background: rgba(234, 179, 8, 0.1);
  color: var(--color-accent, #eab308);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  margin-right: 0.5rem;
  font-weight: bold;
}

.core-need-preview {
  font-size: 0.8rem;
  color: var(--color-text-muted, #64748b);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-closed-style {
  background: rgba(30, 41, 59, 0.4);
  td { color: #64748b; }
  .main-case-title { color: #64748b; }
}

.row-hidden-style {
  background: rgba(234, 179, 8, 0.02);
}

.editing-active-row {
  background: rgba(16, 185, 129, 0.08);
}

.btn-case-id-link {
  background: none;
  border: none;
  color: var(--color-accent, #eab308);
  font-weight: bold;
  font-family: monospace;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(234, 179, 8, 0.15);
    color: #fde047;
  }
}

.badge-seller {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
}

.badge-buyer {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
}

.action-buttons {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
}

.btn-action {
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
}

.edit-btn { background: #0ea5e9; color: #fff; }
.close-btn { background: #2563eb; color: #fff; }
.hide-btn { background: #4b5563; color: #fff; }
.restore-btn { background: #d97706; color: #fff; }
.delete-btn {
  background: rgba(220, 38, 38, 0.15);
  color: #ef4444;
  border: 1px solid rgba(220, 38, 38, 0.25);
  
  &:hover {
    background: #dc2626;
    color: #fff;
  }
}

.no-data-text {
  padding: 2rem;
  color: var(--color-text-muted, #64748b);
  font-size: 0.95rem;
}
</style>