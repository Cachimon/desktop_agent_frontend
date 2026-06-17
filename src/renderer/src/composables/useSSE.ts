import { onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useConversationStore } from '@/stores/conversationStore'
import { SSE_EVENT_TYPE_AI, SSE_EVENT_TYPE_TOOL, SSE_EVENT_TYPE_HUMAN, SSE_EVENT_TYPE_ERROR, SSE_EVENT_TYPE_END } from '@/constants'
import type { V3SSEEvent, AIEventData, HumanEventData, ErrorEventData, EndEventData } from '@/types/sse'
import type { HITLEvent } from '@/types/hitl'

export function useSSE() {
  const chatStore = useChatStore()
  const conversationStore = useConversationStore()

  let currentAssistantMessageId: string | null = null

  function handleSSEEvent(event: V3SSEEvent): void {
    switch (event.type) {
      case SSE_EVENT_TYPE_AI: {
        if (!currentAssistantMessageId) {
          const convId = conversationStore.currentConversationId
          if (convId) {
            const msg = chatStore.createAssistantMessage(convId)
            currentAssistantMessageId = msg.id
            conversationStore.incrementMessageCount(convId)
          }
        }
        if (currentAssistantMessageId) {
          const aiData = event.data as AIEventData
          chatStore.appendAssistantContent(currentAssistantMessageId, aiData.content)
        }
        break
      }
      case SSE_EVENT_TYPE_TOOL: {
        break
      }
      case SSE_EVENT_TYPE_HUMAN: {
        const humanData = event.data as HumanEventData
        const hitlEvent: HITLEvent = {
          action: humanData.action,
          message: humanData.message,
          checkpointId: event.message_id || '',
          conversationId: conversationStore.currentConversationId || ''
        }
        chatStore.setHITLPending(hitlEvent)
        break
      }
      case SSE_EVENT_TYPE_ERROR: {
        const errorData = event.data as ErrorEventData
        if (currentAssistantMessageId) {
          chatStore.interruptAssistantMessage(currentAssistantMessageId, errorData.message || '连接异常')
        }
        if (errorData.code === 'TOKEN_EXPIRED') {
          chatStore.isStreaming = false
          currentAssistantMessageId = null
          cleanup()
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
        break
      }
    }
  }

  function startStream(params: { conversation_id?: string; message: string; skill_hint?: string; stream_mode: string }): void {
    window.__ELECTRON_API__.onSSEEvent(handleSSEEvent)
    window.__ELECTRON_API__.chatStream(params)
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
