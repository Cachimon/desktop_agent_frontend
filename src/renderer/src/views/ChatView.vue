<script setup lang="ts">
import { computed, onMounted } from 'vue'
import SideBar from '@/components/sidebar/SideBar.vue'
import MessageList from '@/components/chat/MessageList.vue'
import WelcomeScreen from '@/components/chat/WelcomeScreen.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import { useConversationStore } from '@/stores/conversationStore'
import { useChatStore } from '@/stores/chatStore'
import { useAppStore } from '@/stores/appStore'
import { useChat } from '@/composables/useChat'

const conversationStore = useConversationStore()
const chatStore = useChatStore()
const appStore = useAppStore()
const { sendMessage, stopGeneration } = useChat()

const sortedConversations = computed(() => conversationStore.getSortedConversations)
const currentMessages = computed(() => chatStore.currentMessages)
const hasMessages = computed(() => currentMessages.value.length > 0)

function handleNewConversation(): void {
  conversationStore.createConversation()
}

function handleSelectConversation(id: string): void {
  conversationStore.switchConversation(id)
}

function handleDeleteConversation(id: string): void {
  conversationStore.deleteConversation(id)
  chatStore.clearMessages(id)
}

function handleToggleSidebar(): void {
  appStore.toggleSidebar()
}

function handleSend(content: string): void {
  sendMessage(content)
}

function handleStop(): void {
  stopGeneration()
}

onMounted(() => {
  if (conversationStore.conversations.length === 0) {
    conversationStore.createConversation()
  }
})
</script>

<template>
  <div class="chat-view">
    <SideBar
      :collapsed="appStore.sidebarCollapsed"
      :conversations="sortedConversations"
      :current-id="conversationStore.currentConversationId"
      @toggle="handleToggleSidebar"
      @new-conversation="handleNewConversation"
      @select-conversation="handleSelectConversation"
      @delete-conversation="handleDeleteConversation"
    />
    <div class="chat-panel">
      <WelcomeScreen v-if="!hasMessages" />
      <MessageList v-else :messages="currentMessages" />
      <ChatInput
        :is-streaming="chatStore.isStreaming"
        @send="handleSend"
        @stop="handleStop"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  height: calc(100vh - var(--titlebar-height));
  overflow: hidden;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-bg);
}
</style>
