import request from "@/services/apiService";

export interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

import type {
    UserCreatePayload,
    UserDeletePayload,
    UserQueryPayload,
    UserUpdatePayload,
} from '@/types/user';

export default {
    postUserValidate(data: any) {
        return request.post(`/user/validate`, data)
    },
    postChangePassword(id: string | number, data: ChangePasswordPayload) {
        return request.patch(`/user/changepassword/${id}`, data, { withRequestBy: true })
    },
    postUserQueryResult(data: UserQueryPayload) {
        return request.post(`/user/queryresult`, data)
    },
    getUserOne(id: string | number) {
        return request.get(`/user/getone/${id}`)
    },
    postUserCreate(data: UserCreatePayload) {
        return request.post(`/user/create`, data, { withRequestBy: true })
    },
    patchUserUpdate(id: string | number, data: UserUpdatePayload) {
        return request.patch(`/user/update/${id}`, data, { withRequestBy: true })
    },
    deleteUserById(id: string | number, data: UserDeletePayload) {
        return request.delete(`/user/delete/${id}`, data, { withRequestBy: true })
    },
};