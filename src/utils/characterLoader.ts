/**
 * 角色数据加载器
 * 负责动态加载角色配置和剧情数据
 */
import type { CharacterConfig } from '@/types/character';

/** 所有角色配置文件（Vite 静态导入） */
const characterModules = import.meta.glob<{ default: CharacterConfig }>(
  '../data/characters/*.json',
  { eager: true }
);

/** 角色ID到配置的映射 */
const characterMap: Record<string, CharacterConfig> = {};

// 初始化角色映射
for (const [path, module] of Object.entries(characterModules)) {
  const config = module.default;
  if (config && config.id) {
    characterMap[config.id] = config;
  }
}

/**
 * 获取所有可用角色列表
 */
export function getAllCharacters(): CharacterConfig[] {
  return Object.values(characterMap);
}

/**
 * 根据ID获取角色配置
 */
export function getCharacterById(id: string): CharacterConfig | undefined {
  return characterMap[id];
}

/**
 * 获取已解锁的角色列表
 * @param completedCharacterIds 已完成的角色ID列表
 * @param unlockedSkills 已解锁的技能ID列表
 */
export function getUnlockedCharacters(
  completedCharacterIds: string[] = [],
  unlockedSkills: string[] = []
): CharacterConfig[] {
  return Object.values(characterMap).filter(char => {
    if (!char.isLocked) return true;

    // 检查解锁条件
    if (!char.unlockCondition) return false;

    // 检查前置角色完成条件
    const dependsOn = char.unlockCondition.dependsOn;
    const hasCompleted = dependsOn
      ? completedCharacterIds.includes(dependsOn)
      : true;

    // 检查前置技能条件
    const requiredSkills = char.unlockCondition.requiredSkills ?? [];
    const hasAllSkills = requiredSkills.every((skill: string) =>
      unlockedSkills.includes(skill)
    );

    return hasCompleted && hasAllSkills;
  });
}
