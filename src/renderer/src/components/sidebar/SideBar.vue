<script setup lang="ts">
import ConversationList from './ConversationList.vue'
import type { Conversation } from '@/types/conversation'

defineProps<{
  collapsed: boolean
  conversations: Conversation[]
  currentId: string | null
}>()

const emit = defineEmits<{
  toggle: []
  newConversation: []
  selectConversation: [id: string]
  deleteConversation: [id: string]
}>()
</script>

<template>
  <div class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="emit('newConversation')" :title="collapsed ? '新建会话' : ''">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span v-if="!collapsed" class="new-chat-text">新建会话</span>
      </button>
    </div>
    <ConversationList
      :conversations="conversations"
      :current-id="currentId"
      @select="emit('selectConversation', $event)"
      @delete="emit('deleteConversation', $event)"
    />
    <div class="sidebar-footer">
      <button class="toggle-btn" @click="emit('toggle')" :title="collapsed ? '展开侧边栏' : '折叠侧边栏'">
        <svg v-if="collapsed" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M7 4l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4l-5 5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  height: 100%;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-light);
  transition: width var(--transition-normal);
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  padding: 12px 8px 8px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-weight: 500;
  font-size: 13px;
  transition: background var(--transition-fast);
}

.new-chat-btn:hover {
  background: var(--color-bg-hover);
}

.sidebar.collapsed .new-chat-btn {
  padding: 10px;
}

.new-chat-text {
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-footer {
  padding: 8px;
  border-top: 1px solid var(--color-border-light);
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: background var(--transition-fast);
}

.toggle-btn:hover {
  background: var(--color-bg-hover);
}
</style>
