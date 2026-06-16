import { ref, type Ref, nextTick, watch } from 'vue'

export function useAutoScroll(containerRef: Ref<HTMLElement | null>) {
  const isUserScrolled = ref(false)

  function scrollToBottom(): void {
    nextTick(() => {
      if (containerRef.value && !isUserScrolled.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight
      }
    })
  }

  function handleScroll(): void {
    if (!containerRef.value) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.value
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50
    isUserScrolled.value = !isNearBottom
  }

  function forceScrollToBottom(): void {
    isUserScrolled.value = false
    scrollToBottom()
  }

  function setupScrollListener(): void {
    containerRef.value?.addEventListener('scroll', handleScroll, { passive: true })
  }

  function removeScrollListener(): void {
    containerRef.value?.removeEventListener('scroll', handleScroll)
  }

  return {
    isUserScrolled,
    scrollToBottom,
    forceScrollToBottom,
    setupScrollListener,
    removeScrollListener
  }
}
