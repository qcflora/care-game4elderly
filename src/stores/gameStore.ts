/**
 * 全局游戏状态 Store
 * 管理角色选择、当前Day/Act、游戏阶段、全局flags等
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CharacterConfig } from '@/types/character';
import type { GameSettings } from '@/types/save';

export const useGameStore = defineStore('game', () => {
  // === State ===
  /** 当前选择的角色配置 */
  const currentCharacter = ref<CharacterConfig | null>(null);
  /** 当前Day (1-30) */
  const currentDay = ref(1);
  /** 当前幕数 (1-3) */
  const currentAct = ref(1);
  /** 游戏阶段 */
  const gamePhase = ref<'loading' | 'start' | 'select' | 'playing' | 'ending'>('loading');
  /** 全局flags */
  const flags = ref<Record<string, boolean>>({});
  /** 可用技能点 */
  const availableSkillPoints = ref(0);
  /** 游戏设置 */
  const settings = ref<GameSettings>({
    typingSpeed: 'normal',
    autoPlay: false,
    sfxVolume: 0.7,
    bgmVolume: 0.5,
    hasSeenTutorial: false,
  });
  /** 总游戏时长（秒） */
  const totalPlayTime = ref(0);
  /** 伏笔系统状态 */
  const foreshadowing = ref<Record<string, {
    planted: boolean;
    revealed: boolean;
    plantedDay: number;
  }>>({});

  // === Getters ===
  const isPlaying = computed(() => gamePhase.value === 'playing');
  const progressPercent = computed(() => (currentDay.value / 30) * 100);

  // === Actions ===
  function setCharacter(character: CharacterConfig) {
    currentCharacter.value = character;
    currentDay.value = 1;
    currentAct.value = 1;
    gamePhase.value = 'start';
  }

  function setCurrentDay(day: number) {
    currentDay.value = day;
  }

  function setCurrentAct(act: number) {
    currentAct.value = act;
  }

  function setGamePhase(phase: 'loading' | 'start' | 'select' | 'playing' | 'ending') {
    gamePhase.value = phase;
  }

  function setFlag(key: string, value: boolean) {
    flags.value[key] = value;
  }

  function getFlag(key: string): boolean {
    return flags.value[key] ?? false;
  }

  function gainSkillPoints() {
    availableSkillPoints.value += 1;
  }

  function spendSkillPoints(amount: number): boolean {
    if (availableSkillPoints.value >= amount) {
      availableSkillPoints.value -= amount;
      return true;
    }
    return false;
  }

  function updateSettings(partial: Partial<GameSettings>) {
    settings.value = { ...settings.value, ...partial };
  }

  function plantForeshadowing(id: string) {
    foreshadowing.value[id] = {
      planted: true,
      revealed: false,
      plantedDay: currentDay.value,
    };
  }

  function revealForeshadowing(id: string) {
    if (foreshadowing.value[id]) {
      foreshadowing.value[id].revealed = true;
    }
  }

  function resetGame() {
    currentCharacter.value = null;
    currentDay.value = 1;
    currentAct.value = 1;
    gamePhase.value = 'start';
    flags.value = {};
    availableSkillPoints.value = 0;
    foreshadowing.value = {};
  }

  return {
    currentCharacter, currentDay, currentAct, gamePhase, flags,
    availableSkillPoints, settings, totalPlayTime, foreshadowing,
    isPlaying, progressPercent,
    setCharacter, setCurrentDay, setCurrentAct, setGamePhase,
    setFlag, getFlag, gainSkillPoints, spendSkillPoints,
    updateSettings, plantForeshadowing, revealForeshadowing, resetGame,
  };
});
