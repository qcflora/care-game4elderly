<template>
  <GameContainer :show-status-bar="true">
    <ParticleField variant="game" />
    <!-- 属性栏区域 -->
    <div class="game-view__attributes">
      <AttributeBar type="health" :value="attributeStore.attributes.health" />
      <AttributeBar type="mood" :value="attributeStore.attributes.mood" />
      <AttributeBar type="independence" :value="attributeStore.attributes.independence" />
      <AttributeBar type="trust" :value="attributeStore.attributes.trust" />
    </div>

    <!-- 场景插画区 -->
    <div class="game-view__scene" :class="`game-view__scene--${sceneClass}`">
      <Transition name="scene-fade" mode="out-in">
        <img
          v-if="sceneImagePath && !sceneImgError"
          :key="sceneImagePath"
          :src="sceneImagePath"
          :alt="currentSceneName"
          class="game-view__scene-img"
          :class="{ 'is-animating': !sceneImgError }"
          loading="eager"
          decoding="async"
          @error="handleSceneImgError"
        />
      </Transition>
      <div v-if="sceneImgError" class="game-view__scene-fallback">
        <span class="scene-fallback__label">{{ currentSceneName }}</span>
        <span class="scene-fallback__hint">场景插画加载中</span>
      </div>
      <div class="game-view__scene-overlay" v-if="currentSceneName">
        <span class="game-view__scene-label">{{ currentSceneName }}</span>
      </div>
      <Transition name="spirit-pop">
        <div class="game-view__spirit" v-if="isSpiritSpeaking">
          <SpiritAvatar :emotion="spiritEmotion" :color="spiritColor" />
        </div>
      </Transition>
    </div>

    <!-- 对话区 -->
    <Transition name="dialogue-slide">
      <div
        class="game-view__dialogue"
        v-if="controller.currentDialogue.value"
        @click="handleAdvance"
      >
        <div
          class="dialogue-box"
          :class="`dialogue-box--${controller.currentDialogue.value.speaker}`"
        >
          <div class="dialogue-box__speaker">
            <span class="dialogue-box__speaker-dot" />
            {{ speakerName }}
          </div>
          <p class="dialogue-box__text" ref="textRef">{{ displayedText }}<span v-if="isTyping" class="cursor-blink" /></p>
          <div class="dialogue-box__hint" :class="{ 'is-visible': !isTyping }">
            <span class="hint-pulse">点击继续</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 选项区 -->
    <TransitionGroup
      name="choice-stagger"
      tag="div"
      class="game-view__choices"
      v-if="controller.currentChoices.value.length > 0"
    >
      <button
        v-for="(choice, i) in controller.currentChoices.value"
        :key="choice.id"
        class="choice-btn"
        :style="{ '--stagger-delay': `${i * 60}ms` }"
        @click="handleSelect(choice)"
      >
        <span class="choice-btn__text">{{ choice.text }}</span>
        <span class="choice-btn__desc" v-if="choice.description">{{ choice.description }}</span>
      </button>
    </TransitionGroup>

    <!-- 反馈弹窗 -->
    <Transition name="feedback-scale">
      <div class="game-view__feedback" v-if="controller.isShowingFeedback.value" @click.self="handleDismissFeedback">
        <div class="feedback-card">
          <div class="feedback-card__icon" :class="`feedback-card__icon--${controller.currentFeedback.value?.type}`">
            {{ feedbackIcon }}
          </div>
          <div class="feedback-card__spirit">
            <SpiritAvatar :emotion="spiritEmotion" :color="spiritColor" />
          </div>
          <p class="feedback-card__dialogue">{{ controller.currentFeedback.value?.spiritDialogue }}</p>
          <p class="feedback-card__explanation" v-if="controller.currentFeedback.value?.explanation">
            {{ controller.currentFeedback.value?.explanation }}
          </p>
          <button class="feedback-card__btn" @click="handleDismissFeedback">
            <span>继续</span>
            <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 结局画面 -->
    <Transition name="ending-reveal">
      <div class="game-view__ending" v-if="controller.isGameEnded.value && controller.endingInfo.value">
        <div class="ending-card">
          <div class="ending-card__glow" />
          <div class="ending-card__icon">
            <div class="ending-icon__orb"></div>
          </div>
          <h2 class="ending-card__title">{{ controller.endingInfo.value.title }}</h2>
          <p class="ending-card__desc">{{ controller.endingInfo.value.description }}</p>
          <div class="ending-card__score" v-if="controller.endingInfo.value?.score">
            <span class="ending-score__label">综合守护得分</span>
            <span class="ending-score__value">{{ controller.endingInfo.value.score }}</span>
          </div>
          <div class="ending-card__stats">
            <div class="ending-stat" v-for="(label, key) in statLabels" :key="key">
              <span class="ending-stat__label">{{ label }}</span>
              <span class="ending-stat__value">{{ statValues[key] }}</span>
            </div>
          </div>
          <div class="ending-card__actions">
            <button class="ending-card__btn ending-card__btn--primary" @click="goHome">
              <span>回到首页</span>
            </button>
            <button class="ending-card__btn" @click="goSelect">选择其他角色</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 加载状态 -->
    <Transition name="fade">
      <div class="game-view__loading" v-if="isLoading">
        <div class="loading-spirit">
          <div class="loading-spirit__orb" />
          <p>精灵正在苏醒...</p>
        </div>
      </div>
    </Transition>
  </GameContainer>

  <!-- 全局浮动组件 -->
  <AttributeFloaters ref="floaterRef" />
  <UnlockToast ref="toastRef" />
  <DailySummary ref="summaryRef" />
  <ActTransition ref="actTransitionRef" />
  <EndingMontage ref="montageRef" />
  <TutorialOverlay ref="tutorialRef" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useAttributeStore } from '@/stores/attributeStore';
