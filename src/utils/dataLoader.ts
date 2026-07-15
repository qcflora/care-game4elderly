/**
 * 数据加载工具
 * 使用 import.meta.glob 懒加载相册、日记、道具、技能树等数据文件
 */
import type { AlbumEntry } from '@/types/album';
import type { DiaryEntry } from '@/types/diary';
import type { Prop } from '@/types/prop';
import type { SkillTree, SkillCategory, Skill } from '@/types/skill';

const __DEV__ = import.meta.env.DEV;

/**
 * 解析静态资源路径，自动拼接 Vite base URL
 * 解决 GitHub Pages 子路径部署时绝对路径失效问题
 */
export function resolveAsset(path: string): string {
  if (path.startsWith('/')) {
    const base = import.meta.env.BASE_URL;
    // 确保 base 以 / 结尾，path 去掉开头的 /
    const normalizedBase = base.endsWith('/') ? base : base + '/';
    return normalizedBase + path.slice(1);
  }
  return path;
}

/** 所有相册数据文件的懒加载映射 */
const albumModules = import.meta.glob<{ default: AlbumEntry[] }>(
  '../data/albums/*.json'
);

/** 所有日记数据文件的懒加载映射 */
const diaryModules = import.meta.glob<{ default: DiaryEntry[] }>(
  '../data/diaries/*.json'
);

/** 所有道具数据文件的懒加载映射 */
const propModules = import.meta.glob<{ default: Prop[] }>(
  '../data/props/*.json'
);

/** 技能树数据文件的懒加载映射 */
const skillTreeModules = import.meta.glob<{ default: SkillTree }>(
  '../data/skills/skillTree.json'
);

/**
 * 加载指定角色的相册数据（自动处理图片路径）
 */
export async function loadAlbumData(characterId: string): Promise<AlbumEntry[]> {
  const modulePath = `../data/albums/${characterId}.json`;
  const loader = albumModules[modulePath];
  if (!loader) {
    __DEV__ && console.warn(`[DataLoader] 找不到相册数据: ${modulePath}`);
    return [];
  }
  try {
    const data = await loader();
    const entries: AlbumEntry[] = data.default || data;
    // 处理图片路径
    for (const entry of entries) {
      if (entry.image) entry.image = resolveAsset(entry.image);
    }
    return entries;
  } catch (error) {
    console.error(`[DataLoader] 加载相册数据失败: ${modulePath}`, error);
    return [];
  }
}

/**
 * 加载指定角色的日记数据
 */
export async function loadDiaryData(characterId: string): Promise<DiaryEntry[]> {
  const modulePath = `../data/diaries/${characterId}.json`;
  const loader = diaryModules[modulePath];
  if (!loader) {
    __DEV__ && console.warn(`[DataLoader] 找不到日记数据: ${modulePath}`);
    return [];
  }
  try {
    const data = await loader();
    return data.default || data;
  } catch (error) {
    console.error(`[DataLoader] 加载日记数据失败: ${modulePath}`, error);
    return [];
  }
}

/**
 * 加载指定角色的道具配置数据
 */
export async function loadPropData(characterId: string): Promise<Prop[]> {
  const modulePath = `../data/props/${characterId}.json`;
  const loader = propModules[modulePath];
  if (!loader) {
    __DEV__ && console.warn(`[DataLoader] 找不到道具数据: ${modulePath}`);
    return [];
  }
  try {
    const data = await loader();
    return data.default || data;
  } catch (error) {
    console.error(`[DataLoader] 加载道具数据失败: ${modulePath}`, error);
    return [];
  }
}

/**
 * 递归处理技能树中的 icon 路径
 */
function resolveSkillIcons(category: SkillCategory): void {
  if (category.icon) category.icon = resolveAsset(category.icon);
  for (const skill of category.skills) {
    if (skill.icon) skill.icon = resolveAsset(skill.icon);
  }
}

/**
 * 加载技能树数据（全局，不依赖角色，自动处理 icon 路径）
 */
export async function loadSkillTreeData(): Promise<SkillTree | null> {
  const modulePath = `../data/skills/skillTree.json`;
  const loader = skillTreeModules[modulePath];
  if (!loader) {
    __DEV__ && console.warn(`[DataLoader] 找不到技能树数据`);
    return null;
  }
  try {
    const data = await loader();
    const tree: SkillTree = data.default || data;
    // 处理所有 icon 路径
    for (const category of tree.categories) {
      resolveSkillIcons(category);
    }
    return tree;
  } catch (error) {
    console.error(`[DataLoader] 加载技能树数据失败`, error);
    return null;
  }
}