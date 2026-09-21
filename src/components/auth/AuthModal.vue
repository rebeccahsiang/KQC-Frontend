<template>
  <!-- 全域訊息提示 Toast -->
  <Toast position="top-right" />

  <!-- 彈跳登入/註冊模態視窗 -->
  <Dialog
    v-model:visible="authStore.isAuthModalOpen"
    modal
    dismissableMask
    :style="{ width: '90vw', maxWidth: '520px' }"
    :class="['kqc-auth-dialog', { 'kqc-auth-dialog--register': authStore.authMode === 'register' }]"
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
          <div class="brand-badge">KQJ</div>
          <h2>會員登入</h2>
          <p>請輸入您的帳號與密碼登入會員中心。</p>
        </div>

        <Message
          v-if="authStore.authPromptMessage"
          severity="info"
          :closable="false"
          role="status"
        >
          {{ authStore.authPromptMessage }}
        </Message>

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
                忘記密碼？              </button>
            </div>
            <Password
              id="login-password"
              v-model="loginForm.password"
              placeholder="請輸入密碼"
              :feedback="false"
              toggleMask
              fluid
            />
          </div>

          <Button
            type="submit"
            label="會員登入"
            :loading="isLoading"
            class="submit-btn kqc-primary-btn"
            fluid
          />
        </form>

        <div class="auth-footer">
          <span>還沒有會員帳號？</span>
          <button
            type="button"
            class="link-btn highlight"
            @click="authStore.authMode = 'register'"
          >
            立即註冊會員
          </button>
        </div>
      </div>

      <!-- ================= 2. 會員註冊 (Stepper Step-by-Step) ================= -->
      <div v-else-if="authStore.authMode === 'register'" class="auth-card-wrapper auth-card-wrapper--register">
        <div class="auth-header">
          <h2>建立三瑝會員帳號</h2>
          <p>完成 3 個步驟，開始掌握交通運輸產業資訊。</p>
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
              <div class="step-content step-content--basic">
                <div class="field-group">
                  <label>公司／商號名稱 <span class="required-star">*</span></label>
                  <InputText
                    v-model="registerForm.name"
                    placeholder="請輸入公司名稱"
                    fluid
                  />
                </div>
                <div class="field-group">
                  <label>您的姓名／聯絡人 <span class="required-star">*</span></label>
                  <InputText
                    v-model="registerForm.companyName"
                    placeholder="請輸入姓名"
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
                <p class="step-subtitle">選擇您關注的運輸產業類型（可複選）</p>
                <div class="interests-grid">
                  <button
                    v-for="item in interestOptions"
                    :key="item.key"
                    type="button"
                    :class="['interest-card', { selected: registerForm.interests[item.key] }]"
                    :aria-pressed="registerForm.interests[item.key]"
                    @click="registerForm.interests[item.key] = !registerForm.interests[item.key]"
                  >
                    <img :src="item.image" :alt="item.label" />
                    <span class="interest-card__code">{{ item.key }}</span>
                    <strong>{{ item.label }}</strong>
                  </button>
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
                <div class="success-side success-side--left" aria-hidden="true"><img :src="successRoadImage" alt="" /></div>
                <div class="success-content">
                  <span class="success-check" aria-hidden="true">✓</span>
                  <h3>會員帳號建立成功！</h3>
                  <p class="success-copy">
                    <span>驗證信已寄至您的 Email</span>
                    <span>請完成信箱驗證後再登入會員中心。</span>
                  </p>
                </div>
                <div class="success-side success-side--right" aria-hidden="true"><img :src="successPortImage" alt="" /></div>
              </div>
              <div class="step-actions flex-center">
                <Button label="我知道了" class="kqc-primary-btn" @click="finishRegister" />
              </div>
            </StepPanel>
          </StepPanels>
        </Stepper>

        <div v-if="activeStep !== 3" class="auth-footer">
          <span>已有會員帳號？</span>
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
          <h2>重設密碼</h2>
          <p>請選擇驗證方式以重設密碼。</p>
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
            :label="resetMethod === 'email' ? '寄送重設密碼信' : '寄送手機驗證碼'"
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
import { useAuthStore } from '@/stores/authStore'
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
import Divider from 'primevue/divider'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import industryCaCarImage from '@/assets/images/registration/industry-ca-car.png'
import industryCbCarImage from '@/assets/images/registration/industry-cb-car.png'
import industryTaxiImage from '@/assets/images/registration/industry-taxi.png'
import industryLightTruckImage from '@/assets/images/registration/industry-light-truck.png'
import industryMovingImage from '@/assets/images/registration/industry-moving.png'
import industryFreightImage from '@/assets/images/registration/industry-freight.png'
import industryContainerImage from '@/assets/images/registration/industry-container.png'
import industryOtherImage from '@/assets/images/registration/industry-other.png'
import successRoadImage from '@/assets/images/registration/registration-success-road.png'
import successPortImage from '@/assets/images/registration/registration-success-port.png'

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const isLoading = ref<boolean>(false)
const activeStep = ref<number>(1)