import { useGameController } from '@/composables/useGameController';
import type { Choice } from '@/types/story';
import GameContainer from '@/components/layout/GameContainer.vue';
import AttributeBar from '@/components/status/AttributeBar.vue';
import SpiritAvatar from '@/components/spirit/SpiritAvatar.vue';
import AttributeFloaters from '@/components/feedback/AttributeFloaters.vue';
import ParticleField from '@/components/effects/ParticleField.vue';
import UnlockToast from '@/components/feedback/UnlockToast.vue';
import DailySummary from '@/components/feedback/DailySummary.vue';
import ActTransition from '@/components/feedback/ActTransition.vue';
import EndingMontage from '@/components/feedback/EndingMontage.vue';
import TutorialOverlay from '@/components/feedback/TutorialOverlay.vue';

const router = useRouter();
const gameStore = useGameStore();
const attributeStore = useAttributeStore();
const controller = useGameController();

const isLoading = ref(true);
const isTyping = ref(false);
const displayedText = ref('');
const textRef = ref<HTMLParagraphElement | null>(null);
const floaterRef = ref<InstanceType<typeof AttributeFloaters> | null>(null);
const toastRef = ref<InstanceType<typeof UnlockToast> | null>(null);
const summaryRef = ref<InstanceType<typeof DailySummary> | null>(null);
const actTransitionRef = ref<InstanceType<typeof ActTransition> | null>(null);
const montageRef = ref<InstanceType<typeof EndingMontage> | null>(null);
const tutorialRef = ref<InstanceType<typeof TutorialOverlay> | null>(null);
const isShowingSummary = ref(false);
const isShowingOverlay = ref(false);
const sceneImgError = ref(false);

// RAF 打字机状态
let rafId: number | null = null;
let typingStartTime = 0;
let fullText = '';
const TYPING_SPEED = 45;

const spiritColor = computed(() => {
  return gameStore.currentCharacter?.spiritAppearance?.color ?? '#F2B705';
});

const spiritEmotion = computed(() => {
  const d = controller.currentDialogue.value;
  if (!d || d.speaker !== 'spirit') return 'gentle';
  const text = d.text;
  if (text.includes('恭喜') || text.includes('太棒了') || text.includes('很好')) return 'celebrating';
  if (text.includes('思考') || text.includes('考虑') || text.includes('建议')) return 'thinking';
  if (text.includes('担心') || text.includes('注意') || text.includes('不太好')) return 'concerned';
  if (text.includes('你好') || text.includes('加油') || text.includes('相信')) return 'cheerful';
  return 'gentle';
});

/** 场景中文映射 */
const sceneNameMap: Record<string, string> = {
  living_room: '客厅',
  bedroom: '卧室',
  kitchen: '厨房',
  bathroom: '卫生间',
  balcony: '阳台',
  garden: '小花园',
  community: '小区',
  street: '街道',
  hospital: '医院',
  pharmacy: '药店',
  park: '公园',
  community_center: '社区中心',
  shoe_store: '鞋店',
  spirit_realm: '精灵空间',
  study: '书房',
  outdoors: '室外',
};

const sceneClass = computed(() => controller.currentSceneDesc.value || 'default');

