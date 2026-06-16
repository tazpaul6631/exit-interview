import request from "@/services/apiService";

export default {
    getMenuPermission() {
        return request.get(`/menu/getmenupermission`, {})
    }
};