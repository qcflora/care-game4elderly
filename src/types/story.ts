/**
 * 剧情/对话/选项相关类型定义
 */
import type { AttributeEffect } from './attribute';

/**
 * 说话者类型
 */
export type SpeakerType = 'spirit' | 'elder' | 'narrator' | 'system';

/**
 * 文本分层类型
 * - essential: 必读信息（核心叙事）
 * - emotional: 情感信息（可选阅读，丰富体验）
 */
export type TextLayer = 'essential' | 'emotional';

/**
 * 单条对话
 */
export interface Dialogue {
  /** 对话唯一ID */
  id: string;
  /** 说话者类型 */
  speaker: SpeakerType;
  /** 说话者显示名 */
  speakerName: string;
  /** 对话文本内容 */
  text: string;
  /** 文本分层：必读 or 情感可选 */
  layer: TextLayer;

  /** 说话者情绪状态（影响头像表情） */
  emotion?: string;
  /** 对应插画ID（若该对话需要切换插画） */
  illustrationId?: string;
  /** Lottie动画文件名（说话时播放） */
  lottieAnimation?: string;

  /** 语音音频路径（可选） */
  voiceOver?: string;
  /** 预计阅读时长（毫秒），用于自动推进 */
  duration?: number;

  /** 打字机效果速度（字/秒），0为瞬间显示 */
  typingSpeed?: number;

  /** 是否需要用户点击继续（默认true） */
  requireTapToContinue?: boolean;
}

/**
 * 选项验证反馈类型
 */
export type FeedbackType = 'correct' | 'incorrect' | 'neutral';

/**
 * 选项验证反馈
 */
export interface ChoiceFeedback {
  /** 反馈类型 */
  type: FeedbackType;
  /** 精灵的反馈台词 */
  spiritDialogue: string;
  /** 详细解释 */
  explanation: string;
}

/**
 * 选项解锁内容
 */
export interface ChoiceUnlock {
  /** 解锁的相册条目ID */
  albumEntryId?: string;
  /** 解锁的日记条目ID */
  diaryEntryId?: string;
  /** 解锁的道具ID */
  propId?: string;
  /** 设置的全局flag */
  flag?: string;
}

/**
 * 选项所需技能检查
 */
export interface SkillCheck {
  /** 所需技能ID */
  skillId: string;
  /** 所需技能等级 */
  requiredLevel: number;
  /** 技能检查失败时的提示 */
  failureMessage?: string;
  /** 技能检查失败时是否禁用选项 */
  disableOnFail?: boolean;
}

/**
 * 跳转条件
 * 满足条件时跳转到指定节点，否则跳到falseNode
 */
export interface ChoiceCondition {
  /** 条件表达式（由ConditionEvaluator解析） */
  expression: string;
  /** 满足条件时跳转的节点ID */
  trueNode: string;
  /** 不满足条件时跳转的节点ID */
  falseNode: string;
}

/**
 * 决策选项
 */
export interface Choice {
  /** 选项唯一ID */
  id: string;
  /** 选项显示文本 */
  text: string;
  /** 选项辅助描述（显示在按钮下方，可选） */
  description?: string;
  /** 选项图标（可选） */
  icon?: string;

  /** 是否为正确决策（影响魔力充能） */
  isCorrect?: boolean;

  /** 属性变化效果列表 */
  effects: AttributeEffect[];
  /** 精灵魔力变化（正为充能，负为消耗） */
  spiritPowerChange?: number;

  /** 所需技能检查（可选） */
  skillCheck?: SkillCheck;

  /** 跳转目标节点ID */
  nextNode?: string;
  /** 条件跳转（优先于nextNode，实现属性差异化分支） */
  conditionalJump?: ChoiceCondition;

  /** 验证反馈（选择后展示） */
  feedback?: ChoiceFeedback;
  /** 解锁的内容 */
  unlocks?: ChoiceUnlock[];

  /** 是否禁用（条件不满足时） */
  disabled?: boolean;
  /** 禁用原因提示 */
  disabledReason?: string;
}

/**
 * 节点类型
 */
export type NodeType =
  | 'narrative'    // 纯叙事（旁白+插画，无选择）
  | 'dialogue'     // 对话节点（精灵/老人对话）
  | 'choice'       // 选择节点（含决策选项）
  | 'event'        // 事件节点（风险事件/随机事件）
  | 'tutorial'     // 教学节点（引导操作）
  | 'checkpoint'   // 检查点（自动存档点）
  | 'dayEnd'       // 一天结束（结算+存档）
  | 'actEnd'       // 一幕结束（过场动画）
  | 'ending';      // 结局节点

/**
 * 节点入场/出场动画配置
 */
export interface NodeTransition {
  /** 入场动画名称 */
  enter?: string;
  /** 出场动画名称 */
  exit?: string;
  /** 插画切换动画 */
  illustrationTransition?: 'fade' | 'slide' | 'zoom' | 'watercolor';
  /** 动画时长（毫秒） */
  duration?: number;
}

/**
 * 节点显示的道具引用
 */
export interface NodeProp {
  /** 道具ID */
  propId: string;
  /** 道具展示层级 */
  layer: 'display' | 'inspect' | 'operate';
  /** 是否强制弹出展示 */
  autoShow?: boolean;
}

/**
 * 剧情节点
 * 数据驱动的核心单元，每个节点代表一个剧情交互片段
 */
export interface StoryNode {
  /** 节点唯一ID（格式：角色ID_幕_日期_序号，如 wang_act1_d1_001） */
  id: string;
  /** 所属角色ID */
  characterId: string;
  /** 所属幕数 (1-3) */
  act: number;
  /** 所属Day (1-30) */
  day: number;
  /** 节点类型 */
  type: NodeType;

  /** 场景背景ID */
  scene: string;
  /** 插画资源ID */
  illustrationId: string;

  /** 对话序列（按顺序播放） */
  dialogues: Dialogue[];

  /** 决策选项列表（仅 choice 类型节点） */
  choices?: Choice[];

  /** 需要显示的道具 */
  props?: NodeProp[];

  /** 节点直接属性效果（叙事节点自动应用，非选择触发） */
  attributeEffects?: AttributeEffect[];
  /** 节点直接魔力变化 */
  spiritPowerChange?: number;

  /** 默认跳转的下一个节点ID */
  nextNode?: string;

  /** 过渡动画配置 */
  transition?: NodeTransition;

  /** 节点触发条件（条件不满足则跳过此节点） */
  condition?: string;

  /** 是否为检查点（到达时自动存档） */
  isCheckpoint?: boolean;

  /** 节点解锁内容 */
  unlocks?: ChoiceUnlock[];

  /** 节点标签（用于搜索和调试） */
  tags?: string[];

  /** 开发备注（不显示给玩家） */
  devNote?: string;
}

/**
 * 剧情幕数据文件结构
 */
export interface StoryActData {
  /** 角色ID */
  characterId: string;
  /** 幕数 */
  act: number;
  /** 幕标题 */
  title: string;
  /** 幕主题 */
  theme: string;
  /** 起始Day */
  startDay: number;
  /** 结束Day */
  endDay: number;
  /** 所有剧情节点 */
  nodes: StoryNode[];
}
