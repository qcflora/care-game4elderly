/**
 * 角色相关类型定义
 */
import type { AttributeState, AttributeTensionRule } from './attribute';

/**
 * 角色性别类型
 */
export type Gender = 'male' | 'female';

/**
 * 角色解锁条件类型
 */
export interface UnlockCondition {
  /** 依赖的角色ID */
  dependsOn: string;
  /** 依赖角色需要完成的Day数 */
  requiredDay: number;
  /** 需要达成的属性条件 */
  requiredAttributes?: Partial<AttributeState>;
  /** 需要解锁的技能 */
  requiredSkills?: string[];
}

/**
 * 角色健康条件描述
 */
export interface HealthCondition {
  /** 疾病名称 */
  disease: string;
  /** 严重程度 */
  severity: 'mild' | 'moderate' | 'severe';
  /** 需要的药物列表 */
  medications: string[];
  /** 特殊注意事项 */
  precautions: string[];
  /** 每日健康自然衰减值（疾病进展） */
  dailyDecay: number;
}

/**
 * 三幕剧情框架引用
 */
export interface StoryAct {
  /** 幕数 (1-3) */
  act: number;
  /** 起始Day */
  startDay: number;
  /** 结束Day */
  endDay: number;
  /** 该幕剧情数据文件路径 */
  storyFile: string;
  /** 幕标题 */
  title: string;
  /** 幕主题描述 */
  theme: string;
}

/**
 * 角色完整配置
 */
export interface CharacterConfig {
  /** 角色唯一ID */
  id: string;
  /** 角色全名 */
  name: string;
  /** 角色称呼（如"王奶奶"） */
  nickname: string;
  /** 年龄 */
  age: number;
  /** 性别 */
  gender: Gender;
  /** 头像图片路径 */
  avatar: string;
  /** 全身像图片路径 */
  portrait: string;
  /** 水彩插画基础路径 */
  watercolorBase: string;

  /** 角色背景故事 */
  background: string;
  /** 性格特征标签 */
  personality: string[];
  /** 家庭关系描述 */
  familyRelation: string;

  /** 健康条件 */
  healthCondition: HealthCondition;

  /** 初始属性 */
  baseAttributes: AttributeState;
  /** 角色专属属性张力规则 */
  tensionRules: AttributeTensionRule[];

  /** 三幕剧情配置 */
  storyActs: StoryAct[];

  /** 是否锁定（需解锁） */
  isLocked: boolean;
  /** 解锁条件（仅锁定角色） */
  unlockCondition?: UnlockCondition;

  /** 角色专属精灵外观配置 */
  spiritAppearance: {
    color: string;
    lottieAnimation: string;
    name: string;
  };

  /** 结局评价权重配置 */
  endingWeights: {
    health: number;
    mood: number;
    independence: number;
    trust: number;
  };
}
