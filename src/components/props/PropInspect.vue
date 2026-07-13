<template>
  <div class="prop-inspect">
    <div class="prop-inspect__image-container" @click="handleTap">
      <img :src="prop.image" :alt="prop.name" class="prop-inspect__image" />
    </div>
    <p class="prop-inspect__description">{{ prop.description }}</p>
    <div v-if="discoveredInfo.length > 0" class="prop-inspect__discoveries">
      <div v-for="info in discoveredInfo" :key="info.id" class="prop-inspect__info">
        <span class="prop-inspect__info-text">{{ info.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Prop, PropHiddenInfo } from '@/types/prop';

const props = defineProps<{
  prop: Prop;
  discoveredInfo: PropHiddenInfo[];
}>();

const emit = defineEmits<{
  discover: [propId: string, infoId: string];
}>();

function handleTap() {
  // 简化的点击处理，实际应检测点击坐标与热区
  if (props.prop.hiddenInfo) {
    for (const info of props.prop.hiddenInfo) {
      if (info.trigger === 'tap') {
        emit('discover', props.prop.id, info.id);
      }
    }
  }
}
</script>

<style scoped>
.prop-inspect {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-base);
}
.prop-inspect__image-container {
  position: relative;
  max-width: 100%;
}
.prop-inspect__image {
  width: 100%;
  max-width: 300px;
  border-radius: var(--radius-lg);
}
.prop-inspect__description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  text-align: center;
}
.prop-inspect__discoveries {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.prop-inspect__info {
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-spirit-power-light);
  border-radius: var(--radius-md);
  animation: fadeIn 0.5s ease;
}
.prop-inspect__info-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}
</style>
