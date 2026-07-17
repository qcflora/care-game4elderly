/**
 * 游戏控制器 — 连接 StoryEngine 和 Pinia Stores
 * 核心职责：将引擎的 Promise 回调桥接到 Vue 响应式系统
 */
import { ref } from 'vue';
import { getStoryEngine, destroyStoryEngine } from '@/engine/StoryEngine';
import type { StoryEngine } from '@/engine/StoryEngine';
import type { StoryNode, Dialogue, Choice, ChoiceUnlock } from '@/types/story';
import type { CharacterConfig } from '@/types/character';
import type { AttributeEffect } from '@/types/attribute';
import { useGameStore } from '@/stores/gameStore';
import { useStoryStore } from '@/stores/storyStore';
import { useAttributeStore } from '@/stores/attributeStore';
import { usePropStore } from '@/stores/propStore';
import { useSkillStore } from '@/stores/skillStore';
import { useSaveStore } from '@/stores/saveStore';
import { loadPropData, loadSkillTreeData, loadAlbumData, loadDiaryData } from '@/utils/dataLoader';

const __DEV__ = import.meta.env.DEV;

/** 当前显示的对话 */
const currentDialogue = ref<Dialogue | null>(null);
/** 当前可选项 */
const currentChoices = ref<Choice[]>([]);
/** 当前反馈信息 */
const currentFeedback = ref<{
  type: string;
  spiritDialogue: string;
  explanation: string;
} | null>(null);
/** 当前场景插画描述 */
const currentSceneDesc = ref<string>('');
/** 是否正在播放对话 */
const isPlayingDialogue = ref(false);
/** 是否正在显示反馈 */
const isShowingFeedback = ref(false);
/** 游戏是否已结束 */
const isGameEnded = ref(false);
/** 结局信息 */
const endingInfo = ref<{
  title: string;
  description: string;
  type: string;
  score: number;
  weights: { health: number; mood: number; independence: number; trust: number };
} | null>(null);

// UI 反馈事件（供组件订阅）
const pendingAttributeEffects = ref<AttributeEffect[]>([]);
const pendingUnlockEvent = ref<{ kind: 'diary' | 'album'; text: string } | null>(null);
const pendingDaySummary = ref<{ day: number; effects: AttributeEffect[]; spiritDelta: number } | null>(null);
const pendingActTransition = ref<{ act: number } | null>(null);
const pendingEndingMontage = ref<{ texts: Array<{ day: number; text: string }> } | null>(null);

// Promise resolve 函数持有
let resolveDialogueAdvance: (() => void) | null = null;
let resolveChoiceRequired: ((choice: Choice) => void) | null = null;
let resolveShowFeedback: (() => void) | null = null;

/**
 * 游戏控制器
 */
