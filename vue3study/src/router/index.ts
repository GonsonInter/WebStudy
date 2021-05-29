import { createRouter, createWebHashHistory } from 'vue-router'
import Todos from '@/components/Todos.vue';
import Home from '@/views/Home.vue';

const routerHistory = createWebHashHistory();
// createWebHashHistory -- hash路由
// createWebHistory -- history路由
// createMemoryHistory -- 带缓存的history路由

const router = createRouter({
  history: routerHistory,
  routes: [
    {
      path: '/',
      redirect: { name: 'HOME' }
    }, {
      name: 'HOME',
      path: '/home',
      component: Home
    }, {
      path: '/todos',
      component: Todos
    }
  ]
})

export default router
