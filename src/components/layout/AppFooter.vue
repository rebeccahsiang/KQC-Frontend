<template>
  <footer class="bg-[var(--bg-card)] border-t border-[var(--border-color)] py-8 px-6 text-sm text-[var(--text-muted)] transition-colors duration-300">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- 1. 左側：品牌標誌與版權宣告 -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-[var(--brand-primary)] rounded flex items-center justify-center font-bold text-slate-900 text-sm">
          KQC
        </div>
        <div>
          <p class="font-semibold text-[var(--text-main)]">三爵資訊 (KQC) B2B 智慧運輸與資產交易平台</p>
          <p class="text-xs text-[var(--text-muted)]">© 2026 三爵資訊 All Rights Reserved. 傳統產能數位賦能專案</p>
        </div>
      </div>

      <!-- 2. 右側：專題報告人與技術棧資訊 -->
      <div class="text-center md:text-right text-xs">
        <p><span class="text-[var(--brand-primary)] font-medium">報告人：</span>項圓芬 (座號 3 號)</p>
        <p class="text-[var(--text-muted)] mt-0.5">Vue 3 + SCSS + Express + MongoDB + LINE Bot + Qwen2.5 AI</p>
      </div>
    </div>
  </footer>
</template>