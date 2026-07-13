<template>
  <GameContainer :show-status-bar="true">
    <!-- 属性栏区域 -->
    <div class="game-view__attributes">
      <AttributeBar type="health" :value="attributeStore.attributes.health" />
      <AttributeBar type="mood" :value="attributeStore.attributes.mood" />
      <AttributeBar type="independence" :value="attributeStore.attributes.independence" />
      <AttributeBar type="trust" :value="attributeStore.attributes.trust" />
    </div>

    <!-- 场景插画区 -->
    <div class="game-view__scene" :class="`game-view__scene--${controller.currentSceneDesc.value || 'default'}`">
      <img
        v-if="sceneImagePath"
        :src="sceneImagePath"
        :alt="currentSceneName"
        class="game-view__scene-img"
        @error="handleSceneImgError"
      />
      <div class="game-view__scene-overlay" v-if="currentSceneName">
        <span class="game-view__scene-label">{{ currentSceneName }}</span>
      </div>
      <div class="game-view__spirit" v-if="isSpiritSpeaking">
        <SpiritAvatar emotion="cheerful" :color="spiritColor" />
      </div>
    </div>

    <!-- 对话区 -->
    <div class="game-view__dialogue" v-if="controller.currentDialogue.value" @click="handleAdvance">
      <div class="dialogue-box" :class="`dialogue-box--${controller.currentDialogue.value.speaker}`">
        <div class="dialogue-box__speaker">
          {{ speakerName }}
        </div>
        <p class="dialogue-box__text">{{ displayedText }}</p>
        <div class="dialogue-box__hint" :class="{ 'is-hidden': isTyping }" v-if="!isTyping">点击继续</div>
      </div>
    </div>

    <!-- 选项区 -->
    <div class="game-view__choices" v-if="controller.currentChoices.value.length > 0">
      <button
        v-for="choice in controller.currentChoices.value"
        :key="choice.id"
        class="choice-btn"
        @click="handleSelect(choice)"
      >
        <span class="choice-btn__text">{{ choice.text }}</span>
        <span class="choice-btn__desc" v-if="choice.description">{{ choice.description }}</span>
      </button>
    </div>

    <!-- 反馈弹窗 -->
    <Transition name="fade">
      <div class="game-view__feedback" v-if="controller.isShowingFeedback.value">
        <div class="feedback-card">
          <div class="feedback-card__icon" :class="`feedback-card__icon--${controller.currentFeedback.value?.type}`">
            {{ feedbackIcon }}
          </div>
          <div class="feedback-card__spirit">
            <SpiritAvatar emotion="cheerful" :color="spiritColor" />
          </div>
          <p class="feedback-card__dialogue">{{ controller.currentFeedback.value?.spiritDialogue }}</p>
          <p class="feedback-card__explanation" v-if="controller.currentFeedback.value?.explanation">
            {{ controller.currentFeedback.value?.explanation }}
          </p>
          <button class="feedback-card__btn" @click="handleDismissFeedback">继续</button>
        </div>
      </div>
    </Transition>

    <!-- 结局画面 -->
    <Transition name="fade">
      <div class="game-view__ending" v-if="controller.isGameEnded.value && controller.endingInfo.value">
        <div class="ending-card">
          <h2 class="ending-card__title">{{ controller.endingInfo.value.title }}</h2>
          <p class="ending-card__desc">{{ controller.endingInfo.value.description }}</p>
          <div class="ending-card__score" v-if="controller.endingInfo.value?.score">
            <span class="ending-score__label">综合守护得分</span>
            <span class="ending-score__value">{{ controller.endingInfo.value.score }}</span>
          </div>
          <div class="ending-card__stats">
            <div class="ending-stat">
              <span class="ending-stat__label">健康值</span>
              <span class="ending-stat__value">{{ attributeStore.attributes.health }}</span>
            </div>
            <div class="ending-stat">
              <span class="ending-stat__label">心情值</span>
              <span class="ending-stat__value">{{ attributeStore.attributes.mood }}</span>
            </div>
            <div class="ending-stat">
              <span class="ending-stat__label">独立值</span>
              <span class="ending-stat__value">{{ attributeStore.attributes.independence }}</span>
            </div>
            <div class="ending-stat">
              <span class="ending-stat__label">信任值</span>
              <span class="ending-stat__value">{{ attributeStore.attributes.trust }}</span>
            </div>
            <div class="ending-stat">
              <span class="ending-stat__label">精灵魔力</span>
              <span class="ending-stat__value">{{ attributeStore.spiritPower.current }}</span>
            </div>
          </div>
          <div class="ending-card__actions">
            <button class="ending-card__btn ending-card__btn--primary" @click="goHome">回到首页</button>
            <button class="ending-card__btn" @click="goSelect">选择其他角色</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 加载状态 -->
    <div class="game-view__loading" v-if="isLoading">
      <div class="loading-spirit">精灵正在苏醒...</div>
    </div>
  </GameContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useAttributeStore } from '@/stores/attributeStore';
import { useGameController } from '@/composables/useGameController';
import type { Choice } from '@/types/story';
import GameContainer from '@/components/layout/GameContainer.vue';
import AttributeBar from '@/components/status/AttributeBar.vue';
import SpiritAvatar from '@/components/spirit/SpiritAvatar.vue';

const router = useRouter();
const gameStore = useGameStore();
const attributeStore = useAttributeStore();
const controller = useGameController();

