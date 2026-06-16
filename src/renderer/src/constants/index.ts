export { API_BASE_URL, API_PATH_CHAT_STREAM, API_PATH_CHAT_NON_STREAM } from '../../../shared/constants'

export const SSE_EVENT_TYPE_START = 'start'
export const SSE_EVENT_TYPE_CONTENT = 'content'
export const SSE_EVENT_TYPE_END = 'end'

export const MAX_INPUT_LENGTH = 4096
export const MAX_MESSAGE_CONTENT_LENGTH = 32768
export const MAX_CONVERSATION_TITLE_LENGTH = 50

export const DEFAULT_CONVERSATION_TITLE = '新对话'
export const CONVERSATION_TITLE_TRUNCATE_LENGTH = 20

export const SSE_STREAM_TIMEOUT_MS = 60_000
export const IPC_CALL_TIMEOUT_MS = 5_000

export const STORAGE_KEY_CONVERSATION = 'agent-conversation-store'
export const STORAGE_KEY_CHAT = 'agent-chat-store'
export const STORAGE_KEY_APP = 'agent-app-store'

export const IPC_CHANNEL_WINDOW_MINIMIZE = 'window:minimize'
export const IPC_CHANNEL_WINDOW_MAXIMIZE = 'window:maximize'
export const IPC_CHANNEL_WINDOW_CLOSE = 'window:close'
export const IPC_CHANNEL_APP_VERSION = 'app:version'
export const IPC_CHANNEL_CHAT_STREAM = 'chat:stream'
export const IPC_CHANNEL_CHAT_NON_STREAM = 'chat:nonStream'
export const IPC_CHANNEL_CHAT_STOP = 'chat:stop'
export const IPC_CHANNEL_SSE_EVENT = 'sse:event'
export const IPC_CHANNEL_BEFORE_CLOSE = 'window:before-close'
