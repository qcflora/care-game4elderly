<template>
  <div class="choice-panel" v-if="choices && choices.length > 0">
    <button
      v-for="choice in choices"
      :key="choice.id"
      class="choice-btn"
      :class="{ 'choice-btn--disabled': choice.disabled }"
      :disabled="choice.disabled"
      @click="$emit('select', choice)"
    >
      <span class="choice-btn__text">{{ choice.text }}</span>
      <span v-if="choice.description" class="choice-btn__desc">{{ choice.description }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Choice } from '@/types/story';

defineProps<{
  choices: Choice[];
}>();

defineEmits<{
  select: [choice: Choice];
}>();
</script>

<style scoped>
.choice-panel {
  padding: var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: var(--choice-panel-height);
  overflow-y: auto;
}
.choice-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-base);
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: left;
  transition: all var(--transition-fast);
}
.choice-btn:active:not(.choice-btn--disabled) {
  transform: scale(0.98);
  border-color: var(--color-spirit-power);
  background: var(--color-spirit-power-light);
}
.choice-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.choice-btn__text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}
.choice-btn__desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>
