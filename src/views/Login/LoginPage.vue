<template>
  <ion-page>
    <ion-content>
      <!-- <LoginMobile v-if="isIpadMode" @login="handleLogin" /> -->
      <LoginDesktop :loading="isLoading" @login="handleLogin" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import LoginDesktop from './parts/LoginDesktop.vue';
import userApi from '@/api/user';
import { parseLoginUser, parseLoginAccessToken, buildRoleFromAuthUser } from '@/utils/loginUser';
import { getLocalDateTimeNow } from '@/utils/localDateTime';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();
const isLoading = ref(false);

const notify = (
  message: string,
  severity: 'success' | 'info' | 'warn' | 'error' = 'error',
  summary = t('messages.notifi'),
) => {
  toast.add({
    severity,
    summary,
    detail: message,
    life: 3000,
  });
};

const handleLogin = async (credentials: { code: string; password: string; loginAt?: string }) => {
  try {
    isLoading.value = true;
    const response = await userApi.postUserValidate({
      code: credentials.code,
      password: credentials.password,
      loginAt: credentials.loginAt ?? getLocalDateTimeNow(),
    });
    const user = parseLoginUser(response.data);

    if (response.data?.success && user) {
      const accessToken = parseLoginAccessToken(response.data);
      if (!accessToken) {
        notify('Không nhận được accessToken đăng nhập.', 'error', 'Lỗi');
        return;
      }

      authStore.loginSession(user, accessToken);

      const role = buildRoleFromAuthUser(user);
      if (role) {
        authStore.setRole(role);
      } else if (user.roleName) {
        authStore.setRoleName(user.roleName);
      }

      await router.replace('/dashboard');
    } else {
      notify(response.data?.message || 'Đăng nhập thất bại.', 'error', 'Đăng nhập thất bại');
    }
  } catch (error: unknown) {
    console.error('Lỗi gọi API đăng nhập:', error);
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      || 'Server đang bảo trì vui lòng liên hệ IT và thử lại sau.';
    notify(message, 'error', 'Lỗi');
  } finally {
    isLoading.value = false;
  }
};
</script>