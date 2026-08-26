<script setup lang="ts">
import { ref, onMounted } from 'vue'

import KqcButton from '@/components/ui/KqcButton.vue'
import KqcInput from '@/components/ui/KqcInput.vue'
import KqcSelect from '@/components/ui/KqcSelect.vue'
import KqcCheckbox from '@/components/ui/KqcCheckbox.vue'
import KqcRadio, { type RadioOption } from '@/components/ui/KqcRadio.vue'
import KqcSwitch from '@/components/ui/KqcSwitch.vue'
import KqcCard from '@/components/ui/KqcCard.vue'

// 1. 雙主題響應式狀態 (與 DOM 屬性強綁定)
const isDarkMode = ref(false)

const inputValue = ref('')
const selectValue = ref('1')
const checkboxValue = ref(true)
const radioValue = ref('buyer')
const switchValue = ref(true)

const selectOptions = [
  { label: '汽車貨運牌照 (甲種)', value: '1' },
  { label: '貨櫃汽車運輸業', value: '2' },
  { label: '遊覽車客運業', value: '3' }
]

const radioOptions: RadioOption<string>[] = [
  { label: '誠信買家委託', value: 'buyer', desc: '尋求牌照或專利資產收購' },
  { label: '待售資產', value: 'seller', desc: '釋出優質公司股權與車隊' }
]

// 2. 切換亮色 / 暗黑主題 (確保 ref 與 HTML data-theme 100% 同步)
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  const theme = isDarkMode.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
}

// 3. 掛載時精準檢查當前 DOM 狀態，避免 state 與 DOM 脫節
onMounted(() => {
  const currentDomTheme = document.documentElement.getAttribute('data-theme')
  if (currentDomTheme === 'dark') {
    isDarkMode.value = true
  } else {
    isDarkMode.value = false
    document.documentElement.setAttribute('data-theme', 'light')
  }
})
</script>

