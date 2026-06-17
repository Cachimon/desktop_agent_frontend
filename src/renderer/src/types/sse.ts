export type V3SSEEventType = 'ai' | 'tool' | 'human' | 'error' | 'end'

export interface AIEventData {
  content: string
  tool_calls?: ToolCall[]
}

export interface ToolEventData {
  name: string
  input: string
}

export interface HumanEventData {
  action: string
  message: string
}

export interface ErrorEventData {
  message: string
  code?: string
}

export interface EndEventData {
  conversation_id: string
  checkpoint_id: string
}

export interface V3SSEEvent {
  type: V3SSEEventType
  ns?: string
  data: AIEventData | ToolEventData | HumanEventData | ErrorEventData | EndEventData
  message_id?: string
}

export interface ToolCall {
  name: string
  input: string
}
