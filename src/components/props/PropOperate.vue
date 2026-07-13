<template>
  <div class="prop-operate" ref="containerRef">
    <div
      class="prop-operate__item"
      :class="{ 'is-dragging': isDragging }"
      :style="dragStyle"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <img :src="prop.image" :alt="prop.name" class="prop-operate__image" />
    </div>
    <slot name="targets" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Prop } from '@/types/prop';

defineProps<{
  prop: Prop;
}>();

const emit = defineEmits<{
  drop: [targetPropId: string];
}>();

const containerRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

const dragStyle = computed(() => ({
  transform: isDragging.value
    ? `translate(${dragOffset.value.x}px, ${dragOffset.value.y}px)`
    : 'none',
  transition: isDragging.value ? 'none' : 'transform 0.2s ease',
}));

function onTouchStart(e: TouchEvent) {
  isDragging.value = true;
  const touch = e.touches[0];
  dragOffset.value = { x: 0, y: 0 };
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return;
  const touch = e.touches[0];
  dragOffset.value = { x: touch.clientX * 0.3, y: touch.clientY * 0.3 };
}

function onTouchEnd() {
  isDragging.value = false;
  dragOffset.value = { x: 0, y: 0 };
}
</script>

<style scoped>
.prop-operate {
  position: relative;
  padding: var(--spacing-lg);
  display: flex;
  justify-content: center;
}
.prop-operate__item {
  cursor: grab;
  touch-action: none;
  z-index: var(--z-dialogue);
}
.prop-operate__image {
  width: 120px;
  height: 120px;
  object-fit: contain;
}
.prop-operate__item.is-dragging {
  opacity: 0.8;
  transform-origin: center;
}
</style>
