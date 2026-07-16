<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
/**
 * 应用根组件
 * 管理全局Loading/Toast/Modal，处理路由过渡动画
 */
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  max-width: var(--game-max-width);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
</style>
