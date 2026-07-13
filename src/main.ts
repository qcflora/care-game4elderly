/**
 * 应用入口
 * 创建Vue应用实例，注册Pinia/Router，初始化微信SDK，挂载根组件
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './styles/global.css';
import './styles/animations.css';

const app = createApp(App);

// 注册 Pinia 状态管理
const pinia = createPinia();
app.use(pinia);

// 注册 Vue Router
app.use(router);

// 挂载应用
app.mount('#app');

// 开发环境提示
if (import.meta.env.DEV) {
  console.log('[Guardian Spirit] 开发模式已启动');
}
