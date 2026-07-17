<template>
  <div class="spirit-avatar" :class="`spirit-avatar--${emotion}`">
    <div class="spirit-avatar__body" :style="{ '--spirit-color': color }">
      <div class="spirit-orb"></div>
      <div class="spirit-glow"></div>
      <div class="spirit-thought-bubble" v-if="emotion === 'thinking'">
        <span class="spirit-thought-bubble__dot"></span>
        <span class="spirit-thought-bubble__dot"></span>
        <span class="spirit-thought-bubble__dot"></span>
      </div>
    </div>
    <div class="spirit-avatar__bubble" v-if="text">
      <p class="spirit-avatar__text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  emotion?: string;
  text?: string;
  color?: string;
}>(), {
  emotion: 'cheerful',
  text: '',
  color: '#F5C842',
});
</script>

<style scoped>
.spirit-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.spirit-avatar__body {
  width: 40px;
  height: 40px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spirit-orb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, var(--spirit-color-light, #FFE082), var(--spirit-color, #F5C842) 60%, var(--spirit-color-dark, #E6A800));
  box-shadow: 0 0 12px color-mix(in srgb, var(--spirit-color, #F5C842) 50%, transparent);
  animation: spiritFloat 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

.spirit-orb::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
}

.spirit-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--spirit-color, #F5C842) 25%, transparent) 0%, transparent 70%);
  animation: spiritGlowPulse 2s ease-in-out infinite;
}

.spirit-avatar--cheerful .spirit-orb {
  background: radial-gradient(circle at 35% 35%, var(--spirit-color-light, #FFF59D), var(--spirit-color, #FFD54F) 60%, var(--spirit-color-dark, #FFB300));
  box-shadow: 0 0 16px color-mix(in srgb, var(--spirit-color, #FFD54F) 60%, transparent);
}

.spirit-avatar--gentle .spirit-orb {
  background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--spirit-color, #F5C842) 70%, #FFFFFF), color-mix(in srgb, var(--spirit-color, #F5C842) 55%, #FFFFFF) 60%, var(--spirit-color-dark, #AB47BC));
  box-shadow: 0 0 14px color-mix(in srgb, var(--spirit-color, #CE93D8) 50%, transparent);
}

.spirit-avatar--curious .spirit-orb {
  background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--spirit-color, #F5C842) 70%, #87CEEB), color-mix(in srgb, var(--spirit-color, #F5C842) 50%, #87CEEB) 60%, var(--spirit-color-dark, #0288D1));
  box-shadow: 0 0 14px color-mix(in srgb, var(--spirit-color, #4FC3F7) 50%, transparent);
}

.spirit-avatar--worried .spirit-orb {
  background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--spirit-color, #F5C842) 70%, #FF8A65), color-mix(in srgb, var(--spirit-color, #F5C842) 50%, #FF8A65) 60%, var(--spirit-color-dark, #E64A19));
  box-shadow: 0 0 12px color-mix(in srgb, var(--spirit-color, #FF8A65) 40%, transparent);
}

.spirit-avatar--concerned .spirit-orb {
  background: radial-gradient(circle at 35% 35%, #B39DDB, #7E57C2 60%, #4527A0);
  box-shadow: 0 0 12px rgba(126, 87, 194, 0.4);
}

.spirit-avatar--thinking .spirit-orb {
  background: radial-gradient(circle at 35% 35%, #80DEEA, #26C6DA 60%, #00838F);
  box-shadow: 0 0 12px rgba(38, 198, 218, 0.4);
  animation: spiritFloat 2.2s ease-in-out infinite;
}

.spirit-avatar--celebrating .spirit-orb {
  background: radial-gradient(circle at 35% 35%, #FFF59D, #FFD54F 60%, #FF8F00);
  box-shadow: 0 0 20px rgba(255, 213, 79, 0.6);
  animation: spiritFloat 1.8s ease-in-out infinite;
}

.spirit-avatar--cheerful .spirit-glow {
  animation: spiritGlowPulse 1.8s ease-in-out infinite;
}

.spirit-avatar--gentle .spirit-glow {
  animation: spiritGlowSoft 3s ease-in-out infinite;
}

.spirit-avatar--concerned .spirit-glow {
  animation: spiritGlowSoft 3.5s ease-in-out infinite;
}

.spirit-avatar--thinking .spirit-glow {
  animation: spiritGlowSoft 2.5s ease-in-out infinite;
}

.spirit-avatar--celebrating .spirit-glow {
  animation: spiritFlash 0.6s ease-in-out infinite;
}

.spirit-thought-bubble {
  position: absolute;
  top: -4px;
  right: -8px;
  display: flex;
  gap: 2px;
  z-index: 2;
}

.spirit-thought-bubble__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--spirit-color, #26C6DA);
  opacity: 0.7;
  animation: thoughtDot 1.2s ease-in-out infinite;
}

.spirit-thought-bubble__dot:nth-child(2) { animation-delay: 0.2s; }
.spirit-thought-bubble__dot:nth-child(3) { animation-delay: 0.4s; }

.spirit-avatar__bubble {
  background: var(--color-spirit-power-light);
  border: 2px solid var(--color-spirit-power);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm) var(--spacing-base);
  max-width: 250px;
  position: relative;
  animation: fadeIn 0.3s ease;
}

.spirit-avatar__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}

@keyframes spiritFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes spiritGlowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spiritGlowSoft {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.15); }
}

@keyframes spiritFlash {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

@keyframes thoughtDot {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-3px); opacity: 1; }
}
</style>
