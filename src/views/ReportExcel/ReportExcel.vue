<template>
  <ion-page>
    <div class="page-container flex-column-layout">
      <div class="table-responsive flex-column-layout">

        <DataTable :class="{ 'is-empty-table': employeeList.length === 0 }" v-model:filters="filters"
          v-model:first="first" :value="employeeList" lazy paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]"
          :totalRecords="totalRecords" dataKey="id" filterDisplay="row" :loading="isLoading"
          @page="onFilterChange($event)" @sort="onFilterChange($event)" @filter="onFilterChange($event)" scrollable
          scrollHeight="flex" class="full-height-table">

          <template #header>
            <div class="flex justify-content-end">
              <Button class="ml-3" type="button" icon="pi pi-filter-slash" label="Clear" variant="outlined"
                @click="clearFilter()" />
            </div>
          </template>

          <template #empty>
            <div class="empty-state">
              Không tìm thấy dữ liệu nhân viên.
            </div>
          </template>

          <Column v-for="col in tableColumns" :key="col.field" :field="col.field" :header="col.header"
            :style="{ minWidth: col.width }" :showFilterMenu="false">

            <template #body="{ data, index }">

              <template v-if="col.type === '#'">
                <span class="fw-bold">{{ first + index + 1 }}</span>
              </template>

              <template v-else-if="col.type === 'code'">
                <span class="fw-bold">{{ data[col.field] }}</span>
              </template>

              <template v-else-if="col.type === 'badge'">
                <span class="badge position">{{ data[col.field] }}</span>
              </template>

              <template v-else-if="col.type === 'date'">
                {{ format.formatDate(data[col.field]) }}
              </template>

              <template v-else>
                {{ data[col.field] }}
              </template>
            </template>

            <template #filter="{ filterModel, filterCallback }" v-if="col.filterable">

              <template v-if="col.type === 'date'">
                <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="Chọn ngày" class="w-full"
                  showClear @update:modelValue="filterCallback()" />
              </template>

              <template v-else-if="col.type === 'select'">
                <Select v-model="filterModel.value" :options="organizations" optionLabel="name" optionValue="id"
                  :placeholder="col.filterPlaceholder" class="w-full" :loading="isOrgLoading" showClear @show="onShow"
                  @change="filterCallback()" @clear="filterCallback()">
                </Select>
              </template>

              <template v-else>
                <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
                  :placeholder="col.filterPlaceholder" class="w-full" />
              </template>

            </template>
          </Column>

          <Column style="min-width: 5rem" class="text-center">
            <template #body="{ data }">
              <Button icon="pi pi-eye" severity="success" rounded variant="outlined" aria-label="Search"
                @click="handleSeen(data)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, onIonViewWillEnter } from '@ionic/vue';
import interviewView from "@/api/interviewView";
import organizationApi from "@/api/organization";
import { FilterMatchMode } from '@primevue/core/api';
import format from '@/mixins/format';

interface EmployeeRecord {
  id: number;
  employeeCode: string;
  employeeName: string;
  jobPositionName: string;
  organizationName: string;
  exitedAt: Date | null;
  createdAt: Date | null;
}

const employeeList = ref<EmployeeRecord[]>([]);
const organizations = ref<any[]>([]);
const isLoading = ref(false);
const filters = ref();
const totalRecords = ref(0);
const isOrgLoading = ref(false);
const first = ref(0);

const tableColumns = [
  { field: '#', header: '#', width: '2rem', type: '#' },
  { field: 'employeeCode', header: 'Mã NV', width: '8rem', type: 'code' },
  { field: 'employeeName', header: 'Họ Tên', width: '12rem', type: 'text' },
  { field: 'jobPositionName', header: 'Chức Vụ', width: '10rem', type: 'badge' },
  { field: 'organizationName', header: 'Phòng Ban', width: '12rem', type: 'select', filterable: true, filterPlaceholder: 'Chọn phòng ban' },
  { field: 'exitedAt', header: 'Ngày Nghỉ', width: '12rem', type: 'date', filterable: true },
  { field: 'createdAt', header: 'Ngày Tạo', width: '12rem', type: 'date', filterable: true }
];

const initFilters = () => {
  filters.value = {
    organizationName: { value: null, matchMode: FilterMatchMode.EQUALS },
    exitedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
    createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
  };
};

initFilters();

const onShow = async () => {
  if (organizations.value.length === 0) {
    await loadOrganizations();
  }
};

