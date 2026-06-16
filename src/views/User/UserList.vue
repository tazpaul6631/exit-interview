<template>
  <ion-page class="user-list-page">
    <div class="user-page-container user-flex-column">
      <div class="user-table-responsive user-flex-column">
        <DataTable :class="{ 'user-table--empty': userList.length === 0 }" v-model:filters="filters"
          v-model:first="first" :value="userList" lazy paginator :rows="rows" :rowsPerPageOptions="[10, 20, 50]"
          :totalRecords="totalRecords" dataKey="id" filterDisplay="row" scrollable scrollHeight="flex"
          class="user-table user-full-height-table user-compact-table" showGridlines
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Hiển thị {first} đến {last} trên {totalRecords} người dùng" @page="onPageChange"
          @filter="onTableFilter">
          <template #header>
            <div class="user-toolbar">
              <Button type="button" size="small" outlined class="user-toolbar__btn user-toolbar__btn--create"
                @click="openCreateDialog">
                <i class="pi pi-plus user-toolbar__icon" aria-hidden="true" />
                <span class="user-toolbar__label">Thêm người dùng</span>
              </Button>
              <Button type="button" outlined size="small" class="user-toolbar__btn user-toolbar__btn--clear"
                @click="clearFilter">
                <i class="pi pi-filter-slash user-toolbar__icon" aria-hidden="true" />
                <span class="user-toolbar__label">Xóa lọc</span>
              </Button>
            </div>
          </template>

          <template #empty>
            <div class="user-empty-state">
              <i class="pi pi-inbox user-empty-state__icon" />
              <p class="user-empty-state__text">Không tìm thấy người dùng.</p>
            </div>
          </template>

          <Column v-for="col in tableColumns" :key="`${col.field}-${col.header}`" :field="col.field"
            :header="col.header" :style="{ width: col.width }" :showFilterMenu="false"
            :filterFunction="col.filterable ? serverFilterPassthrough : undefined">
            <template #body="{ data, index }">
              <template v-if="col.type === '#'">
                <Skeleton v-if="isLoading" width="2rem" height="1rem" />
                <span v-else class="user-fw-bold">{{ first + index + 1 }}</span>
              </template>

              <template v-else-if="col.type === 'role'">
                <Skeleton v-if="isLoading" width="6rem" height="1rem" />
                <span v-else>{{ getRoleName(data.roleId) }}</span>
              </template>

              <template v-else>
                <Skeleton v-if="isLoading" width="auto" height="1rem" />
                <span v-else>{{ data[col.field] }}</span>
              </template>
            </template>

            <template #filter="{ filterModel, filterCallback }" v-if="col.filterable">
              <template v-if="col.type === 'code' || col.type === 'keyword'">
                <InputText v-model="filterModel.value" type="text" :placeholder="col.filterPlaceholder" class="w-full"
                  @update:modelValue="onTextFilterInput(filterCallback)" />
              </template>
              <template v-else-if="col.type === 'role'">
                <Select v-model="filterModel.value" :options="roleOptions" optionLabel="name" optionValue="id"
                  placeholder="Vai trò" class="user-filter-select" showClear :loading="isRoleLoading" @show="loadRoles"
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
              <div class="user-row-actions">
                <Button icon="pi pi-pencil" size="small" severity="info" rounded outlined aria-label="Sửa người dùng"
                  @click="openEditDialog(data)" />
                <Button icon="pi pi-trash" size="small" severity="danger" rounded outlined aria-label="Xóa người dùng"
                  @click="openDeleteDialog(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Dialog v-model:visible="formDialogVisible" modal :draggable="false"
      :header="formMode === 'create' ? 'Thêm người dùng' : 'Cập nhật người dùng'" class="user-form-dialog"
      :style="{ width: '28rem' }" @show="onFormDialogShow" @hide="resetFormDialog">
      <form class="user-form" autocomplete="off" @submit.prevent="submitForm">
        <div class="user-form__field">
          <label :for="formMode === 'create' ? 'hr-new-employee-code' : 'hr-edit-employee-code'"
            class="user-form__label">
            Mã NV <span class="user-form__required">*</span>
          </label>
          <InputText v-if="formMode === 'create'" :key="`create-code-${createFormKey}`" id="hr-new-employee-code"
            v-model="formState.code" class="user-form__input" placeholder="Nhập mã nhân viên"
            :invalid="!!formErrors.code" name="hr-new-employee-code" autocomplete="off" :readonly="isCreateCodeReadonly"
            @focus="isCreateCodeReadonly = false" />
          <InputText v-else id="hr-edit-employee-code" v-model="formState.code" class="user-form__input" disabled />
          <small v-if="formErrors.code" class="user-form__error">{{ formErrors.code }}</small>
        </div>

        <template v-if="formMode === 'create'">
          <div class="user-form__autofill-trap" aria-hidden="true">
            <input type="text" tabindex="-1" autocomplete="username" />
            <input type="password" tabindex="-1" autocomplete="current-password" />
          </div>

          <div class="user-form__field">
            <label for="hr-new-employee-name" class="user-form__label">
              Họ tên <span class="user-form__required">*</span>
            </label>
            <InputText :key="`create-name-${createFormKey}`" id="hr-new-employee-name" v-model="formState.name"
              class="user-form__input" placeholder="Nhập họ tên" :invalid="!!formErrors.name"
              name="hr-new-employee-name" autocomplete="off" :readonly="isCreateNameReadonly"
              @focus="isCreateNameReadonly = false" />
            <small v-if="formErrors.name" class="user-form__error">{{ formErrors.name }}</small>
          </div>

          <div class="user-form__field">
            <label for="hr-new-employee-password" class="user-form__label">
              Mật khẩu <span class="user-form__required">*</span>
            </label>
            <InputText :key="`create-password-${createFormKey}`" id="hr-new-employee-password"
              v-model="formState.password" type="password" class="user-form__input" placeholder="Nhập mật khẩu"
              :invalid="!!formErrors.password" name="hr-new-employee-password" autocomplete="new-password"
              :readonly="isCreatePasswordReadonly" @focus="isCreatePasswordReadonly = false"
              @blur="validatePasswordField" />
            <small v-if="formErrors.password" class="user-form__error">{{ formErrors.password }}</small>
          </div>
        </template>

        <template v-else>
          <div class="user-form__field">
            <label for="hr-edit-employee-name" class="user-form__label">
              Họ tên <span class="user-form__required">*</span>
            </label>
            <InputText id="hr-edit-employee-name" v-model="formState.name" class="user-form__input"
              placeholder="Nhập họ tên" :invalid="!!formErrors.name" autocomplete="off" />
            <small v-if="formErrors.name" class="user-form__error">{{ formErrors.name }}</small>
          </div>

          <div class="user-form__field">
            <label for="hr-edit-employee-password" class="user-form__label">
              Mật khẩu <span class="user-form__required">*</span>
            </label>
            <Password id="hr-edit-employee-password" v-model="formState.password" class="user-form__input"
              :feedback="false" toggle-mask placeholder="Nhập mật khẩu" :invalid="!!formErrors.password"
              input-id="hr-edit-employee-password-input" autocomplete="new-password" @blur="validatePasswordField" />
            <small v-if="formErrors.password" class="user-form__error">{{ formErrors.password }}</small>
          </div>
        </template>

        <div class="user-form__field">
          <label :for="formMode === 'create' ? 'hr-new-employee-role' : 'hr-edit-employee-role'"
            class="user-form__label">
            Vai trò <span class="user-form__required">*</span>
          </label>
          <Select :id="formMode === 'create' ? 'hr-new-employee-role' : 'hr-edit-employee-role'"
            v-model="formState.roleId" :options="roleOptions" optionLabel="name" optionValue="id"
            placeholder="Chọn vai trò" class="user-form__input" :loading="isRoleLoading" :invalid="!!formErrors.roleId"
            @show="loadRoles" />
          <small v-if="formErrors.roleId" class="user-form__error">{{ formErrors.roleId }}</small>
        </div>
      </form>

      <template #footer>
        <Button label="Hủy" text severity="secondary" @click="closeFormDialog" />
        <Button :label="formMode === 'create' ? 'Tạo mới' : 'Lưu'" :loading="isSaving" @click="submitForm" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteDialogVisible" modal :draggable="false" header="Xóa người dùng"
      class="user-delete-dialog" :style="{ width: '24rem' }">
      <p class="user-delete-dialog__message">
        Bạn có chắc muốn xóa người dùng
        <strong>{{ deletingUser?.name }}</strong>?
      </p>

      <template #footer>
        <Button label="Hủy" text severity="secondary" @click="deleteDialogVisible = false" />
        <Button label="Xóa" severity="danger" :loading="isDeleting" @click="confirmDelete" />
      </template>
    </Dialog>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { IonPage, onIonViewWillEnter } from '@ionic/vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';
