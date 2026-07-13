/**
 * 事件相关类型定义
 */
import type { AttributeEffect } from './attribute';

/**
 * 随机风险事件类型
 */
export type RiskEventType =
  | 'fall'           // 跌倒
  | 'illness'        // 突发病症
  | 'loneliness'     // 孤独
  | 'forget_meds'    // 忘记吃药
  | 'scam'           // 诈骗
  | 'depression';    // 情绪低落

/**
 * 随机风险事件
 */
export interface RiskEvent {
  /** 事件ID */
  id: string;
  /** 事件类型 */
  type: RiskEventType;
  /** 事件标题 */
  title: string;
  /** 事件描述文本 */
  description: string;
  /** 事件严重程度 */
  severity: 'low' | 'medium' | 'high';
  /** 触发条件表达式（属性/flag/Day） */
  triggerCondition: string;
  /** 触发概率 (0-1) */
  triggerProbability: number;
  /** 事件未被抵消时的属性惩罚 */
  penaltyEffects: AttributeEffect[];
  /** 抵消所需魔力值 */
  defendPowerCost: number;
  /** 抵消成功时的对话 */
  defendDialogue: string;
  /** 抵消失败时的对话 */
  failDialogue: string;
  /** 事件节点ID（跳转到此节点处理事件） */
  eventNodeId: string;
  /** 所属角色ID（空为通用事件） */
  characterId?: string;
  /** 可出现的Day范围 */
  dayRange?: {
    min: number;
    max: number;
  };
}