const currentSceneName = computed(() => {
  const scene = controller.currentSceneDesc.value;
  if (!scene) return '';
  return sceneNameMap[scene] ?? '';
});

/** 场景插画图片路径 */
const sceneImagePath = computed(() => {
  const scene = controller.currentSceneDesc.value;
  if (!scene) return '';
  // 场景变化时重置错误状态
  sceneImgError.value = false;
  return `${import.meta.env.BASE_URL}images/scenes/${scene}.jpg`;
});

const isSpiritSpeaking = computed(() => {
  const d = controller.currentDialogue.value;
  return d && d.speaker === 'spirit';
});

const speakerName = computed(() => {
  const d = controller.currentDialogue.value;
  if (!d) return '';
  const nameMap: Record<string, string> = {
    spirit: '精灵',
    elder: gameStore.currentCharacter?.nickname ?? '老人',
    narrator: '旁白',
  };
  return nameMap[d.speaker] ?? d.speaker;
});

const feedbackIcon = computed(() => {
  const type = controller.currentFeedback.value?.type;
  const iconMap: Record<string, string> = {
    correct: '✓',
    partial: '~',
    incorrect: '!',
    neutral: '?',
  };
  return iconMap[type ?? ''] ?? '?';
});

const statLabels: Record<string, string> = {
  health: '健康值',
  mood: '心情值',
  independence: '独立值',
  trust: '信任值',
  spiritPower: '精灵魔力',
};

const statValues = computed<Record<string, number>>(() => ({
  health: attributeStore.attributes.health,
  mood: attributeStore.attributes.mood,
  independence: attributeStore.attributes.independence,
  trust: attributeStore.attributes.trust,
  spiritPower: attributeStore.spiritPower.current,
}));

// 预加载场景图片
const preloadedScenes = new Set<string>();
function preloadScene(scene: string) {
  if (!scene || preloadedScenes.has(scene)) return;
  const img = new Image();
  img.src = `${import.meta.env.BASE_URL}images/scenes/${scene}.jpg`;
  preloadedScenes.add(scene);
}

function handleAdvance() {
  if (isTyping.value) {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    displayedText.value = fullText;
    isTyping.value = false;
    return;
  }
  controller.advanceDialogue();
}

function handleSelect(choice: Choice) {
  controller.selectChoice(choice);
}

function handleDismissFeedback() {
  controller.dismissFeedback();
}

function goHome() {
  controller.dispose();
  router.push('/');
}

function goSelect() {
  controller.dispose();
  router.push('/select');
}

function handleSceneImgError() {
  sceneImgError.value = true;
}

/** RAF 批量打字机效果 */
function startTypewriter(text: string) {
  if (rafId !== null) cancelAnimationFrame(rafId);
  fullText = text;
  displayedText.value = '';
  isTyping.value = true;
  typingStartTime = performance.now();

  const typeFrame = (now: number) => {
    const elapsed = now - typingStartTime;
    const targetIndex = Math.min(Math.floor(elapsed / TYPING_SPEED), fullText.length);

    if (targetIndex > displayedText.value.length) {
      displayedText.value = fullText.slice(0, targetIndex);
    }

    if (targetIndex < fullText.length) {
      rafId = requestAnimationFrame(typeFrame);
    } else {
      isTyping.value = false;
      rafId = null;
    }
  };

  rafId = requestAnimationFrame(typeFrame);
}

// 当对话变化时更新
watch(() => controller.currentDialogue.value, (dialogue) => {
  if (dialogue && isLoading.value) {
    isLoading.value = false;
  }
  if (dialogue) {
    startTypewriter(dialogue.text);
  }
});

// 预加载当前场景
watch(() => controller.currentSceneDesc.value, (scene) => {
  if (scene) preloadScene(scene);
});

// 属性变化飘字动画
watch(() => controller.pendingAttributeEffects.value, (effects) => {
  if (effects && effects.length > 0 && floaterRef.value) {
    floaterRef.value.showFloaters(effects);
  }
});

// 解锁 Toast 通知
watch(() => controller.pendingUnlockEvent.value, (event) => {
  if (event && toastRef.value) {
    toastRef.value.showUnlock(event.kind, event.text);
  }
});

// 每日小结 — 关闭后通知引擎继续
watch(() => controller.pendingDaySummary.value, async (summary) => {
  if (summary && summaryRef.value && !isShowingSummary.value) {
    isShowingSummary.value = true;
    await summaryRef.value.show(summary.day, summary.effects, summary.spiritDelta);
    isShowingSummary.value = false;
    controller.pendingDaySummary.value = null;
    controller.resumeFromTransition();
  }
});

