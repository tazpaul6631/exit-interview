export interface AppMenuItem {
  titleKey: string;
  url: string;
  icon: string;
  permissionHints: string[];
  /** Các path (hoặc prefix) cần quyền menu tương ứng */
  routePrefixes: string[];
}

export const APP_MENU_ITEMS: AppMenuItem[] = [
  {
    titleKey: 'layout.menu.dashboard',
    url: '/dashboard',
    icon: 'pi pi-home',
    permissionHints: ['dashboard'],
    routePrefixes: ['/dashboard'],
  },
  {
    titleKey: 'layout.menu.list_user',
    url: '/list-user',
    icon: 'pi pi-user',
    permissionHints: ['user'],
    routePrefixes: ['/list-user'],
  },
  {
    titleKey: 'layout.menu.list_role',
    url: '/list-role',
    icon: 'pi pi-key',
    permissionHints: ['role'],
    routePrefixes: ['/list-role', '/detail-role'],
  },
  {
    titleKey: 'layout.menu.list_organization',
    url: '/list-organization',
    icon: 'pi pi-warehouse',
    permissionHints: ['organization'],
    routePrefixes: ['/list-organization'],
  },
  {
    titleKey: 'layout.menu.list_exit_interview',
    url: '/list-exit-interview',
    icon: 'pi pi-file',
    permissionHints: ['exitinterview'],
    routePrefixes: ['/list-exit-interview', '/detail-exit-interview'],
  },
];

export function matchesRoutePrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function getRoutePermissionHints(path: string): string[] | null {
  const item = APP_MENU_ITEMS.find((entry) =>
    entry.routePrefixes.some((prefix) => matchesRoutePrefix(path, prefix)),
  );
  return item?.permissionHints ?? null;
}
