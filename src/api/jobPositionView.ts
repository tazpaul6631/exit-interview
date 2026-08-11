import request from "@/services/apiService";

export default {
    postJobPositionView(data: any) {
        return request.post(`/jobpositionview/queryresult`, data)
    }
};  