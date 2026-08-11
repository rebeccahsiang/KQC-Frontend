<template>
  <!-- 全域訊息提示 Toast -->
  <Toast position="top-right" />

  <!-- 彈跳登入/註冊模態視窗 -->
  <Dialog
    v-model:visible="authStore.isAuthModalOpen"
    modal
    dismissableMask
    :style="{ width: '90vw', maxWidth: '520px' }"
    class="kqc-auth-dialog"
    :showHeader="false"
  >
    <div class="auth-dialog-content">
      <!-- 關閉按鈕 -->
      <button type="button" class="close-btn" title="關閉視窗" @click="authStore.closeAuthModal">
        <i class="pi pi-times"></i>
      </button>

      <!-- ================= 1. 登入卡片 (Login View) ================= -->
      <div v-if="authStore.authMode === 'login'" class="auth-card-wrapper">
        <div class="auth-header">
          <div class="brand-badge">KQC</div>
          <h2>歡迎回到三爵資訊</h2>
          <p>請輸入您的電子郵件與密碼登入戰情室</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="field-group">
            <label for="login-email">電子郵件 Email <span class="required-star">*</span></label>
            <InputText
              id="login-email"
              v-model="loginForm.email"
              type="email"
              placeholder="name@company.com"
              fluid
            />
          </div>

          <div class="field-group">
            <div class="label-row">
              <label for="login-password">登入密碼 Password <span class="required-star">*</span></label>
              <button
                type="button"
                class="link-btn text-link"
                @click="authStore.authMode = 'forgot'"
              >
                忘記密碼？
              </button>
            </div>
            <Password
              id="login-password"
              v-model="loginForm.password"
              placeholder="••••••••"
              :feedback="false"
              toggleMask
              fluid
            />
          </div>

          <Button
            type="submit"
            label="立即登入"
            :loading="isLoading"
            class="submit-btn kqc-primary-btn"
            fluid
          />
        </form>

        <div class="auth-footer">
          <span>還沒有帳號嗎？</span>
          <button
            type="button"
            class="link-btn highlight"
            @click="authStore.authMode = 'register'"
          >
            免費註冊會員
          </button>
        </div>
      </div>

      <!-- ================= 2. 會員註冊 (Stepper Step-by-Step) ================= -->
      <div v-else-if="authStore.authMode === 'register'" class="auth-card-wrapper">
        <div class="auth-header">
          <h2>建立三爵會員帳號</h2>
          <p>完成 3 步驟，開啟 B2B 資產交易與 AI 語意配對服務</p>
        </div>

        <Stepper v-model:value="activeStep" class="register-stepper">
          <StepList class="stepper-header-custom">
            <Step v-slot="{ value }" asChild :value="1">
              <div class="step-node">
                <span :class="['node-circle', { active: Number(value) <= activeStep }]">1</span>
                <span class="step-label">基本資料</span>
              </div>
            </Step>
            <Divider />
            <Step v-slot="{ value }" asChild :value="2">
              <div class="step-node">
                <span :class="['node-circle', { active: Number(value) <= activeStep }]">2</span>
                <span class="step-label">產業意向</span>
              </div>
            </Step>
            <Divider />
            <Step v-slot="{ value }" asChild :value="3">
              <div class="step-node">
                <span :class="['node-circle', { active: Number(value) <= activeStep }]">3</span>
                <span class="step-label">完成註冊</span>
              </div>
            </Step>
          </StepList>

          <StepPanels>
            <!-- 步驟一：基本帳號資料 (已拆分姓名與車行名稱) -->
            <StepPanel v-slot="{ activateCallback }" :value="1">
              <div class="step-content">
                <div class="field-group">
                  <label>您的姓名 / 聯絡人 <span class="required-star">*</span></label>
                  <InputText
                    v-model="registerForm.name"
                    placeholder="例：張經理"
                    fluid
                  />
                </div>
                <div class="field-group">
                  <label>車行 / 公司名稱 <span class="required-star">*</span></label>
                  <InputText
                    v-model="registerForm.companyName"
                    placeholder="例：三爵客運股份有限公司"
                    fluid
                  />
                </div>
                <div class="field-group">
                  <label>電子郵件 Email <span class="required-star">*</span></label>
                  <InputText
                    v-model="registerForm.email"
                    type="email"
                    placeholder="service@kqc.com.tw"
                    fluid
                  />
                </div>
                <div class="field-group password-field-group">
                  <label>設定密碼 <span class="required-star">*</span></label>
                  <Password
                    v-model="registerForm.password"
                    placeholder="至少 8 位數含英數字"
                    toggleMask
                    fluid
                  />
                </div>
              </div>
              <div class="step-actions flex-end">
                <Button label="下一步" icon="pi pi-arrow-right" iconPos="right" class="kqc-primary-btn" @click="handleStep1Next(activateCallback)" />
              </div>
            </StepPanel>

            <!-- 步驟二：產業意向選取 (標準 3 欄靠左對齊) -->
            <StepPanel v-slot="{ activateCallback }" :value="2">
              <div class="step-content">
                <p class="step-subtitle">選擇您關注的運輸資產類型（可複選）</p>
                <div class="interests-grid">
                  <ToggleButton
                    v-for="item in interestOptions"
                    :key="item.key"
                    v-model="registerForm.interests[item.key]"
                    :onLabel="item.label"
                    :offLabel="item.label"
                    class="interest-chip"
                  />
                </div>
              </div>
              <div class="step-actions flex-between">
                <Button label="上一步" severity="secondary" variant="outlined" icon="pi pi-arrow-left" @click="activateCallback(1)" />
                <Button label="完成註冊" icon="pi pi-check" :loading="isLoading" class="kqc-primary-btn" @click="handleRegister" />
              </div>
            </StepPanel>

            <!-- 步驟三：註冊成功引導 -->
            <StepPanel :value="3">
              <div class="step-content success-box">
                <i class="pi pi-check-circle success-icon"></i>
                <h3>會員帳號建立成功！</h3>
                <p>系統已同步開啟您的專屬權限，歡迎開始使用全域語意搜尋與賣場媒合。</p>
              </div>
              <div class="step-actions flex-center">
                <Button label="立即進入系統" class="kqc-primary-btn" @click="finishRegister" />
              </div>
            </StepPanel>
          </StepPanels>
        </Stepper>

        <div class="auth-footer">
          <span>已有帳號？</span>
          <button
            type="button"
            class="link-btn highlight"
            @click="authStore.authMode = 'login'"
          >
            直接登入
          </button>
        </div>
      </div>

      <!-- ================= 3. 忘記密碼 (Forgot Password - 含 Email/簡訊雙通道) ================= -->
      <div v-else-if="authStore.authMode === 'forgot'" class="auth-card-wrapper">
        <div class="auth-header">
          <h2>重設您的密碼</h2>
          <p>請選擇您希望接收驗證碼的方式</p>
        </div>

        <div class="reset-type-selector">
          <button
            type="button"
            :class="['type-tab', { active: resetMethod === 'email' }]"
            @click="resetMethod = 'email'"
          >
            <i class="pi pi-envelope"></i> 電子郵件信箱
          </button>
          <button
            type="button"
            :class="['type-tab', { active: resetMethod === 'phone' }]"
            @click="resetMethod = 'phone'"
          >
            <i class="pi pi-mobile"></i> 手機簡訊 (SMS)
          </button>
        </div>

        <form @submit.prevent="handleForgotPassword" class="auth-form">
          <div v-if="resetMethod === 'email'" class="field-group">
            <label for="forgot-email">電子郵件 Email <span class="required-star">*</span></label>
            <InputText
              id="forgot-email"
              v-model="forgotEmail"
              type="email"
              placeholder="name@company.com"
              fluid
            />
          </div>

          <div v-else class="field-group">
            <label for="forgot-phone">台灣手機號碼 <span class="required-star">*</span></label>
            <InputText
              id="forgot-phone"
              v-model="forgotPhone"
              type="tel"
              placeholder="0912345678"
              fluid
            />
          </div>

          <Button
            type="submit"
            :label="resetMethod === 'email' ? '發送重設郵件' : '發送簡訊驗證碼'"
            :loading="isLoading"
            class="submit-btn kqc-primary-btn"
            fluid
          />
        </form>

        <div class="auth-footer">
          <button
            type="button"
            class="link-btn text-link"
            @click="authStore.authMode = 'login'"
          >
            <i class="pi pi-arrow-left"></i> 返回登入
          </button>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type AdminUser } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'

