<template>
  <span class="day-counter">Day {{ day }}/30</span>
</template>

<script setup lang="ts">
defineProps<{ day: number }>();
</script>

<style scoped>
.day-counter {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}
</style>
