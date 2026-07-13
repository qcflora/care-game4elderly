<template>
  <div class="elder-avatar" :class="`elder-avatar--${gender}`">
    <span class="elder-avatar__initial">{{ initial }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{
  name: string;
  avatar?: string;
  gender?: 'male' | 'female';
}>();
const initial = computed(() => props.name.charAt(0));
const gender = computed(() => props.gender ?? 'female');
</script>

<style scoped>
.elder-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-inverse);
}
.elder-avatar--female { background: var(--color-trust); }
.elder-avatar--male { background: var(--color-independence); }
.elder-avatar__initial { line-height: 1; }
</style>
