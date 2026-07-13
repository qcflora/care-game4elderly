/**
 * 技能树状态 Store
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Skill, SkillTree, SkillCategory } from '@/types/skill';

export const useSkillStore = defineStore('skill', () => {
  // === State ===
  /** 技能树配置数据 */
  const skillTree = ref<SkillTree | null>(null);
  /** 已学技能 { skillId: level } */
  const skills = ref<Record<string, number>>({});

  // === Getters ===
  /** 技能点总数 */
  const totalSkillPoints = computed(() => {
    return Object.values(skills.value).reduce((sum, level) => sum + level, 0);
  });

  /** 获取指定技能的当前等级 */
  function getSkillLevel(skillId: string): number {
    return skills.value[skillId] ?? 0;
  }

  /** 获取指定分类 */
  function getCategory(categoryId: string): SkillCategory | undefined {
    return skillTree.value?.categories.find(c => c.id === categoryId);
  }

  /** 获取指定技能 */
  function getSkill(skillId: string): Skill | undefined {
    if (!skillTree.value) return undefined;
    for (const category of skillTree.value.categories) {
      const skill = category.skills.find(s => s.id === skillId);
      if (skill) return skill;
    }
    return undefined;
  }

  // === Actions ===

  /** 加载技能树数据 */
  function loadSkillTree(data: SkillTree) {
    skillTree.value = data;
  }

  /** 学习/升级技能 */
  function upgradeSkill(skillId: string): boolean {
    const skill = getSkill(skillId);
    if (!skill) return false;

    const currentLevel = getSkillLevel(skillId);
    if (currentLevel >= skill.maxLevel) return false;

    // 检查前置技能
    for (const prereq of skill.prerequisites) {
      if (getSkillLevel(prereq) < 1) {
        console.warn(`[Skill] 前置技能 ${prereq} 未学习`);
        return false;
      }
    }

    skills.value[skillId] = currentLevel + 1;
    console.log(`[Skill] ${skillId} 升级到 ${currentLevel + 1}`);
    return true;
  }

  /** 检查技能是否满足等级要求 */
  function checkSkillRequirement(skillId: string, requiredLevel: number): boolean {
    return getSkillLevel(skillId) >= requiredLevel;
  }

  /** 重置技能 */
  function resetSkills() {
    skills.value = {};
  }

  /** 从存档恢复技能状态 */
  function restoreSkills(savedSkills: Record<string, number>) {
    skills.value = { ...savedSkills };
  }

  return {
    skillTree, skills,
    totalSkillPoints,
    getSkillLevel, getCategory, getSkill,
    loadSkillTree, upgradeSkill, checkSkillRequirement,
    resetSkills, restoreSkills,
  };
});
