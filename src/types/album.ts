/**
 * 相册相关类型定义
 */

/**
 * 相册条目
 */
export interface AlbumEntry {
  /** 条目ID */
  id: string;
  /** 所属角色ID */
  characterId: string;
  /** 照片标题 */
  title: string;
  /** 照片图片路径 */
  image: string;
  /** 照片说明文字 */
  caption: string;
  /** 记忆描述（点击照片后展示的长文本） */
  memory: string;

  /** 解锁Day */
  unlockDay: number;
  /** 解锁条件表达式 */
  unlockCondition: string;
  /** 是否已解锁 */
  isUnlocked: boolean;

  /** 照片拍摄场景 */
  scene?: string;
  /** 照片中涉及的人物 */
  characters?: string[];

  /** 关联的日记ID */
  relatedDiaryId?: string;
}
