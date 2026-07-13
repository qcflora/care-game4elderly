/**
 * TypeScript类型统一导出
 * 所有类型定义通过此文件统一导入导出
 */

// 属性相关
export type { AttributeState, AttributeEffect, AttributeTensionRule, SpiritPowerState } from './attribute';
export { AttributeType } from './attribute';

// 角色相关
export type {
  Gender,
  UnlockCondition,
  HealthCondition,
  StoryAct,
  CharacterConfig,
} from './character';

// 剧情/对话/选项相关
export type {
  SpeakerType,
  TextLayer,
  Dialogue,
  FeedbackType,
  ChoiceFeedback,
  ChoiceUnlock,
  SkillCheck,
  ChoiceCondition,
  Choice,
  NodeType,
  NodeTransition,
  NodeProp,
  StoryNode,
  StoryActData,
} from './story';

// 道具相关
export type {
  PropLayer,
  PropHiddenInfo,
  PropDragTarget,
  RealWorldLink,
  Prop,
} from './prop';

// 技能相关
export type {
  SkillCategoryType,
  Skill,
  SkillEffect,
  SkillCategory,
  SkillTree,
} from './skill';

// 日记相关
export type {
  DiaryTrigger,
  DiaryVariation,
  Letter,
  DiaryEntry,
} from './diary';

// 相册相关
export type { AlbumEntry } from './album';

// 存档相关
export type {
  DecisionRecord,
  Checkpoint,
  SaveData,
  SaveManager,
  GameSettings,
} from './save';

// 事件相关
export type { RiskEventType, RiskEvent } from './event';
