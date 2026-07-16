<template>
  <div class="home-view watercolor-bg">
    <div class="home-view__content">
      <!-- 精灵核心视觉 -->
      <div class="home-view__hero">
        <div class="home-view__spirit-orb">
          <div class="home-view__spirit-core"></div>
          <div class="home-view__spirit-glow"></div>
          <div class="home-view__spirit-ring"></div>
        </div>
        <h1 class="home-view__title">家庭守护精灵</h1>
        <p class="home-view__subtitle">学会守护，用爱陪伴</p>
      </div>

      <!-- 行动按钮 -->
      <div class="home-view__actions">
        <button class="home-view__btn home-view__btn--primary" @click="startNewGame">
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </span>
          <span>开始守护</span>
        </button>
        <button class="home-view__btn home-view__btn--secondary" @click="continueGame" v-if="hasSave">
          <span>继续守护</span>
        </button>
      </div>

      <!-- 底部信息 -->
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
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.home-view__content {
  text-align: center;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 340px;
}

/* === 精灵核心视觉 === */
.home-view__hero {
  margin-bottom: var(--spacing-3xl);
}

.home-view__spirit-orb {
  width: 120px;
  height: 120px;
  margin: 0 auto var(--spacing-xl);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-view__spirit-core {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE082 0%, #F2B705 50%, #D49A00 100%);
  box-shadow: 0 8px 32px rgba(242, 183, 5, 0.35), 0 0 60px rgba(242, 183, 5, 0.15);
  position: relative;
  z-index: 2;
  animation: spiritFloat 4s ease-in-out infinite;
}

.home-view__spirit-core::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 14px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}

.home-view__spirit-glow {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(242, 183, 5, 0.25) 0%, transparent 70%);
  animation: glowPulse 3s ease-in-out infinite;
  z-index: 1;
}

.home-view__spirit-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(242, 183, 5, 0.15);
  animation: ringExpand 3s ease-out infinite;
  z-index: 0;
}

.home-view__title {
  font-family: var(--font-family-title);
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
  letter-spacing: 2px;
}

.home-view__subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

/* === 行动按钮 === */
.home-view__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.home-view__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-full);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-fast);
  width: 100%;
}

.home-view__btn:active { transform: scale(0.97); }

.home-view__btn--primary {
  background: linear-gradient(135deg, #F2B705 0%, #E8A500 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 20px rgba(242, 183, 5, 0.3), 0 2px 8px rgba(242, 183, 5, 0.2);
}

.home-view__btn--primary:active {
  box-shadow: 0 2px 12px rgba(242, 183, 5, 0.25);
}

.btn-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon svg {
  width: 100%;
  height: 100%;
}

.home-view__btn--secondary {
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  border: 1.5px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.home-view__footer {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  letter-spacing: 0.5px;
}

/* === Keyframes === */
@keyframes spiritFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-8px) rotate(1deg); }
  66% { transform: translateY(-4px) rotate(-1deg); }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
}

@keyframes ringExpand {
  0% { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(1.4); opacity: 0; }
}
</style>
