<template>
  <div class="spirit-power" :class="`spirit-power--${level}`">
    <span class="spirit-power__icon"></span>
    <div class="spirit-power__track">
      <div class="spirit-power__fill" :style="{ width: percent + '%' }"></div>
    </div>
    <span class="spirit-power__value">{{ percent }}%</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  percent: number;
  level: string;
}>();
</script>

<style scoped>
.spirit-power {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
.spirit-power__icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FFE082, #F5C842 60%, #E6A800);
  box-shadow: 0 0 6px rgba(245, 200, 66, 0.5);
  display: inline-block;
  flex-shrink: 0;
}
.spirit-power__track {
  width: 60px;
  height: 8px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.spirit-power__fill {
  height: 100%;
  background: var(--color-spirit-power);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}
.spirit-power--full .spirit-power__fill {
  animation: spiritGlow 2s ease-in-out infinite;
}
.spirit-power--weak .spirit-power__fill {
  opacity: 0.5;
}
.spirit-power__value {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-spirit-power-dark);
}
</style>
