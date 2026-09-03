<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { createMarquee, deleteMarquee, getAdminMarquees, updateMarquee, type AdminMarquee, type MarqueeInput, type MarqueeStatus } from '@/api/marquees'

const marquees = ref<AdminMarquee[]>([])
const loading = ref(false); const mutating = ref(false); const deletingId = ref(''); const errorMessage = ref(''); const feedback = ref('')
const dialogVisible = ref(false); const editingId = ref('')
const form = reactive<MarqueeInput>({ content: '', status: 'ACTIVE', sortOrder: 0 })
const statusOptions: { label: string; value: MarqueeStatus }[] = [{ label: '啟用', value: 'ACTIVE' }, { label: '停用', value: 'INACTIVE' }]

// MARQUEE-R1 — Marquee Admin Management / Backend state is reloaded after every confirmed mutation.
const loadMarquees = async () => { loading.value = true; errorMessage.value = ''; try { const response = await getAdminMarquees(); marquees.value = response.data.marquees } catch { errorMessage.value = '跑馬燈公告載入失敗，請稍後再試。' } finally { loading.value = false } }
const openCreate = () => { editingId.value = ''; Object.assign(form, { content: '', status: 'ACTIVE', sortOrder: 0 }); dialogVisible.value = true; errorMessage.value = '' }
const openEdit = (item: AdminMarquee) => { editingId.value = item.id; Object.assign(form, { content: item.content, status: item.status, sortOrder: item.sortOrder }); dialogVisible.value = true; errorMessage.value = '' }
const saveMarquee = async () => { if (mutating.value || !form.content.trim() || form.content.trim().length > 160 || !Number.isInteger(form.sortOrder)) return; mutating.value = true; errorMessage.value = ''; try { const input = { content: form.content.trim(), status: form.status, sortOrder: form.sortOrder }; if (editingId.value) await updateMarquee(editingId.value, input); else await createMarquee(input); dialogVisible.value = false; feedback.value = editingId.value ? '跑馬燈公告已更新。' : '跑馬燈公告已新增。'; await loadMarquees() } catch { errorMessage.value = '跑馬燈公告儲存失敗，請確認內容後再試。' } finally { mutating.value = false } }
const removeMarquee = async (item: AdminMarquee) => { if (deletingId.value || mutating.value || !window.confirm(`確定要刪除「${item.content}」嗎？`)) return; deletingId.value = item.id; errorMessage.value = ''; try { await deleteMarquee(item.id); feedback.value = '跑馬燈公告已刪除。'; await loadMarquees() } catch { errorMessage.value = '跑馬燈公告刪除失敗，請稍後再試。' } finally { deletingId.value = '' } }
onMounted(loadMarquees)
</script>

<template>
  <div class="space-y-6">
    <!-- 頁面標頭 -->
    <div class="flex items-center justify-between pb-2 border-b border-slate-800">
      <h2 class="text-xl font-bold tracking-wide text-white flex items-center gap-2.5">
        <span class="w-1.5 h-6 bg-[var(--accent)] rounded-full"></span>
        前台公告與跑馬燈廣播管理
      </h2>
      <button type="button" class="px-4 py-2 bg-[var(--accent)] hover:bg-[#FACC15] text-slate-900 font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 shadow-md" :disabled="loading || mutating" @click="openCreate">
        <Icon icon="lucide:plus" class="w-4 h-4" />
        新增廣播公告
      </button>
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <Message v-if="feedback" severity="success" :closable="false" role="status">{{ feedback }}</Message>
    <p v-if="loading" role="status" class="text-slate-300">正在載入跑馬燈公告…</p>
    <div v-else class="bg-[var(--primary)]/60 border border-slate-700/50 rounded-xl p-6 shadow-xl space-y-4">
      <p v-if="!marquees.length" class="text-slate-300 text-center">目前尚無跑馬燈公告。</p>
      <div v-for="item in marquees" :key="item.id" class="flex items-center justify-between p-4 bg-slate-800/80 rounded-lg border border-slate-700/40">
        <div class="flex items-center gap-3">
          <span class="text-xs px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded font-mono">
            {{ item.status === 'ACTIVE' ? '啟用' : '停用' }} · {{ item.sortOrder }}
          </span>
          <span class="text-sm text-slate-200">{{ item.content }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-amber-400 rounded transition-colors" title="編輯" :disabled="mutating || Boolean(deletingId)" @click="openEdit(item)">
            <Icon icon="lucide:edit-3" class="w-4 h-4" />
          </button>
          <button type="button" class="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded transition-colors" title="刪除" :disabled="mutating || Boolean(deletingId)" @click="removeMarquee(item)">
            <Icon icon="lucide:trash-2" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    <Dialog v-model:visible="dialogVisible" modal :header="editingId ? '編輯廣播公告' : '新增廣播公告'" :style="{ width: 'min(36rem, calc(100vw - 2rem))' }">
      <form class="marquee-form" @submit.prevent="saveMarquee">
        <label for="marquee-content">公告內容<Textarea id="marquee-content" v-model="form.content" rows="4" maxlength="160" required /><small>{{ form.content.length }}/160</small></label>
        <label for="marquee-status">狀態<Select id="marquee-status" v-model="form.status" :options="statusOptions" option-label="label" option-value="value" /></label>
        <label for="marquee-sort-order">排序<InputNumber id="marquee-sort-order" v-model="form.sortOrder" :min="-9999" :max="9999" :step="1" :min-fraction-digits="0" :max-fraction-digits="0" required /><small>數字越小越前面。</small></label>
        <footer><Button type="button" label="取消" text :disabled="mutating" @click="dialogVisible = false" /><Button type="submit" label="儲存" :loading="mutating" :disabled="mutating || !form.content.trim() || form.content.trim().length > 160" /></footer>
      </form>
    </Dialog>
  </div>
</template>

<style scoped>
.marquee-form,.marquee-form label { display: grid; gap: .5rem; }.marquee-form footer { display: flex; justify-content: flex-end; gap: .5rem; }.marquee-form small { color: var(--text-muted); }
</style>
