<script setup lang="ts">
defineProps<{
  isEditMode: boolean
  formData: any
}>()

const emit = defineEmits<{
  (e: 'submitCase'): void
  (e: 'cancelEdit'): void
  (e: 'updateCaseId'): void
}>()
</script>

<template>
  <div class="form-section" :class="{ 'edit-mode-border': isEditMode }">
    <h3 class="form-title-text">
      {{ isEditMode ? '✏️ 正在修改案件：' + formData.caseId : '🚀 新增智慧案源櫥窗' }}
    </h3>
    
    <form @submit.prevent="emit('submitCase')">
      <div class="form-grid">
        <div class="form-group">
          <label>案件編號（連動生成）：</label>
          <input v-model="formData.caseId" type="text" disabled class="disabled-input" />
        </div>
        <div class="form-group">
          <label>案件標題：</label>
          <input v-model="formData.title" type="text" placeholder="例如: 隊長創業：貨櫃貨運業" required />
        </div>
        <div class="form-group">
          <label>案件性質：</label>
          <select v-model="formData.caseType" @change="emit('updateCaseId')" :disabled="isEditMode">
            <option value="seller">讓渡出讓 (Seller)</option>
            <option value="buyer">尋求買收 (Buyer)</option>
          </select>
        </div>
        <div class="form-group">
          <label>資產分類：</label>
          <select v-model="formData.leaseType" @change="emit('updateCaseId')" :disabled="isEditMode">
            <option value="甲種小客車">甲種小客車 (CA)</option>
            <option value="乙種小客車">乙種小客車 (CB)</option>
            <option value="計程車">計程車 (TX)</option>
            <option value="小貨車">小貨車 (LT)</option>
            <option value="搬家公司">搬家公司 (MV)</option>
            <option value="汽車貨運">汽車貨運 (FT)</option>
            <option value="貨櫃貨運">貨櫃貨運 (CT)</option>
          </select>
        </div>
        <div class="form-group">
          <label>區域分類：</label>
          <select v-model="formData.targetArea">
            <option value="北部地區">北部地區</option>
            <option value="中部地區">中部地區</option>
            <option value="南部地區">南部地區</option>
            <option value="東部地區">東部地區</option>
          </select>
        </div>
        <div class="form-group">
          <label>公司類型：</label>
          <select v-model="formData.companyType">
            <option value="有限公司">有限公司</option>
            <option value="股份有限公司">股份有限公司</option>
            <option value="車行">車行</option>
          </select>
        </div>
        <div class="form-group">
          <label>資本額 (萬NT，0代表不限)：</label>
          <input v-model.number="formData.capitalAmount" type="number" min="0" required />
        </div>
        <div class="form-group">
          <label>金額 (萬NT，0代表不限/電議)：</label>
          <input v-model.number="formData.price" type="number" min="0" required />
        </div>
        <div class="form-group">
          <label>上架初始狀態：</label>
          <select v-model="formData.caseStatus">
            <option value="selling">🚀 直接公開發布</option>
            <option value="preparation">📝 暫存為草稿隱藏</option>
          </select>
        </div>
      </div>

      <div class="form-group full-width-group">
        <label>核心需求與體質背景描述（前台精選櫥窗呈現）：</label>
        <textarea 
          v-model="formData.coreNeed" 
          rows="3" 
          placeholder="請輸入公司體質描述與債務背景限制..."
          required
        ></textarea>
      </div>

      <h4 class="sub-section-title">🔒 後臺 CRM 企業機密個資（前台自動遮蔽物理隔離）</h4>
      <div class="form-grid crm-grid">
        <div class="form-group">
          <label>客戶真實公司名稱：</label>
          <input v-model="formData.crmData.clientCompany" type="text" placeholder="真實行號公司" required />
        </div>
        <div class="form-group">
          <label>客戶聯絡負責人：</label>
          <input v-model="formData.crmData.clientName" type="text" placeholder="老闆或窗口姓名" required />
        </div>
        <div class="form-group">
          <label>負責人行動電話：</label>
          <input v-model="formData.crmData.clientMobile" type="text" placeholder="09xx-xxx-xxx" />
        </div>
        <div class="form-group">
          <label>內部業務追蹤備註：</label>
          <input v-model="formData.crmData.internalNotes" type="text" placeholder="僅限後台業務查閱的內部備註" />
        </div>
      </div>

      <div class="form-actions-buttons">
        <template v-if="isEditMode">
          <button type="submit" class="btn-submit btn-update-mode">💾 確定並覆蓋雲端庫</button>
          <button type="button" @click="emit('cancelEdit')" class="btn-switch-to-add">✨ 放棄修改，切換回全新新增</button>
        </template>
        <template v-else>
          <button type="submit" class="btn-submit">🚀 確認寫入 MongoDB 雲端庫</button>
        </template>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.form-section {
  background-color: var(--bg-surface, #1e293b);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--color-border, #334155);
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.edit-mode-border {
  border: 2px dashed #10b981;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}

.form-title-text {
  font-size: 1.15rem;
  color: #fff;
  font-weight: bold;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--color-accent, #eab308);
  padding-left: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.crm-grid {
  background: rgba(11, 15, 25, 0.4);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--color-border, #334155);
  margin-top: 0.5rem;
}

.sub-section-title {
  color: var(--color-text-muted, #94a3b8);
  font-size: 0.9rem;
  font-weight: bold;
  margin: 1.5rem 0 0.5rem 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  
  label {
    font-size: 0.85rem;
    color: var(--color-text-muted, #94a3b8);
    margin-bottom: 0.5rem;
  }
  
  input, select, textarea {
    background-color: var(--bg-main, #0b0f19);
    border: 1px solid var(--color-border, #334155);
    padding: 0.75rem;
    border-radius: 8px;
    color: #fff;
    font-size: 0.9rem;
    
    &:focus {
      border-color: var(--color-accent, #eab308);
      outline: none;
    }
  }
  
  .disabled-input {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--bg-surface, #1e293b);
  }
  
  textarea {
    resize: vertical;
  }
}

.full-width-group {
  grid-column: 1 / -1;
}

.form-actions-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-submit {
  flex: 1;
  padding: 1rem;
  background-color: var(--color-accent, #eab308);
  color: #0b0f19;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  
  &:hover {
    background-color: #ca8a04;
  }
}

.btn-update-mode {
  background-color: #10b981;
  color: #fff;
  &:hover { background-color: #059669; }
}

.btn-switch-to-add {
  padding: 1rem 1.5rem;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  font-weight: bold;
  font-size: 0.95rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ef4444;
    color: #fff;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
  }
}
</style>