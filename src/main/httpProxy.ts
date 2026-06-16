import { BrowserWindow, net } from 'electron'
import { API_BASE_URL, API_PATH_CHAT_STREAM, API_PATH_CHAT_NON_STREAM } from '../shared/constants'

let currentRequest: Electron.ClientRequest | null = null
let timeoutHandle: ReturnType<typeof setTimeout> | null = null

export function startStreamRequest(
  mainWindow: BrowserWindow,
  userInput: string
): void {
  const url = `${API_BASE_URL}${API_PATH_CHAT_STREAM}`

  const request = net.request({
    method: 'POST',
    url
  })

  request.setHeader('Content-Type', 'application/json')

  currentRequest = request

  let buffer = ''

  request.on('response', (response) => {
    if (response.statusCode !== 200) {
      mainWindow.webContents.send('sse:event', {
        type: 'error',
        data: `HTTP ${response.statusCode}`
      })
      cleanup()
      return
    }

    resetTimeout(mainWindow)

    response.on('data', (chunk: Buffer) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.slice(5).trim()
          if (jsonStr) {
            try {
              const event = JSON.parse(jsonStr)
              mainWindow.webContents.send('sse:event', event)
              if (event.type === 'content') {
                resetTimeout(mainWindow)
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    })

    response.on('end', () => {
      clearTimeoutHandle()
      mainWindow.webContents.send('sse:event', { type: 'end', data: '' })
      cleanup()
    })

    response.on('error', (error) => {
      clearTimeoutHandle()
      mainWindow.webContents.send('sse:event', {
        type: 'error',
        data: error.message
      })
      cleanup()
    })
  })

  request.on('error', (error) => {
    clearTimeoutHandle()
    mainWindow.webContents.send('sse:event', {
      type: 'error',
      data: error.message
    })
    cleanup()
  })

  request.write(JSON.stringify({ user_input: userInput }))
  request.end()
}

export function startNonStreamRequest(userInput: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${API_PATH_CHAT_NON_STREAM}`

    const request = net.request({
      method: 'POST',
      url
    })

    request.setHeader('Content-Type', 'application/json')

    request.on('response', (response) => {
      let data = ''
      response.on('data', (chunk: Buffer) => {
        data += chunk.toString()
      })
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve(parsed.data || '')
        } catch {
          reject(new Error('Invalid response format'))
        }
      })
      response.on('error', (error) => reject(error))
    })

    request.on('error', (error) => reject(error))

    request.write(JSON.stringify({ user_input: userInput }))
    request.end()
  })
}

export function stopCurrentRequest(): void {
  if (currentRequest) {
    currentRequest.abort()
    cleanup()
  }
}

function resetTimeout(mainWindow: BrowserWindow): void {
  clearTimeoutHandle()
  timeoutHandle = setTimeout(() => {
    mainWindow.webContents.send('sse:event', {
      type: 'error',
      data: '响应超时'
    })
    stopCurrentRequest()
  }, 60_000)
}

function clearTimeoutHandle(): void {
  if (timeoutHandle) {
    clearTimeout(timeoutHandle)
    timeoutHandle = null
  }
}

function cleanup(): void {
  currentRequest = null
  clearTimeoutHandle()
}
