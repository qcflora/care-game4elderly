/**
 * 道具相关类型定义
 */
import type { AttributeEffect } from './attribute';

/**
 * 道具互动层级
 */
export type PropLayer = 'display' | 'inspect' | 'operate';

/**
 * 检视型道具的隐藏信息
 */
export interface PropHiddenInfo {
  /** 隐藏信息ID */
  id: string;
  /** 触发区域（相对坐标百分比） */
  hotzone: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** 触发方式 */
  trigger: 'tap' | 'swipe-left' | 'swipe-right' | 'long-press';
  /** 发现后显示的文本 */
  text: string;
  /** 发现后显示的插画（可选） */
  illustrationId?: string;
  /** 发现后触发的对话ID */
  dialogueId?: string;
  /** 是否为关键信息（必须发现才能推进剧情） */
  isCritical?: boolean;
}

/**
 * 操作型道具的拖拽目标
 */
export interface PropDragTarget {
  /** 目标道具ID */
  targetPropId: string;
  /** 拖拽成功后的反馈 */
  successFeedback: string;
  /** 拖拽成功后的对话 */
  successDialogueId?: string;
  /** 拖拽失败（拖到错误位置）的反馈 */
  failureFeedback?: string;
  /** 成功后的属性效果 */
  effects?: AttributeEffect[];
  /** 成功后跳转的节点 */
  nextNode?: string;
}

/**
 * 真实世界联动配置
 */
export interface RealWorldLink {
  /** 联动类型 */
  type: 'print' | 'save-image' | 'share';
  /** 联动资源模板ID */
  templateId: string;
  /** 资源生成参数（动态填充） */
  params?: Record<string, string>;
  /** 显示给用户的说明 */
  description: string;
}

/**
 * 道具完整配置
 */
export interface Prop {
  /** 道具唯一ID */
  id: string;
  /** 道具名称 */
  name: string;
  /** 道具描述 */
  description: string;
  /** 道具图标路径（小图，用于道具栏） */
  icon: string;
  /** 道具大图路径（检视/操作时显示） */
  image: string;

  /** 互动层级 */
  layer: PropLayer;

  /** 检视型：隐藏信息列表 */
  hiddenInfo?: PropHiddenInfo[];

  /** 操作型：拖拽目标配置 */
  dragTargets?: PropDragTarget[];
  /** 操作型：拖拽交互类型 */
  interactType?: 'drag';

  /** 是否为可收集道具（进入道具栏） */
  isCollectible: boolean;
  /** 解锁所需Day */
  unlockDay?: number;

  /** 所属角色ID（空为通用道具） */
  characterId?: string;

  /** 真实世界联动配置 */
  realWorldLink?: RealWorldLink;

  /** 道具分类标签 */
  category: 'medicine' | 'memory' | 'tool' | 'document' | 'decor';
}
