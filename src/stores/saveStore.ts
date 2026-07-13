/**
 * 存档/回溯状态 Store
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SaveData, DecisionRecord, Checkpoint } from '@/types/save';
import { useGameStore } from './gameStore';
import { useAttributeStore } from './attributeStore';
import { useStoryStore } from './storyStore';
import { useSkillStore } from './skillStore';
import { usePropStore } from './propStore';

const __DEV__ = import.meta.env.DEV;

/** LocalStorage 存档键名 */
const STORAGE_KEY = 'guardian_spirit_save';
const SETTINGS_KEY = 'guardian_spirit_settings';

export const useSaveStore = defineStore('save', () => {
  // === State ===
  /** 存档版本号 */
  const saveVersion = '1.0.0';
  /** 游戏版本号 */
  const gameVersion = '0.1.0';
  /** 检查点列表 */
  const checkpoints = ref<Checkpoint[]>([]);
  /** 当前可回溯的检查点索引 */
  const currentCheckpointIndex = ref(-1);
  /** 决策历史记录 */
  const decisionHistory = ref<DecisionRecord[]>([]);
  /** 是否有存档数据 */
  const hasSave = ref(false);

  // === Getters ===
  /** 最新的检查点 */
  const latestCheckpoint = computed(() => {
    if (checkpoints.value.length === 0) return null;
    return checkpoints.value[checkpoints.value.length - 1];
  });

  // === Actions ===

  /** 创建检查点 */
  function createCheckpoint(nodeId: string) {
    const gameStore = useGameStore();
    const attributeStore = useAttributeStore();

    const checkpoint: Checkpoint = {
      id: `cp_${nodeId}_${Date.now()}`,
      nodeId,
      day: gameStore.currentDay,
      timestamp: Date.now(),
      attributes: { ...attributeStore.attributes },
      spiritPower: { ...attributeStore.spiritPower },
      skills: { ...useSkillStore().skills },
      flags: { ...gameStore.flags },
      unlockedContent: [
        ...useStoryStore().unlockedAlbumEntries,
        ...useStoryStore().unlockedDiaryEntries,
        ...useStoryStore().unlockedProps,
      ],
    };

    checkpoints.value.push(checkpoint);
    currentCheckpointIndex.value = checkpoints.value.length - 1;
    __DEV__ && console.log(`[Save] 创建检查点: ${checkpoint.id}`);
  }

  /** 记录决策 */
  function recordDecision(record: DecisionRecord) {
    decisionHistory.value.push(record);
  }

  /** 自动存档到 LocalStorage */
  function autoSave(): void {
    const gameStore = useGameStore();
    const attributeStore = useAttributeStore();
    const storyStore = useStoryStore();
    const skillStore = useSkillStore();
    const propStore = usePropStore();

    if (!gameStore.currentCharacter) return;

    const saveData: SaveData = {
      version: saveVersion,
      saveTime: Date.now(),
      gameVersion,
      characterId: gameStore.currentCharacter.id,
      currentDay: gameStore.currentDay,
      currentAct: gameStore.currentAct,
      currentNodeId: storyStore.currentNode?.id ?? '',
      currentDialogueIndex: storyStore.dialogueIndex,
      attributes: { ...attributeStore.attributes },
      spiritPower: { ...attributeStore.spiritPower },
      skills: { ...skillStore.skills },
      availableSkillPoints: gameStore.availableSkillPoints,
      unlockedProps: propStore.unlockedProps,
      collectedProps: propStore.collectedProps,
      discoveredHiddenInfo: { ...propStore.discoveredHiddenInfo },
      albumEntries: storyStore.unlockedAlbumEntries,
      diaryEntries: storyStore.unlockedDiaryEntries,
      letters: [],
      storyHistory: [...storyStore.storyHistory],
      decisionHistory: [...decisionHistory.value],
      checkpoints: [...checkpoints.value],
      currentCheckpointIndex: currentCheckpointIndex.value,
      flags: { ...gameStore.flags },
      foreshadowing: { ...gameStore.foreshadowing },
      totalPlayTime: gameStore.totalPlayTime,
      correctDecisions: decisionHistory.value.filter(d => d.isCorrect === true).length,
      totalDecisions: decisionHistory.value.length,
      rollbackCount: 0,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      hasSave.value = true;
      __DEV__ && console.log(`[Save] 自动存档成功`);
    } catch (error) {
      console.error('[Save] 自动存档失败:', error);
    }
  }

  /** 从 LocalStorage 加载存档 */
  function loadSave(): SaveData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const saveData = JSON.parse(data) as SaveData;
        hasSave.value = true;
        return saveData;
      }
    } catch (error) {
      console.error('[Save] 加载存档失败:', error);
    }
    return null;
  }

  /** 回溯到上一个检查点 */
  function rollback(): boolean {
    if (currentCheckpointIndex.value < 0) return false;

    const checkpoint = checkpoints.value[currentCheckpointIndex.value];
    if (!checkpoint) return false;

    const attributeStore = useAttributeStore();
    const gameStore = useGameStore();
    const skillStore = useSkillStore();

    // 恢复属性
    attributeStore.attributes = { ...checkpoint.attributes };
    const sp = checkpoint.spiritPower;
    attributeStore.spiritPower.current = (sp as any).current ?? sp;

    // 恢复flags
    gameStore.flags = { ...checkpoint.flags };

    // 恢复技能
    skillStore.restoreSkills(checkpoint.skills);

    __DEV__ && console.log(`[Save] 回溯到检查点: ${checkpoint.id}`);
    return true;
  }

  /** 保存设置 */
  function saveSettings(settings: Record<string, unknown>) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('[Save] 保存设置失败:', error);
    }
  }

  /** 加载设置 */
  function loadSettings(): Record<string, unknown> | null {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[Save] 加载设置失败:', error);
    }
    return null;
  }

  /** 清除存档 */
  function clearSave() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      hasSave.value = false;
      checkpoints.value = [];
      decisionHistory.value = [];
      currentCheckpointIndex.value = -1;
    } catch (error) {
      console.error('[Save] 清除存档失败:', error);
    }
  }

  /** 重置存档Store状态 */
  function resetStore() {
    checkpoints.value = [];
    decisionHistory.value = [];
    currentCheckpointIndex.value = -1;
  }

  return {
    saveVersion, gameVersion, checkpoints, currentCheckpointIndex,
    decisionHistory, hasSave,
    latestCheckpoint,
    createCheckpoint, recordDecision, autoSave,
    loadSave, rollback, saveSettings, loadSettings,
    clearSave, resetStore,
  };
});
