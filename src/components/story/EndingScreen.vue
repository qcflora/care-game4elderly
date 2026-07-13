<template>
  <div class="ending-screen">
    <div class="ending-screen__content">
      <h2 class="ending-screen__title">{{ title }}</h2>
      <div class="ending-screen__stars">
        <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= starCount }">\u2605</span>
      </div>
      <p class="ending-screen__message">{{ message }}</p>
      <div class="ending-screen__stats">
        <div v-for="stat in finalStats" :key="stat.label" class="ending-stat">
          <span class="ending-stat__value">{{ stat.value }}</span>
          <span class="ending-stat__label">{{ stat.label }}</span>
        </div>
      </div>
      <button class="ending-screen__btn" @click="$emit('restart')">重新开始</button>
      <button class="ending-screen__btn ending-screen__btn--secondary" @click="$emit('share')">分享给朋友</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  starCount: number;
  message: string;
  finalStats: Array<{ label: string; value: string }>;
}>();

defineEmits<{
  restart: [];
  share: [];
}>();
</script>

<style scoped>
.ending-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: var(--color-bg-primary);
  animation: fadeIn 1s ease;
}
.ending-screen__content {
  text-align: center;
  max-width: 360px;
}
.ending-screen__title {
  font-family: var(--font-family-title);
  font-size: var(--font-size-3xl);
  color: var(--color-spirit-power-dark);
  margin-bottom: var(--spacing-base);
}
.ending-screen__stars {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-lg);
}
.star { color: var(--color-text-tertiary); margin: 0 2px; }
.star.active { color: var(--color-spirit-power); }
.ending-screen__message {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-lg);
}
.ending-screen__stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--spacing-xl);
}
.ending-stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.ending-stat__value { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); }
.ending-stat__label { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
.ending-screen__btn {
  display: block;
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-spirit-power);
  color: var(--color-text-primary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
}
.ending-screen__btn--secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}
</style>
