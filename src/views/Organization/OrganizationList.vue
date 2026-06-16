<template>
  <ion-page class="organization-list-page">
    <div class="organization-page-container organization-flex-column">
      <div class="organization-table-responsive organization-flex-column">
        <DataTable :class="{ 'organization-table--empty': organizationList.length === 0 }" v-model:filters="filters"
          v-model:first="first" :value="organizationList" lazy paginator :rows="rows" :rowsPerPageOptions="[10, 20, 50]"
          :totalRecords="totalRecords" dataKey="id" filterDisplay="row" scrollable scrollHeight="flex"
          class="organization-table organization-full-height-table organization-compact-table" showGridlines
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Hiển thị {first} đến {last} trên {totalRecords} phòng ban" @page="onPageChange"
          @filter="onTableFilter">
          <template #header>
            <div class="organization-toolbar">
              <Button type="button" size="small" outlined
                class="organization-toolbar__btn organization-toolbar__btn--create" @click="openCreateDialog">
                <i class="pi pi-plus organization-toolbar__icon" aria-hidden="true" />
                <span class="organization-toolbar__label">Thêm phòng ban</span>
              </Button>
              <Button type="button" outlined size="small"
                class="organization-toolbar__btn organization-toolbar__btn--clear" @click="clearFilter">
                <i class="pi pi-filter-slash organization-toolbar__icon" aria-hidden="true" />
                <span class="organization-toolbar__label">Xóa lọc</span>
              </Button>
            </div>
          </template>

          <template #empty>
            <div class="organization-empty-state">
              <i class="pi pi-inbox organization-empty-state__icon" />
              <p class="organization-empty-state__text">Không tìm thấy phòng ban.</p>
            </div>
          </template>

          <Column v-for="col in tableColumns" :key="`${col.field}-${col.header}`" :field="col.field"
            :header="col.header" :style="{ width: col.width }" :showFilterMenu="false"
            :filterFunction="col.filterable ? serverFilterPassthrough : undefined" clearFilterButton="true">
            <template #body="{ data, index }">
              <template v-if="col.type === '#'">
                <Skeleton v-if="isLoading" width="2rem" height="1rem" />
                <span v-else class="organization-fw-bold">{{ first + index + 1 }}</span>
              </template>

              <template v-else-if="col.type === 'active'">
                <Skeleton v-if="isLoading" width="4rem" height="1rem" />
                <Tag v-else :value="data.isActive ? 'Hoạt động' : 'Ngưng'"
                  :severity="data.isActive ? 'success' : 'secondary'" />
              </template>

              <template v-else>
                <Skeleton v-if="isLoading" width="auto" height="1rem" />
                <span v-else>{{ data[col.field] }}</span>
              </template>
            </template>

            <template #filter="{ filterModel, filterCallback }" v-if="col.filterable">
              <template v-if="col.type === 'active'">
                <Select v-model="filterModel.value" :options="activeFilterOptions" optionLabel="label"
                  optionValue="value" placeholder="Trạng thái" class="organization-filter-select" showClear
                  @change="onSelectFilterChange(filterCallback)" />
              </template>
              <template v-else>
                <InputText v-model="filterModel.value" type="text" :placeholder="col.filterPlaceholder" class="w-full"
                  @update:modelValue="onTextFilterInput(filterCallback)" />
              </template>
            </template>
          </Column>

          <Column class="text-center" header="Thao tác" style="width: auto">
            <template #body="{ data }">
              <div class="organization-row-actions">
                <Button icon="pi pi-pencil" size="small" severity="info" rounded outlined aria-label="Sửa phòng ban"
                  @click="openEditDialog(data)" />
                <Button icon="pi pi-trash" size="small" severity="danger" rounded outlined aria-label="Xóa phòng ban"
                  @click="openDeleteDialog(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Dialog v-model:visible="formDialogVisible" modal :draggable="false"
      :header="formMode === 'create' ? 'Thêm phòng ban' : 'Cập nhật phòng ban'" class="organization-form-dialog"
      :style="{ width: '28rem' }" @hide="resetFormDialog">
      <form class="organization-form" @submit.prevent="submitForm">
        <div class="organization-form__field">
          <label for="organization-name" class="organization-form__label">
            Tên phòng ban <span class="organization-form__required">*</span>
          </label>
          <InputText id="organization-name" v-model="formState.name" class="organization-form__input"
            placeholder="Nhập tên phòng ban" :invalid="!!formErrors.name" />
          <small v-if="formErrors.name" class="organization-form__error">{{ formErrors.name }}</small>
        </div>

        <div class="organization-form__field">
          <label for="organization-priority" class="organization-form__label">
            Thứ tự ưu tiên <span class="organization-form__required">*</span>
          </label>
          <InputText id="organization-priority" v-model="formState.priority" type="number" min="0"
            class="organization-form__input" placeholder="Nhập thứ tự ưu tiên" :invalid="!!formErrors.priority" />
          <small v-if="formErrors.priority" class="organization-form__error">{{ formErrors.priority }}</small>
        </div>

        <div class="organization-form__field organization-form__field--checkbox">
          <Checkbox v-model="formState.isActive" inputId="organization-active" binary />
          <label for="organization-active" class="organization-form__checkbox-label">Đang hoạt động</label>
        </div>
      </form>

      <template #footer>
        <Button label="Hủy" text severity="secondary" @click="closeFormDialog" />
        <Button :label="formMode === 'create' ? 'Tạo mới' : 'Lưu'" :loading="isSaving" @click="submitForm" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteDialogVisible" modal :draggable="false" header="Xóa phòng ban"
      class="organization-delete-dialog" :style="{ width: '24rem' }">
      <p class="organization-delete-dialog__message">
        Bạn có chắc muốn xóa phòng ban
        <strong>{{ deletingOrganization?.name }}</strong>?
      </p>

      <template #footer>
        <Button label="Hủy" text severity="secondary" @click="deleteDialogVisible = false" />
        <Button label="Xóa" severity="danger" :loading="isDeleting" @click="confirmDelete" />
      </template>
    </Dialog>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { IonPage, onIonViewWillEnter } from '@ionic/vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';
