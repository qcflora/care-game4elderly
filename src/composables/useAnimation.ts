/**
 * 动画控制组合式函数
 * 提供精灵动画、插画过渡、UI微动效等动画控制能力
 */
import { ref, onUnmounted } from 'vue';

export function useAnimation() {
  /** 当前播放的动画名称 */
  const currentAnimation = ref<string>('');
  /** 动画是否正在播放 */
  const isAnimating = ref(false);
  /** 动画计时器 */
  let animationTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 播放指定动画
   * @param name 动画名称
   * @param duration 动画持续时间（毫秒）
   */
  function playAnimation(name: string, duration?: number): Promise<void> {
    return new Promise((resolve) => {
      currentAnimation.value = name;
      isAnimating.value = true;

      if (duration) {
        animationTimer = setTimeout(() => {
          stopAnimation();
          resolve();
        }, duration);
      }
    });
  }

  /**
   * 停止当前动画
   */
  function stopAnimation() {
    currentAnimation.value = '';
    isAnimating.value = false;
    if (animationTimer) {
      clearTimeout(animationTimer);
      animationTimer = null;
    }
  }

  /**
   * 播放水彩揭示动画
   */
  function playWatercolorReveal(duration = 800) {
    return playAnimation('watercolor-reveal', duration);
  }

  /**
   * 播放精灵浮动动画
   */
  function playSpiritFloat(duration = 3000) {
    return playAnimation('spirit-float', duration);
  }

  /**
   * 播放精灵光芒动画
   */
  function playSpiritGlow(duration = 2000) {
    return playAnimation('spirit-glow', duration);
  }

  /**
   * 播放属性变化闪烁动画
   */
  function playAttributeFlash(duration = 1500) {
    return playAnimation('attribute-flash', duration);
  }

  /**
   * 顺序播放多个动画
   */
  async function playSequence(animations: Array<{ name: string; duration: number }>): Promise<void> {
    for (const anim of animations) {
      await playAnimation(anim.name, anim.duration);
    }
  }

  onUnmounted(() => {
    stopAnimation();
  });

  return {
    currentAnimation,
    isAnimating,
    playAnimation,
    stopAnimation,
    playWatercolorReveal,
    playSpiritFloat,
    playSpiritGlow,
    playAttributeFlash,
    playSequence,
  };
}
