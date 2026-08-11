import request from "@/services/apiService";

export default {
    postJobPosition(data: any) {
        return request.post(`/jobposition/getbaselist`, data)
    },
    postJobPositionCreate(data: any) {
        return request.post(`/jobposition/create`, data, { withRequestBy: true })
    },
    postJobPositionUpdate(id: any, data: any) {
        return request.patch(`/jobposition/update/${id}`, data, { withRequestBy: true })
    },
    postJobPositionDelete(id: any, data: any) {
        return request.delete(`/jobposition/delete/${id}`, data, { withRequestBy: true })
    }
};