# Vue + PrimeVue + Tailwind v4 專案建置指南

這份文件記錄了從零開始（僅有 PrimeVue 依賴）到建立完整 Vite + Vue 開發環境的建置流程與說明。

## 1. 安裝核心套件與工具

一開始，專案中僅安裝了 `primevue` 與 `@primeuix/themes`。為了補齊完整的 Vue 應用程式架構，我們進行了以下安裝：

### 核心套件 (Dependencies)
```bash
npm install vue vue-router pinia tailwindcss
```
- `vue`: 應用程式核心。
- `vue-router`: 處理頁面路由。
- `pinia`: 官方推薦的狀態管理工具。
- `tailwindcss`: 基礎樣式框架（我們選擇使用最新的 v4 版本）。

### 開發套件 (Dev Dependencies)
```bash
npm install -D vite @vitejs/plugin-vue @tailwindcss/vite typescript vue-tsc @types/node
```
- `vite`: 極速的開發伺服器與建置工具。
- `@vitejs/plugin-vue`: 讓 Vite 支援編譯 `.vue` 單一元件檔。
- `@tailwindcss/vite`: Tailwind CSS v4 的專屬 Vite 外掛，取代了過去的 `postcss` 設定。
- `typescript` / `vue-tsc` / `@types/node`: 提供 TypeScript 型別支援與編譯檢查。

## 2. 專案設定檔建立

為了讓 Vite 與 TypeScript 順利運作，我們建立了下列設定檔：

### `package.json`
加入必要的 `scripts` 與 `"type": "module"`：
```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

### `vite.config.ts`
載入 Vue 與 Tailwind CSS 外掛，並設定 `@` 路徑別名指向 `src` 資料夾：
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### `tsconfig.json`
設定了基本的 ESNext 編譯目標、嚴格模式 (Strict mode) 以及路徑對應 (`paths`) 等。

## 3. 專案原始碼結構建立

### HTML 進入點
建立專案根目錄的 `index.html`，並引入 `src/main.ts`。

### 全域樣式 (`src/style.css`)
Tailwind CSS v4 採用了更簡單的載入方式，不再需要 `tailwind.config.js`，只需要在一支 CSS 檔案中寫下：
```css
@import "tailwindcss";
```

### 應用程式進入點 (`src/main.ts`)
在這個檔案中，我們將所有套件組合起來，掛載到 Vue 實體上：
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import router from './router'
import './style.css' // 確保 Tailwind CSS 載入

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})

app.mount('#app')
```

### 路由與狀態管理
- **Router (`src/router/index.ts`)**：使用 `createWebHistory` 並定義了基礎的 `/` 首頁路由，指向 `HomeView.vue`。
- **Store (`src/stores/counter.ts`)**：示範了 Pinia Composition API 風格的狀態管理 (Setup Store)。

### 頁面與元件
最後建立了 `src/App.vue` (包含 `<RouterView />`) 以及示範了如何結合 PrimeVue 元件 (`Card`, `Button`) 和 Tailwind 樣式的 `src/views/HomeView.vue`。

---

## 啟動專案

完成上述步驟後，您隨時可以透過以下指令啟動開發環境：

```bash
npm run dev
```
