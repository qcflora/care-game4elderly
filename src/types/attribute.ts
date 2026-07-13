/**
 * 属性相关类型定义
 * 包含四维属性（健康、心情、独立、信任）和精灵魔力状态
 */

/**
 * 四维属性枚举
 */
export const AttributeType = {
  HEALTH: 'health',            // 健康值
  MOOD: 'mood',                // 心情值
  INDEPENDENCE: 'independence', // 独立值
  TRUST: 'trust',              // 信任值
} as const;

export type AttributeType = typeof AttributeType[keyof typeof AttributeType];

/**
 * 四维属性状态（每个属性 0-100）
 * 属性间存在张力关系：
 * - 健康值 vs 独立值：过度照顾提升健康但降低独立
 * - 心情值 vs 信任值：善意的谎言提升心情但可能降低信任
 * - 独立值 vs 健康值：鼓励自理提升独立但可能影响健康
 */
export interface AttributeState {
  /** 健康值 (0-100)：老人的身体健康程度 */
  health: number;
  /** 心情值 (0-100)：老人的情绪状态 */
  mood: number;
  /** 独立值 (0-100)：老人的自理能力 */
  independence: number;
  /** 信任值 (0-100)：老人对玩家的信任程度 */
  trust: number;
}

/**
 * 属性变化效果
 */
export interface AttributeEffect {
  /** 目标属性 */
  type: AttributeType;
  /** 变化值（正为增加，负为减少） */
  delta: number;
  /** 变化原因（用于日志和反馈） */
  reason?: string;
}

/**
 * 属性张力规则定义
 * 当某属性超过阈值时，对其他属性产生连锁影响
 */
export interface AttributeTensionRule {
  /** 触发属性 */
  source: AttributeType;
  /** 触发阈值 */
  threshold: number;
  /** 比较运算符 */
  operator: '>' | '<' | '>=' | '<=';
  /** 受影响的属性 */
  target: AttributeType;
  /** 每回合影响值 */
  perTurnDelta: number;
  /** 规则描述 */
  description: string;
}

/**
 * 精灵魔力状态
 */
export interface SpiritPowerState {
  /** 当前魔力值 (0-100) */
  current: number;
  /** 最大魔力值 */
  max: number;
  /** 本回合已消耗 */
  consumedThisTurn: number;
  /** 本回合已充能 */
  chargedThisTurn: number;
}
