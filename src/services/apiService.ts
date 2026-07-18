import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth';
import baseURLApi from '@/api/baseURLApi';
import i18n from '@/i18n';

const baseURL = baseURLApi.url;

/** Header requestKey cố định (chỉ gửi khi withRequestBy: true). */
const REQUEST_BY_KEY = 'key_666ttp10tyuio72612aqzvntnmyt1r2y9y3tre7823';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** true → gắn header requestKey = REQUEST_BY_KEY */
    withRequestBy?: boolean;
  }
}

const api = axios.create({
  baseURL,
  timeout: 10000, // 10 giây
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * 1. REQUEST INTERCEPTOR: Tự động gắn Token vào mỗi yêu cầu
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore(); // Pinia cho phép gọi store
    const token = authStore.token; // Lấy token đã được Pinia tự động load từ Storage
    const userId =
      String(authStore.user?.id ?? '').trim() ||
      token ||
      localStorage.getItem('web_token_backup') ||
      '';

    if (config.headers) {
      config.headers['Accept-Language'] = i18n.global.locale.value as string;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (userId) {
        config.headers.requestBy = userId;
      }

      if (config.withRequestBy) {
        config.headers.requestKey = REQUEST_BY_KEY;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 2. RESPONSE INTERCEPTOR: Xử lý Logic Online/Offline và lỗi tập trung
 */
api.interceptors.response.use(
  (response) => {
    const authStore = useAuthStore();

    // Nếu có phản hồi thành công -> Chắc chắn đang Online
    if (!authStore.isOnline) {
      authStore.setNetworkStatus(true);
    }
    return response;
  },
  async (error: AxiosError) => {
    const authStore = useAuthStore();

    // TH1: Lỗi mất kết nối hoàn toàn (Network Error / CORS / Server Down)
    if (!error.response) {
      console.warn("Mất kết nối mạng hoặc Server không phản hồi. Chuyển sang Offline Mode.");
      authStore.setNetworkStatus(false);
      return Promise.reject(error);
    }

    const status = error.response.status;

    // TH2: Token hết hạn (401)
    if (status === 401) {
      console.error("Token hết hạn. Đang đăng xuất...");
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      await authStore.logout();
    }

    // TH3: Lỗi hệ thống Server (5xx) -> Ép về Offline để dùng dữ liệu SQLite
    if (status >= 500) {
      console.warn(`Server lỗi ${status}. Tạm thời chuyển sang chế độ Offline.`);
      authStore.setNetworkStatus(false);
    }

    return Promise.reject(error);
  }
);

export type RequestConfig = {
  /** true → gắn header requestKey = REQUEST_BY_KEY. Mặc định: không gửi */
  withRequestBy?: boolean;
};

/**
 * 3. EXPORT WRAPPER: chạy bằng Axios
 */
const request = {
  get: (url: string, params?: any, config?: RequestConfig) =>
    api.get(url, { params, ...config }),
  post: (url: string, data?: any, config?: RequestConfig) =>
    api.post(url, data, { ...config }),
  postBlob: (url: string, data?: any) =>
    api.post(url, data, { responseType: 'blob', timeout: 120000 }),
  put: (url: string, data?: any, config?: RequestConfig) =>
    api.put(url, data, { ...config }),
  patch: (url: string, data?: any, config?: RequestConfig) =>
    api.patch(url, data, { ...config }),
  delete: (url: string, data?: any, config?: RequestConfig) =>
    api.delete(url, { ...(data ? { data } : {}), ...config }),
};

export default request;
