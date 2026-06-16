<script setup lang="ts">
import type { Conversation } from '@/types/conversation'

defineProps<{
  conversation: Conversation
  active: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  delete: [id: string]
}>()
</script>

<template>
  <div
    class="conversation-item"
    :class="{ active }"
    @click="emit('select', conversation.id)"
  >
    <div class="conversation-info">
      <div class="conversation-title">{{ conversation.title }}</div>
      <div class="conversation-time">{{ conversation.updatedAt.slice(5, 16).replace('T', ' ') }}</div>
    </div>
    <button
      class="conversation-delete"
      @click.stop="emit('delete', conversation.id)"
      title="删除会话"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 4h10M5 4V2.5h4V4M6 6.5v4M8 6.5v4M3.5 4l.5 8h6l.5-8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.conversation-item:hover {
  background: var(--color-bg-hover);
}

.conversation-item.active {
  background: var(--color-primary-bg);
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text);
}

.conversation-time {
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.conversation-delete {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  opacity: 0;
  transition: all var(--transition-fast);
}

.conversation-item:hover .conversation-delete {
  opacity: 1;
}

.conversation-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}
</style>
