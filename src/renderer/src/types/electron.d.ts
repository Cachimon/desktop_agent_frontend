import type { V3SSEEvent } from './sse'
import type { HITLConfirmRequest } from './api'
import type { HITLDecision } from './hitl'
import type { HealthCheckResponse } from './health'

interface ElectronAPI {
  windowMinimize: () => Promise<void>
  windowMaximize: () => Promise<void>
  windowClose: () => Promise<void>
  getAppVersion: () => Promise<string>
  chatStream: (params: { conversation_id?: string; message: string; skill_hint?: string; stream_mode: string }) => Promise<void>
  chatNonStream: (params: { conversation_id?: string; message: string; skill_hint?: string }) => Promise<string>
  onSSEEvent: (callback: (event: V3SSEEvent) => void) => void
  removeSSEListener: () => void
  stopGeneration: () => Promise<void>
  onBeforeClose: (callback: () => void) => void
  confirmClose: () => void
  hitlConfirm: (params: HITLConfirmRequest) => Promise<{ status: string; conversation_id: string; checkpoint_id: string; decision: string }>
  authSendCode: (email: string) => Promise<{ message: string }>
  authLogin: (params: { email: string; code: string }) => Promise<{ access_token: string; token_type: string; expires_in: number; user: { id: string; email: string; is_active: boolean; created_at: string } }>
  authRefresh: () => Promise<{ access_token: string; token_type: string; expires_in: number }>
  authLogout: () => Promise<void>
  authMe: () => Promise<{ id: string; email: string; is_active: boolean; created_at: string }>
  skillList: () => Promise<{ skills: Array<{ name: string; description: string; version: string; enabled: boolean; category?: string }> }>
  skillDetail: (name: string) => Promise<{ name: string; description: string; version: string; instructions: string; parameters: Array<{ name: string; type: string; description: string; required: boolean; default_value?: string }>; enabled: boolean }>
  workspaceList: () => Promise<{ workspaces: Array<{ path: string; alias?: string; added_at: string; confirm_level: 'low' | 'high' }> }>
  workspaceAdd: (params: { path: string; alias?: string; confirm_level: 'low' | 'high' }) => Promise<void>
  workspaceRemove: (path: string) => Promise<void>
  healthCheck: () => Promise<HealthCheckResponse | null>
}

declare global {
  interface Window {
    __ELECTRON_API__: ElectronAPI
  }
}

export type { ElectronAPI }
