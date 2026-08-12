<template>
  <ion-page class="list-exit-interview-page">
    <div class="page-container flex-column-layout">
      <div class="table-responsive flex-column-layout">

        <DataTable :class="{ 'is-empty-table': employeeList.length === 0 }" v-model:filters="filters"
          v-model:first="first" :value="employeeList" lazy paginator :rows="rows" :rowsPerPageOptions="[13, 20, 50]"
          :totalRecords="totalRecords" dataKey="id" filterDisplay="row" scrollable scrollHeight="flex"
          class="full-height-table compact-table" showGridlines
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :currentPageReportTemplate="t('exit_interview.page_report', { first: first + 1, last: first + rows, totalRecords: totalRecords })"
          @page="onPageChange" @filter="onTableFilter" @sort="onTableFilter">

          <template #header>
            <div class="table-toolbar">
              <Button v-if="canExport && !isExporting" type="button" outlined size="small"
                class="toolbar-btn toolbar-btn--export" :loading="isExporting" @click="exportExcel">
                <i class="pi pi-file-excel toolbar-btn__icon" aria-hidden="true"></i>
                <span class="toolbar-btn__label">{{ t('exit_interview.export_excel') }}</span>
              </Button>
              <Button type="button" outlined size="small" class="toolbar-btn toolbar-btn--clear" @click="clearFilter">
                <i class="pi pi-filter-slash toolbar-btn__icon" aria-hidden="true"></i>
                <span class="toolbar-btn__label">{{ t('exit_interview.clear_filter') }}</span>
              </Button>
            </div>
          </template>

          <template #empty>
            <div style="text-align: center; height: 300px; align-content: center;">
              <i class="pi pi-inbox" style="font-size: 2rem; color: #9ca3af; margin-bottom: 1rem;"></i>
              <p style="margin: 0; color: #6b7280;">{{ t('exit_interview.empty') }}</p>
            </div>
          </template>

          <Column v-for="col in tableColumns" :key="col.field" :field="col.field" :header="col.header"
            :style="{ width: col.width }" :showFilterMenu="false" :bodyClass="col.bodyClass"
            :headerClass="col.headerClass" :filterFunction="col.filterable ? serverFilterPassthrough : undefined">

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
                <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" :manualInput="false"
                  :placeholder="t('exit_interview.filters.select_date')" class="w-full" showClear showIcon
                  selectionMode="range" @update:modelValue="onDateFilterChange(filterCallback)" />
              </template>

              <template v-else-if="col.type === 'multiselect'">
                <MultiSelect v-model="filterModel.value" :options="orgSelectOptions" optionLabel="name" optionValue="id"
                  :loading="isOrgLoading"
                  :placeholder="isOrgLoading ? t('exit_interview.filters.loading_organization') : col.filterPlaceholder"
                  class="org-filter-multiselect" display="chip" filter showClear :maxSelectedLabels="1"
                  @show="onOrgMultiselectShow" @change="onOrgFilterApply(filterCallback)"
                  @clear="onOrgFilterApply(filterCallback)" @hide="onOrgFilterApply(filterCallback)" />
              </template>

              <template v-else-if="col.type === 'select'">
                <Select v-model="filterModel.value" :options="jobPositionOptions" optionLabel="name" optionValue="id"
                  :placeholder="col.filterPlaceholder" class="w-full" showClear :loading="isJobPositionLoading"
                  @show="onJobPositionSelectShow" @change="onSelectFilterChange(filterCallback)" />
              </template>

              <template v-else>
                <InputText :model-value="filterModel.value as string | null" :placeholder="col.filterPlaceholder"
                  class="w-full" @update:model-value="(v) => onTextFilterInput(v, filterModel, filterCallback)" />
              </template>

            </template>
          </Column>

          <Column class="text-center" style="width: 200px">
            <template #body="{ data }">
              <Skeleton v-if="isLoading" width="9rem" height="1rem" />
              <div v-else class="row-actions">
                <Button v-if="canView" icon="pi pi-eye" size="small" severity="secondary" rounded outlined
                  :aria-label="t('exit_interview.actions.view_detail')" @click="handleSeen(data)" />
                <Button v-if="canUpdate" icon="pi pi-pencil" size="small" severity="info" rounded outlined
                  :aria-label="t('exit_interview.actions.edit')" @click="openEditDialog(data)" />
                <Button v-if="canExport && !exportingRowKey" icon="pi pi-file-word" size="small" severity="info" rounded
                  outlined :aria-label="t('exit_interview.actions.export_word')"
                  :loading="isRowExporting(data.id, 'word')" @click="exportWord(data)" />
                <Button v-if="canExport && !exportingRowKey" icon="pi pi-file-pdf" size="small" severity="danger"
                  rounded outlined :aria-label="t('exit_interview.actions.export_pdf')"
                  :loading="isRowExporting(data.id, 'pdf')" @click="exportPdf(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Dialog v-model:visible="editDialogVisible" modal :draggable="false" :header="t('exit_interview.form.edit_title')"
      class="exit-interview-form-dialog" :style="{ width: '28rem' }" @hide="resetEditDialog">
      <form class="exit-interview-form" autocomplete="off" @submit.prevent="submitEditForm">
        <div class="exit-interview-form__field">
          <label for="exit-interview-code" class="exit-interview-form__label">
            {{ t('exit_interview.columns.employee_code') }} <span class="exit-interview-form__required">*</span>
          </label>
          <InputText id="exit-interview-code" v-model="editForm.employeeCode" class="exit-interview-form__input"
            :placeholder="t('exit_interview.form.employee_code_placeholder')" :invalid="!!editFormErrors.employeeCode"
            @update:model-value="onEditEmployeeCodeInput" />
          <small v-if="editFormErrors.employeeCode" class="exit-interview-form__error">{{ editFormErrors.employeeCode
            }}</small>
        </div>

        <div class="exit-interview-form__field">
          <label for="exit-interview-name" class="exit-interview-form__label">
            {{ t('exit_interview.columns.employee_name') }} <span class="exit-interview-form__required">*</span>
          </label>
          <InputText id="exit-interview-name" v-model="editForm.employeeName" class="exit-interview-form__input"
            :placeholder="t('exit_interview.form.employee_name_placeholder')" :invalid="!!editFormErrors.employeeName"
            @update:model-value="onEditEmployeeNameInput" />
          <small v-if="editFormErrors.employeeName" class="exit-interview-form__error">{{ editFormErrors.employeeName
            }}</small>
        </div>

        <div class="exit-interview-form__field">
          <label for="exit-interview-position" class="exit-interview-form__label">
            {{ t('exit_interview.columns.job_position') }} <span class="exit-interview-form__required">*</span>
          </label>
          <Select id="exit-interview-position" v-model="editForm.jobPositionId" :options="jobPositionOptions"
            optionLabel="name" optionValue="id" :loading="isJobPositionLoading"
            :placeholder="t('exit_interview.form.job_position_placeholder')" class="exit-interview-form__input"
            :invalid="!!editFormErrors.jobPositionId" showClear @show="onJobPositionSelectShow"
            @update:model-value="onEditJobPositionChange" />
          <small v-if="editFormErrors.jobPositionId" class="exit-interview-form__error">{{
            editFormErrors.jobPositionId
          }}</small>
        </div>

        <div class="exit-interview-form__field">
          <label for="exit-interview-exited-at" class="exit-interview-form__label">
            {{ t('exit_interview.columns.exited_at') }} <span class="exit-interview-form__required">*</span>
          </label>
          <DatePicker id="exit-interview-exited-at" v-model="editForm.exitedAt" dateFormat="dd/mm/yy"
            :placeholder="t('exit_interview.form.exited_at_placeholder')" showIcon showClear
            class="exit-interview-form__input w-full" :invalid="!!editFormErrors.exitedAt"
            @update:model-value="onEditExitedAtChange" />
          <small v-if="editFormErrors.exitedAt" class="exit-interview-form__error">{{ editFormErrors.exitedAt }}</small>
        </div>

        <div class="exit-interview-form__field">
          <label for="exit-interview-organization" class="exit-interview-form__label">
            {{ t('exit_interview.columns.organization') }} <span class="exit-interview-form__required">*</span>
          </label>
          <Select id="exit-interview-organization" v-model="editForm.organizationId" :options="organizations"
            optionLabel="name" optionValue="id" :loading="isOrgLoading"
            :placeholder="isOrgLoading ? t('exit_interview.filters.loading_organization') : t('exit_interview.form.organization_placeholder')"
            class="exit-interview-form__input" :invalid="!!editFormErrors.organizationId" showClear
            @show="loadOrganizations" @update:model-value="onEditOrganizationChange" />
          <small v-if="editFormErrors.organizationId" class="exit-interview-form__error">{{
            editFormErrors.organizationId
            }}</small>
        </div>
      </form>

      <template #footer>
        <Button :label="t('common.cancel')" text severity="secondary" @click="closeEditDialog" />
        <Button :label="t('common.save')" :loading="isSavingEdit" @click="submitEditForm" />
      </template>
    </Dialog>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage } from '@ionic/vue';
