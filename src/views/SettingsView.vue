<template>
  <div class="settings-view">
    <header class="settings-view__header">
      <button class="settings-view__back" @click="goBack">\u2190 返回</button>
      <h2 class="settings-view__title">设置</h2>
    </header>
    <div class="settings-view__content">
      <div class="settings-group">
        <h3 class="settings-group__title">游戏设置</h3>
        <div class="settings-item">
          <span class="settings-item__label">打字速度</span>
          <select v-model="typingSpeed" class="settings-item__select">
            <option value="slow">慢</option>
            <option value="normal">正常</option>
            <option value="fast">快</option>
            <option value="instant">瞬间</option>
          </select>
        </div>
        <div class="settings-item">
          <span class="settings-item__label">自动播放对话</span>
          <label class="settings-item__toggle">
            <input type="checkbox" v-model="autoPlay" />
            <span class="toggle-switch"></span>
          </label>
        </div>
      </div>
      <div class="settings-group">
        <h3 class="settings-group__title">存档管理</h3>
        <div class="settings-item">
          <span class="settings-item__label">清除存档</span>
          <button class="settings-item__btn settings-item__btn--danger" @click="clearSave">清除</button>
        </div>
      </div>
      <div class="settings-group">
        <h3 class="settings-group__title">关于</h3>
        <p class="settings-about">
          家庭守护精灵 v0.1.0<br>
          一款关于爱与陪伴的公益小游戏
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useSaveStore } from '@/stores/saveStore';

const router = useRouter();
const gameStore = useGameStore();
const saveStore = useSaveStore();

const typingSpeed = ref(gameStore.settings.typingSpeed);
const autoPlay = ref(gameStore.settings.autoPlay);

function clearSave() {
  if (confirm('确定要清除存档吗？此操作不可恢复。')) {
    saveStore.clearSave();
    gameStore.resetGame();
    router.push('/');
  }
}

function goBack() {
  router.back();
}
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  background: var(--color-bg-primary);
}
.settings-view__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
  border-bottom: 1px solid var(--color-border);
}
.settings-view__back {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}
.settings-view__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}
.settings-view__content {
  padding: var(--spacing-base);
}
.settings-group {
  margin-bottom: var(--spacing-xl);
}
.settings-group__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  margin-bottom: var(--spacing-md);
}
.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-divider);
}
.settings-item__label {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}
.settings-item__select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-bg-card);
}
.settings-item__btn {
  padding: var(--spacing-xs) var(--spacing-base);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
.settings-item__btn--danger {
  background: var(--color-warning-light);
  color: var(--color-warning);
}
.settings-about {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}
</style>