import organizationApi from '@/api/organization';
import { useAuthStore } from '@/store/auth';
import { getLocalDateTimeNow } from '@/utils/localDateTime';
import type { Organization, OrganizationPagedData, OrganizationQueryPayload } from '@/types/organization';

const toast = useToast();
const authStore = useAuthStore();

const organizationList = ref<Organization[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const filters = ref<Record<string, { value: unknown; matchMode: string }>>();
const totalRecords = ref(0);
const first = ref(0);
const rows = ref(10);

const formDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const editingOrganizationId = ref<number | null>(null);
const deletingOrganization = ref<Organization | null>(null);

const formState = ref({
  name: '',
  priority: '0',
  isActive: true,
});

const formErrors = ref({
  name: '',
  priority: '',
});

const activeFilterOptions = [
  { label: 'Hoạt động', value: true },
  { label: 'Ngưng', value: false },
];

const serverFilterPassthrough = () => true;

const tableColumns = [
  { field: '#', header: '#', width: '3rem', type: '#', filterable: false },
  {
    field: 'code',
    header: 'Mã',
    width: 'auto',
    type: 'text',
    filterable: true,
    filterPlaceholder: 'Tìm mã',
  },
  {
    field: 'name',
    header: 'Tên phòng ban',
    width: 'auto',
    type: 'text',
    filterable: true,
    filterPlaceholder: 'Tìm tên',
  },
  {
    field: 'isActive',
    header: 'Trạng thái',
    width: 'auto',
    type: 'active',
    filterable: true,
    filterPlaceholder: 'Trạng thái',
  },
];

const TEXT_FILTER_FIELDS = ['code', 'name', 'keyword'] as const;

const currentUserId = computed(() => {
  const id = authStore.getUserId;
  return id != null ? String(id) : '';
});

const initFilters = () => {
  filters.value = {
    code: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    keyword: { value: null, matchMode: FilterMatchMode.CONTAINS },
    isActive: { value: null, matchMode: FilterMatchMode.EQUALS },
  };
};

initFilters();

const showToast = (
  severity: 'success' | 'info' | 'warn' | 'error',
  summary: string,
  detail?: string,
) => {
  toast.add({
    severity,
    summary,
    detail: detail ?? summary,
    life: 3000,
  });
};

const appendFilterFields = (payload: OrganizationQueryPayload) => {
  const f = filters.value;
  if (!f) return;

  TEXT_FILTER_FIELDS.forEach((field) => {
    const raw = f[field]?.value;
    const value = raw != null ? String(raw).trim() : '';
    if (value) {
      payload[field] = value;
    }
  });

  const isActive = f.isActive?.value;
  if (typeof isActive === 'boolean') {
    payload.isActive = isActive;
  }
};

const buildPayload = (event?: { page?: number; rows?: number }): OrganizationQueryPayload => {
  const pageSize = event?.rows ?? rows.value;
  if (event?.rows != null) {
    rows.value = event.rows;
  }

  const page = event?.page != null
    ? event.page + 1
    : Math.floor(first.value / pageSize) + 1;

  const payload: OrganizationQueryPayload = { page, pageSize };
  appendFilterFields(payload);
  return payload;
};

const parsePagedResult = (response: unknown): OrganizationPagedData | null => {
  const body = response as { data?: { data?: OrganizationPagedData; items?: Organization[] } };
  const data = body?.data?.data ?? body?.data;
  if (!data || !Array.isArray(data.items)) {
    return null;
  }
  return data as OrganizationPagedData;
};

const loadData = async (event?: { page?: number; rows?: number }) => {
  isLoading.value = true;

  try {
    const payload = buildPayload(event);
    const response = await organizationApi.postOrganizationQueryResult(payload);
    const result = parsePagedResult(response);

    if (result) {
      organizationList.value = result.items;
      totalRecords.value = Number(result.totalCount) || 0;

      if (result.page != null && result.pageSize != null) {
        first.value = Math.max(0, (result.page - 1) * result.pageSize);
        rows.value = result.pageSize;
      }
    } else {
      organizationList.value = [];
      totalRecords.value = 0;
    }
  } catch (error) {
    console.error('Lỗi tải danh sách phòng ban:', error);
    organizationList.value = [];
    totalRecords.value = 0;
    showToast('error', 'Lỗi', 'Không thể tải danh sách phòng ban.');
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

const onSelectFilterChange = async (filterCallback?: () => void) => {
  filterCallback?.();
  await nextTick();
  scheduleFilterLoad(true);
};

const clearFilter = () => {
  initFilters();
  first.value = 0;
  loadData();
};

const resetFormState = () => {
  formState.value = {
    name: '',
    priority: '0',
    isActive: true,
  };
  formErrors.value = {
    name: '',
    priority: '',
  };
  editingOrganizationId.value = null;
};

const resetFormDialog = () => {
  resetFormState();
};

const closeFormDialog = () => {
  formDialogVisible.value = false;
};

const openCreateDialog = () => {
  formMode.value = 'create';
  resetFormState();
  formDialogVisible.value = true;
};

const openEditDialog = (organization: Organization) => {
  formMode.value = 'edit';
  editingOrganizationId.value = organization.id;
  formState.value = {
    name: organization.name,
    priority: String(organization.priority),
    isActive: organization.isActive,
  };
  formErrors.value = { name: '', priority: '' };
  formDialogVisible.value = true;
};

const openDeleteDialog = (organization: Organization) => {
  deletingOrganization.value = organization;
  deleteDialogVisible.value = true;
};

const validateForm = () => {
  const name = formState.value.name.trim();
  const priority = Number(formState.value.priority);
  const errors = { name: '', priority: '' };

  if (!name) {
    errors.name = 'Vui lòng nhập tên phòng ban';
  }

  if (Number.isNaN(priority) || priority < 0) {
    errors.priority = 'Thứ tự ưu tiên phải là số không âm';
  }

  formErrors.value = errors;
  return !errors.name && !errors.priority;
};

const submitForm = async () => {
  if (!validateForm()) return;

  if (!currentUserId.value) {
    showToast('error', 'Lỗi', 'Không tìm thấy tài khoản. Vui lòng đăng nhập lại.');
    return;
  }

  const payloadBase = {
    name: formState.value.name.trim(),
    priority: Number(formState.value.priority),
    isActive: formState.value.isActive,
    updatedBy: currentUserId.value,
  };

  try {
    isSaving.value = true;

    if (formMode.value === 'create') {
      const now = getLocalDateTimeNow();
      const response = await organizationApi.postOrganizationCreate({
        ...payloadBase,
        createdBy: currentUserId.value,
        createdAt: now,
        updatedAt: now,
      });

      if (response.data?.success) {
        showToast('success', 'Thành công', response.data.message || 'Tạo phòng ban thành công.');
        closeFormDialog();
        await loadData();
        return;
      }

      showToast('error', 'Thất bại', response.data?.message || 'Không thể tạo phòng ban.');
      return;
    }

    if (editingOrganizationId.value == null) return;

    const response = await organizationApi.patchOrganizationUpdate(
      editingOrganizationId.value,
      {
        ...payloadBase,
        updatedAt: getLocalDateTimeNow(),
      },
    );

    if (response.data?.success) {
      showToast('success', 'Thành công', response.data.message || 'Cập nhật phòng ban thành công.');
      closeFormDialog();
      await loadData();
      return;
    }

    showToast('error', 'Thất bại', response.data?.message || 'Không thể cập nhật phòng ban.');
  } catch (error: unknown) {
    console.error('Lỗi lưu phòng ban:', error);
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    showToast('error', 'Lỗi', message || 'Không thể lưu phòng ban. Vui lòng thử lại.');
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async () => {
  if (!deletingOrganization.value) return;

  if (!currentUserId.value) {
    showToast('error', 'Lỗi', 'Không tìm thấy tài khoản. Vui lòng đăng nhập lại.');
    return;
  }

  try {
    isDeleting.value = true;
    const response = await organizationApi.deleteOrganizationById(
      deletingOrganization.value.id,
      {
        updatedBy: currentUserId.value,
        updatedAt: getLocalDateTimeNow(),
      },
    );

    if (response.data?.success) {
      showToast('success', 'Thành công', response.data.message || 'Xóa phòng ban thành công.');
      deleteDialogVisible.value = false;
      deletingOrganization.value = null;
      await loadData();
      return;
    }

    showToast('error', 'Thất bại', response.data?.message || 'Không thể xóa phòng ban.');
  } catch (error: unknown) {
    console.error('Lỗi xóa phòng ban:', error);
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    showToast('error', 'Lỗi', message || 'Không thể xóa phòng ban. Vui lòng thử lại.');
  } finally {
    isDeleting.value = false;
  }
};

onMounted(() => { });

onIonViewWillEnter(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.organization-list-page {
  height: calc(100dvh - 70px - 44px - 50px - 50px) !important;
  min-height: 420px;
  max-height: calc(100dvh - 70px - 44px - 50px - 50px);
  overflow: hidden !important;
}

.organization-page-container {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.organization-flex-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

.organization-table-responsive {
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

:deep(.organization-full-height-table.p-datatable-flex-scrollable) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}

:deep(.organization-full-height-table) {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

:deep(.organization-full-height-table .p-datatable-table-container) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.organization-full-height-table .p-datatable-scrollable-body) {
  flex: 1;
  min-height: 0;
}

:deep(.organization-compact-table .p-datatable-tbody > tr > td) {
  padding: 0.375rem 0.625rem;
  line-height: 1.35;
  vertical-align: middle;
  white-space: nowrap;
}

:deep(.organization-compact-table .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.625rem;
}

:deep(.organization-compact-table .p-datatable-thead > tr.p-datatable-filter-row > th) {
  padding: 0.375rem 0.625rem;
}

:deep(.organization-row-actions) {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

:deep(.organization-row-actions .p-button) {
  width: 2rem;
  height: 2rem;
  padding: 0;
}

:deep(.organization-full-height-table .p-datatable-header),
:deep(.organization-full-height-table .p-paginator) {
  flex-shrink: 0;
}

:deep(.organization-table--empty .p-datatable-table-container) {
  flex-direction: row !important;
}

.organization-fw-bold {
  font-weight: 500;
}

.organization-empty-state {
  text-align: center;
  height: 300px;
  align-content: center;

  &__icon {
    font-size: 2rem;
    color: #9ca3af;
    margin-bottom: 1rem;
  }

  &__text {
    margin: 0;
    color: #6b7280;
  }
}

.organization-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.625rem;
  padding: 0.375rem 0.25rem;
  width: 100%;
}

:deep(.organization-toolbar .organization-toolbar__btn.p-button) {
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

:deep(.organization-toolbar .organization-toolbar__btn--create) {
  .organization-toolbar__icon {
    color: #059669;
  }

  &:enabled:hover {
    background: #ecfdf5;
    border-color: #6ee7b7;
    color: #047857;

    .organization-toolbar__icon {
      color: #047857;
    }
  }
}

:deep(.organization-toolbar .organization-toolbar__btn--clear) {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;

  &:enabled:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
}

:deep(.organization-toolbar .organization-toolbar__label) {
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

:deep(.organization-toolbar .organization-toolbar__icon) {
  font-size: 1rem;
  line-height: 1;
}

.organization-filter-select {
  width: 100%;
}

.organization-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.organization-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &--checkbox {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
}

.organization-form__label,
.organization-form__checkbox-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.organization-form__required {
  color: #ef4444;
}

.organization-form__input {
  width: 100%;
}

.organization-form__error {
  color: #ef4444;
  font-size: 0.8125rem;
}

.organization-delete-dialog__message {
  margin: 0;
  color: #475569;
  line-height: 1.5;
}
</style>