// 幕间过渡 — 关闭后通知引擎继续
watch(() => controller.pendingActTransition.value, async (event) => {
  if (event && actTransitionRef.value && !isShowingOverlay.value) {
    isShowingOverlay.value = true;
    await actTransitionRef.value.show(event.act);
    isShowingOverlay.value = false;
    controller.pendingActTransition.value = null;
    controller.resumeFromTransition();
  }
});

// 结局回忆蒙太奇 — 关闭后清除状态
watch(() => controller.pendingEndingMontage.value, async (event) => {
  if (event && montageRef.value && !isShowingOverlay.value) {
    isShowingOverlay.value = true;
    await montageRef.value.show(event.texts);
    isShowingOverlay.value = false;
    controller.pendingEndingMontage.value = null;
  }
});

onMounted(async () => {
  if (!gameStore.currentCharacter) {
    router.push('/select');
    return;
  }

  // 如果游戏已在进行中（用户从相册/日记等页面返回），不重新开始
  if (gameStore.gamePhase === 'playing') {
    isLoading.value = false;
    controller.resumeGame(gameStore.currentCharacter);
    return;
  }

  isLoading.value = true;

  // 首次进入游戏显示新手引导
  if (!gameStore.settings.hasSeenTutorial) {
    isLoading.value = false;
    if (tutorialRef.value) {
      await tutorialRef.value.show();
      gameStore.updateSettings({ hasSeenTutorial: true });
    }
  }

  controller.startGame(gameStore.currentCharacter).catch(e => {
    console.error('[GameView] 游戏启动失败:', e);
    isLoading.value = false;
  });
});

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }
  // 不销毁引擎实例，只做轻量清理（引擎状态保留，支持从相册/日记返回后继续游戏）
  controller.pause();
});
</script>

<style scoped>
/* ========== 属性栏 - 现代紧凑 ========== */
.game-view__attributes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm) var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-base);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-status-bar);
  contain: layout style paint;
}

/* ========== 场景区域 - 固定比例防 CLS ========== */
.game-view__scene {
  flex: 1;
  min-height: 200px;
  max-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin: 0 var(--spacing-base) var(--spacing-base);
  border-radius: var(--radius-xl);
  background: linear-gradient(160deg, #F0EDE8 0%, #E8E4DF 50%, #E0DAD4 100%);
  box-shadow: var(--shadow-md);
  contain: layout style paint;
  /* 固定宽高比，图片加载时不跳动 */
  aspect-ratio: 16 / 10;
}

.game-view__scene-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  will-change: transform;
  transform: translateZ(0);
  border-radius: var(--radius-xl);
}

.game-view__scene-img.is-animating {
  animation: kenBurns 20s ease-in-out infinite alternate;
}

.game-view__scene-overlay {
  position: absolute;
  bottom: var(--spacing-base);
  left: var(--spacing-base);
  z-index: 1;
}

.game-view__scene-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: rgba(255, 255, 255, 0.95);
  background: rgba(26, 26, 46, 0.5);
  padding: 5px 14px;
  border-radius: var(--radius-full);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  letter-spacing: 0.5px;
}

.game-view__scene-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #E8E4F0 0%, #F0ECE8 100%);
  gap: var(--spacing-sm);
}

.scene-fallback__label {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  opacity: 0.6;
}

.scene-fallback__hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.game-view__spirit {
  position: absolute;
  top: var(--spacing-base);
  right: var(--spacing-base);
  z-index: 2;
  filter: drop-shadow(0 4px 16px rgba(242, 183, 5, 0.3));
  will-change: transform;
}

/* ========== 对话区域 - 大圆角卡片 ========== */
.game-view__dialogue {
  padding: 0 var(--spacing-base) var(--spacing-base);
  cursor: pointer;
  min-height: 100px;
  contain: layout style paint;
}

.dialogue-box {
  background: var(--color-bg-card);
  border-radius: 20px;
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;
}

.dialogue-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  opacity: 0.8;
}

