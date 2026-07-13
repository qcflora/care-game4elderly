<template>
  <header class="status-bar" :class="{ 'is-critical': hasCritical }">
    <div class="status-bar__left">
      <ElderAvatar v-if="characterName" :name="characterName" />
      <div class="status-bar__info">
        <span class="status-bar__name">{{ characterName || '家庭守护精灵' }}</span>
        <DayCounter :day="day" />
      </div>
    </div>
    <div class="status-bar__right">
      <button class="status-bar__nav-btn" @click="goAlbum" title="时光相册">相册</button>
      <button class="status-bar__nav-btn" @click="goDiary" title="守护日记">日记</button>
      <SpiritPowerBar :percent="spiritPowerPercent" :level="spiritPowerLevel" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useAttributeStore } from '@/stores/attributeStore';
import ElderAvatar from '@/components/status/ElderAvatar.vue';
import DayCounter from '@/components/status/DayCounter.vue';
import SpiritPowerBar from '@/components/status/SpiritPowerBar.vue';

const router = useRouter();
const gameStore = useGameStore();
const attributeStore = useAttributeStore();

const characterName = computed(() => gameStore.currentCharacter?.nickname ?? '');
const day = computed(() => gameStore.currentDay);
const spiritPowerPercent = computed(() => attributeStore.spiritPowerPercent);
const spiritPowerLevel = computed(() => attributeStore.spiritPowerLevel);
const hasCritical = computed(() => attributeStore.criticalAttributes.length > 0);

function goAlbum() {
  router.push('/album');
}

function goDiary() {
  router.push('/diary');
}
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-status-bar);
  height: var(--status-bar-height);
  transition: background-color var(--transition-fast);
}
.status-bar.is-critical {
  background: var(--color-warning-light);
}
.status-bar__left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.status-bar__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.status-bar__name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}
.status-bar__right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.status-bar__nav-btn {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 2px var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.status-bar__nav-btn:active {
  background: var(--color-spirit-power-light);
  border-color: var(--color-spirit-power);
}
</style>