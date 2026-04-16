<template>
  <ion-page>
    <ion-content>
      <!-- <LoginMobile v-if="isIpadMode" @login="handleLogin" /> -->
      <LoginDesktop @login="handleLogin" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import LoginDesktop from './parts/LoginDesktop.vue';
import userApi from '@/api/user';

// 1. Import useAuthStore
import { useAuthStore } from '@/store/auth';

const router = useRouter();
// 2. Khởi tạo store
const authStore = useAuthStore();
const isLoading = ref(false);

const handleLogin = async (credentials: any) => {
  if (!credentials.code || !credentials.password) {
    alert('Vui lòng nhập đầy đủ tài khoản và mật khẩu!');
    return;
  }

  try {
    isLoading.value = true;
    const response = await userApi.postUserValidate(credentials);

    if (response.data && response.data.success) {
      authStore.setToken(response.data.data.password);

      router.push('/dashboard');
    } else {
      alert(response.data.message || 'Đăng nhập thất bại.');
    }
  } catch (error: any) {
    console.error('Lỗi gọi API đăng nhập:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>