/**
 * 路由配置
 */
import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '家庭守护精灵' },
  },
  {
    path: '/select',
    name: 'character-select',
    component: () => import('@/views/CharacterSelectView.vue'),
    meta: { title: '选择角色' },
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('@/views/GameView.vue'),
    meta: { title: '守护日常' },
  },
  {
    path: '/album',
    name: 'album',
    component: () => import('@/views/AlbumView.vue'),
    meta: { title: '时光相册' },
  },
  {
    path: '/diary',
    name: 'diary',
    component: () => import('@/views/DiaryView.vue'),
    meta: { title: '守护日记' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: '设置' },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// 路由守卫：更新页面标题
router.beforeEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
});

export default router;
