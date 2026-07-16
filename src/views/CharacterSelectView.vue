<template>
  <div class="select-view watercolor-bg">
    <header class="select-view__header">
      <button class="select-view__back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h2 class="select-view__title">选择守护对象</h2>
      <span class="select-view__count">{{ unlockedCount }} / {{ characters.length }}</span>
    </header>

    <div class="select-view__list">
      <div
        v-for="character in characters"
        :key="character.id"
        class="character-card"
        :class="{
          'is-locked': character.isLocked,
          'is-selected': selectedId === character.id,
        }"
        @click="selectCharacter(character)"
      >
        <!-- 肖像区 - 大圆角 -->
        <div class="character-card__portrait">
          <img
            :src="resolvePortrait(character.portrait)"
            :alt="character.nickname"
            class="character-card__img"
            @error="handleImgError"
          />
          <div class="character-card__overlay" v-if="character.isLocked">
            <div class="character-card__lock">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <p class="character-card__lock-text">完成{{ getUnlockHint(character) }}后解锁</p>
          </div>
          <!-- 精灵标识 -->
          <div class="character-card__spirit-badge" v-if="!character.isLocked">
            <div class="spirit-dot" :style="{ background: character.spiritAppearance.color }"></div>
          </div>
        </div>

        <!-- 角色信息 -->
        <div class="character-card__info">
          <div class="character-card__name-row">
            <h3 class="character-card__name">{{ character.nickname }}</h3>
            <span class="character-card__age">{{ character.age }}岁</span>
          </div>
          <p class="character-card__disease">{{ character.healthCondition.disease }}</p>
          <p class="character-card__relation">{{ character.familyRelation }}</p>
          <div class="character-card__tags">
            <span
              v-for="tag in character.personality.slice(0, 3)"
              :key="tag"
              class="tag"
            >{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 角色详情底部 Sheet -->
    <Transition name="sheet">
      <div class="select-view__sheet" v-if="selectedCharacter && !selectedCharacter.isLocked" @click.self="closeDetail">
        <div class="detail-sheet">
          <div class="detail-sheet__handle"></div>
          <div class="detail-sheet__portrait">
            <img :src="resolvePortrait(selectedCharacter.portrait)" :alt="selectedCharacter.nickname" />
            <div class="detail-sheet__spirit">
              <div class="spirit-orb-lg" :style="{ background: selectedCharacter.spiritAppearance.color }"></div>
              <span>{{ selectedCharacter.spiritAppearance.name }}</span>
            </div>
          </div>
          <div class="detail-sheet__content">
            <h3 class="detail-sheet__name">{{ selectedCharacter.nickname }} <span class="detail-sheet__realname">{{ selectedCharacter.name }}</span></h3>
            <p class="detail-sheet__bg">{{ selectedCharacter.background }}</p>
            <div class="detail-sheet__attrs">
              <div class="detail-attr" v-for="(label, key) in attrLabels" :key="key">
                <span class="detail-attr__value">{{ selectedCharacter.baseAttributes[key as keyof typeof selectedCharacter.baseAttributes] }}</span>
                <span class="detail-attr__label">{{ label }}</span>
              </div>
            </div>
            <div class="detail-sheet__actions">
              <button class="detail-sheet__btn detail-sheet__btn--cancel" @click="closeDetail">再想想</button>
              <button class="detail-sheet__btn detail-sheet__btn--confirm" @click="confirmStart">
                <span>开始守护</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { getAllCharacters } from '@/utils/characterLoader';
import type { CharacterConfig } from '@/types/character';

const router = useRouter();
const gameStore = useGameStore();

const characters = getAllCharacters();
const selectedId = ref<string | null>(null);
const selectedCharacter = ref<CharacterConfig | null>(null);

const unlockedCount = computed(() => characters.filter(c => !c.isLocked).length);

const attrLabels: Record<string, string> = {
  health: '健康',
  mood: '心情',
  independence: '独立',
  trust: '信任',
};

function selectCharacter(character: CharacterConfig) {
  if (character.isLocked) return;
  selectedId.value = character.id;
  selectedCharacter.value = character;
}

function closeDetail() {
  selectedId.value = null;
  selectedCharacter.value = null;
}

function confirmStart() {
  if (!selectedCharacter.value) return;
  gameStore.setCharacter(selectedCharacter.value);
  router.push('/game');
}

function goBack() {
  router.push('/');
}

function getUnlockHint(character: CharacterConfig): string {
  if (!character.unlockCondition) return '前置条件';
  return character.unlockCondition.dependsOn === 'zhao_yeye'
    ? '赵爷爷线'
    : '前置剧情';
}

function handleImgError(e: Event) {
  const img = e.target as HTMLImageElement;
  img.style.display = 'none';
}

function resolvePortrait(portrait: string): string {
  if (portrait.startsWith('/')) {
    return `${import.meta.env.BASE_URL}${portrait.slice(1)}`;
  }
  return portrait;
}
</script>

<style scoped>
.select-view {
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--spacing-base);
  display: flex;
  flex-direction: column;
}

