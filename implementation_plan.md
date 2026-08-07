# 前端重構與 Design Token 語意化替換計畫

本計畫針對「後台動態 Sidebar 重構」與「Design Token SCSS 顏色語意化替換」進行系統性調整，以提昇專案之可擴充性、權限控管能力，並達成無縫的明/暗主題切換。

## User Review Required

> [!IMPORTANT]
> 1. **路由 Meta 擴充與 icon、roles 規範**：本計畫會全面補齊 `/admin` 路由下所有子路由的 `meta: { title, icon, roles }`。
> 2. **手寫 SidebarNav 替換**：原本由 `SidebarNav.vue` + `SidebarMenuItem.vue` 組成的客製化摺疊選單，將重構成單一 `Sidebar.vue` 並採用 PrimeVue `PanelMenu` (展開狀態) 與 `TieredMenu` (折疊狀態) 混合生成，精簡代碼。
> 3. **全域 Design Token 與路徑**：將於 `src/assets/styles/_tokens.scss` 定義全域變數與 CSS 變數，並將其注入至 `src/styles/_variables.scss`，自動使全站 Vue 元件可直接調用。
> 4. **Hex 顏色自動替換**：本計畫將提供一個 Node.js 腳本自動掃描 `src/views` 與 `src/components` 下的所有 `.vue` 檔案，將寫死的 Hex 色碼替換為對應的 CSS 語意變數，以確保在切換亮暗主題時視覺一致。

## Proposed Changes

---

### Component: Sidebar 重構 (任務一)

#### [NEW] [sidebarMenu.ts](file:///c:/SpecialTopicKQC/KQC/src/config/sidebarMenu.ts)
- 建立選單結構設定檔，導出 `sidebarMenu` 結構，提供動態路由比對與選單順序參考。

#### [MODIFY] [index.ts](file:///c:/SpecialTopicKQC/KQC/src/router/index.ts)
- 補齊後台路由（`/admin` 底下所有層級）的 `meta: { title, icon, roles }`。
- 修改 `ai-faq` 路由路徑，使其與 menu 中的 `/admin/messages/ai-faq` 保持一致，或調整路徑對齊。

#### [NEW] [Sidebar.vue](file:///c:/SpecialTopicKQC/KQC/src/components/layout/Sidebar.vue)
- 使用 Vue 3 `<script setup>` 實作。
- 使用 `useRouter()` 讀取路由結構。
- 當 `isCollapsed` 展開時，使用 PrimeVue `PanelMenu` 渲染樹狀選單；當摺疊時，使用 PrimeVue `TieredMenu` 觸發懸浮選單，或精簡渲染頂級項目。
- 透過 `currentRole = ref('admin')` 實現權限過濾。
- 嚴禁使用寫死的靜態 `<li>` 標籤，全數以 PrimeVue 選單元件動態綁定資料生成。

#### [MODIFY] [AdminLayout.vue](file:///c:/SpecialTopicKQC/KQC/src/components/layout/AdminLayout.vue)
- 將原先引入的 `SidebarNav` 替換為重構後的 `Sidebar` 元件。

---

### Component: Design Tokens 與 SCSS 變數替換 (任務二)

#### [NEW] [_tokens.scss](file:///c:/SpecialTopicKQC/KQC/src/assets/styles/_tokens.scss)
- 建立全域 Token 檔，定義以下內容：
  - SCSS 靜態全域變數：`$color-primary: #1E293B;`, `$color-accent: #EAB308;`
  - CSS Custom Properties (亮/暗雙主題)：
    ```css
    :root {
      --bg-main: #F8FAFC;
      --primary: #1E293B;
      --accent: #EAB308;
      --status-alert: #EF4444;
    }
    [data-theme="dark"] {
      --bg-main: #0B0F19;
      --primary: #38BDF8;
      --accent: #EAB308;
      --status-alert: #F87171;
    }
    ```

#### [MODIFY] [_variables.scss](file:///c:/SpecialTopicKQC/KQC/src/styles/_variables.scss)
- 在檔案頂部引進 `@import "@/assets/styles/_tokens.scss";`。
- 更新編譯期變數別名以相容全新的 CSS 變數。

#### [NEW] [replace_colors.js](file:///c:/SpecialTopicKQC/KQC/scratch/replace_colors.js)
- 建立自動替換腳本，掃描 `src/views/` 與 `src/components/` 的 `.vue` 檔案。
- 替換對照表：
  - `#1E293B` (不分大小寫) ➔ `var(--primary)`
  - `#EAB308` (不分大小寫) ➔ `var(--accent)`
  - `#F8FAFC` (不分大小寫) ➔ `var(--bg-main)`
  - `#EF4444` (不分大小寫) ➔ `var(--status-alert)`
  - `#0B0F19` (不分大小寫) ➔ `var(--bg-main)`
  - `#111827` (不分大小寫) ➔ `var(--bg-card)`
- 執行自動替換並透過 Git 查看差異，確保正確無誤。

---

## Verification Plan

### Automated Tests
- 執行 `npm run build` 確認專案在經過 SCSS 變數替換與 Vue 路由更新後，TypeScript 編譯與 Vite 建置依然順利通過。

### Manual Verification
- 啟動本地開發伺服器 `npm run dev`。
- 登入後台管理介面 (`/admin`)：
  - 驗證 Sidebar 摺疊狀態下的 PrimeVue PanelMenu 或 TieredMenu 切換行為。
  - 測試切換權限角色，驗證過濾功能正常。
  - 測試前台至後台的主題切換（切換明/暗主題），驗證是否所有頁面都無破裂現象，且寫死 Hex 色碼的部分已成功藉由 CSS 變數呈現正確色調。
