<template>
  <ion-page class="list-exit-interview-page">
    <div class="page-container flex-column-layout">
      <div class="table-responsive flex-column-layout">

        <DataTable :class="{ 'is-empty-table': employeeList.length === 0 }" v-model:filters="filters"
          v-model:first="first" :value="employeeList" lazy paginator :rows="rows" :rowsPerPageOptions="[10, 20, 50]"
          :totalRecords="totalRecords" dataKey="id" filterDisplay="row" scrollable scrollHeight="flex"
          class="full-height-table compact-table" showGridlines
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Hiển thị {first} đến {last} trên {totalRecords} dữ liệu" @page="onPageChange"
          @filter="onTableFilter" @sort="onTableFilter">

          <template #header>
            <div class="table-toolbar">
              <Button type="button" outlined size="small" class="toolbar-btn toolbar-btn--export" :loading="isExporting"
                :disabled="isExporting" @click="exportExcel">
                <i class="pi pi-file-excel toolbar-btn__icon" aria-hidden="true"></i>
                <span class="toolbar-btn__label">Xuất Excel</span>
              </Button>
              <Button type="button" outlined size="small" class="toolbar-btn toolbar-btn--clear" @click="clearFilter">
                <i class="pi pi-filter-slash toolbar-btn__icon" aria-hidden="true"></i>
                <span class="toolbar-btn__label">Xóa lọc</span>
              </Button>
            </div>
          </template>

          <template #empty>
            <div style="text-align: center; height: 300px; align-content: center;">
              <i class="pi pi-inbox" style="font-size: 2rem; color: #9ca3af; margin-bottom: 1rem;"></i>
              <p style="margin: 0; color: #6b7280;"> Không tìm thấy dữ liệu nhân viên.</p>
            </div>
          </template>

          <Column v-for="col in tableColumns" :key="col.field" :field="col.field" :header="col.header"
            :style="{ width: col.width }" :showFilterMenu="false"
            :filterFunction="col.filterable ? serverFilterPassthrough : undefined">

            <template #body="{ data, index }">
              <template v-if="col.type === '#'">
                <Skeleton v-if="isLoading" width="2rem" height="1rem" />
                <span v-else class="fw-bold">{{ first + index + 1 }}</span>
              </template>

              <template v-else-if="col.type === 'code'">
                <Skeleton v-if="isLoading" width="100%" height="1rem" />
                <span v-else class="fw-bold">{{ data[col.field] }}</span>
              </template>

              <template v-else-if="col.type === 'badge'">
                <Skeleton v-if="isLoading" width="100%" height="1rem" />
                <span v-else>{{ data[col.field] }}</span>
              </template>

              <template v-else-if="col.type === 'date'">
                <Skeleton v-if="isLoading" width="100%" height="1rem" />
                <span v-else>{{ format.formatDate(data[col.field]) }}</span>
              </template>

              <template v-else>
                <Skeleton v-if="isLoading" width="100%" height="1rem" />
                <span v-else>{{ data[col.field] }}</span>
              </template>
            </template>

            <template #filter="{ filterModel, filterCallback }" v-if="col.filterable">
              <template v-if="col.type === 'date'">
                <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="Chọn ngày" class="w-full"
                  showClear showIcon @update:modelValue="onDateFilterChange(filterCallback)" />
              </template>

              <template v-else-if="col.type === 'multiselect'">
                <MultiSelect v-model="filterModel.value" :options="orgSelectOptions" optionLabel="name" optionValue="id"
                  :loading="isOrgLoading" :placeholder="isOrgLoading ? 'Đang tải phòng ban...' : col.filterPlaceholder"
                  class="org-filter-multiselect" display="chip" filter showClear :maxSelectedLabels="1"
                  @show="onOrgMultiselectShow" @change="onOrgFilterApply(filterCallback)"
                  @clear="onOrgFilterApply(filterCallback)" @hide="onOrgFilterApply(filterCallback)" />
              </template>

              <template v-else>
                <InputText v-model="filterModel.value" type="text" :placeholder="col.filterPlaceholder" class="w-full"
                  @update:modelValue="onTextFilterInput(filterCallback)" />
              </template>

            </template>
          </Column>

          <Column class="text-center" style="width: 150px">
            <template #body="{ data }">
              <div class="row-actions">
                <Button icon="pi pi-file-word" size="small" severity="info" rounded outlined aria-label="Xuất Word"
                  :loading="isRowExporting(data.id, 'word')" :disabled="!!exportingRowKey" @click="exportWord(data)" />
                <Button icon="pi pi-file-pdf" size="small" severity="danger" rounded outlined aria-label="Xuất PDF"
                  :loading="isRowExporting(data.id, 'pdf')" :disabled="!!exportingRowKey" @click="exportPdf(data)" />
                <Button icon="pi pi-eye" size="small" severity="secondary" rounded outlined aria-label="Xem chi tiết"
                  @click="handleSeen(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, onIonViewWillEnter } from '@ionic/vue';
