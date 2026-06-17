import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { WorkspaceConfig } from '@/types/workspace'
import { TEXT_ERROR_PATH_FORBIDDEN, TEXT_ERROR_WORKSPACE_EXISTS } from '@/constants'

export function useWorkspace() {
  const workspaceStore = useWorkspaceStore()

  async function loadWorkspaces(): Promise<string | null> {
    try {
      const result = await window.__ELECTRON_API__.workspaceList()
      const workspaces: WorkspaceConfig[] = (result.workspaces || []).map((w) => ({
        path: w.path,
        alias: w.alias,
        addedAt: w.added_at,
        confirmLevel: w.confirm_level
      }))
      workspaceStore.setWorkspaces(workspaces)
      return null
    } catch (error) {
      const err = error as Error & { errorCode?: string }
      return err.message || '加载工作区失败'
    }
  }

  async function addWorkspace(path: string, alias?: string, confirmLevel: 'low' | 'high' = 'low'): Promise<string | null> {
    try {
      await window.__ELECTRON_API__.workspaceAdd({ path, alias, confirm_level: confirmLevel })
      workspaceStore.addWorkspace({
        path,
        alias,
        addedAt: new Date().toISOString(),
        confirmLevel
      })
      return null
    } catch (error) {
      const err = error as Error & { errorCode?: string }
      if (err.errorCode === 'PATH_FORBIDDEN') {
        return TEXT_ERROR_PATH_FORBIDDEN
      }
      if (err.errorCode === 'WORKSPACE_ALREADY_EXISTS') {
        return TEXT_ERROR_WORKSPACE_EXISTS
      }
      return err.message || '添加工作区失败'
    }
  }

  async function removeWorkspace(path: string): Promise<string | null> {
    try {
      await window.__ELECTRON_API__.workspaceRemove(path)
      workspaceStore.removeWorkspace(path)
      return null
    } catch (error) {
      const err = error as Error & { errorCode?: string }
      return err.message || '移除工作区失败'
    }
  }

  return { loadWorkspaces, addWorkspace, removeWorkspace }
}
