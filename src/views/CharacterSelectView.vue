<template>
  <div class="select-view watercolor-bg">
    <header class="select-view__header">
      <button class="select-view__back" @click="goBack">
        <span class="select-view__back-arrow"></span>
        返回
      </button>
      <h2 class="select-view__title">选择守护对象</h2>
      <span class="select-view__count">{{ unlockedCount }} / {{ characters.length }} 已解锁</span>
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
        <!-- 水彩人物图 -->
        <div class="character-card__portrait">
          <img
            :src="resolvePortrait(character.portrait)"
            :alt="character.nickname"
            class="character-card__img"
            @error="handleImgError"
          />
          <div class="character-card__overlay" v-if="character.isLocked">
            <div class="character-card__lock-icon">
              <div class="lock-shape"></div>
            </div>
            <p class="character-card__lock-text">完成{{ getUnlockHint(character) }}后解锁</p>
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

        <!-- 精灵标识 -->
        <div class="character-card__spirit" v-if="!character.isLocked">
          <div
            class="spirit-orb"
            :style="{ background: character.spiritAppearance.color }"
          ></div>
          <span class="character-card__spirit-name">{{ character.spiritAppearance.name }}</span>
        </div>
      </div>
    </div>

    <!-- 角色详情弹窗 -->
    <Transition name="slide-up">
      <div class="select-view__detail" v-if="selectedCharacter && !selectedCharacter.isLocked">
        <div class="detail-panel">
          <div class="detail-panel__portrait">
            <img :src="resolvePortrait(selectedCharacter.portrait)" :alt="selectedCharacter.nickname" />
          </div>
          <div class="detail-panel__content">
            <h3 class="detail-panel__name">{{ selectedCharacter.nickname }}（{{ selectedCharacter.name }}）</h3>
            <p class="detail-panel__bg">{{ selectedCharacter.background }}</p>
            <div class="detail-panel__attrs">
              <div class="detail-attr">
                <span class="detail-attr__label">健康</span>
                <span class="detail-attr__value">{{ selectedCharacter.baseAttributes.health }}</span>
              </div>
              <div class="detail-attr">
                <span class="detail-attr__label">心情</span>
                <span class="detail-attr__value">{{ selectedCharacter.baseAttributes.mood }}</span>
              </div>
              <div class="detail-attr">
                <span class="detail-attr__label">独立</span>
                <span class="detail-attr__value">{{ selectedCharacter.baseAttributes.independence }}</span>
              </div>
              <div class="detail-attr">
                <span class="detail-attr__label">信任</span>
                <span class="detail-attr__value">{{ selectedCharacter.baseAttributes.trust }}</span>
              </div>
            </div>
            <div class="detail-panel__actions">
              <button class="detail-panel__btn detail-panel__btn--cancel" @click="closeDetail">再想想</button>
              <button class="detail-panel__btn detail-panel__btn--confirm" @click="confirmStart">开始守护</button>
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

/** 拼接 base URL 处理图片路径 */
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
  margin-bottom: var(--spacing-lg);
  flex-shrink: 0;
}

.select-view__back {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  padding: var(--spacing-xs) 0;
}

.select-view__back-arrow {
  width: 8px;
  height: 8px;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
  display: inline-block;
}

.select-view__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.select-view__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.select-view__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  flex: 1;
  overflow-y: auto;
  padding-bottom: var(--spacing-xl);
}

.character-card {
  display: flex;
  align-items: stretch;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  position: relative;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  border: 2px solid transparent;
}

.character-card:active:not(.is-locked) {
  transform: scale(0.98);
}

.character-card.is-selected {
  border-color: var(--color-spirit-power);
  box-shadow: 0 0 0 3px var(--color-spirit-power-light);
}

.character-card.is-locked {
  opacity: 0.65;
}

.character-card__portrait {
  width: 80px;
  height: 100px;
  border-radius: var(--radius-md);
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
}

.character-card__lock-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-shape {
  width: 14px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-top: none;
  border-radius: 0 0 3px 3px;
  position: relative;
  margin-top: 8px;
}

.lock-shape::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 1px;
  width: 8px;
  height: 8px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

.character-card__lock-text {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  line-height: 1.2;
}

.character-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
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
  padding: 2px var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.character-card__spirit {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.spirit-orb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  opacity: 0.7;
  animation: spiritPulse 2s ease-in-out infinite;
}

.character-card__spirit-name {
  font-size: 9px;
  color: var(--color-text-tertiary);
}

/* 详情弹窗 */
.select-view__detail {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding: var(--spacing-base);
}

.detail-panel {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.detail-panel__portrait {
  width: 100%;
  height: 180px;
  overflow: hidden;
  flex-shrink: 0;
}

.detail-panel__portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.detail-panel__content {
  padding: var(--spacing-base);
  overflow-y: auto;
}

.detail-panel__name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.detail-panel__bg {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-base);
}

.detail-panel__attrs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.detail-attr {
  text-align: center;
  padding: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.detail-attr__label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-bottom: 2px;
}

.detail-attr__value {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.detail-panel__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.detail-panel__btn {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-base);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  border: 2px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  transition: transform var(--transition-fast);
}

.detail-panel__btn:active {
  transform: scale(0.98);
}

.detail-panel__btn--confirm {
  background: var(--color-spirit-power);
  border-color: var(--color-spirit-power);
  color: var(--color-text-primary);
}

@keyframes spiritPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.15); }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}
</style>
