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

    <p class="change-password-dialog__desc">{{ t('change_password.description') }}</p>

    <form class="change-password-dialog__form" @submit.prevent="submitChangePassword">
      <div class="change-password-dialog__field">
        <label for="old-password" class="change-password-dialog__label">{{ t('change_password.old_password') }} <span
            class="field-required">*</span></label>
        <Password id="old-password" v-model="oldPassword" class="change-password-dialog__input" toggle-mask
          :feedback="false" :invalid="!!errors.oldPassword" :placeholder="t('change_password.old_password_placeholder')"
          autocomplete="current-password" />
        <small v-if="errors.oldPassword" class="change-password-dialog__error">{{ errors.oldPassword }}</small>
      </div>

      <div class="change-password-dialog__field">
        <label for="new-password" class="change-password-dialog__label">{{ t('change_password.new_password') }} <span
            class="field-required">*</span></label>
        <Password id="new-password" v-model="newPassword" class="change-password-dialog__input" toggle-mask
          :feedback="false" :invalid="!!errors.newPassword" :placeholder="t('change_password.new_password_placeholder')"
          autocomplete="new-password" />
        <small v-if="errors.newPassword" class="change-password-dialog__error">{{ errors.newPassword }}</small>
      </div>

      <div class="change-password-dialog__field">
        <label for="confirm-password" class="change-password-dialog__label">{{ t('change_password.confirm_password') }} <span
            class="field-required">*</span></label>
        <Password id="confirm-password" v-model="confirmPassword" class="change-password-dialog__input" toggle-mask
          :feedback="false" :invalid="!!errors.confirmPassword" :placeholder="t('change_password.confirm_password_placeholder')"
          autocomplete="new-password" />
        <small v-if="errors.confirmPassword" class="change-password-dialog__error">{{ errors.confirmPassword }}</small>
      </div>
    </form>

    <template #footer>
      <Button :label="t('common.cancel')" text severity="secondary" @click="closeDialog" />
      <Button :label="t('common.save')" type="submit" :loading="isSavingPassword" @click="submitChangePassword" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
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

const { t } = useI18n();
const toast = useToast();
const authStore = useAuthStore();
const isSavingPassword = ref(false);

const changePasswordSchema = computed(() =>
  toTypedSchema(
    z.object({
      oldPassword: z.string().min(1, t('change_password.errors.old_password_required')),
      newPassword: z.string().min(1, t('change_password.errors.new_password_min')),
      confirmPassword: z.string().min(1, t('change_password.errors.confirm_password_required')),
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: t('change_password.errors.confirm_mismatch'),
      path: ['confirmPassword'],
    }),
  ),
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
    showToast('error', t('change_password.toast.error'), t('change_password.toast.account_missing'));
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
        t('change_password.toast.success'),
        response.data.message || t('change_password.toast.success_message'),
      );
      await authStore.logout();
      return;
    }

    showToast('error', t('change_password.toast.failure'), response.data?.message || t('change_password.toast.failed'));
  } catch (error: unknown) {
    console.error('Change password error:', error);
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    showToast('error', t('change_password.toast.error'), message || t('change_password.toast.retry'));
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
