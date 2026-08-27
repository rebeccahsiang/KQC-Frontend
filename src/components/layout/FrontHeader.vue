<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useThemeStore } from '@/stores/themeStore'
import { useCaseStore } from '@/stores/useCaseStore'
import { useAuthStore } from '@/stores/authStore' // 1. 匯入 Auth Store
import { usePublicFaq } from '@/composables/usePublicFaq'

// 型別宣告 (Types Definition)
interface NavItem {
  name: string
  path: string
}

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const caseStore = useCaseStore()
const mobileNavigationOpen = ref(false)
const authStore = useAuthStore() // 2. 實例化 authStore (徹底修復 Template 紅字)
const { openFaq } = usePublicFaq()

// 頁面滾動監聽：超過 50px 觸發 A 區塊平滑折疊收合
const isCompact = ref(false)
const COMPACT_ENTER_Y = 140
const FULL_RETURN_Y = 32

const handleScroll = (): void => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  if (!isCompact.value && scrollTop > COMPACT_ENTER_Y) isCompact.value = true
  else if (isCompact.value && scrollTop < FULL_RETURN_Y) isCompact.value = false
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  // Public headers wait on the existing session hydrator so capability-based
  // account actions never render from an unsettled or locally reconstructed identity.
  void authStore.initialize()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 導覽選單定義
const navItems: NavItem[] = [
  { name: '產品櫥窗', path: '/products' },
  { name: '我們公司', path: '/company' },
  { name: '產業洞察', path: '/insights' },
  { name: '聯絡我們', path: '/contact' },
]

// 全域語意搜尋邏輯
const searchQuery = ref<string>('')

const handleSearch = (): void => {
  const query = searchQuery.value.trim()
  if (!query) return

  caseStore.setFilters({ searchQuery: query })
  if (route.path !== '/products') {
    router.push({ path: '/products' })
  }
}

</script>

