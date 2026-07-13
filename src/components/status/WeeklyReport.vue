<template>
  <div class="weekly-report">
    <h3 class="weekly-report__title">第{{ week }}周守护报告</h3>
    <div class="weekly-report__stats">
      <div class="weekly-report__stat" v-for="stat in stats" :key="stat.label">
        <span class="weekly-report__value" :style="{ color: stat.color }">{{ stat.value }}</span>
        <span class="weekly-report__label">{{ stat.label }}</span>
      </div>
    </div>
    <p class="weekly-report__summary">{{ summary }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  week: number;
  stats: Array<{ label: string; value: string; color: string }>;
  summary: string;
}>();
</script>

<style scoped>
.weekly-report {
  padding: var(--spacing-lg);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  text-align: center;
}
.weekly-report__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-base);
}
.weekly-report__stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--spacing-base);
}
.weekly-report__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}
.weekly-report__value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}
.weekly-report__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.weekly-report__summary {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}
</style>
