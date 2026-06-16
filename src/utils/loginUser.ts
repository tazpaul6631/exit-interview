import type { AuthMenuPermission, AuthPermissionAction, AuthUser, PagedUserResponse } from '@/types/user';
import type { Role } from '@/types/role';

function normalizePermissionAction(raw: unknown): AuthPermissionAction | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = item.id ?? item.Id;
  if (id == null) return null;

  return {
    id: Number(id),
    code: String(item.code ?? item.Code ?? ''),
    name: String(item.name ?? item.Name ?? ''),
    isAllow: Boolean(item.isAllow ?? item.IsAllow ?? false),
  };
}

function normalizeMenuPermissions(raw: unknown): AuthMenuPermission[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((menu) => {
      const normalized = normalizePermissionAction(menu);
      if (!normalized) return null;

      const node = menu as Record<string, unknown>;
      const children = Array.isArray(node.permissions)
        ? node.permissions
        : Array.isArray(node.Permissions)
          ? node.Permissions
          : [];

      return {
        ...normalized,
        permissions: children
          .map(normalizePermissionAction)
          .filter((item): item is AuthPermissionAction => item !== null),
      };
    })
    .filter((menu): menu is AuthMenuPermission => menu !== null);
}

export function normalizeAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== 'object') return null;

  const user = raw as Record<string, unknown>;
  const id = user.id ?? user.Id;
  const code = user.code ?? user.Code;
  const name = user.name ?? user.Name;

  if (id == null || (code == null && name == null)) return null;

  const roleName = String(user.roleName ?? user.RoleName ?? '').trim();
  const roleCode = String(user.roleCode ?? user.RoleCode ?? '').trim();
  const permissions = normalizeMenuPermissions(user.permissions ?? user.Permissions);

  return {
    id: id as string | number,
    status: Number(user.status ?? user.Status ?? 0),
    keyword: String(user.keyword ?? user.Keyword ?? ''),
    code: String(code ?? ''),
    name: String(name ?? ''),
    password: String(user.password ?? user.Password ?? ''),
    roleId: Number(user.roleId ?? user.RoleId ?? 0),
    ...(roleCode ? { roleCode } : {}),
    ...(roleName ? { roleName } : {}),
    isAdmin: Boolean(user.isAdmin ?? user.IsAdmin ?? false),
    ...(permissions.length ? { permissions } : {}),
  };
}

/** Tạo Role từ dữ liệu user sau login — không cần gọi thêm API role. */
export function buildRoleFromAuthUser(user: AuthUser): Role | null {
  if (!user.roleName?.trim()) return null;

  return {
    id: user.roleId,
    status: user.status,
    keyword: user.keyword,
    code: user.roleCode ?? '',
    name: user.roleName,
    isAdmin: user.isAdmin ?? false,
    permissions: [],
  };
}

/** Hỗ trợ cả response paginated (`data.items`) lẫn user object trực tiếp trong `data`. */
export function parseLoginUser(responseBody: unknown): AuthUser | null {
  if (!responseBody || typeof responseBody !== 'object') return null;

  const data = (responseBody as { data?: unknown }).data;
  if (!data) return null;

  if (Array.isArray(data)) {
    return normalizeAuthUser(data[0]);
  }

  if (typeof data !== 'object') return null;

  const payload = data as PagedUserResponse & Record<string, unknown>;

  if (Array.isArray(payload.items) && payload.items.length > 0) {
    return normalizeAuthUser(payload.items[0]);
  }

  return normalizeAuthUser(payload);
}

export function resolveSessionToken(user: AuthUser, fallbackPassword: string): string {
  return user.password?.trim() || fallbackPassword.trim();
}