<template>
  <header class="kqc-sticky-header" :class="{ 'is-compact': isCompact }">
    <!-- ========================================================================= -->
    <!-- 🟥 【全域區 A 主導覽列】：向下滾動時滑順折疊收合 -->
    <!-- ========================================================================= -->
    <div class="header-section-a" :class="{ 'is-collapsed': isCompact }">
      <div class="header-inner-a">
        <!-- 1. 左側 Logo 品牌區 -->
        <router-link to="/" class="brand-link" aria-label="回首頁">
          <div class="brand-logo-badge">KQC</div>
          <div class="brand-info">
            <h1 class="brand-title">三爵資訊</h1>
            <p class="brand-subtitle">智慧運輸與資產交易平台</p>
          </div>
        </router-link>

        <!-- 2. 中央即時動態跑馬燈 -->
        <div class="market-ticker-wrapper">
          <span class="ticker-badge">
            <span class="ping-dot"></span>
            即時動態
          </span>
          <div class="ticker-content">
            <span class="ticker-text">
              平台公告、產業提醒與新服務資訊將顯示於此。
            </span>
          </div>
        </div>

        <!-- 3. A 區主選單連結 (明確導向 /products, /company, /insights, /contact) -->
        <button type="button" class="mobile-nav-toggle" :aria-expanded="mobileNavigationOpen" aria-controls="public-navigation" aria-label="切換主要導覽" @click="mobileNavigationOpen = !mobileNavigationOpen">
          <Icon :icon="mobileNavigationOpen ? 'lucide:x' : 'lucide:menu'" />
        </button>
        <nav id="public-navigation" class="main-nav-links" :class="{ 'main-nav-links--open': mobileNavigationOpen }" aria-label="主要導覽">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            active-class="nav-item--active"
            @click="mobileNavigationOpen = false"
          >
            {{ item.name }}
          </router-link>
        </nav>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 🟩 【B 功能導覽列】：全程吸頂 -->
    <!-- ========================================================================= -->
    <div class="header-section-b">
      <div class="header-inner-b">
        <router-link to="/" class="compact-brand-link" aria-label="回首頁">
          <span class="compact-brand-mark">KQC</span>
          <span>三爵資訊</span>
        </router-link>
        <nav class="compact-nav-links" aria-label="精簡主要導覽">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path" active-class="is-active">{{ item.name }}</router-link>
        </nav>
        <!-- 1. 左側：動態麵包屑 -->
        <!-- 2. 中央：語意搜尋框 -->
      <div class="search-bar-container">
        <div class="search-input-group">
          <Icon icon="lucide:search" class="search-icon" aria-hidden="true" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="輸入需求，快速找到適合的服務"
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- 3. 右側：功能操作與會員登入/登出入口 -->
      <div class="action-controls">
        <!-- ☀️/🌙 明暗雙主題切換按鈕 -->
        <button
          type="button"
          class="control-btn theme-btn"
          :aria-label="themeStore.isDark ? '切換至淺色模式' : '切換至深色模式'"
          :title="themeStore.isDark ? '切換為雲霧極光白亮色主題' : '切換為黑曜石暗黑戰情室'"
          @click="themeStore.toggleTheme"
        >
          <Icon
            :icon="themeStore.isDark ? 'lucide:sun' : 'lucide:moon'"
            class="control-icon"
          />
        </button>
      
        <!-- FAQ 按鈕 -->
        <button type="button" class="control-btn faq-btn" title="常見問題 FAQ" aria-label="常見問題 FAQ" @click="openFaq">
          <Icon icon="lucide:book-open" class="control-icon" />
        </button>
      
        <!-- 系統提醒 -->
        <button type="button" class="control-btn bell-btn" title="通知（目前沒有新通知）" aria-label="通知（目前沒有新通知）">
          <Icon icon="lucide:bell" class="control-icon" />
        </button>
      
        <!-- 狀態 A：未登入 -> 顯示會員登入按鈕 -->
        <button
          v-if="authStore.initialized && !authStore.isAuthenticated"
          type="button"
          class="control-btn login-btn"
          aria-label="會員登入"
          title="會員登入"
          @click="authStore.openAuthModal('login')"
        >
          <Icon icon="lucide:user" class="control-icon" />
        </button>
      
        <!-- 狀態 B：已登入 -> 顯示使用者名稱與登出按鈕 -->
        <div v-else-if="authStore.initialized" class="user-profile-menu">
          <span class="user-name-badge">{{ authStore.memberName }}</span>
          <router-link
            v-if="authStore.isAdminPortalUser"
            to="/admin"
            class="control-btn staff-entry-btn"
            title="進入後台"
            aria-label="進入後台"
          >
            <Icon icon="lucide:layout-dashboard" class="control-icon" />
            <span>進入後台</span>
          </router-link>
          <router-link
            v-if="authStore.user?.role === 'user'"
            to="/account/sessions"
            class="control-btn session-btn"
            title="登入中的裝置"
            aria-label="登入中的裝置"
          >
            <Icon icon="lucide:monitor-smartphone" class="control-icon" />
          </router-link>
          <button
            type="button"
            class="control-btn logout-btn"
            aria-label="安全登出"
            title="安全登出"
            @click="authStore.logout()"
          >
            <Icon icon="lucide:log-out" class="control-icon danger" />
          </button>
        </div>
      </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.kqc-sticky-header {
  position: sticky;
  top: 1rem; /* 向上留出距離，形成浮動氣質 */
  z-index: 50;
  
  /* 1. 寬度與置中處理 */
  width: 95%;
  max-width: 1400px; /* 業界標準：避免 4K 超寬螢幕拉得過寬 */
  margin: 0 auto;    /* 關鍵：利用外邊距讓 95% 寬度在父容器中水平居中 */

  /* 2. 去除底色與外框 */
  background-color: transparent !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.kqc-sticky-header.is-compact {
  position: fixed;
  top: 0.5rem;
  left: 50%;
  z-index: 100;
  margin: 0;
  transform: translateX(-50%);
}

.header-section-a {
  max-height: 120px;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  overflow: hidden;
  border-bottom: 1px solid var(--border-line);
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease,
              visibility 0.25s ease,
              padding 0.3s ease;

  &.is-collapsed {
    max-height: 0 !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
    border-bottom-color: transparent !important;
    padding: 0 !important;
  }
}

.header-inner-a {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  flex-shrink: 0;

  .brand-logo-badge {
    width: 3.5rem;
    height: 3.5rem;
    background-color: var(--accent-gold, #eab308);
    color: #1e293b;
    font-weight: 900;
    font-size: 1.5rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .brand-subtitle {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0;
  }
}

.market-ticker-wrapper {
  flex: 1;
  max-width: 45rem;
  background-color: var(--bg-main);
  border: 1px solid var(--border-line, var(--border-grey));
  border-radius: 9999px;
  padding: 0.375rem 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  overflow: hidden;

  .ticker-badge {
    background-color: rgba(234, 179, 8, 0.15);
    color: #ca8a04;
    font-weight: 600;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;

    .ping-dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 50%;
      background-color: var(--accent-gold, #eab308);
    }
  }

  .ticker-content {
    white-space: nowrap;
    overflow: hidden;
    color: var(--text-muted);

    .ticker-text {
      display: inline-block;
      animation: marquee 28s linear infinite;
    }
  }
}

.main-nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  flex-shrink: 0;

  .nav-item {
    color: var(--text-primary);
    text-decoration: none;
    padding: 0.25rem 0;
    position: relative;
    transition: color 0.2s ease;

    &:hover,
    &--active {
      color: var(--accent-gold, #eab308);
      font-weight: 700;
    }

    &--active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--accent-gold, #eab308);
      border-radius: 9999px;
    }
  }
}

.mobile-nav-toggle {
  display: none;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border: 1px solid var(--border-line);
  border-radius: 0.5rem;
  background: var(--bg-card);
  color: var(--text-primary, var(--text-main));
  cursor: pointer;
}

.header-section-b {
  padding: 0.625rem 0;
  border: 1px solid var(--border-line, var(--border-grey));
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--bg-card) 94%, transparent);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
}

