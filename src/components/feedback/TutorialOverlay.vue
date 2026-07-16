<template>
  <Transition name="tutorial-fade">
    <div class="tutorial" v-if="visible">
      <div class="tutorial__card">
        <div class="tutorial__steps">
          <div
            v-for="(step, i) in steps"
            :key="i"
            class="tutorial__step"
            :class="{ 'is-active': i === currentStep, 'is-past': i < currentStep }"
          >
            <div class="tutorial__step-num">{{ i + 1 }}</div>
            <div class="tutorial__step-icon">
              <component :is="step.icon" />
            </div>
            <div class="tutorial__step-content">
              <h4 class="tutorial__step-title">{{ step.title }}</h4>
              <p class="tutorial__step-desc">{{ step.desc }}</p>
            </div>
          </div>
        </div>
        <button class="tutorial__btn" @click="next">
          {{ currentStep < steps.length - 1 ? '下一步' : '开始守护' }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';

const visible = ref(false);
const currentStep = ref(0);

const steps = [
  {
    title: '你是守护精灵',
    desc: '你将化身为一束温暖的光，陪伴一位老人度过30天。你的每个选择都会影响他们的生活。',
    icon: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', innerHTML: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>' }),
  },
  {
    title: '关注四个属性',
    desc: '健康、心情、独立、信任 —— 它们会随你的选择而变化。保持平衡很重要。',
    icon: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', innerHTML: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' }),
  },
  {
    title: '做出选择',
    desc: '面对各种照护场景，选择你认为最合适的方式。没有绝对正确的答案，但每种选择都有不同的后果。',
    icon: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', innerHTML: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>' }),
  },
];

function show(): Promise<void> {
  currentStep.value = 0;
  visible.value = true;
  return new Promise(resolve => { resolveFn = resolve; });
}

let resolveFn: (() => void) | null = null;

function next() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  } else {
    visible.value = false;
    if (resolveFn) { resolveFn(); resolveFn = null; }
  }
}

defineExpose({ show });
</script>

<style scoped>
.tutorial {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--spacing-xl);
}

.tutorial__card {
  background: var(--color-bg-card);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-xl);
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.tutorial__steps {
  margin-bottom: var(--spacing-xl);
}

.tutorial__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  text-align: center;
  transition: all 0.4s ease;
  opacity: 0;
  transform: translateY(10px);
  position: absolute;
  pointer-events: none;
}

.tutorial__step.is-active {
  opacity: 1;
  transform: translateY(0);
  position: relative;
  pointer-events: auto;
}

.tutorial__step-num {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-spirit-power);
  letter-spacing: 1px;
}

.tutorial__step-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-spirit-power-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--spacing-xs) 0;
}

.tutorial__step-icon svg {
  width: 24px;
  height: 24px;
  color: var(--color-spirit-power-dark);
}

.tutorial__step-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.tutorial__step-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  max-width: 280px;
}

.tutorial__btn {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #F2B705, #E8A500);
  color: #fff;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  box-shadow: 0 4px 16px rgba(242, 183, 5, 0.25);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.tutorial__btn:active { transform: scale(0.97); }

.tutorial-fade-enter-active { transition: opacity 0.4s ease; }
.tutorial-fade-leave-active { transition: opacity 0.3s ease; }
.tutorial-fade-enter-from, .tutorial-fade-leave-to { opacity: 0; }
</style>
