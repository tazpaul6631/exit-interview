export interface RolePermissionLeaf {
  id: number;
  code: string;
  name: string;
  isAllow: boolean;
}

export interface RolePermissionGroup {
  id: number;
  code: string;
  name: string;
  permissions: RolePermissionLeaf[];
}

export interface Role {
  id: number;
  status: number;
  keyword: string;
  code: string;
  name: string;
  isAdmin: boolean;
  permissions: RolePermissionGroup[];
}

export interface PagedRoleResponse {
  items: Role[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RoleQueryPayload {
  page: number;
  pageSize: number;
  keyword?: string;
  code?: string;
  name?: string;
  isAdmin?: boolean;
}

export interface RolePermissionPayload {
  roleId: number;
  menuId: number;
  permissionId: number;
  createdBy: string;
}

export interface RoleCreatePayload {
  name: string;
  isAdmin: boolean;
  createdBy: string;
  updatedBy: string;
  rolePermissions: RolePermissionPayload[];
}

export interface RoleUpdatePayload {
  name: string;
  isAdmin: boolean;
  updatedBy: string;
  rolePermissions: RolePermissionPayload[];
}

export interface RoleDeletePayload {
  updatedBy: string;
}

export interface RoleApiResponse {
  success: boolean;
  message: string;
  data: PagedRoleResponse;
}
