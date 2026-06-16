import { onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useConversationStore } from '@/stores/conversationStore'
import { SSE_EVENT_TYPE_START, SSE_EVENT_TYPE_CONTENT, SSE_EVENT_TYPE_END } from '@/constants'
import type { SSEEvent } from '@/types/sse'

export function useSSE() {
  const chatStore = useChatStore()
  const conversationStore = useConversationStore()

  let currentAssistantMessageId: string | null = null

  function handleSSEEvent(event: SSEEvent): void {
    switch (event.type) {
      case SSE_EVENT_TYPE_START: {
        const convId = conversationStore.currentConversationId
        if (convId) {
          const msg = chatStore.createAssistantMessage(convId)
          currentAssistantMessageId = msg.id
          conversationStore.incrementMessageCount(convId)
        }
        break
      }
      case SSE_EVENT_TYPE_CONTENT: {
        if (currentAssistantMessageId) {
          chatStore.appendAssistantContent(currentAssistantMessageId, event.data)
        }
        break
      }
      case SSE_EVENT_TYPE_END: {
        if (currentAssistantMessageId) {
          chatStore.completeAssistantMessage(currentAssistantMessageId)
          const convId = conversationStore.currentConversationId
          if (convId) {
            conversationStore.updateConversationTimestamp(convId)
          }
        }
        currentAssistantMessageId = null
        cleanup()
        break
      }
      default: {
        if (event.type === 'error') {
          if (currentAssistantMessageId) {
            chatStore.interruptAssistantMessage(currentAssistantMessageId, event.data || '连接异常')
          }
          currentAssistantMessageId = null
          cleanup()
        }
        break
      }
    }
  }

  function startStream(userInput: string): void {
    window.__ELECTRON_API__.onSSEEvent(handleSSEEvent)
    window.__ELECTRON_API__.chatStream(userInput)
  }

  function stopStream(): void {
    if (currentAssistantMessageId) {
      chatStore.interruptAssistantMessage(currentAssistantMessageId, '用户停止生成')
      currentAssistantMessageId = null
    }
    window.__ELECTRON_API__.stopGeneration()
    cleanup()
  }

  function cleanup(): void {
    window.__ELECTRON_API__.removeSSEListener()
  }

  onUnmounted(() => {
    cleanup()
  })

  return { startStream, stopStream }
}
