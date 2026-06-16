import { defineStore } from 'pinia'
import { ref } from 'vue'
import { STORAGE_KEY_APP } from '@/constants'

export const useAppStore = defineStore(
  'app',
  () => {
    const sidebarCollapsed = ref(false)

    function toggleSidebar(): void {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    return { sidebarCollapsed, toggleSidebar }
  },
  {
    persist: {
      key: STORAGE_KEY_APP,
      pick: ['sidebarCollapsed']
    }
  }
)
