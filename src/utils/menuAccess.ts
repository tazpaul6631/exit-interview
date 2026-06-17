import type { AuthMenuPermission } from '@/types/user';
import { findMenuByHints } from '@/composables/useMenuPermissions';

/** Kiểm tra quyền vào page: menu khớp + isAllow + VIEW (nếu có). */
export function hasRouteMenuAccess(
  menus: AuthMenuPermission[],
  hints: string[],
): boolean {
  if (menus.length === 0) return true;

  const menu = findMenuByHints(menus, hints);
  if (!menu) return false;

  const viewAction = menu.permissions.find(
    (item) => item.name.toUpperCase() === 'VIEW',
  );
  if (viewAction) return viewAction.isAllow;

  return true;
}