import { useToast } from 'primevue/usetoast';
import interviewView from "@/api/interviewView";
import interviewApi from '@/api/interview';
import organizationApi from "@/api/organization";
import jobPositionApi from '@/api/jobPosition';
import reportApi, { type ReportExcelPayload } from "@/api/report";
import { FilterMatchMode } from '@primevue/core/api';
import format from '@/mixins/format';
import { usePageDataRefresh } from '@/composables/usePageDataRefresh';
import { useMenuPermissions } from '@/composables/useMenuPermissions';
import { useModalFieldValidation } from '@/composables/useModalFieldValidation';
import { useAuthStore } from '@/store/auth';
interface EmployeeRecord {
  id: number;
  employeeCode: string;
  employeeName: string;
  jobPositionId?: number;
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
const { t } = useI18n();
const toast = useToast();
const authStore = useAuthStore();
const { getCodeFormatError, getModalNameFormatError } = useModalFieldValidation();
const employeeList = ref<EmployeeRecord[]>([]);
const organizations = ref<any[]>([]);
const jobPositions = ref<Array<{ id: number; name: string }>>([]);
const isLoading = ref(false);
const isExporting = ref(false);
const exportingRowKey = ref<string | null>(null);
const filters = ref();
const totalRecords = ref(0);
const isOrgLoading = ref(false);
const isJobPositionLoading = ref(false);
let orgLoadPromise: Promise<void> | null = null;
let jobPositionLoadPromise: Promise<void> | null = null;
const first = ref(0);

const orgSelectOptions = computed(() => (isOrgLoading.value ? [] : organizations.value));

const jobPositionOptions = computed(() => (isJobPositionLoading.value ? [] : jobPositions.value));

const rows = ref(13);

const { canView, canUpdate, canExport } = useMenuPermissions(['exitinterview']);

const editDialogVisible = ref(false);
const isSavingEdit = ref(false);
const editingInterviewId = ref<string | null>(null);
const editForm = ref({
  employeeCode: '',
  employeeName: '',
  jobPositionId: null as number | null,
  exitedAt: null as Date | null,
  organizationId: null as number | null,
});
const editFormErrors = ref({
  employeeCode: '',
  employeeName: '',
  jobPositionId: '',
  exitedAt: '',
  organizationId: '',
});

const currentUserId = computed(() => {
  const id = authStore.getUserId;
  return id != null ? String(id) : '';
});

const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
  toast.add({ severity, summary, detail, life: 4000 });
};

