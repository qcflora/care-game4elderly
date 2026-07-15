<template>
  <div class="scene-illustration" :style="bgStyle">
    <div class="scene-illustration__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  illustrationId?: string;
  scene?: string;
}>();

const bgStyle = computed(() => ({
  background: props.scene
    ? `url('${import.meta.env.BASE_URL}images/scenes/${props.scene}.webp') center/cover no-repeat`
    : 'var(--color-bg-secondary)',
}));
</script>

<style scoped>
.scene-illustration {
  flex: 1;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: var(--color-bg-secondary);
  animation: watercolorReveal 0.8s ease;
}
.scene-illustration__content {
  position: relative;
  z-index: 1;
}
</style>
