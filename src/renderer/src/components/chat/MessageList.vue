<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Message } from '@/types/message'
import MessageItem from './MessageItem.vue'
import { useAutoScroll } from '@/composables/useAutoScroll'

const props = defineProps<{
  messages: Message[]
}>()

const listRef = ref<HTMLElement | null>(null)
const { scrollToBottom, forceScrollToBottom, setupScrollListener, removeScrollListener } =
  useAutoScroll(listRef)

watch(
  () => props.messages.length,
  () => scrollToBottom()
)

watch(
  () => props.messages[props.messages.length - 1]?.content,
  () => scrollToBottom()
)

onMounted(() => {
  setupScrollListener()
  forceScrollToBottom()
})

onUnmounted(() => {
  removeScrollListener()
})
</script>

<template>
  <div ref="listRef" class="message-list">
    <MessageItem v-for="msg in messages" :key="msg.id" :message="msg" />
  </div>
</template>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
</style>
