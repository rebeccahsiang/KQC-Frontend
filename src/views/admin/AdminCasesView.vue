<script setup>
import { ref, computed, onMounted } from 'vue'

// --- 狀態宣告 (State Management) ---
const isLoading = ref(false)
const searchQuery = ref('')
const selectedType = ref('all')
const selectedStatus = ref('all')

// 模擬符合 MongoDB BSON 結構與後端 API 傳回之案件資料
const cases = ref([
  {
    _id: '65f8a1b2c3d4e5f6a7b8c9d1',
    case_number: 'KQC-2026-001',
    case_type: 'buyer_request',
    title: '控股公司指定收購委託：甲種運輸業牌照',
    details: {
      target_area: '北部地區',
      capital_amount: 5000000,
      requirement_core: '誠意尋求優質甲種運輸業者，洽談 100% 股權收購，需含完整營業用車牌與車位證明。'
    },
    crmData: {
      client_name: '張董事長 (機密保密中)',
      contact_phone: '0912-***-***',
      private_note: '客戶具備強烈資產變現意願，評估具高度促成機會。'
    },
    ai_analysis: {
      sentiment: 'negative',
      confidence_score: 0.94,
      positive_intent: '客戶營運調整，有強烈『誠意出售資產與圓滿退場』急迫需求，建議最高優先級拜訪。'
    },
    status: 'active',
    created_at: '2026-08-01 10:30'
  },
  {
    _id: '65f8a1b2c3d4e5f6a7b8c9d2',
    case_number: 'KQC-2026-002',
    case_type: 'seller_listing',
    title: '精選待售：新竹科學園區物流特許經營權與 12 輛重型大貨車資產',
    details: {
      target_area: '竹苗地區',
      capital_amount: 18000000,
      requirement_core: '含獨家車隊營運執照與既有長約合約轉讓，接手即可營運。'
    },
    crmData: {
      client_name: '李總經理',
      contact_phone: '0988-***-***',
      private_note: '公司擬進行跨國供應鏈轉型，資產盤點完畢。'
    },
    ai_analysis: {
      sentiment: 'positive',
      confidence_score: 0.88,
      positive_intent: '資產產權清晰，賣方態度極佳，可快速安排雙方簽署 NDA 與展示戰情數據。'
    },
    status: 'active',
    created_at: '2026-08-05 14:15'
  }
])

// --- 戰情室 KPI 數據運算 (Computed KPIs) ---
const totalActiveCases = computed(() => cases.value.filter(c => c.status === 'active').length)
const totalCapitalVolume = computed(() => {
  const sum = cases.value.reduce((acc, c) => acc + (c.details.capital_amount || 0), 0)
  return (sum / 10000).toLocaleString() + ' 萬'
})
const highPriorityAiAlerts = computed(() => 
  cases.value.filter(c => c.ai_analysis?.sentiment === 'negative').length
)

// --- 篩選邏輯 ---
const filteredCases = computed(() => {
  return cases.value.filter(item => {
    const matchQuery = item.title.includes(searchQuery.value) || item.case_number.includes(searchQuery.value)
    const matchType = selectedType.value === 'all' || item.case_type === selectedType.value
    const matchStatus = selectedStatus.value === 'all' || item.status === selectedStatus.value
    return matchQuery && matchType && matchStatus
  })
})

