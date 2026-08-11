<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isDarkMode = ref(false)

// 70/25/5 設計規範: 暗黑切換
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark-mode', isDarkMode.value)
}

// 主選單
const navItems = [
  { name: '業務櫥窗', path: '/products' },
  { name: '公司', path: '/company' },
  { name: '產業洞察', path: '/insights' },
  { name: '聯絡我們', path: '/contact' },
]

const isAdminRoute = () => route.path.startsWith('/admin')
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- KQC LOGO 品牌區 -->
      <div class="brand" @click="router.push('/')" role="button" tabindex="0">
        <div class="logo-badge">KQC</div>
        <div class="brand-text">
          <span class="brand-name">三爵資訊</span>
          <span class="brand-sub">智慧運輸與 AI 轉型平台</span>
        </div>
      </div>

      <!-- 主選單導覽 -->
      <nav class="main-nav" aria-label="主選單">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="nav-item--active"
        >
          {{ item.name }}
        </router-link>
        <router-link
          v-if="isAdminRoute()"
          to="/admin/dashboard"
          class="nav-item nav-item--admin"
          active-class="nav-item--active"
        >
          後台戰情室
        </router-link>
      </nav>

      <!-- 右側操作區 -->
      <div class="header-actions">
        <!-- 暗黑模式切換 -->
        <button
          class="btn-icon-action"
          @click="toggleTheme"
          :title="isDarkMode ? '切換為亮色模式' : '切換為暗黑戰情室'"
          aria-label="切換主題"
        >
          <span v-if="isDarkMode">☀️</span>
          <span v-else>🌙</span>
        </button>

        <!-- 系統訊息鈴 -->
        <button class="btn-icon-action btn-bell" title="即時系統訊息" aria-label="通知">
          🔔
          <span class="notification-dot"></span>
        </button>

        <div class="divider"></div>

        <!-- 顧問 Profile -->
        <div class="user-profile">
          <div class="avatar">項</div>
          <div class="user-info">
            <span class="user-name">項圓芬 顧問</span>
            <span class="user-role">資深授權顧問</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  height: 60px;
  background-color: #1E293B; /* 25% 三爵鋼鐵藍 */
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.header-container {
  max-width: 1440px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* --- Logo 品牌區 --- */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;

  &:hover .logo-badge {
    filter: brightness(1.1);
    transform: scale(1.04);
  }

  .logo-badge {
    width: 36px;
    height: 36px;
    background-color: #EAB308; /* 5% 琥珀璀璨金 */
    color: #1E293B;
    font-weight: 900;
    font-size: 0.95rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 1px;
    transition: transform 0.2s ease, filter 0.2s ease;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;

    .brand-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .brand-sub {
      font-size: 0.65rem;
      color: #94a3b8;
    }
  }
}

/* --- 主選單 --- */
.main-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;

  .nav-item {
    padding: 6px 12px;
    border-radius: 6px;
    color: #cbd5e1;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #EAB308;
    }

    &--active {
      color: #EAB308;
      background-color: rgba(234, 179, 8, 0.12);
      font-weight: 700;
    }

    &--admin {
      border: 1px solid rgba(234, 179, 8, 0.4);
      color: #EAB308;
    }
  }
}

/* --- 右側操作區 --- */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  .btn-icon-action {
    width: 34px;
    height: 34px;
    border-radius: 6px;
    background-color: #334155;
    border: 1px solid #475569;
    color: #e2e8f0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    transition: border-color 0.2s ease, background-color 0.2s ease;
    position: relative;

    &:hover {
      border-color: #EAB308;
      background-color: #3d4f68;
    }

    &.btn-bell .notification-dot {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 7px;
      height: 7px;
      background-color: #ef4444;
      border-radius: 50%;
      border: 1px solid #1E293B;
    }
  }

  .divider {
    width: 1px;
    height: 20px;
    background-color: #475569;
    margin: 0 4px;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }

    .avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #EAB308;
      color: #1E293B;
      font-weight: 700;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;

      .user-name {
        font-size: 0.8rem;
        font-weight: 600;
        color: #e2e8f0;
      }

      .user-role {
        font-size: 0.65rem;
        color: #94a3b8;
      }
    }
  }
}
</style>
