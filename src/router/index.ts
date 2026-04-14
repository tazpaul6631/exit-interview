import { createRouter, createWebHashHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store/auth'; // Import store để check token
import MainLayout from '../views/MainLayout.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/LoginPage.vue'),
    meta: { requiresAuth: false } // Không cần đăng nhập
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/DashBoard/DashBoard.vue')
      },
      {
        path: '404',
        name: 'NotFound',
        component: () => import('@/views/404NotFoundPage/NotFoundPage.vue')
      },
    ]
  },
  {
    path: '/formExit',
    component: () => import('@/views/FormExitInterview/FormExitInterview.vue')
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * GUARD: Kiểm tra quyền truy cập trước mỗi lần chuyển trang
 */
// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore();

//   // Kiểm tra nếu trang yêu cầu đăng nhập
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
//   const isAuthenticated = !!authStore.token;

//   if (requiresAuth && !isAuthenticated) {
//     // Nếu trang yêu cầu login mà chưa có token -> đá về Login
//     next('/login');
//   } else if (to.path === '/login' && isAuthenticated) {
//     // Nếu đã login rồi mà cố tình vào lại trang Login -> đẩy vào Tab1
//     next('/tabs/tab1');
//   } else {
//     // Còn lại cho đi tiếp
//     next();
//   }
// });

export default router;