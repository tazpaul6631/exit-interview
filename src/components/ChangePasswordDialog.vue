<template>
  <Dialog v-model:visible="visible" modal :draggable="false" class="change-password-dialog" :style="{ width: '28rem' }"
    @hide="resetPasswordForm">
    <template #header>
      <div class="change-password-dialog__header">
        <UserAvatar :label="userInitials" size="lg" />
        <div class="change-password-dialog__meta">
          <span class="change-password-dialog__title">{{ displayName }}</span>
          <span class="change-password-dialog__subtitle">{{ userSubtitle }}</span>
        </div>
      </div>
    </template>

    <p class="change-password-dialog__desc">Cập nhật mật khẩu đăng nhập của bạn.</p>

    <form class="change-password-dialog__form" @submit.prevent="submitChangePassword">
      <div class="change-password-dialog__field">
        <label for="old-password" class="change-password-dialog__label">Mật khẩu hiện tại <span
            class="field-required">*</span></label>
        <Password id="old-password" v-model="oldPassword" class="change-password-dialog__input" toggle-mask
          :feedback="false" :invalid="!!errors.oldPassword" placeholder="Nhập mật khẩu hiện tại"
          autocomplete="current-password" />
        <small v-if="errors.oldPassword" class="change-password-dialog__error">{{ errors.oldPassword }}</small>
      </div>

      <div class="change-password-dialog__field">
        <label for="new-password" class="change-password-dialog__label">Mật khẩu mới <span
            class="field-required">*</span></label>
        <Password id="new-password" v-model="newPassword" class="change-password-dialog__input" toggle-mask
          :feedback="false" :invalid="!!errors.newPassword" placeholder="Nhập mật khẩu mới"
          autocomplete="new-password" />
        <small v-if="errors.newPassword" class="change-password-dialog__error">{{ errors.newPassword }}</small>
      </div>

      <div class="change-password-dialog__field">
        <label for="confirm-password" class="change-password-dialog__label">Xác nhận mật khẩu <span
            class="field-required">*</span></label>
        <Password id="confirm-password" v-model="confirmPassword" class="change-password-dialog__input" toggle-mask
          :feedback="false" :invalid="!!errors.confirmPassword" placeholder="Nhập lại mật khẩu mới"
          autocomplete="new-password" />
        <small v-if="errors.confirmPassword" class="change-password-dialog__error">{{ errors.confirmPassword }}</small>
      </div>
    </form>

    <template #footer>
      <Button label="Hủy" text severity="secondary" @click="closeDialog" />
      <Button label="Lưu" type="submit" :loading="isSavingPassword" @click="submitChangePassword" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useToast } from 'primevue/usetoast';
import userApi from '@/api/user';
import { useAuthStore } from '@/store/auth';
import UserAvatar from '@/components/UserAvatar.vue';

defineProps<{
  userInitials: string;
  displayName: string;
  userSubtitle: string;
}>();

const visible = defineModel<boolean>('visible', { default: false });

const toast = useToast();
const authStore = useAuthStore();
const isSavingPassword = ref(false);

const changePasswordSchema = toTypedSchema(
  z.object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(1, 'Mật khẩu mới phải có ít nhất 1 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  }),
);

const {
  handleSubmit,
  errors,
  defineField,
  resetForm: resetChangePasswordForm,
} = useForm({
  validationSchema: changePasswordSchema,
  initialValues: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
});

const [oldPassword] = defineField('oldPassword');
const [newPassword] = defineField('newPassword');
const [confirmPassword] = defineField('confirmPassword');

const userId = computed(() => authStore.getUserId);

const resetPasswordForm = () => {
  resetChangePasswordForm({
    values: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
};

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

const closeDialog = () => {
  visible.value = false;
};

const submitChangePassword = handleSubmit(async (values) => {
  if (!userId.value) {
    showToast('error', 'Lỗi', 'Không tìm thấy tài khoản. Vui lòng đăng nhập lại.');
    return;
  }

  try {
    isSavingPassword.value = true;
    const response = await userApi.postChangePassword(userId.value, {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmPassword,
    });

    if (response.data?.success) {
      closeDialog();
      showToast(
        'success',
        'Thành công',
        response.data.message || 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
      );
      await authStore.logout();
      return;
    }

    showToast('error', 'Thất bại', response.data?.message || 'Đổi mật khẩu thất bại.');
  } catch (error: unknown) {
    console.error('Lỗi đổi mật khẩu:', error);
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    showToast('error', 'Lỗi', message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
  } finally {
    isSavingPassword.value = false;
  }
});
</script>

<style scoped lang="scss">
.change-password-dialog__header {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.change-password-dialog__title {
  font-weight: 700;
  white-space: nowrap;
  color: #0f172a;
}

.change-password-dialog__meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.change-password-dialog__subtitle {
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.change-password-dialog__desc {
  display: block;
  margin: 0 0 1.25rem;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
}

.change-password-dialog__form {
  margin: 0;
}

.change-password-dialog__error {
  color: #ef4444;
  font-size: 1rem;
  line-height: 1.4;
}

.change-password-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.change-password-dialog__label {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
}

.change-password-dialog__input {
  width: 100%;
}

.change-password-dialog__input :deep(.p-password-input) {
  width: 100%;
}

.field-required {
  color: #ef4444;
}
</style>
