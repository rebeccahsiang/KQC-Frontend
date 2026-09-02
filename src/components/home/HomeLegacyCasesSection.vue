<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { publicMarketplaceImageUrl, type PublicMarketplaceCase } from '@/api/publicMarketplace'

const props = defineProps<{ cases: PublicMarketplaceCase[]; loading?: boolean; error?: string | null }>()
// HOME-R1E — Latest Marketplace Presentation / Backend publication order remains authoritative; Home renders only its first two records.
const latestCases = computed(() => props.cases.slice(0, 2))
const capital = (value: number) => new Intl.NumberFormat('zh-TW', {
  style: 'currency', currency: 'TWD', maximumFractionDigits: 0,
}).format(value || 0)
</script>

<template>
  <section class="kqc-card-block home-marketplace" aria-labelledby="home-marketplace-title">
    <div class="block-header-between home-marketplace__header">
      <h2 id="home-marketplace-title" class="block-section-title"><Icon icon="lucide:store" aria-hidden="true" />商品櫥窗</h2>
      <RouterLink :to="{ name: 'Products', hash: '#marketplace-cases' }" class="link-gold-more">查看更多商品 →</RouterLink>
    </div>

    <p v-if="loading" class="home-marketplace__state" role="status">正在載入商品案件…</p>
    <p v-else-if="error" class="home-marketplace__state" role="alert">{{ error }}</p>
    <p v-else-if="!latestCases.length" class="home-marketplace__state">目前尚無公開商品案件。</p>
    <div v-else class="home-marketplace__grid">
      <RouterLink
        v-for="item in latestCases"
        :key="item.caseId"
        :to="{ name: 'Products', hash: '#marketplace-cases' }"
        class="home-marketplace-card"
      >
        <div class="home-marketplace-card__media">
          <img
            v-if="item.representativeImage"
            :src="publicMarketplaceImageUrl(item.representativeImage.imageUrl)"
            :alt="`${item.title}代表圖片`"
            loading="lazy"
          />
          <div v-else class="home-marketplace-card__fallback" role="img" :aria-label="`${item.title}尚未設定代表圖片`">KQC</div>
        </div>
        <div class="home-marketplace-card__body">
          <div class="home-marketplace-card__badges"><span>{{ item.transactionType }}</span><span>{{ item.businessCategory }}</span></div>
          <h3>{{ item.title }}</h3>
          <p class="home-marketplace-card__number">{{ item.caseId }}</p>
          <p class="home-marketplace-card__meta"><span>{{ item.targetArea }}</span><span>{{ item.companyType }}</span></p>
          <p class="home-marketplace-card__capital">資本額 <strong>{{ capital(item.capitalAmount) }}</strong></p>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
