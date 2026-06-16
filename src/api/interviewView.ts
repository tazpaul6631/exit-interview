import request from "@/services/apiService";

export default {
    getInterviewView(id: any) {
        return request.get(`/interviewview/getone/${id}`)
    },
    postInterviewView(data: any) {
        return request.post(`/interviewview/queryresult`, data)
    }
};