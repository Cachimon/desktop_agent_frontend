<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/composables/useAuth'

const appStore = useAppStore()
const authStore = useAuthStore()
const { logout } = useAuth()

const userEmail = computed(() => authStore.userInfo?.email || '')
const isAuthenticated = computed(() => authStore.isAuthenticated)

function minimize(): void {
  window.__ELECTRON_API__.windowMinimize()
}

function maximize(): void {
  window.__ELECTRON_API__.windowMaximize()
}

function close(): void {
  window.__ELECTRON_API__.windowClose()
}

function handleLogout(): void {
  logout()
}

const emit = defineEmits<{
  openSettings: []
}>()
</script>

<template>
  <div class="titlebar">
    <div class="titlebar-drag">
      <span class="titlebar-title">AI Desktop Agent</span>
    </div>
    <div class="titlebar-info">
      <span v-if="isAuthenticated" class="titlebar-user">{{ userEmail }}</span>
    </div>
    <div class="titlebar-actions">
      <button v-if="isAuthenticated" class="titlebar-action-btn" @click="emit('openSettings')" title="设置">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.2" />
          <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.5 2.5l1.4 1.4M10.1 10.1l1.4 1.4M2.5 11.5l1.4-1.4M10.1 3.9l1.4-1.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </button>
      <button v-if="isAuthenticated" class="titlebar-action-btn" @click="handleLogout" title="登出">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 1H2a1 1 0 00-1 1v10a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
    <div class="titlebar-controls">
      <button class="titlebar-btn" @click="minimize" title="最小化">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect y="5" width="12" height="1.5" fill="currentColor" />
        </svg>
      </button>
      <button class="titlebar-btn" @click="maximize" title="最大化">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="1" y="1" width="10" height="10" stroke="currentColor" stroke-width="1.5" fill="none" />
        </svg>
      </button>
      <button class="titlebar-btn titlebar-btn-close" @click="close" title="关闭">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.5" />
          <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--titlebar-height);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border-light);
  user-select: none;
  -webkit-app-region: drag;
}

.titlebar-drag {
  flex: 1;
  padding-left: 12px;
}

.titlebar-title {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.titlebar-info {
  padding: 0 8px;
  -webkit-app-region: no-drag;
}

.titlebar-user {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.titlebar-actions {
  display: flex;
  gap: 2px;
  padding-right: 4px;
  -webkit-app-region: no-drag;
}

.titlebar-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.titlebar-action-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
}

.titlebar-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.titlebar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 100%;
  color: var(--color-text-secondary);
  transition: background var(--transition-fast);
}

.titlebar-btn:hover {
  background: var(--color-bg-hover);
}

.titlebar-btn-close:hover {
  background: var(--color-danger);
  color: white;
}
</style>