.dialogue-box--spirit {
  background: linear-gradient(135deg, #F0F4FF 0%, #E8EEFF 100%);
  border-color: rgba(100, 140, 255, 0.15);
  box-shadow: 0 6px 28px rgba(100, 140, 255, 0.08), 0 0 20px rgba(100, 140, 255, 0.04), var(--shadow-sm);
}
.dialogue-box--spirit::before { background: linear-gradient(90deg, #6B8AFF, #A0B4FF); }

.dialogue-box--elder {
  background: linear-gradient(135deg, #FFF8F0 0%, #FFF2E5 100%);
  border-color: rgba(255, 160, 100, 0.15);
  box-shadow: 0 6px 28px rgba(255, 140, 80, 0.06), var(--shadow-sm);
}
.dialogue-box--elder::before { background: linear-gradient(90deg, #FF9A6C, #FFB899); }

.dialogue-box--narrator {
  background: #F5F5F5;
  border-style: dashed;
  border-color: var(--color-border);
}
.dialogue-box--narrator::before { background: var(--color-text-tertiary); opacity: 0.3; }

.dialogue-box__speaker {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.dialogue-box__speaker-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-text-tertiary);
  flex-shrink: 0;
}

.dialogue-box--spirit .dialogue-box__speaker { color: var(--color-spirit-power-dark); }
.dialogue-box--spirit .dialogue-box__speaker-dot { background: var(--color-spirit-power); box-shadow: 0 0 8px var(--color-spirit-glow); }
.dialogue-box--elder .dialogue-box__speaker { color: var(--color-health-dark); }
.dialogue-box--elder .dialogue-box__speaker-dot { background: var(--color-health); }

.dialogue-box__text {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text-primary);
  min-height: 1.5em;
  word-break: break-word;
}

.cursor-blink {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--color-spirit-power);
  margin-left: 3px;
  vertical-align: middle;
  animation: cursorBlink 0.8s ease-in-out infinite;
  border-radius: 1px;
  opacity: 0.7;
}

.dialogue-box__hint {
  text-align: right;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-sm);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialogue-box__hint.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.hint-pulse {
  display: inline-block;
  animation: hintPulse 2s ease-in-out infinite;
}

/* ========== 选项区域 - Pill 按钮 ========== */
.game-view__choices {
  padding: 0 var(--spacing-base) var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  contain: layout style paint;
}

.choice-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-left: 3px solid var(--color-spirit-power);
  border-radius: 16px;
  text-align: left;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  will-change: transform;
  transform: translateZ(0);
}

.choice-btn:hover {
  transform: translateX(4px) translateZ(0);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left-color: var(--color-spirit-power-dark);
  border-left-width: 5px;
}

.choice-btn:active {
  transform: translateX(4px) scale(0.97) translateZ(0);
  border-color: var(--color-spirit-power);
  border-left-width: 5px;
  background: linear-gradient(135deg, #FFFDF5 0%, #FFF8E7 100%);
  box-shadow: 0 4px 20px rgba(242, 183, 5, 0.15);
}

.choice-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(242, 183, 5, 0.2) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.5);
  transition: none;
  pointer-events: none;
}

.choice-btn:active::after {
  animation: rippleBurst 0.5s ease-out;
}

.choice-btn__text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: 1.5;
}

.choice-btn__desc {
  font-size: 13px;
  color: var(--color-text-primary);
  line-height: 1.4;
}

/* ========== 反馈弹窗 ========== */
.game-view__feedback {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.3);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--spacing-base);
  contain: layout style paint;
}

.feedback-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-2xl) var(--spacing-xl);
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border);
  contain: layout style paint;
}

.feedback-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-base);
  font-size: 28px;
  font-weight: bold;
  box-shadow: var(--shadow-sm);
}

