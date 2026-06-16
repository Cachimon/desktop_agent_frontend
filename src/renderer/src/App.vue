<script setup lang="ts">
import TitleBar from '@/components/titlebar/TitleBar.vue'
import ChatView from '@/views/ChatView.vue'
</script>

<template>
  <div class="app-container">
    <TitleBar />
    <ChatView />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
</style>
