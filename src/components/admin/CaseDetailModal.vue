<script setup lang="ts">
defineProps<{
  activeDetail: any
  statusTextMap: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div class="kqc-modal-overlay" @click.self="emit('close')">
    <div class="kqc-modal-content">
      <div class="modal-header">
        <h3>🔒 案件完整機密檔案查閱庫 (KQC-Internal)</h3>
        <button @click="emit('close')" class="btn-close-modal">✖</button>
      </div>
      <div class="modal-body">
        <table class="detail-modal-table">
          <tbody>
            <tr>
              <th>案件編號 / 狀態</th>
              <td><span class="text-gold">{{ activeDetail.caseId }}</span> / {{ statusTextMap[activeDetail.caseStatus] }}</td>
            </tr>
            <tr>
              <th>案件標題 / 區域地區</th>
              <td class="text-white font-bold">{{ activeDetail.title }} / 📍 {{ activeDetail.targetArea }}</td>
            </tr>
            <tr>
              <th>性質 / 車種分類</th>
              <td>{{ activeDetail.caseType === 'seller' ? '🟥 出讓 (Seller)' : '🟩 買收 (Buyer)' }} / {{ activeDetail.leaseType }} ({{ activeDetail.companyType }})</td>
            </tr>
            <tr>
              <th>資本額 / 交易金額</th>
              <td>資本額: {{ activeDetail.capitalAmount }} 萬 / 預算金額: {{ activeDetail.price === 0 ? '電議' : activeDetail.price + ' 萬' }}</td>
            </tr>
            <tr>
              <th>前台精選櫥窗內文</th>
              <td class="text-gray-desc">{{ activeDetail.coreNeed }}</td>
            </tr>
            <tr class="crm-section-row">
              <th>CRM 客戶公司名稱</th>
              <td class="text-gold font-bold">{{ activeDetail.crmData?.clientCompany || '未填寫' }}</td>
            </tr>
            <tr class="crm-section-row">
              <th>CRM 聯絡負責人</th>
              <td>{{ activeDetail.crmData?.clientName || '未填寫' }}</td>
            </tr>
            <tr class="crm-section-row">
              <th>CRM 負責人電話</th>
              <td>{{ activeDetail.crmData?.clientMobile || '未填寫' }}</td>
            </tr>
            <tr class="crm-section-row">
              <th>內部專屬業務備註</th>
              <td class="text-green-desc">{{ activeDetail.crmData?.internalNotes || '無內部備註' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button @click="emit('close')" class="btn-modal-done">關閉隱私查閱視窗</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.kqc-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.kqc-modal-content {
  background-color: var(--bg-surface, var(--primary));
  width: 90%;
  max-width: 650px;
  border-radius: 16px;
  border: 1px solid var(--color-accent, var(--accent));
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  padding: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border, #334155);
  padding-bottom: 0.75rem;
  
  h3 {
    color: var(--color-accent, var(--accent));
    margin: 0;
    font-size: 1.1rem;
    font-weight: bold;
  }
}

.btn-close-modal {
  background: none;
  border: none;
  color: var(--color-text-muted, #94a3b8);
  font-size: 1.2rem;
  cursor: pointer;
  &:hover { color: #fff; }
}

.modal-body {
  margin-top: 1rem;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-modal-table {
  width: 100%;
  border-collapse: collapse;
  
  th {
    width: 30%;
    background-color: var(--bg-main, var(--bg-main));
    color: var(--color-text-muted, #94a3b8);
    text-align: left;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    border-bottom: 1px solid var(--bg-surface, var(--primary));
  }
  
  td {
    background-color: #131d31;
    color: var(--color-text-main, var(--bg-main));
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.9rem;
    border-bottom: 1px solid var(--bg-surface, var(--primary));
  }
  
  .crm-section-row th {
    background: rgba(234, 179, 8, 0.1);
    color: var(--color-accent, var(--accent));
  }
  
  .crm-section-row td {
    background: rgba(234, 179, 8, 0.03);
  }
  
  .text-white { color: #fff; }
  .text-gold { color: var(--color-accent, var(--accent)); }
  .text-gray-desc { color: #cbd5e1; font-size: 0.85rem; line-height: 1.4; }
  .text-green-desc { color: #34d399; font-weight: bold; }
}

.modal-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.btn-modal-done {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-accent, var(--accent));
  color: var(--bg-main);
  font-weight: bold;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #ca8a04;
  }
}
</style>