// 忘記密碼通道切換
const resetMethod = ref<'email' | 'phone'>('email')
const forgotEmail = ref<string>('')
const forgotPhone = ref<string>('')

const loginForm = reactive({ email: '', password: '' })

const registerForm = reactive({
  name: '', companyName: '', email: '', password: '',
  interests: { CA: false, CB: false, TX: false, LT: false, MV: false, FT: false, CT: false, OTHER: false } as Record<string, boolean>
})

const interestOptions = [
  { key: 'CA', label: '甲種小客車', image: industryCaCarImage },
  { key: 'CB', label: '乙種小客車', image: industryCbCarImage },
  { key: 'TX', label: '計程車', image: industryTaxiImage },
  { key: 'LT', label: '小貨車', image: industryLightTruckImage },
  { key: 'MV', label: '搬家公司', image: industryMovingImage },
  { key: 'FT', label: '汽車貨運', image: industryFreightImage },
  { key: 'CT', label: '貨櫃貨運', image: industryContainerImage },
  { key: 'OTHER', label: '其他產業', image: industryOtherImage }
]

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
  Object.keys(registerForm.interests).forEach((key) => { registerForm.interests[key] = false })
}

watch(() => authStore.isAuthModalOpen, (isOpen) => { if (isOpen) resetForms() })
watch(() => authStore.authMode, () => { resetForms() })

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ----------------------------------------------------
// 1. 登入防呆驗證
// ----------------------------------------------------
const handleLogin = async () => {
  const email = loginForm.email.trim()
  const password = loginForm.password

  if (!email || !isValidEmail(email)) {
    toast.add({
      summary: '登入資料格式錯誤',
      detail: '請輸入有效的 Email，例如 name@company.com。',
      life: 3000
    })
    return
  }

  if (!password || password.length < 6) {
    toast.add({
      summary: '密碼格式錯誤',
      detail: '密碼至少需要 6 個字元。',
      life: 3000
    })
    return
  }

  isLoading.value = true
  try {
    const result = await authStore.login({ email, password, portal: 'frontend' })
    if (!result.success) throw new Error(result.message)

    loginForm.password = ''
    if (result.passwordChangeRequired) {
      authStore.closeAuthModal()
      await router.push({ name: 'ChangePassword', query: { redirect: '/' } })
    }

    toast.add({
      severity: 'success',
      summary: '登入成功',
      detail: result.passwordChangeRequired
        ? '請立即變更您的密碼。'
        : '歡迎回到三瑝資訊。',
      life: 3000
    })
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      detail: error instanceof Error ? error.message : '操作失敗，請稍後再試。',
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
      summary: '基本資料格式錯誤',
      detail: '請填寫姓名與公司名稱。',
      life: 3000
    })
    return
  }

  if (!email || !isValidEmail(email)) {
    toast.add({
      severity: 'warn',
      detail: '請輸入有效的 Email。',
      life: 3000
    })
    return
  }

  if (!password || password.length < 8) {
    toast.add({
      summary: '密碼格式錯誤',
      detail: '密碼至少需要 8 個字元。',
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
    const result = await authStore.register({
      email: registerForm.email.trim().toLowerCase(),
      password: registerForm.password,
      name: `${registerForm.companyName.trim()} (${registerForm.name.trim()})`
    })
    if (!result.success) throw new Error(result.message)
    activeStep.value = 3
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      detail: error instanceof Error ? error.message : '操作失敗，請稍後再試。',
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
}

// ----------------------------------------------------
// 4. 完成註冊後回到登入；Email 驗證前不建立登入狀態
// ----------------------------------------------------
const finishRegister = () => {
  authStore.closeAuthModal()
  authStore.authMode = 'login'
}

// ----------------------------------------------------
// 5. 忘記密碼
// ----------------------------------------------------
const handleForgotPassword = async () => {
  if (resetMethod.value === 'email') {
    if (!forgotEmail.value.trim() || !isValidEmail(forgotEmail.value.trim())) {
      toast.add({
        severity: 'warn',
        detail: '請輸入有效的 Email。',
        life: 3000
      })
      return
    }
  } else {
    if (!forgotPhone.value.trim() || forgotPhone.value.length < 10) {
      toast.add({
        summary: '手機號碼格式錯誤',
        detail: '請輸入至少 10 碼的手機號碼。',
        life: 3000
      })
      return
    }
  }

  toast.add({
    severity: 'info',
    detail: '密碼重設功能目前僅支援 Email 驗證。',
    life: 4000
  })
}
</script>

<style lang="scss" scoped>
.auth-dialog-content {
  position: relative;
  padding: 1.75rem;
  background-color: var(--bg-card, #ffffff);

  .close-btn {
    min-width: 2.75rem;
    min-height: 2.75rem;
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    font-size: var(--public-type-action, 1.25rem);
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
    font-size: var(--public-type-caption, 0.875rem);
    border-radius: 9999px;
    margin-bottom: 0.5rem;
  }

  h2 {
    font-size: var(--public-type-card-title, 1.5rem);
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.35rem 0;
  }

  p {
    font-size: var(--public-type-body-small, 0.875rem);
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
      font-size: var(--public-type-caption, 0.85rem);
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
  font-size: var(--public-type-body-small, 0.875rem);
  color: #64748b;

  > span, .link-btn { margin: 0; line-height: 1.2; }
}

.auth-card-wrapper--register .auth-header { margin-bottom: .75rem; }
.auth-card-wrapper--register .auth-footer { margin-top: .5rem; }

.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: var(--public-type-action, 0.875rem);
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
  margin-bottom: .5rem;

  .stepper-header-custom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .5rem;
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
      font-size: var(--public-type-body-small, 0.9rem);
      color: #64748b;
      transition: all 0.2s ease;

      &.active {
        background-color: #1e293b;
        border-color: #1e293b;
        color: #eab308;
      }
    }

    .step-label {
      font-size: var(--public-type-caption, 0.75rem);
      color: #64748b;
      font-weight: 500;
    }
  }

  .step-content {
    padding: .25rem 0;
  }

  /* 3 欄靠左對齊網格 */
  .interests-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: .5rem;
    padding: .25rem 0;

    .interest-card {
      display: grid;
      min-width: 0;
      min-height: 6.5rem;
      padding: 0.45rem;
      gap: 0.25rem;
      border: 1px solid #dbe4ea;
      border-radius: 0.6rem;
      color: #334155;
      background: #fff;
      font: inherit;
      cursor: pointer;
      text-align: left;
      transition: border-color .2s ease, background-color .2s ease;
      img { width: 100%; height: 2.9rem; object-fit: cover; border-radius: .35rem; }
      .interest-card__code { color: #a0781d; font-size: .7rem; font-weight: 800; letter-spacing: .08em; }
      strong { font-size: .85rem; line-height: 1.3; }
      &:hover, &:focus-visible, &.selected { border-color: #247188; background: #eef8fa; }
      &:focus-visible { outline: 3px solid rgb(36 113 136 / 28%); outline-offset: 2px; }
    }
  }
  .step-content--basic { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem 1rem; }
  .step-content--basic + .step-actions { padding-top: .4rem; }

  .step-actions {
    display: flex;
    padding-top: .5rem;

    &.flex-end { justify-content: flex-end; }
    &.flex-between { justify-content: space-between; }
    &.flex-center { justify-content: center; }
  }

  .success-box {
    position: relative;
    display: block;
    min-height: 12rem;
    overflow: hidden;
    padding: .25rem 1rem .5rem;

    &::before {
      content: '';
      position: absolute;
      z-index: 1;
      inset: 0 16%;
      pointer-events: none;
      background: radial-gradient(ellipse at center, #fff 0%, #fff 54%, rgb(255 255 255 / 88%) 72%, transparent 100%);
    }

    .success-side {
      position: absolute;
      z-index: 0;
      bottom: 0;
      width: 54%;
      height: 9.5rem;
      overflow: hidden;
      opacity: .8;
      pointer-events: none;
    }
    .success-side::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgb(255 255 255 / 30%) 0%, transparent 28%, transparent 72%, rgb(255 255 255 / 36%) 100%);
    }
    .success-side img { width: 100%; height: 100%; object-fit: cover; }
    .success-side--left { left: -16%; mask-image: radial-gradient(ellipse at 26% 78%, transparent 0%, #000 20%, rgb(0 0 0 / 82%) 48%, transparent 92%); }
    .success-side--left::after { background: linear-gradient(90deg, transparent 0%, transparent 48%, rgb(255 255 255 / 92%) 100%); }
    .success-side--left img { object-position: 58% center; }
    .success-side--right { right: -16%; mask-image: radial-gradient(ellipse at 74% 78%, transparent 0%, #000 20%, rgb(0 0 0 / 82%) 48%, transparent 92%); }
    .success-side--right::after { background: linear-gradient(90deg, rgb(255 255 255 / 92%) 0%, transparent 52%, transparent 100%); }
    .success-side--right img { object-position: 42% center; }
    .success-content { position: relative; z-index: 2; max-width: 28rem; margin: 0 auto; text-align: center; }

    .success-check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
      height: 4rem;
      margin-bottom: .45rem;
      border-radius: 50%;
      background: #22c55e;
      color: #fff;
      font-size: 2.35rem;
      font-weight: 700;
      line-height: 1;
    }

    h3 {
      font-size: var(--public-type-card-title, 1.25rem);
      color: #1e293b;
      margin-bottom: 0.35rem;
    }

    p {
      margin: 0;
      max-width: 27rem;
      margin-inline: auto;
      font-size: var(--public-type-body-small, 0.875rem);
      color: #64748b;
      line-height: 1.55;
    }
    .success-copy span { display: block; }
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
    font-size: var(--public-type-action, 0.85rem);
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

:global(.kqc-auth-dialog--register) { width: min(92vw, 58rem) !important; }
@media (max-width: 700px) {
  .step-content--basic { grid-template-columns: 1fr; }
  .interests-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .success-box { min-height: 11rem; padding-inline: .25rem; }
  .success-side { width: 72%; height: 6rem; opacity: .45; }
  .success-side--left { left: -20%; }
  .success-side--right { right: -20%; }
  .success-copy span { display: inline; }
}
@media (max-width: 420px) {
  .interests-grid { grid-template-columns: 1fr; }
}
</style>
