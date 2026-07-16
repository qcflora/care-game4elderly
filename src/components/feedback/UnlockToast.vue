<template>
  <div class="unlock-toast">
    <TransitionGroup name="toast-slide">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="unlock-toast__item"
        :class="`unlock-toast__item--${toast.kind}`"
      >
        <div class="unlock-toast__icon">
          <svg v-if="toast.kind === 'diary'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <div class="unlock-toast__body">
          <span class="unlock-toast__label">{{ toast.kind === 'diary' ? '解锁新日记' : '解锁新相册' }}</span>
          <span class="unlock-toast__text">{{ toast.text }}</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface ToastItem {
  id: number;
  kind: 'diary' | 'album';
  text: string;
}

const toasts = ref<ToastItem[]>([]);
let nextId = 0;

function showUnlock(kind: 'diary' | 'album', text: string) {
  const id = nextId++;
  toasts.value.push({ id, kind, text });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 2500);
}

defineExpose({ showUnlock });
</script>

<style scoped>
.unlock-toast {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 250;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  pointer-events: none;
  width: calc(100% - 32px);
  max-width: 380px;
}

.unlock-toast__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-base);
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
  box-shadow: 0 4px 24px rgba(26, 26, 46, 0.12), 0 1px 3px rgba(26, 26, 46, 0.06);
  border: 1px solid var(--color-border);
}

.unlock-toast__icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.unlock-toast__icon svg {
  width: 18px;
  height: 18px;
}

.unlock-toast__item--diary .unlock-toast__icon {
  background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
  color: #1565C0;
}

.unlock-toast__item--album .unlock-toast__icon {
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
  color: #E65100;
}

.unlock-toast__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.unlock-toast__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}

.unlock-toast__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
