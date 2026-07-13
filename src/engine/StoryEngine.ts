/**
 * 剧情节点调度引擎
 * 数据驱动模式：所有剧情内容以 JSON 文件存储，引擎代码只负责调度和状态管理
 */
import type { StoryNode, Choice, Dialogue, ChoiceUnlock, StoryActData } from '@/types/story';
import type { CharacterConfig } from '@/types/character';
import { ConditionEvaluator } from './ConditionEvaluator';

/**
 * StoryEngine 核心调度器
 * 负责：加载节点、执行对话序列、处理选择跳转、检查条件分支
 */

/** 所有剧情数据文件的懒加载映射（Vite 静态分析） */
const storyModules = import.meta.glob<{ default: StoryActData }>(
  '../data/stories/*/act*.json'
);

export class StoryEngine {
  private conditionEvaluator = new ConditionEvaluator();

  /** 已加载的节点缓存 { nodeId: StoryNode } */
  private nodeCache: Map<string, StoryNode> = new Map();

  /** 当前角色的全部剧情数据（按幕） */
  private storyData: Record<number, StoryActData> = {};

  /** 对话播放回调 */
  private onDialogueAdvance?: (dialogue: Dialogue, index: number) => Promise<void>;
  /** 选择等待回调 */
  private onChoiceRequired?: (choices: Choice[]) => Promise<Choice>;
  /** 反馈显示回调 */
  private onShowFeedback?: (feedback: { type: string; spiritDialogue: string; explanation: string }) => Promise<void>;
  /** 节点进入回调 */
  private onNodeEnter?: (node: StoryNode) => void;
  /** 属性变化回调 */
  private onAttributeEffect?: (effects: Array<{ type: string; delta: number; reason?: string }>) => void;
  /** 魔力变化回调 */
  private onSpiritPowerChange?: (delta: number) => void;
  /** 检查点回调 */
  private onCheckpoint?: (nodeId: string) => void;
  /** 解锁内容回调 */
  private onUnlock?: (unlocks: ChoiceUnlock) => void;

  /**
   * 绑定条件求值器的属性/Flag获取器
   */
  bindConditionEvaluators(getters: {
    getAttributeValue: (attr: string) => number;
    getFlagValue: (flag: string) => boolean;
  }) {
    this.conditionEvaluator.setAttributeValueGetter(getters.getAttributeValue);
    this.conditionEvaluator.setFlagValueGetter(getters.getFlagValue);
  }

  /**
   * 设置引擎回调
   */
  setCallbacks(callbacks: {
    onDialogueAdvance?: (dialogue: Dialogue, index: number) => Promise<void>;
    onChoiceRequired?: (choices: Choice[]) => Promise<Choice>;
    onShowFeedback?: (feedback: { type: string; spiritDialogue: string; explanation: string }) => Promise<void>;
    onNodeEnter?: (node: StoryNode) => void;
    onAttributeEffect?: (effects: Array<{ type: string; delta: number; reason?: string }>) => void;
    onSpiritPowerChange?: (delta: number) => void;
    onCheckpoint?: (nodeId: string) => void;
    onUnlock?: (unlocks: ChoiceUnlock) => void;
  }) {
    this.onDialogueAdvance = callbacks.onDialogueAdvance;
    this.onChoiceRequired = callbacks.onChoiceRequired;
    this.onShowFeedback = callbacks.onShowFeedback;
    this.onNodeEnter = callbacks.onNodeEnter;
    this.onAttributeEffect = callbacks.onAttributeEffect;
    this.onSpiritPowerChange = callbacks.onSpiritPowerChange;
    this.onCheckpoint = callbacks.onCheckpoint;
    this.onUnlock = callbacks.onUnlock;
  }

  /**
   * 加载角色剧情数据
   */
  async loadStory(characterConfig: CharacterConfig): Promise<void> {
    this.storyData = {};
    this.nodeCache.clear();

    for (const act of characterConfig.storyActs) {
      try {
        // 使用 import.meta.glob 懒加载剧情文件
        const modulePath = `../data/stories/${characterConfig.id}/act${act.act}.json`;
        const loader = storyModules[modulePath];
        if (!loader) {
          console.error(`[StoryEngine] 找不到剧情文件: ${modulePath}`);
          continue;
        }
        const data = await loader();
        const storyContent: StoryActData = data.default || data;
        this.storyData[act.act] = storyContent;

        // 缓存所有节点
        for (const node of storyContent.nodes) {
          this.nodeCache.set(node.id, node);
        }
        console.log(`[StoryEngine] 加载第${act.act}幕: ${storyContent.nodes.length}个节点`);
      } catch (error) {
        console.error(`[StoryEngine] 加载第${act.act}幕失败:`, error);
      }
    }
  }

