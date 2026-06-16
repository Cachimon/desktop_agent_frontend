import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Conversation } from '@/types/conversation'
import { generateUUID } from '@/utils/uuid'
import { DEFAULT_CONVERSATION_TITLE, STORAGE_KEY_CONVERSATION } from '@/constants'

export const useConversationStore = defineStore(
  'conversation',
  () => {
    const conversations = ref<Conversation[]>([])
    const currentConversationId = ref<string | null>(null)

    const getSortedConversations = computed(() => {
      return [...conversations.value].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    })

    const currentConversation = computed(() => {
      return conversations.value.find((c) => c.id === currentConversationId.value) || null
    })

    function createConversation(): string {
      const now = new Date().toISOString()
      const id = generateUUID()
      const conv: Conversation = {
        id,
        title: DEFAULT_CONVERSATION_TITLE,
        createdAt: now,
        updatedAt: now,
        messageCount: 0
      }
      conversations.value.push(conv)
      currentConversationId.value = id
      return id
    }

    function deleteConversation(id: string): void {
      const idx = conversations.value.findIndex((c) => c.id === id)
      if (idx === -1) return

      conversations.value.splice(idx, 1)

      if (currentConversationId.value === id) {
        if (conversations.value.length > 0) {
          const sorted = [...conversations.value].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          currentConversationId.value = sorted[0].id
        } else {
          createConversation()
        }
      }
    }

    function switchConversation(id: string): void {
      const exists = conversations.value.some((c) => c.id === id)
      if (exists) {
        currentConversationId.value = id
      }
    }

    function updateConversationTitle(id: string, title: string): void {
      const conv = conversations.value.find((c) => c.id === id)
      if (conv) {
        conv.title = title.slice(0, 50)
        conv.updatedAt = new Date().toISOString()
      }
    }

    function updateConversationTimestamp(id: string): void {
      const conv = conversations.value.find((c) => c.id === id)
      if (conv) {
        conv.updatedAt = new Date().toISOString()
      }
    }

    function incrementMessageCount(id: string): void {
      const conv = conversations.value.find((c) => c.id === id)
      if (conv) {
        conv.messageCount++
      }
    }

    return {
      conversations,
      currentConversationId,
      getSortedConversations,
      currentConversation,
      createConversation,
      deleteConversation,
      switchConversation,
      updateConversationTitle,
      updateConversationTimestamp,
      incrementMessageCount
    }
  },
  {
    persist: {
      key: STORAGE_KEY_CONVERSATION,
      pick: ['conversations', 'currentConversationId']
    }
  }
)
