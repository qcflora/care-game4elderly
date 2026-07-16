<template>
  <Transition name="montage-fade">
    <div class="ending-montage" v-if="visible">
      <div class="montage-overlay" />
      <div class="montage-content">
        <div class="montage-text" v-for="(item, i) in texts" :key="i"
          :class="{ 'is-active': i === currentIndex, 'is-past': i < currentIndex }">
          <span class="montage-text__day">第{{ item.day }}天</span>
          <p class="montage-text__content">{{ item.text }}</p>
        </div>
        <div class="montage-spirit">
          <div class="montage-orb" />
        </div>
      </div>
      <button class="montage-skip" @click="dismiss">跳过回忆</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface MontageItem {
  day: number;
  text: string;
}

const visible = ref(false);
const currentIndex = ref(-1);
const texts = ref<MontageItem[]>([]);
let timer: ReturnType<typeof setInterval> | null = null;
let resolveFn: (() => void) | null = null;

function show(items: MontageItem[]): Promise<void> {
  texts.value = items.slice(0, 6); // 最多6条回忆
  currentIndex.value = -1;
  visible.value = true;

  return new Promise(resolve => {
    resolveFn = resolve;
    let idx = 0;
    timer = setInterval(() => {
      if (idx < texts.value.length) {
        currentIndex.value = idx;
        idx++;
      } else {
        clearInterval(timer!);
        timer = null;
        // 最后一条显示1.5秒后自动关闭
        setTimeout(() => {
          visible.value = false;
          if (resolveFn) { resolveFn(); resolveFn = null; }
        }, 1500);
      }
    }, 1200);
  });
}

function dismiss() {
  if (timer) { clearInterval(timer); timer = null; }
  visible.value = false;
  if (resolveFn) { resolveFn(); resolveFn = null; }
}

defineExpose({ show });
</script>

<style scoped>
.ending-montage {
  position: fixed;
  inset: 0;
  background: #1A1A2E;
  z-index: 190;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.montage-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 60%, rgba(242, 183, 5, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

.montage-content {
  position: relative;
  text-align: center;
  max-width: 300px;
  width: 100%;
  padding: 0 var(--spacing-xl);
}

.montage-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  opacity: 0;
  transition: all 0.8s ease;
  pointer-events: none;
}

.montage-text.is-active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.montage-text.is-past {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95) translateY(-30px);
}

.montage-text__day {
  display: inline-block;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: rgba(242, 183, 5, 0.7);
  letter-spacing: 2px;
  margin-bottom: var(--spacing-sm);
}

.montage-text__content {
  font-family: var(--font-family-title);
  font-size: var(--font-size-xl);
  color: rgba(255, 255, 255, 0.85);
  line-height: var(--line-height-relaxed);
}

.montage-spirit {
  margin-top: 120px;
}

.montage-orb {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE082, #F2B705);
  box-shadow: 0 0 20px rgba(242, 183, 5, 0.3);
  animation: orbBreath 2s ease-in-out infinite;
}

.montage-skip {
  position: absolute;
  bottom: var(--spacing-2xl);
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.35);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.montage-skip:active {
  color: rgba(255, 255, 255, 0.6);
  border-color: rgba(255, 255, 255, 0.2);
}

.montage-fade-enter-active { transition: opacity 0.8s ease; }
.montage-fade-leave-active { transition: opacity 0.5s ease; }
.montage-fade-enter-from, .montage-fade-leave-to { opacity: 0; }

@keyframes orbBreath {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}
</style>
