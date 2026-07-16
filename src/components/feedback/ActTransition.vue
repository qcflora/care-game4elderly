<template>
  <Transition name="act-fade">
    <div class="act-transition" v-if="visible" @click="dismiss">
      <div class="act-transition__card">
        <div class="act-transition__glow" />
        <div class="act-transition__orb">
          <div class="act-transition__orb-inner"></div>
        </div>
        <div class="act-transition__content">
          <span class="act-transition__chapter">第 {{ act }} 幕</span>
          <h2 class="act-transition__title">{{ title }}</h2>
          <p class="act-transition__desc">{{ description }}</p>
        </div>
        <div class="act-transition__divider" />
        <div class="act-transition__progress">
          <div class="act-transition__dot" :class="{ 'is-done': i < act }" v-for="i in 3" :key="i"></div>
        </div>
        <button class="act-transition__btn" @click.stop="dismiss">
          <span>继续</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const act = ref(1);
const title = ref('');
const description = ref('');

let resolveFn: (() => void) | null = null;

const actInfo: Record<number, { title: string; desc: string }> = {
  1: { title: '初识', desc: '第一次走近，了解爷爷的生活' },
  2: { title: '深入', desc: '深入日常生活，面对更多挑战' },
  3: { title: '守护', desc: '最终考验，用爱守护每一天' },
};

function show(actNum: number): Promise<void> {
  act.value = actNum;
  const info = actInfo[actNum] || { title: `第${actNum}幕`, desc: '' };
  title.value = info.title;
  description.value = info.desc;
  visible.value = true;
  return new Promise(resolve => { resolveFn = resolve; });
}

function dismiss() {
  visible.value = false;
  if (resolveFn) {
    resolveFn();
    resolveFn = null;
  }
}

defineExpose({ show });
</script>

<style scoped>
.act-transition {
  position: fixed;
  inset: 0;
  background: linear-gradient(160deg, #1A1A2E 0%, #2D2B55 50%, #1A1A2E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 180;
  padding: var(--spacing-xl);
}

.act-transition__card {
  text-align: center;
  position: relative;
  max-width: 320px;
  width: 100%;
  animation: actCardPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.act-transition__glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(242, 183, 5, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.act-transition__orb {
  margin: 0 auto var(--spacing-xl);
  position: relative;
}

.act-transition__orb-inner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE082 0%, #F2B705 50%, #D49A00 100%);
  box-shadow: 0 0 30px rgba(242, 183, 5, 0.4), 0 0 60px rgba(242, 183, 5, 0.15);
  animation: orbPulse 2s ease-in-out infinite;
  position: relative;
}

.act-transition__orb-inner::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 14px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}

.act-transition__content {
  margin-bottom: var(--spacing-lg);
}

.act-transition__chapter {
  display: inline-block;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: rgba(242, 183, 5, 0.8);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: var(--spacing-sm);
}

.act-transition__title {
  font-family: var(--font-family-title);
  font-size: var(--font-size-3xl);
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: var(--spacing-sm);
  letter-spacing: 4px;
}

.act-transition__desc {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.5);
  line-height: var(--line-height-normal);
}

.act-transition__divider {
  width: 40px;
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 auto var(--spacing-lg);
}

.act-transition__progress {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.act-transition__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  transition: all 0.4s ease;
}

.act-transition__dot.is-done {
  background: var(--color-spirit-power);
  box-shadow: 0 0 8px rgba(242, 183, 5, 0.4);
}

.act-transition__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-2xl);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;
  cursor: pointer;
}

.act-transition__btn:active {
  background: rgba(242, 183, 5, 0.2);
  border-color: rgba(242, 183, 5, 0.3);
}

.act-transition__btn svg {
  width: 18px;
  height: 18px;
}

.act-fade-enter-active { transition: opacity 0.6s ease; }
.act-fade-leave-active { transition: opacity 0.3s ease; }
.act-fade-enter-from, .act-fade-leave-to { opacity: 0; }

@keyframes actCardPop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes orbPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(242, 183, 5, 0.4), 0 0 60px rgba(242, 183, 5, 0.15); }
  50% { transform: scale(1.08); box-shadow: 0 0 40px rgba(242, 183, 5, 0.5), 0 0 80px rgba(242, 183, 5, 0.2); }
}
</style>
