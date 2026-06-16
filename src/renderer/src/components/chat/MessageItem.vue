<script setup lang="ts">
import type { Message } from '@/types/message'
import MessageContent from './MessageContent.vue'
import StreamingIndicator from './StreamingIndicator.vue'

defineProps<{
  message: Message
}>()
</script>

<template>
  <div class="message-item" :class="[`message-${message.role}`]">
    <div class="message-avatar">
      <div v-if="message.role === 'assistant'" class="avatar avatar-ai">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5" />
          <circle cx="9" cy="9" r="3" fill="currentColor" />
        </svg>
      </div>
      <div v-else class="avatar avatar-user">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="5" r="3" stroke="currentColor" stroke-width="1.5" />
          <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </div>
    </div>
    <div class="message-body">
      <MessageContent
        :content="message.content"
        :role="message.role"
        :isStreaming="message.status === 'streaming'"
      />
      <StreamingIndicator v-if="message.status === 'streaming'" />
      <div v-if="message.status === 'interrupted'" class="message-interrupted">
        {{ message.interruptReason || '响应中断' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-item {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  max-width: 100%;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.avatar-ai {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.avatar-user {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.message-body {
  max-width: 70%;
  min-width: 0;
}

.message-user .message-body {
  background: var(--color-primary);
  color: white;
  padding: 10px 16px;
  border-radius: 16px 16px 4px 16px;
}

.message-assistant .message-body {
  background: var(--color-bg-secondary);
  padding: 10px 16px;
  border-radius: 16px 16px 16px 4px;
}

.message-interrupted {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-warning);
  font-style: italic;
}
</style>
