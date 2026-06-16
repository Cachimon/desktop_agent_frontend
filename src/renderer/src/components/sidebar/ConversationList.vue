<script setup lang="ts">
import type { Conversation } from '@/types/conversation'
import ConversationItem from './ConversationItem.vue'

defineProps<{
  conversations: Conversation[]
  currentId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
  delete: [id: string]
}>()
</script>

<template>
  <div class="conversation-list">
    <div v-if="conversations.length === 0" class="conversation-empty">
      暂无会话
    </div>
    <ConversationItem
      v-for="conv in conversations"
      :key="conv.id"
      :conversation="conv"
      :active="conv.id === currentId"
      @select="emit('select', $event)"
      @delete="emit('delete', $event)"
    />
  </div>
</template>

<style scoped>
.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
}

.conversation-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: var(--color-text-tertiary);
  font-size: 13px;
}
</style>
