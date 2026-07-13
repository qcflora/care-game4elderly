<template>
  <Teleport to="body">
    <div class="toast" :class="`toast--${type}`" v-if="visible">
      <span class="toast__message">{{ message }}</span>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  visible: boolean;
}>();

const visible = ref(false);
watch(() => props.visible, (val) => {
  if (val) {
    visible.value = true;
    setTimeout(() => { visible.value = false; }, props.duration ?? 2000);
  }
}, { immediate: true });
</script>

<style scoped>
.toast {
  position: fixed;
  top: var(--spacing-xl);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  z-index: var(--z-toast);
  animation: slideDown 0.3s ease;
  box-shadow: var(--shadow-md);
}
.toast--info { background: var(--color-info); color: white; }
.toast--success { background: var(--color-success); color: white; }
.toast--warning { background: var(--color-mood); color: var(--color-text-primary); }
.toast--error { background: var(--color-warning); color: white; }
</style>