// --- API 操作方法 (Axios / Store Integration) ---
const fetchCases = async () => {
  isLoading.value = true
  try {
    // 實務串接：const response = await axios.get('/api/admin/cases')
    // cases.value = response.data
  } catch (error) {
    console.error('Data Fetch Error:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleCaseStatus = async (caseItem) => {
  const newStatus = caseItem.status === 'active' ? 'completed' : 'active'
  caseItem.status = newStatus
  // 實務串接：await axios.patch(`/api/cases/${caseItem._id}`, { status: newStatus })
}

const triggerLineBroadcast = async (caseItem) => {
  alert(`[LINE Bot 搶單推播] 已成功將案件 #${caseItem.case_number} 推播至三爵特許業務核心群組！`)
  // 實務串接：await axios.post('/api/line/broadcast', { caseId: caseItem._id })
}

onMounted(() => {
  fetchCases()
})
</script>

<template>
  <div class="war-room-container">
    <!-- 頂部戰情室抬頭 -->
    <header class="war-room-header">
      <div class="title-group">
        <h1 class="glitch-title">黑曜石戰情室 <span class="badge-live">LIVE</span></h1>
        <p class="subtitle">B2B 特許資產交易與 AI 語意監控中心</p>
      </div>
      <div class="action-group">
        <button class="btn-cta">+ 新增資產案件</button>
      </div>
    </header>

    <!-- KPI 數據卡牌 (70/25/5 配色比重架構) -->
    <section class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">全站撮合中案件</span>
        <div class="kpi-value text-gold">{{ totalActiveCases }} <span class="unit">件</span></div>
        <div class="kpi-footer">系統實時連線中</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">線上案件總資本額</span>
        <div class="kpi-value">{{ totalCapitalVolume }}</div>
        <div class="kpi-footer">估算交易規模</div>
      </div>
      <div class="kpi-card danger-border">
        <span class="kpi-label">AI 焦慮/高優先介入警示</span>
        <div class="kpi-value text-danger">{{ highPriorityAiAlerts }} <span class="unit">急件</span></div>
        <div class="kpi-footer text-danger">情緒轉化模組自動標示</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">LINE Bot 聯防狀態</span>
        <div class="kpi-value text-success">100%</div>
        <div class="kpi-footer">Webhook 正常運作</div>
      </div>
    </section>

    <!-- 控制面板與搜尋過濾 -->
    <section class="control-panel">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜尋案件編號、亮點關鍵字..." 
          class="input-dark"
        />
      </div>
      <div class="filter-group">
        <select v-model="selectedType" class="select-dark">
          <option value="all">全部案件類型</option>
          <option value="buyer_request">誠意買家 (Buyer)</option>
          <option value="seller_listing">精選待售 (Seller)</option>
        </select>
        <select v-model="selectedStatus" class="select-dark">
          <option value="all">全部狀態</option>
          <option value="active">仲介中 (Active)</option>
          <option value="completed">已結案 (Completed)</option>
        </select>
      </div>
    </section>

    <!-- 數據列表 (Data Table / Grid) -->
    <section class="table-container">
      <table class="war-room-table">
        <thead>
          <tr>
            <th>案件編號 / 類型</th>
            <th>資產亮點與需求描述</th>
            <th>AI 語意轉化與情緒分析</th>
            <th>CRM 保密過濾</th>
            <th>金額 / 區域</th>
            <th>狀態</th>
            <th>戰情操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredCases" :key="item._id" :class="{ 'row-disabled': item.status === 'completed' }">
            <td>
              <div class="case-no">{{ item.case_number }}</div>
              <span :class="['tag-type', item.case_type]">
                {{ item.case_type === 'buyer_request' ? '買家需求' : '待售資產' }}
              </span>
            </td>
            <td>
              <div class="case-title">{{ item.title }}</div>
              <div class="case-desc">{{ item.details.requirement_core }}</div>
            </td>
            <td>
              <div class="ai-box">
                <span :class="['tag-sentiment', item.ai_analysis.sentiment]">
                  {{ item.ai_analysis.sentiment === 'negative' ? '高焦慮/急件' : '正向/穩健' }}
                </span>
                <p class="ai-intent">{{ item.ai_analysis.positive_intent }}</p>
              </div>
            </td>
            <td>
              <div class="crm-protected">
                <span class="icon-lock">🔒</span>
                <span>{{ item.crmData.client_name }}</span>
              </div>
            </td>
            <td>
              <div class="amount">NT$ {{ (item.details.capital_amount).toLocaleString() }}</div>
              <div class="area">{{ item.details.target_area }}</div>
            </td>
            <td>
              <span :class="['badge-status', item.status]">
                {{ item.status === 'active' ? '仲介中' : '已結案' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  class="btn-icon btn-line" 
                  title="發送 LINE Bot 強制廣播"
                  @click="triggerLineBroadcast(item)"
                >
                  💬 推播
                </button>
                <button 
                  class="btn-icon btn-toggle" 
                  @click="toggleCaseStatus(item)"
                >
                  {{ item.status === 'active' ? '結案' : '重開' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style lang="scss" scoped>
// --- Design Tokens (黑曜石暗黑戰情室視覺標準: 70 / 25 / 5) ---
$bg-main: #0B0F19;         // 70% 主背景 (黑曜石深邃灰黑)
$card-bg: #111827;        // 25% 容器卡牌背景
$card-border: #1F2937;    // 容器邊框灰
$accent-gold: #EAB308;    // 5% 琥珀璀璨金 (CTA / 高亮點綴)
$text-main: #F9FAFB;      // 主要文字 (高對比白)
$text-muted: #9CA3AF;     // 石墨次要字
$danger-red: #EF4444;     // 霓虹警告紅
$success-green: #22C55E;   // 成功綠

.war-room-container {
  min-height: 100vh;
  background-color: $bg-main;
  color: $text-main;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  // Header
  .war-room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    border-bottom: 1px solid $card-border;
    padding-bottom: 16px;

    .glitch-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;

      .badge-live {
        font-size: 0.75rem;
        background-color: $danger-red;
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        animation: pulse 1.5s infinite;
      }
    }

    .subtitle {
      color: $text-muted;
      margin-top: 4px;
      font-size: 0.9rem;
    }
  }

  // KPI Grid
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 24px;

    .kpi-card {
      background-color: $card-bg;
      border: 1px solid $card-border;
      border-radius: 8px;
      padding: 16px;

      &.danger-border {
        border-color: rgba($danger-red, 0.4);
      }

      .kpi-label {
        font-size: 0.85rem;
        color: $text-muted;
      }

      .kpi-value {
        font-size: 1.8rem;
        font-weight: 700;
        margin: 8px 0;

        .unit {
          font-size: 0.9rem;
          color: $text-muted;
        }
      }

      .kpi-footer {
        font-size: 0.75rem;
        color: $text-muted;
      }
    }
  }

  // Control Panel
  .control-panel {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;

    .input-dark, .select-dark {
      background-color: $card-bg;
      border: 1px solid $card-border;
      color: $text-main;
      padding: 10px 14px;
      border-radius: 6px;
      outline: none;

      &:focus {
        border-color: $accent-gold;
      }
    }

    .search-box {
      flex: 1;
      min-width: 280px;

      input {
        width: 100%;
      }
    }

    .filter-group {
      display: flex;
      gap: 12px;
    }
  }

  // Table
  .table-container {
    background-color: $card-bg;
    border: 1px solid $card-border;
    border-radius: 8px;
    overflow-x: auto;

    .war-room-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;

      th {
        background-color: rgba(#000, 0.3);
        padding: 14px 16px;
        color: $text-muted;
        border-bottom: 1px solid $card-border;
      }

      td {
        padding: 16px;
        border-bottom: 1px solid rgba($card-border, 0.5);
        vertical-align: top;
      }

      .row-disabled {
        opacity: 0.4;
      }

      .case-no {
        font-weight: 700;
        color: $accent-gold;
      }

      .tag-type {
        display: inline-block;
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 4px;
        margin-top: 4px;

        &.buyer_request {
          background-color: rgba(#3B82F6, 0.2);
          color: #60A5FA;
        }

        &.seller_listing {
          background-color: rgba(#10B981, 0.2);
          color: #34D399;
        }
      }

      .case-title {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .case-desc {
        color: $text-muted;
        font-size: 0.825rem;
        max-width: 320px;
        line-height: 1.4;
      }

      .ai-box {
        max-width: 260px;

        .tag-sentiment {
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;

          &.negative {
            background-color: rgba($danger-red, 0.2);
            color: $danger-red;
          }

          &.positive {
            background-color: rgba($success-green, 0.2);
            color: $success-green;
          }
        }

        .ai-intent {
          font-size: 0.775rem;
          color: $text-muted;
          margin-top: 4px;
          line-height: 1.3;
        }
      }

      .crm-protected {
        font-size: 0.825rem;
        color: $text-muted;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .amount {
        font-weight: 700;
      }

      .area {
        font-size: 0.8rem;
        color: $text-muted;
      }

      .badge-status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;

        &.active {
          background-color: rgba($accent-gold, 0.2);
          color: $accent-gold;
        }

        &.completed {
          background-color: rgba($text-muted, 0.2);
          color: $text-muted;
        }
      }

      .action-buttons {
        display: flex;
        gap: 8px;

        .btn-icon {
          padding: 6px 10px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;

          &.btn-line {
            background-color: #06C755;
            color: #fff;
          }

          &.btn-toggle {
            background-color: $card-border;
            color: $text-main;

            &:hover {
              background-color: lighten($card-border, 10%);
            }
          }
        }
      }
    }
  }
}

// Utility & Animations
.text-gold { color: $accent-gold; }
.text-danger { color: $danger-red; }
.text-success { color: $success-green; }

.btn-cta {
  background-color: $accent-gold;
  color: #000;
  border: none;
  padding: 10px 18px;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
</style>