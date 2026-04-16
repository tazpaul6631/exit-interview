import request from "@/services/apiService";

export default {
    getInterview() {
        return request.get(`/interview/getblankinterview`, {})
    }
};