<template>
  <div class="kqc-design-system-page">
    <!-- 頁面頂部 Header 戰情列 -->
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">三爵資訊 (KQC) UI設計系統戰情頁</h1>
        <p class="page-subtitle">1:1 映射 Figma 設計代幣與 15 個宮格組件展示</p>
      </div>

      <div class="header-actions">
        <!-- 100% 響應式文案與狀態同步 -->
        <KqcButton variant="outline" size="sm" @click="toggleDarkMode">
          <template v-if="isDarkMode">☀️ 切換預設亮色</template>
          <template v-else>🌙 切換黑曜石戰情室</template>
        </KqcButton>
      </div>
    </header>

    <main class="main-content">
      <section class="section-card typography-demo" aria-labelledby="typography-demo-title">
        <h2 id="typography-demo-title" class="section-title">Typography</h2>
        <h3>Primitive scale</h3>
        <div class="type-sample-grid">
          <span class="type-caption">xs · 12px</span>
          <span class="type-metadata">sm · 14px</span>
          <span class="type-body">md · 16px</span>
          <span class="type-body-emphasis">lg · 18px</span>
          <span class="type-card-title">xl · 20px</span>
          <span class="type-section-title">2xl · 24px</span>
        </div>
        <h3>Semantic roles</h3>
        <div class="type-sample-grid">
          <span class="type-caption">Caption</span>
          <span class="type-metadata">Metadata</span>
          <span class="type-label">Label</span>
          <span class="type-body-small">Body small</span>
          <span class="type-body">Body</span>
          <span class="type-body-emphasis">Body emphasis</span>
          <span class="type-card-title">Card title</span>
          <span class="type-section-title">Section title</span>
        </div>
      </section>
      <!-- 0. 色彩系統 Color Palette -->
      <section class="section-card">
        <h2 class="section-title">色彩系統調色盤 (70 / 25 / 5 金比)</h2>
        <div class="color-palette-grid">
          <div class="color-box bg-base-light">
            <span class="color-name">雲霧極光白</span>
            <span class="color-hex">var(--bg-main) (70%)</span>
          </div>
          <div class="color-box bg-base-white">
            <span class="color-name">完整履行白</span>
            <span class="color-hex">#FFFFFF</span>
          </div>
          <div class="color-box bg-primary">
            <span class="color-name">三爵鋼鐵藍</span>
            <span class="color-hex">var(--primary) (25%)</span>
          </div>
          <div class="color-box bg-accent">
            <span class="color-name">琥珀璀璨金</span>
            <span class="color-hex">var(--accent) (5%)</span>
          </div>
          <div class="color-box bg-danger">
            <span class="color-name">虹霓警告紅</span>
            <span class="color-hex">var(--status-alert)</span>
          </div>
        </div>
      </section>

      <!-- 1. 按鈕元件 ( KqcButton ) -->
      <section class="section-card">
        <h2 class="section-title">1. 按鈕元件 ( KqcButton )</h2>
        <div class="demo-flex-wrap">
          <KqcButton variant="primary">三爵鋼鐵藍</KqcButton>
          <KqcButton variant="accent">琥珀璀璨金CTA</KqcButton>
          <KqcButton variant="outline">外框按鈕</KqcButton>
          <KqcButton variant="secondary" loading>AI配對中</KqcButton>
          <KqcButton variant="text">文字按鈕</KqcButton>
          <KqcButton variant="danger">危險操作</KqcButton>
        </div>

        <div class="demo-flex-wrap mt-4">
          <KqcButton size="sm" variant="accent">小小</KqcButton>
          <KqcButton size="md" variant="accent">中型 Medium</KqcButton>
          <KqcButton size="lg" variant="accent">大型大號</KqcButton>
          <KqcButton variant="accent">+ 新增衣櫃</KqcButton>
          <KqcButton variant="outline">↓ 匯出報告</KqcButton>
          <KqcButton variant="secondary" disabled>主要服務</KqcButton>
          <KqcButton variant="outline" disabled>失效外框</KqcButton>
        </div>
      </section>

      <!-- 2. 表單控制 ( 輸入&選擇 ) -->
      <section class="section-card">
        <h2 class="section-title">2. 表單控制 ( 輸入&選擇 )</h2>
        <div class="demo-grid-2">
          <KqcInput
            v-model="inputValue"
            label="請輸入車牌類型 (如：甲種貨運)..."
            placeholder="請輸入車牌類型..."
          />
          <KqcSelect
            v-model="selectValue"
            label="專利與專利分類"
            :options="selectOptions"
          />
        </div>
      </section>

      <!-- 3. 單選 / 複選 / 開關 -->
      <section class="section-card">
        <h2 class="section-title">3.單選/複選/開關 (複選框、單選、開關)</h2>
        <div class="demo-grid-3">
          <KqcCheckbox v-model="checkboxValue" label="同意服務條款與資安保密協議" />
          <KqcRadio v-model="radioValue" :options="radioOptions" />
          <KqcSwitch v-model="switchValue" label="即時推播通知 (LINE Bot)" />
        </div>
      </section>

      <!-- 4. 業務資產櫥窗 ( Showcase Cards ) -->
      <section class="section-card">
        <h2 class="section-title">5. 業務資產櫥窗 (Showcase Cards)</h2>
        <div class="demo-grid-3">
          <KqcCard title="資產買賣媒合">
            <p class="card-desc">
              提供全台汽車貨運、貨櫃物流、電動車牌照合法轉讓及透明接合服務。
            </p>
            <template #footer>
              <KqcButton variant="primary" block>了解更多</KqcButton>
            </template>
          </KqcCard>

          <KqcCard title="專利牌照 / 合規審查">
            <p class="card-desc">
              針對車行轉讓、股權變更提供一站式法律與監工宗教諮詢，確保資產交割安全無虞。
            </p>
            <template #footer>
              <KqcButton variant="accent" block>免費諮詢服務</KqcButton>
            </template>
          </KqcCard>

          <!-- 特色戰情室風格卡片 (全數由語意 Tokens 驅動) -->
          <div class="showcase-case-card feature-dark-card">
            <div class="case-header">
              <span class="case-tag">誠信買家委託</span>
              <span class="case-no">KQC-2026-001</span>
            </div>
            <h3 class="case-title">控股公司指定收購委託：甲種運輸業牌照</h3>
            <div class="case-info">
              <p><strong>目標區域：</strong>北部地區</p>
              <p><strong>籌措資金：</strong><span class="text-accent">500萬美元</span></p>
            </div>
            <p class="case-desc">
              誠摯尋求優質甲種運輸業者，洽談100%股權收購，需含完整營業用車牌與車位證明。
            </p>
            <div class="case-footer">
              <span class="ai-status">● AI比對中</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.kqc-design-system-page {
  min-height: 100vh;
  padding: 32px;
  background-color: var(--kqc-bg-main);
  color: var(--kqc-text-main);
  transition: var(--kqc-transition);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--kqc-border);
}