export function useGameController() {
  const gameStore = useGameStore();
  const storyStore = useStoryStore();
  const attributeStore = useAttributeStore();
  const propStore = usePropStore();
  const skillStore = useSkillStore();
  const saveStore = useSaveStore();

  let engine: StoryEngine | null = null;
  // 记录每日属性变化，用于 dailySummary
  let dailyEffects: AttributeEffect[] = [];
  let dailySpiritDelta = 0;

  /**
   * 初始化并开始游戏
   */
  async function startGame(character: CharacterConfig): Promise<void> {
    // 重置状态
    resetState();
    dailyEffects = [];
    dailySpiritDelta = 0;

    // 设置角色
    gameStore.setCharacter(character);
    gameStore.setGamePhase('playing');

    // 初始化属性
    attributeStore.initAttributes(
      character.baseAttributes,
      character.tensionRules ?? []
    );

    // 加载道具数据
    const propData = await loadPropData(character.id);
    if (propData.length > 0) {
      propStore.loadProps(propData);
      __DEV__ && console.log(`[GameController] 加载道具: ${propData.length}个`);
    }

    // 加载技能树数据（全局，仅首次加载）
    if (!skillStore.skillTree) {
      const skillTreeData = await loadSkillTreeData();
      if (skillTreeData) {
        skillStore.loadSkillTree(skillTreeData);
        __DEV__ && console.log('[GameController] 技能树已加载');
      }
    }

    // 预加载日记/相册名称映射
    await preloadUnlockNames(character.id);

    // 获取引擎并设置回调
    engine = getStoryEngine();
    setupEngineCallbacks(engine);

    // 加载剧情数据
    await engine.loadStory(character);

    // 构造起始节点ID（约定格式：{前缀}_act1_d1_001）
    const prefix = character.id.split('_')[0];
    const startNodeId = `${prefix}_act1_d1_001`;

    // 开始剧情
    await engine.enterNode(startNodeId);
  }

  /**
   * 预加载日记/相册名称（用于 Toast 显示）
   */
  const diaryNameMap = new Map<string, string>();
  const albumNameMap = new Map<string, string>();

  async function preloadUnlockNames(characterId: string) {
    try {
      const prefix = characterId.split('_')[0];
      const [diaries, albums] = await Promise.all([
        loadDiaryData(characterId),
        loadAlbumData(characterId),
      ]);
      for (const d of diaries) {
        diaryNameMap.set(d.id, d.title);
      }
      for (const a of albums) {
        albumNameMap.set(a.id, a.title);
      }
    } catch (e) {
      __DEV__ && console.warn('[GameController] 预加载名称失败', e);
    }
  }

  /**
   * 设置引擎回调
   */
  function setupEngineCallbacks(eng: StoryEngine): void {
    // 绑定条件求值器的属性/Flag获取器
    eng.bindConditionEvaluators({
      getAttributeValue: (attr: string) => attributeStore.attributes[attr as keyof typeof attributeStore.attributes] ?? 0,
      getFlagValue: (flag: string) => gameStore.getFlag(flag) ?? false,
    });

    eng.setCallbacks({
      // 对话播放
      onDialogueAdvance: (dialogue: Dialogue, _index: number) => {
        return new Promise<void>((resolve) => {
          currentDialogue.value = dialogue;
          isPlayingDialogue.value = true;
          resolveDialogueAdvance = resolve;
        });
      },

      // 需要玩家选择
      onChoiceRequired: (choices: Choice[]) => {
        return new Promise<Choice>((resolve) => {
          currentChoices.value = choices;
          storyStore.setWaitingForChoice(true);
          resolveChoiceRequired = resolve;
        });
      },

      // 显示反馈
      onShowFeedback: (feedback: {
        type: string;
        spiritDialogue: string;
        explanation: string;
      }) => {
        return new Promise<void>((resolve) => {
          currentFeedback.value = feedback;
          isShowingFeedback.value = true;
          resolveShowFeedback = resolve;
        });
      },

      // 节点进入
      onNodeEnter: (node: StoryNode) => {
        storyStore.setCurrentNode(node);

        // 更新 Day/Act
        if (node.day && node.day !== gameStore.currentDay) {
          gameStore.setCurrentDay(node.day);
        }
        if (node.act && node.act !== gameStore.currentAct) {
          const prevAct = gameStore.currentAct;
          gameStore.setCurrentAct(node.act);
          // 如果进入了新幕（非第一天第一幕），触发幕间过渡
          if (node.act > prevAct && node.day && node.day > 1) {
            pendingActTransition.value = { act: node.act };
            setTimeout(() => { pendingActTransition.value = null; }, 100);
          }
        }

        // 更新场景描述
        if (node.scene) {
          currentSceneDesc.value = node.scene;
        }

        // dayEnd 节点
        if (node.type === 'dayEnd') {
          handleDayEnd(node);
        }

        // ending 节点
        if (node.type === 'ending') {
          handleEnding(node);
        }
      },

      // 属性变化
      onAttributeEffect: (effects) => {
        const typedEffects = effects as AttributeEffect[];
        attributeStore.applyEffects(typedEffects);
        // 累积到每日记录
        for (const e of typedEffects) {
          dailyEffects.push({ ...e });
        }
        // 触发飘字动画
        pendingAttributeEffects.value = [...typedEffects];
        setTimeout(() => { pendingAttributeEffects.value = []; }, 100);
      },

      // 魔力变化
      onSpiritPowerChange: (delta: number) => {
        attributeStore.modifySpiritPower(delta);
        dailySpiritDelta += delta;
      },

      // 检查点存档
      onCheckpoint: (nodeId: string) => {
        saveStore.createCheckpoint(nodeId);
      },

      // 解锁内容
      onUnlock: (unlock: ChoiceUnlock) => {
        storyStore.processUnlocks(unlock);
        // 触发 Toast 通知
        if (unlock.diaryEntryId) {
          const name = diaryNameMap.get(unlock.diaryEntryId) || '新日记';
          pendingUnlockEvent.value = { kind: 'diary', text: name };
          setTimeout(() => { pendingUnlockEvent.value = null; }, 100);
        } else if (unlock.albumEntryId) {
          const name = albumNameMap.get(unlock.albumEntryId) || '新相册';
          pendingUnlockEvent.value = { kind: 'album', text: name };
          setTimeout(() => { pendingUnlockEvent.value = null; }, 100);
        }
      },
    });
  }

  /**
   * 推进对话（玩家点击继续）
   */
  function advanceDialogue(): void {
    if (resolveDialogueAdvance) {
      isPlayingDialogue.value = false;
      currentDialogue.value = null;
      const resolve = resolveDialogueAdvance;
      resolveDialogueAdvance = null;
      resolve();
    }
  }

  /**
   * 选择选项
   */
  function selectChoice(choice: Choice): void {
    currentChoices.value = [];
    storyStore.setWaitingForChoice(false);

    if (resolveChoiceRequired) {
      const resolve = resolveChoiceRequired;
      resolveChoiceRequired = null;
      resolve(choice);
    }
  }

  /**
   * 确认反馈（关闭反馈弹窗）
   */
  function dismissFeedback(): void {
    isShowingFeedback.value = false;
    currentFeedback.value = null;

    if (resolveShowFeedback) {
      const resolve = resolveShowFeedback;
      resolveShowFeedback = null;
      resolve();
    }
  }

  /**
   * 回溯到上一个选择点
   */
  function rollback(): void {
    saveStore.rollback();
  }

  /**
   * 处理一天结束 — 弹出每日小结
   */
  function handleDayEnd(node: StoryNode): void {
    // 应用每日衰减
    const character = gameStore.currentCharacter;
    if (character?.healthCondition?.dailyDecay) {
      attributeStore.applyDailyDecay(character.healthCondition.dailyDecay);
    }

    // 检查张力规则
    attributeStore.checkTensionRules();

    // 重置回合统计
    attributeStore.resetTurnStats();

    // 触发每日小结
    const dayNum = node.day ?? gameStore.currentDay;
    pendingDaySummary.value = {
      day: dayNum,
      effects: [...dailyEffects],
      spiritDelta: dailySpiritDelta,
    };
    // 重置每日累积
    dailyEffects = [];
    dailySpiritDelta = 0;

    // 自动存档
    saveStore.autoSave();
  }

  /**
   * 处理结局
   */
  function handleEnding(_node: StoryNode): void {
    isGameEnded.value = true;

    // 触发结局回忆蒙太奇
    pendingEndingMontage.value = {
      texts: [
        { day: 1, text: '初次相遇，一切从陌生开始' },
        { day: 10, text: '渐渐熟悉，学会了理解' },
        { day: 20, text: '面对挑战，依然选择守护' },
        { day: 30, text: '30天的陪伴，一段温暖的旅程' },
      ],
    };
    setTimeout(() => { pendingEndingMontage.value = null; }, 100);

    const attrs = attributeStore.attributes;
    const character = gameStore.currentCharacter;
    const weights = character?.endingWeights ?? {
      health: 0.25, mood: 0.25, independence: 0.25, trust: 0.25,
    };

    const weightedScore =
      attrs.health * weights.health +
      attrs.mood * weights.mood +
      attrs.independence * weights.independence +
      attrs.trust * weights.trust;

    let endingTitle = '反思空间';
    let endingDesc = '也许还有更好的方式，回溯试试看？';
    let endingType = 'reflection';

    const allHigh =
      attrs.health >= 65 && attrs.mood >= 65 &&
      attrs.independence >= 65 && attrs.trust >= 65;

    if (allHigh || weightedScore >= 65) {
      endingTitle = '温暖守护';
      endingDesc = `你找到了最好的照护方式：在身边，但不过度。${character?.nickname ?? ''}的脸上重新绽放了笑容。`;
      endingType = 'warm-guardian';
    } else if (weightedScore >= 50 || (attrs.mood >= 65 && attrs.trust >= 65)) {
      endingTitle = '深层理解';
      endingDesc = `有些事情比健康更重要，比如让${character?.nickname ?? '老人'}觉得自己还被人需要。你们的羁绊比药物更治愈。`;
      endingType = 'deep-understanding';
    } else if (weightedScore >= 35 || (attrs.independence >= 55 && attrs.trust >= 45)) {
      endingTitle = '成长之路';
      endingDesc = '你还在学习，但你愿意学习，这本身就是守护。每一次尝试都值得被看见。';
      endingType = 'growth-path';
    }

    endingInfo.value = {
      title: endingTitle,
      description: endingDesc,
      type: endingType,
      score: Math.round(weightedScore),
      weights,
    };

    gameStore.setGamePhase('ending');
  }

  /**
   * 重置状态
   */
  function resetState(): void {
    currentDialogue.value = null;
    currentChoices.value = [];
    currentFeedback.value = null;
    currentSceneDesc.value = '';
    isPlayingDialogue.value = false;
    isShowingFeedback.value = false;
    isGameEnded.value = false;
    endingInfo.value = null;
    pendingAttributeEffects.value = [];
    pendingUnlockEvent.value = null;
    pendingDaySummary.value = null;
    dailyEffects = [];
    dailySpiritDelta = 0;

    resolveDialogueAdvance = null;
    resolveChoiceRequired = null;
    resolveShowFeedback = null;

    storyStore.resetStory();
  }

  /**
   * 清理（完全退出游戏时调用）
   */
  function dispose(): void {
    destroyStoryEngine();
    resetState();
    engine = null;
  }

  /**
   * 暂停游戏（导航离开游戏页面时调用）
   * 不销毁引擎实例，保留 nodeCache 和游戏进度
   *
   * 策略：resolve 对话/反馈的 pending promise 让引擎可以推进到
   * 下一个交互节点（choice 或 ending），引擎会在 choice 节点自然停住。
   * 这样用户返回后不会看到"回到第一天"的问题。
   */
  function pause(): void {
    // resolve 对话和反馈的 pending promise（让引擎推进到下一个交互点）
    if (resolveDialogueAdvance) {
      resolveDialogueAdvance();
      resolveDialogueAdvance = null;
    }
    if (resolveShowFeedback) {
      resolveShowFeedback();
      resolveShowFeedback = null;
    }
    // choice 不能自动 resolve — 引擎会自然停在这里等待用户选择
    // resolveChoiceRequired 保留不清除，让引擎的 async 流程保持挂起

    // 清理 UI 状态
    isPlayingDialogue.value = false;
    isShowingFeedback.value = false;
    currentDialogue.value = null;
    currentFeedback.value = null;
    // currentChoices 保留不清除 — 如果引擎停在 choice 节点，用户返回后可以看到选项
  }

  /**
   * 恢复游戏（从相册/日记等页面返回时调用）
   * 不重置 gameStore，不重新加载剧情数据
   * 只重新获取引擎实例并绑定回调
   */
  function resumeGame(character: CharacterConfig): void {
    // 重置 UI 状态（保留 currentChoices — 如果引擎停在 choice 节点，返回后仍可见选项）
    isPlayingDialogue.value = false;
    isShowingFeedback.value = false;
    currentDialogue.value = null;
    // currentChoices 保留不清除
    currentFeedback.value = null;
    dailyEffects = [];
    dailySpiritDelta = 0;

    // 重新获取引擎实例（引擎可能在上次 pause 时被保留）
    engine = getStoryEngine();

    // 重新绑定回调
    setupEngineCallbacks(engine);

    __DEV__ && console.log('[GameController] 恢复游戏，当前 day=' + gameStore.currentDay + ' act=' + gameStore.currentAct);
  }

  /**
   * 通知引擎 UI 过渡已完成（每日小结/幕间过渡关闭后调用）
   */
  function resumeFromTransition(): void {
    engine?.resumeFromTransition();
  }

  return {
    // 状态
    currentDialogue,
    currentChoices,
    currentFeedback,
    currentSceneDesc,
    isPlayingDialogue,
    isShowingFeedback,
    isGameEnded,
    endingInfo,

    // UI 反馈事件
    pendingAttributeEffects,
    pendingUnlockEvent,
    pendingDaySummary,
    pendingActTransition,
    pendingEndingMontage,

    // 方法
    startGame,
    advanceDialogue,
    selectChoice,
    dismissFeedback,
    rollback,
    dispose,
    pause,
    resumeGame,
    resumeFromTransition,
  };
}
