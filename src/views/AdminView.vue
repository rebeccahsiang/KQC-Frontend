<template>
  <div class="admin-container">
    <h2 class="title">三瑝資訊 (KQJ) - 全端智慧控制台戰情室</h2>
    
    <!-- 1. 實時供需晴雨窗看板 -->
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

    <!-- 2. 大一統萬用案件新增表單 -->
    <form @submit.prevent="handleSubmit" class="form-section">
      <div class="form-grid">
        <div class="form-group">
          <label>案件編號（自動連動）：</label>
          <input v-model="form.caseId" type="text" disabled class="disabled-input" />
        </div>
        <div class="form-group">
          <label>案件標題：</label>
          <input v-model="form.title" type="text" placeholder="例如: 隊長創業：貨櫃貨運業" required />
        </div>
        <div class="form-group">
          <label>案件性質：</label>
          <slot name="caseTypeSelect">
            <!-- ⚡ 重點：@change="updateCaseId" 確保買賣切換時，首碼 S/B 即時變動 -->
            <select v-model="form.caseType" @change="updateCaseId">
              <option value="seller">讓渡出讓 (Seller)</option>
              <option value="buyer">尋求買收 (Buyer)</option>
            </select>
          </slot>
        </div>
        <div class="form-group">
          <label>資產分類：</label>
          <!-- ⚡ 重點：@change="updateCaseId" 確保車種切換時，縮寫（FT、TX）即時變動 -->
          <select v-model="form.leaseType" @change="updateCaseId">
            <option value="甲種小客車">甲種小客車 (CA)</option>
            <option value="乙種小客車">乙種小客車 (CB)</option>
            <option value="計程車">計程車 (TX)</option>
            <option value="小貨車">小貨車 (LT)</option>
            <option value="搬家公司">搬家公司 (MV)</option>
            <option value="汽車貨運">汽車貨運 (FT)</option>
            <option value="貨櫃貨運">貨櫃貨運 (CT)</option>
          </select>
        </div>
        <div class="form-group">
          <label>公司類型（預設值保護）：</label>
          <select v-model="form.companyType">
            <option value="有限公司">有限公司</option>
            <option value="股份有限公司">股份有限公司</option>
            <option value="車行">車行</option>
          </select>
        </div>
        <div class="form-group">
          <label>資本額 (萬NT，0代表不限)：</label>
          <input v-model.number="form.capitalAmount" type="number" min="0" required />
        </div>
        <div class="form-group">
          <label>金額 (萬NT，0代表不限/電議)：</label>
          <input v-model.number="form.price" type="number" min="0" required />
        </div>
        <div class="form-group">
          <label>上架初始狀態：</label>
          <select v-model="form.caseStatus">
            <option value="selling">🚀 直接公開發布</option>
            <option value="preparation">📝 暫存為草稿隱藏</option>
          </select>
        </div>
      </div>
      <button type="submit" class="btn-submit">🚀 確認寫入 MongoDB 雲端庫</button>
    </form>

    <!-- 3. 下方戰情室大數據清單 -->
    <div class="management-table-section">
      <div class="table-toolbar">
        <h3 class="section-subtitle">📋 全站案件實時維護清單</h3>
        <div class="filter-controls">
          <input v-model="searchQuery" type="text" placeholder="🔍 輸入標題、編號搜尋..." class="search-input" />
          <select v-model="sortBy" class="sort-select">
            <option value="newest">📅 時間：由新到舊</option>
            <option value="oldest">📅 時間：由舊到新</option>
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
              <th>權限操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredAndSortedCases" :key="item._id" :class="{ 'closed-row': item.caseStatus === 'closed' }">
              <td class="font-mono text-gold">{{ item.caseId }}</td>
              <td>{{ item.caseType === 'seller' ? '🟥 出讓' : '🟩 買收' }}</td>
              <td class="text-left">{{ item.title }}</td>
              <td>{{ item.leaseType }}</td>
              <td>{{ item.price === 0 ? '不限' : item.price + '萬' }}</td>
              <td>{{ statusTextMap[item.caseStatus] }}</td>
              <td class="action-buttons">
                <button v-if="item.caseStatus === 'selling'" @click="changeStatus(item._id, 'closed')" class="btn-action close-btn">🤝 結案</button>
                <button v-if="item.caseStatus === 'selling'" @click="changeStatus(item._id, 'preparation')" class="btn-action hide-btn">👁️ 隱藏</button>
                <button v-if="item.caseStatus === 'preparation'" @click="changeStatus(item._id, 'selling')" class="btn-action show-btn">🚀 上架</button>
                <button @click="deleteCase(item._id)" class="btn-action delete-btn">🗑️ 刪除</button>
              </td>
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

// 狀態管理
const casesList = ref<any[]>([])
const searchQuery = ref('')
const sortBy = ref('newest')
const stats = ref({ sellerCount: 0, buyerCount: 0, demandRatio: 50 })