import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Stepper from 'primevue/stepper'
import StepList from 'primevue/steplist'
import Step from 'primevue/step'
import StepPanels from 'primevue/steppanels'
import StepPanel from 'primevue/steppanel'
import ToggleButton from 'primevue/togglebutton'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const isLoading = ref<boolean>(false)
const activeStep = ref<number>(1)

// 模擬 DB 中已被註冊的 Email 清單 (防止重複註冊)
const registeredEmails = ref<string[]>([
  'service@kqc.com.tw',
  'kitty@kqj.com.tw',
  'admin@kqc.com.tw'
])

// 忘記密碼通道切換
const resetMethod = ref<'email' | 'phone'>('email')
const forgotEmail = ref<string>('')
const forgotPhone = ref<string>('')

// 表單狀態
const loginForm = reactive({ email: '', password: '' })

const registerForm = reactive({
  name: '',
  companyName: '',
  email: '',
  password: '',
  interests: {
    taxi: false,
    truck: false,
    bus: false,
    license: false,
    container: false
  } as Record<string, boolean>
})

const interestOptions = [
  { key: 'taxi', label: '計程車牌/車隊' },
  { key: 'truck', label: '甲種/乙種大貨車' },
  { key: 'bus', label: '遊覽車/客運特許' },
  { key: 'license', label: '特許營業執照讓渡' },
  { key: 'container', label: '貨櫃碼頭運輸' }
]

