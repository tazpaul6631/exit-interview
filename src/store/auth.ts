import { defineStore } from 'pinia';
import storageService from '@/services/storage.service';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    token: '' as string,
    isOnline: true,
    lastSync: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    // Getter để lấy thông tin user nhanh
    getUserName: (state) => state.user?.name || 'Guest',
  },

  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setNetworkStatus(status: boolean) {
      this.isOnline = status;
    },
    async logout() {
      this.token = '';
      this.user = null;
      // Xóa sạch storage khi logout để bảo mật (Security app)
      await storageService.clear();
      // Dùng router của Ionic để chuyển trang mượt mà
      router.push('/login');
    }
  },

  persist: {
    key: 'patrol_auth_storage',
    storage: {
      // Bật flag mã hóa (true) để token không bị đọc trộm nếu máy bị root/jailbreak
      getItem: (key: string) => storageService.get(key, false, true),
      setItem: (key: string, value: string) => storageService.set(key, value, true),
    } as any,
    pick: ['token', 'user', 'lastSync'],
  },
});