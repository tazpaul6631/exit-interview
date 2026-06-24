import request from '@/services/apiService';
import type {
    OrganizationCreatePayload,
    OrganizationDeletePayload,
    OrganizationImportPayload,
    OrganizationQueryPayload,
    OrganizationUpdatePayload,
} from '@/types/organization';

export default {
    postOrganizationQueryResult(data: OrganizationQueryPayload) {
        return request.post('/organization/queryresult', data);
    },
    postOrganization(data: Record<string, unknown>) {
        return request.post('/organization/getbaselist', data);
    },
    getOrganizationOne(id: string | number) {
        return request.get(`/organization/getone/${id}`);
    },
    postOrganizationCreate(data: OrganizationCreatePayload) {
        return request.post('/organization/create', data);
    },
    patchOrganizationUpdate(id: string | number, data: OrganizationUpdatePayload) {
        return request.patch(`/organization/update/${id}`, data);
    },
    deleteOrganizationById(id: string | number, data: OrganizationDeletePayload) {
        return request.delete(`/organization/delete/${id}`, data);
    },
    postOrganizationImport(data: OrganizationImportPayload[]) {
        return request.post('/organization/import', data);
    },
};