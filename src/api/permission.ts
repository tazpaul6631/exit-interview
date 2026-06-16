import request from '@/services/apiService';
import type { PermissionBaseListPayload } from '@/types/permission';

export default {
  postPermissionBaseList(data: PermissionBaseListPayload = { active: true }) {
    return request.post('/permission/getbaselist', data);
  },
};
