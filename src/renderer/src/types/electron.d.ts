import type { SSEEvent } from './sse'

interface ElectronAPI {
  windowMinimize: () => Promise<void>
  windowMaximize: () => Promise<void>
  windowClose: () => Promise<void>
  getAppVersion: () => Promise<string>
  chatStream: (userInput: string) => Promise<void>
  chatNonStream: (userInput: string) => Promise<string>
  onSSEEvent: (callback: (event: SSEEvent) => void) => void
  removeSSEListener: () => void
  stopGeneration: () => Promise<void>
  onBeforeClose: (callback: () => void) => void
  confirmClose: () => void
}

declare global {
  interface Window {
    __ELECTRON_API__: ElectronAPI
  }
}

export type { ElectronAPI }
