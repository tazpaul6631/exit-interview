import { createRouter, createWebHashHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { Capacitor } from '@capacitor/core'; // Import Capacitor API để nhận diện App Native
import MainLayout from '../views/MainLayout.vue';
import NotFoundPage from '@/views/404NotFoundPage/NotFoundPage.vue';
import { getRoutePermissionHints } from '@/constants/appMenuItems';
import { hasRouteMenuAccess } from '@/utils/menuAccess';
import {
  NESTED_OUTLET_SELECTOR,
  syncOutletPagesDeferred,
} from '@/utils/ionicOutlet';
import { focusLoginField, releaseFocusDeferred } from '@/utils/releaseFocus';

const isNotFoundRoute = (path: string, name?: string | symbol | null) =>
  path === '/404' || name === 'NotFound';

const PUBLIC_WEB_PATHS = new Set(['/login', '/404']);

const isPublicWebRoute = (path: string, name?: string | symbol | null) =>
  PUBLIC_WEB_PATHS.has(path) || isNotFoundRoute(path, name);

const isWebAuthenticated = () => {
  const authStore = useAuthStore();
  return authStore.isAuthenticated && !!authStore.token;
};

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: () => {
      if (Capacitor.isNativePlatform()) return '/app-menu';
      return isWebAuthenticated() ? '/dashboard' : '/login';
    },
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
        component: () => import('@/views/DashBoard/DashBoard.vue'),
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = isWebAuthenticated();

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
  if (isPublicWebRoute(to.path, to.name)) {
    if (to.path === '/login' && isAuthenticated) {
      return next('/dashboard');
    }
    return next();
  }

  // Route app-only trên web
  if (to.path === '/app-menu' || to.path === '/formExit') {
    if (!isAuthenticated) {
      await releaseFocusDeferred();
      return next('/login');
    }
    return next('/dashboard');
  }

  // Chưa đăng nhập -> login (mọi route web còn lại)
  if (!isAuthenticated) {
    await releaseFocusDeferred();
    return next({ path: '/login', replace: true });
  }

  const permissionHints = getRoutePermissionHints(to.path);
  if (permissionHints) {
    const menus = authStore.user?.permissions ?? [];
    if (!hasRouteMenuAccess(menus, permissionHints)) {
      return next({ path: '/404', replace: true });
    }
  }

  next();
});

router.afterEach(async (to) => {
  if (Capacitor.isNativePlatform()) return;

  if (to.path === '/login') {
    requestAnimationFrame(() => focusLoginField());
  }

  await syncOutletPagesDeferred(NESTED_OUTLET_SELECTOR, to.name);
});

export default router;