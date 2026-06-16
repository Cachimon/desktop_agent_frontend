<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import type { MessageRole } from '@/types/message'
import { renderMarkdown } from '@/utils/markdown'
import { sanitizeHtml } from '@/utils/sanitize'

const props = defineProps<{
  content: string
  role: MessageRole
  isStreaming: boolean
}>()

const contentRef = ref<HTMLElement | null>(null)

const renderedContent = computed(() => {
  if (props.role === 'user') return ''
  try {
    const html = renderMarkdown(props.content)
    return sanitizeHtml(html)
  } catch {
    return props.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
  }
})

function injectCopyButtons(): void {
  if (!contentRef.value) return
  const codeBlocks = contentRef.value.querySelectorAll('pre.hljs')
  codeBlocks.forEach((block) => {
    if (block.querySelector('.copy-btn')) return

    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'
    wrapper.style.position = 'relative'

    const header = document.createElement('div')
    header.className = 'code-block-header'

    const langTag = block.querySelector('.hljs-language')?.textContent || ''
    const langSpan = document.createElement('span')
    langSpan.textContent = langTag
    header.appendChild(langSpan)

    const copyBtn = document.createElement('button')
    copyBtn.className = 'copy-btn'
    copyBtn.textContent = '复制'
    copyBtn.addEventListener('click', () => {
      const code = block.querySelector('code')?.textContent || ''
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = '已复制'
        copyBtn.classList.add('copied')
        setTimeout(() => {
          copyBtn.textContent = '复制'
          copyBtn.classList.remove('copied')
        }, 2000)
      })
    })
    header.appendChild(copyBtn)

    const parent = block.parentNode
    if (parent) {
      parent.insertBefore(wrapper, block)
      wrapper.appendChild(header)
      wrapper.appendChild(block)
    }
  })
}

watch(
  () => props.content,
  () => {
    if (!props.isStreaming) {
      nextTick(injectCopyButtons)
    }
  }
)

watch(
  () => props.isStreaming,
  (newVal) => {
    if (!newVal) {
      nextTick(injectCopyButtons)
    }
  }
)

onMounted(() => {
  if (!props.isStreaming && props.content) {
    nextTick(injectCopyButtons)
  }
})
</script>

<template>
  <div class="message-content" ref="contentRef">
    <div v-if="role === 'user'" class="user-text">{{ content }}</div>
    <div v-else class="markdown-body" v-html="renderedContent"></div>
  </div>
</template>

<style scoped>
.message-content {
  width: 100%;
  word-break: break-word;
}

.user-text {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
