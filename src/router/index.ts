import { createRouter, createWebHashHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { Capacitor } from '@capacitor/core'; // Import Capacitor API để nhận diện App Native
import MainLayout from '../views/MainLayout.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    // Điều hướng gốc: Nếu là App thì vào menu app, web thì vào dashboard (sẽ bị guard chặn bắt login)
    redirect: () => Capacitor.isNativePlatform() ? '/app-menu' : '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
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
    path: '/app-menu',
    name: 'AppMenu',
    component: () => import('@/views/AppMenu/AppMenu.vue'),
    meta: { requiresAuth: false } // App menu không yêu cầu login web
  },
  {
    path: '/formExit',
    component: () => import('@/views/FormExitInterview/FormExitInterview.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/404'
  }
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
});

/**
 * TÁCH BIỆT LUỒNG DỮ LIỆU BẰNG ROUTER GUARD
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.token;

  // Kiểm tra chính xác xem đang chạy trên Native App (iOS/Android thông qua Capacitor) hay Web
  const isApp = Capacitor.isNativePlatform();

  // ==========================================
  // 1. LUỒNG DÀNH RIÊNG CHO APP (MOBILE/TABLET NATIVE)
  // ==========================================
  if (isApp) {
    // Danh sách các trang cho phép App truy cập
    const allowedAppRoutes = ['/app-menu', '/formExit'];

    if (!allowedAppRoutes.includes(to.path)) {
      // Nếu là App mà đi lạc vào login hay dashboard -> Đá về App Menu
      return next('/app-menu');
    }
    return next();
  }

  // ==========================================
  // 2. LUỒNG DÀNH CHO WEB BROWSER
  // ==========================================
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Nếu người dùng Web cố gắng truy cập vào route dành riêng cho App
  if (to.path === '/app-menu' || to.path === '/formExit') {
    return next(isAuthenticated ? '/dashboard' : '/login');
  }

  // Xử lý login bình thường cho Web
  if (requiresAuth && !isAuthenticated) {
    return next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    return next('/dashboard');
  }

  // Hợp lệ thì cho đi tiếp
  next();
});

export default router;