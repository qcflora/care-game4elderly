/**
 * 日记/信件相关类型定义
 */

/**
 * 日记触发条件
 */
export interface DiaryTrigger {
  /** 触发类型 */
  type: 'day' | 'choice' | 'attribute' | 'flag';
  /** 触发值 */
  value: string | number;
  /** 比较运算符（仅 attribute 类型） */
  operator?: '>' | '<' | '>=' | '<=' | '==';
}

/**
 * 日记内容变体（根据玩家选择动态变化）
 */
export interface DiaryVariation {
  /** 变体触发条件表达式 */
  condition: string;
  /** 变体内容 */
  content: string;
  /** 变体心情标签 */
  mood?: string;
}

/**
 * 代际信件
 */
export interface Letter {
  /** 信件ID */
  id: string;
  /** 写信人 */
  from: string;
  /** 收信人 */
  to: string;
  /** 写信Day */
  day: number;
  /** 信件标题 */
  title: string;
  /** 信件内容 */
  content: string;
  /** 解锁条件 */
  unlockCondition: string;
  /** 是否已解锁 */
  isUnlocked: boolean;
  /** 信件类型 */
  type: 'elder_to_player' | 'player_to_elder' | 'spirit_to_player';
}

/**
 * 日记条目
 */
export interface DiaryEntry {
  /** 日记ID */
  id: string;
  /** 所属角色ID */
  characterId: string;
  /** 对应Day */
  day: number;
  /** 日期显示文本 */
  date: string;
  /** 日记标题 */
  title: string;

  /** 基础内容 */
  content: string;
  /** 心情标签 */
  mood: string;
  /** 天气（增加沉浸感） */
  weather?: string;

  /** 触发条件（满足后解锁该篇日记） */
  triggers: DiaryTrigger[];
  /** 是否已解锁 */
  isUnlocked: boolean;

  /** 内容变体（根据玩家行为动态变化） */
  variations?: DiaryVariation[];

  /** 关联的相册条目ID */
  relatedAlbumId?: string;
}
