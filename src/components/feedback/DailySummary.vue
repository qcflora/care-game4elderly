<template>
  <Transition name="summary-pop">
    <div class="daily-summary" v-if="visible" @click="dismiss">
      <div class="daily-summary__card">
        <div class="daily-summary__header">
          <div class="daily-summary__orb" />
          <h3 class="daily-summary__title">第 {{ day }} 天结束</h3>
          <p class="daily-summary__subtitle">今日守护记录</p>
        </div>
        <div class="daily-summary__changes">
          <div
            v-for="change in changes"
            :key="change.type"
            class="summary-change"
            :class="{ 'is-negative': change.delta < 0, 'is-positive': change.delta > 0, 'is-zero': change.delta === 0 }"
          >
            <span class="summary-change__label">{{ labelMap[change.type] }}</span>
            <span class="summary-change__value">{{ change.delta > 0 ? '+' : '' }}{{ change.delta }}</span>
          </div>
        </div>
        <div class="daily-summary__spirit" v-if="spiritDelta !== 0">
          <span class="summary-change__label">精灵魔力</span>
          <span class="summary-change__value is-positive">{{ spiritDelta > 0 ? '+' : '' }}{{ spiritDelta }}</span>
        </div>
        <button class="daily-summary__btn" @click.stop="dismiss">继续守护</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { AttributeEffect } from '@/types/attribute';

const labelMap: Record<string, string> = {
  health: '健康值',
  mood: '心情值',
  independence: '独立值',
  trust: '信任值',
};

const visible = ref(false);
const day = ref(1);
const changes = ref<AttributeEffect[]>([]);
const spiritDelta = ref(0);

let resolveFn: (() => void) | null = null;

function show(dayNum: number, effectList: AttributeEffect[], spDelta: number = 0): Promise<void> {
  day.value = dayNum;
  changes.value = effectList.filter(e => e.delta !== 0);
  spiritDelta.value = spDelta;
  visible.value = true;
  return new Promise(resolve => { resolveFn = resolve; });
}

function dismiss() {
  visible.value = false;
  if (resolveFn) {
    resolveFn();
    resolveFn = null;
  }
}

defineExpose({ show });
</script>

<style scoped>
.daily-summary {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 150;
  padding: var(--spacing-base);
}

.daily-summary__card {
  background: var(--color-bg-card);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-xl);
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-xl);
  animation: summaryPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.daily-summary__header {
  margin-bottom: var(--spacing-lg);
}

.daily-summary__orb {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE082, #F2B705);
  box-shadow: 0 4px 16px rgba(242, 183, 5, 0.3);
  margin: 0 auto var(--spacing-sm);
}

.daily-summary__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.daily-summary__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.daily-summary__changes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.summary-change {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-base);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
}

.summary-change.is-positive { background: #E8F5E9; }
.summary-change.is-negative { background: #FFF0F0; }

.summary-change__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.summary-change__value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.summary-change__value.is-positive { color: #2E7D32; }
.summary-change__value.is-negative { color: #C62828; }

.daily-summary__spirit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-base);
  border-radius: var(--radius-md);
  background: #FFF8E7;
  margin-bottom: var(--spacing-lg);
}

.daily-summary__btn {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #F2B705, #E8A500);
  color: #fff;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  box-shadow: 0 4px 16px rgba(242, 183, 5, 0.25);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.daily-summary__btn:active { transform: scale(0.97); }

.summary-pop-enter-active { transition: opacity 0.3s ease; }
.summary-pop-leave-active { transition: opacity 0.2s ease; }
.summary-pop-enter-from, .summary-pop-leave-to { opacity: 0; }

@keyframes summaryPop {
  from { transform: scale(0.9) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
</style>
