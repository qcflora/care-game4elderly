<template>
  <div class="diary-viewer">
    <div v-for="entry in entries" :key="entry.id" class="diary-entry" :class="{ 'is-locked': !entry.isUnlocked }">
      <template v-if="entry.isUnlocked">
        <div class="diary-entry__header">
          <span class="diary-entry__date">{{ entry.date }}</span>
          <span class="diary-entry__mood">{{ entry.mood }}</span>
        </div>
        <h3 class="diary-entry__title">{{ entry.title }}</h3>
        <p class="diary-entry__content">{{ entry.content }}</p>
      </template>
      <div v-else class="diary-entry__locked">
        <span class="lock-icon"></span> Day {{ entry.day }} 待解锁
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiaryEntry } from '@/types/diary';

defineProps<{
  entries: DiaryEntry[];
}>();
</script>

<style scoped>
.diary-viewer {
  padding: var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}
.diary-entry {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-base);
  box-shadow: var(--shadow-sm);
}
.diary-entry__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}
.diary-entry__date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.diary-entry__mood {
  font-size: var(--font-size-sm);
}
.diary-entry__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}
.diary-entry__content {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}
.diary-entry__locked {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}
.lock-icon {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-text-tertiary);
  border-top: none;
  border-radius: 0 0 3px 3px;
  position: relative;
  display: inline-block;
  margin-top: 4px;
}
.lock-icon::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 1px;
  width: 6px;
  height: 6px;
  border: 2px solid var(--color-text-tertiary);
  border-bottom: none;
  border-radius: 3px 3px 0 0;
}
</style>
