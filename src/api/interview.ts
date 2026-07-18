import request from "@/services/apiService";
import type { InterviewUpdatePayload } from '@/types/interview';

export default {
    getInterview() {
        return request.get(`/interview/getblankinterview`, {})
    },
    postCreateInterview(data: any) {
        return request.post(`/interview/create`, data, { withRequestBy: true })
    },
    patchUpdateInterview(data: InterviewUpdatePayload) {
        return request.patch(`/interview/update/${data.id}`, data, { withRequestBy: true });
    },
};