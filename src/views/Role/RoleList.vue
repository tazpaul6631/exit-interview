<template>
  <ion-page class="role-list-page">
    <div class="role-page-container role-flex-column">
      <div class="role-table-responsive role-flex-column">
        <DataTable :class="{ 'role-table--empty': roleList.length === 0 }" v-model:filters="filters"
          v-model:first="first" :value="roleList" lazy paginator :rows="rows" :rowsPerPageOptions="[13, 20, 50]"
          :totalRecords="totalRecords" dataKey="id" filterDisplay="row" scrollable scrollHeight="flex"
          class="role-table role-full-height-table role-compact-table" showGridlines
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :currentPageReportTemplate="t('role.page_report', { first: first + 1, last: first + rows, totalRecords: totalRecords })"
          @page="onPageChange" @filter="onTableFilter">
          <template #header>
            <div class="role-toolbar">
              <Button type="button" size="small" outlined class="role-toolbar__btn role-toolbar__btn--create"
                :disabled="!canCreate" @click="openCreateDialog">
                <i class="pi pi-plus role-toolbar__icon" aria-hidden="true" />
                <span class="role-toolbar__label">{{ t('role.add') }}</span>
              </Button>
              <Button type="button" outlined size="small" class="role-toolbar__btn role-toolbar__btn--clear"
                @click="clearFilter">
                <i class="pi pi-filter-slash role-toolbar__icon" aria-hidden="true" />
                <span class="role-toolbar__label">{{ t('role.clear_filter') }}</span>
              </Button>
            </div>
          </template>

          <template #empty>
            <div class="role-empty-state">
              <i class="pi pi-inbox role-empty-state__icon" />
              <p class="role-empty-state__text">{{ t('role.empty') }}</p>
            </div>
          </template>

          <Column v-for="col in tableColumns" :key="`${col.field}-${col.header}`" :field="col.field"
            :header="col.header" :style="{ width: col.width }" :showFilterMenu="false" :bodyClass="col.bodyClass"
            :filterFunction="col.filterable ? serverFilterPassthrough : undefined">
            <template #body="{ data, index }">
              <template v-if="col.type === '#'">
                <Skeleton v-if="isLoading" width="2rem" height="1rem" />
                <span v-else class="role-fw-bold">{{ first + index + 1 }}</span>
              </template>

              <template v-else>
                <Skeleton v-if="isLoading" width="auto" height="1rem" />
                <span v-else>{{ data[col.field] }}</span>
              </template>
            </template>

            <template #filter="{ filterModel, filterCallback }" v-if="col.filterable">
              <template v-if="col.type === 'admin'">
                <Select v-model="filterModel.value" :options="adminFilterOptions" optionLabel="label"
                  optionValue="value" :placeholder="t('role.filters.search')" class="role-filter-select" showClear
                  @change="onSelectFilterChange(filterCallback)" />
              </template>
              <template v-else>
                <InputText v-model="filterModel.value" type="text" :placeholder="col.filterPlaceholder" class="w-full"
                  @update:modelValue="onTextFilterInput(filterCallback)" />
              </template>
            </template>
          </Column>

          <Column class="text-center" style="width: 200px">
            <template #body="{ data }">
              <div class="role-row-actions">
                <Button icon="pi pi-eye" size="small" severity="secondary" rounded outlined
                  :aria-label="t('role.actions.view')" :disabled="!canView" @click="goToDetail(data)" />
                <Button icon="pi pi-pencil" size="small" severity="info" rounded outlined
                  :aria-label="t('role.actions.edit')" :disabled="!canUpdate" @click="openEditDialog(data)" />
                <Button icon="pi pi-trash" size="small" severity="danger" rounded outlined
                  :aria-label="t('role.actions.delete')" :disabled="!canDelete" @click="openDeleteDialog(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Dialog v-model:visible="formDialogVisible" modal :draggable="false"
      :header="formMode === 'create' ? t('role.form.create_title') : t('role.form.edit_title')" class="role-form-dialog"
      :style="{ width: '36rem' }" @show="onFormDialogShow" @hide="resetFormDialog">
      <form class="role-form" autocomplete="off" @submit.prevent="submitForm">
        <div class="role-form__field">
          <label for="role-form-name" class="role-form__label">
            {{ t('role.form.name') }} <span class="role-form__required">*</span>
          </label>
          <InputText id="role-form-name" v-model="formState.name" class="role-form__input"
            :placeholder="t('role.form.name_placeholder')" :invalid="!!formErrors.name" autocomplete="off" />
          <small v-if="formErrors.name" class="role-form__error">{{ formErrors.name }}</small>
        </div>

        <div class="role-form__field role-form__field--checkbox">
          <Checkbox v-model="formState.isAdmin" inputId="role-form-admin" binary />
          <label for="role-form-admin" class="role-form__checkbox-label">{{ t('role.form.is_admin') }}</label>
        </div>

        <div class="role-form__field role-form__field--permissions">
          <label class="role-form__label">{{ t('role.form.permissions') }}</label>
          <div v-if="isPermissionLoading" class="role-form__permission-loading">
            <Skeleton width="100%" height="3.5rem" />
          </div>
          <div v-else-if="permissionMenus.length === 0" class="role-form__permission-empty">
            {{ t('role.form.permissions_empty') }}
          </div>
          <div v-else class="role-form__permission-list">
            <div v-for="menu in permissionMenus" :key="menu.id" class="role-form__permission-row">
              <span class="role-form__permission-menu">{{ menu.name }}</span>
              <div class="role-form__permission-items">
                <label v-for="perm in menu.permissions" :key="perm.id" class="role-form__permission-item">
                  <Checkbox :modelValue="isPermissionSelected(menu.id, perm.id)" binary
                    @update:modelValue="(checked: boolean) => togglePermission(menu.id, perm.id, checked)" />
                  <span>{{ perm.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <Button :label="t('common.cancel')" text severity="secondary" @click="closeFormDialog" />
        <Button :label="formMode === 'create' ? t('role.form.create_btn') : t('common.save')" :loading="isSaving"
          @click="submitForm" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteDialogVisible" modal :draggable="false" :header="t('role.delete.title')"
      class="role-delete-dialog" :style="{ width: '24rem' }">
      <p class="role-delete-dialog__message">
        {{ t('role.delete.confirm') }}
        <strong>{{ deletingRole?.name }}</strong>?
      </p>

      <template #footer>
        <Button :label="t('common.cancel')" text severity="secondary" @click="deleteDialogVisible = false" />
        <Button :label="t('role.delete.btn')" severity="danger" :loading="isDeleting" @click="confirmDelete" />
      </template>
    </Dialog>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage } from '@ionic/vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';
import roleApi from '@/api/role';
import menuApi from '@/api/menu';
import { useAuthStore } from '@/store/auth';
import {
  collectAllowedPermissionKeys,
  parsePermissionMenuList,
  parseRoleOne,
  parseRoleQueryResponse,
  permissionKey,
} from '@/utils/roleResponse';
import type { Role, RolePermissionGroup, RolePermissionPayload, RoleQueryPayload } from '@/types/role';
import { useMenuPermissions } from '@/composables/useMenuPermissions';
import { usePageDataRefresh } from '@/composables/usePageDataRefresh';

const toast = useToast();
const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();

const roleList = ref<Role[]>([]);
const permissionMenus = ref<RolePermissionGroup[]>([]);
const selectedPermissionKeys = ref<Set<string>>(new Set());
const isLoading = ref(false);
const isPermissionLoading = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const filters = ref<Record<string, { value: unknown; matchMode: string }>>();
const totalRecords = ref(0);
const first = ref(0);
const rows = ref(13);

const formDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const editingRoleId = ref<number | null>(null);
const deletingRole = ref<Role | null>(null);

const { canView, canCreate, canUpdate, canDelete } = useMenuPermissions(['role']);

const formState = ref({
  name: '',
  isAdmin: false,
});

const formErrors = ref({
  name: '',
});

const adminFilterOptions = computed(() => [
  { label: t('role.filters.admin'), value: true },
  { label: t('role.filters.normal'), value: false },
]);

const currentUserId = computed(() => {
  const id = authStore.getUserId;
  return id != null ? String(id) : '';
});

const serverFilterPassthrough = () => true;

const tableColumns = computed(() => [
  { field: '#', header: '#', width: '3rem', type: '#', filterable: false, bodyClass: 'text-center' },
  {
    field: 'code',
    header: t('role.columns.code'),
    width: 'auto',
    type: 'text',
    filterable: true,
    filterPlaceholder: t('role.filters.search_code'),
  },
  {
    field: 'name',
    header: t('role.columns.name'),
    width: 'auto',
    type: 'text',
    filterable: true,
    filterPlaceholder: t('role.filters.search_name'),
  },
]);

const TEXT_FILTER_FIELDS = ['code', 'name', 'keyword'] as const;

const initFilters = () => {
  filters.value = {
    code: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    keyword: { value: null, matchMode: FilterMatchMode.CONTAINS },
    isAdmin: { value: null, matchMode: FilterMatchMode.EQUALS },
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

const clonePermissionMenus = (menus: RolePermissionGroup[]) =>
  menus.map((menu) => ({
    ...menu,
    permissions: menu.permissions.map((perm) => ({ ...perm })),
  }));

const loadPermissionTemplate = async () => {
  isPermissionLoading.value = true;
  try {
    const response = await menuApi.getMenuPermission();
    permissionMenus.value = clonePermissionMenus(parsePermissionMenuList(response));
  } catch (error) {
    console.error('Lỗi tải danh sách menu phân quyền:', error);
    permissionMenus.value = [];
    showToast('error', t('role.toast.error'), t('role.toast.load_permissions_failed'));
  } finally {
    isPermissionLoading.value = false;
  }
};

const loadRolePermissionsForEdit = async (roleId: number) => {
  isPermissionLoading.value = true;
  try {
    const response = await roleApi.getRoleOne(roleId);
    const role = parseRoleOne(response);
    permissionMenus.value = clonePermissionMenus(role?.permissions ?? []);
    selectedPermissionKeys.value = collectAllowedPermissionKeys(permissionMenus.value);
  } catch (error) {
    console.error('Lỗi tải chi tiết vai trò:', error);
    permissionMenus.value = [];
    selectedPermissionKeys.value = new Set();
    showToast('error', t('role.toast.error'), t('role.toast.load_role_permissions_failed'));
  } finally {
    isPermissionLoading.value = false;
  }
};

const appendFilterFields = (payload: RoleQueryPayload) => {
  const f = filters.value;
  if (!f) return;

  const keywordCandidates = TEXT_FILTER_FIELDS.map((field) => {
    const raw = f[field]?.value;
    return raw != null ? String(raw).trim() : '';
  });
  const keyword = keywordCandidates.find((value) => value.length > 0);
  if (keyword) {
    payload.keyword = keyword;
  }

  const isAdmin = f.isAdmin?.value;
  if (isAdmin === true || isAdmin === false) {
    payload.isAdmin = isAdmin;
  }
};

const buildPayload = (event?: { page?: number; rows?: number }): RoleQueryPayload => {
  const pageSize = event?.rows ?? rows.value;
  if (event?.rows != null) {
    rows.value = event.rows;
  }

  const page = event?.page != null
    ? event.page + 1
    : Math.floor(first.value / pageSize) + 1;

  const payload: RoleQueryPayload = { page, pageSize };
  appendFilterFields(payload);
  return payload;
};

const loadData = async (event?: { page?: number; rows?: number }) => {
  isLoading.value = true;

  try {
    const payload = buildPayload(event);
    const response = await roleApi.postRoleQueryResult(payload);
    const result = parseRoleQueryResponse(response);

    if (result) {
      roleList.value = result.items;
      totalRecords.value = Number(result.totalCount) || 0;

      if (result.page != null && result.pageSize != null) {
        first.value = Math.max(0, (result.page - 1) * result.pageSize);
        rows.value = result.pageSize;
      }
    } else {
      roleList.value = [];
      totalRecords.value = 0;
    }
  } catch (error) {
    console.error('Lỗi tải danh sách vai trò:', error);
    roleList.value = [];
    totalRecords.value = 0;
    showToast('error', t('role.toast.error'), t('role.toast.load_failed'));
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
  formState.value = { name: '', isAdmin: false };
  formErrors.value = { name: '' };
  permissionMenus.value = [];
  selectedPermissionKeys.value = new Set();
  editingRoleId.value = null;
};

const resetFormDialog = () => {
  resetFormState();
};

const closeFormDialog = () => {
  formDialogVisible.value = false;
};

const onFormDialogShow = async () => {
  if (formMode.value === 'edit' && editingRoleId.value != null) {
    await loadRolePermissionsForEdit(editingRoleId.value);
  }
};

const openCreateDialog = async () => {
  formMode.value = 'create';
  resetFormState();
  await loadPermissionTemplate();
  selectedPermissionKeys.value = new Set();
  formDialogVisible.value = true;
};

const openEditDialog = (role: Role) => {
  formMode.value = 'edit';
  editingRoleId.value = role.id;
  formState.value = {
    name: role.name,
    isAdmin: role.isAdmin,
  };
  formErrors.value = { name: '' };
  formDialogVisible.value = true;
};

const openDeleteDialog = (role: Role) => {
  deletingRole.value = role;
  deleteDialogVisible.value = true;
};

const goToDetail = (role: Role) => {
  router.push({ name: 'DetailRole', params: { id: role.id } });
};

const isPermissionSelected = (menuId: number, permissionId: number) =>
  selectedPermissionKeys.value.has(permissionKey(menuId, permissionId));

const togglePermission = (menuId: number, permissionId: number, checked: boolean) => {
  const key = permissionKey(menuId, permissionId);
  const next = new Set(selectedPermissionKeys.value);
  if (checked) {
    next.add(key);
  } else {
    next.delete(key);
  }
  selectedPermissionKeys.value = next;
};

const buildRolePermissions = (roleId = 0): RolePermissionPayload[] => {
  if (!currentUserId.value) return [];

  const items: RolePermissionPayload[] = [];
  permissionMenus.value.forEach((menu) => {
    menu.permissions.forEach((perm) => {
      if (!isPermissionSelected(menu.id, perm.id)) return;
      items.push({
        roleId,
        menuId: menu.id,
        permissionId: perm.id,
        createdBy: currentUserId.value,
      });
    });
  });
  return items;
};

const validateForm = () => {
  const name = formState.value.name.trim();
  const errors = { name: '' };

  if (!name) {
    errors.name = t('role.errors.name_required');
  }

  formErrors.value = errors;
  return !errors.name;
};

const submitForm = async () => {
  if (!validateForm()) return;

  if (!currentUserId.value) {
    showToast('error', t('role.toast.error'), t('role.toast.account_missing'));
    return;
  }

  const rolePermissions = buildRolePermissions(formMode.value === 'edit' ? (editingRoleId.value ?? 0) : 0);

  try {
    isSaving.value = true;

    if (formMode.value === 'create') {
      const response = await roleApi.postRoleCreate({
        name: formState.value.name.trim(),
        isAdmin: formState.value.isAdmin,
        createdBy: currentUserId.value,
        updatedBy: currentUserId.value,
        rolePermissions,
      });

      if (response.data?.success) {
        showToast('success', t('role.toast.success'), response.data.message || t('role.toast.create_success'));
        closeFormDialog();
        await loadData();
        return;
      }

      showToast('error', t('role.toast.failure'), response.data?.message || t('role.toast.create_failed'));
      return;
    }

    if (editingRoleId.value == null) return;

    const response = await roleApi.patchRoleUpdate(editingRoleId.value, {
      name: formState.value.name.trim(),
      isAdmin: formState.value.isAdmin,
      updatedBy: currentUserId.value,
      rolePermissions,
    });

    if (response.data?.success) {
      showToast('success', t('role.toast.success'), response.data.message || t('role.toast.update_success'));
      closeFormDialog();
      await loadData();
      return;
    }

    showToast('error', t('role.toast.failure'), response.data?.message || t('role.toast.update_failed'));
  } catch (error: unknown) {
    console.error('Lỗi lưu vai trò:', error);
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    showToast('error', t('role.toast.error'), message || t('role.toast.save_failed'));
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async () => {
  if (!deletingRole.value) return;

  if (!currentUserId.value) {
    showToast('error', t('role.toast.error'), t('role.toast.account_missing'));
    return;
  }

  try {
    isDeleting.value = true;
    const response = await roleApi.deleteRoleById(deletingRole.value.id, {
      updatedBy: currentUserId.value,
    });

    if (response.data?.success) {
      showToast('success', t('role.toast.success'), response.data.message || t('role.toast.delete_success'));
      deleteDialogVisible.value = false;
      deletingRole.value = null;
      await loadData();
      return;
    }

    showToast('error', t('role.toast.failure'), response.data?.message || t('role.toast.delete_failed'));
  } catch (error: unknown) {
    console.error('Lỗi xóa vai trò:', error);
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    showToast('error', t('role.toast.error'), message || t('role.toast.delete_retry'));
  } finally {
    isDeleting.value = false;
  }
};

usePageDataRefresh('ListRole', () => {
  loadData();
});
</script>

<style scoped lang="scss">
.role-list-page {
  height: calc(100dvh - 70px - 44px - 50px - 50px) !important;
  min-height: 420px;
  max-height: calc(100dvh - 70px - 44px - 50px - 50px);
  overflow: hidden !important;
}

.role-page-container {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.role-flex-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

.role-table-responsive {
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

:deep(.role-full-height-table.p-datatable-flex-scrollable) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}

:deep(.role-full-height-table) {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

:deep(.role-full-height-table .p-datatable-table-container) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.role-full-height-table .p-datatable-scrollable-body) {
  flex: 1;
  min-height: 0;
}

:deep(.role-compact-table .p-datatable-tbody > tr > td) {
  padding: 0.375rem 0.625rem;
  line-height: 1.35;
  vertical-align: middle;
  white-space: nowrap;
}

:deep(.role-compact-table .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.625rem;
}

:deep(.role-compact-table .p-datatable-thead > tr.p-datatable-filter-row > th) {
  padding: 0.375rem 0.625rem;
}

:deep(.role-row-actions) {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

:deep(.role-row-actions .p-button) {
  width: 2rem;
  height: 2rem;
  padding: 0;
}

:deep(.role-full-height-table .p-datatable-header),
:deep(.role-full-height-table .p-paginator) {
  flex-shrink: 0;
}

:deep(.role-table--empty .p-datatable-table-container) {
  flex-direction: row !important;
}

.role-fw-bold {
  font-weight: 500;
}

.role-empty-state {
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

.role-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.625rem;
  padding: 0.375rem 0.25rem;
  width: 100%;
}

:deep(.role-toolbar .role-toolbar__btn.p-button) {
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

:deep(.role-toolbar .role-toolbar__btn--create) {
  .role-toolbar__icon {
    color: #059669;
  }

  &:enabled:hover {
    background: #ecfdf5;
    border-color: #6ee7b7;
    color: #047857;
  }
}

:deep(.role-toolbar .role-toolbar__label) {
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

.role-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.role-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  &--checkbox {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  &--permissions {
    gap: 0.5rem;
  }
}

.role-form__label,
.role-form__checkbox-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.role-form__required {
  color: #ef4444;
}

.role-form__input {
  width: 100%;
}

.role-form__error {
  color: #ef4444;
  font-size: 0.8125rem;
}

.role-form__permission-loading,
.role-form__permission-empty {
  padding: 0.5rem 0.625rem;
  color: #64748b;
  font-size: 0.8125rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.role-form__permission-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.625rem;
  background: #f8fafc;
}

.role-form__permission-row {
  display: grid;
  grid-template-columns: minmax(5.5rem, 7rem) 1fr;
  gap: 0.375rem 0.625rem;
  align-items: center;
  padding: 0.375rem 0;
}

.role-form__permission-row+.role-form__permission-row {
  border-top: 1px solid #e2e8f0;
}

.role-form__permission-menu {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
  line-height: 1.3;
}

.role-form__permission-items {
  display: flex;
  gap: 0.25rem 0.625rem;
}

.role-form__permission-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8125rem;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
}

.role-delete-dialog__message {
  margin: 0;
  color: #475569;
  line-height: 1.5;
}
</style>