// 重置表單狀態
const resetForms = () => {
  activeStep.value = 1
  loginForm.email = ''
  loginForm.password = ''
  forgotEmail.value = ''
  forgotPhone.value = ''
  registerForm.name = ''
  registerForm.companyName = ''
  registerForm.email = ''
  registerForm.password = ''
  Object.keys(registerForm.interests).forEach((key) => {
    registerForm.interests[key] = false
  })
}

watch(
  () => authStore.isAuthModalOpen,
  (isOpen) => {
    if (isOpen) resetForms()
  }
)

watch(
  () => authStore.authMode,
  () => {
    resetForms()
  }
)

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ----------------------------------------------------
// 1. 登入防呆驗證
// ----------------------------------------------------
const handleLogin = async () => {
  const email = loginForm.email.trim()
  const password = loginForm.password.trim()

  if (!email || !isValidEmail(email)) {
    toast.add({
      severity: 'warn',
      summary: '格式不正確',
      detail: '請輸入有效的電子郵件格式（例：name@company.com）。',
      life: 3000
    })
    return
  }

  if (!password || password.length < 6) {
    toast.add({
      severity: 'warn',
      summary: '密碼未填寫',
      detail: '請輸入至少 6 位數的登入密碼。',
      life: 3000
    })
    return
  }

  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const isAdminUser = email.includes('admin')
    const mockUser: AdminUser = {
      _id: 'u_' + Date.now(),
      username: email.split('@')[0] || 'kqc_user',
      name: isAdminUser ? '系統管理員' : email.split('@')[0] || '三爵會員',
      email: email,
      role: isAdminUser ? 'admin' : 'user'
    }

    authStore.setAuthData(mockUser, 'jwt_token_' + Date.now())

    toast.add({
      severity: 'success',
      summary: '登入成功',
      detail: `歡迎回到三爵資訊，${mockUser.name}`,
      life: 3000
    })

    if (mockUser.role === 'admin') {
      router.push('/admin/dashboard')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '登入失敗',
      detail: '帳號或密碼錯誤，請重新核對。',
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
}

// ----------------------------------------------------
// 2. 註冊步驟一防呆（含重複 Email 阻擋）
// ----------------------------------------------------
const handleStep1Next = (activateCallback: (step: number) => void) => {
  const name = registerForm.name.trim()
  const company = registerForm.companyName.trim()
  const email = registerForm.email.trim().toLowerCase()
  const password = registerForm.password

  if (!name || !company) {
    toast.add({
      severity: 'warn',
      summary: '基本資料未填寫',
      detail: '請填寫聯絡人姓名與車行/公司名稱。',
      life: 3000
    })
    return
  }

  if (!email || !isValidEmail(email)) {
    toast.add({
      severity: 'warn',
      summary: 'Email 格式錯誤',
      detail: '請輸入格式正確的電子郵件。',
      life: 3000
    })
    return
  }

  // 重複註冊阻擋核心邏輯
  if (registeredEmails.value.includes(email)) {
    toast.add({
      severity: 'error',
      summary: '帳號已存在',
      detail: `信箱 ${email} 已在三爵資訊註冊，請直接登入或使用忘記密碼。`,
      life: 4000
    })
    return
  }

  if (!password || password.length < 8) {
    toast.add({
      severity: 'warn',
      summary: '密碼強度不足',
      detail: '密碼長度至少需要 8 位數。',
      life: 3000
    })
    return
  }

  activateCallback(2)
}

// ----------------------------------------------------
// 3. 註冊步驟二提交
// ----------------------------------------------------
const handleRegister = async () => {
  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // 註冊成功後將該 Email 寫入模擬 DB 清單
    registeredEmails.value.push(registerForm.email.trim().toLowerCase())
    
    activeStep.value = 3
    toast.add({
      severity: 'success',
      summary: '帳號建立成功',
      detail: '您的三爵會員帳號已順利建立！',
      life: 3000
    })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: '註冊失敗',
      detail: '伺服器連線異常，請稍後再試。',
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
}

// ----------------------------------------------------
// 4. 完成註冊並自動登入
// ----------------------------------------------------
const finishRegister = () => {
  const newUser: AdminUser = {
    _id: 'u_' + Date.now(),
    username: registerForm.email.split('@')[0] || 'kqc_user',
    name: `${registerForm.companyName} (${registerForm.name})`,
    email: registerForm.email.trim(),
    role: 'user'
  }

  authStore.setAuthData(newUser, 'jwt_token_' + Date.now())

  toast.add({
    severity: 'info',
    summary: '歡迎加入三爵資訊',
    detail: `已為 ${newUser.name} 開啟全域語意搜尋與 AI 配對權限。`,
    life: 4000
  })
}

// ----------------------------------------------------
// 5. 忘記密碼
// ----------------------------------------------------
const handleForgotPassword = async () => {
  if (resetMethod.value === 'email') {
    if (!forgotEmail.value.trim() || !isValidEmail(forgotEmail.value.trim())) {
      toast.add({
        severity: 'warn',
        summary: 'Email 格式錯誤',
        detail: '請輸入有效電子郵件。',
        life: 3000
      })
      return
    }
  } else {
    if (!forgotPhone.value.trim() || forgotPhone.value.length < 10) {
      toast.add({
        severity: 'warn',
        summary: '手機號碼不完整',
        detail: '請輸入 10 位數台灣手機號碼（例：0912345678）。',
        life: 3000
      })
      return
    }
  }

  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    const targetInfo = resetMethod.value === 'email' ? forgotEmail.value : forgotPhone.value
    toast.add({
      severity: 'success',
      summary: '驗證訊息已發送',
      detail: `已發送重設資訊至 ${targetInfo}`,
      life: 4000
    })
    authStore.authMode = 'login'
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '發送失敗',
      detail: '請確認輸入資料是否正確。',
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-dialog-content {
  position: relative;
  padding: 1.75rem;
  background-color: var(--bg-card, #ffffff);

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    font-size: 1.25rem;
    color: #64748b;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #1e293b;
    }
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;

  .brand-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: #eab308;
    color: #1e293b;
    font-weight: 700;
    font-size: 0.875rem;
    border-radius: 9999px;
    margin-bottom: 0.5rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.35rem 0;
  }

  p {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #1e293b;

      .required-star {
        color: #ef4444;
        margin-left: 2px;
      }
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  /* 核心修正：強制深色按鈕與白色對比文字 */
  .kqc-primary-btn,
  .submit-btn {
    background-color: #1e293b !important;
    border-color: #1e293b !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    padding: 0.65rem 1rem !important;

    &:hover {
      background-color: #334155 !important;
      border-color: #334155 !important;
    }
  }
}

.auth-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.875rem;
  cursor: pointer;

  &.text-link {
    color: #64748b;
    &:hover { color: #eab308; }
  }

  &.highlight {
    color: #eab308;
    font-weight: 700;
    &:hover { text-decoration: underline; }
  }
}

/* Stepper 客製化導覽標籤 */
.register-stepper {
  margin-bottom: 1rem;

  .stepper-header-custom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .step-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;

    .node-circle {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      border: 2px solid #e2e8f0;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      color: #64748b;
      transition: all 0.2s ease;

      &.active {
        background-color: #1e293b;
        border-color: #1e293b;
        color: #eab308;
      }
    }

    .step-label {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }
  }

  .step-content {
    padding: 0.5rem 0;
  }

  /* 3 欄靠左對齊網格 */
  .interests-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    padding: 0.5rem 0;

    .interest-chip {
      width: 100%;
      font-size: 0.85rem;
      justify-content: center;
    }
  }

  .step-actions {
    display: flex;
    padding-top: 1rem;

    &.flex-end { justify-content: flex-end; }
    &.flex-between { justify-content: space-between; }
    &.flex-center { justify-content: center; }
  }

  .success-box {
    text-align: center;
    padding: 1.25rem 0;

    .success-icon {
      font-size: 3.5rem;
      color: #22c55e;
      margin-bottom: 0.75rem;
    }

    h3 {
      font-size: 1.25rem;
      color: #1e293b;
      margin-bottom: 0.35rem;
    }

    p {
      font-size: 0.875rem;
      color: #64748b;
    }
  }
}

/* 忘記密碼通道頁籤 */
.reset-type-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;

  .type-tab {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 8px;
    font-size: 0.85rem;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    transition: all 0.2s ease;

    &.active {
      background: #1e293b;
      color: #eab308;
      border-color: #1e293b;
      font-weight: 600;
    }
  }
}
</style>