import userApi from '@/api/user';
import roleApi from '@/api/role';
import { parseRoleBaseList } from '@/utils/roleResponse';
import type { Role } from '@/types/role';
import type { PagedUserResponse, User, UserQueryPayload } from '@/types/user';
import { useAuthStore } from '@/store/auth';

const toast = useToast();
const authStore = useAuthStore();

const userList = ref<User[]>([]);
const roles = ref<Role[]>([]);
const isLoading = ref(false);
const isRoleLoading = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const filters = ref<Record<string, { value: unknown; matchMode: string }>>();
const totalRecords = ref(0);
const first = ref(0);
const rows = ref(10);

const formDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const createFormKey = ref(0);
const isCreateCodeReadonly = ref(true);
const isCreateNameReadonly = ref(true);
const isCreatePasswordReadonly = ref(true);
const editingUserId = ref<string | number | null>(null);
const deletingUser = ref<User | null>(null);

const formState = ref({
  code: '',
  name: '',
  password: '',
  roleId: null as number | null,
});

const formErrors = ref({
  code: '',
  name: '',
  password: '',
  roleId: '',
});

const currentUserId = computed(() => {
  const id = authStore.getUserId;
  return id != null ? String(id) : '';
});

const roleOptions = computed(() => roles.value);
const roleNameMap = computed(() =>
  new Map(roles.value.map((role) => [role.id, role.name])),
);

