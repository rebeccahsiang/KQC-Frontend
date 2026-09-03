<script setup lang="ts">
import { Icon } from '@iconify/vue'
import businessOwnerImage from '@/assets/images/home/personas/business-owner.png'
import digitalTransformationImage from '@/assets/images/home/personas/digital-transformation.png'
import parkingOperatorImage from '@/assets/images/home/personas/parking-operator.png'
import professionalDriverImage from '@/assets/images/home/personas/professional-driver.png'
import retirementSuccessionImage from '@/assets/images/home/personas/retirement-succession.png'
import startupFounderImage from '@/assets/images/home/personas/startup-founder.png'

// HOME-R1C — Persona Authority / static business situations remain presentation-only until illustration activation.
const personas = [
  { title: '退休傳承', description: '想把多年事業安心交棒', image: retirementSuccessionImage },
  { title: '經營業主', description: '想讓公司經營得更穩更有效率', image: businessOwnerImage },
  { title: '準備創業', description: '想進入運輸產業，卻不知道從哪開始', image: startupFounderImage },
  { title: '轉型升級', description: '想導入網站、系統與數位工具', image: digitalTransformationImage },
  { title: '停車場業者', description: '有場地資源，希望找合作機會', image: parkingOperatorImage },
  { title: '駕駛夥伴們', description: '尋找工作、車隊或合作機會', image: professionalDriverImage },
] as const
</script>

<template>
  <section class="kqc-card-block home-personas" aria-labelledby="home-personas-title">
    <header class="home-personas__heading">
      <h2 id="home-personas-title" class="block-section-title"><Icon icon="lucide:users-round" aria-hidden="true" />我們服務的對象</h2>
      <p>我們始終以客戶為先</p>
    </header>
    <div class="home-personas__grid">
      <article v-for="persona in personas" :key="persona.title" class="home-persona">
        <div class="home-persona__visual">
          <img :src="persona.image" :alt="persona.title" />
        </div>
        <h3>{{ persona.title }}</h3>
        <p>{{ persona.description }}</p>
      </article>
    </div>
  </section>
</template>
