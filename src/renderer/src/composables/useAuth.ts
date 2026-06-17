import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import type { UserInfo } from '@/types/auth'
import { TEXT_SUCCESS_CODE_SENT, TEXT_ERROR_CODE_INVALID, TEXT_ERROR_CODE_EXPIRED, TEXT_ERROR_ACCOUNT_LOCKED, TEXT_ERROR_RATE_LIMIT, TEXT_LOGIN_EXPIRED } from '@/constants'

export function useAuth() {
  const authStore = useAuthStore()
  const codeCooldown = ref(false)
  const codeCooldownRemaining = ref(0)
  let cooldownTimer: ReturnType<typeof setInterval> | null = null

  async function sendCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await window.__ELECTRON_API__.authSendCode(email)
      startCooldown()
      return { success: true, message: TEXT_SUCCESS_CODE_SENT }
    } catch (error) {
      const err = error as Error & { errorCode?: string }
      if (err.errorCode === 'RATE_LIMIT_EXCEEDED') {
        return { success: false, message: TEXT_ERROR_RATE_LIMIT }
      }
      return { success: true, message: TEXT_SUCCESS_CODE_SENT }
    }
  }

  async function login(email: string, code: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await window.__ELECTRON_API__.authLogin({ email, code })
      const user: UserInfo = {
        id: result.user.id,
        email: result.user.email,
        isActive: result.user.is_active,
        createdAt: result.user.created_at
      }
      authStore.setAuthState(result.access_token, user, result.expires_in)
      return { success: true }
    } catch (error) {
      const err = error as Error & { errorCode?: string }
      if (err.errorCode === 'INVALID_CODE') {
        return { success: false, message: TEXT_ERROR_CODE_INVALID }
      }
      if (err.errorCode === 'CODE_ALREADY_USED' || err.errorCode === 'CODE_MAX_ATTEMPTS_EXCEEDED') {
        return { success: false, message: TEXT_ERROR_CODE_EXPIRED }
      }
      if (err.errorCode === 'ACCOUNT_LOCKED') {
        return { success: false, message: TEXT_ERROR_ACCOUNT_LOCKED }
      }
      if (err.errorCode === 'RATE_LIMIT_EXCEEDED') {
        return { success: false, message: TEXT_ERROR_RATE_LIMIT }
      }
      return { success: false, message: err.message || '登录失败' }
    }
  }

  async function logout(): Promise<void> {
    try {
      await window.__ELECTRON_API__.authLogout()
    } finally {
      authStore.clearAuthState()
    }
  }

  async function refreshToken(): Promise<boolean> {
    try {
      await window.__ELECTRON_API__.authRefresh()
      return true
    } catch {
      authStore.clearAuthState()
      return false
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    try {
      const result = await window.__ELECTRON_API__.authMe()
      const user: UserInfo = {
        id: result.id,
        email: result.email,
        isActive: result.is_active,
        createdAt: result.created_at
      }
      authStore.userInfo = user
    } catch {
      // ignore
    }
  }

  function startCooldown(): void {
    codeCooldown.value = true
    codeCooldownRemaining.value = 60
    cooldownTimer = setInterval(() => {
      codeCooldownRemaining.value--
      if (codeCooldownRemaining.value <= 0) {
        codeCooldown.value = false
        if (cooldownTimer) {
          clearInterval(cooldownTimer)
          cooldownTimer = null
        }
      }
    }, 1000)
  }

  return {
    authStore,
    codeCooldown,
    codeCooldownRemaining,
    sendCode,
    login,
    logout,
    refreshToken,
    fetchCurrentUser
  }
}
