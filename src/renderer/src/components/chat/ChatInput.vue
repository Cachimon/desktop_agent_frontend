<script setup lang="ts">
import { ref, computed } from 'vue'
import { MAX_INPUT_LENGTH } from '@/constants'

defineProps<{
  isStreaming: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
  stop: []
}>()

const inputText = ref('')
const lengthWarning = ref('')

const canSend = computed(() => {
  return inputText.value.trim().length > 0 && inputText.value.trim().length <= MAX_INPUT_LENGTH
})

function handleInput(e: Event): void {
  const target = e.target as HTMLTextAreaElement
  inputText.value = target.value
  if (target.value.length > MAX_INPUT_LENGTH) {
    lengthWarning.value = `消息过长，请缩短后发送（最大 ${MAX_INPUT_LENGTH} 字符）`
  } else {
    lengthWarning.value = ''
  }
  autoResize(target)
}

function autoResize(el: HTMLTextAreaElement): void {
  el.style.height = 'auto'
  const maxHeight = 200
  el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleSend(): void {
  const text = inputText.value.trim()
  if (!text || text.length > MAX_INPUT_LENGTH) return
  emit('send', text)
  inputText.value = ''
  lengthWarning.value = ''
  const textarea = document.querySelector('.chat-input textarea') as HTMLTextAreaElement
  if (textarea) {
    textarea.style.height = 'auto'
  }
}

function handleStop(): void {
  emit('stop')
}
</script>

<template>
  <div class="chat-input-wrapper">
    <div class="chat-input-container">
      <textarea
        class="chat-textarea"
        :value="inputText"
        placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
        rows="1"
        @input="handleInput"
        @keydown="handleKeydown"
      ></textarea>
      <div class="chat-input-actions">
        <button
          v-if="isStreaming"
          class="stop-btn"
          @click="handleStop"
          title="停止生成"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="3" width="10" height="10" rx="2" />
          </svg>
          <span>停止</span>
        </button>
        <button
          v-else
          class="send-btn"
          :class="{ disabled: !canSend }"
          @click="handleSend"
          :disabled="!canSend"
          title="发送消息"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8l12-6-6 12V8H2z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
    <div v-if="lengthWarning" class="input-warning">{{ lengthWarning }}</div>
  </div>
</template>

<style scoped>
.chat-input-wrapper {
  padding: 12px 24px 20px;
  background: var(--color-bg);
}

.chat-input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: border-color var(--transition-fast);
}

.chat-input-container:focus-within {
  border-color: var(--color-primary);
}

.chat-textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  line-height: 1.5;
  max-height: 200px;
  font-size: 14px;
  color: var(--color-text);
}

.chat-textarea::placeholder {
  color: var(--color-text-tertiary);
}

.chat-input-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  background: var(--color-primary);
  transition: all var(--transition-fast);
}

.send-btn:hover:not(.disabled) {
  background: var(--color-primary-dark);
}

.send-btn.disabled {
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.stop-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
  font-size: 12px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.stop-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.input-warning {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-warning);
  padding-left: 4px;
}
</style>
