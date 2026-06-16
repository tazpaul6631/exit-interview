import { computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { getAvatarColorByUserId } from '@/utils/avatarColor';

/** Màu avatar theo id user đang đăng nhập — đổi khi logout/login user khác. */
export function useUserAvatarColor() {
  const authStore = useAuthStore();

  return computed(() => getAvatarColorByUserId(authStore.getUserId));
}
