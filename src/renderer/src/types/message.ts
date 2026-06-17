export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageStatus = 'completed' | 'streaming' | 'interrupted'

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  createdAt: string
  status: MessageStatus
  interruptReason?: string
}

export interface ToolCall {
  name: string
  input: string
}
