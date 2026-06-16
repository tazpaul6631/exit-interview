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
import { Capacitor } from '@capacitor/core';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import LoginDesktop from './parts/LoginDesktop.vue';
import userApi from '@/api/user';
import { parseLoginUser, resolveSessionToken, buildRoleFromAuthUser } from '@/utils/loginUser';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const isLoading = ref(false);

const isWeb = !Capacitor.isNativePlatform();

const notify = (
  message: string,
  severity: 'success' | 'info' | 'warn' | 'error' = 'error',
  summary = 'Thông báo',
) => {
  if (isWeb) {
    toast.add({
      severity,
      summary,
      detail: message,
      life: 3000,
    });
    return;
  }

  alert(message);
};

const handleLogin = async (credentials: { code: string; password: string }) => {
  try {
    isLoading.value = true;
    const response = await userApi.postUserValidate(credentials);
    const user = parseLoginUser(response.data);

    if (response.data?.success && user) {
      const sessionToken = resolveSessionToken(user, credentials.password);
      if (!sessionToken) {
        notify('Không nhận được token đăng nhập.', 'error', 'Lỗi');
        return;
      }

      authStore.loginSession(user, sessionToken);

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
      || 'Không thể đăng nhập. Vui lòng thử lại.';
    notify(message, 'error', 'Lỗi');
  } finally {
    isLoading.value = false;
  }
};
</script>