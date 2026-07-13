<template>
  <div class="album-viewer">
    <div class="album-grid">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="album-item"
        :class="{ 'is-locked': !entry.isUnlocked }"
        @click="entry.isUnlocked && $emit('view', entry)"
      >
        <template v-if="entry.isUnlocked">
          <div class="album-item__image-wrapper">
            <img :src="entry.image" :alt="entry.title" class="album-item__image" />
          </div>
          <span class="album-item__title">{{ entry.title }}</span>
        </template>
        <div v-else class="album-item__locked">
          <span class="album-item__lock-icon"></span>
          <span class="album-item__hint">Day {{ entry.unlockDay }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AlbumEntry } from '@/types/album';

defineProps<{
  entries: AlbumEntry[];
}>();

defineEmits<{
  view: [entry: AlbumEntry];
}>();
</script>

<style scoped>
.album-viewer {
  padding: var(--spacing-base);
}
.album-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}
.album-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
}
.album-item__image-wrapper {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.album-item__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.album-item__title {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
}
.album-item__locked {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}
.album-item__lock-icon {
  width: 16px;
  height: 14px;
  border: 2px solid var(--color-text-tertiary);
  border-top: none;
  border-radius: 0 0 3px 3px;
  position: relative;
  display: inline-block;
  margin-top: 6px;
}
.album-item__lock-icon::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 1px;
  width: 8px;
  height: 8px;
  border: 2px solid var(--color-text-tertiary);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}
.album-item__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}
</style>
