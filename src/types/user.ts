export interface AuthUser {
  id: string | number;
  status: number;
  keyword: string;
  code: string;
  name: string;
  password: string;
  roleId: number;
  roleCode?: string;
  roleName?: string;
  isAdmin?: boolean;
  permissions?: AuthMenuPermission[];
  email?: string;
}

export interface AuthPermissionAction {
  id: number;
  code: string;
  name: string;
  isAllow: boolean;
}

export interface AuthMenuPermission extends AuthPermissionAction {
  permissions: AuthPermissionAction[];
}

export interface User extends AuthUser { }

export interface PagedUserResponse {
  items: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserQueryPayload {
  page: number;
  pageSize: number;
  keyword?: string;
  code?: string;
  name?: string;
  email?: string;
  status?: number;
  roleId?: number;
}

export interface UserCreatePayload {
  code: string;
  name: string;
  password: string;
  roleId: number;
  createdBy: string;
  updatedBy: string;
}

export interface UserUpdatePayload {
  code: string;
  name: string;
  password: string;
  roleId: number;
  updatedBy: string;
}

export interface UserDeletePayload {
  id: number;
}
