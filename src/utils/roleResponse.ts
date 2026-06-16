import roleApi from '@/api/role';
import type {
  Role,
  RolePermissionGroup,
  RolePermissionLeaf,
  PagedRoleResponse,
} from '@/types/role';

function normalizePermissionLeaf(raw: unknown): RolePermissionLeaf | null {
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

export function normalizePermissionGroup(raw: unknown): RolePermissionGroup | null {
  if (!raw || typeof raw !== 'object') return null;

  const group = raw as Record<string, unknown>;
  const id = group.id ?? group.Id;
  if (id == null) return null;

  const nested = group.permissions ?? group.Permissions;
  const permissions = Array.isArray(nested)
    ? nested
      .map(normalizePermissionLeaf)
      .filter((item): item is RolePermissionLeaf => item !== null)
    : [];

  return {
    id: Number(id),
    code: String(group.code ?? group.Code ?? ''),
    name: String(group.name ?? group.Name ?? ''),
    permissions,
  };
}

export function normalizeRole(raw: unknown): Role | null {
  if (!raw || typeof raw !== 'object') return null;

  const role = raw as Record<string, unknown>;
  const id = role.id ?? role.Id;
  if (id == null) return null;

  const name = String(role.name ?? role.Name ?? '').trim();
  if (!name) return null;

  const permissionGroups = role.permissions ?? role.Permissions;
  const permissions = Array.isArray(permissionGroups)
    ? permissionGroups
      .map(normalizePermissionGroup)
      .filter((item): item is RolePermissionGroup => item !== null)
    : [];

  return {
    id: Number(id),
    status: Number(role.status ?? role.Status ?? 0),
    keyword: String(role.keyword ?? role.Keyword ?? ''),
    code: String(role.code ?? role.Code ?? ''),
    name,
    isAdmin: Boolean(role.isAdmin ?? role.IsAdmin ?? false),
    permissions,
  };
}

export function parseRoleQueryResponse(response: unknown): PagedRoleResponse | null {
  const body = response as { data?: { data?: PagedRoleResponse; items?: unknown[] } };
  const data = body?.data?.data ?? body?.data;

  if (!data || typeof data !== 'object' || !Array.isArray((data as PagedRoleResponse).items)) {
    return null;
  }

  const items = (data as PagedRoleResponse).items
    .map(normalizeRole)
    .filter((role): role is Role => role !== null);

  const paged = data as PagedRoleResponse;

  return {
    items,
    totalCount: Number(paged.totalCount ?? items.length),
    page: Number(paged.page ?? 0),
    pageSize: Number(paged.pageSize ?? items.length),
    totalPage: Number(paged.totalPage ?? 0),
    hasNextPage: Boolean(paged.hasNextPage),
    hasPreviousPage: Boolean(paged.hasPreviousPage),
  };
}

export function parseRoleItems(response: unknown): Role[] {
  return parseRoleQueryResponse(response)?.items ?? [];
}

/** GET /role/getbaseList — trả về mảng role dùng cho Select/filter. */
export function parseRoleOne(response: unknown): Role | null {
  const body = response as { data?: Record<string, unknown> | { data?: unknown } };
  const nested = body?.data;
  if (!nested || typeof nested !== 'object') return null;

  const payload = nested as Record<string, unknown>;
  const raw = payload.id != null ? payload : (payload.data ?? null);
  return normalizeRole(raw);
}

export function parsePermissionMenuList(response: unknown): RolePermissionGroup[] {
  const body = response as { data?: { data?: unknown[] } | unknown[] };
  const nested = body?.data;

  const rawList = Array.isArray(nested)
    ? nested
    : Array.isArray((nested as { data?: unknown[] })?.data)
      ? (nested as { data: unknown[] }).data
      : [];

  return rawList
    .map(normalizePermissionGroup)
    .filter((group): group is RolePermissionGroup => group !== null);
}

export function parseRoleBaseList(response: unknown): Role[] {
  const body = response as { data?: { data?: unknown } | unknown[] };
  const nested = body?.data;

  const rawList = Array.isArray(nested)
    ? nested
    : Array.isArray((nested as { data?: unknown[] })?.data)
      ? (nested as { data: unknown[] }).data
      : null;

  if (!rawList) {
    return parseRoleItems(response);
  }

  return rawList
    .map(normalizeRole)
    .filter((role): role is Role => role !== null);
}

export function findRoleById(items: Role[], roleId: number): Role | null {
  return items.find((role) => role.id === roleId) ?? null;
}

export async function fetchRoleById(roleId: string | number): Promise<Role | null> {
  const response = await roleApi.getRoleOne(roleId);
  return parseRoleOne(response);
}

export function applyRolePermissionSelection(
  groups: RolePermissionGroup[],
  selectedKeys: Set<string>,
) {
  groups.forEach((group) => {
    group.permissions.forEach((perm) => {
      const key = permissionKey(group.id, perm.id);
      perm.isAllow = selectedKeys.has(key);
    });
  });
}

export function collectAllowedPermissionKeys(groups: RolePermissionGroup[]): Set<string> {
  const keys = new Set<string>();
  groups.forEach((group) => {
    group.permissions.forEach((perm) => {
      if (perm.isAllow) {
        keys.add(permissionKey(group.id, perm.id));
      }
    });
  });
  return keys;
}

export function permissionKey(menuId: number, permissionId: number) {
  return `${menuId}-${permissionId}`;
}

export async function fetchRoleNameById(roleId: number): Promise<string | null> {
  const role = await fetchRoleById(roleId);
  return role?.name ?? null;
}
