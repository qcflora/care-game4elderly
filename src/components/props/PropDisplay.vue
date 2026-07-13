<template>
  <div class="prop-display" @click="$emit('interact', prop.id)">
    <img :src="prop.icon" :alt="prop.name" class="prop-display__icon" />
    <span class="prop-display__name">{{ prop.name }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Prop } from '@/types/prop';

defineProps<{
  prop: Prop;
}>();

defineEmits<{
  interact: [propId: string];
}>();
</script>

<style scoped>
.prop-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: transform var(--transition-fast);
}
.prop-display:active {
  transform: scale(0.95);
}
.prop-display__icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}
.prop-display__name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
}
</style>
