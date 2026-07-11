<template>
  <div class="admin-container">
    <h2 class="title">三爵資訊 (KQC) - 全端智慧控制台戰情室</h2>
    
    <!-- 1. 實時供需晴雨窗看板 -->
    <div class="stats-dashboard">
      <div class="stat-card">
        <h3>📊 供需晴雨窗 (買家比例)</h3>
        <div class="circle-progress">
          <span class="ratio-text">{{ computedStats.demandRatio }}%</span>
        </div>
      </div>
      <div class="stat-card">
        <h3>🟥 出讓賣方 (供應)</h3>
        <p class="stat-num text-red-400">{{ computedStats.sellerCount }} 筆</p>
      </div>
      <div class="stat-card">
        <h3>🟩 購買接收請求 (需求)</h3>
        <p class="stat-num text-green-400">{{ computedStats.buyerCount }} 筆</p>
      </div>
    </div>

    <!-- 2. 大一統萬用表單區域（支援「新增案源」與「反向帶回修改」雙模式） -->
    <div class="form-section" :class="{ 'edit-mode-border': isEditMode }">
      <h3 class="form-title-text">
        {{ isEditMode ? '✏️ 正在修改案件：' + form.caseId : '🚀 新增智慧案源櫥窗' }}
      </h3>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label>案件編號（連動生成）：</label>
            <input v-model="form.caseId" type="text" disabled class="disabled-input" />
          </div>
          <div class="form-group">
            <label>案件標題：</label>
            <input v-model="form.title" type="text" placeholder="例如: 隊長創業：貨櫃貨運業" required />
          </div>
          <div class="form-group">
            <label>案件性質：</label>
            <select v-model="form.caseType" @change="updateCaseId" :disabled="isEditMode">
              <option value="seller">讓渡出讓 (Seller)</option>
              <option value="buyer">尋求買收 (Buyer)</option>
            </select>
          </div>
          <div class="form-group">
            <label>資產分類：</label>
            <select v-model="form.leaseType" @change="updateCaseId" :disabled="isEditMode">
              <option value="甲種小客車">甲種小客車 (CA)</option>
              <option value="乙種小客車">乙種小客車 (CB)</option>
              <option value="計程車">計程車 (TX)</option>
              <option value="小貨車">小貨車 (LT)</option>
              <option value="搬家公司">搬家公司 (MV)</option>
              <option value="汽車貨運">汽車貨運 (FT)</option>
              <option value="貨櫃貨運">貨櫃貨運 (CT)</option>
            </select>
          </div>
          <!-- 💡 核心優化點 1：補上區域下拉選單，完全對齊資料庫與前台卡片的需求，解除修改時的必填驗證失敗錯誤 -->
          <div class="form-group">
            <label>區域分類：</label>
            <select v-model="form.targetArea">
              <option value="北部地區">北部地區</option>
              <option value="中部地區">中部地區</option>
              <option value="南部地區">南部地區</option>
              <option value="東部地區">東部地區</option>
            </select>
          </div>
          <div class="form-group">
            <label>公司類型：</label>
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

        <div class="form-group full-width-group">
          <label>核心需求與體質背景描述（前台精選櫥窗呈現）：</label>
          <textarea 
            v-model="form.coreNeed" 
            rows="3" 
            placeholder="請輸入公司體質描述與債務背景限制..."
            required
          ></textarea>
        </div>

        <h4 class="sub-section-title">🔒 後臺 CRM 企業機密個資（前台自動遮蔽物理隔離）</h4>
        <div class="form-grid crm-grid">
          <div class="form-group">
            <label>客戶真實公司名稱：</label>
            <input v-model="form.crmData.clientCompany" type="text" placeholder="真實行號公司" required />
          </div>
          <div class="form-group">
            <label>客戶聯絡負責人：</label>
            <input v-model="form.crmData.clientName" type="text" placeholder="老闆或窗口姓名" required />
          </div>
          <div class="form-group">
            <label>負責人行動電話：</label>
            <input v-model="form.crmData.clientMobile" type="text" placeholder="09xx-xxx-xxx" />
          </div>
          <div class="form-group">
            <label>內部業務追蹤備註：</label>
            <input v-model="form.crmData.internalNotes" type="text" placeholder="僅限後台業務查閱的內部備註" />
          </div>
        </div>

        <div class="form-actions-buttons">
          <template v-if="isEditMode">
            <button type="submit" class="btn-submit btn-update-mode">💾 確定並覆蓋雲端庫</button>
            <button type="button" @click="cancelEditMode" class="btn-switch-to-add">✨ 放棄修改，切換回全新新增</button>
          </template>
          <template v-else>
            <button type="submit" class="btn-submit">🚀 確認寫入 MongoDB 雲端庫</button>
          </template>
        </div>
      </form>
    </div>

    <!-- 3. 下方戰情室大數據清單區域 -->
    <div class="management-table-section">
      <div class="table-toolbar">
        <h3 class="section-subtitle">📋 全站案件即時維護清單</h3>
        <div class="filter-controls">
          <select v-model="filterStatus" class="status-filter-select">
            <option value="all">🌐 檢視：全部案源</option>
            <option value="selling">🟢 檢視：銷售中</option>
            <option value="preparation">🟡 檢視：草稿隱藏</option>
            <option value="closed">🏁 檢視：配對結案 (歷史歷史區)</option>
          </select>
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
            <tr v-for="item in filteredAndSortedCases" :key="item._id" :class="{ 'row-closed-style': item.caseStatus === 'closed', 'row-hidden-style': item.caseStatus === 'preparation', 'editing-active-row': currentEditingId === item._id }">
              <td>
                <button type="button" @click="openDetailModal(item)" class="btn-case-id-link">
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
                <button v-if="item.caseStatus !== 'closed'" @click="bringBackToForm(item)" class="btn-action edit-btn">✏️ 修改</button>
                <button v-if="item.caseStatus === 'selling'" @click="changeStatus(item._id, 'closed')" class="btn-action close-btn">🤝 結案</button>
                <button v-if="item.caseStatus === 'selling'" @click="changeStatus(item._id, 'preparation')" class="btn-action hide-btn">👁️ 隱藏</button>
                <button v-if="item.caseStatus === 'preparation'" @click="changeStatus(item._id, 'selling')" class="btn-action restore-btn">🚀 上架</button>
                <button @click="deleteCase(item._id)" class="btn-action delete-btn">🗑️ 刪除</button>
              </td>
            </tr>
            <tr v-if="filteredAndSortedCases.length === 0">
              <td colspan="7" class="no-data-text">📭 當前篩選條件下無歷史案源數據</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 詳情查看彈窗 (Modal) -->
    <div v-if="isModalOpen" class="kqc-modal-overlay" @click.self="closeDetailModal">
      <div class="kqc-modal-content">
        <div class="modal-header">
          <h3>🔒 案件完整機密檔案查閱庫 (KQC-Internal)</h3>
          <button @click="closeDetailModal" class="btn-close-modal">✖</button>
        </div>
        <div class="modal-body">
          <table class="detail-modal-table">
            <!-- 💡 核心優化點 2：補上 <tbody> 解決 Vite 控制台 tr child of table 結構錯誤警告 -->
            <tbody>
              <tr>
                <th>案件編號 / 狀態</th>
                <td><span class="text-gold">{{ activeDetail.caseId }}</span> / {{ statusTextMap[activeDetail.caseStatus] }}</td>
              </tr>
              <tr>
                <th>案件標題 / 區域地區</th>
                <td class="text-white font-bold">{{ activeDetail.title }} / 📍 {{ activeDetail.targetArea }}</td>
              </tr>
              <tr>
                <th>性質 / 車種分類</th>
                <td>{{ activeDetail.caseType === 'seller' ? '🟥 出讓 (Seller)' : '🟩 買收 (Buyer)' }} / {{ activeDetail.leaseType }} ({{ activeDetail.companyType }})</td>
              </tr>
              <tr>
                <th>資本額 / 交易金額</th>
                <td>資本額: {{ activeDetail.capitalAmount }} 萬 / 預算金額: {{ activeDetail.price === 0 ? '電議' : activeDetail.price + ' 萬' }}</td>
              </tr>
              <tr>
                <th>前台精選櫥窗內文</th>
                <td class="text-gray-desc">{{ activeDetail.coreNeed }}</td>
              </tr>
              <tr class="crm-section-row">
                <th>CRM 客戶公司名稱</th>
                <td class="text-gold font-bold">{{ activeDetail.crmData?.clientCompany || '未填寫' }}</td>
              </tr>
              <tr class="crm-section-row">
                <th>CRM 聯絡負責人</th>
                <td>{{ activeDetail.crmData?.clientName || '未填寫' }}</td>
              </tr>
              <tr class="crm-section-row">
                <th>CRM 負責人電話</th>
                <td>{{ activeDetail.crmData?.clientMobile || '未填寫' }}</td>
              </tr>
              <tr class="crm-section-row">
                <th>內部專屬業務備註</th>
                <td class="text-green-desc">{{ activeDetail.crmData?.internalNotes || '無內部備註' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn-modal-done">關閉隱私查閱視窗</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const casesList = ref<any[]>([])
const searchQuery = ref('')
const sortBy = ref('newest')
const filterStatus = ref('all')

const isEditMode = ref(false)
const currentEditingId = ref<string | null>(null)

const isModalOpen = ref(false)
const activeDetail = ref<any>({})

const statusTextMap: Record<string, string> = {
  'selling': '🟢 銷售中', 'preparation': '草稿隱藏', 'closed': '🏁 配對結案'
}

const getBlankForm = () => ({
  caseId: '', caseType: 'seller', title: '', leaseType: '汽車貨運',
  targetArea: '北部地區', // 💡 默認值防呆
  companyType: '有限公司', capitalAmount: 0, price: 0, caseStatus: 'selling', 
  coreNeed: '', 
  crmData: { clientCompany: '', clientName: '', clientMobile: '', internalNotes: '' }
})

const form = ref(getBlankForm())

const computedStats = computed(() => {
  const activeCases = casesList.value.filter(i => i.caseStatus === 'selling')
  const sellerCount = activeCases.filter(i => i.caseType === 'seller').length
  const buyerCount = activeCases.filter(i => i.caseType === 'buyer').length
  const total = sellerCount + buyerCount
  const demandRatio = total === 0 ? 50 : Math.round((buyerCount / total) * 100);
  return { sellerCount, buyerCount, demandRatio }
})

const assetCodeMap: Record<string, string> = {
  '甲種小客車': 'CA', '乙種小客車': 'CB', '計程車': 'TX', '小貨車': 'LT', '搬家公司': 'MV', '汽車貨運': 'FT', '貨櫃貨運': 'CT'
}

const updateCaseId = () => {
  if (isEditMode.value) return 
  const now = new Date()
  const year = String(now.getFullYear()).slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const randomSerial = String(Math.floor(10 + Math.random() * 90))
  const typeLetter = form.value.caseType === 'seller' ? 'S' : 'B'
  const assetCode = assetCodeMap[form.value.leaseType] || 'FT'
  form.value.caseId = `KQC-${typeLetter}${assetCode}${year}${month}${randomSerial}`
}

const refreshData = async () => {
  try {
    const list = await axios.get('http://localhost:3000/api/cases?isAdmin=true')
    casesList.value = list.data.data
  } catch (err) {
    console.error('API 串接異常:', err)
  }
}

onMounted(() => {
  updateCaseId()
  refreshData()
})

const filteredAndSortedCases = computed(() => {
  let result = [...casesList.value]
  if (filterStatus.value !== 'all') {
    result = result.filter(i => i.caseStatus === filterStatus.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i => i.title.toLowerCase().includes(q) || i.caseId.toLowerCase().includes(q) || (i.coreNeed && i.coreNeed.toLowerCase().includes(q)))
  }
  result.sort((a, b) => sortBy.value === 'newest' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  return result
})

const openDetailModal = (item: any) => {
  activeDetail.value = item
  isModalOpen.value = true
}
const closeDetailModal = () => {
  isModalOpen.value = false
  activeDetail.value = {}
}

const bringBackToForm = (item: any) => {
  isEditMode.value = true
  currentEditingId.value = item._id 
  form.value = {
    caseId: item.caseId,
    caseType: item.caseType,
    title: item.title,
    leaseType: item.leaseType,
    targetArea: item.targetArea || '北部地區', // 🌟 將原有區域資料帶回表單
    companyType: item.companyType,
    capitalAmount: item.capitalAmount,
    price: item.price,
    caseStatus: item.caseStatus,
    coreNeed: item.coreNeed || '', 
    crmData: item.crmData ? { ...item.crmData } : { clientCompany: '', clientName: '', clientMobile: '', internalNotes: '' }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEditMode = () => {
  isEditMode.value = false
  currentEditingId.value = null
  form.value = getBlankForm()
  updateCaseId()
}

const handleSubmit = async () => {
  try {
    if (isEditMode.value && currentEditingId.value) {
      // =========================================================================
      // 🔒 KQC 企業級資安防禦：修改模式資料深度清洗（Sanitization）
      // =========================================================================
      // 💡 核心關鍵：我們絕對不能把 _id、caseId 發送給後端做 $set 覆蓋，否則 MongoDB 會噴錯。
      // 我們只提取管理員「允許修改」的動態業務欄位，這才是最乾淨、具備可維護性的作法！
      const sanitizedPayload = {
        title: form.value.title,
        companyType: form.value.companyType,
        capitalAmount: Number(form.value.capitalAmount),
        price: Number(form.value.price),
        caseStatus: form.value.caseStatus,
        coreNeed: form.value.coreNeed, // 補回消失的詳細內文
        targetArea: form.value.targetArea, // 補回消失的區域必填限制
        crmData: {
          clientCompany: form.value.crmData.clientCompany,
          clientName: form.value.crmData.clientName,
          clientMobile: form.value.crmData.clientMobile,
          internalNotes: form.value.crmData.internalNotes
        }
      }

      // 🌐 血管 3：透過 PATCH 動脈，精準傳送清洗後的乾淨包裹
      await axios.patch(`http://localhost:3000/api/cases/${currentEditingId.value}`, sanitizedPayload)
      alert('🎉 案源內容已順利覆蓋儲存！')
      cancelEditMode()
    } else {
      // 正常全新寫入模式 (保持原有邏輯不變)
      await axios.post('http://localhost:3000/api/cases', form.value)
      alert('🎉 全新案源資料已成功寫入 MongoDB 雲端庫！')
      form.value = getBlankForm()
      updateCaseId()
    }
    refreshData()
  } catch (err: any) {
    if (isEditMode.value) {
      alert(`❌ 案源更新覆蓋失敗！請檢查後端執行狀態。`)
    } else {
      alert(`❌ 全新案源資料新增失敗！請確認 API Server 與資料庫連線。`)
    }
    console.error('KQC-Debug-Log:', err)
  }
}

const changeStatus = async (id: string, status: string) => {
  await axios.patch(`http://localhost:3000/api/cases/${id}`, { caseStatus: status })
  refreshData()
}

const deleteCase = async (id: string) => {
  if (confirm('確定永久抹除此機密案源？')) {
    await axios.delete(`http://localhost:3000/api/cases/${id}`)
    refreshData()
  }
}
</script>

<style lang="scss" scoped>
.admin-container { padding: 2rem; max-width: 1200px; margin: 0 auto; background: #0b0f19; min-height: 100vh; color: #f8fafc; font-family: sans-serif; }
.title { color: #eab308; text-align: center; font-weight: bold; margin-bottom: 2rem; }
.stats-dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: #1e293b; border-radius: 12px; padding: 1.5rem; text-align: center; border: 1px solid #334155; }
.circle-progress { width: 70px; height: 70px; border: 4px solid #eab308; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.form-section { background: #1e293b; padding: 2rem; border-radius: 16px; border: 1px solid #334155; margin-bottom: 2rem; transition: all 0.3s ease; }
.edit-mode-border { border: 2px dashed #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
.form-title-text { font-size: 1.15rem; color: #fff; font-weight: bold; margin-bottom: 1.5rem; border-left: 4px solid #eab308; padding-left: 0.5rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
.crm-grid { background: rgba(15, 23, 42, 0.4); padding: 1.25rem; border-radius: 12px; border: 1px solid #1e293b; margin-top: 0.5rem; }
.sub-section-title { color: #94a3b8; font-size: 0.9rem; font-weight: bold; margin: 1.5rem 0 0.5rem 0; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; label { font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.5rem; } input, select, textarea { background: #0b0f19; border: 1px solid #334155; padding: 0.75rem; border-radius: 8px; color: #fff; font-size: 0.9rem; &:focus { border-color: #eab308; outline: none; } } .disabled-input { opacity: 0.6; cursor: not-allowed; background: #1e293b; } textarea { resize: vertical; } }
.full-width-group { grid-column: 1 / -1; }
.form-actions-buttons { display: flex; gap: 1rem; margin-top: 1.5rem; }
.btn-submit { flex: 1; padding: 1rem; background: #eab308; color: #0b0f19; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; font-size: 1rem; transition: background 0.2s; &:hover { background: #ca8a04; } }
.btn-update-mode { background: #10b981; color: #fff; &:hover { background: #059669; } }
.btn-switch-to-add { padding: 1rem 1.5rem; background: rgba(239, 68, 68, 0.15); color: #ef4444; font-weight: bold; font-size: 0.95rem; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s ease; &:hover { background: #ef4444; color: #fff; box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); } }
.management-table-section { background: #1e293b; border-radius: 16px; padding: 2rem; border: 1px solid #334155; }
.table-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
.filter-controls { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.search-input, .sort-select, .status-filter-select { background: #0b0f19; border: 1px solid #334155; padding: 0.6rem 1rem; border-radius: 8px; color: #fff; font-size: 0.9rem; }
.status-filter-select { border-color: #eab308; color: #eab308; font-weight: bold; }
.admin-table { width: 100%; border-collapse: collapse; th { background: #0b0f19; padding: 1.25rem 1rem; color: #94a3b8; font-size: 0.9rem; }  td { padding: 1.25rem 1rem; border-bottom: 1px solid #334155; font-size: 0.9rem; vertical-align: middle; } .text-left { text-align: left; } }
.title-cell-container { max-width: 320px; }
.main-case-title { font-weight: bold; color: #fff; display: block; margin-bottom: 0.25rem; }
.area-badge-text { font-size: 0.75rem; background: rgba(234, 179, 8, 0.1); color: #eab308; padding: 0.15rem 0.4rem; border-radius: 4px; margin-right: 0.5rem; font-weight: bold; }
.core-need-preview { font-size: 0.8rem; color: #64748b; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-closed-style { background: rgba(30, 41, 59, 0.4); td { color: #64748b; } .main-case-title { color: #64748b; } }
.row-hidden-style { background: rgba(234, 179, 8, 0.02); }
.btn-case-id-link { background: none; border: none; color: #eab308; font-weight: bold; font-family: monospace; cursor: pointer; text-decoration: underline; padding: 0.25rem 0.5rem; border-radius: 4px; transition: all 0.2s; &:hover { background: rgba(234, 179, 8, 0.15); color: #fde047; text-shadow: 0 0 8px rgba(234, 179, 8, 0.6); } }
.badge-seller { background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }
.badge-buyer { background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }
.action-buttons { display: flex; gap: 0.4rem; justify-content: center; }
.btn-action { padding: 0.45rem 0.75rem; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; font-size: 0.8rem; }
.edit-btn { background: #0ea5e9; color: #fff; }
.close-btn { background: #2563eb; color: #fff; }
.hide-btn { background: #4b5563; color: #fff; }
.restore-btn { background: #d97706; color: #fff; }
.delete-btn { background: rgba(220, 38, 38, 0.15); color: #ef4444; border: 1px solid rgba(220, 38, 38, 0.25); &:hover { background: #dc2626; color: #fff; } }

.kqc-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.kqc-modal-content { background: #1e293b; width: 90%; max-width: 650px; border-radius: 16px; border: 1px solid #eab308; box-shadow: 0 10px 30px rgba(0,0,0,0.5); padding: 1.5rem; }
.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 0.75rem; h3 { color: #eab308; margin: 0; font-size: 1.1rem; font-weight: bold; } }
.btn-close-modal { background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; &:hover { color: #fff; } }
.modal-body { margin-top: 1rem; max-height: 70vh; overflow-y: auto; }
.detail-modal-table { width: 100%; border-collapse: collapse; th { width: 30%; background: #0b0f19; color: #94a3b8; text-align: left; padding: 0.75rem 1rem; font-size: 0.85rem; border-bottom: 1px solid #1e293b; } td { background: #131d31; color: #f8fafc; padding: 0.75rem 1rem; text-align: left; font-size: 0.9rem; border-bottom: 1px solid #1e293b; } .crm-section-row th { background: rgba(234, 179, 8, 0.1); color: #eab308; } .crm-section-row td { background: rgba(234, 179, 8, 0.03); } .text-white { color: #fff; } .text-gray-desc { color: #cbd5e1; font-size: 0.85rem; line-height: 1.4; } .text-green-desc { color: #34d399; font-weight: bold; } }
.modal-footer { margin-top: 1.5rem; display: flex; justify-content: flex-end; }
.btn-modal-done { padding: 0.75rem 1.5rem; background: #eab308; color: #0b0f19; font-weight: bold; border-radius: 6px; border: none; cursor: pointer; &:hover { background: #ca8a04; } }
</style>