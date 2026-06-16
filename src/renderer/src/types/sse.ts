export type SSEEventType = 'start' | 'content' | 'end'

export interface SSEEvent {
  type: SSEEventType
  data: string
}
