<template>
  <ion-page>
    <div class="page-container">
      <ion-header class="ion-no-border header-transparent">
        <ion-toolbar>
          <ion-title class="page-main-title">Quản Lý Nhân Sự</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="action-bar">
        <div class="table-title">Dữ Liệu Nghỉ Việc</div>
        <div class="table-subtitle">Danh sách nhân sự đã hoàn tất thủ tục nghỉ việc</div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.field" :class="{ 'text-center col-actions': col.isAction }">
                {{ col.headerName }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(emp, index) in mockData" :key="index">

              <td v-for="col in columns" :key="col.field" :class="getColumnClass(col.field)"
                :title="emp[col.field as keyof EmployeeRecord]">
                <template v-if="col.isAction">
                  <div class="row-actions">
                    <ion-button fill="outline" color="success" size="small" class="action-btn" @click="handleSeen(emp)">
                      <ion-icon slot="start" :icon="eyeOutline"></ion-icon>
                      Seen
                    </ion-button>
                    <ion-button fill="solid" color="primary" size="small" class="action-btn" @click="handleExport(emp)">
                      <ion-icon slot="start" :icon="downloadOutline"></ion-icon>
                      Export
                    </ion-button>
                  </div>
                </template>

                <template v-else-if="col.field === 'JobPositionName'">
                  <span class="badge position">{{ emp[col.field as keyof EmployeeRecord] }}</span>
                </template>

                <template v-else>
                  {{ emp[col.field as keyof EmployeeRecord] }}
                </template>
              </td>

            </tr>
            <tr v-if="mockData.length === 0">
              <td :colspan="columns.length" class="text-center no-data">
                <div class="empty-state">
                  <p>Không có dữ liệu nào để hiển thị</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon
} from '@ionic/vue';
import { downloadOutline, eyeOutline } from 'ionicons/icons';

// Thêm Interface này vào phần khai báo type
interface TableColumn {
  field: string;      // Tên trường dữ liệu (key) tương ứng trong mockData
  headerName: string; // Tên hiển thị trên Tiêu đề bảng
  isAction?: boolean; // Cờ đánh dấu đây là cột chứa Nút bấm
}

// Khai báo biến columns (Sẽ được gán data khi gọi API)
const columns = ref<TableColumn[]>([]);

// Giả lập hàm gọi API lấy danh sách cột
const fetchColumnsFromAPI = () => {
  // Dữ liệu này thực tế sẽ lấy từ Axios/Fetch
  columns.value = [
    { field: 'EmployeeCode', headerName: 'Mã NV' },
    { field: 'EmployeeName', headerName: 'Họ Tên' },
    { field: 'JobPositionName', headerName: 'Chức Vụ' },
    { field: 'OrganizationName', headerName: 'Phòng Ban' },
    { field: 'ExitedDate', headerName: 'Ngày Nghỉ' },
    { field: 'CreatedDate', headerName: 'Ngày Tạo' },
    { field: 'actions', headerName: '', isAction: true } // Cột hành động
  ];
};

// Gọi hàm khi component load (nếu cần)
fetchColumnsFromAPI();

// Thêm hàm này vào script setup
const getColumnClass = (field: string) => {
  if (field === 'EmployeeCode') return 'fw-bold';
  if (field === 'EmployeeName' || field === 'JobPositionName' || field === 'OrganizationName') return 'wrap-text';
  if (field === 'actions') return 'td-actions col-actions';
  return '';
};

interface EmployeeRecord {
  EmployeeCode: string;
  EmployeeName: string;
  JobPositionName: string;
  OrganizationName: string;
  ExitedDate: string;
  CreatedDate: string;
}