.page-title {
  font-weight: 700;
  color: var(--kqc-text-main);
}

.page-subtitle {
  font-size: $kqc-type-body-small;
  color: var(--kqc-text-muted);
  margin-top: 4px;
}

.section-card {
  padding: 24px;
  margin-bottom: 24px;
  background-color: var(--kqc-bg-card);
  border: 1px solid var(--kqc-border);
  border-radius: var(--kqc-radius-lg);
  box-shadow: var(--kqc-shadow-sm);
  transition: var(--kqc-transition);
}

.section-title {
  font-size: $kqc-type-section-title;
  font-weight: 700;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid var(--kqc-primary);
  color: var(--kqc-text-main);
}

.color-palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

/* 調色盤區塊：採用語意 Token 驅動樣式 */
.color-box {
  padding: 16px;
  border-radius: var(--kqc-radius-md);
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid var(--kqc-border);

  &.bg-base-light {
    background-color: var(--kqc-bg-main);
    color: var(--kqc-text-main);
  }
  &.bg-base-white {
    background-color: var(--kqc-bg-card);
    color: var(--kqc-text-main);
  }
  &.bg-primary {
    background-color: var(--kqc-btn-primary-bg);
    color: var(--kqc-btn-primary-text);
  }
  &.bg-accent {
    background-color: var(--kqc-accent);
    color: var(--kqc-color-white);
    font-weight: 700;
  }
  &.bg-danger {
    background-color: var(--kqc-danger);
    color: var(--kqc-color-white);
  }
}

.color-name { font-size: $kqc-type-label; font-weight: 600; }
.color-hex { font-size: $kqc-type-caption; opacity: 0.85; }

.typography-demo h3 { margin: 1.5rem 0 0.75rem; font-size: $kqc-type-card-title; }
.type-sample-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 1rem; align-items: baseline; }
.type-sample-grid span { margin: 0; }

.demo-flex-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.demo-grid-2 {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
  @media (min-width: $breakpoint-md) { grid-template-columns: repeat(2, 1fr); }
}

.demo-grid-3 {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
  @media (min-width: $breakpoint-lg) { grid-template-columns: repeat(3, 1fr); }
}

/* 特色戰情室黑底卡牌：改用 Design Tokens 與語意化變數 */
.showcase-case-card.feature-dark-card {
  padding: 20px;
  background-color: var(--kqc-bg-card);
  color: var(--kqc-text-main);
  border: 1px solid var(--kqc-border);
  border-radius: var(--kqc-radius-lg);
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--kqc-shadow-md);

  .case-header { display: flex; justify-content: space-between; align-items: center; }
  .case-tag {
    background-color: var(--kqc-btn-primary-bg);
    color: var(--kqc-btn-primary-text);
    font-weight: 700;
    padding: 2px 8px;
    border-radius: var(--kqc-radius-sm);
    font-size: $kqc-type-caption;
  }
  .case-no { font-size: $kqc-type-caption; color: var(--kqc-text-muted); }
  .case-title { font-size: $kqc-type-body; font-weight: 700; color: var(--kqc-text-main); margin: 0; }
  .case-info { font-size: $kqc-type-body-small; color: var(--kqc-text-muted); p { margin: 2px 0; } }
  .case-desc { font-size: $kqc-type-body-small; color: var(--kqc-text-main); line-height: 1.5; margin: 0; }
  .case-footer { font-size: $kqc-type-caption; color: var(--kqc-success); font-weight: 600; }
}

.text-accent { color: var(--kqc-accent); font-weight: 700; }
.card-desc { font-size: $kqc-type-body-small; color: var(--kqc-text-muted); line-height: 1.6; }
.mt-4 { margin-top: 16px; }
</style>
