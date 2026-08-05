### 💡 整合後的 3 大業界優勢：

1. **防閃爍主題雙重保險**：`themeStore.initTheme()` 會在網頁掛載的第一時間讀取 `localStorage` 或系統偏好，確保進入 `/design-system` 或首頁時完全不跑版。
2. **平滑轉場體驗**：`.kqc-global-wrapper` 上的 `transition: background-color 0.3s ease` 可以在點擊主題切換時，讓整頁呈現極致優雅的毫秒級顏色漸變。
3. **高動態相容性**：`var(--bg-main)` 與 `var(--text-main)` 預設帶有 fallback 數值，就算 CSS 變數尚未載入也不會出現盲白空白頁。

請直接將這份完整的程式碼覆蓋至 `src/App.vue` 存檔，然後重新整理瀏覽器 `http://localhost:5173/design-system` 試試看，期待你跟我回報成果！
