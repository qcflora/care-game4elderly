<template>
  <div class="attribute-bar" :class="[`attribute-bar--${type}`, { 'is-changed': isChanged, 'is-bouncing': isBouncing, 'bounce-up': bounceDirection === 'up', 'bounce-down': bounceDirection === 'down' }]">
    <div class="attribute-bar__label">
      <span class="attribute-bar__icon" :class="`icon--${type}`">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <template v-if="type === 'health'">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </template>
          <template v-else-if="type === 'mood'">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </template>
          <template v-else-if="type === 'independence'">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </template>
          <template v-else>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </template>
        </svg>
      </span>
      <span class="attribute-bar__name">{{ nameMap[type] }}</span>
    </div>
    <div class="attribute-bar__track">
      <div
        class="attribute-bar__fill"
        :class="{ 'is-low': percent <= 30 }"
        :style="{ width: percent + '%' }"
      />
      <div class="attribute-bar__shimmer" v-if="percent > 0" />
    </div>
    <span class="attribute-bar__value" :class="{ 'is-changed': isChanged }">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AttributeType } from '@/types/attribute';

const props = defineProps<{
  type: AttributeType;
  value: number;
  isChanged?: boolean;
}>();

const percent = computed(() => Math.max(0, Math.min(100, props.value)));

const isBouncing = ref(false);
const bounceDirection = ref<'up' | 'down'>('up');

watch(() => props.value, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal) {
    bounceDirection.value = newVal > oldVal ? 'up' : 'down';
    isBouncing.value = true;
    setTimeout(() => { isBouncing.value = false; }, 500);
  }
});

const nameMap: Record<string, string> = {
  health: '健康',
  mood: '心情',
  independence: '独立',
  trust: '信任',
};
</script>

<style scoped>
.attribute-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  contain: layout style paint;
}

.attribute-bar__label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 52px;
  flex-shrink: 0;
}

.attribute-bar__icon {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.attribute-bar__icon svg {
  width: 10px;
  height: 10px;
}

.icon--health { background: linear-gradient(135deg, #EF5350, #E57373); }
.icon--mood { background: linear-gradient(135deg, #FFB74D, #FFCC80); }
.icon--independence { background: linear-gradient(135deg, #4FC3F7, #81D4FA); }
.icon--trust { background: linear-gradient(135deg, #CE93D8, #E1BEE7); }

.attribute-bar__name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.attribute-bar__track {
  flex: 1;
  height: 5px;
  background: rgba(45, 31, 26, 0.06);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.attribute-bar__fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  will-change: width;
}

.attribute-bar__fill.is-low {
  animation: pulse 1.5s ease-in-out infinite;
}

.attribute-bar__shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2.5s ease-in-out infinite;
  pointer-events: none;
}

.attribute-bar--health .attribute-bar__fill { background: linear-gradient(90deg, #EF5350, #FF8A80); }
.attribute-bar--mood .attribute-bar__fill { background: linear-gradient(90deg, #FFB74D, #FFD54F); }
.attribute-bar--independence .attribute-bar__fill { background: linear-gradient(90deg, #4FC3F7, #81D4FA); }
.attribute-bar--trust .attribute-bar__fill { background: linear-gradient(90deg, #CE93D8, #E1BEE7); }

.attribute-bar__value {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  min-width: 24px;
  text-align: right;
  color: var(--color-text-primary);
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.attribute-bar__value.is-changed {
  animation: numberPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.attribute-bar.is-changed {
  animation: attributeFlash 1s ease;
}

.attribute-bar.is-bouncing {
  animation: attributeBounce 0.5s ease-out;
}

.attribute-bar--health.is-bouncing.bounce-up { --bounce-shadow: 0 0 12px rgba(239, 83, 80, 0.45); }
.attribute-bar--mood.is-bouncing.bounce-up { --bounce-shadow: 0 0 12px rgba(255, 183, 77, 0.45); }
.attribute-bar--independence.is-bouncing.bounce-up { --bounce-shadow: 0 0 12px rgba(79, 195, 247, 0.45); }
.attribute-bar--trust.is-bouncing.bounce-up { --bounce-shadow: 0 0 12px rgba(206, 147, 216, 0.45); }

.attribute-bar.is-bouncing.bounce-down { --bounce-shadow: 0 0 8px rgba(120, 120, 120, 0.25); }

@keyframes attributeBounce {
  0% { transform: scale(1); box-shadow: none; }
  30% { transform: scale(1.04); box-shadow: var(--bounce-shadow); }
  60% { transform: scale(0.98); box-shadow: var(--bounce-shadow); }
  100% { transform: scale(1); box-shadow: none; }
}
</style>
