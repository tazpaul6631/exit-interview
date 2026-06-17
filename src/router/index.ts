import { createRouter, createWebHashHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { Capacitor } from '@capacitor/core'; // Import Capacitor API để nhận diện App Native
import MainLayout from '../views/MainLayout.vue';
import NotFoundPage from '@/views/404NotFoundPage/NotFoundPage.vue';
import DashBoard from '@/views/DashBoard/DashBoard.vue';
import { getRoutePermissionHints } from '@/constants/appMenuItems';
import { hasRouteMenuAccess } from '@/utils/menuAccess';
import {
  NESTED_OUTLET_SELECTOR,
  syncOutletPagesDeferred,
} from '@/utils/ionicOutlet';

const isNotFoundRoute = (path: string, name?: string | symbol | null) =>
  path === '/404' || name === 'NotFound';

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
        component: DashBoard,
      },
      {
        path: 'list-role',
        name: 'ListRole',
        component: () => import('@/views/Role/RoleList.vue')
      },
      {
        path: 'detail-role/:id',
        name: 'DetailRole',
        component: () => import('@/views/Role/RoleDetail.vue')
      },
      {
        path: 'list-user',
        name: 'ListUser',
        component: () => import('@/views/User/UserList.vue')
      },
      {
        path: 'list-organization',
        name: 'ListOrganization',
        component: () => import('@/views/Organization/OrganizationList.vue')
      },
      {
        path: 'list-exit-interview',
        name: 'ListExitInterview',
        component: () => import('@/views/ListExitInterview/ListExitInterview.vue')
      },
      {
        path: 'detail-exit-interview/:id',
        name: 'DetailExitInterview',
        component: () => import('@/views/ListExitInterview/DetailExitInterview.vue')
      },
      {
        path: '404',
        name: 'NotFound',
        component: NotFoundPage,
        meta: { requiresAuth: false },
      },
      {
        path: ':pathMatch(.*)*',
        redirect: () => ({ path: '/404', replace: true }),
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
    path: '/:pathMatch(.*)*',
    redirect: () =>
      Capacitor.isNativePlatform()
        ? { path: '/app-menu', replace: true }
        : { path: '/404', replace: true },
  },
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
  const isAuthenticated = authStore.isAuthenticated;

  // Kiểm tra chính xác xem đang chạy trên Native App (iOS/Android thông qua Capacitor) hay Web
  const isApp = Capacitor.isNativePlatform();

  // ==========================================
  // 1. LUỒNG DÀNH RIÊNG CHO APP (MOBILE/TABLET NATIVE)
  // ==========================================
  if (isApp) {
    // Danh sách các trang cho phép App truy cập
    const allowedAppRoutes = ['/app-menu', '/formExit'];

    if (isNotFoundRoute(to.path, to.name)) {
      return next('/app-menu');
    }

    if (!allowedAppRoutes.includes(to.path)) {
      // Nếu là App mà đi lạc vào login hay dashboard -> Đá về App Menu
      return next('/app-menu');
    }
    return next();
  }

  // ==========================================
  // 2. LUỒNG DÀNH CHO WEB BROWSER
  // ==========================================
  if (isNotFoundRoute(to.path, to.name)) {
    return next();
  }

  const requiresAuth = to.matched.some(
    (record) => record.meta.requiresAuth && record.name !== 'NotFound',
  );

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

  if (isAuthenticated) {
    const permissionHints = getRoutePermissionHints(to.path);
    if (permissionHints) {
      const menus = authStore.user?.permissions ?? [];
      if (!hasRouteMenuAccess(menus, permissionHints)) {
        return next({ path: '/404', replace: true });
      }
    }
  }

  next();
});

router.afterEach(async (to) => {
  if (Capacitor.isNativePlatform()) return;

  await syncOutletPagesDeferred(NESTED_OUTLET_SELECTOR, to.name);
});

export default router;