const serverFilterPassthrough = () => true;

const tableColumns = [
  { field: '#', header: '#', width: '3rem', type: '#', filterable: false },
  {
    field: 'code',
    header: 'Mã NV',
    width: 'auto',
    type: 'text',
    filterable: true,
    filterPlaceholder: 'Tìm mã',
  },
  {
    field: 'name',
    header: 'Họ tên',
    width: 'auto',
    type: 'text',
    filterable: true,
    filterPlaceholder: 'Tìm họ tên',
  },
  {
    field: 'roleId',
    header: 'Vai trò',
    width: 'auto',
    type: 'role',
    filterable: true,
    filterPlaceholder: 'Vai trò',
  }
];

const TEXT_FILTER_FIELDS = ['code', 'name', 'keyword'] as const;

const initFilters = () => {
  filters.value = {
    code: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    keyword: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    roleId: { value: null, matchMode: FilterMatchMode.EQUALS },
  };
};

initFilters();

const getRoleName = (roleId: number) => roleNameMap.value.get(roleId) ?? `#${roleId}`;

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

const loadRoles = async () => {
  if (isRoleLoading.value) return;

  isRoleLoading.value = true;
  try {
    const response = await roleApi.getRoleBaseList();
    roles.value = parseRoleBaseList(response);
  } catch (error) {
    console.error('Lỗi tải danh sách vai trò:', error);
    roles.value = [];
  } finally {
    isRoleLoading.value = false;
  }
};

const appendFilterFields = (payload: UserQueryPayload) => {
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

  const status = f.status?.value;
  if (status === 0 || status === 1) {
    payload.status = status;
  }

  const roleId = f.roleId?.value;
  if (roleId != null && roleId !== '') {
    payload.roleId = Number(roleId);
  }
};

const buildPayload = (event?: { page?: number; rows?: number }): UserQueryPayload => {
  const pageSize = event?.rows ?? rows.value;
  if (event?.rows != null) {
    rows.value = event.rows;
  }

  const page = event?.page != null
    ? event.page + 1
    : Math.floor(first.value / pageSize) + 1;

  const payload: UserQueryPayload = { page, pageSize };
  appendFilterFields(payload);
  return payload;
};

const parsePagedResult = (response: unknown): PagedUserResponse | null => {
  const body = response as { data?: { data?: PagedUserResponse; items?: User[] } };
  const data = body?.data?.data ?? body?.data;
  if (!data || !Array.isArray(data.items)) {
    return null;
  }
  return data as PagedUserResponse;
};

