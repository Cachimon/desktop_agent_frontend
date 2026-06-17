import { useChatStore } from '@/stores/chatStore'
import type { HITLDecision } from '@/types/hitl'
import { HITL_DECISION_APPROVE } from '@/constants'

export function useHITL() {
  const chatStore = useChatStore()

  async function submitHITLDecision(decision: HITLDecision): Promise<string | null> {
    if (!chatStore.hitlCheckpointId || !chatStore.hitlEvent) return null

    try {
      await window.__ELECTRON_API__.hitlConfirm({
        conversation_id: chatStore.hitlEvent.conversationId,
        checkpoint_id: chatStore.hitlCheckpointId,
        decision,
        context: decision === HITL_DECISION_APPROVE ? 'approved' : 'rejected'
      })
      chatStore.clearHITLPending()
      return null
    } catch (error) {
      const err = error as Error & { errorCode?: string }
      if (err.errorCode === 'CHECKPOINT_NOT_FOUND') {
        return '确认点不存在，可能已过期'
      }
      if (err.errorCode === 'CHECKPOINT_EXPIRED') {
        return '确认点已过期，请重新发起操作'
      }
      if (err.errorCode === 'CONFLICT') {
        return '操作冲突，请稍后重试'
      }
      chatStore.clearHITLPending()
      return err.message || 'HITL确认失败'
    }
  }

  return { submitHITLDecision }
}
