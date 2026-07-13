<template>
  <div class="feedback-toast" :class="`feedback-toast--${type}`" v-if="visible">
    <div class="feedback-toast__icon">{{ iconMap[type] }}</div>
    <div class="feedback-toast__content">
      <p class="feedback-toast__dialogue">{{ spiritDialogue }}</p>
      <p class="feedback-toast__explanation">{{ explanation }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  type: string;
  spiritDialogue: string;
  explanation: string;
  visible: boolean;
}>();

const visible = ref(false);
const iconMap: Record<string, string> = {
  correct: '\u2714',
  incorrect: '\u2718',
  neutral: '\u2139',
};

watch(() => props.visible, (val) => {
  if (val) {
    visible.value = true;
    setTimeout(() => { visible.value = false; }, 4000);
  }
}, { immediate: true });
</script>

<style scoped>
.feedback-toast {
  position: fixed;
  bottom: var(--spacing-xl);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-base);
  box-shadow: var(--shadow-lg);
  max-width: 90%;
  z-index: var(--z-toast);
  animation: slideUp 0.3s ease;
  display: flex;
  gap: var(--spacing-md);
}
.feedback-toast--correct { border-left: 4px solid var(--color-success); }
.feedback-toast--incorrect { border-left: 4px solid var(--color-warning); }
.feedback-toast--neutral { border-left: 4px solid var(--color-info); }
.feedback-toast__icon {
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}
.feedback-toast__dialogue {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-spirit-power-dark);
}
.feedback-toast__explanation {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}
</style>
