<template>
  <div class="admin-container">
    <h2 class="title">三爵資訊 (KQC) - 總覽戰情室</h2>
    
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

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
    const list = await api.get<any>('/cases?isAdmin=true')
    casesList.value = list.data
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
      await api.patch(`/cases/${currentEditingId.value}`, sanitizedPayload)
      alert('🎉 案源內容已順利覆蓋儲存！')
      cancelEditMode()
    } else {
      // 正常全新寫入模式 (保持原有邏輯不變)
      await api.post('/cases', form.value)
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
  await api.patch(`/cases/${id}`, { caseStatus: status })
  refreshData()
}

const deleteCase = async (id: string) => {
  if (confirm('確定永久抹除此機密案源？')) {
    await api.delete(`/cases/${id}`)
    refreshData()
  }
}

// The current dashboard template renders only statistics. Keep the existing
// management callbacks type-checked without executing or exposing them.
void statusTextMap
void filteredAndSortedCases
void openDetailModal
void closeDetailModal
void bringBackToForm
void handleSubmit
void changeStatus
void deleteCase
</script>

<style lang="scss" scoped>
.admin-container { padding: 2rem; max-width: 1200px; margin: 0 auto; background: var(--bg-main); min-height: 100vh; color: var(--bg-main); font-family: sans-serif; }
.title { color: var(--accent); text-align: center; font-weight: bold; margin-bottom: 2rem; }
.stats-dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: var(--primary); border-radius: 12px; padding: 1.5rem; text-align: center; border: 1px solid #334155; }
.circle-progress { width: 70px; height: 70px; border: 4px solid var(--accent); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.form-section { background: var(--primary); padding: 2rem; border-radius: 16px; border: 1px solid #334155; margin-bottom: 2rem; transition: all 0.3s ease; }
.edit-mode-border { border: 2px dashed #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
.form-title-text { font-size: 1.15rem; color: #fff; font-weight: bold; margin-bottom: 1.5rem; border-left: 4px solid var(--accent); padding-left: 0.5rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
.crm-grid { background: rgba(15, 23, 42, 0.4); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--primary); margin-top: 0.5rem; }
.sub-section-title { color: #94a3b8; font-size: 0.9rem; font-weight: bold; margin: 1.5rem 0 0.5rem 0; }
.form-group { display: flex; flex-direction: column; margin-bottom: 1rem; label { font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.5rem; } input, select, textarea { background: var(--bg-main); border: 1px solid #334155; padding: 0.75rem; border-radius: 8px; color: #fff; font-size: 0.9rem; &:focus { border-color: var(--accent); outline: none; } } .disabled-input { opacity: 0.6; cursor: not-allowed; background: var(--primary); } textarea { resize: vertical; } }
.full-width-group { grid-column: 1 / -1; }
.form-actions-buttons { display: flex; gap: 1rem; margin-top: 1.5rem; }
.btn-submit { flex: 1; padding: 1rem; background: var(--accent); color: var(--bg-main); font-weight: bold; border-radius: 8px; border: none; cursor: pointer; font-size: 1rem; transition: background 0.2s; &:hover { background: #ca8a04; } }
.btn-update-mode { background: #10b981; color: #fff; &:hover { background: #059669; } }
.btn-switch-to-add { padding: 1rem 1.5rem; background: rgba(239, 68, 68, 0.15); color: var(--status-alert); font-weight: bold; font-size: 0.95rem; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.2s ease; &:hover { background: var(--status-alert); color: #fff; box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); } }
.management-table-section { background: var(--primary); border-radius: 16px; padding: 2rem; border: 1px solid #334155; }
.table-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
.filter-controls { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.search-input, .sort-select, .status-filter-select { background: var(--bg-main); border: 1px solid #334155; padding: 0.6rem 1rem; border-radius: 8px; color: #fff; font-size: 0.9rem; }
.status-filter-select { border-color: var(--accent); color: var(--accent); font-weight: bold; }
.admin-table { width: 100%; border-collapse: collapse; th { background: var(--bg-main); padding: 1.25rem 1rem; color: #94a3b8; font-size: 0.9rem; }  td { padding: 1.25rem 1rem; border-bottom: 1px solid #334155; font-size: 0.9rem; vertical-align: middle; } .text-left { text-align: left; } }
.title-cell-container { max-width: 320px; }
.main-case-title { font-weight: bold; color: #fff; display: block; margin-bottom: 0.25rem; }
.area-badge-text { font-size: 0.75rem; background: rgba(234, 179, 8, 0.1); color: var(--accent); padding: 0.15rem 0.4rem; border-radius: 4px; margin-right: 0.5rem; font-weight: bold; }
.core-need-preview { font-size: 0.8rem; color: #64748b; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-closed-style { background: rgba(30, 41, 59, 0.4); td { color: #64748b; } .main-case-title { color: #64748b; } }
.row-hidden-style { background: rgba(234, 179, 8, 0.02); }
.btn-case-id-link { background: none; border: none; color: var(--accent); font-weight: bold; font-family: monospace; cursor: pointer; text-decoration: underline; padding: 0.25rem 0.5rem; border-radius: 4px; transition: all 0.2s; &:hover { background: rgba(234, 179, 8, 0.15); color: #fde047; text-shadow: 0 0 8px rgba(234, 179, 8, 0.6); } }
.badge-seller { background: rgba(239, 68, 68, 0.15); color: var(--status-alert); padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }
.badge-buyer { background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }
.action-buttons { display: flex; gap: 0.4rem; justify-content: center; }
.btn-action { padding: 0.45rem 0.75rem; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; font-size: 0.8rem; }
.edit-btn { background: #0ea5e9; color: #fff; }
.close-btn { background: #2563eb; color: #fff; }
.hide-btn { background: #4b5563; color: #fff; }
.restore-btn { background: #d97706; color: #fff; }
.delete-btn { background: rgba(220, 38, 38, 0.15); color: var(--status-alert); border: 1px solid rgba(220, 38, 38, 0.25); &:hover { background: #dc2626; color: #fff; } }

.kqc-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.kqc-modal-content { background: var(--primary); width: 90%; max-width: 650px; border-radius: 16px; border: 1px solid var(--accent); box-shadow: 0 10px 30px rgba(0,0,0,0.5); padding: 1.5rem; }
.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 0.75rem; h3 { color: var(--accent); margin: 0; font-size: 1.1rem; font-weight: bold; } }
.btn-close-modal { background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; &:hover { color: #fff; } }
.modal-body { margin-top: 1rem; max-height: 70vh; overflow-y: auto; }
.detail-modal-table { width: 100%; border-collapse: collapse; th { width: 30%; background: var(--bg-main); color: #94a3b8; text-align: left; padding: 0.75rem 1rem; font-size: 0.85rem; border-bottom: 1px solid var(--primary); } td { background: #131d31; color: var(--bg-main); padding: 0.75rem 1rem; text-align: left; font-size: 0.9rem; border-bottom: 1px solid var(--primary); } .crm-section-row th { background: rgba(234, 179, 8, 0.1); color: var(--accent); } .crm-section-row td { background: rgba(234, 179, 8, 0.03); } .text-white { color: #fff; } .text-gray-desc { color: #cbd5e1; font-size: 0.85rem; line-height: 1.4; } .text-green-desc { color: #34d399; font-weight: bold; } }
.modal-footer { margin-top: 1.5rem; display: flex; justify-content: flex-end; }
.btn-modal-done { padding: 0.75rem 1.5rem; background: var(--accent); color: var(--bg-main); font-weight: bold; border-radius: 6px; border: none; cursor: pointer; &:hover { background: #ca8a04; } }
/* 🟢 採用語意變數，自動響應明暗切換 */
.dashboard-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  .card-title {
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .count {
    color: var(--brand-primary); // 採用琥珀璀璨金高亮
    font-size: 1.75rem;
    font-weight: 700;
  }
}
</style>
