/**
 * 道具交互组合式函数
 * 管理道具的检视、操作、拖拽等交互逻辑
 */
import { ref, computed } from 'vue';
import type { Prop, PropHiddenInfo, PropDragTarget } from '@/types/prop';
import { usePropStore } from '@/stores/propStore';

export function usePropInteraction() {
  const propStore = usePropStore();

  /** 当前选中的道具 */
  const selectedProp = ref<Prop | null>(null);
  /** 道具交互模式 */
  const interactionMode = ref<'idle' | 'inspect' | 'operate'>('idle');
  /** 是否正在拖拽 */
  const isDragging = ref(false);
  /** 拖拽偏移量 */
  const dragPosition = ref({ x: 0, y: 0 });
  /** 拖拽目标命中状态 */
  const dragTargetHit = ref<string | null>(null);
  /** 已发现的隐藏信息 */
  const discoveredInfo = ref<PropHiddenInfo[]>([]);

  /**
   * 选中道具进行交互
   */
  function selectProp(propId: string) {
    const prop = propStore.getProp(propId);
    if (!prop) return;

    selectedProp.value = prop;

    switch (prop.layer) {
      case 'display':
        interactionMode.value = 'idle';
        break;
      case 'inspect':
        interactionMode.value = 'inspect';
        break;
      case 'operate':
        interactionMode.value = 'operate';
        break;
    }
  }

  /**
   * 发现隐藏信息
   */
  function discoverHiddenInfo(propId: string, infoId: string) {
    const prop = propStore.getProp(propId);
    if (!prop?.hiddenInfo) return;

    const info = prop.hiddenInfo.find(h => h.id === infoId);
    if (info) {
      propStore.discoverHiddenInfo(propId, infoId);
      discoveredInfo.value.push(info);
      console.log(`[Prop] 发现隐藏信息: ${info.text}`);
    }
  }

  /**
   * 检查隐藏信息是否已发现
   */
  function isDiscovered(propId: string, infoId: string): boolean {
    return propStore.isHiddenInfoDiscovered(propId, infoId);
  }

  /**
   * 处理拖拽开始
   */
  function onDragStart() {
    isDragging.value = true;
  }

  /**
   * 处理拖拽移动
   */
  function onDragMove(deltaX: number, deltaY: number) {
    dragPosition.value = { x: deltaX, y: deltaY };
  }

  /**
   * 处理拖拽结束
   */
  function onDragEnd(targetId: string | null) {
    isDragging.value = false;
    dragPosition.value = { x: 0, y: 0 };

    if (targetId && selectedProp.value) {
      handleDropSuccess(targetId);
    }
    dragTargetHit.value = null;
  }

  /**
   * 处理拖拽成功放下
   */
  function handleDropSuccess(targetPropId: string) {
    const prop = selectedProp.value;
    if (!prop?.dragTargets) return;

    const target = prop.dragTargets.find(t => t.targetPropId === targetPropId);
    if (target) {
      console.log(`[Prop] 拖拽成功: ${target.successFeedback}`);
      // 触发后续对话、属性效果等
    }
  }

  /**
   * 关闭道具交互
   */
  function closeInteraction() {
    selectedProp.value = null;
    interactionMode.value = 'idle';
    isDragging.value = false;
    discoveredInfo.value = [];
  }

  return {
    selectedProp,
    interactionMode,
    isDragging,
    dragPosition,
    dragTargetHit,
    discoveredInfo,
    selectProp,
    discoverHiddenInfo,
    isDiscovered,
    onDragStart,
    onDragMove,
    onDragEnd,
    closeInteraction,
  };
}
