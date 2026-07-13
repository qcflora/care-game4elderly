<template>
  <div class="attribute-bar" :class="[`attribute-bar--${type}`, { 'is-changed': isChanged }]">
    <div class="attribute-bar__label">
      <span class="attribute-bar__icon" :class="`icon--${type}`"></span>
      <span class="attribute-bar__name">{{ nameMap[type] }}</span>
    </div>
    <div class="attribute-bar__track">
      <div class="attribute-bar__fill" :style="{ width: percent + '%' }"></div>
    </div>
    <span class="attribute-bar__value">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AttributeType } from '@/types/attribute';

const props = defineProps<{
  type: AttributeType;
  value: number;
  isChanged?: boolean;
}>();

const percent = computed(() => Math.max(0, Math.min(100, props.value)));

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
}

.attribute-bar__label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 56px;
}

.attribute-bar__icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.icon--health {
  background: #E57373;
  box-shadow: 0 0 4px rgba(229, 115, 115, 0.4);
}

.icon--mood {
  background: #FFB74D;
  box-shadow: 0 0 4px rgba(255, 183, 77, 0.4);
}

.icon--independence {
  background: #4FC3F7;
  box-shadow: 0 0 4px rgba(79, 195, 247, 0.4);
}

.icon--trust {
  background: #81C784;
  box-shadow: 0 0 4px rgba(129, 199, 132, 0.4);
}

.attribute-bar__name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.attribute-bar__track {
  flex: 1;
  height: 6px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.attribute-bar__fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.attribute-bar--health .attribute-bar__fill { background: var(--color-health); }
.attribute-bar--mood .attribute-bar__fill { background: var(--color-mood); }
.attribute-bar--independence .attribute-bar__fill { background: var(--color-independence); }
.attribute-bar--trust .attribute-bar__fill { background: var(--color-trust); }

.attribute-bar__value {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  min-width: 24px;
  text-align: right;
}

.attribute-bar.is-changed {
  animation: attributeFlash 1.5s ease;
}
</style>
