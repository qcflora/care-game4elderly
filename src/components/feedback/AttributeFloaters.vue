<template>
  <div class="attr-floaters">
    <TransitionGroup name="float-up">
      <div
        v-for="item in floaters"
        :key="item.id"
        class="attr-floater"
        :class="[`attr-floater--${item.type}`, { 'is-negative': item.delta < 0 }]"
        :style="{ '--start-x': item.x + 'px' }"
      >
        <span class="attr-floater__icon">{{ item.delta > 0 ? '↑+' : '↓' }}{{ item.delta }}</span>
        <span class="attr-floater__label">{{ labelMap[item.type] }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { AttributeEffect } from '@/types/attribute';

const labelMap: Record<string, string> = {
  health: '健康',
  mood: '心情',
  independence: '独立',
  trust: '信任',
};

interface FloaterItem extends AttributeEffect {
  id: number;
  x: number;
}

const floaters = ref<FloaterItem[]>([]);
let nextId = 0;

function showFloaters(effects: AttributeEffect[], originX: number = 0) {
  for (const effect of effects) {
    if (effect.delta === 0) continue;
    const id = nextId++;
    const x = originX + (Math.random() - 0.5) * 60;
    floaters.value.push({ ...effect, id, x });

    setTimeout(() => {
      floaters.value = floaters.value.filter(f => f.id !== id);
    }, 1800);
  }
}

defineExpose({ showFloaters });
</script>

<style scoped>
.attr-floaters {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 200;
}

.attr-floater {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateX(var(--start-x, 0px));
}

.attr-floater.is-negative {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF4444 100%);
  color: #fff;
  text-shadow: 0 1px 4px rgba(255, 0, 0, 0.3);
}

.attr-floater:not(.is-negative) {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(102, 187, 106, 0.4);
}

.attr-floater--health:not(.is-negative) { background: linear-gradient(135deg, #66BB6A 0%, #81C784 100%); text-shadow: 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(102, 187, 106, 0.4); }
.attr-floater--mood:not(.is-negative) { background: linear-gradient(135deg, #FFB347 0%, #FFA726 100%); color: #3E2723; text-shadow: 0 0 8px rgba(255, 200, 100, 0.5); }
.attr-floater--independence:not(.is-negative) { background: linear-gradient(135deg, #4ECDC4 0%, #26A69A 100%); text-shadow: 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(78, 205, 196, 0.4); }
.attr-floater--trust:not(.is-negative) { background: linear-gradient(135deg, #CE7CFF 0%, #AB47BC 100%); text-shadow: 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(199, 125, 255, 0.4); }

.attr-floater__icon {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.attr-floater__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* 飘字动画 */
.float-up-enter-active {
  transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.float-up-leave-active {
  transition: all 0.6s ease;
}

.float-up-enter-from {
  opacity: 0;
  transform: translateX(var(--start-x, 0px)) translateY(0) scale(1.2);
}

.float-up-enter-to,
.float-up-leave-from {
  opacity: 1;
  transform: translateX(var(--start-x, 0px)) translateY(-60px) scale(1);
}

.float-up-leave-to {
  opacity: 0;
  transform: translateX(var(--start-x, 0px)) translateY(-100px) scale(0.9);
}
</style>
