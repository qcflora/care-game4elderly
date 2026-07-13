/**
 * 存档相关类型定义
 */
import type { AttributeState, SpiritPowerState } from './attribute';

/**
 * 决策记录（用于回溯和日记动态生成）
 */
export interface DecisionRecord {
  /** 决策所在节点ID */
  nodeId: string;
  /** 选择的选项ID */
  choiceId: string;
  /** 选择的选项文本（冗余存储，方便回溯展示） */
  choiceText: string;
  /** 决策时的Day */
  day: number;
  /** 决策时间戳 */
  timestamp: number;
  /** 决策导致的属性变化快照 */
  attributeSnapshot: AttributeState;
  /** 该决策是否正确选择 (可选，旧存档可能无此字段) */
  isCorrect?: boolean;
}

/**
 * 检查点（用于精灵回溯重试）
 */
export interface Checkpoint {
  /** 检查点ID */
  id: string;
  /** 节点ID */
  nodeId: string;
  /** Day */
  day: number;
  /** 保存时间戳 */
  timestamp: number;
  /** 属性快照 */
  attributes: AttributeState;
  /** 魔力快照 */
  spiritPower: SpiritPowerState;
  /** 技能快照 */
  skills: Record<string, number>;
  /** 全局flags快照 */
  flags: Record<string, boolean>;
  /** 已解锁内容快照 */
  unlockedContent: string[];
}

/**
 * 完整存档数据
 */
export interface SaveData {
  // === 元信息 ===
  /** 存档版本号（用于数据迁移） */
  version: string;
  /** 存档时间戳 */
  saveTime: number;
  /** 游戏总版本号 */
  gameVersion: string;

  // === 游戏进度 ===
  /** 当前角色ID */
  characterId: string;
  /** 当前Day (1-30) */
  currentDay: number;
  /** 当前幕数 (1-3) */
  currentAct: number;
  /** 当前剧情节点ID */
  currentNodeId: string;
  /** 当前对话进度（对话队列中的索引） */
  currentDialogueIndex: number;

  // === 属性状态 ===
  /** 四维属性 */
  attributes: AttributeState;
  /** 精灵魔力状态 */
  spiritPower: SpiritPowerState;

  // === 技能状态 ===
  /** 已学技能 { skillId: level } */
  skills: Record<string, number>;
  /** 可用技能点 */
  availableSkillPoints: number;

  // === 道具状态 ===
  /** 已解锁的道具ID列表 */
  unlockedProps: string[];
  /** 已收集的道具ID列表（进入道具栏） */
  collectedProps: string[];
  /** 道具隐藏信息发现记录 { propId: [hiddenInfoId, ...] } */
  discoveredHiddenInfo: Record<string, string[]>;

  // === 收集状态 ===
  /** 已解锁的相册条目ID列表 */
  albumEntries: string[];
  /** 已解锁的日记条目ID列表 */
  diaryEntries: string[];
  /** 已解锁的信件ID列表 */
  letters: string[];

  // === 剧情历史 ===
  /** 已访问的节点ID列表（按顺序） */
  storyHistory: string[];
  /** 决策历史记录 */
  decisionHistory: DecisionRecord[];

  // === 检查点 ===
  /** 检查点列表 */
  checkpoints: Checkpoint[];
  /** 当前可回溯的检查点索引 */
  currentCheckpointIndex: number;

  // === 全局状态 ===
  /** 全局flag标记 */
  flags: Record<string, boolean>;
  /** 伏笔系统状态 */
  foreshadowing: Record<string, {
    planted: boolean;
    revealed: boolean;
    plantedDay: number;
  }>;

  // === 统计 ===
  /** 总游戏时长（秒） */
  totalPlayTime: number;
  /** 正确决策次数 */
  correctDecisions: number;
  /** 总决策次数 */
  totalDecisions: number;
  /** 回溯次数 */
  rollbackCount: number;
}

/**
 * 多角色存档管理结构
 * 每个角色独立一份存档
 */
export interface SaveManager {
  /** 全局设置 */
  settings: GameSettings;
  /** 各角色存档 { characterId: SaveData } */
  saves: Record<string, SaveData>;
  /** 全局解锁状态（跨角色） */
  globalUnlocks: {
    unlockedCharacters: string[];
    completedCharacters: string[];
  };
}

/**
 * 游戏设置
 */
export interface GameSettings {
  /** 打字机速度 */
  typingSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  /** 是否自动播放对话 */
  autoPlay: boolean;
  /** 音效音量 (0-1) */
  sfxVolume: number;
  /** 背景音乐音量 (0-1) */
  bgmVolume: number;
  /** 是否已查看新手引导 */
  hasSeenTutorial: boolean;
}
