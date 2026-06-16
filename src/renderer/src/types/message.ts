export type MessageRole = 'user' | 'assistant'

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
