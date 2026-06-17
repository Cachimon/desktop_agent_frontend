import { BrowserWindow, net } from 'electron'
import {
  API_BASE_URL,
  API_PATH_CHAT_STREAM,
  API_PATH_CHAT_NON_STREAM,
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
  API_PATH_CONVERSATION_DETAIL,
  IPC_CHANNEL_SSE_EVENT
} from '../shared/constants'

let currentRequest: Electron.ClientRequest | null = null
let timeoutHandle: ReturnType<typeof setTimeout> | null = null
let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export function startStreamRequest(
  mainWindow: BrowserWindow,
  params: { conversation_id?: string; message: string; skill_hint?: string; stream_mode: string }
): void {
  const url = `${API_BASE_URL}${API_PATH_CHAT_STREAM}`

  const request = net.request({
    method: 'POST',
    url
  })

  request.setHeader('Content-Type', 'application/json')
  if (accessToken) {
    request.setHeader('Authorization', `Bearer ${accessToken}`)
  }

  currentRequest = request

  let buffer = ''
  let currentEventType = ''

  request.on('response', (response) => {
    if (response.statusCode === 401) {
      handleTokenRefresh(mainWindow, params)
      cleanup()
      return
    }

    if (response.statusCode !== 200) {
      mainWindow.webContents.send(IPC_CHANNEL_SSE_EVENT, {
        type: 'error',
        data: { message: `HTTP ${response.statusCode}` }
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
        if (trimmed.startsWith('event:')) {
          currentEventType = trimmed.slice(6).trim()
        } else if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.slice(5).trim()
          if (jsonStr) {
            try {
              const parsed = JSON.parse(jsonStr)
              const v3Event = {
                type: currentEventType === 'end' ? 'end' : parsed.type || currentEventType,
                ns: parsed.ns,
                data: parsed.data ?? parsed,
                message_id: parsed.message_id
              }
              mainWindow.webContents.send(IPC_CHANNEL_SSE_EVENT, v3Event)
              if (v3Event.type === 'ai' || v3Event.type === 'tool' || v3Event.type === 'human') {
                resetTimeout(mainWindow)
              }
            } catch {
              // skip malformed JSON
            }
          }
          currentEventType = ''
        }
      }
    })

    response.on('end', () => {
      clearTimeoutHandle()
      mainWindow.webContents.send(IPC_CHANNEL_SSE_EVENT, {
        type: 'end',
        data: {}
      })
      cleanup()
    })

    response.on('error', (error) => {
      clearTimeoutHandle()
      mainWindow.webContents.send(IPC_CHANNEL_SSE_EVENT, {
        type: 'error',
        data: { message: error.message }
      })
      cleanup()
    })
  })

  request.on('error', (error) => {
    clearTimeoutHandle()
    mainWindow.webContents.send(IPC_CHANNEL_SSE_EVENT, {
      type: 'error',
      data: { message: error.message }
    })
    cleanup()
  })

  request.write(JSON.stringify(params))
  request.end()
}

async function handleTokenRefresh(
  mainWindow: BrowserWindow,
  originalParams: Record<string, unknown>
): Promise<void> {
  try {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      startStreamRequest(mainWindow, originalParams as { conversation_id?: string; message: string; skill_hint?: string; stream_mode: string })
    } else {
      mainWindow.webContents.send(IPC_CHANNEL_SSE_EVENT, {
        type: 'error',
        data: { message: 'TOKEN_EXPIRED' }
      })
    }
  } catch {
    mainWindow.webContents.send(IPC_CHANNEL_SSE_EVENT, {
      type: 'error',
      data: { message: 'TOKEN_EXPIRED' }
    })
  }
}

export function startNonStreamRequest(params: {
  conversation_id?: string
  message: string
  skill_hint?: string
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${API_PATH_CHAT_NON_STREAM}`

    const request = net.request({
      method: 'POST',
      url
    })

    request.setHeader('Content-Type', 'application/json')
    if (accessToken) {
      request.setHeader('Authorization', `Bearer ${accessToken}`)
    }

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

    request.write(JSON.stringify(params))
    request.end()
  })
}

export function stopCurrentRequest(): void {
  if (currentRequest) {
    currentRequest.abort()
    cleanup()
  }
}

export function apiRequest<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${path}`

    const request = net.request({
      method,
      url
    })

    request.setHeader('Content-Type', 'application/json')
    request.setHeader('X-Requested-With', 'XMLHttpRequest')
    if (accessToken) {
      request.setHeader('Authorization', `Bearer ${accessToken}`)
    }

    request.on('response', (response) => {
      let data = ''
      response.on('data', (chunk: Buffer) => {
        data += chunk.toString()
      })
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (response.statusCode && response.statusCode >= 400) {
            const error = new Error(parsed.message || parsed.detail || `HTTP ${response.statusCode}`)
            ;(error as Error & { statusCode?: number }).statusCode = response.statusCode
            ;(error as Error & { errorCode?: string }).errorCode = parsed.error_code
            reject(error)
          } else {
            resolve(parsed as T)
          }
        } catch (e) {
          reject(e)
        }
      })
      response.on('error', (error) => reject(error))
    })

    request.on('error', (error) => reject(error))

    if (body) {
      request.write(JSON.stringify(body))
    }
    request.end()
  })
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const result = await apiRequest<{ access_token: string; token_type: string; expires_in: number }>(
      'POST',
      API_PATH_AUTH_REFRESH
    )
    accessToken = result.access_token
    return true
  } catch {
    accessToken = null
    return false
  }
}

function resetTimeout(mainWindow: BrowserWindow): void {
  clearTimeoutHandle()
  timeoutHandle = setTimeout(() => {
    mainWindow.webContents.send(IPC_CHANNEL_SSE_EVENT, {
      type: 'error',
      data: { message: '响应超时' }
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

export {
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
}
