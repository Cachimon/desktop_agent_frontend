import { contextBridge, ipcRenderer } from 'electron'
import {
  IPC_CHANNEL_WINDOW_MINIMIZE,
  IPC_CHANNEL_WINDOW_MAXIMIZE,
  IPC_CHANNEL_WINDOW_CLOSE,
  IPC_CHANNEL_APP_VERSION,
  IPC_CHANNEL_CHAT_STREAM,
  IPC_CHANNEL_CHAT_NON_STREAM,
  IPC_CHANNEL_SSE_EVENT,
  IPC_CHANNEL_CHAT_STOP,
  IPC_CHANNEL_BEFORE_CLOSE,
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

contextBridge.exposeInMainWorld('__ELECTRON_API__', {
  windowMinimize: () => ipcRenderer.invoke(IPC_CHANNEL_WINDOW_MINIMIZE),
  windowMaximize: () => ipcRenderer.invoke(IPC_CHANNEL_WINDOW_MAXIMIZE),
  windowClose: () => ipcRenderer.invoke(IPC_CHANNEL_WINDOW_CLOSE),

  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNEL_APP_VERSION),

  chatStream: (params: { conversation_id?: string; message: string; skill_hint?: string; stream_mode: string }) =>
    ipcRenderer.invoke(IPC_CHANNEL_CHAT_STREAM, params),
  chatNonStream: (params: { conversation_id?: string; message: string; skill_hint?: string }) =>
    ipcRenderer.invoke(IPC_CHANNEL_CHAT_NON_STREAM, params),

  onSSEEvent: (callback: (event: Record<string, unknown>) => void) => {
    ipcRenderer.on(IPC_CHANNEL_SSE_EVENT, (_event, data) => callback(data))
  },
  removeSSEListener: () => {
    ipcRenderer.removeAllListeners(IPC_CHANNEL_SSE_EVENT)
  },

  stopGeneration: () => ipcRenderer.invoke(IPC_CHANNEL_CHAT_STOP),

  onBeforeClose: (callback: () => void) => {
    ipcRenderer.on(IPC_CHANNEL_BEFORE_CLOSE, () => callback())
  },
  confirmClose: () => ipcRenderer.send('close-confirmed'),

  hitlConfirm: (params: { conversation_id: string; checkpoint_id: string; decision: string; context?: string }) =>
    ipcRenderer.invoke(IPC_CHANNEL_HITL_CONFIRM, params),

  authSendCode: (email: string) =>
    ipcRenderer.invoke(IPC_CHANNEL_AUTH_SEND_CODE, email),
  authLogin: (params: { email: string; code: string }) =>
    ipcRenderer.invoke(IPC_CHANNEL_AUTH_LOGIN, params),
  authRefresh: () =>
    ipcRenderer.invoke(IPC_CHANNEL_AUTH_REFRESH),
  authLogout: () =>
    ipcRenderer.invoke(IPC_CHANNEL_AUTH_LOGOUT),
  authMe: () =>
    ipcRenderer.invoke(IPC_CHANNEL_AUTH_ME),

  skillList: () =>
    ipcRenderer.invoke(IPC_CHANNEL_SKILL_LIST),
  skillDetail: (name: string) =>
    ipcRenderer.invoke(IPC_CHANNEL_SKILL_DETAIL, name),

  workspaceList: () =>
    ipcRenderer.invoke(IPC_CHANNEL_WORKSPACE_LIST),
  workspaceAdd: (params: { path: string; alias?: string; confirm_level: string }) =>
    ipcRenderer.invoke(IPC_CHANNEL_WORKSPACE_ADD, params),
  workspaceRemove: (path: string) =>
    ipcRenderer.invoke(IPC_CHANNEL_WORKSPACE_REMOVE, path),

  healthCheck: () =>
    ipcRenderer.invoke(IPC_CHANNEL_HEALTH_CHECK)
})
