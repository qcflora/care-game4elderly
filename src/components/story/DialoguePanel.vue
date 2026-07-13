<template>
  <div class="dialogue-panel" v-if="currentDialogue">
    <div class="dialogue-panel__speaker" :class="`speaker--${currentDialogue.speaker}`">
      <span class="dialogue-panel__speaker-name">{{ currentDialogue.speakerName }}</span>
    </div>
    <div class="dialogue-panel__content" @click="$emit('advance')">
      <p class="dialogue-panel__text">{{ displayText }}<span v-if="isTyping" class="cursor">|</span></p>
    </div>
    <div class="dialogue-panel__indicator" v-if="showContinueHint">点击继续</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import type { Dialogue } from '@/types/story';

const props = defineProps<{
  currentDialogue: Dialogue | null;
  isTyping?: boolean;
}>();

defineEmits<{
  advance: [];
}>();

const displayText = ref('');
const isTyping = ref(false);
let typingTimer: ReturnType<typeof setTimeout> | null = null;

const showContinueHint = computed(() => {
  return !isTyping.value && displayText.value.length > 0;
});

watch(() => props.currentDialogue, (dialogue) => {
  if (!dialogue) return;
  displayText.value = '';
  isTyping.value = true;

  const speed = dialogue.typingSpeed ?? 30;
  let index = 0;
  const text = dialogue.text;

  typingTimer = setInterval(() => {
    if (index < text.length) {
      displayText.value += text[index];
      index++;
    } else {
      isTyping.value = false;
      if (typingTimer) clearInterval(typingTimer);
    }
  }, 1000 / speed);
}, { immediate: true });

onUnmounted(() => {
  if (typingTimer) clearInterval(typingTimer);
});
</script>

<style scoped>
.dialogue-panel {
  padding: var(--spacing-base);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl) var(--radius-xl) var(--radius-xl) 0;
  min-height: var(--dialogue-area-height);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  position: relative;
}
.dialogue-panel__speaker {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.dialogue-panel__speaker-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}
.speaker--spirit .dialogue-panel__speaker-name { color: var(--color-spirit-power-dark); }
.speaker--elder .dialogue-panel__speaker-name { color: var(--color-text-primary); }
.speaker--narrator .dialogue-panel__speaker-name { color: var(--color-text-secondary); font-style: italic; }
.dialogue-panel__content {
  flex: 1;
  cursor: pointer;
}
.dialogue-panel__text {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
}
.cursor {
  animation: blink 1s step-end infinite;
  color: var(--color-text-secondary);
}
.dialogue-panel__indicator {
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  animation: fadeIn 1s ease-in-out infinite;
}
</style>
