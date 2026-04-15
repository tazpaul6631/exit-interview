<template>
  <ion-page>
    <ion-content>
      <!-- <LoginMobile v-if="isIpadMode" @login="handleLogin" /> -->
      <LoginDesktop @login="handleLogin" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, isPlatform } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// import LoginMobile from './parts/LoginMobile.vue';
import LoginDesktop from './parts/LoginDesktop.vue';

const router = useRouter();
// const isIpadMode = ref(isPlatform('ipad') || isPlatform('tablet'));

const handleLogin = () => {
  console.log('Đăng nhập thành công trên Web...');
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  router.push('/dashboard');
};
</script>