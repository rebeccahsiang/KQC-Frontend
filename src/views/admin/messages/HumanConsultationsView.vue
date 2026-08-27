<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { isAxiosError } from 'axios'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import {
  adminHumanConsultationsApi,
  type HumanConsultationAdminItem,
  type HumanConsultationServiceType,
  type HumanConsultationStatus,
} from '@/api/adminHumanConsultations'

const SERVICE_LABELS: Record<HumanConsultationServiceType, string> = {
  'asset-trade': '資產買賣',
  website: '網站架設',
  'vehicle-quota': '車額買賣',
  'parking-proof': '停車位證明',
}
const STATUS_LABELS: Record<HumanConsultationStatus, string> = {
  PENDING_CONTACT: '待聯絡',
  CONTACTED: '已聯絡',
}

const requests = ref<HumanConsultationAdminItem[]>([])
const loading = ref(false)
const updatingId = ref('')
const errorMessage = ref('')

const backendMessage = (error: unknown) => isAxiosError(error)
  ? (error.response?.data as { error?: { message?: string } })?.error?.message || '真人諮詢需求操作失敗。'
  : '無法連線至伺服器。'
const formatCreatedAt = (value: string) => new Intl.DateTimeFormat('zh-TW', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value))

const loadRequests = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await adminHumanConsultationsApi.list()
    requests.value = response.data.requests
  } catch (error) {
    errorMessage.value = backendMessage(error)
  } finally {
    loading.value = false
  }
}

const markContacted = async (item: HumanConsultationAdminItem) => {
  if (updatingId.value) return
  updatingId.value = item.id
  errorMessage.value = ''
  try {
    const response = await adminHumanConsultationsApi.updateStatus(item.id, 'CONTACTED')
    const index = requests.value.findIndex(({ id }) => id === item.id)
    if (index >= 0) requests.value[index] = response.data.request
  } catch (error) {
    errorMessage.value = backendMessage(error)
  } finally {
    updatingId.value = ''
  }
}

onMounted(loadRequests)
</script>

<template>
  <section class="human-consultation-admin">
    <header>
      <div><p class="eyebrow">訊息管理</p><h1>真人諮詢需求</h1></div>
    </header>
    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <DataTable :value="requests" :loading="loading" striped-rows empty-message="目前沒有真人諮詢需求。">
      <Column header="建立時間"><template #body="{ data }">{{ formatCreatedAt(data.createdAt) }}</template></Column>
      <Column field="name" header="姓名" />
      <Column header="電話"><template #body="{ data }"><a :href="`tel:${data.phone}`">{{ data.phone }}</a></template></Column>
      <Column header="需求類型"><template #body="{ data }"><span v-for="type in data.serviceTypes" :key="type" class="service-label">{{ SERVICE_LABELS[type as HumanConsultationServiceType] }}</span></template></Column>
      <Column header="狀態"><template #body="{ data }"><Tag :value="STATUS_LABELS[data.status as HumanConsultationStatus]" :severity="data.status === 'CONTACTED' ? 'success' : 'warn'" /></template></Column>
      <Column header="操作"><template #body="{ data }"><Button v-if="data.status === 'PENDING_CONTACT'" label="標記已聯絡" size="small" :loading="updatingId === data.id" :disabled="Boolean(updatingId)" @click="markContacted(data)" /></template></Column>
    </DataTable>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.human-consultation-admin { display: grid; gap: $kqc-spacing-lg; }
.human-consultation-admin header { display: flex; align-items: center; justify-content: space-between; }
.human-consultation-admin h1 { margin: 0; color: var(--text-main); font-size: $kqc-type-section-title; }
.eyebrow { margin: 0 0 $kqc-spacing-xs; color: var(--accent-active); font-size: $kqc-type-label; font-weight: 700; }
.service-label { display: inline-block; margin: $kqc-spacing-3xs; padding: $kqc-spacing-2xs $kqc-spacing-sm; border: 1px solid var(--border-grey); border-radius: $kqc-radius-full; }
a { color: var(--accent-active); font-weight: 700; }
</style>
