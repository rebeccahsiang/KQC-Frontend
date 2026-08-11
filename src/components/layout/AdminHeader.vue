<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDarkMode = ref(false)

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark-mode', isDarkMode.value)
}
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <div class="brand" @click="router.push('/')">
        <div class="logo-icon">KQC</div>
        <div class="brand-text">
          <span class="company">三爵資訊</span>
          <span class="sub">智慧運輸與 AI 轉型平台</span>
        </div>
      </div>

      <nav class="main-nav">
        <router-link to="/product" class="nav-item">業務櫥窗</router-link>
        <router-link to="/trends" class="nav-item">市場趨勢</router-link>
        <router-link to="/admin" class="nav-item admin-badge">後台戰情室</router-link>
      </nav>

      <div class="header-actions">
        <button class="btn-theme-toggle" @click="toggleTheme" :title="isDarkMode ? '切換亮色模式' : '切換黑曜石暗黑模式'">
          <span v-if="isDarkMode">☀️ 亮色</span>
          <span v-else>🌙 暗黑戰情室</span>
        </button>
        <div class="user-profile">
          <span class="avatar">項</span>
          <span class="username">項圓芬 顧問</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  height: 60px;
  background-color: #1e293b; /* 三爵鋼鐵藍 */
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  .header-container {
    max-width: 1440px;
    height: 100%;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;

    .logo-icon {
      background-color: #eab308; /* 琥珀璀璨金 */
      color: #1e293b;
      font-weight: 900;
      font-size: 1.1rem;
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 1px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;

      .company {
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.2;
      }

      .sub {
        font-size: 0.7rem;
        color: #94a3b8;
      }
    }
  }

  .main-nav {
    display: flex;
    gap: 20px;

    .nav-item {
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.2s ease;

      &:hover, &.router-link-active {
        color: #eab308;
      }

      &.admin-badge {
        padding: 2px 8px;
        background-color: rgba(234, 179, 8, 0.15);
        border: 1px solid #eab308;
        border-radius: 4px;
        color: #eab308;
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;

    .btn-theme-toggle {
      background-color: #334155;
      color: #ffffff;
      border: 1px solid #475569;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: #475569;
        border-color: #eab308;
      }
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 8px;

      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #eab308;
        color: #1e293b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.85rem;
      }

      .username {
        font-size: 0.85rem;
        color: #e2e8f0;
      }
    }
  }
}
</style>