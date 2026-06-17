import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/auth'
import { STORAGE_KEY_AUTH } from '@/constants'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const isAuthenticated = ref(false)
    const accessToken = ref<string | null>(null)
    const userInfo = ref<UserInfo | null>(null)
    const tokenExpiresAt = ref<string | null>(null)

    function setAuthState(token: string, user: UserInfo, expiresIn: number): void {
      accessToken.value = token
      userInfo.value = user
      isAuthenticated.value = true
      const expiresAt = new Date(Date.now() + expiresIn * 1000)
      tokenExpiresAt.value = expiresAt.toISOString()
    }

    function clearAuthState(): void {
      accessToken.value = null
      userInfo.value = null
      isAuthenticated.value = false
      tokenExpiresAt.value = null
    }

    function checkTokenExpiry(): boolean {
      if (!tokenExpiresAt.value) return false
      return new Date(tokenExpiresAt.value) > new Date()
    }

    return {
      isAuthenticated,
      accessToken,
      userInfo,
      tokenExpiresAt,
      setAuthState,
      clearAuthState,
      checkTokenExpiry
    }
  },
  {
    persist: {
      key: STORAGE_KEY_AUTH,
      pick: ['userInfo']
    }
  }
)