const loadData = async (event?: { page?: number; rows?: number }) => {
  isLoading.value = true;

  try {
    const payload = buildPayload(event);
    const response = await userApi.postUserQueryResult(payload);
    const result = parsePagedResult(response);

    if (result) {
      userList.value = result.items;
      totalRecords.value = Number(result.totalCount) || 0;

      if (result.page != null && result.pageSize != null) {
        first.value = Math.max(0, (result.page - 1) * result.pageSize);
        rows.value = result.pageSize;
      }
    } else {
      userList.value = [];
      totalRecords.value = 0;
    }
  } catch (error) {
    console.error('Lỗi tải danh sách người dùng:', error);
    userList.value = [];
    totalRecords.value = 0;
    showToast('error', 'Lỗi', 'Không thể tải danh sách người dùng.');
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
    code: '',
    name: '',
    password: '',
    roleId: null,
  };
  formErrors.value = {
    code: '',
    name: '',
    password: '',
    roleId: '',
  };
  editingUserId.value = null;
};

const resetFormDialog = () => {
  resetFormState();
};

const closeFormDialog = () => {
  formDialogVisible.value = false;
};

const resetCreateReadonlyGuards = () => {
  isCreateCodeReadonly.value = true;
  isCreateNameReadonly.value = true;
  isCreatePasswordReadonly.value = true;
};

const onFormDialogShow = () => {
  if (formMode.value !== 'create') return;

  formState.value.name = '';
  formState.value.password = '';
  resetCreateReadonlyGuards();
};

const openCreateDialog = () => {
  formMode.value = 'create';
  resetFormState();
  createFormKey.value += 1;
  resetCreateReadonlyGuards();
  formDialogVisible.value = true;
};

const openEditDialog = (user: User) => {
  formMode.value = 'edit';
  editingUserId.value = user.id;
  formState.value = {
    code: user.code,
    name: user.name,
    password: '',
    roleId: user.roleId,
  };
  formErrors.value = { code: '', name: '', password: '', roleId: '' };
  formDialogVisible.value = true;
};

const openDeleteDialog = (user: User) => {
  deletingUser.value = user;
  deleteDialogVisible.value = true;
};

const getPasswordError = (password: string) => {
  const value = password.trim();

  if (!value) return 'Vui lòng nhập mật khẩu';
  if (value.length < 1) return 'Mật khẩu phải có ít nhất 6 ký tự';
  if (password.length > 100) return 'Mật khẩu không quá 100 ký tự';
  return '';
};

const validatePasswordField = () => {
  formErrors.value.password = getPasswordError(formState.value.password);
};

const validateForm = () => {
  const code = formState.value.code.trim();
  const name = formState.value.name.trim();
  const roleId = formState.value.roleId;
  const errors = {
    code: '',
    name: '',
    password: getPasswordError(formState.value.password),
    roleId: '',
  };

  if (formMode.value === 'create' && !code) {
    errors.code = 'Vui lòng nhập mã nhân viên';
  }

  if (!name) {
    errors.name = 'Vui lòng nhập họ tên';
  }

  if (roleId == null || Number.isNaN(Number(roleId))) {
    errors.roleId = 'Vui lòng chọn vai trò';
  }

  formErrors.value = errors;
  return !errors.code && !errors.name && !errors.password && !errors.roleId;
};