  /**
   * 手动注册节点数据（用于动态加载的场景）
   */
  registerNodes(nodes: StoryNode[]): void {
    for (const node of nodes) {
      this.nodeCache.set(node.id, node);
    }
  }

  /**
   * 获取指定节点
   */
  getNode(nodeId: string): StoryNode | undefined {
    return this.nodeCache.get(nodeId);
  }

  /**
   * 进入节点 - 核心调度方法
   */
  async enterNode(nodeId: string): Promise<void> {
    const node = this.getNode(nodeId);
    if (!node) {
      console.error(`[StoryEngine] 节点不存在: ${nodeId}`);
      return;
    }

    // 检查节点条件
    if (node.condition && !this.conditionEvaluator.evaluate(node.condition)) {
      // 条件不满足，跳到下一个节点
      if (node.nextNode) {
        await this.enterNode(node.nextNode);
      }
      return;
    }

    // 触发节点进入回调
    this.onNodeEnter?.(node);

    // 检查点：自动存档
    if (node.isCheckpoint) {
      this.onCheckpoint?.(nodeId);
    }

    // 应用节点直接效果（叙事节点的属性变化）
    if (node.attributeEffects && node.attributeEffects.length > 0) {
      this.onAttributeEffect?.(node.attributeEffects);
    }

    // 应用魔力变化
    if (node.spiritPowerChange) {
      this.onSpiritPowerChange?.(node.spiritPowerChange);
    }

    // 解锁内容
    if (node.unlocks) {
      for (const unlock of node.unlocks) {
        this.onUnlock?.(unlock);
      }
    }

    // 开始播放对话序列
    await this.playDialogues(node.dialogues);

    // 根据节点类型处理后续
    await this.handleNodeType(node);
  }

  /**
   * 处理玩家选择
   */
  async handleChoice(choice: Choice): Promise<void> {
    // 应用属性效果
    if (choice.effects && choice.effects.length > 0) {
      this.onAttributeEffect?.(choice.effects);
    }

    // 应用魔力变化
    if (choice.spiritPowerChange) {
      this.onSpiritPowerChange?.(choice.spiritPowerChange);
    }

    // 显示反馈
    if (choice.feedback) {
      await this.onShowFeedback?.({
        type: choice.feedback.type,
        spiritDialogue: choice.feedback.spiritDialogue,
        explanation: choice.feedback.explanation,
      });
    }

    // 解锁内容
    if (choice.unlocks) {
      const unlockList = Array.isArray(choice.unlocks) ? choice.unlocks : [choice.unlocks];
      for (const unlock of unlockList) {
        this.onUnlock?.(unlock);
      }
    }

    // 节点跳转
    const nextNodeId = this.resolveNextNode(choice);
    if (nextNodeId) {
      await this.enterNode(nextNodeId);
    }
  }

  /**
   * 解析下一个节点ID
   * 优先级：conditionalJump > nextNode
   */
  private resolveNextNode(choice: Choice): string | undefined {
    // 优先条件跳转
    if (choice.conditionalJump) {
      const { expression, trueNode, falseNode } = choice.conditionalJump;
      const result = this.conditionEvaluator.evaluate(expression);
      return result ? trueNode : falseNode;
    }
    // 固定跳转
    return choice.nextNode;
  }

  /**
   * 根据节点类型处理后续逻辑
   */
  private async handleNodeType(node: StoryNode): Promise<void> {
    switch (node.type) {
      case 'narrative':
      case 'dialogue':
        // 叙事/对话节点：对话播放完毕后自动跳转
        if (node.nextNode) {
          await this.enterNode(node.nextNode);
        }
        break;

      case 'choice':
        // 选择节点：等待玩家选择
        if (node.choices && node.choices.length > 0) {
          const selected = await this.onChoiceRequired?.(node.choices);
          if (selected) {
            await this.handleChoice(selected);
          }
        }
        break;

      case 'event':
        // 事件节点：触发风险事件处理
        console.log(`[StoryEngine] 事件节点: ${node.id}`);
        if (node.nextNode) {
          await this.enterNode(node.nextNode);
        }
        break;

      case 'tutorial':
        // 教学节点：引导操作
        console.log(`[StoryEngine] 教学节点: ${node.id}`);
        if (node.nextNode) {
          await this.enterNode(node.nextNode);
        }
        break;

      case 'checkpoint':
        // 检查点节点
        this.onCheckpoint?.(node.id);
        if (node.nextNode) {
          await this.enterNode(node.nextNode);
        }
        break;

      case 'dayEnd':
        // 一天结束：结算 + 存档（后续流程由节点 nextNode 驱动）
        console.log(`[StoryEngine] Day End: Day ${node.day}`);
        if (node.nextNode) {
          await this.enterNode(node.nextNode);
        } else {
          // 自动推导下一天的开头节点：当前id中 day+1, seq=001
          const nextDayNodeId = this.inferNextDayNodeId(node.id);
          if (nextDayNodeId && this.getNode(nextDayNodeId)) {
            await this.enterNode(nextDayNodeId);
          }
        }
        break;

      case 'actEnd':
        // 一幕结束，过渡到下一幕
        console.log(`[StoryEngine] Act End: Act ${node.act}`);
        if (node.nextNode) {
          await this.enterNode(node.nextNode);
        } else {
          // 自动推导下一幕的开头节点
          const nextActNodeId = this.inferNextActNodeId(node.id);
          if (nextActNodeId && this.getNode(nextActNodeId)) {
            await this.enterNode(nextActNodeId);
          } else {
            console.warn(`[StoryEngine] actEnd 无法推导下一幕节点: ${node.id}`);
          }
        }
        break;

      case 'ending':
        // 结局
        console.log(`[StoryEngine] Ending: ${node.id}`);
        break;
    }
  }

