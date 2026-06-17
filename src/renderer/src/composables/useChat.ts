import { useChatStore } from '@/stores/chatStore'
import { useConversationStore } from '@/stores/conversationStore'
import { validateInput, isEmptyInput } from '@/utils/validators'
import { CONVERSATION_TITLE_TRUNCATE_LENGTH, DEFAULT_CONVERSATION_TITLE } from '@/constants'
import { useSSE } from './useSSE'

export function useChat() {
  const chatStore = useChatStore()
  const conversationStore = useConversationStore()
  const { startStream, stopStream } = useSSE()

  function sendMessage(content: string, skillHint?: string): string | null {
    if (isEmptyInput(content)) return null
    if (chatStore.isStreaming) return null

    const validation = validateInput(content)
    if (!validation.valid) {
      return validation.error || null
    }

    let convId = conversationStore.currentConversationId
    if (!convId) {
      convId = conversationStore.createConversation()
    }

    chatStore.addUserMessage(convId, content.trim())
    conversationStore.incrementMessageCount(convId)

    const conv = conversationStore.conversations.find((c) => c.id === convId)
    if (conv && conv.title === DEFAULT_CONVERSATION_TITLE) {
      const title = content.trim().slice(0, CONVERSATION_TITLE_TRUNCATE_LENGTH)
      conversationStore.updateConversationTitle(convId, title)
    }

    conversationStore.updateConversationTimestamp(convId)

    startStream({
      conversation_id: convId,
      message: content.trim(),
      skill_hint: skillHint,
      stream_mode: 'messages'
    })

    return null
  }

  function stopGeneration(): void {
    stopStream()
  }

  return { sendMessage, stopGeneration }
}