/** Lazy + server filter: không lọc client, chỉ dùng totalCount từ API */
const serverFilterPassthrough = () => true;

const tableColumns = computed(() => [
  { field: '#', header: '#', width: '5rem', type: '#', bodyClass: 'text-center', headerClass: 'text-center' },
  {
    field: 'employeeCode',
    header: t('exit_interview.columns.employee_code'),
    width: '200px',
    type: 'code',
    filterable: true,
    filterPlaceholder: t('exit_interview.filters.search_code'),
  },
  {
    field: 'employeeName',
    header: t('exit_interview.columns.employee_name'),
    width: 'auto',
    type: 'text',
    filterable: true,
    filterPlaceholder: t('exit_interview.filters.search_name'),
  },
  {
    field: 'jobPositionName',
    header: t('exit_interview.columns.job_position'),
    width: 'auto',
    type: 'select',
    filterable: true,
    filterPlaceholder: t('exit_interview.filters.select_position'),
  },
  {
    field: 'organizationName',
    header: t('exit_interview.columns.organization'),
    width: '180px',
    type: 'multiselect',
    filterable: true,
    filterPlaceholder: t('exit_interview.filters.select_organization'),
  },
  {
    field: 'exitedAt',
    header: t('exit_interview.columns.exited_at'),
    width: 'auto',
    type: 'date',
    filterable: true,
  },
  {
    field: 'createdAt',
    header: t('exit_interview.columns.created_at'),
    width: 'auto',
    type: 'date',
    filterable: true,
  },
]);

