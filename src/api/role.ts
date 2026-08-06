import request from '@/services/apiService';
import type {
  RoleCreatePayload,
  RoleDeletePayload,
  RoleQueryPayload,
  RoleUpdatePayload,
  RoleViewQueryPayload,
} from '@/types/role';

export default {
  postRoleQueryResult(data: RoleQueryPayload) {
    return request.post('/role/queryresult', data);
  },
  postRoleViewQueryResult(data: RoleViewQueryPayload) {
    return request.post('/roleview/queryresult', data);
  },
  getRoleBaseList() {
    return request.get('/role/getbaseList');
  },
  getRoleOne(id: string | number) {
    return request.get(`/role/getone/${id}`);
  },
  postRoleCreate(data: RoleCreatePayload) {
    return request.post('/role/create', data, { withRequestBy: true });
  },
  patchRoleUpdate(id: string | number, data: RoleUpdatePayload) {
    return request.patch(`/role/update/${id}`, data, { withRequestBy: true });
  },
  deleteRoleById(id: string | number, data: RoleDeletePayload) {
    return request.delete(`/role/delete/${id}`, data, { withRequestBy: true });
  },
};
