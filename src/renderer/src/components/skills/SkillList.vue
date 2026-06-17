<script setup lang="ts">
import type { SkillMetadata } from '@/types/skill'

defineProps<{
  skills: SkillMetadata[]
  loading: boolean
}>()

const emit = defineEmits<{
  select: [name: string]
}>()
</script>

<template>
  <div class="skill-list">
    <div class="skill-list-header">
      <span class="skill-list-title">技能</span>
    </div>
    <div v-if="loading" class="skill-loading">加载中...</div>
    <div v-else-if="skills.length === 0" class="skill-empty">暂无可用技能</div>
    <div v-else class="skill-items">
      <div
        v-for="skill in skills"
        :key="skill.name"
        class="skill-item"
        @click="emit('select', skill.name)"
      >
        <div class="skill-info">
          <div class="skill-name">
            {{ skill.name }}
            <span v-if="!skill.enabled" class="skill-disabled-tag">已禁用</span>
          </div>
          <div class="skill-desc">{{ skill.description }}</div>
        </div>
        <div class="skill-version">{{ skill.version }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-list {
  padding: 0 8px;
}

.skill-list-header {
  padding: 8px 12px;
}

.skill-list-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  letter-spacing: 0.5px;
}

.skill-loading,
.skill-empty {
  padding: 16px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.skill-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.skill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.skill-item:hover {
  background: var(--color-bg-hover);
}

.skill-info {
  flex: 1;
  min-width: 0;
}

.skill-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.skill-disabled-tag {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
}

.skill-desc {
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-version {
  font-size: 11px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}
</style>
