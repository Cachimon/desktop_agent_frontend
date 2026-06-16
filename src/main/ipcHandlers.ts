import { ipcMain, app, BrowserWindow } from 'electron'
import { createWindow, getMainWindow, destroyWindow, setupAppLifecycle } from './windowManager'
import { startStreamRequest, startNonStreamRequest, stopCurrentRequest } from './httpProxy'

export function registerIpcHandlers(): void {
  ipcMain.handle('window:minimize', () => {
    const win = BrowserWindow.getFocusedWindow()
    win?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.handle('window:close', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      win.removeAllListeners('close')
      win.close()
    }
  })

  ipcMain.handle('app:version', () => {
    return app.getVersion()
  })

  ipcMain.handle('chat:stream', (_event, userInput: string) => {
    const mainWindow = getMainWindow()
    if (mainWindow && !mainWindow.isDestroyed()) {
      startStreamRequest(mainWindow, userInput)
    }
  })

  ipcMain.handle('chat:nonStream', async (_event, userInput: string) => {
    return await startNonStreamRequest(userInput)
  })

  ipcMain.handle('chat:stop', () => {
    stopCurrentRequest()
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
}
