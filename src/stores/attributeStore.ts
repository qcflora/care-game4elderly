/**
 * 四维属性与精灵魔力管理 Store
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  AttributeState, AttributeEffect, AttributeTensionRule, SpiritPowerState
} from '@/types/attribute';
import { AttributeType } from '@/types/attribute';

export const useAttributeStore = defineStore('attribute', () => {
  // === State ===
  const attributes = ref<AttributeState>({
    health: 70,
    mood: 60,
    independence: 50,
    trust: 40,
  });

  const spiritPower = ref<SpiritPowerState>({
    current: 0,
    max: 100,
    consumedThisTurn: 0,
    chargedThisTurn: 0,
  });

  /** 当前角色的张力规则 */
  const tensionRules = ref<AttributeTensionRule[]>([]);

  /** 属性变化日志（用于UI反馈动画） */
  const recentChanges = ref<AttributeEffect[]>([]);

  // === Getters ===
  const healthPercent = computed(() => attributes.value.health);
  const moodPercent = computed(() => attributes.value.mood);
  const independencePercent = computed(() => attributes.value.independence);
  const trustPercent = computed(() => attributes.value.trust);
  const spiritPowerPercent = computed(() =>
    Math.round((spiritPower.value.current / spiritPower.value.max) * 100)
  );

  /** 检查是否有属性处于危险区（<20） */
  const criticalAttributes = computed(() => {
    const result: AttributeType[] = [];
    if (attributes.value.health < 20) result.push(AttributeType.HEALTH);
    if (attributes.value.mood < 20) result.push(AttributeType.MOOD);
    if (attributes.value.independence < 20) result.push(AttributeType.INDEPENDENCE);
    if (attributes.value.trust < 20) result.push(AttributeType.TRUST);
    return result;
  });

  /** 精灵魔力状态等级 */
  const spiritPowerLevel = computed(() => {
    const power = spiritPower.value.current;
    if (power >= 100) return 'full';
    if (power >= 80) return 'strong';
    if (power >= 20) return 'normal';
    return 'weak';
  });

  // === Actions ===

  /** 初始化属性（新游戏或加载存档） */
  function initAttributes(base: AttributeState, rules: AttributeTensionRule[]) {
    attributes.value = { ...base };
    tensionRules.value = [...rules];
    spiritPower.value = {
      current: 0, max: 100, consumedThisTurn: 0, chargedThisTurn: 0,
    };
  }

  /** 应用属性变化效果 */
  function applyEffects(effects: AttributeEffect[]) {
    recentChanges.value = [];

    for (const effect of effects) {
      const oldValue = attributes.value[effect.type];
      const newValue = Math.max(0, Math.min(100, oldValue + effect.delta));
      attributes.value[effect.type] = newValue;

      recentChanges.value.push({
        ...effect,
        delta: newValue - oldValue,
      });

      console.log(`[Attribute] ${effect.type}: ${oldValue} -> ${newValue} (${effect.reason})`);
    }

    setTimeout(() => { recentChanges.value = []; }, 1500);
  }

  /** 修改精灵魔力值 */
  function modifySpiritPower(delta: number): void {
    const oldValue = spiritPower.value.current;

    if (delta > 0) {
      spiritPower.value.current = Math.min(spiritPower.value.max, oldValue + delta);
      spiritPower.value.chargedThisTurn += delta;
    } else {
      spiritPower.value.current = Math.max(0, oldValue + delta);
      spiritPower.value.consumedThisTurn += Math.abs(delta);
    }
  }

  /** 魔力抵消风险事件 */
  function useSpiritPowerToDefend(requiredPower: number): boolean {
    if (spiritPower.value.current >= requiredPower) {
      modifySpiritPower(-requiredPower);
      return true;
    }
    return false;
  }

  /** 每日属性自然衰减（疾病进展） */
  function applyDailyDecay(dailyDecay: number): void {
    if (dailyDecay > 0) {
      applyEffects([{
        type: AttributeType.HEALTH,
        delta: -dailyDecay,
        reason: '疾病自然进展',
      }]);
    }
  }

  /** 检查属性张力规则 */
  function checkTensionRules(): void {
    const effects: AttributeEffect[] = [];

    for (const rule of tensionRules.value) {
      const sourceValue = attributes.value[rule.source];
      let triggered = false;

      switch (rule.operator) {
        case '>':  triggered = sourceValue > rule.threshold; break;
        case '<':  triggered = sourceValue < rule.threshold; break;
        case '>=': triggered = sourceValue >= rule.threshold; break;
        case '<=': triggered = sourceValue <= rule.threshold; break;
      }

      if (triggered) {
        effects.push({
          type: rule.target,
          delta: rule.perTurnDelta,
          reason: rule.description,
        });
      }
    }

    if (effects.length > 0) {
      applyEffects(effects);
    }
  }

  /** 重置回合统计 */
  function resetTurnStats(): void {
    spiritPower.value.consumedThisTurn = 0;
    spiritPower.value.chargedThisTurn = 0;
  }

  return {
    attributes, spiritPower, tensionRules, recentChanges,
    healthPercent, moodPercent, independencePercent, trustPercent,
    spiritPowerPercent, criticalAttributes, spiritPowerLevel,
    initAttributes, applyEffects, modifySpiritPower,
    useSpiritPowerToDefend, applyDailyDecay, checkTensionRules,
    resetTurnStats,
  };
});
