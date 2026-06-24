import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { useAuthStore } from '@/store/auth';
import type { AuthMenuPermission } from '@/types/user';

const normalizeToken = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

export function findMenuByHints(
  menus: AuthMenuPermission[],
  hints: string[],
): AuthMenuPermission | null {
  if (menus.length === 0 || hints.length === 0) return null;

  return (
    menus.find((menu) => {
      const menuCode = normalizeToken(menu.code ?? '');
      const menuName = normalizeToken(menu.name ?? '');
      const matched = hints.some((hint) => {
        const token = normalizeToken(hint);
        return token && (menuCode.includes(token) || menuName.includes(token));
      });
      return matched && menu.isAllow;
    }) ?? null
  );
}

function isActionAllowed(
  menu: AuthMenuPermission | null,
  actionName: string,
  fallback: boolean,
): boolean {
  if (!menu) return fallback;

  const action = menu.permissions.find(
    (item) => item.name.toUpperCase() === actionName.toUpperCase(),
  );
  return action?.isAllow ?? false;
}

export function useMenuPermissions(permissionHints: MaybeRefOrGetter<string[]>) {
  const authStore = useAuthStore();

  const currentMenu = computed(() => {
    const menus = authStore.user?.permissions ?? [];
    return findMenuByHints(menus, toValue(permissionHints));
  });

  const allowAll = computed(() => (authStore.user?.permissions?.length ?? 0) === 0);

  const resolve = (actionName: string) =>
    allowAll.value ? true : isActionAllowed(currentMenu.value, actionName, false);

  return {
    currentMenu,
    canView: computed(() => resolve('VIEW')),
    canCreate: computed(() => resolve('CREATE')),
    canUpdate: computed(() => resolve('UPDATE')),
    canDelete: computed(() => resolve('DELETE')),
    canExport: computed(() => resolve('EXPORT')),
    canImport: computed(() => resolve('IMPORT')),
  };
}
