<script setup lang="ts">
defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle'])

// 側欄選單項目
const menuItems = [
  { icon: '📁', label: '全部案件列單', key: 'all', active: true },
  { icon: '🛒', label: '買家需求 (Buyer)', key: 'buyer', active: false },
  { icon: '🏷️', label: '精選待售 (Seller)', key: 'seller', active: false },
  { icon: '📊', label: '案件分析', key: 'analytics', active: false },
  { icon: '⚙️', label: '系統設定', key: 'settings', active: false },
]
</script>

<template>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed }" aria-label="側邊欄">
    <!-- 標題列與縮放切換 -->
    <div class="sidebar-header">
      <span v-if="!isCollapsed" class="sidebar-title">業務櫥窗分類</span>
      <button
        class="btn-toggle"
        @click="emit('toggle')"
        :title="isCollapsed ? '展開側邊欄' : '折疊側邊欄'"
        :aria-label="isCollapsed ? '展開側邊欄' : '折疊側邊欄'"
      >
        <span class="toggle-icon">{{ isCollapsed ? '❯' : '❮' }}</span>
      </button>
    </div>

    <!-- 分類篩選選單 -->
    <nav class="filter-menu" aria-label="案件分類篩選">
      <button
        v-for="item in menuItems"
        :key="item.key"
        class="filter-btn"
        :class="{ 'active': item.active }"
        :title="item.label"
        :aria-label="item.label"
      >
        <span class="icon">{{ item.icon }}</span>
        <span v-if="!isCollapsed" class="label">{{ item.label }}</span>
        <!-- 展開時顯示 active 指示條 -->
        <span v-if="!isCollapsed && item.active" class="active-indicator"></span>
      </button>
    </nav>

    <!-- 底部 AI 客服對接區塊 -->
    <div v-if="!isCollapsed" class="ai-widget">
      <div class="ai-widget-header">
        <span class="ai-icon">🤖</span>
        <span class="ai-title">AI 語意客服對接</span>
        <span class="ai-badge">Beta</span>
      </div>
      <p class="ai-desc">
        有特定特許牌照需求？可開啟 LINE Bot 傳送口語指令。
      </p>
      <button class="btn-ai-cta">
        開啟 AI 諮詢 →
      </button>
    </div>

    <!-- 收合狀態下的 AI 圖示 -->
    <div v-else class="ai-widget-collapsed" title="AI 客服對接">
      🤖
    </div>
  </aside>
</template>

<style lang="scss" scoped>
/* ========================
   側欄主體 240px ↔ 64px
   ======================== */
.sidebar {
  width: 240px;
  min-width: 240px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              padding 0.3s ease;
  overflow: hidden;
  min-height: 0;

  &.collapsed {
    width: 64px;
    min-width: 64px;
    padding: 16px 8px;
    align-items: center;
  }
}

/* --- 標題與切換按鈕 --- */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  min-height: 32px;

  .sidebar-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #1E293B;
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
  }

  .btn-toggle {
    background-color: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    width: 28px;
    height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: background-color 0.2s ease, border-color 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background-color: #1E293B;
      border-color: #1E293B;
      color: #ffffff;
    }

    .toggle-icon {
      font-size: 0.7rem;
      font-weight: bold;
    }
  }
}

/* --- 分類篩選選單 --- */
.filter-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
    transition: all 0.2s ease;
    text-align: left;

    &:hover {
      background-color: #f8fafc;
      color: #1E293B;
    }

    &.active {
      background-color: #1E293B; /* 25% 三爵鋼鐵藍 */
      color: #ffffff;
      font-weight: 600;
    }

    .icon {
      font-size: 1rem;
      flex-shrink: 0;
    }

    .label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .active-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #EAB308; /* 5% 琥珀璀璨金 */
      flex-shrink: 0;
    }
  }
}

/* --- AI 客服對接區塊 (展開態) --- */
.ai-widget {
  margin-top: auto;
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 8px;

  .ai-widget-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;

    .ai-icon {
      font-size: 0.9rem;
    }

    .ai-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: #1E293B;
      flex: 1;
    }

    .ai-badge {
      font-size: 0.6rem;
      background-color: #EAB308;
      color: #1E293B;
      padding: 1px 5px;
      border-radius: 4px;
      font-weight: 700;
    }
  }

  .ai-desc {
    font-size: 0.72rem;
    color: #64748b;
    margin: 0 0 8px 0;
    line-height: 1.5;
  }

  .btn-ai-cta {
    width: 100%;
    padding: 7px 0;
    background-color: #EAB308; /* 5% 琥珀璀璨金 CTA 按鈕 */
    color: #1E293B;
    border: none;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    transition: filter 0.2s ease;

    &:hover {
      filter: brightness(1.08);
    }
  }
}

/* --- AI 圖示 (收合態) --- */
.ai-widget-collapsed {
  margin-top: auto;
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #EAB308;
  }
}
</style>