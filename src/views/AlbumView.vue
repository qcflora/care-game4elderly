<template>
  <div class="album-view">
    <header class="album-view__header">
      <button class="album-view__back" @click="goBack">← 返回</button>
      <h2 class="album-view__title">时光相册</h2>
      <span class="album-view__count" v-if="currentCharacter">
        {{ unlockedEntries.length }} / {{ allEntries.length }} 张
      </span>
    </header>

    <div class="album-view__character" v-if="currentCharacter">
      <p class="album-view__hint">
        {{ currentCharacter.nickname }}的相册 · Day {{ gameStore.currentDay }}
      </p>
    </div>

    <AlbumViewer :entries="displayEntries" @view="viewPhoto" />

    <!-- 照片查看弹窗 -->
    <Transition name="fade">
      <div class="album-view__photo-viewer" v-if="viewingEntry">
        <div class="photo-viewer__card">
          <div class="photo-viewer__image-area">
            <div class="photo-viewer__placeholder">
              <div class="photo-viewer__album-icon"></div>
            </div>
          </div>
          <div class="photo-viewer__info">
            <h3 class="photo-viewer__title">{{ viewingEntry.title }}</h3>
            <p class="photo-viewer__caption">{{ viewingEntry.caption }}</p>
            <div class="photo-viewer__divider"></div>
            <p class="photo-viewer__memory">{{ viewingEntry.memory }}</p>
            <p class="photo-viewer__day" v-if="viewingEntry.unlockDay">
              第{{ viewingEntry.unlockDay }}天
            </p>
          </div>
          <button class="photo-viewer__close" @click="closeViewer">关闭</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useStoryStore } from '@/stores/storyStore';
import { loadAlbumData } from '@/utils/dataLoader';
import type { AlbumEntry } from '@/types/album';
import AlbumViewer from '@/components/album/AlbumViewer.vue';

const router = useRouter();
const gameStore = useGameStore();
const storyStore = useStoryStore();

const allEntries = ref<AlbumEntry[]>([]);
const viewingEntry = ref<AlbumEntry | null>(null);

const currentCharacter = computed(() => gameStore.currentCharacter);

const unlockedEntries = computed(() => {
  const unlockedIds = storyStore.unlockedAlbumEntries;
  return allEntries.value.filter(e => unlockedIds.includes(e.id));
});

const displayEntries = computed(() => {
  if (allEntries.value.length === 0) return [];
  return allEntries.value.map(entry => ({
    ...entry,
    isUnlocked: storyStore.unlockedAlbumEntries.includes(entry.id),
  }));
});

async function loadData() {
  if (!currentCharacter.value) {
    router.push('/select');
    return;
  }
  const data = await loadAlbumData(currentCharacter.value.id);
  allEntries.value = data;
}

function viewPhoto(entry: AlbumEntry) {
  if (!entry.isUnlocked) return;
  viewingEntry.value = entry;
}

function closeViewer() {
  viewingEntry.value = null;
}

function goBack() {
  router.back();
}

onMounted(loadData);
</script>

<style scoped>
.album-view {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.album-view__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
  border-bottom: 1px solid var(--color-border);
}

.album-view__back {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  padding: var(--spacing-xs) 0;
}

.album-view__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  flex: 1;
}

.album-view__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.album-view__character {
  padding: var(--spacing-xs) var(--spacing-base);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
}

.album-view__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* 照片查看器弹窗 */
.album-view__photo-viewer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--spacing-base);
}

.photo-viewer__card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  max-width: 400px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.photo-viewer__image-area {
  width: 100%;
  height: 200px;
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.photo-viewer__placeholder {
  width: 80px;
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-viewer__album-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  border: 2px solid var(--color-border);
  background: var(--color-spirit-power-light);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-viewer__album-icon::before {
  content: '';
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--color-spirit-power);
  position: absolute;
}

.photo-viewer__info {
  padding: var(--spacing-base);
}

.photo-viewer__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.photo-viewer__caption {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
  margin-bottom: var(--spacing-sm);
}

.photo-viewer__divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--spacing-sm) 0;
}

.photo-viewer__memory {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-sm);
}

.photo-viewer__day {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.photo-viewer__close {
  display: block;
  width: calc(100% - var(--spacing-base) * 2);
  margin: 0 var(--spacing-base) var(--spacing-base);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border: 2px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>