const TEXT_FILTER_FIELDS = ['employeeCode', 'employeeName'] as const;

const initFilters = () => {
  filters.value = {
    employeeCode: { value: null, matchMode: FilterMatchMode.CONTAINS },
    employeeName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jobPositionName: { value: null, matchMode: FilterMatchMode.EQUALS },
    organizationName: { value: [], matchMode: FilterMatchMode.IN },
    exitedAt: { value: null, matchMode: FilterMatchMode.BETWEEN },
    createdAt: { value: null, matchMode: FilterMatchMode.BETWEEN },
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
      const response = await organizationApi.postOrganization({ isActive: true });
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

const loadJobPositions = async () => {
  if (isJobPositionLoading.value && jobPositionLoadPromise) {
    return jobPositionLoadPromise;
  }

  isJobPositionLoading.value = true;
  jobPositionLoadPromise = (async () => {
    try {
      const response = await jobPositionApi.postJobPosition({ isActive: true });
      const rows = Array.isArray(response?.data?.data) ? response.data.data : [];
      const mappedRows: Array<{ id: number; name: string } | null> = rows
        .map((row: Record<string, unknown>) => {
          const id = row.id ?? row.Id;
          if (id == null) return null;
          return {
            id: Number(id),
            name: String(row.name ?? row.Name ?? ''),
          };
        });
      jobPositions.value = mappedRows.filter(
        (item): item is { id: number; name: string } => item !== null && item.id > 0,
      );
    } catch (error) {
      console.error('Lỗi lấy danh sách chức vụ:', error);
      jobPositions.value = [];
    } finally {
      isJobPositionLoading.value = false;
      jobPositionLoadPromise = null;
    }
  })();

  return jobPositionLoadPromise;
};

const onJobPositionSelectShow = () => {
  loadJobPositions();
};

/** Chọn/xóa phòng ban xong → fetch table với organizationIds trong payload */
const onOrgFilterApply = async (filterCallback?: () => void) => {
  filterCallback?.();
  await nextTick();
  scheduleFilterLoad(true);
};

const onSelectFilterChange = async (filterCallback?: () => void) => {
  filterCallback?.();
  await nextTick();
  scheduleFilterLoad(true);
};

const toFilterDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** DatePicker range → from/to; single date → cùng ngày. */
const getFormatRange = (dateValue: unknown) => {
  if (!dateValue) {
    return { from: null, to: null };
  }

  if (Array.isArray(dateValue)) {
    const start = toFilterDate(dateValue[0]);
    if (!start) return { from: null, to: null };

    const end = toFilterDate(dateValue[1]) ?? start;
    return {
      from: format.formatDateOnlyIso(start),
      to: format.formatDateOnlyEndIso(end),
    };
  }

  const date = toFilterDate(dateValue);
  if (!date) return { from: null, to: null };

  return {
    from: format.formatDateOnlyIso(date),
    to: format.formatDateOnlyEndIso(date),
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

  const jobPositionId = f.jobPositionName?.value;
  if (jobPositionId != null && String(jobPositionId).trim()) {
    payload.jobPositionId = Number(jobPositionId);
  }

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

const onTextFilterInput = (
  value: string | null | undefined,
  filterModel: { value: string | null },
  filterCallback?: () => void,
) => {
  filterModel.value = value ? String(value) : null;
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

const resetEditFormErrors = () => {
  editFormErrors.value = {
    employeeCode: '',
    employeeName: '',
    jobPositionId: '',
    exitedAt: '',
    organizationId: '',
  };
};

const resetEditDialog = () => {
  editingInterviewId.value = null;
  editForm.value = {
    employeeCode: '',
    employeeName: '',
    jobPositionId: null,
    exitedAt: null,
    organizationId: null,
  };
  resetEditFormErrors();
};

const toEditExitedAt = (value: Date | string | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getExitedAtError = (value: Date | null) => {
  if (!value) return t('exit_interview.form.exited_at_required');
  return Number.isNaN(value.getTime()) ? t('exit_interview.form.exited_at_invalid') : '';
};

const closeEditDialog = () => {
  editDialogVisible.value = false;
};

const resolveOrganizationId = (emp: EmployeeRecord) => {
  if (emp.organizationId != null && Number(emp.organizationId) > 0) {
    return Number(emp.organizationId);
  }

  const matched = organizations.value.find((org) => org.name === emp.organizationName);
  return matched?.id != null ? Number(matched.id) : null;
};

const openEditDialog = async (emp: EmployeeRecord) => {
  if (!canUpdate.value) return;

  await Promise.all([loadOrganizations(), loadJobPositions()]);
  const matchedJobPosition = jobPositions.value.find((item) =>
    emp.jobPositionId != null
      ? Number(item.id) === Number(emp.jobPositionId)
      : item.name === emp.jobPositionName,
  );

  editingInterviewId.value = String(emp.id);
  editForm.value = {
    employeeCode: emp.employeeCode ?? '',
    employeeName: emp.employeeName ?? '',
    jobPositionId: matchedJobPosition?.id ?? null,
    exitedAt: toEditExitedAt(emp.exitedAt),
    organizationId: resolveOrganizationId(emp),
  };
  resetEditFormErrors();
  editDialogVisible.value = true;
};

const onEditEmployeeCodeInput = (value: string | null | undefined) => {
  editForm.value.employeeCode = value ?? '';
  editFormErrors.value.employeeCode = getCodeFormatError(editForm.value.employeeCode);
};

const onEditEmployeeNameInput = (value: string | null | undefined) => {
  editForm.value.employeeName = value ?? '';
  editFormErrors.value.employeeName = getModalNameFormatError(editForm.value.employeeName);
};

const onEditJobPositionChange = (value: number | null | undefined) => {
  editForm.value.jobPositionId = value != null ? Number(value) : null;
  editFormErrors.value.jobPositionId = editForm.value.jobPositionId
    ? ''
    : t('exit_interview.form.job_position_required');
};

const onEditExitedAtChange = () => {
  editFormErrors.value.exitedAt = getExitedAtError(editForm.value.exitedAt);
};

const onEditOrganizationChange = () => {
  editFormErrors.value.organizationId = editForm.value.organizationId ? '' : t('exit_interview.form.organization_required');
};

const validateEditForm = () => {
  resetEditFormErrors();

  const employeeCode = editForm.value.employeeCode.trim();
  const employeeName = editForm.value.employeeName.trim();
  const jobPositionId = editForm.value.jobPositionId;

  editFormErrors.value.employeeCode = employeeCode
    ? getCodeFormatError(employeeCode)
    : t('exit_interview.form.employee_code_required');
  editFormErrors.value.employeeName = employeeName
    ? getModalNameFormatError(employeeName)
    : t('exit_interview.form.employee_name_required');
  editFormErrors.value.jobPositionId = jobPositionId
    ? ''
    : t('exit_interview.form.job_position_required');
  editFormErrors.value.exitedAt = getExitedAtError(editForm.value.exitedAt);
  editFormErrors.value.organizationId = editForm.value.organizationId
    ? ''
    : t('exit_interview.form.organization_required');

  return !Object.values(editFormErrors.value).some(Boolean);
};

const submitEditForm = async () => {
  if (!editingInterviewId.value || isSavingEdit.value) return;

  if (!currentUserId.value) {
    showToast('error', t('exit_interview.toast.error'), t('exit_interview.toast.account_missing'));
    return;
  }

  if (!validateEditForm()) return;

  isSavingEdit.value = true;

  try {
    const response = await interviewApi.patchUpdateInterview({
      id: editingInterviewId.value,
      employeeCode: editForm.value.employeeCode.trim(),
      employeeName: editForm.value.employeeName.trim(),
      jobPositionId: Number(editForm.value.jobPositionId),
      organizationId: Number(editForm.value.organizationId),
      exitedAt: format.formatDateOnlyIso(editForm.value.exitedAt as Date),
      updatedBy: currentUserId.value,
    });

    if (response.data?.success) {
      showToast(
        'success',
        t('exit_interview.toast.success'),
        response.data.message || t('exit_interview.toast.update_success'),
      );
      closeEditDialog();
      await loadData();
      return;
    }

    showToast(
      'error',
      t('exit_interview.toast.failure'),
      response.data?.message || t('exit_interview.toast.update_failed'),
    );
  } catch (error: unknown) {
    console.error('Update interview error:', error);
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    showToast('error', t('exit_interview.toast.error'), message || t('exit_interview.toast.update_retry'));
  } finally {
    isSavingEdit.value = false;
  }
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
        : t(type === 'word' ? 'exit_interview.errors.export_word_failed' : 'exit_interview.errors.export_pdf_failed');
    showToast('error', t('exit_interview.toast.error'), message);
  } finally {
    exportingRowKey.value = null;
  }
};

const exportWord = (emp: EmployeeRecord) =>
  runRowExport(emp, 'word', async (id) => {
    const { exportInterviewWord } = await import('@/utils/interviewDocumentExport');
    await exportInterviewWord(id);
  });

const exportPdf = (emp: EmployeeRecord) =>
  runRowExport(emp, 'pdf', async (id) => {
    const { exportInterviewPdf } = await import('@/utils/interviewDocumentExport');
    await exportInterviewPdf(id);
  });

const exportExcel = async () => {
  if (isExporting.value) return;

  isExporting.value = true;
  try {
    const {
      buildReportWorkbook,
      downloadReportWorkbook,
      extractReportData,
      getDefaultReportFilename,
    } = await import('@/utils/reportExcelBuilder');
    const payload = buildExportPayload();
    const response = await reportApi.postExcel(payload);
    const reportData = extractReportData(response?.data?.data);
    const workbook = await buildReportWorkbook(reportData);
    await downloadReportWorkbook(workbook, getDefaultReportFilename());
  } catch (error: unknown) {
    console.error('Lỗi xuất Excel:', error);
    const message = error instanceof Error ? error.message : t('exit_interview.errors.export_excel_failed');
    showToast('error', t('exit_interview.toast.error'), message);
  } finally {
    isExporting.value = false;
  }
};

usePageDataRefresh('ListExitInterview', () => {
  loadData();
});
</script>

<style scoped lang="scss">
.list-exit-interview-page:not(.ion-page-hidden) {
  height: calc(100dvh - 70px - 44px - 50px - 50px) !important;
  min-height: 420px;
  max-height: calc(100dvh - 70px - 44px - 50px - 50px);
  overflow: hidden !important;
}

.list-exit-interview-page.ion-page-hidden {
  display: none !important;
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
  gap: 1rem;
}

:deep(.compact-table .row-actions .p-button) {
  width: 2rem;
  height: 2rem;
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
  margin-bottom: 30px;
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

.exit-interview-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exit-interview-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.exit-interview-form__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.exit-interview-form__required {
  color: #ef4444;
}

.exit-interview-form__input {
  width: 100%;
}

.exit-interview-form__error {
  color: #ef4444;
  font-size: 0.8125rem;
}

:deep(.p-datatable-thead > tr > th.text-center) {
  text-align: center !important;
}
</style>