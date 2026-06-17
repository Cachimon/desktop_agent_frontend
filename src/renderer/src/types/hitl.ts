export interface HITLEvent {
  action: string
  message: string
  checkpointId: string
  conversationId: string
}

export type HITLDecision = 'approve' | 'reject'
