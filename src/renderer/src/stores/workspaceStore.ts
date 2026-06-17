import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WorkspaceConfig } from '@/types/workspace'
import { STORAGE_KEY_WORKSPACE } from '@/constants'

export const useWorkspaceStore = defineStore(
  'workspace',
  () => {
    const workspaces = ref<WorkspaceConfig[]>([])
    const loaded = ref(false)

    function setWorkspaces(list: WorkspaceConfig[]): void {
      workspaces.value = list
      loaded.value = true
    }

    function addWorkspace(workspace: WorkspaceConfig): void {
      workspaces.value.push(workspace)
    }

    function removeWorkspace(path: string): void {
      const idx = workspaces.value.findIndex((w) => w.path === path)
      if (idx !== -1) {
        workspaces.value.splice(idx, 1)
      }
    }

    return {
      workspaces,
      loaded,
      setWorkspaces,
      addWorkspace,
      removeWorkspace
    }
  },
  {
    persist: {
      key: STORAGE_KEY_WORKSPACE,
      pick: ['workspaces', 'loaded']
    }
  }
)
