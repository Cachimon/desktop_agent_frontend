import { useAppStore } from '@/stores/appStore'
import type { HealthCheckResponse } from '@/types/health'

export function useHealthCheck() {
  const appStore = useAppStore()

  async function checkHealth(): Promise<HealthCheckResponse | null> {
    try {
      const result = await window.__ELECTRON_API__.healthCheck()
      if (result && result.status === 'healthy') {
        appStore.setBackendHealthy(true)
      } else {
        appStore.setBackendHealthy(false)
      }
      return result
    } catch {
      appStore.setBackendHealthy(false)
      return null
    }
  }

  return { checkHealth }
}