const isLoading = ref(true);
const isTyping = ref(false);
const displayedText = ref('');
const typingTimer = ref<number | null>(null);

const spiritColor = computed(() => {
  return gameStore.currentCharacter?.spiritAppearance?.color ?? '#F5C842';
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
const currentSceneName = computed(() => {
  const scene = controller.currentSceneDesc.value;
  if (!scene) return '';
  return sceneNameMap[scene] ?? '';
});
/** 场景插画图片路径 */
const sceneImagePath = computed(() => {
  const scene = controller.currentSceneDesc.value;
  if (!scene) return '';
  return `/images/scenes/${scene}.jpg`;
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

function handleAdvance() {
  if (isTyping.value) {
    // 立即完成打字机效果
    const fullText = controller.currentDialogue.value?.text ?? '';
    displayedText.value = fullText;
    isTyping.value = false;
    if (typingTimer.value !== null) {
      clearTimeout(typingTimer.value);
      typingTimer.value = null;
    }
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
  // 图片加载失败时静默处理，回退到背景色
}

// 当第一条对话出现时，关闭加载状态
watch(() => controller.currentDialogue.value, (dialogue) => {
  if (dialogue && isLoading.value) {
    isLoading.value = false;
  }

  // 打字机效果
  if (dialogue) {
    // 清空并启动打字机
    displayedText.value = '';
    isTyping.value = true;
    let index = 0;
    const text = dialogue.text;
    typingTimer.value = window.setTimeout(function type() {
      if (index < text.length) {
        displayedText.value += text[index];
        index++;
        typingTimer.value = window.setTimeout(type, 30);
      } else {
        isTyping.value = false;
        typingTimer.value = null;
      }
    }, 30);
  }
});

onMounted(() => {
  if (!gameStore.currentCharacter) {
    router.push('/select');
    return;
  }

  isLoading.value = true;
  controller.startGame(gameStore.currentCharacter).catch(e => {
    console.error('[GameView] 游戏启动失败:', e);
    isLoading.value = false;
  });
});

onUnmounted(() => {
  if (typingTimer.value !== null) {
    clearTimeout(typingTimer.value);
  }
  controller.dispose();
});
</script>

<style scoped>
.game-view__attributes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-base);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
}

.game-view__scene {
  flex: 1;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.game-view__scene-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: opacity 0.5s ease;
}

.game-view__scene-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-sm) var(--spacing-base);
  background: linear-gradient(transparent, rgba(0,0,0,0.35));
  pointer-events: none;
  z-index: 1;
}

.game-view__scene-label {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.25);
  padding: 2px var(--spacing-sm);
  border-radius: var(--radius-full);
  backdrop-filter: blur(4px);
}

.game-view__spirit {
  position: absolute;
  top: var(--spacing-base);
  right: var(--spacing-base);
  z-index: 2;
}

.game-view__dialogue {
  padding: var(--spacing-base);
  cursor: pointer;
  min-height: 100px;
}

.dialogue-box {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-base);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.dialogue-box--spirit {
  border-color: var(--color-spirit-power);
  background: var(--color-spirit-power-light);
}

.dialogue-box--elder {
  border-color: var(--color-trust);
}

.dialogue-box--narrator {
  border-style: dashed;
  background: transparent;
}

.dialogue-box__speaker {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.dialogue-box--spirit .dialogue-box__speaker { color: var(--color-spirit-power-dark); }
.dialogue-box--elder .dialogue-box__speaker { color: var(--color-trust); }

.dialogue-box__text {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
}

.dialogue-box__hint {
  text-align: right;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-xs);
  animation: fadeIn 1s ease-in-out infinite;
}

.game-view__choices {
  padding: var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.choice-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-base);
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: left;
  transition: all 0.15s ease;
}

.choice-btn:active {
  transform: scale(0.98);
  border-color: var(--color-spirit-power);
  background: var(--color-spirit-power-light);
}

.choice-btn__text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.choice-btn__desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.game-view__feedback {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--spacing-base);
}

.feedback-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.feedback-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-base);
  font-size: 24px;
  font-weight: bold;
}

.feedback-card__icon--correct { background: #E8F5E9; color: #2E7D32; }
.feedback-card__icon--partial { background: #FFF3E0; color: #E65100; }
.feedback-card__icon--incorrect { background: #FFEBEE; color: #C62828; }
.feedback-card__icon--neutral { background: #E3F2FD; color: #1565C0; }

.feedback-card__spirit {
  margin-bottom: var(--spacing-base);
}

.feedback-card__dialogue {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.feedback-card__explanation {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-base);
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
}

.feedback-card__btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  background: var(--color-spirit-power);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.game-view__ending {
  position: fixed;
  inset: 0;
  background: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--spacing-base);
}

.ending-card {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.ending-card__title {
  font-size: var(--font-size-2xl);
  color: var(--color-spirit-power-dark);
  margin-bottom: var(--spacing-base);
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
  padding: var(--spacing-base);
  background: var(--color-spirit-power-light);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-spirit-power);
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
  border-radius: var(--radius-lg);
}

.ending-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border: 2px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
}

.ending-card__btn--primary {
  background: var(--color-spirit-power);
  border-color: var(--color-spirit-power);
}

.game-view__loading {
  position: fixed;
  inset: 0;
  background: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.loading-spirit {
  font-size: var(--font-size-lg);
  color: var(--color-spirit-power-dark);
  animation: fadeIn 1.5s ease-in-out infinite;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
