import { ipcMain, app, BrowserWindow } from 'electron'
import {
  IPC_CHANNEL_WINDOW_MINIMIZE,
  IPC_CHANNEL_WINDOW_MAXIMIZE,
  IPC_CHANNEL_WINDOW_CLOSE,
  IPC_CHANNEL_APP_VERSION,
  IPC_CHANNEL_CHAT_STREAM,
  IPC_CHANNEL_CHAT_NON_STREAM,
  IPC_CHANNEL_CHAT_STOP,
  IPC_CHANNEL_HITL_CONFIRM,
  IPC_CHANNEL_AUTH_SEND_CODE,
  IPC_CHANNEL_AUTH_LOGIN,
  IPC_CHANNEL_AUTH_REFRESH,
  IPC_CHANNEL_AUTH_LOGOUT,
  IPC_CHANNEL_AUTH_ME,
  IPC_CHANNEL_SKILL_LIST,
  IPC_CHANNEL_SKILL_DETAIL,
  IPC_CHANNEL_WORKSPACE_LIST,
  IPC_CHANNEL_WORKSPACE_ADD,
  IPC_CHANNEL_WORKSPACE_REMOVE,
  IPC_CHANNEL_HEALTH_CHECK
} from '../shared/constants'
import { createWindow, getMainWindow, destroyWindow, setupAppLifecycle } from './windowManager'
import {
  startStreamRequest,
  startNonStreamRequest,
  stopCurrentRequest,
  apiRequest,
  refreshAccessToken,
  setAccessToken,
  API_PATH_HITL_CONFIRM,
  API_PATH_AUTH_SEND_CODE,
  API_PATH_AUTH_LOGIN,
  API_PATH_AUTH_REFRESH,
  API_PATH_AUTH_LOGOUT,
  API_PATH_AUTH_ME,
  API_PATH_SKILLS,
  API_PATH_SKILL_DETAIL,
  API_PATH_WORKSPACE,
  API_PATH_HEALTH,
  API_PATH_CONVERSATIONS,
  API_PATH_CONVERSATION_DETAIL
} from './httpProxy'

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNEL_WINDOW_MINIMIZE, () => {
    const win = BrowserWindow.getFocusedWindow()
    win?.minimize()
  })

  ipcMain.handle(IPC_CHANNEL_WINDOW_MAXIMIZE, () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.handle(IPC_CHANNEL_WINDOW_CLOSE, () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      win.removeAllListeners('close')
      win.close()
    }
  })

  ipcMain.handle(IPC_CHANNEL_APP_VERSION, () => {
    return app.getVersion()
  })

  ipcMain.handle(IPC_CHANNEL_CHAT_STREAM, (_event, params: { conversation_id?: string; message: string; skill_hint?: string; stream_mode: string }) => {
    const mainWindow = getMainWindow()
    if (mainWindow && !mainWindow.isDestroyed()) {
      startStreamRequest(mainWindow, params)
    }
  })

  ipcMain.handle(IPC_CHANNEL_CHAT_NON_STREAM, async (_event, params: { conversation_id?: string; message: string; skill_hint?: string }) => {
    return await startNonStreamRequest(params)
  })

  ipcMain.handle(IPC_CHANNEL_CHAT_STOP, () => {
    stopCurrentRequest()
  })

  ipcMain.handle(IPC_CHANNEL_HITL_CONFIRM, async (_event, params: { conversation_id: string; checkpoint_id: string; decision: string; context?: string }) => {
    return await apiRequest('POST', API_PATH_HITL_CONFIRM, params)
  })

  ipcMain.handle(IPC_CHANNEL_AUTH_SEND_CODE, async (_event, email: string) => {
    return await apiRequest('POST', API_PATH_AUTH_SEND_CODE, { email })
  })

  ipcMain.handle(IPC_CHANNEL_AUTH_LOGIN, async (_event, params: { email: string; code: string }) => {
    const result = await apiRequest<{ access_token: string; token_type: string; expires_in: number; user: { id: string; email: string; is_active: boolean; created_at: string } }>('POST', API_PATH_AUTH_LOGIN, params)
    setAccessToken(result.access_token)
    return result
  })

  ipcMain.handle(IPC_CHANNEL_AUTH_REFRESH, async () => {
    const success = await refreshAccessToken()
    if (!success) {
      throw new Error('TOKEN_EXPIRED')
    }
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNEL_AUTH_LOGOUT, async () => {
    try {
      await apiRequest('POST', API_PATH_AUTH_LOGOUT)
    } finally {
      setAccessToken(null)
    }
  })

  ipcMain.handle(IPC_CHANNEL_AUTH_ME, async () => {
    return await apiRequest('GET', API_PATH_AUTH_ME)
  })

  ipcMain.handle(IPC_CHANNEL_SKILL_LIST, async () => {
    return await apiRequest('GET', API_PATH_SKILLS)
  })

  ipcMain.handle(IPC_CHANNEL_SKILL_DETAIL, async (_event, name: string) => {
    return await apiRequest('GET', `${API_PATH_SKILL_DETAIL}${encodeURIComponent(name)}`)
  })

  ipcMain.handle(IPC_CHANNEL_WORKSPACE_LIST, async () => {
    return await apiRequest('GET', API_PATH_WORKSPACE)
  })

  ipcMain.handle(IPC_CHANNEL_WORKSPACE_ADD, async (_event, params: { path: string; alias?: string; confirm_level: string }) => {
    return await apiRequest('POST', API_PATH_WORKSPACE, { action: 'add', ...params })
  })

  ipcMain.handle(IPC_CHANNEL_WORKSPACE_REMOVE, async (_event, path: string) => {
    return await apiRequest('POST', API_PATH_WORKSPACE, { action: 'remove', path })
  })

  ipcMain.handle(IPC_CHANNEL_HEALTH_CHECK, async () => {
    try {
      const result = await apiRequest('GET', API_PATH_HEALTH)
      return result
    } catch {
      return null
    }
  })

  ipcMain.on('close-confirmed', () => {
    destroyWindow()
  })
}

export function initApp(): void {
  app.whenReady().then(() => {
    registerIpcHandlers()
    createWindow()
    setupAppLifecycle()
  })

  process.on('uncaughtException', (error) => {
    console.error('[Main] Uncaught Exception:', error)
  })

  process.on('unhandledRejection', (reason) => {
    console.error('[Main] Unhandled Rejection:', reason)
  })
}
