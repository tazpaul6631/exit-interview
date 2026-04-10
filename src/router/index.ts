import { createRouter, createWebHashHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import { useAuthStore } from '@/store/auth'; // Import store để check token

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/LoginPage.vue'),
    meta: { requiresAuth: false } // Không cần đăng nhập
  },
  {
    path: '/tabs/',
    component: TabsPage,
    meta: { requiresAuth: true }, // BẮT BUỘC đăng nhập mới vào được các tab
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue')
      }
    ]
  },
  // Trang 404 hoặc các trang khác...
  {
    path: '/:catchAll(.*)',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * GUARD: Kiểm tra quyền truy cập trước mỗi lần chuyển trang
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Kiểm tra nếu trang yêu cầu đăng nhập
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = !!authStore.token;

  if (requiresAuth && !isAuthenticated) {
    // Nếu trang yêu cầu login mà chưa có token -> đá về Login
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    // Nếu đã login rồi mà cố tình vào lại trang Login -> đẩy vào Tab1
    next('/tabs/tab1');
  } else {
    // Còn lại cho đi tiếp
    next();
  }
});

export default router;