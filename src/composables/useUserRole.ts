import { onMounted, watch } from 'vue';
import { useAuthStore } from '@/store/auth';
import { buildRoleFromAuthUser } from '@/utils/loginUser';
import { fetchRoleById } from '@/utils/roleResponse';

export function useUserRole() {
  const authStore = useAuthStore();

  async function loadUserRole() {
    const roleId = authStore.user?.roleId;
    if (roleId == null) {
      authStore.clearRoleName();
      return;
    }

    if (authStore.role?.id === roleId && authStore.roleName) {
      return;
    }

    const user = authStore.user;
    if (user) {
      const role = buildRoleFromAuthUser(user);
      if (role) {
        authStore.setRole(role);
        return;
      }
    }

    try {
      const role = await fetchRoleById(roleId);
      if (role) {
        authStore.setRole(role);
      }
    } catch (error) {
      console.error('Không tải được thông tin role:', error);
    }
  }

  onMounted(loadUserRole);

  watch(
    () => authStore.user?.roleId,
    (roleId) => {
      if (roleId == null) {
        authStore.clearRoleName();
        return;
      }
      loadUserRole();
    },
  );

  return { loadUserRole };
}
