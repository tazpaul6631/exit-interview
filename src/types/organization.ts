export interface Organization {
  id: number;
  status: number;
  keyword: string;
  code: string;
  name: string;
  priority: number;
  isActive: boolean;
}

export interface OrganizationPagedData {
  items: Organization[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OrganizationQueryPayload {
  page: number;
  pageSize: number;
  code?: string;
  name?: string;
  keyword?: string;
  isActive?: boolean;
}

export interface OrganizationCreatePayload {
  name: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationUpdatePayload {
  name: string;
  priority: number;
  isActive: boolean;
  updatedBy: string;
  updatedAt?: string;
}

export interface OrganizationDeletePayload {
  updatedBy: string;
  updatedAt?: string;
}

export interface OrganizationImportPayload {
  priority: number;
  name: string;
  isActive: boolean;
  importBy: string;
}