.feedback-card__icon--correct { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); color: #2E7D32; }
.feedback-card__icon--partial { background: linear-gradient(135deg, #FFF3E0, #FFE0B2); color: #E65100; }
.feedback-card__icon--incorrect { background: linear-gradient(135deg, #FFEBEE, #FFCDD2); color: #C62828; }
.feedback-card__icon--neutral { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); color: #1565C0; }

.feedback-card__spirit {
  margin-bottom: var(--spacing-base);
}

.feedback-card__dialogue {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}

.feedback-card__explanation {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.feedback-card__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-2xl);
  background: linear-gradient(135deg, #F2B705 0%, #E8A500 100%);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  box-shadow: 0 4px 16px rgba(242, 183, 5, 0.3);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.feedback-card__btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(242, 183, 5, 0.25) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.5);
  transition: none;
  pointer-events: none;
}

.feedback-card__btn:active::after {
  animation: rippleBurst 0.6s ease-out;
}

.feedback-card__btn:active {
  transform: scale(0.96);
  box-shadow: 0 2px 8px rgba(242, 183, 5, 0.2);
}

.btn-arrow {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
}

.feedback-card__btn:active .btn-arrow {
  transform: translateX(3px);
}

/* ========== 结局画面 ========== */
.game-view__ending {
  position: fixed;
  inset: 0;
  background: linear-gradient(160deg, #F8F6F3 0%, #F0EDE8 50%, #E8E4DF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--spacing-base);
  contain: layout style paint;
  overflow-y: auto;
}

.ending-card {
  text-align: center;
  max-width: 380px;
  width: 100%;
  position: relative;
  padding: var(--spacing-xl);
}

.ending-card__glow {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(242, 183, 5, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.ending-card__icon {
  margin-bottom: var(--spacing-lg);
}

.ending-icon__orb {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE082 0%, #F2B705 50%, #D49A00 100%);
  box-shadow: 0 8px 32px rgba(242, 183, 5, 0.3), 0 0 60px rgba(242, 183, 5, 0.1);
  margin: 0 auto;
  position: relative;
  animation: spiritFloat 3s ease-in-out infinite;
}

.ending-icon__orb::before {
  content: '';
  position: absolute;
  top: 14px;
  left: 16px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}

.ending-card__title {
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-base);
  font-weight: var(--font-weight-bold);
}

.ending-card__desc {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-xl);
}

.ending-card__score {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-base);
  padding: var(--spacing-base) var(--spacing-lg);
  background: linear-gradient(135deg, #FFFDF5 0%, #FFF8E7 100%);
  border-radius: var(--radius-xl);
  border: 1.5px solid rgba(242, 183, 5, 0.2);
  box-shadow: var(--shadow-sm);
}

.ending-score__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.ending-score__value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-spirit-power-dark);
}

.ending-card__stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-base);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.ending-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
}

.ending-stat__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.ending-stat__value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.ending-card__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.ending-card__btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border: 1.5px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.ending-card__btn:active {
  transform: scale(0.97);
}

.ending-card__btn--primary {
  background: linear-gradient(135deg, #F2B705 0%, #E8A500 100%);
  border-color: transparent;
  color: #FFFFFF;
  box-shadow: 0 4px 20px rgba(242, 183, 5, 0.25);
}

.ending-card__btn--primary:active {
  box-shadow: 0 2px 10px rgba(242, 183, 5, 0.15);
}

/* ========== 加载状态 ========== */
.game-view__loading {
  position: fixed;
  inset: 0;
  background: linear-gradient(160deg, #F8F6F3 0%, #F0EDE8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  contain: layout style paint;
}

.loading-spirit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.loading-spirit__orb {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE082 0%, #F2B705 50%, #D49A00 100%);
  box-shadow: 0 0 30px rgba(242, 183, 5, 0.35), 0 0 80px rgba(242, 183, 5, 0.1);
  animation: spiritPulse 1.5s ease-in-out infinite;
  position: relative;
}

.loading-spirit__orb::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}

/* ========== Transition 动画 ========== */
.scene-fade-enter-active {
  transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out, filter 0.8s ease-in-out;
}

.scene-fade-leave-active {
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
}

.scene-fade-enter-from {
  opacity: 0;
  transform: scale(1.03);
  filter: brightness(1.1);
}

.scene-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.spirit-pop-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.spirit-pop-leave-active {
  transition: all 0.2s ease;
}

.spirit-pop-enter-from {
  opacity: 0;
  transform: scale(0.6) translateY(-10px);
}

.spirit-pop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.dialogue-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialogue-slide-leave-active {
  transition: all 0.2s ease;
}

.dialogue-slide-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.dialogue-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.choice-stagger-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: var(--stagger-delay, 0ms);
}

.choice-stagger-leave-active {
  transition: all 0.2s ease;
}

.choice-stagger-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}

.choice-stagger-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.feedback-scale-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.feedback-scale-leave-active {
  transition: all 0.2s ease;
}

.feedback-scale-enter-from {
  opacity: 0;
  transform: scale(0.85);
}

.feedback-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.ending-reveal-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.ending-reveal-leave-active {
  transition: all 0.3s ease;
}

.ending-reveal-enter-from {
  opacity: 0;
}

.ending-reveal-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========== Keyframes ========== */
@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes hintPulse {
  0%, 100% { opacity: 0.6; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-1px); }
}

@keyframes spiritPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

@keyframes kenBurns {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.08) translate(-1%, -1%); }
}

@keyframes rippleBurst {
  0% { opacity: 0.6; transform: scale(0.3); }
  100% { opacity: 0; transform: scale(2); }
}
</style>
