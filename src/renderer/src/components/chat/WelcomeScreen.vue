<template>
  <div class="welcome-screen">
    <div class="welcome-icon">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="var(--color-primary)" stroke-width="2" />
        <circle cx="24" cy="24" r="8" fill="var(--color-primary)" opacity="0.3" />
        <circle cx="24" cy="24" r="4" fill="var(--color-primary)" />
      </svg>
    </div>
    <h2 class="welcome-title">AI Desktop Agent</h2>
    <p class="welcome-desc">你的智能桌面助手，帮你整理文件、重命名、搜索等</p>
    <div class="welcome-tips">
      <div class="tip-item">
        <span class="tip-icon">📁</span>
        <span>帮我整理下载文件夹</span>
      </div>
      <div class="tip-item">
        <span class="tip-icon">✏️</span>
        <span>批量重命名这些文件</span>
      </div>
      <div class="tip-item">
        <span class="tip-icon">🔍</span>
        <span>找到上周修改的文档</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
}

.welcome-icon {
  margin-bottom: 20px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}

.welcome-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.welcome-tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 360px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: background var(--transition-fast);
  cursor: default;
}

.tip-item:hover {
  background: var(--color-bg-tertiary);
}

.tip-icon {
  font-size: 16px;
}
</style>