const mockData = ref<EmployeeRecord[]>([
  {
    EmployeeCode: 'R39557',
    EmployeeName: 'Thuận Cheater',
    JobPositionName: 'Developer',
    OrganizationName: 'IT Department',
    ExitedDate: '2026-04-15',
    CreatedDate: '2026-04-10',
  },
  {
    EmployeeCode: 'JH002',
    EmployeeName: 'Tony Tèo',
    JobPositionName: 'HR Specialist',
    OrganizationName: 'HR Management',
    ExitedDate: '2026-04-16',
    CreatedDate: '2026-04-12',
  },
  {
    EmployeeCode: 'R39558',
    EmployeeName: 'Nguyễn Thị Tony Tèo Nguyễn Thị Tony Tèo Nguyễn Thị Tony Tèo Nguyễn Thị Tony TèoNguyễn Thị Tony Tèo Nguyễn Thị Tony TèoNguyễn Thị Tony Tèo Nguyễn Thị Tony TèoNguyễn Thị Tony Tèo Nguyễn Thị Tony TèoNguyễn Thị Tony Tèo Nguyễn Thị Tony Tèo',
    JobPositionName: 'HR Specialist',
    OrganizationName: 'HR Management',
    ExitedDate: '2026-04-16',
    CreatedDate: '2026-04-12',
  },
  {
    EmployeeCode: 'JH005',
    EmployeeName: 'Trần Trung Trí Tony Tèo',
    JobPositionName: 'Project Manager',
    OrganizationName: 'Product Team',
    ExitedDate: '2026-04-16',
    CreatedDate: '2026-04-12',
  },
  {
    EmployeeCode: 'JH009',
    EmployeeName: 'Lê Văn Luyện',
    JobPositionName: 'Tester',
    OrganizationName: 'Quality Assurance',
    ExitedDate: '2026-04-16',
    CreatedDate: '2026-04-12',
  },
  {
    EmployeeCode: 'R39558',
    EmployeeName: 'Nguyễn Thị Tony Tèo Nguyễn Thị Tony Tèo',
    JobPositionName: 'HR Specialist',
    OrganizationName: 'HR Management',
    ExitedDate: '2026-04-16',
    CreatedDate: '2026-04-12',
  },
  {
    EmployeeCode: 'JH005',
    EmployeeName: 'Trần Trung Trí Tony Tèo',
    JobPositionName: 'Project Manager',
    OrganizationName: 'Product Team',
    ExitedDate: '2026-04-16',
    CreatedDate: '2026-04-12',
  },
  {
    EmployeeCode: 'JH009',
    EmployeeName: 'Lê Văn Luyện',
    JobPositionName: 'Tester',
    OrganizationName: 'Quality Assurance',
    ExitedDate: '2026-04-16',
    CreatedDate: '2026-04-12',
  },
  {
    EmployeeCode: 'R39558',
    EmployeeName: 'Nguyễn Thị Tony Tèo Nguyễn Thị Tony Tèo',
    JobPositionName: 'HR Specialist',
    OrganizationName: 'HR Management',
    ExitedDate: '2026-04-16',
    CreatedDate: '2026-04-12',
  },
  {
    EmployeeCode: 'JH005',
    EmployeeName: 'Trần Trung Trí Tony Tèo',
    JobPositionName: 'Project Manager',
    OrganizationName: 'Product Team',
    ExitedDate: '2026-04-16',
    CreatedDate: '2026-04-12',
  },
  {
    EmployeeCode: 'JH009',
    EmployeeName: 'Lê Văn Luyện',
    JobPositionName: 'Tester',
    OrganizationName: 'Quality Assurance',
    ExitedDate: '2026-04-16',
    CreatedDate: '2026-04-12',
  }
]);

const handleSeen = (emp: EmployeeRecord) => {
  console.log('Xem chi tiết nhân viên:', emp.EmployeeCode);
};

const handleExport = (emp: EmployeeRecord) => {
  console.log('Xuất dữ liệu cho nhân viên:', emp.EmployeeCode);
};
</script>

<style scoped>
.page-container {
  padding: 30px;
}

.header-transparent {
  --background: transparent;
  padding-bottom: 10px;
}

.page-main-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
  padding: 0;
}

/* Tiêu đề bảng */
.action-bar {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
  gap: 4px;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.table-subtitle {
  font-size: 0.875rem;
  color: #64748b;
}

/* Card chứa Bảng - Thiết kế bóng bẩy */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

/* Cấu trúc Table */
.custom-table {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  /* Chuyển sang separate để dùng sticky header đẹp hơn */
  border-spacing: 0;
  text-align: left;
}

/* Sticky Header (Đóng băng dòng tiêu đề khi cuộn) */
.custom-table thead th {
  background-color: #f8fafc;
  /* Màu nền mờ nhạt */
  padding: 16px 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 0 #e2e8f0;
}

/* Các ô dữ liệu */
.custom-table td {
  padding: 18px 20px;
  font-size: 0.875rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  /* Viền siêu nhạt */
  vertical-align: middle;
}

/* Xóa viền dòng cuối cùng để không lẹm vào border-radius */
.custom-table tbody tr:last-child td {
  border-bottom: none;
}

/* Hiệu ứng hover siêu mượt */
.custom-table tbody tr {
  transition: background-color 0.2s ease;
}

.custom-table tbody tr:hover {
  background-color: #f8fafc;
}

/* Màu xen kẽ cho các dòng chẵn */
.custom-table tbody tr:nth-child(even) {
  background-color: #f8fafc;
}

/* Tùy chọn: Đổi màu cho dòng lẻ nếu muốn */
.custom-table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}

/* Đảm bảo hiệu ứng hover (khi rê chuột vào) vẫn nổi bật đè lên màu chẵn/lẻ */
.custom-table tbody tr:hover {
  background-color: #f1f5f9 !important;
}

/* --- Tinh chỉnh Typography (Chữ) --- */
.fw-bold {
  font-weight: 600;
  color: #0f172a;
  font-family: monospace;
  /* Font mã NV gọn gàng */
  font-size: 0.95rem;
}

.emp-name {
  font-weight: 500;
  color: #1e293b;
}

.text-muted {
  color: #64748b;
}

.date-text {
  color: #475569;
  font-variant-numeric: tabular-nums;
  /* Giữ các số thẳng hàng đều nhau */
}

/* Nút Hành động */
.row-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.action-btn {
  --border-radius: 6px;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0;
}

/* Badge (Huy hiệu) Premium */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  /* Tròn hình viên thuốc */
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge.position {
  background-color: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

/* Tiện ích (Utilities) */
.col-actions {
  width: 1%;
  white-space: nowrap;
}

.wrap-text {
  min-width: 150px;
  max-width: 250px;
  white-space: normal !important;
  word-break: break-word;
  line-height: 1.5;
}

.text-center {
  text-align: center;
}

.empty-state {
  padding: 40px;
  color: #94a3b8;
  font-style: italic;
}

/* --- Custom Scrollbar phong cách macOS --- */
.table-responsive::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.table-responsive::-webkit-scrollbar-track {
  background: transparent;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
  border: 3px solid #ffffff;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>