export interface ChatStreamRequest {
  conversation_id?: string
  message: string
  skill_hint?: string
  stream_mode: 'messages'
}

export interface ChatNonStreamRequest {
  conversation_id?: string
  message: string
  skill_hint?: string
}

export interface ChatNonStreamResponse {
  data: string
}

export interface HITLConfirmRequest {
  conversation_id: string
  checkpoint_id: string
  decision: 'approve' | 'reject'
  context?: string
}

export interface HITLConfirmResponse {
  status: string
  conversation_id: string
  checkpoint_id: string
  decision: string
}

export interface ConversationCreateRequest {
  title?: string
}

export interface ConversationListParams {
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface ConversationDetail {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export interface MessageFromBackend {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  status: 'completed' | 'streaming' | 'interrupted'
  created_at: string
  interrupt_reason?: string
}

export interface SkillListResponse {
  skills: SkillMetadata[]
}

export interface SkillMetadata {
  name: string
  description: string
  version: string
  enabled: boolean
  category?: string
}

export interface SkillDetail {
  name: string
  description: string
  version: string
  instructions: string
  parameters: SkillParameter[]
  enabled: boolean
}

export interface SkillParameter {
  name: string
  type: string
  description: string
  required: boolean
  default_value?: string
}

export interface WorkspaceListResponse {
  workspaces: WorkspaceConfig[]
}

export interface WorkspaceConfig {
  path: string
  alias?: string
  added_at: string
  confirm_level: 'low' | 'high'
}

export interface WorkspaceAddRequest {
  path: string
  alias?: string
  confirm_level: 'low' | 'high'
}

export interface SendCodeRequest {
  email: string
}

export interface SendCodeResponse {
  message: string
}

export interface AuthLoginRequest {
  email: string
  code: string
}

export interface AuthLoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: UserInfoBackend
}

export interface AuthRefreshResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface UserInfoBackend {
  id: string
  email: string
  is_active: boolean
  created_at: string
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  components: ComponentStatus[]
}

export interface ComponentStatus {
  name: string
  status: 'healthy' | 'unhealthy'
  latency_ms?: number
  error?: string
}
