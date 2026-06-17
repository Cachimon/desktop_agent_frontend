import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message } from '@/types/message'
import type { HITLEvent } from '@/types/hitl'
import { generateUUID } from '@/utils/uuid'
import { STORAGE_KEY_CHAT } from '@/constants'
import { useConversationStore } from './conversationStore'

export const useChatStore = defineStore(
  'chat',
  () => {
    const messages = ref<Record<string, Message[]>>({})
    const isStreaming = ref(false)
    const streamingMessageId = ref<string | null>(null)
    const hitlPending = ref(false)
    const hitlCheckpointId = ref<string | null>(null)
    const hitlEvent = ref<HITLEvent | null>(null)

    const currentMessages = computed(() => {
      const convStore = useConversationStore()
      const convId = convStore.currentConversationId
      if (!convId) return []
      return messages.value[convId] || []
    })

    function getMessagesByConversation(conversationId: string): Message[] {
      return messages.value[conversationId] || []
    }

    function addUserMessage(conversationId: string, content: string): Message {
      const msg: Message = {
        id: generateUUID(),
        conversationId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
        status: 'completed'
      }
      if (!messages.value[conversationId]) {
        messages.value[conversationId] = []
      }
      messages.value[conversationId].push(msg)
      return msg
    }

    function createAssistantMessage(conversationId: string): Message {
      const msg: Message = {
        id: generateUUID(),
        conversationId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        status: 'streaming'
      }
      if (!messages.value[conversationId]) {
        messages.value[conversationId] = []
      }
      messages.value[conversationId].push(msg)
      streamingMessageId.value = msg.id
      isStreaming.value = true
      return msg
    }

    function appendAssistantContent(messageId: string, token: string): void {
      for (const convId in messages.value) {
        const msg = messages.value[convId].find((m) => m.id === messageId)
        if (msg) {
          msg.content += token
          return
        }
      }
    }

    function completeAssistantMessage(messageId: string): void {
      for (const convId in messages.value) {
        const msg = messages.value[convId].find((m) => m.id === messageId)
        if (msg) {
          msg.status = 'completed'
          break
        }
      }
      isStreaming.value = false
      streamingMessageId.value = null
    }

    function interruptAssistantMessage(messageId: string, reason: string): void {
      for (const convId in messages.value) {
        const msg = messages.value[convId].find((m) => m.id === messageId)
        if (msg) {
          msg.status = 'interrupted'
          msg.interruptReason = reason
          break
        }
      }
      isStreaming.value = false
      streamingMessageId.value = null
    }

    function setHITLPending(event: HITLEvent): void {
      hitlPending.value = true
      hitlCheckpointId.value = event.checkpointId
      hitlEvent.value = event
    }

    function clearHITLPending(): void {
      hitlPending.value = false
      hitlCheckpointId.value = null
      hitlEvent.value = null
    }

    function loadMessagesFromBackend(conversationId: string, backendMessages: Message[]): void {
      messages.value[conversationId] = backendMessages
    }

    function clearMessages(conversationId: string): void {
      delete messages.value[conversationId]
    }

    return {
      messages,
      isStreaming,
      streamingMessageId,
      hitlPending,
      hitlCheckpointId,
      hitlEvent,
      currentMessages,
      getMessagesByConversation,
      addUserMessage,
      createAssistantMessage,
      appendAssistantContent,
      completeAssistantMessage,
      interruptAssistantMessage,
      setHITLPending,
      clearHITLPending,
      loadMessagesFromBackend,
      clearMessages
    }
  },
  {
    persist: {
      key: STORAGE_KEY_CHAT,
      pick: ['messages']
    }
  }
)
