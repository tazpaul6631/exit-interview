import request from "@/services/apiService";

export interface ReportExcelPayload {
    employeeCode?: string;
    employeeName?: string;
    jobPositionName?: string;
    organizationIds?: number[];
    exitedAtFrom?: string;
    exitedAtTo?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
}

export default {
    postExcel(data: ReportExcelPayload) {
        return request.post(`/report/excel`, data);
    },
    getTotalAppData() {
        return request.get(`/report/totalappdata`);
    },
    getLrChartData() {
        return request.get(`/report/lrchartdata`);
    },
    getRatingChartData() {
        return request.get(`/report/rchartdata`);
    },
};