<script setup lang="ts">
import type { HITLEvent } from '@/types/hitl'

defineProps<{
  visible: boolean
  hitlEvent: HITLEvent | null
  loading: boolean
  errorMessage: string | null
}>()

const emit = defineEmits<{
  approve: []
  reject: []
}>()
</script>

<template>
  <div v-if="visible" class="hitl-overlay" role="dialog" aria-modal="true" aria-label="操作确认">
    <div class="hitl-dialog">
      <div class="hitl-header">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2l8 14H2L10 2z" fill="var(--color-warning)" stroke="var(--color-warning)" stroke-width="1" />
          <line x1="10" y1="8" x2="10" y2="11" stroke="white" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="10" cy="14" r="0.8" fill="white" />
        </svg>
        <span class="hitl-title">操作确认</span>
      </div>
      <div class="hitl-body">
        <div v-if="hitlEvent" class="hitl-content">
          <div class="hitl-action">
            <span class="hitl-label">操作类型：</span>
            <span class="hitl-action-name">{{ hitlEvent.action }}</span>
          </div>
          <div class="hitl-message">
            <span class="hitl-label">详情：</span>
            <span>{{ hitlEvent.message }}</span>
          </div>
        </div>
        <div v-if="errorMessage" class="hitl-error">{{ errorMessage }}</div>
      </div>
      <div class="hitl-footer">
        <button
          class="hitl-btn hitl-btn-reject"
          :disabled="loading"
          @click="emit('reject')"
        >
          拒绝
        </button>
        <button
          class="hitl-btn hitl-btn-approve"
          :disabled="loading"
          @click="emit('approve')"
        >
          {{ loading ? '提交中...' : '确认执行' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hitl-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
}

.hitl-dialog {
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  width: 420px;
  max-width: 90vw;
  overflow: hidden;
}

.hitl-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.hitl-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.hitl-body {
  padding: 20px;
}

.hitl-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hitl-label {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-bottom: 4px;
  display: block;
}

.hitl-action-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-warning);
}

.hitl-message {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.hitl-error {
  margin-top: 12px;
  padding: 8px 12px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.hitl-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--color-border-light);
}

.hitl-btn {
  padding: 8px 20px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.hitl-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hitl-btn-reject {
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
}

.hitl-btn-reject:hover:not(:disabled) {
  background: var(--color-bg-tertiary);
}

.hitl-btn-approve {
  color: white;
  background: var(--color-primary);
}

.hitl-btn-approve:hover:not(:disabled) {
  background: var(--color-primary-dark);
}
</style>
