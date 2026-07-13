<template>
  <div class="game-container" ref="containerRef">
    <StatusBar v-if="showStatusBar" />
    <div class="game-container__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import StatusBar from './StatusBar.vue';

defineProps<{
  showStatusBar?: boolean;
}>();

const containerRef = ref<HTMLElement | null>(null);
</script>

<style scoped>
.game-container {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
}
.game-container__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