  /**
   * 播放对话序列
   */
  private async playDialogues(dialogues: Dialogue[]): Promise<void> {
    for (let i = 0; i < dialogues.length; i++) {
      const dialogue = dialogues[i];
      await this.onDialogueAdvance?.(dialogue, i);
    }
  }

  /**
   * 清理引擎状态
   */
  dispose(): void {
    this.nodeCache.clear();
    this.storyData = {};
    this.onDialogueAdvance = undefined;
    this.onChoiceRequired = undefined;
    this.onShowFeedback = undefined;
    this.onNodeEnter = undefined;
    this.onAttributeEffect = undefined;
    this.onSpiritPowerChange = undefined;
    this.onCheckpoint = undefined;
    this.onUnlock = undefined;
  }

  /**
   * 根据 dayEnd 节点ID推导下一天的开头节点ID
   * 例如 wang_act1_d1_003 → wang_act1_d2_001
   */
  private inferNextDayNodeId(currentNodeId: string): string | null {
    const match = currentNodeId.match(/^(.+)_act(\d+)_d(\d+)_(\d+)$/);
    if (!match) return null;
    const prefix = match[1];
    const act = parseInt(match[2]);
    const day = parseInt(match[3]);

    // 先尝试 day+1, seq=001
    const directNext = `${prefix}_act${act}_d${day + 1}_001`;
    if (this.getNode(directNext)) return directNext;

    // Fallback: 在 nodeCache 中搜索同幕内 day > 当前 day 的第一个节点
    let bestId: string | null = null;
    let bestDay = Infinity;
    for (const [id, _node] of this.nodeCache.entries()) {
      const m = id.match(/^(.+)_act(\d+)_d(\d+)_(\d+)$/);
      if (m && m[1] === prefix && parseInt(m[2]) === act) {
        const d = parseInt(m[3]);
        if (d > day && d < bestDay) {
          bestDay = d;
          bestId = id;
        }
      }
    }
    return bestId;
  }

  /**
   * 根据 actEnd 节点ID推导下一幕的开头节点ID
   * 推导策略：找到下一幕（act+1）的第一个节点
   * 如果无法从当前ID推导，则在 nodeCache 中搜索 act+1 的第一个节点
   */
  private inferNextActNodeId(currentNodeId: string): string | null {
    // 先尝试从当前ID推导
    const match = currentNodeId.match(/^(.+)_act(\d+)_d(\d+)_(\d+)$/);
    if (match) {
      const prefix = match[1];
      const currentAct = parseInt(match[2]);
      const nextAct = currentAct + 1;
      // 在 nodeCache 中搜索下一幕的第一个节点
      let bestId: string | null = null;
      let bestDay = Infinity;
      for (const [id, node] of this.nodeCache.entries()) {
        const nodeMatch = id.match(/^(.+)_act(\d+)_d(\d+)_(\d+)$/);
        if (nodeMatch && nodeMatch[1] === prefix && parseInt(nodeMatch[2]) === nextAct) {
          const day = parseInt(nodeMatch[3]);
          if (day < bestDay) {
            bestDay = day;
            bestId = id;
          }
        }
      }
      return bestId;
    }
    return null;
  }
}

/** 全局引擎单例 */
let engineInstance: StoryEngine | null = null;

export function getStoryEngine(): StoryEngine {
  if (!engineInstance) {
    engineInstance = new StoryEngine();
  }
  return engineInstance;
}

export function destroyStoryEngine(): void {
  if (engineInstance) {
    engineInstance.dispose();
    engineInstance = null;
  }
}
