import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('__ELECTRON_API__', {
  windowMinimize: () => ipcRenderer.invoke('window:minimize'),
  windowMaximize: () => ipcRenderer.invoke('window:maximize'),
  windowClose: () => ipcRenderer.invoke('window:close'),

  getAppVersion: () => ipcRenderer.invoke('app:version'),

  chatStream: (userInput: string) => ipcRenderer.invoke('chat:stream', userInput),
  chatNonStream: (userInput: string) => ipcRenderer.invoke('chat:nonStream', userInput),

  onSSEEvent: (callback: (event: { type: string; data: string }) => void) => {
    ipcRenderer.on('sse:event', (_event, data) => callback(data))
  },
  removeSSEListener: () => {
    ipcRenderer.removeAllListeners('sse:event')
  },

  stopGeneration: () => ipcRenderer.invoke('chat:stop'),

  onBeforeClose: (callback: () => void) => {
    ipcRenderer.on('window:before-close', () => callback())
  },
  confirmClose: () => ipcRenderer.send('close-confirmed')
})
