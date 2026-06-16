<script setup lang="ts">
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

function minimize() {
  window.__ELECTRON_API__.windowMinimize()
}

function maximize() {
  window.__ELECTRON_API__.windowMaximize()
}

function close() {
  window.__ELECTRON_API__.windowClose()
}
</script>

<template>
  <div class="titlebar">
    <div class="titlebar-drag">
      <span class="titlebar-title">AI Desktop Agent</span>
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
