<script setup lang="ts">
import { ref } from 'vue'
import { useHealthCheck } from '@/composables/useHealthCheck'
import type { HealthCheckResponse } from '@/types/health'
import { TEXT_ERROR_BACKEND_UNREACHABLE, TEXT_HEALTH_CHECK_RETRY } from '@/constants'

const { checkHealth } = useHealthCheck()

const healthData = ref<HealthCheckResponse | null>(null)
const checking = ref(false)
const errorMessage = ref<string | null>(null)

async function handleRetry(): Promise<void> {
  checking.value = true
  errorMessage.value = null
  healthData.value = null
  const result = await checkHealth()
  healthData.value = result
  if (!result) {
    errorMessage.value = TEXT_ERROR_BACKEND_UNREACHABLE
  }
  checking.value = false
}

handleRetry()
</script>

<template>
  <div class="health-view">
    <div class="health-container">
      <div class="health-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="var(--color-warning)" stroke-width="2" />
          <line x1="24" y1="14" x2="24" y2="26" stroke="var(--color-warning)" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="24" cy="32" r="2" fill="var(--color-warning)" />
        </svg>
      </div>
      <h2 class="health-title">后端服务状态检查</h2>
      <p class="health-desc">正在检查后端服务连接状态...</p>

      <div v-if="checking" class="health-loading">检查中...</div>

      <div v-if="errorMessage" class="health-error">{{ errorMessage }}</div>

      <div v-if="healthData && healthData.status === 'unhealthy'" class="health-components">
        <div v-for="comp in healthData.components" :key="comp.name" class="component-card">
          <div class="component-header">
            <span class="component-name">{{ comp.name }}</span>
            <span class="component-status" :class="comp.status">{{ comp.status }}</span>
          </div>
          <div v-if="comp.error" class="component-error">{{ comp.error }}</div>
          <div v-if="comp.latency_ms !== undefined" class="component-latency">
            延迟: {{ comp.latency_ms }}ms
          </div>
        </div>
      </div>

      <button class="health-retry-btn" :disabled="checking" @click="handleRetry">
        {{ TEXT_HEALTH_CHECK_RETRY }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.health-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - var(--titlebar-height));
  background: var(--color-bg);
}

.health-container {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  text-align: center;
}

.health-icon {
  margin-bottom: 20px;
}

.health-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}

.health-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.health-loading {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin-bottom: 16px;
}

.health-error {
  padding: 12px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 13px;
  margin-bottom: 16px;
}

.health-components {
  display: flex;
  flex-direction: column;
  gap: var(--health-card-gap);
  margin-bottom: 24px;
  text-align: left;
}

.component-card {
  padding: 12px 16px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.component-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.component-status {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.component-status.healthy {
  color: var(--color-success);
  background: var(--color-success-bg);
}

.component-status.unhealthy {
  color: var(--color-danger);
  background: var(--color-danger-bg);
}

.component-error {
  font-size: 12px;
  color: var(--color-danger);
  margin-top: 6px;
}

.component-latency {
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
}

.health-retry-btn {
  padding: 10px 24px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: white;
  background: var(--color-primary);
  transition: all var(--transition-fast);
}

.health-retry-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.health-retry-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}
</style>