const statusTextMap: Record<string, string> = {
  'selling': '🟢 銷售中', 'preparation': '🟡 草稿隱藏', 'closed': '🏁 配對結案'
}

const form = ref({
  caseId: '', caseType: 'seller', title: '', leaseType: '汽車貨運',
  companyType: '有限公司', capitalAmount: 0, price: 0, caseStatus: 'selling', crmData: { clientCompany: '測試行', clientName: '負責人', clientPhone: '02-222' }
})

// ⚡ 業界黃金原則：前後端分離的動態編碼生成器
const assetCodeMap: Record<string, string> = {
  '甲種小客車': 'CA', '乙種小客車': 'CB', '計程車': 'TX', '小貨車': 'LT', '搬家公司': 'MV', '汽車貨運': 'FT', '貨櫃貨運': 'CT'
}

const updateCaseId = () => {
  const now = new Date()
  const year = String(now.getFullYear()).slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const randomSerial = String(Math.floor(10 + Math.random() * 90))
  const typeLetter = form.value.caseType === 'seller' ? 'S' : 'B'
  const assetCode = assetCodeMap[form.value.leaseType] || 'FT'
  form.value.caseId = `KQC-${typeLetter}${assetCode}${year}${month}${randomSerial}`
}

// 實時更新晴雨窗與數據桌
const refreshData = async () => {
  try {
    const list = await axios.get('http://localhost:3000/api/cases')
    casesList.value = list.data.data
    const statRes = await axios.get('http://localhost:3000/api/cases/stats/supply-demand')
    stats.value = statRes.data
  } catch (err) {
    console.error('API 血管同步失敗:', err)
  }
}

onMounted(() => {
  updateCaseId()
  refreshData()
})

const filteredAndSortedCases = computed(() => {
  let result = [...casesList.value]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i => i.title.toLowerCase().includes(q) || i.caseId.toLowerCase().includes(q))
  }
  result.sort((a, b) => sortBy.value === 'newest' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  return result
})

const handleSubmit = async () => {
  try {
    await axios.post('http://localhost:3000/api/cases', form.value)
    alert('🎉 資料成功寫入雲端庫！')
    refreshData()
  } catch (err) {
    alert('寫入失敗，請確認後端運行狀態')
  }
}

const changeStatus = async (id: string, status: string) => {
  await axios.patch(`http://localhost:3000/api/cases/${id}`, { caseStatus: status })
  refreshData()
}

const deleteCase = async (id: string) => {
  if (confirm('確定抹除此機密案源？')) {
    await axios.delete(`http://localhost:3000/api/cases/${id}`)
    refreshData()
  }
}
</script>

<style lang="scss" scoped>
/* 💡 SCSS 修正：使用符合 W3C 標準的 rgba 與全域色彩規劃 */
.admin-container { padding: 2rem; max-width: 1200px; margin: 0 auto; background: #0b0f19; min-height: 100vh; color: #f8fafc; }
.title { color: #eab308; text-align: center; font-weight: bold; margin-bottom: 2rem; }
.stats-dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: #1e293b; border-radius: 12px; padding: 1.5rem; text-align: center; border: 1px solid #334155; }
.circle-progress { width: 70px; height: 70px; border: 4px solid #eab308; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.form-section { background: #1e293b; padding: 2rem; border-radius: 16px; border: 1px solid #334155; margin-bottom: 2rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
.form-group { display: flex; flex-direction: column; label { font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.5rem; } input, select { background: #0b0f19; border: 1px solid #334155; padding: 0.75rem; border-radius: 8px; color: #fff; } .disabled-input { opacity: 0.6; cursor: not-allowed; } }
.btn-submit { width: 100%; margin-top: 1.5rem; padding: 1rem; background: #eab308; color: #0b0f19; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; &:hover { background: #ca8a04; } }
.management-table-section { background: #1e293b; border-radius: 16px; padding: 2rem; border: 1px solid #334155; }
.table-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
.search-input, .sort-select { background: #0b0f19; border: 1px solid #334155; padding: 0.5rem 1rem; border-radius: 8px; color: #fff; }
.admin-table { width: 100%; border-collapse: collapse; th { background: #0b0f19; padding: 1rem; color: #94a3b8; } td { padding: 1rem; border-bottom: 1px solid #334155; } }
.text-gold { color: #eab308; }
.closed-row { opacity: 0.4; }
.action-buttons { display: flex; gap: 0.5rem; justify-content: center; }
.btn-action { padding: 0.4rem 0.7rem; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; }
.close-btn { background: #2563eb; color: #fff; }
.hide-btn { background: #4b5563; color: #fff; }
.show-btn { background: #d97706; color: #fff; }
/* 💡 重點樣式除錯：使用符合 SCSS 標準的 rgba 宣告，避開除法衝突 */
.delete-btn { background: rgba(220, 38, 38, 0.2); color: #ef4444; border: 1px solid rgba(220, 38, 38, 0.3); &:hover { background: #dc2626; color: #fff; } }
</style>