.header-inner-b {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.compact-brand-link,
.compact-nav-links { display: none; }

.is-compact {
  .header-section-b { padding-block: 0.45rem; }
  .header-inner-b { max-width: 1340px; }
  .compact-brand-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-primary, var(--text-main));
    font-size: 0.8rem;
    font-weight: 800;
    text-decoration: none;
    white-space: nowrap;
  }
  .compact-brand-mark { display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: 0.45rem; background: var(--accent-gold, var(--accent)); color: #1e293b; font-size: 0.72rem; }
  .compact-nav-links {
    display: flex;
    align-items: center;
    gap: clamp(0.65rem, 1.5vw, 1.25rem);

    a { color: var(--text-primary, var(--text-main)); font-size: 0.78rem; font-weight: 650; text-decoration: none; white-space: nowrap; }
    a:hover, a.is-active { color: var(--accent-gold, var(--accent)); }
  }
  .search-bar-container { display: none; }
}

.search-bar-container {
  flex: 1;
  max-width: 32rem; /* 從 22rem 拓寬至 32rem (512px)，確保 Placeholder 不會被截斷 */
  margin: 0 1rem;

  .search-input-group {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.4rem 0.85rem;
    background-color: var(--bg-card, #ffffff);
    
    /* 1. 將邊框與圓角完全收納在父容器 */
    border: 1px solid var(--border-line, #e2e8f0);
    border-radius: 9999px; /* 現代 B2B 膠囊型外框 (Pill Shape) */
    transition: all 0.2s ease-in-out;

    /* 2. 利用 :focus-within 實現整體金色光暈與邊框高亮 */
    &:focus-within {
      border-color: var(--accent-gold, #eab308);
      box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.18);
    }

    &:hover:not(:focus-within) {
      border-color: var(--accent-gold-hover, #facc15);
    }

    .search-icon {
      width: 1rem;
      height: 1rem;
      color: var(--text-muted, #64748b);
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      min-width: 0;
      margin: 0 0.5rem;
      background: transparent;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      font-size: 0.8125rem;
      color: var(--text-primary, #1e293b);

      &::placeholder {
        color: var(--text-muted, #64748b);
      }
    }

  }
}

.action-controls {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;

  .control-btn {
    padding: 0.4375rem;
    border-radius: 0.5rem;
    background-color: var(--bg-main);
    border: 1px solid var(--border-line);
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.375rem;

    &:hover {
      color: var(--accent-gold, #eab308);
      border-color: var(--accent-gold, #eab308);
    }

    .control-icon,
    .theme-icon {
      width: 0.9375rem;
      height: 0.9375rem;
    }

    .theme-icon {
      color: var(--accent-gold, #eab308);
    }

    .faq-text {
      font-size: 0.75rem;
      font-weight: 600;
    }
  }

  .divider-line {
    width: 1px;
    height: 0.875rem;
    background-color: var(--border-line);
    margin: 0 0.125rem;
  }

  .war-room-cta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.8125rem;
    border-radius: 0.5rem;
    background-color: var(--accent-gold, #eab308);
    color: #1e293b;
    font-weight: 700;
    font-size: 0.75rem;
    text-decoration: none;

    &:hover {
      filter: brightness(1.08);
    }

    .cta-icon {
      width: 0.9375rem;
      height: 0.9375rem;
    }
  }
}

.user-profile-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name-badge { white-space: nowrap; }
.staff-entry-btn { min-height: 2.5rem; text-decoration: none; white-space: nowrap; }

@media (max-width: 768px) {
  .kqc-sticky-header.is-compact { position: sticky; top: 1rem; left: auto; margin: 0 auto; transform: none; }
  .header-section-a, .header-section-a.is-collapsed { max-height: none !important; overflow: visible; }
  .header-section-a.is-collapsed { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; border-bottom-color: var(--border-line, var(--border-grey)) !important; }
  .is-compact .compact-brand-link, .is-compact .compact-nav-links { display: none; }
  .is-compact .search-bar-container { display: block; }
  .header-inner-a { position: relative; flex-wrap: wrap; padding: 0.625rem 0.75rem; }
  .brand-logo-badge { width: 2.5rem !important; height: 2.5rem !important; font-size: 1rem !important; }
  .brand-info, .market-ticker-wrapper { display: none; }
  .mobile-nav-toggle { display: grid; margin-left: auto; }
  .main-nav-links {
    display: none;
    flex-basis: 100%;
    align-items: stretch;
    flex-direction: column;
    gap: 0;
    padding: 0.5rem 0;
  }
  .main-nav-links--open { display: flex; }
  .main-nav-links .nav-item { padding: 0.7rem 0.25rem; }
  .header-inner-b { flex-wrap: wrap; padding: 0 0.75rem; }
  .search-bar-container { order: 2; max-width: none; flex-basis: 100%; margin: 0; }
  .action-controls { width: 100%; justify-content: flex-end; }
  .user-name-badge { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .header-section-a, .ticker-text { transition: none; animation: none !important; }
}

@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

</style>