const loadOrganizations = async () => {
  isOrgLoading.value = true;
  try {
    const response = await organizationApi.postOrganization({});
    if (response?.data?.data) {
      organizations.value = response.data.data;
    }
  } catch (error) {
    console.error("Lỗi lấy danh sách phòng ban:", error);
  } finally {
    isOrgLoading.value = false;
  }
};

const getFormatRange = (dateValue: any) => {
  if (!dateValue || isNaN(new Date(dateValue).getTime())) {
    return { from: null, to: null };
  }
  const d = new Date(dateValue);
  return {
    from: new Date(d.setHours(0, 0, 0, 0)).toISOString(),
    to: new Date(d.setHours(23, 59, 59, 999)).toISOString()
  };
};

const isFiltering = () => {
  const f = filters.value;
  if (!f) return false;
  return !!(
    f.global?.value ||
    f.employeeCode?.value ||
    (f.organizationName?.value != null && f.organizationName?.value !== "") ||
    f.exitedAt?.value ||
    f.createdAt?.value
  );
};

const loadData = async (event?: any) => {
  isLoading.value = true;
  const f = filters.value;
  let response;

  try {
    if (!isFiltering()) {
      console.log("Payload gửi lên API (Mặc định / Clear):", JSON.stringify({}));
      response = await interviewView.postInterviewView({});
    }
    else {
      const payload: any = {};

      if (f.organizationName?.value != null && f.organizationName?.value !== "") {
        payload.organizationId = Number(f.organizationName.value);
      }

      const exitedRange = getFormatRange(f.exitedAt?.value);
      if (exitedRange.from && exitedRange.to) {
        payload.exitedAtFrom = exitedRange.from;
        payload.exitedAtTo = exitedRange.to;
      }

      const createdRange = getFormatRange(f.createdAt?.value);
      if (createdRange.from && createdRange.to) {
        payload.createdAtFrom = createdRange.from;
        payload.createdAtTo = createdRange.to;
      }

      console.log("Payload gửi lên API (Có filter):", JSON.stringify(payload, null, 2));
      response = await interviewView.postInterviewView(payload);
    }

    // Cập nhật dữ liệu lên Table
    if (response?.data?.data) {
      employeeList.value = response.data.data.map((emp: any) => ({
        ...emp,
        exitedAt: emp.exitedAt ? new Date(emp.exitedAt) : null,
        createdAt: emp.createdAt ? new Date(emp.createdAt) : null,
      }));
      totalRecords.value = response.data.total ?? response.data.data.length;
    } else {
      employeeList.value = [];
      totalRecords.value = 0;
    }
  } catch (error) {
    console.error("Lỗi API loadData:", error);
  } finally {
    isLoading.value = false;
  }
};

let timeout: any;
const onFilterChange = (event?: any) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    loadData(event);
  }, 500);
};

const clearFilter = () => {
  initFilters();
  loadData();
};

const handleSeen = (emp: EmployeeRecord) => {
  console.log('Xem chi tiết:', emp.employeeCode);
};

onMounted(() => {
});

onIonViewWillEnter(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.page-container {
  padding: 30px;
  height: 100vh;
  box-sizing: border-box;
}

.flex-column-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

:deep(.full-height-table) {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

:deep(.full-height-table .p-datatable-wrapper) {
  flex: 1;
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

.action-bar {
  display: flex;
  justify-content: end;
  margin-bottom: 24px;
  gap: 4px;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.table-subtitle {
  font-size: 0.875rem;
  color: #64748b;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.custom-table {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.custom-table thead th {
  background-color: #f8fafc;
  padding: 16px 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.custom-table td {
  padding: 18px 20px;
  font-size: 0.875rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.custom-table tbody tr:hover {
  background-color: #f1f5f9 !important;
  transition: background-color 0.2s ease;
}

.fw-bold {
  font-weight: 500;
}

.row-actions {
  display: flex;
  gap: 8px;
  justify-content: center;

  .action-btn {
    width: 36px;
    height: 36px;
    --border-radius: 50%;
    --padding-start: 0;
    --padding-end: 0;

    margin: 0;
  }

  .action-btn ion-icon {
    font-size: 18px;
  }
}

.badge.position {
  background-color: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.wrap-text {
  min-width: 150px;
  max-width: 250px;
  white-space: normal !important;
  word-break: break-word;
  line-height: 1.5;
}

.empty-state {
  padding: 40px;
  color: #94a3b8;
  font-style: italic;
  text-align: center;
  font-size: 1rem;
}

:deep(.is-empty-table .p-datatable-table-container) {
  flex-direction: row !important;
}
</style>