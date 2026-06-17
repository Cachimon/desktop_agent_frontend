export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  components: ComponentStatus[]
}

export interface ComponentStatus {
  name: string
  status: 'healthy' | 'unhealthy'
  latencyMs?: number
  error?: string
}
