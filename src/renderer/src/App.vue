<script setup lang="ts">
import { onMounted } from 'vue'
import TitleBar from '@/components/titlebar/TitleBar.vue'
import ChatView from '@/views/ChatView.vue'
import LoginView from '@/views/LoginView.vue'
import HealthCheckView from '@/views/HealthCheckView.vue'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { useHealthCheck } from '@/composables/useHealthCheck'

const appStore = useAppStore()
const authStore = useAuthStore()
const { checkHealth } = useHealthCheck()

onMounted(async () => {
  await checkHealth()
})
</script>

<template>
  <div class="app-container">
    <TitleBar @open-settings="() => {}" />
    <HealthCheckView v-if="!appStore.backendHealthy" />
    <LoginView v-else-if="!authStore.isAuthenticated" />
    <ChatView v-else />
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
