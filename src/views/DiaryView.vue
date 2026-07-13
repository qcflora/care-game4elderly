<template>
  <div class="diary-view">
    <header class="diary-view__header">
      <button class="diary-view__back" @click="goBack">← 返回</button>
      <h2 class="diary-view__title">守护日记</h2>
      <span class="diary-view__count" v-if="currentCharacter">
        {{ unlockedEntries.length }} / {{ allEntries.length }} 篇
      </span>
    </header>

    <div class="diary-view__character" v-if="currentCharacter">
      <p class="diary-view__hint">
        {{ currentCharacter.nickname }}的守护日记 · 第{{ gameStore.currentDay }}天
      </p>
    </div>

    <DiaryViewer :entries="displayEntries" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useStoryStore } from '@/stores/storyStore';
import { loadDiaryData } from '@/utils/dataLoader';
import type { DiaryEntry } from '@/types/diary';
import DiaryViewer from '@/components/diary/DiaryViewer.vue';

const router = useRouter();
const gameStore = useGameStore();
const storyStore = useStoryStore();

const allEntries = ref<DiaryEntry[]>([]);

const currentCharacter = computed(() => gameStore.currentCharacter);

const unlockedEntries = computed(() => {
  const unlockedIds = storyStore.unlockedDiaryEntries;
  return allEntries.value.filter(e => unlockedIds.includes(e.id));
});

const displayEntries = computed(() => {
  if (allEntries.value.length === 0) return [];
  return allEntries.value.map(entry => ({
    ...entry,
    isUnlocked: storyStore.unlockedDiaryEntries.includes(entry.id),
  }));
});

async function loadData() {
  if (!currentCharacter.value) {
    router.push('/select');
    return;
  }
  const data = await loadDiaryData(currentCharacter.value.id);
  allEntries.value = data;
}

function goBack() {
  router.back();
}

onMounted(loadData);
</script>

<style scoped>
.diary-view {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.diary-view__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
  border-bottom: 1px solid var(--color-border);
}

.diary-view__back {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  padding: var(--spacing-xs) 0;
}

.diary-view__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  flex: 1;
}

.diary-view__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.diary-view__character {
  padding: var(--spacing-xs) var(--spacing-base);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
}

.diary-view__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}
</style>