.select-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  flex-shrink: 0;
  padding-top: var(--spacing-sm);
}

.select-view__back {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-card);
  box-shadow: var(--shadow-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.select-view__back:active { transform: scale(0.92); }

.select-view__back svg {
  width: 20px;
  height: 20px;
}

.select-view__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.select-view__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  background: var(--color-bg-secondary);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

.select-view__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  flex: 1;
  overflow-y: auto;
  padding-bottom: var(--spacing-xl);
}

/* === 角色卡片 - Travel APP 大圆角风格 === */
.character-card {
  display: flex;
  align-items: stretch;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  position: relative;
  transition: all var(--transition-fast);
  border: 2px solid transparent;
}

.character-card:active:not(.is-locked) {
  transform: scale(0.98);
}

.character-card.is-selected {
  border-color: var(--color-spirit-power);
  box-shadow: 0 0 0 4px var(--color-spirit-power-light), var(--shadow-lg);
}

.character-card.is-locked {
  opacity: 0.55;
}

.character-card__portrait {
  width: 88px;
  height: 110px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  background: var(--color-bg-secondary);
}

.character-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.character-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(26, 26, 46, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
}

.character-card__lock {
  width: 28px;
  height: 28px;
  color: rgba(255, 255, 255, 0.8);
}

.character-card__lock svg {
  width: 100%;
  height: 100%;
}

.character-card__lock-text {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  line-height: 1.2;
}

.character-card__spirit-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spirit-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.character-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
  padding: var(--spacing-xs) 0;
}

.character-card__name-row {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
}

.character-card__name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.character-card__age {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.character-card__disease {
  font-size: var(--font-size-sm);
  color: var(--color-health);
  font-weight: var(--font-weight-medium);
}

.character-card__relation {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.character-card__tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  margin-top: auto;
}

.tag {
  padding: 3px 10px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

/* === 底部 Sheet - Travel APP 风格 === */
.select-view__sheet {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.35);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding: 0;
}

.detail-sheet {
  background: var(--color-bg-card);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  max-width: var(--game-max-width);
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: var(--shadow-float);
  animation: sheetSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.detail-sheet__handle {
  width: 36px;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  margin: var(--spacing-sm) auto;
  flex-shrink: 0;
}

.detail-sheet__portrait {
  width: 100%;
  height: 200px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.detail-sheet__portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.detail-sheet__spirit {
  position: absolute;
  bottom: var(--spacing-base);
  right: var(--spacing-base);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-sm);
}

.spirit-orb-lg {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.detail-sheet__content {
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.detail-sheet__name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.detail-sheet__realname {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-normal);
}

.detail-sheet__bg {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-lg);
}

.detail-sheet__attrs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.detail-attr {
  text-align: center;
  padding: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.detail-attr__label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.detail-attr__value {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.detail-sheet__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.detail-sheet__btn {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-base);
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.detail-sheet__btn:active { transform: scale(0.96); }

.detail-sheet__btn--cancel {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.detail-sheet__btn--confirm {
  background: linear-gradient(135deg, #F2B705 0%, #E8A500 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 16px rgba(242, 183, 5, 0.25);
}

.detail-sheet__btn--confirm svg {
  width: 18px;
  height: 18px;
}

/* === Transitions === */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

@keyframes sheetSlideUp {
  from { transform: translateY(40px); opacity: 0.8; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