import interviewView from "@/api/interviewView";
import organizationApi from "@/api/organization";
import reportApi, { type ReportExcelPayload } from "@/api/report";
import {
  buildReportWorkbook,
  downloadReportWorkbook,
  extractReportData,
  getDefaultReportFilename,
} from "@/utils/reportExcelBuilder";
import { FilterMatchMode } from '@primevue/core/api';
import {
  exportInterviewPdf,
  exportInterviewWord,
} from '@/utils/interviewDocumentExport';
import format from '@/mixins/format';

interface EmployeeRecord {
  id: number;
  employeeCode: string;
  employeeName: string;
  jobPositionName: string;
  organizationId?: number;
  organizationName: string;
  exitedAt: Date | null;
  createdAt: Date | null;
  sections?: unknown[];
}

interface InterviewViewPagedData {
  items: EmployeeRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const router = useRouter();
const employeeList = ref<EmployeeRecord[]>([]);
const organizations = ref<any[]>([]);
const isLoading = ref(false);
const isExporting = ref(false);
const exportingRowKey = ref<string | null>(null);
const filters = ref();
const totalRecords = ref(0);
const isOrgLoading = ref(false);
let orgLoadPromise: Promise<void> | null = null;
const first = ref(0);

const orgSelectOptions = computed(() => (isOrgLoading.value ? [] : organizations.value));
const rows = ref(10);

/** Lazy + server filter: không lọc client, chỉ dùng totalCount từ API */
const serverFilterPassthrough = () => true;

const tableColumns = [
  { field: '#', header: '#', width: '2rem', type: '#' },
  {
    field: 'employeeCode',
    header: 'Mã NV',
    width: 'auto',
    type: 'code',
    filterable: true,
    filterPlaceholder: 'Tìm mã NV',
  },
  {
    field: 'employeeName',
    header: 'Họ Tên',
    width: 'auto',
    type: 'text',
    filterable: true,
    filterPlaceholder: 'Tìm họ tên',
  },
  {
    field: 'jobPositionName',
    header: 'Chức Vụ',
    width: 'auto',
    type: 'badge',
    filterable: true,
    filterPlaceholder: 'Tìm chức vụ',
  },
  { field: 'organizationName', header: 'Phòng Ban', width: '180px', type: 'multiselect', filterable: true, filterPlaceholder: 'Chọn phòng ban' },
  { field: 'exitedAt', header: 'Ngày Nghỉ', width: '250px', type: 'date', filterable: true },
  { field: 'createdAt', header: 'Ngày Tạo', width: '250px', type: 'date', filterable: true }
];

const TEXT_FILTER_FIELDS = ['employeeCode', 'employeeName', 'jobPositionName'] as const;

const initFilters = () => {
  filters.value = {
    employeeCode: { value: null, matchMode: FilterMatchMode.CONTAINS },
    employeeName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jobPositionName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    organizationName: { value: [], matchMode: FilterMatchMode.IN },
    exitedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
    createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
  };
};

initFilters();

/** Mỗi lần mở MultiSelect: gọi POST /organization/getbaselist */
const loadOrganizations = async () => {
  if (isOrgLoading.value && orgLoadPromise) {
    return orgLoadPromise;
  }

  isOrgLoading.value = true;
  organizations.value = [];

  orgLoadPromise = (async () => {
    try {
      const response = await organizationApi.postOrganization({ active: true });
      if (response?.data?.data) {
        organizations.value = response.data.data;
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách phòng ban:', error);
    } finally {
      isOrgLoading.value = false;
      orgLoadPromise = null;
    }
  })();

  return orgLoadPromise;
};

const onOrgMultiselectShow = () => {
  loadOrganizations();
};

/** Chọn/xóa phòng ban xong → fetch table với organizationIds trong payload */
const onOrgFilterApply = async (filterCallback?: () => void) => {
  filterCallback?.();
  await nextTick();
  scheduleFilterLoad(true);
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

const appendFilterFields = (payload: ReportExcelPayload) => {
  const f = filters.value;

  TEXT_FILTER_FIELDS.forEach((field) => {
    const raw = f[field]?.value;
    const value = raw != null ? String(raw).trim() : '';
    if (value) {
      (payload as Record<string, string>)[field] = value;
    }
  });

  const orgIds = f.organizationName?.value;
  if (Array.isArray(orgIds) && orgIds.length > 0) {
    payload.organizationIds = orgIds
      .map((id: number | string) => Number(id))
      .filter((id) => !Number.isNaN(id));
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
};

const buildExportPayload = (): ReportExcelPayload => {
  const payload: ReportExcelPayload = {};
  appendFilterFields(payload);
  return payload;
};

const buildPayload = (event?: any) => {
  const pageSize = event?.rows ?? rows.value;
  if (event?.rows != null) {
    rows.value = event.rows;
  }

  const page = event?.page != null
    ? event.page + 1
    : Math.floor(first.value / pageSize) + 1;

  const payload: Record<string, unknown> = { page, pageSize };
  appendFilterFields(payload);
  return payload;
};

const parsePagedResult = (response: any): InterviewViewPagedData | null => {
  const data = response?.data?.data ?? response?.data;
  if (!data || !Array.isArray(data.items)) {
    return null;
  }
  return data as InterviewViewPagedData;
};

const loadData = async (event?: { page?: number; rows?: number }) => {
  isLoading.value = true;

  try {
    const payload = buildPayload(event);
    const response = await interviewView.postInterviewView(payload);
    const result = parsePagedResult(response);

    if (result) {
      employeeList.value = result.items.map((emp) => ({
        ...emp,
        exitedAt: emp.exitedAt ? new Date(emp.exitedAt) : null,
        createdAt: emp.createdAt ? new Date(emp.createdAt) : null,
      }));
      totalRecords.value = Number(result.totalCount) || 0;

      if (result.page != null && result.pageSize != null) {
        first.value = Math.max(0, (result.page - 1) * result.pageSize);
        rows.value = result.pageSize;
      }
    } else {
      employeeList.value = [];
      totalRecords.value = 0;
    }
  } catch (error) {
    console.error('Lỗi API loadData:', error);
    employeeList.value = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
  }
};

let filterDebounce: ReturnType<typeof setTimeout> | undefined;

const scheduleFilterLoad = (resetPage = true) => {
  clearTimeout(filterDebounce);
  filterDebounce = setTimeout(() => {
    if (resetPage) {
      first.value = 0;
    }
    loadData();
  }, 500);
};

const onTableFilter = () => {
  scheduleFilterLoad(true);
};

const onPageChange = (event: { page: number; rows: number }) => {
  clearTimeout(filterDebounce);
  loadData(event);
};

const onTextFilterInput = (filterCallback?: () => void) => {
  filterCallback?.();
  scheduleFilterLoad(true);
};

const onDateFilterChange = (filterCallback?: () => void) => {
  filterCallback?.();
  scheduleFilterLoad(true);
};

const clearFilter = () => {
  initFilters();
  first.value = 0;
  organizations.value = [];
  loadData();
};

const handleSeen = (emp: EmployeeRecord) => {
  router.push({ name: 'DetailExitInterview', params: { id: String(emp.id) } });
};

type RowExportType = 'word' | 'pdf';

const isRowExporting = (id: number, type: RowExportType) =>
  exportingRowKey.value === `${id}:${type}`;

const runRowExport = async (
  emp: EmployeeRecord,
  type: RowExportType,
  exporter: (id: number) => Promise<void>,
) => {
  if (exportingRowKey.value) return;

  exportingRowKey.value = `${emp.id}:${type}`;
  try {
    await exporter(emp.id);
  } catch (error: unknown) {
    console.error(`Lỗi xuất ${type.toUpperCase()}:`, error);
    const message =
      error instanceof Error
        ? error.message
        : `Không thể xuất file ${type === 'word' ? 'Word' : 'PDF'}. Vui lòng thử lại.`;
    alert(message);
  } finally {
    exportingRowKey.value = null;
  }
};

const exportWord = (emp: EmployeeRecord) => runRowExport(emp, 'word', exportInterviewWord);
const exportPdf = (emp: EmployeeRecord) => runRowExport(emp, 'pdf', exportInterviewPdf);

const exportExcel = async () => {
  if (isExporting.value) return;

  isExporting.value = true;
  try {
    const payload = buildExportPayload();
    const response = await reportApi.postExcel(payload);
    const reportData = extractReportData(response?.data?.data);
    const workbook = await buildReportWorkbook(reportData);
    await downloadReportWorkbook(workbook, getDefaultReportFilename());
  } catch (error: unknown) {
    console.error('Lỗi xuất Excel:', error);
    const message = error instanceof Error ? error.message : 'Không thể xuất file Excel. Vui lòng thử lại.';
    alert(message);
  } finally {
    isExporting.value = false;
  }
};

onMounted(() => {
});

onIonViewWillEnter(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.list-exit-interview-page {
  height: calc(100dvh - 70px - 44px - 50px - 50px) !important;
  min-height: 420px;
  max-height: calc(100dvh - 70px - 44px - 50px - 50px);
  overflow: hidden !important;
}

.page-container {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.flex-column-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

:deep(.full-height-table.p-datatable-flex-scrollable) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}

:deep(.full-height-table) {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

:deep(.full-height-table .p-datatable-table-container) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.full-height-table .p-datatable-scrollable-body) {
  flex: 1;
  min-height: 0;
}

:deep(.full-height-table .p-datatable-scrollable-body-table) {
  height: auto !important;
}

:deep(.compact-table .p-datatable-tbody > tr) {
  height: auto !important;
}

:deep(.compact-table .p-datatable-tbody > tr > td) {
  padding: 0.375rem 0.625rem;
  line-height: 1.35;
  vertical-align: middle;
  white-space: nowrap;
}

:deep(.compact-table .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.625rem;
}

:deep(.compact-table .p-datatable-thead > tr.p-datatable-filter-row > th) {
  padding: 0.375rem 0.625rem;
}

:deep(.compact-table .row-actions) {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
}

:deep(.compact-table .row-actions .p-button) {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
}

:deep(.full-height-table .p-datatable-header) {
  flex-shrink: 0;
}

:deep(.full-height-table .p-paginator) {
  flex-shrink: 0;
}

:deep(.full-height-table .p-datatable-scrollable-table > .p-datatable-thead) {
  position: sticky;
  top: 0;
  z-index: 3;
}

:deep(.full-height-table .p-datatable-scrollable-table > .p-datatable-thead > tr > th) {
  background: #f8fafc;
}

:deep(.full-height-table .p-datatable-scrollable-table > .p-datatable-thead > tr.p-datatable-filter-row > th) {
  background: #ffffff;
  z-index: 2;
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
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  border-radius: 30px;
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
  gap: 0.375rem;
  justify-content: center;
  align-items: center;

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

/* Width cố định — không co giãn theo chip / placeholder */
:deep(.org-filter-multiselect) {
  width: 14rem;
  min-width: 14rem;
  max-width: 14rem;
  display: inline-flex;

  .p-multiselect-label-container {
    overflow: hidden;
    flex: 1;
    min-width: 0;
  }

  .p-multiselect-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.625rem;
  padding: 0.375rem 0.25rem;
}

:deep(.table-toolbar .toolbar-btn.p-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.4375rem 0.875rem;
  min-height: 2.25rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  box-shadow: none;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  .p-button-label {
    padding: 0;
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.25;
  }

  &:enabled:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #1e293b;
  }

  &:enabled:active {
    background: #f1f5f9;
  }

  &:disabled {
    opacity: 0.65;
  }
}

:deep(.table-toolbar .toolbar-btn__icon) {
  font-size: 1rem;
  line-height: 1;
}

:deep(.table-toolbar .toolbar-btn__label) {
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

:deep(.table-toolbar .toolbar-btn--export) {
  .toolbar-btn__icon {
    color: #059669;
  }

  &:enabled:hover {
    background: #ecfdf5;
    border-color: #6ee7b7;
    color: #047857;

    .toolbar-btn__icon {
      color: #047857;
    }
  }
}

:deep(.table-toolbar .toolbar-btn--clear) {
  .toolbar-btn__icon {
    color: #64748b;
  }

  &:enabled:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #475569;
  }
}
</style>