const submitForm = async () => {
  if (!validateForm()) return;

  const roleId = Number(formState.value.roleId);

  try {
    isSaving.value = true;

    if (formMode.value === 'create') {
      if (!currentUserId.value) {
        showToast('error', 'Lỗi', 'Không tìm thấy tài khoản. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await userApi.postUserCreate({
        code: formState.value.code.trim(),
        name: formState.value.name.trim(),
        password: formState.value.password,
        roleId,
        createdBy: currentUserId.value,
        updatedBy: currentUserId.value,
      });

      if (response.data?.success) {
        showToast('success', 'Thành công', response.data.message || 'Tạo người dùng thành công.');
        closeFormDialog();
        await loadData();
        return;
      }

      showToast('error', 'Thất bại', response.data?.message || 'Không thể tạo người dùng.');
      return;
    }

    if (editingUserId.value == null) return;

    if (!currentUserId.value) {
      showToast('error', 'Lỗi', 'Không tìm thấy tài khoản. Vui lòng đăng nhập lại.');
      return;
    }

    const response = await userApi.patchUserUpdate(editingUserId.value, {
      code: formState.value.code.trim(),
      name: formState.value.name.trim(),
      password: formState.value.password,
      roleId,
      updatedBy: currentUserId.value,
    });

    if (response.data?.success) {
      showToast('success', 'Thành công', response.data.message || 'Cập nhật người dùng thành công.');
      closeFormDialog();
      await loadData();
      return;
    }

    showToast('error', 'Thất bại', response.data?.message || 'Không thể cập nhật người dùng.');
  } catch (error: unknown) {
    console.error('Lỗi lưu người dùng:', error);
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    showToast('error', 'Lỗi', message || 'Không thể lưu người dùng. Vui lòng thử lại.');
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async () => {
  if (!deletingUser.value) return;

  try {
    isDeleting.value = true;
    const userId = Number(deletingUser.value.id);
    const response = await userApi.deleteUserById(deletingUser.value.id, { id: userId });

    if (response.data?.success) {
      showToast('success', 'Thành công', response.data.message || 'Xóa người dùng thành công.');
      deleteDialogVisible.value = false;
      deletingUser.value = null;
      await loadData();
      return;
    }

    showToast('error', 'Thất bại', response.data?.message || 'Không thể xóa người dùng.');
  } catch (error: unknown) {
    console.error('Lỗi xóa người dùng:', error);
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    showToast('error', 'Lỗi', message || 'Không thể xóa người dùng. Vui lòng thử lại.');
  } finally {
    isDeleting.value = false;
  }
};

onIonViewWillEnter(() => {
  void loadRoles();
  loadData();
});
</script>

<style scoped lang="scss">
.user-list-page {
  height: calc(100dvh - 70px - 44px - 50px - 50px) !important;
  min-height: 420px;
  max-height: calc(100dvh - 70px - 44px - 50px - 50px);
  overflow: hidden !important;
}

.user-page-container {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.user-flex-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

.user-table-responsive {
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

:deep(.user-full-height-table.p-datatable-flex-scrollable) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}

:deep(.user-full-height-table) {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

:deep(.user-full-height-table .p-datatable-table-container) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.user-full-height-table .p-datatable-scrollable-body) {
  flex: 1;
  min-height: 0;
}

:deep(.user-compact-table .p-datatable-tbody > tr > td) {
  padding: 0.375rem 0.625rem;
  line-height: 1.35;
  vertical-align: middle;
  white-space: nowrap;
}

:deep(.user-compact-table .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.625rem;
}

:deep(.user-compact-table .p-datatable-thead > tr.p-datatable-filter-row > th) {
  padding: 0.375rem 0.625rem;
}

:deep(.user-row-actions) {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

:deep(.user-row-actions .p-button) {
  width: 2rem;
  height: 2rem;
  padding: 0;
}

:deep(.user-full-height-table .p-datatable-header),
:deep(.user-full-height-table .p-paginator) {
  flex-shrink: 0;
}

:deep(.user-table--empty .p-datatable-table-container) {
  flex-direction: row !important;
}

.user-fw-bold {
  font-weight: 500;
}

.user-empty-state {
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

.user-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.625rem;
  padding: 0.375rem 0.25rem;
  width: 100%;
}

:deep(.user-toolbar .user-toolbar__btn.p-button) {
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

:deep(.user-toolbar .user-toolbar__btn--create) {
  .user-toolbar__icon {
    color: #059669;
  }

  &:enabled:hover {
    background: #ecfdf5;
    border-color: #6ee7b7;
    color: #047857;
  }
}

:deep(.user-toolbar .user-toolbar__label) {
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

.user-filter-select {
  width: 100%;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-form__autofill-trap {
  position: absolute;
  left: -9999px;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.user-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.user-form__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.user-form__required {
  color: #ef4444;
}

.user-form__input {
  width: 100%;
}

.user-form__input :deep(.p-password-input) {
  width: 100%;
}

.user-form__error {
  color: #ef4444;
  font-size: 0.8125rem;
}

.user-delete-dialog__message {
  margin: 0;
  color: #475569;
  line-height: 1.5;
}
</style>
