<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="visible" @click.self="$emit('close')">
      <div class="modal-content" :class="`modal--${variant}`">
        <div class="modal-header" v-if="title">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" @click="$emit('close')">\u2715</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  title?: string;
  variant?: string;
}>();

defineEmits<{
  close: [];
}>();
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-bg-overlay);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  animation: fadeIn 0.2s ease;
}
.modal-content {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  animation: scaleIn 0.3s ease;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-base) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}
.modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}
.modal-close {
  font-size: var(--font-size-lg);
  color: var(--color-text-tertiary);
}
.modal-body {
  padding: var(--spacing-lg);
}
</style>
