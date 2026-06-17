import { defineStore } from 'pinia'
import { ref } from 'vue'
import { STORAGE_KEY_APP } from '@/constants'

export const useAppStore = defineStore(
  'app',
  () => {
    const sidebarCollapsed = ref(false)
    const backendHealthy = ref(true)

    function toggleSidebar(): void {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setBackendHealthy(status: boolean): void {
      backendHealthy.value = status
    }

    return { sidebarCollapsed, backendHealthy, toggleSidebar, setBackendHealthy }
  },
  {
    persist: {
      key: STORAGE_KEY_APP,
      pick: ['sidebarCollapsed']
    }
  }
)
