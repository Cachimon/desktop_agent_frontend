<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { isValidEmail, isValidVerificationCode } from '@/utils/validators'
import { TEXT_SUCCESS_CODE_SENT } from '@/constants'

const { sendCode, login, codeCooldown, codeCooldownRemaining } = useAuth()

const email = ref('')
const code = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const canSendCode = computed(() => isValidEmail(email.value) && !codeCooldown.value)
const canLogin = computed(() => isValidEmail(email.value) && isValidVerificationCode(code.value))

async function handleSendCode(): Promise<void> {
  if (!canSendCode.value) return
  errorMessage.value = null
  successMessage.value = null
  const result = await sendCode(email.value.trim())
  if (result.success) {
    successMessage.value = result.message
  } else {
    errorMessage.value = result.message
  }
}

async function handleLogin(): Promise<void> {
  if (!canLogin.value) return
  loading.value = true
  errorMessage.value = null
  successMessage.value = null
  const result = await login(email.value.trim(), code.value.trim())
  loading.value = false
  if (!result.success) {
    errorMessage.value = result.message || '登录失败'
  }
}

function handleCodeInput(e: Event): void {
  const target = e.target as HTMLInputElement
  code.value = target.value.replace(/\D/g, '').slice(0, 6)
  if (code.value.length === 6 && isValidEmail(email.value)) {
    handleLogin()
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="var(--color-primary)" stroke-width="2" />
          <circle cx="24" cy="24" r="8" fill="var(--color-primary)" opacity="0.3" />
          <circle cx="24" cy="24" r="4" fill="var(--color-primary)" />
        </svg>
      </div>
      <h2 class="login-title">AI Desktop Agent</h2>
      <p class="login-desc">请使用邮箱验证码登录</p>

      <div class="login-form">
        <div class="form-group">
          <label class="form-label">邮箱地址</label>
          <div class="email-row">
            <input
              v-model="email"
              type="email"
              class="form-input"
              placeholder="请输入邮箱"
              :disabled="loading"
            />
            <button
              class="send-code-btn"
              :disabled="!canSendCode"
              @click="handleSendCode"
            >
              {{ codeCooldown ? `${codeCooldownRemaining}s` : '发送验证码' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">验证码</label>
          <input
            :value="code"
            type="text"
            class="form-input"
            placeholder="请输入6位数字验证码"
            maxlength="6"
            :disabled="loading"
            @input="handleCodeInput"
          />
        </div>

        <div v-if="errorMessage" class="form-error">{{ errorMessage }}</div>
        <div v-if="successMessage" class="form-success">{{ successMessage }}</div>

        <button
          class="login-btn"
          :disabled="!canLogin || loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - var(--titlebar-height));
  background: var(--color-bg);
}

.login-container {
  width: 100%;
  max-width: var(--login-container-max-width);
  padding: 40px;
  text-align: center;
}

.login-icon {
  margin-bottom: 20px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}

.login-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.email-row {
  display: flex;
  gap: 8px;
}

.form-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text);
  background: var(--color-bg);
  transition: border-color var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input:disabled {
  opacity: 0.6;
}

.send-code-btn {
  flex-shrink: 0;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.send-code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-code-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.2);
}

.login-btn {
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  color: white;
  background: var(--color-primary);
  transition: all var(--transition-fast);
  margin-top: 8px;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.form-error {
  padding: 8px 12px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.form-success {
  padding: 8px 12px;
  background: var(--color-success-bg);
  color: var(--color-success);
  border-radius: var(--radius-sm);
  font-size: 12px;
}
</style>
