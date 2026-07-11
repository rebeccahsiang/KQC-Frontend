# 三瑝資訊 (KQJ) 全端智慧改版：前後端串聯與通訊協議指南

本文件定義並記錄了 **三瑝資訊 (kqj.com.tw)** 智慧改版專案中，前端應用層 (`KQC` Vue 3 SPA) 與後端核心業務層 (`kqj-backend` Node.js) 的**雙端通訊機制、數據傳輸協議 (RESTful API) 與跨域配置 (CORS)**。

---

## 🧭 全端數據流向圖 (Data Flow Baseline)

本專案的核心痛點在於瓦解傳統 WordPress「多頭馬車、資料不對稱、維運不易」的限制。以下為本系統目前成功打通的 PoC (原型驗證) 異步通知資料流向：

---

【 前台 Vue 3 智慧官網 】 (執行於本地 5173 端口)
│
│ (Axios 異步連線呼叫 / JSON 格式包裹)
▼
【 Node.js + Express 後端 API 】 (執行於本地 3000 端口 / CORS 開放)
│
├─── (Mongoose Driver) ───> 【 MongoDB 雲端資料庫儲存 】
│
└─── (Axios Webhook) ─────> 【 LINE Bot / LINE Notify 業務群組秒級推播 】

---

## 🔓 1. 跨域安全門禁：CORS 機制配置

由於瀏覽器內建 **同源政策 (Same-Origin Policy)** 安全機制，執行在 `http://localhost:5173` 的前端 Vue 網頁，預設無法跨端口讀取 `http://localhost:3000` 的後端資料。

本專案於後端 `server.js` 掛載 `cors` 中介層以精準放行通訊：

### 後端配置 (`kqj-backend/server.js`)

```javascript
const cors = require('cors');
const express = require('express');
const app = express();

// 允許跨網域請求與 JSON 解析
app.use(cors());
app.use(express.json()); // 解析前端傳入的 Request Body JSON 包裹
生產環境擴充提醒：專案上線（Render / 雲端部署）時，應將 cors() 限制為僅允許三瑝官網的正式網址，以防止惡意外部存取。

📡 2. 通訊接口定義：健康檢查與雙端驗證
🟢 後端供應端：健康檢查 API
路由路徑：GET /api/health

響應格式：application/json

後端實作代碼：

JavaScript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '三瑝資訊全端後端伺服器運行正常',
    timestamp: new Date()
  });
});
🖥️ 前端接收端：生命週期異步掛載
前端利用 Vue 3 的 onMounted 生命週期與 Composition API 響應式變數 (ref)，在網頁掛載完成時秒級發動 Axios 請求：

前端實作代碼 (KQC/src/views/HomeView.vue)：

TypeScript
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 1. 定義響應式狀態，給予明確的 TypeScript 泛型支援
const backendMessage = ref<string>('正在連線到後端...')

// 2. 生命週期異步連線
onMounted(async () => {
  try {
    // 向 3000 端口之伺服器發動網際網路請求
    const response = await axios.get('http://localhost:3000/api/health')

    // 成功抓取後更新響應式變數，驅動 Tailwind / PrimeVue 畫面即時渲染
    backendMessage.value = response.data.message
  } catch (error) {
    backendMessage.value = '❌ 無法連線到後端，請確認後端 server.js 是否啟動 (npm run dev)'
    console.error('全端連線異常:', error)
  }
})
🗃️ 3. 下階段全端業務通訊協議規格 (以 Cases 模組為例)
打通健康檢查後，後續開發將全面導入標準 RESTful API 規範進行「前台/後台/CRM」的資料流轉。

【規格一】前台案件列表撈取
接口：GET /api/v1/cases

說明：前台官網業務櫥窗、卡片元件撈取公开上架物件。

資料傳遞參數：

query.caseType (篩選：'買家委託' 或 '待售案件')

query.region (區域篩選)

【規格二】萬用大一統表單送出 (對接獨立 CRM 與 LINE Bot)
接口：POST /api/v1/forms

說明：前台買家/賣家意向表單送出。後端收到後一邊寫入 MongoDB 存檔，一邊異步發送 LINE 業務手機群組通知。

Payload (JSON 格式包裹)：

JSON
{
  "clientName": "秋風軒車貨運",
  "phone": "0912-345678",
  "capitalLimit": 3500000,
  "targetRegion": "北部地區",
  "coreDemand": "申請卡車營運車額與指標證明"
}
🚀 聯動開機維運 SOP
為確保全端連線功能完全流暢，本地端開發必須開啟雙視窗執行以下指令：

後端開機 (kqj-backend)：npm run dev (鎖定 3000 端口，連線 MongoDB)

前端開機 (KQC)：npm run dev (鎖定 5173 端口，渲染 PrimeVue/Tailwind 畫面)

驗證畫面：開啟 http://localhost:5173，看見綠色溫柔通知框顯示「三瑝資訊全端後端伺服器運行正常」即驗證成功。

```
