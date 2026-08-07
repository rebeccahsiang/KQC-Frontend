# 任務清單 (Task List)

## 任務一：後台動態 Sidebar 重構
- [x] 建立 `src/config/sidebarMenu.ts` 規格設定檔
- [x] 修改 `src/router/index.ts`，補齊後台路由的 `meta: { title, icon, roles }`
- [x] 建立 `src/components/layout/Sidebar.vue`，整合 PrimeVue PanelMenu (展開時) 與 TieredMenu (折疊時)
- [x] 修改 `src/components/layout/AdminLayout.vue`，替換 `<SidebarNav />` 為 `<Sidebar />`

## 任務二：Design Token SCSS 顏色語意化替換
- [x] 建立 `src/assets/styles/_tokens.scss` 規格檔，定義全域與 CSS 變數
- [x] 在 `src/styles/_variables.scss` 中引入 `src/assets/styles/_tokens.scss`
- [x] 建立並執行 `replace_colors.js` 腳本，自動替換 `src/views/` 與 `src/components/` 下所有寫死的 Hex 顏色碼

## 驗證與建置
- [x] 執行 `npm run build` 確認 TypeScript 與 Vite 建置通過
- [x] 撰寫 `walkthrough.md` 並更新完成狀態
