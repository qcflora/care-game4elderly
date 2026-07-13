/**
 * 道具状态 Store
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Prop } from '@/types/prop';

export const usePropStore = defineStore('prop', () => {
  // === State ===
  /** 所有道具配置数据（按角色加载） */
  const propsConfig = ref<Prop[]>([]);
  /** 已解锁的道具ID列表 */
  const unlockedProps = ref<string[]>([]);
  /** 已收集的道具ID列表（进入道具栏） */
  const collectedProps = ref<string[]>([]);
  /** 道具隐藏信息发现记录 { propId: [hiddenInfoId, ...] } */
  const discoveredHiddenInfo = ref<Record<string, string[]>>({});

  // === Getters ===
  /** 当前场景应显示的道具列表 */
  const currentSceneProps = computed(() => {
    return propsConfig.value.filter(p =>
      unlockedProps.value.includes(p.id)
    );
  });

  /** 获取指定道具配置 */
  function getProp(propId: string): Prop | undefined {
    return propsConfig.value.find(p => p.id === propId);
  }

  /** 检查道具是否已收集 */
  function isCollected(propId: string): boolean {
    return collectedProps.value.includes(propId);
  }

  /** 检查隐藏信息是否已发现 */
  function isHiddenInfoDiscovered(propId: string, infoId: string): boolean {
    return discoveredHiddenInfo.value[propId]?.includes(infoId) ?? false;
  }

  // === Actions ===

  /** 加载道具配置数据 */
  function loadProps(data: Prop[]) {
    propsConfig.value = data;
  }

  /** 解锁道具 */
  function unlockProp(propId: string) {
    if (!unlockedProps.value.includes(propId)) {
      unlockedProps.value.push(propId);
    }
  }

  /** 收集道具到道具栏 */
  function collectProp(propId: string) {
    if (!collectedProps.value.includes(propId)) {
      collectedProps.value.push(propId);
    }
  }

  /** 记录发现隐藏信息 */
  function discoverHiddenInfo(propId: string, infoId: string) {
    if (!discoveredHiddenInfo.value[propId]) {
      discoveredHiddenInfo.value[propId] = [];
    }
    if (!discoveredHiddenInfo.value[propId].includes(infoId)) {
      discoveredHiddenInfo.value[propId].push(infoId);
    }
  }

  /** 重置道具状态 */
  function resetProps() {
    unlockedProps.value = [];
    collectedProps.value = [];
    discoveredHiddenInfo.value = {};
  }

  /** 从存档恢复道具状态 */
  function restoreProps(data: {
    unlocked: string[];
    collected: string[];
    discovered: Record<string, string[]>;
  }) {
    unlockedProps.value = data.unlocked;
    collectedProps.value = data.collected;
    discoveredHiddenInfo.value = data.discovered;
  }

  return {
    propsConfig, unlockedProps, collectedProps, discoveredHiddenInfo,
    currentSceneProps,
    getProp, isCollected, isHiddenInfoDiscovered,
    loadProps, unlockProp, collectProp, discoverHiddenInfo,
    resetProps, restoreProps,
  };
});
