<template>
  <div class="home-view watercolor-bg">
    <div class="home-view__content">
      <div class="home-view__logo">
        <div class="home-view__spirit-orb">
          <div class="home-view__spirit-core"></div>
          <div class="home-view__spirit-glow"></div>
        </div>
        <h1 class="home-view__title">家庭守护精灵</h1>
        <p class="home-view__subtitle">学会守护，用爱陪伴</p>
      </div>
      <div class="home-view__actions">
        <button class="home-view__btn home-view__btn--primary" @click="startNewGame">
          开始守护
        </button>
        <button class="home-view__btn home-view__btn--secondary" @click="continueGame" v-if="hasSave">
          继续守护
        </button>
      </div>
      <p class="home-view__footer">一款关于爱与陪伴的公益小游戏</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSaveStore } from '@/stores/saveStore';

const router = useRouter();
const saveStore = useSaveStore();
const hasSave = ref(false);

onMounted(() => {
  hasSave.value = saveStore.hasSave;
});

function startNewGame() {
  router.push('/select');
}

function continueGame() {
  router.push('/game');
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}
.home-view__content {
  text-align: center;
  position: relative;
  z-index: 1;
}
.home-view__logo {
  margin-bottom: var(--spacing-3xl);
}
.home-view__spirit-orb {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-base);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spiritFloat 3s ease-in-out infinite;
}

.home-view__spirit-core {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FFE082, #F5C842 60%, #E6A800);
  box-shadow: 0 0 20px rgba(245, 200, 66, 0.5);
  position: relative;
  z-index: 1;
}

.home-view__spirit-core::before {
  content: '';
  position: absolute;
  top: 6px;
  left: 8px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
}

.home-view__spirit-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245, 200, 66, 0.3) 0%, transparent 70%);
  animation: spiritGlowPulse 2s ease-in-out infinite;
}
.home-view__title {
  font-family: var(--font-family-title);
  font-size: var(--font-size-3xl);
  color: var(--color-spirit-power-dark);
  margin-bottom: var(--spacing-sm);
}
.home-view__subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
}
.home-view__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}
.home-view__btn {
  padding: var(--spacing-md) var(--spacing-2xl);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  transition: transform var(--transition-fast);
}
.home-view__btn:active { transform: scale(0.98); }
.home-view__btn--primary {
  background: var(--color-spirit-power);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-spirit);
}
.home-view__btn--secondary {
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  border: 2px solid var(--color-border);
}
.home-view__footer {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

@keyframes spiritGlowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.3); }
}
</style>
