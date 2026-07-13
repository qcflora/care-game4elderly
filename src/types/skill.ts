/**
 * 技能树相关类型定义
 */

/**
 * 五系技能分类
 */
export type SkillCategoryType =
  | 'basic_care'      // 基础照护
  | 'medication'      // 用药管理
  | 'emergency'       // 应急处理
  | 'psychological'   // 心理支持
  | 'resource';       // 资源协调

/**
 * 单个技能节点
 */
export interface Skill {
  /** 技能唯一ID */
  id: string;
  /** 技能名称 */
  name: string;
  /** 技能描述 */
  description: string;
  /** 技能图标 */
  icon: string;

  /** 当前等级 (0=未学习) */
  level: number;
  /** 最大等级 */
  maxLevel: number;

  /** 升级所需技能点（每级） */
  costPerLevel: number;

  /** 前置技能ID列表（需要先学习） */
  prerequisites: string[];

  /** 技能效果描述（随等级变化） */
  effects: SkillEffect[];

  /** 技能解锁的剧情分支或选项 */
  unlocksChoices?: string[];
}

/**
 * 技能效果
 */
export interface SkillEffect {
  /** 效果等级（该效果在第几级激活） */
  level: number;
  /** 效果类型 */
  type: 'attribute_buff' | 'spirit_power_buff' | 'unlock_choice' | 'reduce_decay';
  /** 效果目标 */
  target?: string;
  /** 效果数值 */
  value?: number;
  /** 效果描述 */
  description: string;
}

/**
 * 技能分类（一系）
 */
export interface SkillCategory {
  /** 分类ID */
  id: SkillCategoryType;
  /** 分类名称 */
  name: string;
  /** 分类图标 */
  icon: string;
  /** 分类主题色 */
  color: string;
  /** 该系下所有技能 */
  skills: Skill[];
}

/**
 * 完整技能树
 */
export interface SkillTree {
  /** 技能树版本 */
  version: string;
  /** 五系技能分类 */
  categories: SkillCategory[];
  /** 可用技能点初始值 */
  initialPoints: number;
  /** 每Day获得的技能点 */
  pointsPerDay: number;
}
